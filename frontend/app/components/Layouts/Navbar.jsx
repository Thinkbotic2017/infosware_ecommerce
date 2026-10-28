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

import api, { BASE_URL } from "@/app/lib/axios";
import { useAuth } from "@/app/context/AuthContext";
import { useWishlist } from "@/app/context/WhishlistContext";
import { useCart } from "@/app/context/CartContext";

const PAGE_X = "px-4 md:px-8 xl:px-12";

const MIN_CHARS = 2;
const SUGGEST_DELAY = 250;
const SUGGEST_LIMIT = 6;

// CHANGE PRODUCTS_URL to the API your Shop page uses to load all products.
// It is only used as a fallback when the suggest endpoint returns nothing.
const SUGGEST_URL = "/api/comman/products/suggest";
const PRODUCTS_URL = "/api/comman/products";

const clean = (value) => (typeof value === "string" ? value.trim() : "");

const LIST_KEYS = [
  "data",
  "categories",
  "products",
  "suggestions",
  "results",
  "items",
  "docs",
];

const extractList = (response) => {
  const body = response?.data;
  if (Array.isArray(body)) return body;

  for (const key of LIST_KEYS) {
    if (Array.isArray(body?.[key])) return body[key];
    if (body?.[key] && typeof body[key] === "object") {
      for (const inner of LIST_KEYS) {
        if (Array.isArray(body[key]?.[inner])) return body[key][inner];
      }
    }
  }
  return [];
};

const getCategoryName = (item) => {
  if (typeof item === "string") return clean(item);
  return clean(item?.category || item?.name || item?.title || item?.categoryName);
};

const getProductName = (item) => clean(item?.name || item?.title);

const money = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

// Case-insensitive "contains" match on product name (and category name)
const matchesQuery = (item, text) => {
  const q = text.toLowerCase();
  const name = getProductName(item).toLowerCase();
  const cat = getCategoryName(item?.category).toLowerCase();
  return name.includes(q) || cat.includes(q);
};

const matchesCategory = (item, category) => {
  if (!category) return true;
  return getCategoryName(item?.category).toLowerCase() === category.toLowerCase();
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
  const searchBoxRef = useRef(null);
  const allProductsRef = useRef(null); // cache for the local fallback search

  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryNames, setCategoryNames] = useState([]);
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [sugOpen, setSugOpen] = useState(false);
  const [sugLoading, setSugLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  // FETCH CATEGORIES
  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/comman/categories", {
          params: { _t: Date.now() },
        });

        const names = extractList(res).map(getCategoryName).filter(Boolean);

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

  // Close dropdowns and mobile menu on page change
  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
    setSugOpen(false);
    allProductsRef.current = null; // refresh fallback cache after navigation
  }, [pathname]);

  // Close category dropdown on outside click or Escape
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

  // Close suggestions on outside click
  useEffect(() => {
    if (!sugOpen) return;

    const onClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSugOpen(false);
      }
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [sugOpen]);

  // LIVE SUGGESTIONS: ask the server, and if it finds nothing, search locally
  useEffect(() => {
    const text = query.trim();

    if (text.length < MIN_CHARS) {
      setSuggestions([]);
      setSugLoading(false);
      return;
    }

    let cancelled = false;
    setSugLoading(true);

    const searchLocally = async () => {
      try {
        if (!allProductsRef.current) {
          const res = await api.get(PRODUCTS_URL, { params: { _t: Date.now() } });
          allProductsRef.current = extractList(res);
        }
        return allProductsRef.current
          .filter((p) => matchesQuery(p, text) && matchesCategory(p, category))
          .slice(0, SUGGEST_LIMIT);
      } catch (error) {
        console.error("Fallback search error:", error.response?.data || error.message);
        return [];
      }
    };

    const timer = setTimeout(async () => {
      let list = [];

      try {
        const res = await api.get(SUGGEST_URL, {
          params: { q: text, category: category || undefined, limit: SUGGEST_LIMIT },
        });
        list = extractList(res).slice(0, SUGGEST_LIMIT);
      } catch (error) {
        console.error("Suggestions error:", error.response?.data || error.message);
      }

      if (cancelled) return;

      if (list.length === 0) {
        list = await searchLocally();
        if (cancelled) return;
      }

      setSuggestions(list);
      setActiveIdx(-1);
      setSugLoading(false);
    }, SUGGEST_DELAY);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, category]);

  const goToShop = (nextCategory, nextQuery) => {
    const params = new URLSearchParams();
    if (clean(nextQuery)) params.set("search", clean(nextQuery));
    if (nextCategory) params.set("category", nextCategory);

    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSugOpen(false);
    goToShop(category, query);
  };

  const handleCategoryPick = (name) => {
    setCategory(name);
    setOpen(false);
    setSugOpen(false);
    goToShop(name, query);
  };

  const pickSuggestion = (item) => {
    const name = getProductName(item);
    setQuery(name);
    setSugOpen(false);
    goToShop(category, name);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setSugOpen(false);
      return;
    }

    if (!sugOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      pickSuggestion(suggestions[activeIdx]);
    }
  };

  const showSuggestions = sugOpen && query.trim().length >= MIN_CHARS;

  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    ...(mounted && !loading && user ? [{ href: "/order", label: "Orders" }] : []),
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const initial = user?.username?.charAt(0)?.toUpperCase();

  return (
    <header className="relative z-40 bg-white">
      {/* TOP GRADIENT BAR */}
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

      {/* MAIN ROW */}
      <div className="border-b border-slate-200 shadow-sm">
        <div
          className={`flex w-full flex-wrap items-center gap-x-6 gap-y-3 py-3 lg:min-h-[88px] lg:flex-nowrap lg:gap-x-8 lg:py-0 ${PAGE_X}`}
        >
          {/* 1. LOGO */}
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

          {/* 2. CATEGORY + SEARCH */}
          <div
            ref={searchBoxRef}
            className="relative order-3 w-full lg:order-2 lg:w-[280px] lg:shrink xl:w-[380px] 2xl:w-[520px]"
          >
            <form
              onSubmit={handleSearch}
              className="relative flex h-12 w-full items-stretch rounded-xl border border-slate-200 bg-white transition focus-within:border-primary-blue focus-within:ring-4 focus-within:ring-primary-blue/10 lg:h-[52px]"
            >
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
                            onClick={() => handleCategoryPick(name)}
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

              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSugOpen(true);
                }}
                onFocus={() => setSugOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search for items"
                autoComplete="off"
                role="combobox"
                aria-expanded={showSuggestions}
                aria-autocomplete="list"
                className="min-w-0 flex-1 bg-transparent px-4 text-[15px] text-slate-800 outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                aria-label="Search"
                className="flex w-12 shrink-0 items-center justify-center text-primary-blue transition hover:text-primary-red"
              >
                <FaSearch size={15} />
              </button>
            </form>

            {/* SUGGESTIONS */}
            {showSuggestions && (
              <ul
                role="listbox"
                className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl"
              >
                {sugLoading && suggestions.length === 0 && (
                  <li className="px-4 py-3 text-sm text-slate-400">Searching...</li>
                )}

                {!sugLoading && suggestions.length === 0 && (
                  <li className="px-4 py-3 text-sm text-slate-400">
                    No products found{category ? ` in ${category}` : ""}.
                  </li>
                )}

                {suggestions.map((item, i) => {
                  const name = getProductName(item);
                  const img = item?.img || item?.images?.[0]?.img;

                  return (
                    <li
                      key={item?._id || `${name}-${i}`}
                      role="option"
                      aria-selected={i === activeIdx}
                    >
                      <button
                        type="button"
                        onMouseEnter={() => setActiveIdx(i)}
                        onClick={() => pickSuggestion(item)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                          i === activeIdx ? "bg-blue-50" : "hover:bg-slate-50"
                        }`}
                      >
                        {img ? (
                          <img
                            src={`${BASE_URL}/${img}`}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-lg border border-slate-100 object-cover"
                          />
                        ) : (
                          <span className="h-10 w-10 shrink-0 rounded-lg bg-slate-100" />
                        )}

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-800">
                            {name}
                          </span>
                          {item?.category && (
                            <span className="block truncate text-xs text-slate-400">
                              {getCategoryName(item.category)}
                            </span>
                          )}
                        </span>

                        {item?.price != null && (
                          <span className="shrink-0 text-sm font-semibold text-primary-red">
                            {money(item.price)}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* 3. LINKS */}
          <nav className="hidden shrink-0 items-center gap-9 lg:order-3 lg:ml-8 lg:flex xl:ml-7 xl:gap-15">
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

          {/* 4. RIGHT END */}
          <div className="order-2 ml-auto flex shrink-0 items-center gap-6 lg:order-4 lg:gap-7">
            <Link href="/wishlist" aria-label="Wishlist" className="relative flex items-center">
              <FaRegHeart className="text-[21px] text-slate-800 transition hover:text-primary-red" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-red px-1 text-[11px] font-semibold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" aria-label="Cart" className="relative flex items-center">
              <RiShoppingCart2Line className="text-[25px] text-slate-800 transition hover:text-primary-blue" />
              {mounted && cartCount > 0 && (
                <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-blue px-1 text-[11px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

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

              <Link
                href="/cart"
                className={isActive("/cart") ? "text-primary-blue" : "hover:text-primary-blue"}
              >
                Cart
              </Link>
              <Link href="/wishlist" className="hover:text-primary-blue">
                Wishlist
              </Link>

              {mounted && !loading && user && (
                <Link
                  href="/user"
                  className={isActive("/user") ? "text-primary-blue" : "hover:text-primary-blue"}
                >
                  Settings
                </Link>
              )}
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