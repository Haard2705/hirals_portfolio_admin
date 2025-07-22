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

type VolunteeringItem = {
  id: number;
  role: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
};

export default function AdminVolunteering() {
  useAdminAuth();
  const [volunteering, setVolunteering] = useState<VolunteeringItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [newVol, setNewVol] = useState({
    role: "",
    company: "",
    start_date: "",
    end_date: "",
    description: "",
  });

  useEffect(() => {
    fetchVolunteering();
  }, []);

  async function fetchVolunteering() {
    const { data, error } = await supabase
      .from("volunteering")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      console.error("Supabase fetch error:", error);
      toast.error("Failed to load volunteering.");
    } else {
      setVolunteering(data || []);
    }

    setLoading(false);
  }

  const handleChange = <K extends keyof VolunteeringItem>(
    index: number,
    field: K,
    value: VolunteeringItem[K]
  ) => {
    const updated = [...volunteering];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setVolunteering(updated);
  };

  const handleSave = async (index: number) => {
    const entry = volunteering[index];
    const { error } = await supabase
      .from("volunteering")
      .update(entry)
      .eq("id", entry.id);

    if (error) {
      toast.error("Update failed!");
    } else {
      toast.success("Updated!");
    }
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("volunteering").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete.");
    } else {
      setVolunteering((prev) => prev.filter((item) => item.id !== id));
      toast.success("Deleted successfully!");
    }
  };

  const handleAddVolunteering = async () => {
    const { role, company, start_date, end_date, description } = newVol;

    if (!role || !company || !start_date || !end_date || !description) {
      toast.error("All fields are required.");
      return;
    }

    const position = volunteering.length + 1;
    const { data, error } = await supabase
      .from("volunteering")
      .insert([{ role, company, start_date, end_date, description, position }])
      .select();

    if (error) {
      console.error("Supabase insert error:", error.message, error.details);
      toast.error("Failed to add volunteering.");
    } else {
      toast.success("Volunteering added!");
      setVolunteering([...volunteering, ...(data || [])]);
      setNewVol({
        role: "",
        company: "",
        start_date: "",
        end_date: "",
        description: "",
      });
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = volunteering.findIndex((e) => e.id === active.id);
      const newIndex = volunteering.findIndex((e) => e.id === over.id);
      const reordered = arrayMove(volunteering, oldIndex, newIndex);
      setVolunteering(reordered);

      const updates = reordered.map((v, i) => ({
        id: v.id,
        position: i + 1,
      }));

      const { error } = await supabase.from("volunteering").upsert(updates);

      if (error) {
        toast.error("Failed to update order in Supabase.");
        console.error(error);
      } else {
        toast.success("Order saved to Supabase!");
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row min-h-screen gap-x-4">
      <div className="w-full sm:w-64">
        <AdminNav />
      </div>

      <main className="p-4 sm:p-8 md:rounded-2xl shadow-2xl border-3 border-gray-700/40 backdrop-blur-md backdrop-opacity-90 flex-1">
        <div className="max-w-auto w-full mr-auto space-y-10">
          <h1 className="text-xl font-bold">Edit Volunteering</h1>

          <div className="p-4 sm:p-6 rounded-xl dark-mode shadow-xl border-3 border-gray-700/40 backdrop-blur-md bg-opacity-90 space-y-4">
            <h2 className="text-xl font-semibold">Add New Experience</h2>
            <input className="input" placeholder="Role" value={newVol.role} onChange={(e) => setNewVol({ ...newVol, role: e.target.value })} />
            <input className="input" placeholder="Company" value={newVol.company} onChange={(e) => setNewVol({ ...newVol, company: e.target.value })} />
            <input className="input" placeholder="Start Date" value={newVol.start_date} onChange={(e) => setNewVol({ ...newVol, start_date: e.target.value })} />
            <input className="input" placeholder="End Date" value={newVol.end_date} onChange={(e) => setNewVol({ ...newVol, end_date: e.target.value })} />
            <textarea className="input" placeholder="Description" value={newVol.description} onChange={(e) => setNewVol({ ...newVol, description: e.target.value })} />
            <button onClick={handleAddVolunteering} className="bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto">Add Volunteering</button>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : volunteering.length === 0 ? (
            <p className="text-center text-gray-500">No Volunteering entries found.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={volunteering.map(v => v.id)} strategy={verticalListSortingStrategy}>
                {volunteering.map((vol, i) => (
                  <SortableVolunteeringCard
                    key={vol.id}
                    id={vol.id}
                    vol={vol}
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

function SortableVolunteeringCard({ id, vol, index, onChange, onSave, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="dark-mode p-4 sm:p-6 rounded-xl border-3 border-gray-700/40 backdrop-blur-md bg-opacity-90 space-y-4 shadow-xl"
    >
      {/* 🟡 Drag handle on header only */}
      <div className="cursor-grab" {...listeners}>
        <h3 className="text-lg font-semibold text-gray-700">
          Volunteering {index + 1}
        </h3>
      </div>

      <input
        className="input"
        value={vol.role}
        onChange={(e) => onChange(index, "role", e.target.value)}
        placeholder="Role"
      />
      <input
        className="input"
        value={vol.company}
        onChange={(e) => onChange(index, "company", e.target.value)}
        placeholder="Company"
      />
      <input
        className="input"
        value={vol.start_date}
        onChange={(e) => onChange(index, "start_date", e.target.value)}
        placeholder="Start Date"
      />
      <input
        className="input"
        value={vol.end_date}
        onChange={(e) => onChange(index, "end_date", e.target.value)}
        placeholder="End Date"
      />
      <textarea
        className="input"
        value={vol.description}
        onChange={(e) => onChange(index, "description", e.target.value)}
        placeholder="Description"
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => onSave(index)}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          Save
        </button>
        <button
          onClick={() => onDelete(id)}
          className="bg-red-600 text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

