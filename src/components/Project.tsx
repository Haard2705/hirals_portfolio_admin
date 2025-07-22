"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Project = {
  id: number;
  title: string;
  description: string;
  tech: string[];
  github?: string;
  demo?: string;
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      console.error("Failed to fetch projects:", error);
    } else {
      setProjects(data || []);
    }

    setLoading(false);
  };

  return (
    <section id="projects" className="min-h-screen px-4 py-12 bg-white text-black overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-10">Projects</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-center text-gray-500">No projects found.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div key={project.id} className="bg-gray-100 rounded-2xl shadow-2xl p-5 break-words">
                <h3 className="text-2xl font-semibold underline text-gray-800 break-words">{project.title}</h3>
                <p className="text-md text-gray-600 mt-2 break-words">{project.description}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {project.tech
                    .filter((tech) => tech.trim() !== "")
                    .map((tech, i) => (
                      <span
                        key={i}
                        className="bg-teal-100 text-teal-800 text-sm px-2 py-1 rounded-full break-words"
                      >
                        {tech}
                      </span>
                    ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm break-all">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      GitHub
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 dark:text-white hover:underline"
                    >
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
