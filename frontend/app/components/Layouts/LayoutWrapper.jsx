"use client";

import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";

import Navbar from "./Navbar";
import CatNavbar from "./CatNavbar";
import Footer from "./Footer";

import { AuthProvider } from "@/app/context/AuthContext";
import { CartProvider } from "@/app/context/CartContext";
import { WishlistProvider } from "@/app/context/WhishlistContext";

// Pages with no header and footer. Change these to match your real URLs.
const HIDE_LAYOUT_ON = ["/admin", "/login", "/signin", "/signup", "/register"];

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const hideLayout = HIDE_LAYOUT_ON.some(
    (path) => pathname === path || pathname?.startsWith(path + "/")
  );

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="flex min-h-screen flex-col bg-white text-gray-900 antialiased">
            {!hideLayout && (
              <header className="sticky top-0 z-40">
                <Suspense fallback={null}>
                  <Navbar />
                  <CatNavbar />
                </Suspense>
              </header>
            )}

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: "10px",
                  background: "#0f172a",
                  color: "#fff",
                  fontSize: "14px",
                },
                success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
                error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
              }}
            />

            <main className="flex-1">{children}</main>

            {!hideLayout && <Footer />}
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}