"use client";
import { FaLinkedin, FaEnvelope, FaFilePdf } from "react-icons/fa";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Image from "next/image";

type HeroData = {
  name: string;
  role: string[] | string; // handle both formats
  description: string;
  linkedin_url?: string;
  email?: string;
  resume?: string;
  profile_image?: string;
};

export default function Hero() {
  const [hero, setHero] = useState<HeroData | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchHero = async () => {
      const { data, error } = await supabase.from("hero").select("*").single();

      if (error || !data) {
        console.error("Error fetching hero:", error?.message);
        return;
      }

      setHero(data);

      if (data.profile_image) {
        const imageResult = supabase.storage.from("public-assets").getPublicUrl(data.profile_image);
        setProfileImageUrl(imageResult.data.publicUrl);
      }

      if (data.resume) {
        const resumeResult = supabase.storage.from("public-assets").getPublicUrl(data.resume);
        setResumeUrl(resumeResult.data.publicUrl);
      }
    };
    fetchHero();
  }, []);

  if (!hero) return <p className="text-center mt-10">Loading...</p>;

  // Ensure role is an array
  const parsedRoles = Array.isArray(hero.role)
    ? hero.role
    : hero.role
      ? JSON.parse(hero.role)
      : [];

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-12 bg-white text-black dark-mode">
      <div className="flex flex-col-reverse sm:flex-row items-center sm:items-center gap-6 sm:gap-10 w-full max-w-6xl">
        {/* Text Content */}
        <div className="text-center sm:text-left sm:pl-6 flex-1">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-black">
            {hero.name || "Hiral Bhatt"}
          </h1>
          <p className="text-xl sm:text-2xl font-semibold text-gray-800 mt-2">
            {parsedRoles.join(", ") || "Project Manager"}
          </p>
          <p className="text-base sm:text-lg mt-4 text-gray-600 max-w-xl">
            {hero.description ||
              "I am always on the lookout for my next challenge and eager to connect with professionals. If you have any opportunities you think I would be a good fit for, don't hesitate to reach out."}
          </p>

          {/* Social Icons */}
          <div className="mt-6 flex justify-center sm:justify-start gap-6 text-gray-600 text-3xl">
            <a
              href={hero.linkedin_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-600 transition"
            >
              <FaLinkedin />
            </a>
            <a
              href={`mailto:${hero.email || "default@email.com"}`}
              className="hover:text-teal-600 transition"
            >
              <FaEnvelope />
            </a>
            <a
              href={hero.resume || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-600 transition"
            >
              <FaFilePdf />
            </a>
          </div>
        </div>

        {/* Profile Image */}
        <Image
          src={hero.profile_image || "/profile.jpeg"}
          alt={hero.name || "Profile"}
          width={200} // adjust size as needed
          height={200}
          className="rounded-full object-cover border-4 shadow-2xl w-48 h-48 sm:w-[420px] sm:h-[440px] dark-mode "
          priority // optional: speeds up LCP
        />
      </div>
    </section>
  );
}
