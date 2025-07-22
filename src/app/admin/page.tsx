"use client";
import useAdminAuth from "../hooks/useAdminAuth";
import AdminHero from "./adminHero/page";
import AdminNav from "./AdminNav";

export default function DashboardHome() {
  useAdminAuth();
  return (
    <div className="flex flex-col sm:flex-row min-h-screen gap-x-4">
      {/* Sidebar */}
      <div className="w-full sm:w-64 ">
        <AdminNav />
      </div>

      {/* Main content */}
      <main className="flex-1 text-black md:rounded-lg ">
        <div className="max-w-auto w-full mr-auto h-full bg-white text-black rounded-2xl p-6 shadow-2xl border-3 border-gray-700/40 backdrop-blur-md	bg-opacity-90">
          <h1 className="text-3xl font-bold mb-4">Dashboard Overview</h1>
          <p className="">
            Welcome! Select a section on the left to manage the portfolio content.
          </p>
          <AdminHero />
        </div>
      </main>
    </div>
  );
}
