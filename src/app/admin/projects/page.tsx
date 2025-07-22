"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../../../lib/supabaseClient";
import AdminNav from "../AdminNav";
import useAdminAuth from "@/app/hooks/useAdminAuth";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ProjectItem = {
  id: number;
  title: string;
  description: string;
  tech: string[] | string;
  github?: string;
  demo?: string;
};

export default function AdminProjects() {
  useAdminAuth();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProj, setNewProj] = useState({
    title: "",
    description: "",
    tech: "",
    github: "",
    demo: "",
  });

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      console.error("Supabase fetch error:", error);
      toast.error("Failed to load projects.");
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  }

  const handleChange = <K extends keyof ProjectItem>(
    index: number,
    field: K,
    value: ProjectItem[K]
  ) => {
    const updated = [...projects];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setProjects(updated);
  };

  const handleSave = async (index: number) => {
    const entry = projects[index];
    const { error } = await supabase
      .from("projects")
      .update(entry)
      .eq("id", entry.id);

    if (error) {
      toast.error("Update failed!");
    } else {
      toast.success("Updated!");
    }
  };

  const handleDelete = async (index: number) => {
    const idToDelete = projects[index].id;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", idToDelete);

    if (error) {
      console.error("Supabase delete error:", error);
      toast.error("Failed to delete project.");
    } else {
      toast.success("Project deleted.");
      setProjects((prev) => prev.filter((proj) => proj.id !== idToDelete));
    }
  };

  const handleAddProject = async () => {
    const { title, description, tech, github, demo } = newProj;

    if (!title || !description || !tech) {
      toast.error("Title, description, and tech are required.");
      return;
    }

    const techArray = tech.split(",").map((t) => t.trim());
    const position = projects.length + 1;

    const { data, error } = await supabase
      .from("projects")
      .insert([{ title, description, tech: techArray, github, demo, position }])
      .select();

    if (error) {
      console.error("Supabase insert error:", error.message, error.details);
      toast.error("Failed to add project.");
    } else {
      toast.success("Project added!");
      setProjects([...projects, ...(data || [])]);
      setNewProj({ title: "", description: "", tech: "", github: "", demo: "" });
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);
      const reordered = arrayMove(projects, oldIndex, newIndex);
      setProjects(reordered);

      const updates = reordered.map((p, i) => ({
        id: p.id,
        position: i + 1,
      }));

      const { error } = await supabase.from("projects").upsert(updates);
      if (error) {
        toast.error("Failed to update order.");
      } else {
        toast.success("Order saved.");
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row min-h-screen gap-x-4">
      <div className="w-full sm:w-64">
        <AdminNav />
      </div>

      <main className="flex-1 p-4 sm:p-8 md:rounded-2xl shadow-2xl border-3 border-gray-700/40 backdrop-blur-md bg-opacity-90">
        <div className="max-w-auto w-full mr-auto space-y-10">
          <h1 className="text-2xl font-bold">Edit Projects</h1>

          <div className="p-4 rounded-xl dark-mode shadow-xl border-3 border-gray-700/40 backdrop-blur-md bg-opacity-90 space-y-3">
            <h2 className="text-xl font-semibold">Add New Project</h2>
            <input className="input" placeholder="Title" value={newProj.title} onChange={(e) => setNewProj({ ...newProj, title: e.target.value })} />
            <textarea className="input" placeholder="Description" value={newProj.description} onChange={(e) => setNewProj({ ...newProj, description: e.target.value })} />
            <input className="input" placeholder="Tech (comma separated)" value={newProj.tech} onChange={(e) => setNewProj({ ...newProj, tech: e.target.value })} />
            <input className="input" placeholder="GitHub URL" value={newProj.github} onChange={(e) => setNewProj({ ...newProj, github: e.target.value })} />
            <input className="input" placeholder="Live Demo URL" value={newProj.demo} onChange={(e) => setNewProj({ ...newProj, demo: e.target.value })} />
            <button onClick={handleAddProject} className="bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto">Add Project</button>
          </div>

          {loading ? (
            <p className="text-center">Loading...</p>
          ) : projects.length === 0 ? (
            <p className="text-center text-gray-500">No projects yet.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                {projects.map((proj, i) => (
                  <SortableProjectCard
                    key={proj.id}
                    id={proj.id}
                    proj={proj}
                    index={i}
                    onChange={handleChange}
                    onSave={handleSave}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </main>
    </div>
  );
}

function SortableProjectCard({ id, proj, index, onChange, onSave, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="dark-mode p-4 sm:p-6 rounded-xl shadow-xl border-3 border-gray-700/40 backdrop-blur-md bg-opacity-90 space-y-4"
    >
      <div className="cursor-grab" {...listeners}>
        <h3 className="text-lg font-semibold text-gray-700">Project {index + 1}</h3>
      </div>
      <input className="input" value={proj.title} onChange={(e) => onChange(index, "title", e.target.value)} placeholder="Title" />
      <textarea className="input" value={proj.description} onChange={(e) => onChange(index, "description", e.target.value)} placeholder="Description" />
      <input className="input" value={Array.isArray(proj.tech) ? proj.tech.join(", ") : proj.tech} onChange={(e) => onChange(index, "tech", e.target.value.split(",").map((t) => t.trim()))} placeholder="Tech (comma separated)" />
      <input className="input" value={proj.github || ""} onChange={(e) => onChange(index, "github", e.target.value)} placeholder="GitHub URL" />
      <input className="input" value={proj.demo || ""} onChange={(e) => onChange(index, "demo", e.target.value)} placeholder="Live Demo URL" />
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onSave(index)} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
        <button onClick={() => onDelete(index)} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
      </div>
    </div>
  );
}
