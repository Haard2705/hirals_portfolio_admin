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

interface BlogItem {
  id: number;
  title: string;
  date_published: string;
  description: string;
  position: number;
}

export default function AdminBlogs() {
  useAdminAuth();

  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBlog, setNewBlog] = useState<Omit<BlogItem, "id" | "position">>({
    title: "",
    date_published: "",
    description: "",
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      toast.error("Failed to load blogs.");
    } else {
      setBlogs(data || []);
    }
    setLoading(false);
  }

  const handleChange = <K extends keyof BlogItem>(
    index: number,
    field: K,
    value: BlogItem[K]
  ) => {
    const updated = [...blogs];
    updated[index] = { ...updated[index], [field]: value };
    setBlogs(updated);
  };

  const handleSave = async (index: number) => {
    const blog = blogs[index];
    const { error } = await supabase.from("blogs").update(blog).eq("id", blog.id);

    if (error) toast.error("Update failed!");
    else toast.success("Updated!");
  };

  const handleDelete = async (index: number) => {
    const idToDelete = blogs[index].id;
    const { error } = await supabase.from("blogs").delete().eq("id", idToDelete);

    if (error) toast.error("Failed to delete blog.");
    else {
      toast.success("Blog deleted.");
      setBlogs((prev) => prev.filter((b) => b.id !== idToDelete));
    }
  };

  const handleAddBlog = async () => {
    const { title, date_published, description } = newBlog;
    if (!title || !date_published || !description) {
      toast.error("All fields are required.");
      return;
    }

    const { data, error } = await supabase
      .from("blogs")
      .insert([{ title, date_published, description }])
      .select();

    if (error) toast.error("Failed to add blog.");
    else {
      toast.success("Blog added!");
      setBlogs([...blogs, ...(data as BlogItem[])]);
      setNewBlog({ title: "", date_published: "", description: "" });
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = blogs.findIndex((b) => b.id === active.id);
      const newIndex = blogs.findIndex((b) => b.id === over.id);
      const reordered = arrayMove(blogs, oldIndex, newIndex);
      setBlogs(reordered);

      const updates = reordered.map((b, i) => ({ id: b.id, position: i + 1 }));
      const { error } = await supabase.from("blogs").upsert(updates);

      if (error) toast.error("Failed to update order.");
      else toast.success("Order saved.");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row min-h-screen gap-x-4">
      <div className="w-full sm:w-64">
        <AdminNav />
      </div>

      <main className="flex-1 p-4 sm:p-8 md:rounded-2xl shadow-2xl border-3 border-gray-700/40 backdrop-blur-md bg-opacity-90">
        <div className="space-y-10">
          <h1 className="text-2xl font-bold">Edit Blogs</h1>

          <div className="p-4 sm:p-6 rounded-xl dark-mode shadow-xl border-3 border-gray-700/40 backdrop-blur-md bg-opacity-90 space-y-4">
            <h2 className="text-xl font-semibold">Add New Blog</h2>
            <input
              className="input"
              placeholder="Title"
              value={newBlog.title}
              onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
            />
            <input
              className="input"
              placeholder="Date Published"
              value={newBlog.date_published}
              onChange={(e) => setNewBlog({ ...newBlog, date_published: e.target.value })}
            />
            <textarea
              className="input"
              placeholder="Description"
              value={newBlog.description}
              onChange={(e) =>
                setNewBlog({ ...newBlog, description: e.target.value })
              }
            />
            <button
              onClick={handleAddBlog}
              className="bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto"
            >
              Add Blog
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : blogs.length === 0 ? (
            <p className="text-center text-gray-500">No blogs found.</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blogs.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {blogs.map((blog, index) => (
                  <SortableBlogCard
                    key={blog.id}
                    id={blog.id}
                    blog={blog}
                    index={index}
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

function SortableBlogCard({
  id,
  blog,
  index,
  onChange,
  onSave,
  onDelete,
}: {
  id: number;
  blog: BlogItem;
  index: number;
  onChange: <K extends keyof BlogItem>(index: number, field: K, value: BlogItem[K]) => void;
  onSave: (index: number) => void;
  onDelete: (index: number) => void;
}) {
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
        <h3 className="text-lg font-semibold text-gray-700">Blog {index + 1}</h3>
      </div>

      <input
        className="input"
        value={blog.title}
        onChange={(e) => onChange(index, "title", e.target.value)}
      />
      <input
        className="input"
        value={blog.date_published}
        onChange={(e) => onChange(index, "date_published", e.target.value)}
      />
      <textarea
        className="input"
        value={blog.description}
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
