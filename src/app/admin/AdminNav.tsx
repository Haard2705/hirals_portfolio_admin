"use client";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import useTheme from "../hooks/useTheme";
import { useRouter } from "next/navigation";

export default function AdminNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    setIsAdmin(false);
    router.push("/");
  };

  return (
    <>
      {/* Mobile toggle button */}
      <div className="sm:hidden flex justify-between items-center px-4 py-3 bg-gray-800 text-white">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
        </button>
      </div>

      {/* Sidebar container */}
      <aside
        className={`bg-white border-3 border-gray-700/40 backdrop-blur-md	bg-opacity-90	text-black p-5 space-y-4 rounded-2xl shadow-2xl md:rounded-2xl md:shadow-2xl sm:rounded-none 
        sm:static sm:block sm:min-h-screen w-64 fixed top-4 left-3 h-full z-40 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}
      >
        <h2 className="text-2xl font-bold mb-6 hidden sm:block">Admin Panel</h2>
        <nav className="space-y-3">
          <a href="/admin" className="block hover:underline">Overview</a>
          <a href="/admin/experience" className="block hover:underline">Experience</a>
          <a href="/admin/projects" className="block hover:underline">Projects</a>
          <a href="/admin/certifications" className="block hover:underline">Certifications</a>
          <a href="/admin/awards" className="block hover:underline">Awards</a>
          <a href="/admin/volunteering" className="block hover:underline">Volunteering</a>
          <a href="/admin/blogs" className="block hover:underline">Blogs & Articles</a>
          <button
              onClick={toggleTheme}
              className="px-4 py-2 border-2 border-gray-900  rounded-4xl hover:bg-gray-900 hover:text-black"
            >
              {theme === "light" ? "🌙 " : "☀️ "}
            </button>
        </nav>

        <div className="pt-10">
          <a
            href="/"
            className="px-4 py-2 profile-btn rounded-xl shadow-2xl border-3 border-gray-700/40 backdrop-blur-md bg-opacity-90 font-semibold block text-center"
          >
            Profile Page
          </a>
          <button onClick={handleLogout} className="px-12 py-2 profile-btn rounded-xl shadow-2xl border-3 border-gray-700/40 backdrop-blur-md bg-opacity-90 font-semibold block text-center mt-4">
            Admin Logout
          </button>
        </div>
      </aside>
    </>
  );
}
