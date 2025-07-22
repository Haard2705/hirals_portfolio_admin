"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type BlogItem = {
  id: number;
  title: string;
  date_published: string;
  description: string;
  position: number;
};

export default function Blogs() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);

  useEffect(() => {
    async function fetchBlogs() {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("position", { ascending: true });

      if (error) {
        console.error("Error fetching blogs:", error);
      } else {
        setBlogs(data as BlogItem[]);
      }
    }

    fetchBlogs();
  }, []);

  return (
    <section
      id="blogs"
      className="min-h-screen px-4 py-12 bg-white text-black overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-black mb-8">
          Blogs & Articles
        </h2>

        <div className="space-y-8">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="border-l-4 border-blue-500 shadow-2xl rounded-2xl p-6 pl-4"
            >
              <h3 className="text-2xl font-semibold text-gray-800 break-words">
                {blog.title}
              </h3>
              <div className="text-md text-gray-600 font-medium">
                Published on:{" "}
                {new Date(blog.date_published).toLocaleDateString()}
              </div>
              <p className="mt-2 text-lg break-words">{blog.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

  );
}
