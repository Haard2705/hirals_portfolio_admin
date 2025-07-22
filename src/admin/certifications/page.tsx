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

type Certification = {
  id: number;
  title: string;
  issuer: string;
  date: string;
  certificateUrl?: string;
};

export default function AdminCertifications() {
  useAdminAuth();
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCert, setNewCert] = useState({
    title: "",
    issuer: "",
    date: "",
    certificateUrl: "",
  });

  useEffect(() => {
    fetchCerts();
  }, []);

  async function fetchCerts() {
    const { data, error } = await supabase
      .from("certifications")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      toast.error("Failed to load certifications.");
      console.error(error);
    } else {
      setCerts(data || []);
    }
    setLoading(false);
  }

  const handleChange = <K extends keyof Certification>(
    index: number,
    field: K,
    value: Certification[K]
  ) => {
    const updated = [...certs];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setCerts(updated);
  };

  const handleSave = async (index: number) => {
    const entry = certs[index];
    const { error } = await supabase
      .from("certifications")
      .update(entry)
      .eq("id", entry.id);

    if (error) {
      toast.error("Update failed!");
    } else {
      toast.success("Updated!");
    }
  };

  const handleDelete = async (index: number) => {
    const idToDelete = certs[index].id;

    const { error } = await supabase
      .from("certifications")
      .delete()
      .eq("id", idToDelete);

    if (error) {
      toast.error("Failed to delete.");
    } else {
      toast.success("Deleted!");
      setCerts((prev) => prev.filter((c) => c.id !== idToDelete));
    }
  };

  const handleAdd = async () => {
    const { title, issuer, date, certificateUrl } = newCert;

    if (!title || !issuer || !date) {
      toast.error("Title, Issuer and Date are required.");
      return;
    }

    const position = certs.length + 1;
    const { data, error } = await supabase
      .from("certifications")
      .insert([{ title, issuer, date, certificateUrl, position }])
      .select();

    if (error) {
      toast.error("Failed to add certification.");
    } else {
      toast.success("Certification added!");
      setCerts([...certs, ...(data || [])]);
      setNewCert({ title: "", issuer: "", date: "", certificateUrl: "" });
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = certs.findIndex((e) => e.id === active.id);
      const newIndex = certs.findIndex((e) => e.id === over.id);
      const reordered = arrayMove(certs, oldIndex, newIndex);

      setCerts(reordered);

      const updates = reordered.map((cert, i) => ({
        id: cert.id,
        position: i + 1,
      }));

      const { error } = await supabase.from("certifications").upsert(updates);

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

      <main className="flex-1 p-4 sm:p-8 md:rounded-2xl shadow-2xl border-3 border-gray-700/40 backdrop-blur-md bg-opacity-90">
        <div className="max-w-auto w-full mr-auto space-y-10">
          <h1 className="text-2xl font-bold">Edit Certifications</h1>

          {/* Add New Certification */}
          <div className="dark-mode border-3 border-gray-700/40 backdrop-blur-md bg-opacity-90 shadow-xl p-4 sm:p-6 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold">Add New Certification</h2>
            <input className="input" placeholder="Title" value={newCert.title} onChange={(e) => setNewCert({ ...newCert, title: e.target.value })} />
            <input className="input" placeholder="Issuer" value={newCert.issuer} onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })} />
            <input className="input" placeholder="Date (e.g., Mar 2024)" value={newCert.date} onChange={(e) => setNewCert({ ...newCert, date: e.target.value })} />
            <input className="input" placeholder="Certificate URL (optional)" value={newCert.certificateUrl} onChange={(e) => setNewCert({ ...newCert, certificateUrl: e.target.value })} />
            <button onClick={handleAdd} className="bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto">Add Certification</button>
          </div>

          {/* Existing Certifications */}
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : certs.length === 0 ? (
            <p className="text-center text-gray-500">No certifications found.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={certs.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                {certs.map((cert, i) => (
                  <SortableCertCard
                    key={cert.id}
                    id={cert.id}
                    cert={cert}
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

function SortableCertCard({ id, cert, index, onChange, onSave, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab dark-mode border-3 border-gray-700/40 backdrop-blur-md bg-opacity-90 p-4 sm:p-6 rounded-xl shadow-xl space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">Certification {index + 1}</h3>
      <input className="input" value={cert.title} onChange={(e) => onChange(index, "title", e.target.value)} placeholder="Title" />
      <input className="input" value={cert.issuer} onChange={(e) => onChange(index, "issuer", e.target.value)} placeholder="Issuer" />
      <input className="input" value={cert.date} onChange={(e) => onChange(index, "date", e.target.value)} placeholder="Date" />
      <input className="input" value={cert.certificateUrl} onChange={(e) => onChange(index, "certificateUrl", e.target.value)} placeholder="Certificate URL" />
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onSave(index)} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
        <button onClick={() => onDelete(index)} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
      </div>
    </div>
  );
}
