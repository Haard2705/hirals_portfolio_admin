"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Award = {
  id: number;
  title: string;
  issuer: string;
  date: string;
  awardUrl?: string;
};

export default function Awards() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    const { data, error } = await supabase
      .from("awards")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      console.error("Error fetching awards:", error);
    } else {
      setAwards(data || []);
    }

    setLoading(false);
  };

  return (
    <section id="awards" className="min-h-screen px-4 py-12 bg-white text-black dark-mode">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-black mb-10">Awards & Membership</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading awards...</p>
        ) : awards.length === 0 ? (
          <p className="text-center text-gray-500">No awards found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {awards.map((award) => (
              <div key={award.id} className="bg-gray-100 rounded-2xl shadow-2xl p-5">
                <h3 className="text-xl font-semibold text-gray-800">{award.title}</h3>
                <p className="text-md mt-2 text-gray-600">{award.issuer}</p>
                <p className="text-md text-gray-500 mt-1">{award.date}</p>
                {award.awardUrl && (
                  <a
                    href={award.awardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-blue-600 text-sm hover:underline"
                  >
                    View Award →
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
