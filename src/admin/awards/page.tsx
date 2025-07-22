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

type Award = {
  id: number;
  title: string;
  issuer: string;
  date: string;
  awardUrl?: string;
  position?: number;
};

export default function AdminAwards() {
  useAdminAuth();
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAward, setNewAward] = useState({
    title: "",
    issuer: "",
    date: "",
    awardUrl: "",
  });

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    const { data, error } = await supabase
      .from("awards")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      console.error("Supabase fetch error:", error);
      toast.error("Failed to load awards.");
    } else {
      setAwards(data || []);
    }

    setLoading(false);
  };

  const handleChange = <K extends keyof Award>(
    index: number,
    field: K,
    value: Award[K]
  ) => {
    const updated = [...awards];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setAwards(updated);
  };

  const handleSave = async (index: number) => {
    const entry = awards[index];
    const { error } = await supabase
      .from("awards")
      .update(entry)
      .eq("id", entry.id);

    if (error) {
      toast.error("Update failed!");
    } else {
      toast.success("Updated!");
    }
  };

  const handleDelete = async (index: number) => {
    const idToDelete = awards[index].id;

    const { error } = await supabase
      .from("awards")
      .delete()
      .eq("id", idToDelete);

    if (error) {
      toast.error("Failed to delete award.");
    } else {
      toast.success("Award deleted.");
      setAwards((prev) => prev.filter((a) => a.id !== idToDelete));
    }
  };

  const handleAdd = async () => {
    const { title, issuer, date, awardUrl } = newAward;

    if (!title || !issuer || !date) {
      toast.error("All fields except URL are required.");
      return;
    }

    const { data, error } = await supabase
      .from("awards")
      .insert([{ title, issuer, date, awardUrl }])
      .select();

    if (error) {
      console.error("Supabase insert error:", error.message, error.details);
      toast.error("Failed to add award.");
    } else {
      toast.success("Award added!");
      setAwards([...awards, ...(data || [])]);
      setNewAward({ title: "", issuer: "", date: "", awardUrl: "" });
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = awards.findIndex((a) => a.id === active.id);
      const newIndex = awards.findIndex((a) => a.id === over.id);
      const reordered = arrayMove(awards, oldIndex, newIndex);

      setAwards(reordered);

      const updates = reordered.map((award, i) => ({
        id: award.id,
        position: i + 1,
      }));

      const { error } = await supabase.from("awards").upsert(updates);

      if (error) {
        toast.error("Failed to update order in Supabase.");
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
      <main className="flex-1 p-4 sm:p-8 md:rounded-2xl border-3 border-gray-700/40 backdrop-blur-md bg-opacity-90">
        <div className="max-w-auto w-full mr-auto space-y-10">
          <h1 className="text-2xl font-bold">Edit Awards</h1>

          {/* Add New Award */}
          <div className="dark-mode border-3 border-gray-700/40 backdrop-blur-md bg-opacity-90 p-4 sm:p-6 rounded-xl shadow-xl space-y-4">
            <h2 className="text-xl font-semibold">Add New Award</h2>
            <input
              className="input"
              placeholder="Title"
              value={newAward.title}
              onChange={(e) => setNewAward({ ...newAward, title: e.target.value })}
            />
            <input
              className="input"
              placeholder="Issuer"
              value={newAward.issuer}
              onChange={(e) => setNewAward({ ...newAward, issuer: e.target.value })}
            />
            <input
              className="input"
              placeholder="Date (e.g., Jan 2024)"
              value={newAward.date}
              onChange={(e) => setNewAward({ ...newAward, date: e.target.value })}
            />
            <input
              className="input"
              placeholder="Award URL (optional)"
              value={newAward.awardUrl}
              onChange={(e) => setNewAward({ ...newAward, awardUrl: e.target.value })}
            />
            <button
              onClick={handleAdd}
              className="bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto"
            >
              Add Award
            </button>
          </div>

          {/* Edit Awards */}
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : awards.length === 0 ? (
            <p className="text-center text-gray-500">No awards found.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={awards.map((a) => a.id)}
                strategy={verticalListSortingStrategy}
              >
                {awards.map((award, i) => (
                  <SortableAwardCard
                    key={award.id}
                    id={award.id}
                    award={award}
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

function SortableAwardCard({ id, award, index, onChange, onSave, onDelete }: any) {
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
      className="dark-mode border-3 border-gray-700/40 backdrop-blur-md bg-opacity-90 p-4 sm:p-6 rounded-xl shadow-xl space-y-4"
    >
      <div {...listeners} className="cursor-grab">
        <h3 className="text-lg font-semibold text-gray-700">Award {index + 1}</h3>
      </div>
      <input className="input" value={award.title} onChange={(e) => onChange(index, "title", e.target.value)} placeholder="Title" />
      <input className="input" value={award.issuer} onChange={(e) => onChange(index, "issuer", e.target.value)} placeholder="Issuer" />
      <input className="input" value={award.date} onChange={(e) => onChange(index, "date", e.target.value)} placeholder="Date" />
      <input className="input" value={award.awardUrl} onChange={(e) => onChange(index, "awardUrl", e.target.value)} placeholder="Award URL" />
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onSave(index)} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
        <button onClick={() => onDelete(index)} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
      </div>
    </div>
  );
}
