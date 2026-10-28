"use client";

import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";

export default function AdminLayout({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/signin");
      return;
    }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex relative">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:sticky lg:self-start top-0 left-0 z-50 lg:z-10 h-screen lg:h-fit overflow-y-auto w-[280px] lg:w-[260px] bg-[#f8fafc] transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <AdminSidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm px-5 py-4 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-blue-red flex items-center justify-center font-bold text-white shadow-sm">
              A
            </div>
            <h1 className="font-bold text-lg text-[#0f172a]">Admin Panel</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -mr-2 text-gray-600 hover:text-primary-blue hover:bg-blue-50 rounded-lg transition"
            aria-label="Open menu"
          >
            <FaBars size={22} />
          </button>
        </div>

        <main className="p-4 sm:p-6 lg:py-8 lg:px-10 flex-1">{children}</main>
      </div>
    </div>
  );
}