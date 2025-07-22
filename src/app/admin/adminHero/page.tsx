"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import toast from "react-hot-toast";
import AdminNav from "../AdminNav";
import useAdminAuth from "@/app/hooks/useAdminAuth";

export default function AdminHero() {
  useAdminAuth();

  const [hero, setHero] = useState<any>({
    name: "",
    role: [],
    description: "",
    linkedin_url: "",
    email: "",
    resume: "",
    profile_image: "",
  });

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHero();
  }, []);

  const fetchHero = async () => {
    const { data, error } = await supabase.from("hero").select("*").single();

    if (error) {
      toast.error("Failed to fetch hero data");
      console.error("Error fetching hero data:", error);
    } else {
      setHero({
        ...data,
        role: typeof data.role === "string" ? JSON.parse(data.role) : data.role,
      });
    }
    setLoading(false);
  };

  const uploadFile = async (file: File, path: string) => {
    const { error } = await supabase.storage
      .from("public-assets")
      .upload(path, file, { upsert: true });

    if (error) {
      toast.error(`Upload failed: ${error.message}`);
      throw error;
    }

    const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    try {
      let profileImageUrl = hero.profile_image;
      let resumeUrl = hero.resume;

      if (profileFile) {
        profileImageUrl = await uploadFile(profileFile, `profile/${profileFile.name}`);
      }
      if (resumeFile) {
        resumeUrl = await uploadFile(resumeFile, `resume/${resumeFile.name}`);
      }

      const updatedHero = {
        ...hero,
        role: Array.isArray(hero.role) ? hero.role : hero.role.split(","),
        profile_image: profileImageUrl,
        resume: resumeUrl,
      };

      const { error } = await supabase.from("hero").upsert(updatedHero);

      if (error) {
        console.error("Update error:", error);
        toast.error("Failed to update hero data");
      } else {
        toast.success("Hero section updated successfully");
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col sm:flex-row min-h-screen gap-x-4">

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Hero Section</h1>
        <div className="space-y-4 max-w-auto dark-mode p-4 sm:p-6 rounded-xl dark-mode shadow-xl border-3 border-gray-700/40 backdrop-blur-md bg-opacity-90">
          <input
            className="input"
            placeholder="Name"
            value={hero.name}
            onChange={(e) => setHero({ ...hero, name: e.target.value })}
          />
          <textarea
            className="input"
            placeholder="Enter roles (one per line)"
            value={hero.role ? (Array.isArray(hero.role) ? hero.role.join('\n') : hero.role) : ""}
            onChange={(e) =>
              setHero({
                ...hero,
                role: e.target.value.split('\n').filter(line => line.trim() !== ''),
              })
            }
          />
          <textarea
            className="input"
            placeholder="Description"
            value={hero.description}
            onChange={(e) => setHero({ ...hero, description: e.target.value })}
          />
          <input
            className="input"
            placeholder="LinkedIn URL"
            value={hero.linkedin_url}
            onChange={(e) => setHero({ ...hero, linkedin_url: e.target.value })}
          />
          <input
            className="input"
            placeholder="Email"
            value={hero.email}
            onChange={(e) => setHero({ ...hero, email: e.target.value })}
          />

          <div  className="flex flex-row">
            <label className="block mb-1 py-2">Upload Profile Image:</label>
            <input className="ml-3 bg-green-200 rounded-xl px-7 py-2 border-2" type="file" accept="image/*" onChange={(e) => setProfileFile(e.target.files?.[0] || null)} />
          </div>

          <div className="flex flex-row">
            <label className="block mb-1 py-2">Upload Resume PDF:</label>
            <input className="ml-2 bg-green-200 rounded-xl px-7 py-2 border-2" type="file" accept=".pdf" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
          </div>

          <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded">
            Save Changes
          </button>
        </div>
      </main>
    </div>
  );
}
