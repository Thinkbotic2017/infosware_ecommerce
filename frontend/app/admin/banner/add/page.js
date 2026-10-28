"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import api from "@/app/lib/axios";
import toast from "react-hot-toast";
import { FaImage } from "react-icons/fa";
import { useRouter } from "next/navigation";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;
const MIN_WIDTH = 300;
const MIN_HEIGHT = 100;
const BANNER_TYPES = ["main", "side1", "side2"];

// Main banner must be exactly this size
const MAIN_WIDTH = 1200;
const MAIN_HEIGHT = 400;

const RECOMMENDED_SIZES = {
  main: `${MAIN_WIDTH} × ${MAIN_HEIGHT} px (required)`,
  side1: "650 × 200 px",
  side2: "650 × 200 px",
};

// ─── Theme classes (light) ───────────────────────────────────────────────────
const inputCls =
  "w-full mt-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15";
const labelCls = "text-[13px] font-medium text-slate-700";
const hintCls = "text-xs text-slate-500 mt-2";

// ─── Helpers for reading the category / product responses ────────────────────
const clean = (value) => (typeof value === "string" ? value.trim() : "");
const keyOf = (value) => clean(value).toLowerCase();

// Accepts [..], { data: [..] } or { categories: [..] }
const extractList = (response) => {
  const body = response?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.categories)) return body.categories;
  return [];
};

// A category item may be a string or an object with a name-like field
const getCategoryName = (item) => {
  if (typeof item === "string") return clean(item);
  return clean(item?.category || item?.name || item?.title || item?.categoryName);
};

export default function AdminBannerPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const [imageSize, setImageSize] = useState(null);
  const [categories, setCategories] = useState({});

  // Used to ignore old responses if a newer request has started
  const latestRequest = useRef(0);

  const [formData, setFormData] = useState({
    type: "main",
    title: "",
    subtitle: "",
    description: "",
    buttonText: "Shop Now",
    buttonLink: "/products",
    priceText: "",
    category: "",
    subcategory: "",
    showText: false,
    showButton: false,
    img: null,
  });

  // Subcategories always come straight from the selected category
  const subcategories = categories[formData.category] || [];

  // Fetch categories
  // 1. The category list comes ONLY from the Categories section
  // 2. Products are used only to fill subcategories for those categories
  // 3. A category that exists only on products (like "Electronics") is ignored
  const fetchCategories = useCallback(async () => {
    const requestId = ++latestRequest.current;

    // The timestamp stops the browser from returning an old cached list
    const params = { _t: Date.now() };

    const [categoriesRes, productsRes] = await Promise.allSettled([
      api.get("/api/comman/categories", { params }),
      api.get("/api/comman/products", { params }),
    ]);

    // A newer request started (or the page closed), so ignore this one
    if (requestId !== latestRequest.current) return;

    if (categoriesRes.status === "rejected") {
      console.error(
        "Fetch categories error:",
        categoriesRes.reason?.response?.data || categoriesRes.reason?.message
      );
      toast.error("Could not load categories. Check the categories API.");
      return; // keep the list we already have
    }

    if (productsRes.status === "rejected") {
      console.error(
        "Fetch products error:",
        productsRes.reason?.response?.data || productsRes.reason?.message
      );
      // Not fatal: categories still load, subcategories will just be empty
    }

    const categoryItems = extractList(categoriesRes.value);
    const products = productsRes.status === "fulfilled" ? extractList(productsRes.value) : [];

    // lowercase key -> { name, subs[] }
    const map = new Map();

    // 1. Only categories from the Categories section go in the list
    categoryItems.forEach((item) => {
      const name = getCategoryName(item);
      const key = keyOf(name);
      if (!key || map.has(key)) return;
      map.set(key, { name, subs: [] });
    });

    // 2. Products add subcategories, but only to categories that already exist
    products.forEach((product) => {
      const entry = map.get(keyOf(product.category));
      if (!entry) return; // category is not in the Categories section, skip it

      const sub = clean(product.subCategory);
      if (sub && !entry.subs.includes(sub)) {
        entry.subs.push(sub);
      }
    });

    // Same shape the rest of the form uses: { "Phone": ["iPhone"], ... }
    const categoryMap = {};
    map.forEach(({ name, subs }) => {
      categoryMap[name] = subs;
    });

    setCategories(categoryMap);

    // If the selected category was deleted, clear the selection
    setFormData((previous) => {
      if (!previous.category) return previous;

      if (!(previous.category in categoryMap)) {
        return { ...previous, category: "", subcategory: "" };
      }

      // Selected subcategory no longer exists in that category
      if (
        previous.subcategory &&
        !categoryMap[previous.category].includes(previous.subcategory)
      ) {
        return { ...previous, subcategory: "" };
      }

      return previous;
    });
  }, []);

  // Load on open, and reload when the admin comes back to this tab or window
  useEffect(() => {
    fetchCategories();

    const handleFocus = () => fetchCategories();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchCategories();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      latestRequest.current += 1; // ignore any response that arrives after unmount
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchCategories]);

  // Handle text and select fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle checkboxes
  const handleToggle = (e) => {
    const { name, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: checked,
    }));
  };

  // Handle category selection
  const handleCategoryChange = (e) => {
    const category = e.target.value;

    setFormData((previous) => ({
      ...previous,
      category,
      subcategory: "",
    }));
  };

  // Returns an error message if the size is wrong for the banner type
  const getSizeError = (type, width, height) => {
    if (width < MIN_WIDTH || height < MIN_HEIGHT) {
      return `Image is too small. Minimum size is ${MIN_WIDTH} × ${MIN_HEIGHT} pixels.`;
    }

    if (type === "main" && (width !== MAIN_WIDTH || height !== MAIN_HEIGHT)) {
      return `Main banner must be exactly ${MAIN_WIDTH} × ${MAIN_HEIGHT} pixels. Your image is ${width} × ${height}.`;
    }

    return "";
  };

  // Handle image selection and validation
  const handleImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const input = e.target;

    const rejectImage = (message) => {
      toast.error(message);
      input.value = "";
    };

    if (!ALLOWED_TYPES.includes(file.type)) {
      rejectImage("Only JPG, PNG and WEBP images are allowed.");
      return;
    }

    if (file.size > MAX_SIZE) {
      rejectImage("Image size must be under 2MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      const sizeError = getSizeError(formData.type, image.width, image.height);

      if (sizeError) {
        URL.revokeObjectURL(objectUrl);
        rejectImage(sizeError);
        return;
      }

      setFormData((previous) => ({
        ...previous,
        img: file,
      }));

      setImageSize({ width: image.width, height: image.height });

      setPreview((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return objectUrl;
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      rejectImage("Invalid or corrupt image file.");
    };

    image.src = objectUrl;
  };

  // Submit banner
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!BANNER_TYPES.includes(formData.type)) {
      toast.error("Please select a valid banner type.");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a banner title.");
      return;
    }

    if (formData.title.trim().length < 2) {
      toast.error("Title must be at least 2 characters.");
      return;
    }

    if (!formData.img || !imageSize) {
      toast.error("Please select a banner image.");
      return;
    }

    // Re-check the size in case the type was changed after choosing the image
    const sizeError = getSizeError(formData.type, imageSize.width, imageSize.height);

    if (sizeError) {
      toast.error(sizeError);
      return;
    }

    if (
      formData.showButton &&
      formData.buttonLink &&
      !/^\/|^https?:\/\//.test(formData.buttonLink)
    ) {
      toast.error("Button link must start with / or http:// or https://.");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          data.append(key, value);
        }
      });

      const response = await api.post("/api/admin/banner", data);

      if (response.data?.success === false) {
        throw new Error(response.data.message || "Banner creation failed.");
      }

      toast.success(response.data?.message || "Banner added successfully.");

      router.push("/admin/banner");
    } catch (error) {
      console.error("Banner creation failed:", {
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to add banner. Check the backend logs.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Clean up the image preview URL
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="min-h-screen rounded-2xl bg-slate-50 p-5 sm:p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Add Banner</h1>

        <p className="mt-1 text-sm text-slate-500">Create homepage banners dynamically</p>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* LEFT */}
          <div className="space-y-6">
            {/* TYPE */}
            <div>
              <label className={labelCls}>Banner Type</label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className={inputCls}
              >
                <option value="main">Main Banner (1200 × 400)</option>
                <option value="side1">Side banner 1</option>
                <option value="side2">Side banner 2</option>
              </select>

              <p className={hintCls}>Recommended size: {RECOMMENDED_SIZES[formData.type]}</p>
            </div>

            {/* TITLE */}
            <div>
              <label className={labelCls}>Title</label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                minLength={2}
                maxLength={120}
                required
                placeholder="Enter banner title"
                className={inputCls}
              />

              {!formData.showText && (
                <p className={hintCls}>
                  Text is off, so the title is only used as the image description.
                </p>
              )}
            </div>

            {/* DISPLAY OPTIONS */}
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className={labelCls}>Display options</p>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="showText"
                  checked={formData.showText}
                  onChange={handleToggle}
                  className="mt-1 h-4 w-4 accent-sky-600"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900">
                    Show text on banner
                  </span>
                  <span className="block text-xs text-slate-500">
                    Title, subtitle, price and description appear over the image. Leave it off if
                    your image already has text.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="showButton"
                  checked={formData.showButton}
                  onChange={handleToggle}
                  className="mt-1 h-4 w-4 accent-sky-600"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900">
                    Show shop button
                  </span>
                  <span className="block text-xs text-slate-500">
                    Off: the whole banner is clickable. On: only the button is clickable.
                  </span>
                </span>
              </label>
            </div>

            {/* TEXT FIELDS (only when text is on) */}
            {formData.showText && (
              <>
                <div>
                  <label className={labelCls}>Subtitle</label>

                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    maxLength={150}
                    placeholder="Enter subtitle"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Price Text</label>

                  <input
                    type="text"
                    name="priceText"
                    value={formData.priceText}
                    onChange={handleChange}
                    maxLength={50}
                    placeholder="Starting ₹999"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Description</label>

                  <textarea
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    maxLength={500}
                    placeholder="Enter description"
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </>
            )}
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* BUTTON FIELDS (only when button is on) */}
            {formData.showButton && (
              <>
                <div>
                  <label className={labelCls}>Button Text</label>

                  <input
                    type="text"
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleChange}
                    maxLength={30}
                    placeholder="Shop Now"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Button Link</label>

                  <input
                    type="text"
                    name="buttonLink"
                    value={formData.buttonLink}
                    onChange={handleChange}
                    placeholder="/products"
                    className={inputCls}
                  />
                  <p className={hintCls}>Used only when no category is selected below.</p>
                </div>
              </>
            )}

            {/* CATEGORY */}
            <div>
              <div className="flex items-center justify-between">
                <label className={labelCls}>Category (where the banner links to)</label>

                <button
                  type="button"
                  onClick={fetchCategories}
                  className="text-xs font-medium text-sky-600 transition hover:text-sky-700"
                >
                  Refresh
                </button>
              </div>

              <select
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                className={inputCls}
              >
                <option value="">Select Category</option>

                {Object.keys(categories).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* SUBCATEGORY */}
            <div>
              <label className={labelCls}>Subcategory</label>

              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">Select Subcategory</option>

                {subcategories.map((sub, index) => (
                  <option key={`${sub}-${index}`} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* IMAGE */}
            <div>
              <label className={labelCls}>Banner Image</label>

              <label className="mt-2 flex h-[240px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-sky-500 hover:bg-sky-50/60">
                {preview ? (
                  <img
                    src={preview}
                    alt="Banner preview"
                    className="h-full w-full bg-white object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center px-4 text-center">
                    <FaImage size={40} className="text-slate-300" />

                    <p className="mt-3 text-sm font-medium text-slate-700">Upload Banner Image</p>

                    <p className="mt-1 text-xs text-slate-500">
                      JPG, PNG or WEBP · Under 2 MB · {RECOMMENDED_SIZES[formData.type]}
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  name="img"
                  hidden
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImage}
                />
              </label>

              {formData.img && imageSize && (
                <p className="mt-2 break-all text-sm text-slate-600">
                  Selected: {formData.img.name} ({imageSize.width} × {imageSize.height})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="mt-10 flex justify-end border-t border-slate-200 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gradient-blue-red px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add Banner"}
          </button>
        </div>
      </form>
    </div>
  );
}