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

type ExperienceItem = {
  id: number;
  role: string;
  company: string;
  duration: string;
  description: string;
};

export default function AdminExperience() {
  useAdminAuth();
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newExp, setNewExp] = useState({
    role: "",
    company: "",
    duration: "",
    description: "",
  });

  useEffect(() => {
    fetchExperience();
  }, []);

  async function fetchExperience() {
    const { data, error } = await supabase
      .from("experience")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      console.error("Supabase fetch error:", error);
      toast.error("Failed to load experiences.");
    } else {
      setExperiences(data || []);
    }

    setLoading(false);
  }

  const handleChange = <K extends keyof ExperienceItem>(
    index: number,
    field: K,
    value: ExperienceItem[K]
  ) => {
    const updated = [...experiences];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setExperiences(updated);
  };

  const handleSave = async (index: number) => {
    const entry = experiences[index];
    const { error } = await supabase
      .from("experience")
      .update(entry)
      .eq("id", entry.id);

    if (error) {
      toast.error("Update failed!");
    } else {
      toast.success("Updated!");
    }
  };

  const handleDelete = async (index: number) => {
    const idToDelete = experiences[index].id;

    const { error } = await supabase
      .from("experience")
      .delete()
      .eq("id", idToDelete);

    if (error) {
      console.error("Supabase delete error:", error);
      toast.error("Failed to delete experience.");
    } else {
      toast.success("Experience deleted.");
      setExperiences((prev) => prev.filter((exp) => exp.id !== idToDelete));
    }
  };


  const handleAddExperience = async () => {
    const { role, company, duration, description } = newExp;

    if (!role || !company || !duration || !description) {
      toast.error("All fields are required.");
      return;
    }

    const { data, error } = await supabase
      .from("experience")
      .insert([{ role, company, duration, description }])
      .select();

    if (error) {
      toast.error("Failed to add experience.");
    } else {
      toast.success("Experience added!");
      setExperiences([...experiences, ...(data || [])]);
      setNewExp({ role: "", company: "", duration: "", description: "" });
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = experiences.findIndex((e) => e.id === active.id);
      const newIndex = experiences.findIndex((e) => e.id === over.id);
      const reordered = arrayMove(experiences, oldIndex, newIndex);
      setExperiences(reordered);

      const updates = reordered.map((exp, i) => ({
        id: exp.id,
        position: i + 1,
      }));

      const { error } = await supabase.from("experience").upsert(updates);
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
          <h1 className="text-2xl font-bold">Edit Experience</h1>

          <div className="p-4 sm:p-6 rounded-xl dark-mode shadow-xl border-3 border-gray-700/40 backdrop-blur-md bg-opacity-90 space-y-4">
            <h2 className="text-xl font-semibold">Add New Experience</h2>
            <input
              className="input"
              placeholder="Role"
              value={newExp.role}
              onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
            />
            <input
              className="input"
              placeholder="Company"
              value={newExp.company}
              onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
            />
            <input
              className="input"
              placeholder="Duration"
              value={newExp.duration}
              onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })}
            />
            <textarea
              className="input"
              placeholder="Description"
              value={newExp.description}
              onChange={(e) =>
                setNewExp({ ...newExp, description: e.target.value })
              }
            />
            <button
              onClick={handleAddExperience}
              className="bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto"
            >
              Add Experience
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : experiences.length === 0 ? (
            <p className="text-center text-gray-500">No experience entries found.</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={experiences.map((exp) => exp.id)}
                strategy={verticalListSortingStrategy}
              >
                {experiences.map((exp, i) => (
                  <SortableExperienceCard
                    key={exp.id}
                    id={exp.id}
                    exp={exp}
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

function SortableExperienceCard({ id, exp, index, onChange, onSave, onDelete }: any) {
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
      {/* Drag handle only */}
      <div className="cursor-grab" {...listeners}>
        <h3 className="text-lg font-semibold text-gray-700">Experience {index + 1}</h3>
      </div>

      <input
        className="input"
        value={exp.role}
        onChange={(e) => onChange(index, "role", e.target.value)}
      />
      <input
        className="input"
        value={exp.company}
        onChange={(e) => onChange(index, "company", e.target.value)}
      />
      <input
        className="input"
        value={exp.duration}
        onChange={(e) => onChange(index, "duration", e.target.value)}
      />
      <textarea
        className="input"
        value={exp.description}
        onChange={(e) => onChange(index, "description", e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSave(index)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>
        <button
          onClick={() => onDelete(index)}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

