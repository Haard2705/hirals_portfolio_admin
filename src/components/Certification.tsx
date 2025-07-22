"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Certification = {
  id: number;
  title: string;
  issuer: string;
  date: string;
  certificateUrl?: string;
};

export default function Certifications() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    const { data, error } = await supabase
      .from("certifications")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      console.error("Error fetching certifications:", error);
    } else {
      setCertifications(data || []);
    }

    setLoading(false);
  };

  return (
    <section id="certifications" className="min-h-screen px-4 py-12 bg-white text-black dark-mode">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-black mb-10">Certifications</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading certifications...</p>
        ) : certifications.length === 0 ? (
          <p className="text-center text-gray-500">No certifications found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((cert) => (
              <div key={cert.id} className="bg-gray-100 rounded-2xl shadow-2xl p-5">
                <h3 className="text-xl font-semibold text-gray-800">{cert.title}</h3>
                <p className="text-md font-bold text-gray-600 mt-2">{cert.issuer}</p>
                <p className="text-sm  mt-1">{cert.date}</p>
                {cert.certificateUrl && (
                  <a
                    href={cert.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-blue-400 text-sm hover:underline"
                  >
                    View Certificate →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
