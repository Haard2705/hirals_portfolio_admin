"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import useTheme from "../hooks/useTheme";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(loggedIn);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 bg-white text-black dark-mode shadow-2xl ${
        isScrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a href="/" className="text-3xl font-bold font-serif underline">
            HB
          </a>

          {/* Mobile Toggle */}
          <div className="sm:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Links */}
          <div className="hidden sm:flex space-x-6 items-center">
            {[
              { label: "Home", href: "#" },
              { label: "Experience", href: "#experience" },
              { label: "Projects", href: "#projects" },
              { label: "Certifications", href: "#certifications" },
              { label: "Awards", href: "#awards" },
              { label: "Volunteering", href: "#volunteering" },
              { label: "Blogs & Articles", href: "#blogs" },
              { label: "Contact", href: "#contact" },
            ].map((link) => (
              <a key={link.href} href={link.href} className="font-bold">
                {link.label}
              </a>
            ))}
            {isAdmin ? (
              <Link href="/admin" className="font-bold underline">
                Admin Page
              </Link>
            ) : (
              <Link href="/admin/login" className="font-bold underline">
                Admin Login
              </Link>
            )}
            <button
              onClick={toggleTheme}
              className="px-4 py-2 border-2 border-gray-900 rounded-4xl hover:bg-gray-900 hover:text-white"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden w-full overflow-x-hidden bg-white text-black px-4 pt-4 pb-6 space-y-2">
          {[
            { label: "Home", href: "#" },
            { label: "Experience", href: "#experience" },
            { label: "Projects", href: "#projects" },
            { label: "Certifications", href: "#certifications" },
            { label: "Awards", href: "#awards" },
            { label: "Volunteering", href: "#volunteering" },
            { label: "Blogs & Articles", href: "#blogs" },
            { label: "Contact", href: "#contact" },
          ].map((link) => (
            <a key={link.href} href={link.href} className="block font-semibold">
              {link.label}
            </a>
          ))}
          {isAdmin ? (
            <Link href="/admin" className="block font-bold underline">
              Admin Page
            </Link>
          ) : (
            <Link href="/admin/login" className="block font-bold underline">
              Admin Login
            </Link>
          )}
          <button
            onClick={toggleTheme}
            className="mt-4 px-4 py-2 border-2 border-gray-900 rounded-4xl hover:bg-gray-900 hover:text-white"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      )}
    </nav>
  );
}
