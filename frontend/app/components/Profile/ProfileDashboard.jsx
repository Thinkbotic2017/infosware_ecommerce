"use client";

import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  FaBoxOpen,
  FaMapMarkerAlt,
  FaHeart,
  FaShoppingCart,
  FaCreditCard,
  FaSignOutAlt,
  FaCog,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import { MdReviews } from "react-icons/md";

const links = [
  {
    name: "My Orders",
    href: "/user/orders",
    icon: <FaBoxOpen />,
  },
  {
    name: "Profile Settings",
    href: "/user/setting",
    icon: <FaCog />,
  },
  {
    name: "Manage Address",
    href: "/user/manageAddress",
    icon: <FaMapMarkerAlt />,
  },
  {
    name: "Payments",
    href: "/user/payment",
    icon: <FaCreditCard />,
  },
  {
    name: "Wishlist",
    href: "/user/wishlist", // opens inside the dashboard
    icon: <FaHeart />,
  },
  {
    name: "Cart",
    href: "/user/cart", // opens inside the dashboard
    icon: <FaShoppingCart />,
  },
  {
    name: "Reviews and Rating",
    href: "/user/reviews",
    icon: <MdReviews />,
  },
];

export default function ProfileDashboard() {
  const pathname = usePathname();

  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // CLOSE SIDEBAR ON ROUTE CHANGE
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // highlight the link for the page and its sub-pages (e.g. /user/orders/123)
  const isLinkActive = (href) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-[#0f172a]">My Account</h2>
          <p className="text-xs text-gray-500">Welcome back</p>
        </div>

        <button
          onClick={() => setSidebarOpen(true)}
          className="w-11 h-11 rounded-xl bg-gradient-blue-red text-white flex items-center justify-center shadow-md"
        >
          <FaBars size={18} />
        </button>
      </div>

      {/* OVERLAY */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0
          z-50 lg:z-10
          h-screen lg:h-fit
          w-[290px] lg:w-[260px]
          bg-[#f8fafc]
          border-r border-gray-100
          overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* HEADER */}
        <div className="sticky top-0 z-20 bg-[#f8fafc] border-b border-gray-100 px-5 py-4 flex items-center justify-between lg:hidden">
          <h2 className="text-lg font-bold text-[#0f172a]">Menu</h2>

          <button
            onClick={() => setSidebarOpen(false)}
            className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center"
          >
            <FaTimes />
          </button>
        </div>

        {/* USER CARD */}
        <div>
          <Link href="/user/setting" onClick={() => setSidebarOpen(false)}>
            <div className="bg-white rounded-md border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                {/* AVATAR */}
                <div className="w-14 h-14 rounded-full bg-gradient-blue-red p-[2px] shrink-0">
                  <div className="w-full h-full rounded-full bg-gradient-blue-red flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* USER */}
                <div>
                  <p className="text-sm text-gray-500">Hello,</p>
                  <h2 className="text-lg font-bold text-[#0f172a] line-clamp-1">
                    {user?.username}
                  </h2>
                </div>
              </div>
            </div>
          </Link>

          {/* NAVIGATION */}
          <div className="mt-5 bg-white rounded-md border border-gray-100 shadow-sm p-3 flex flex-col gap-2">
            {links.map((link) => {
              const isActive = isLinkActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-blue-red text-white shadow-md"
                      : "text-gray-600 hover:bg-primary-blue/10 hover:text-primary-blue"
                  }`}
                >
                  <span
                    className={`text-lg ${
                      isActive ? "text-white" : "text-primary-blue"
                    }`}
                  >
                    {link.icon}
                  </span>

                  <span className="text-sm">{link.name}</span>
                </Link>
              );
            })}

            {/* LOGOUT */}
            <button
              onClick={() => {
                logout();
                setSidebarOpen(false);
              }}
              className="mt-4 flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-gradient-blue-red text-white font-semibold shadow-md hover:opacity-90 transition"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}