"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RiShoppingCart2Line } from "react-icons/ri";
import {
  FaBars,
  FaCaretDown,
  FaCheck,
  FaPhone,
  FaRegHeart,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { IoIosMail } from "react-icons/io";

import api from "@/app/lib/axios";
import { useAuth } from "@/app/context/AuthContext";
import { useWishlist } from "@/app/context/WhishlistContext";
import { useCart } from "@/app/context/CartContext";

// Side padding of the header. Keep it the same as your banner's side gap
// so the logo lines up with the banner's left edge and the icons with its right edge.
const PAGE_X = "px-4 md:px-8 xl:px-12";

const clean = (value) => (typeof value === "string" ? value.trim() : "");

// Accepts [..], { data: [..] } or { categories: [..] }
const extractList = (response) => {
  const body = response?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.categories)) return body.categories;
  return [];
};

const getCategoryName = (item) => {
  if (typeof item === "string") return clean(item);
  return clean(item?.category || item?.name || item?.title || item?.categoryName);
};

function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const { user, loading } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const dropdownRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryNames, setCategoryNames] = useState([]); // from the Categories section
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  // FETCH CATEGORIES (same list as the Categories section).
  // Runs again on every page change, so new categories show up after you add them.
  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/comman/categories", {
          params: { _t: Date.now() },
        });

        const names = extractList(res).map(getCategoryName).filter(Boolean);

        // remove duplicates ignoring upper/lower case
        const seen = new Set();
        const unique = names.filter((name) => {
          const key = name.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        if (!cancelled) setCategoryNames(unique);
      } catch (error) {
        console.error("Navbar categories error:", error.response?.data || error.message);
      }
    };

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Close the dropdown and the mobile menu on page change
  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Close the category dropdown on outside click or Escape
  useEffect(() => {
    if (!open) return;

    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (category) params.set("category", category);

    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  // Home, Shop, Orders, Contact, Settings (Cart removed; the cart icon on the right still opens /cart).
  // Orders and Settings show only for logged-in users.
  // Orders opens your existing app/order page (URL: /order).
  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    ...(mounted && !loading && user ? [{ href: "/order", label: "Orders" }] : []),
    { href: "/contact", label: "Contact" },
    ...(mounted && !loading && user ? [{ href: "/user", label: "Settings" }] : []),
  ];

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const initial = user?.username?.charAt(0)?.toUpperCase();

  return (
    <header className="relative z-40 bg-white">
      {/* ───────── TOP GRADIENT BAR ───────── */}
      <div
        className={`hidden items-center justify-between bg-gradient-blue-red py-1.5 text-sm text-white md:flex ${PAGE_X}`}
      >
        <div className="flex">
          <a href="tel:+919667661934" className="flex items-center gap-2 border-r pr-3">
            <FaPhone /> +91 9667661934
          </a>
          <a href="mailto:info@infosware.in" className="flex items-center gap-2 pl-3">
            <IoIosMail /> info@infosware.in
          </a>
        </div>

        <div className="flex items-center gap-2">
          <FaPhone /> Support Available 24/7
        </div>
      </div>

      {/* ───────── MAIN ROW ───────── */}
      <div className="border-b border-slate-200 shadow-sm">
        <div
          className={`flex w-full flex-wrap items-center gap-x-6 gap-y-3 py-3 lg:min-h-[88px] lg:flex-nowrap lg:gap-x-8 lg:py-0 ${PAGE_X}`}
        >
          {/* 1. LOGO (left edge lines up with the banner) */}
          <Link href="/" className="order-1 shrink-0">
            <Image
              src="/infosware-logo.png"
              alt="Infosware - Future Ready Solutions"
              width={240}
              height={82}
              className="h-auto w-[130px] object-contain md:w-[150px] lg:w-[170px]"
              priority
            />
          </Link>

          {/* 2. CATEGORY + SEARCH IN ONE BOX */}
          <form
            onSubmit={handleSearch}
            className="relative order-3 flex h-12 w-full items-stretch rounded-xl border border-slate-200 bg-white transition focus-within:border-primary-blue focus-within:ring-4 focus-within:ring-primary-blue/10 lg:order-2 lg:h-[52px] lg:w-[280px] lg:shrink xl:w-[380px] 2xl:w-[520px]"
          >
            {/* Category dropdown (left side of the same box) */}
            <div ref={dropdownRef} className="relative flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="flex max-w-[130px] items-center justify-between gap-2 pl-4 pr-3 text-[15px] text-slate-600 transition hover:text-primary-blue sm:max-w-[190px] lg:max-w-[140px] xl:max-w-[170px]"
              >
                <span className="truncate">{category || "All categories"}</span>
                <FaCaretDown className="shrink-0 text-slate-700" />
              </button>

              {/* thin divider between dropdown and input */}
              <span className="h-6 w-px bg-slate-200" />

              {open && (
                <ul
                  role="listbox"
                  className="absolute left-0 top-full z-50 mt-2 max-h-72 w-60 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl"
                >
                  {["", ...categoryNames].map((name) => {
                    const selected = category === name;

                    return (
                      <li key={name || "all"} role="option" aria-selected={selected}>
                        <button
                          type="button"
                          onClick={() => {
                            setCategory(name);
                            setOpen(false);
                          }}
                          className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition ${
                            selected
                              ? "bg-blue-50 font-semibold text-primary-blue"
                              : "text-slate-700 hover:bg-slate-50 hover:text-primary-red"
                          }`}
                        >
                          <span className="truncate">{name || "All categories"}</span>
                          {selected && <FaCheck size={11} className="shrink-0" />}
                        </button>
                      </li>
                    );
                  })}

                  {categoryNames.length === 0 && (
                    <li className="px-4 py-2 text-xs text-slate-400">No categories yet.</li>
                  )}
                </ul>
              )}
            </div>

            {/* Search input (same box) */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for items"
              className="min-w-0 flex-1 bg-transparent px-4 text-[15px] text-slate-800 outline-none placeholder:text-slate-400"
            />

            {/* Search icon at the end (Enter also searches) */}
            <button
              type="submit"
              aria-label="Search"
              className="flex w-12 shrink-0 items-center justify-center text-primary-blue transition hover:text-primary-red"
            >
              <FaSearch size={15} />
            </button>
          </form>

          {/* 3. LINKS: right after the search box (Home, Shop, Orders, Contact, Settings) */}
          <nav className="hidden shrink-0 items-center gap-5 lg:order-3 lg:ml-6 lg:flex xl:ml-8 xl:gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap text-[16px] font-medium transition xl:text-[17px] ${
                  isActive(link.href)
                    ? "text-primary-blue"
                    : "text-slate-700 hover:text-primary-blue"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 4. RIGHT END: wishlist, cart, user (right edge lines up with the banner) */}
          <div className="order-2 ml-auto flex shrink-0 items-center gap-6 lg:order-4 lg:gap-7">
            {/* WISHLIST */}
            <Link href="/whishlist" aria-label="Wishlist" className="relative flex items-center">
              <FaRegHeart className="text-[21px] text-slate-800 transition hover:text-primary-red" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-red px-1 text-[11px] font-semibold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* CART */}
            <Link href="/cart" aria-label="Cart" className="relative flex items-center">
              <RiShoppingCart2Line className="text-[25px] text-slate-800 transition hover:text-primary-blue" />
              {mounted && cartCount > 0 && (
                <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-blue px-1 text-[11px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* USER / SIGN IN */}
            {!mounted || loading ? (
              <div className="hidden h-11 w-[120px] sm:block" />
            ) : user ? (
              <Link href="/user" className="flex items-center gap-2.5 transition hover:opacity-80">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-blue-red text-sm font-semibold text-white shadow-sm">
                  {initial}
                </div>
                <span className="hidden text-[15px] font-semibold text-[#0f172a] xl:block">
                  {user?.username}
                </span>
              </Link>
            ) : (
              <div className="hidden items-center gap-3 sm:flex">
                <Link href="/signup">
                  <button className="whitespace-nowrap rounded-full bg-primary-red px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
                    Sign Up
                  </button>
                </Link>
                <Link href="/signin">
                  <button className="whitespace-nowrap rounded-full bg-primary-blue px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90">
                    Sign In
                  </button>
                </Link>
              </div>
            )}

            {/* HAMBURGER (below lg) */}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="lg:hidden"
            >
              {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className={`space-y-4 border-t border-slate-200 py-4 lg:hidden ${PAGE_X}`}>
            <div className="flex flex-col gap-3 text-sm">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={isActive(link.href) ? "text-primary-blue" : "hover:text-primary-blue"}
                >
                  {link.label}
                </Link>
              ))}

              {/* Cart is no longer in the main links, so keep it reachable here */}
              <Link
                href="/cart"
                className={isActive("/cart") ? "text-primary-blue" : "hover:text-primary-blue"}
              >
                Cart
              </Link>
              <Link href="/whishlist" className="hover:text-primary-blue">
                Wishlist
              </Link>
            </div>

            {mounted && !loading && !user && (
              <div className="flex gap-3">
                <Link href="/signup" className="flex-1">
                  <button className="w-full rounded-full bg-primary-red px-4 py-1.5 text-white">
                    Sign Up
                  </button>
                </Link>
                <Link href="/signin" className="flex-1">
                  <button className="w-full rounded-full bg-primary-blue px-4 py-1.5 text-white">
                    Sign In
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;