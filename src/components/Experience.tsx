"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type ExperienceItem = {
  id: number;
  role: string;
  company: string;
  duration: string;
  description: string;
};

export default function Experience() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);

  useEffect(() => {
    async function fetchExperience() {
      const { data, error } = await supabase
        .from("experience")
        .select("*")
        .order("position", { ascending: true });

      if (error) {
        console.error("Error fetching experience:", error);
      } else {
        setExperiences(data as ExperienceItem[]);
      }
    }

    fetchExperience();
  }, []);

  return (
    <section id="experience" className="min-h-screen px-4 py-12 bg-white text-black dark-mode">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-black mb-8">Experience</h2>

        <div className="space-y-8  ">
          {experiences.map((exp) => (
            <div key={exp.id} className="border-l-4 shadow-2xl rounded-3xl p-7 transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg border-teal-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800">{exp.role}</h3>
              <div className="text-md font-medium">
                {exp.company} — {exp.duration}
              </div>
              <p className="mt-2  text-md">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
