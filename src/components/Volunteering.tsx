"use client";

import { useEffect,useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type VolunteeringItem = {
    id: number;
    role: string;
    company: string;
    start_date: string;
    end_date: string;
    description: string;
};

export default function Volunteering() {
    const [volunteering, setVolunteering] = useState<VolunteeringItem[]>([]);

    useEffect(() => {
        async function fetchVolunteering() {
            const { data, error } = await supabase
                .from("volunteering")
                .select("*")
                .order("position", { ascending: true });
            if(error) {
                console.error("Error fetching volunteers:", error);
            } else {
                setVolunteering(data as VolunteeringItem[]);
            }
        }

        fetchVolunteering();
    },[])

    return(
        <section id="volunteering" className="min-h-screen px-4 py-12 bg-white text-black dark-mode">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-black mb-8">Volunteering</h2>

                <div className="space-y-8">
                    {volunteering.map((vol) => (
                        <div key={vol.id} className="border-l-4 shadow-2xl rounded-2xl p-6 border-teal-500 pl-4">
                            <h3 className="text-2xl font-semibold text-gray-800">{vol.role}</h3>
                            <div className="text-lg">
                                {vol.company} . {vol.start_date} - {vol.end_date}
                            </div>
                            <p className="mt-2 text-md">{vol.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}