"use client";

import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  FaUser,
  FaMapMarkerAlt,
  FaHeart,
  FaShoppingCart,
  FaCreditCard,
  FaRupeeSign,
  FaSignOutAlt,
  FaCog,
} from "react-icons/fa";
import { MdDashboardCustomize } from "react-icons/md";

const links = [
  { name: "Dashboard", href: "/admin", icon: <MdDashboardCustomize /> },
  { name: "User", href: "/admin/user", icon: <FaUser /> },
  { name: "Cart", href: "/admin/cart", icon: <FaShoppingCart /> },
  { name: "Logo", href: "/admin/logo", icon: <FaMapMarkerAlt /> },
  { name: "Products", href: "/admin/products", icon: <FaCreditCard /> },
  { name: "Footer", href: "/admin/footer", icon: <FaMapMarkerAlt /> },
  { name: "Category", href: "/admin/category", icon: <FaHeart /> },
  { name: "Banner", href: "/admin/banner", icon: <FaShoppingCart /> },
  { name: "Stock", href: "/admin/stock", icon: <FaShoppingCart /> },

  // NEW: payment history + COD on/off
  { name: "Payments", href: "/admin/payments", icon: <FaRupeeSign /> },

  // SETTINGS DROPDOWN
  {
    name: "Settings",
    icon: <FaCog />,
    children: [
      { name: "Cart Notification", href: "/admin/setting/cartNotification" },
      { name: "Admin QnA", href: "/admin/setting/question" },
      { name: "Admin Inquiry", href: "/admin/setting/enquiry" },
      { name: "Contact Queries", href: "/admin/setting/queries" },
      { name: "Recent Orders", href: "/admin/setting/recentOrders" },
    ],
  },
];

// Dashboard matches only "/admin". Other links also match their sub-pages.
const isLinkActive = (pathname, href) =>
  href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);

export default function AdminSidebar({ closeSidebar }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Settings opens by itself when you are on one of its pages
  const [openSetting, setOpenSetting] = useState(
    pathname?.startsWith("/admin/setting") || false
  );

  const close = () => {
    if (closeSidebar) closeSidebar();
  };

  return (
    <div className="h-full min-h-screen w-full border-r border-gray-100 bg-white lg:border-none lg:bg-transparent">
      <div className="sticky top-0">
        {/* LOGO */}
        <Link href="/" className="flex justify-center bg-white px-5 py-4">
          <Image
            src="/infosware-logo.png"
            alt="Infosware - Future Ready Solutions"
            width={220}
            height={74}
            className="h-auto w-[180px] object-contain"
            priority
          />
        </Link>

        {/* USER CARD (not a link any more, so it never leaves the admin panel) */}
        <div className="border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 shrink-0 rounded-full bg-gradient-blue-red p-[2px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-blue-red">
                <span className="text-xl font-bold text-white">
                  {user?.username?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="min-w-0 text-left">
              <p className="text-sm font-medium text-gray-500">Hello,</p>
              <h2 className="truncate text-lg font-bold leading-tight text-[#0f172a]">
                {user?.username}
              </h2>
            </div>
          </div>
        </div>

        {/* LINKS */}
        <div className="mt-6 flex flex-col gap-2 bg-white p-4 shadow-sm">
          {links.map((link) => {
            // SETTINGS DROPDOWN
            if (link.children) {
              return (
                <div key={link.name}>
                  <button
                    type="button"
                    onClick={() => setOpenSetting((prev) => !prev)}
                    aria-expanded={openSetting}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-2 font-medium text-gray-600 transition-all duration-300 hover:bg-primary-blue/10 hover:text-primary-blue"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg text-primary-blue">{link.icon}</span>
                      <span>{link.name}</span>
                    </div>

                    <span className="text-sm font-bold">{openSetting ? "-" : "+"}</span>
                  </button>

                  {openSetting && (
                    <div className="ml-6 mt-2 flex flex-col gap-2">
                      {link.children.map((child) => {
                        const isChildActive = pathname === child.href;

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={close}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                              isChildActive
                                ? "bg-gradient-blue-red text-white shadow-sm"
                                : "text-gray-600 hover:bg-primary-blue/10 hover:text-primary-blue"
                            }`}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // NORMAL LINKS
            const active = isLinkActive(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className={`group flex items-center gap-3 rounded-xl px-4 py-2 font-medium transition-all duration-300 ${
                  active
                    ? "bg-gradient-blue-red text-white shadow-md"
                    : "text-gray-600 hover:bg-primary-blue/10 hover:text-primary-blue"
                }`}
              >
                <span className={`text-lg ${active ? "text-white" : "text-primary-blue"}`}>
                  {link.icon}
                </span>
                <span>{link.name}</span>
              </Link>
            );
          })}

          {/* LOGOUT */}
          <button
            type="button"
            onClick={() => {
              logout();
              close();
            }}
            className="mt-6 flex items-center justify-center gap-3 rounded-2xl bg-gradient-blue-red px-4 py-3 font-semibold text-white transition"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}