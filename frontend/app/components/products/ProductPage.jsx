"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FaFilter, FaChevronDown } from "react-icons/fa";

import Pagination from "../Pagination";
import ProductCard from "../home/Card";
import FilterSidebar from "./FilterSidebar";
import api, { BASE_URL } from "@/app/lib/axios";

const PAGE_SIZE = 8;

// Left padding of the top text. Same value as the Navbar's PAGE_X left side,
// so "Home / Shop / Products" starts exactly where the logo starts.
const TEXT_LEFT = "pl-4 md:pl-8 xl:pl-12";

// Dynamic filters. To add another one later, add a line here
// (the backend must return the options under the same key, and accept it as a query param).
// type: "color" = swatches, "chip" = pill buttons, "check" = checkbox list
const DYNAMIC_FILTERS = [
  { key: "colors", title: "Color", type: "color" },
  { key: "sizes", title: "Size", type: "chip" },
  // { key: "materials", title: "Material", type: "check" },
];

const normalizeOptions = (list = []) =>
  list
    .map((o) =>
      typeof o === "string"
        ? { value: o.trim() }
        : { value: String(o?.name ?? o?.value ?? "").trim(), count: o?.count }
    )
    .filter((o) => o.value);

// keep the old array when the content is the same (avoids extra refetches)
const sameList = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // values from the URL (searchParams.get already decodes them)
  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");
  const brand = searchParams.get("brand");
  const rating = searchParams.get("rating");
  const search = searchParams.get("search");

  // products
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState("default");

  // sidebar data from the server
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [brands, setBrands] = useState([]);
  const [dynamicOptions, setDynamicOptions] = useState({}); // { colors: [...], sizes: [...] }
  const [metaLoaded, setMetaLoaded] = useState(false);
  const [MinPriceRange] = useState(0);
  const [MaxPriceRange, setMaxPriceRange] = useState(0);

  // selected filters
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(category || "All");
  const [selectedSubCategory, setSelectedSubCategory] = useState(subcategory || "");
  const [selectedBrands, setSelectedBrands] = useState(brand ? brand.split(",") : []);
  const [selectedDynamic, setSelectedDynamic] = useState({}); // { colors: ["red"] }
  const [selectedRating, setSelectedRating] = useState(Number(rating) || 0);
  const [discountRange, setDiscountRange] = useState(0);
  const [priceRange, setSelectedPriceRange] = useState(0);
  const [searchQuery, setSearchQuery] = useState(search || "");

  /* ───────── 1. SIDEBAR META DATA (once) ───────── */
  useEffect(() => {
    let cancelled = false;

    const fetchMetaData = async () => {
      try {
        const res = await api.get("/api/comman/metaproducts");
        if (cancelled) return;

        const data = res.data || {};
        const max = Number(data.maxPrice) || 0;

        setCategories([
          { name: "All", count: data.totalProducts || 0 },
          ...(data.categories || []),
        ]);
        setBrands(data.brands || []);
        setSubcategories(data.subcategories || {});
        setDynamicOptions(
          Object.fromEntries(
            DYNAMIC_FILTERS.map((f) => [f.key, normalizeOptions(data[f.key])])
          )
        );
        setMaxPriceRange(max);
        setSelectedPriceRange(max);
      } catch (error) {
        console.log(error);
      } finally {
        if (!cancelled) setMetaLoaded(true);
      }
    };

    fetchMetaData();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ───────── 2. URL → STATE (navbar search, back button, shared links) ───────── */
  useEffect(() => {
    setSelectedCategory(category || "All");
    setSelectedSubCategory(subcategory || "");
    setSearchQuery(search || "");
    setSelectedRating(Number(rating) || 0);

    const nextBrands = brand ? brand.split(",") : [];
    setSelectedBrands((prev) => (sameList(prev, nextBrands) ? prev : nextBrands));

    setPage(1);
  }, [category, subcategory, search, rating, brand]);

  /* ───────── 3. STATE → URL ───────── */
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory && selectedCategory !== "All") params.set("category", selectedCategory);
    if (selectedSubCategory) params.set("subcategory", selectedSubCategory);
    if (selectedBrands.length > 0) params.set("brand", selectedBrands.join(","));
    if (selectedRating) params.set("rating", String(selectedRating));

    const next = params.toString();
    if (next === searchParams.toString()) return; // already in sync

    router.replace(next ? `/products?${next}` : "/products", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, selectedSubCategory, selectedBrands, selectedRating]);

  /* ───────── 4. FETCH PRODUCTS ───────── */
  useEffect(() => {
    if (!metaLoaded) return; // wait for the real max price first

    let cancelled = false;

    const fetchProducts = async () => {
      setLoading(true);

      try {
        const params = { page, limit: PAGE_SIZE };

        if (selectedCategory !== "All") params.category = selectedCategory;
        if (selectedSubCategory) params.subcategory = selectedSubCategory;
        if (selectedBrands.length > 0) params.brand = selectedBrands.join(",");
        if (selectedRating > 0) params.rating = selectedRating;
        if (discountRange) params.discount = discountRange;
        if (searchQuery) params.search = searchQuery;
        if (sort !== "default") params.sort = sort;

        // dynamic filters (colors, sizes, ...)
        DYNAMIC_FILTERS.forEach(({ key }) => {
          const values = selectedDynamic[key] || [];
          if (values.length > 0) params[key] = values.join(",");
        });

        // only filter by price when the slider was actually moved
        if (MaxPriceRange > 0 && priceRange < MaxPriceRange) {
          params.maxPrice = priceRange;
        }

        const res = await api.get("/api/comman/filterproducts", { params });
        if (cancelled) return; // an older request must not overwrite a newer one

        const formatted = (res.data.data || []).map((item) => ({
          id: item._id,
          image: `${BASE_URL}/${item.img}`,
          title: item.name,
          category: item.category,
          subcategory: item.subCategory,
          brand: item.Brand,
          price: item.price,
          oldPrice: item.oldPrice,
          discount: item.discount,
          rating: item.rating ?? 0,
          colors: item.colors || [],
          sizes: item.sizes || [],
          isPlaceholder: item.isPlaceholder === true,
          priceVerified: item.priceVerified === true,
          stockStatus: item.stockStatus,
        }));

        setAllProducts(formatted);
        setTotalPages(res.data.totalPages || 1);
      } catch (error) {
        if (!cancelled) {
          console.log(error);
          setAllProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [
    metaLoaded,
    page,
    selectedCategory,
    selectedSubCategory,
    selectedBrands,
    selectedDynamic,
    selectedRating,
    discountRange,
    priceRange,
    searchQuery,
    sort,
    MaxPriceRange,
  ]);

  /* ───────── helpers ───────── */
  const getStep = () => {
    if (MaxPriceRange <= 100) return 1;
    if (MaxPriceRange <= 1000) return 10;
    if (MaxPriceRange <= 100000) return 100;
    return 500;
  };

  const toggleBrand = (name) => {
    setSelectedBrands((prev) =>
      prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]
    );
  };

  const toggleDynamic = (key, value) => {
    setSelectedDynamic((prev) => {
      const current = prev[key] || [];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
    setPage(1);
  };

  const handleRating = (rate) => {
    setSelectedRating((prev) => (prev === rate ? 0 : rate));
    setPage(1);
  };

  const clearAll = () => {
    setSelectedCategory("All");
    setSelectedSubCategory("");
    setSelectedBrands([]);
    setSelectedDynamic({});
    setSelectedRating(0);
    setDiscountRange(0);
    setSelectedPriceRange(MaxPriceRange);
    setSearchQuery("");
    setPage(1);
    router.replace("/products", { scroll: false });
  };

  /* ───────── UI ───────── */
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      {/* TOP BAR: only the left side (text) is moved to the logo's edge */}
      <div className={`border-b border-slate-200 bg-white py-3 pr-4 lg:pr-10 ${TEXT_LEFT}`}>
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="mb-1 text-xs text-slate-500">
              <Link href="/" className="transition hover:text-primary-blue">
                Home
              </Link>
              <span className="mx-1.5 text-slate-300">/</span>
              <Link href="/products" className="transition hover:text-primary-blue">
                Shop
              </Link>
              <span className="mx-1.5 text-slate-300">/</span>
              <span className="text-primary-blue">Products</span>
            </p>
            <h1 className="text-[22px] font-medium tracking-tight text-slate-800 sm:text-2xl">
              Products
            </h1>
          </div>

          <div className="flex w-full items-stretch gap-3 sm:items-center md:w-auto">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 lg:hidden"
            >
              <FaFilter className="text-primary-red" /> Filters
            </button>

            <div className="relative flex-1 sm:w-[220px]">
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-700 transition focus:border-primary-blue focus:outline-none"
              >
                <option value="default">Sort by: Default</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* SIDEBAR + PRODUCTS (same layout as before) */}
      <div className="relative mt-0 flex">
        {/* FILTER SIDEBAR */}
        <FilterSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          categories={categories}
          subcategories={subcategories}
          brands={brands}
          dynamicFilters={DYNAMIC_FILTERS.map((f) => ({
            ...f,
            options: dynamicOptions[f.key] || [],
          }))}
          selectedCategory={selectedCategory}
          selectedSubCategory={selectedSubCategory}
          selectedBrands={selectedBrands}
          selectedDynamic={selectedDynamic}
          selectedRating={selectedRating}
          discountRange={discountRange}
          priceRange={priceRange}
          minPrice={MinPriceRange}
          maxPrice={MaxPriceRange}
          priceStep={getStep()}
          onCategory={(name) => {
            setSelectedCategory(name);
            setSelectedSubCategory("");
            setSearchQuery("");
            setPage(1);
          }}
          onSubCategory={(sub) => {
            setSelectedSubCategory(sub);
            setPage(1);
          }}
          onToggleBrand={(name) => {
            toggleBrand(name);
            setPage(1);
          }}
          onToggleDynamic={toggleDynamic}
          onRating={handleRating}
          onDiscount={(d) => {
            setDiscountRange(d);
            setPage(1);
          }}
          onPrice={(p) => {
            setSelectedPriceRange(p);
            setPage(1);
          }}
          onClear={clearAll}
        />

        {/* PRODUCTS */}
        <div className="mt-8 min-w-0 flex-1 px-4 lg:pl-2 lg:pr-10">
          {loading && allProducts.length === 0 ? (
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          ) : allProducts.length > 0 ? (
            <>
              <div
                className={`grid grid-cols-2 gap-2 transition-opacity lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 ${
                  loading ? "opacity-60" : "opacity-100"
                }`}
              >
                {allProducts.map((item) => (
                  <ProductCard key={item.id} {...item} />
                ))}
              </div>

              <div className="mt-10 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-10 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
                <FaFilter className="text-3xl text-gray-300" />
              </div>

              <h3 className="mb-3 text-2xl font-bold text-[#0f172a]">No products found</h3>

              <p className="mb-8 max-w-sm leading-relaxed text-gray-500">
                We couldn&apos;t find any products matching your current filters.
              </p>

              <button
                onClick={clearAll}
                className="rounded-full bg-gradient-blue-red px-8 py-3 font-medium text-white shadow-md transition-transform hover:scale-105"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}