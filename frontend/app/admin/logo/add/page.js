"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  FaSave,
  FaSpinner,
  FaArrowLeft,
  FaCloudUploadAlt,
  FaExchangeAlt,
  FaImage,
  FaTimes,
  FaLock,
} from "react-icons/fa";
import { MdTune, MdPhotoLibrary, MdViewAgenda } from "react-icons/md";

// ---- Logo rules ----
const MAX_SIZE = 1 * 1024 * 1024; // 1 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MIN_W = 150;
const MAX_W = 800;
const MIN_H = 40;
const MAX_H = 200;

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Returns a promise that resolves to { error } or { width, height }
const checkImage = (file) =>
  new Promise((resolve) => {
    if (file.size > MAX_SIZE) return resolve({ error: "Image size must be under 1 MB" });
    if (!ALLOWED_TYPES.includes(file.type))
      return resolve({ error: "Only JPG, PNG and WEBP allowed" });

    const url = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;
      if (width < MIN_W) return resolve({ error: `Logo width must be at least ${MIN_W}px` });
      if (width > MAX_W) return resolve({ error: `Logo width must not exceed ${MAX_W}px` });
      if (height < MIN_H) return resolve({ error: `Logo height must be at least ${MIN_H}px` });
      if (height > MAX_H) return resolve({ error: `Logo height must not exceed ${MAX_H}px` });
      resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ error: "Invalid image file" });
    };
    img.src = url;
  });

// ---- Theme classes (white) ----
const inputLayout =
  "w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:ring-4";
const inputCls = `${inputLayout} border-gray-300 bg-white text-[#0f172a] focus:border-primary-blue focus:ring-primary-blue/15`;
const inputReadonlyCls = `${inputLayout} cursor-not-allowed border-gray-200 bg-gray-100 pr-10 font-semibold text-gray-500`;

function Card({ icon, title, subtitle, right, children }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary-blue">
            {icon}
          </span>
          <div>
            <h2 className="text-[15px] font-semibold text-[#0f172a]">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

const AdminAddLogo = () => {
  const router = useRouter();

  const [label] = useState("LOGO");
  const [path, setPath] = useState("/");
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState("");
  const [dimensions, setDimensions] = useState(null);
  const [imageError, setImageError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  // Free the preview URL when it changes or the page closes
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // IMAGE CHANGE (file picker or drag and drop)
  const processFile = async (file) => {
    if (!file) return;

    const result = await checkImage(file);

    if (result.error) {
      setImageError(result.error);
      toast.error(result.error);
      return;
    }

    setImageError("");
    setLogo(file);
    setDimensions({ width: result.width, height: result.height });
    setPreview(URL.createObjectURL(file));
  };

  const handleLogoChange = async (e) => {
    await processFile(e.target.files[0]);
    e.target.value = ""; // lets you pick the same file again
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    await processFile(e.dataTransfer.files?.[0]);
  };

  const removeLogo = () => {
    setLogo(null);
    setPreview("");
    setDimensions(null);
    setImageError("");
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!logo) {
      setImageError("Logo image is required");
      toast.error("Logo image is required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("label", label);
      formData.append("path", path.trim() || "/");
      formData.append("img", logo);

      await api.post(`api/admin/navbar/logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Logo added successfully");
      router.push("/admin/logo");
    } catch (error) {
      console.log(error.response?.data);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen rounded-2xl bg-white p-5 sm:p-8">
      {/* ---- HEADER ---- */}
      <div className="mb-8 flex items-start gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/logo")}
          aria-label="Back to logos"
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-[#0f172a]"
        >
          <FaArrowLeft className="text-sm" />
        </button>

        <div>
          <nav className="mb-1 text-xs text-gray-500">
            <span>Logo</span>
            <span className="mx-1.5">/</span>
            <span className="font-medium text-gray-800">New</span>
          </nav>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a]">
            Add website logo
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            This logo appears in the navigation bar of your store.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
          {/* ---- LEFT ---- */}
          <div className="space-y-6 xl:col-span-2">
            {/* SETTINGS */}
            <Card
              icon={<MdTune size={18} />}
              title="Logo settings"
              subtitle="Where the logo links to"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* LABEL (fixed) */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="label" className="text-[13px] font-medium text-gray-700">
                    Label
                  </label>
                  <div className="relative">
                    <input
                      id="label"
                      type="text"
                      value={label}
                      readOnly
                      className={inputReadonlyCls}
                    />
                    <FaLock
                      size={12}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Fixed. This can&apos;t be changed.</p>
                </div>

                {/* PATH */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="path" className="text-[13px] font-medium text-gray-700">
                    Redirect path
                  </label>
                  <input
                    id="path"
                    type="text"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="/"
                    className={inputCls}
                  />
                  <p className="text-xs text-gray-500">
                    Where shoppers go when they click the logo. Use <code>/</code> for the home page.
                  </p>
                </div>
              </div>
            </Card>

            {/* IMAGE */}
            <Card
              icon={<MdPhotoLibrary size={18} />}
              title="Logo image *"
              subtitle="Upload the logo shown in the navbar"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_220px]">
                {/* DROP ZONE */}
                <label
                  htmlFor="logo-image"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`group relative flex h-56 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 transition focus-within:ring-4 focus-within:ring-primary-blue/20 ${
                    preview
                      ? "border-primary-blue/50 bg-white"
                      : dragging
                      ? "border-dashed border-primary-blue bg-blue-50"
                      : imageError
                      ? "border-dashed border-red-300 bg-red-50"
                      : "border-dashed border-gray-300 bg-gray-50 hover:border-primary-blue hover:bg-blue-50/50"
                  }`}
                >
                  {preview ? (
                    <>
                      <Image
                        unoptimized
                        src={preview}
                        alt="Logo preview"
                        fill
                        className="object-contain p-6"
                      />
                      <span className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/70 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                        <FaExchangeAlt />
                        Replace logo
                      </span>
                    </>
                  ) : (
                    <span className="flex flex-col items-center px-4 text-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-primary-blue shadow-sm">
                        <FaCloudUploadAlt size={22} className={imageError ? "text-red-400" : ""} />
                      </span>
                      <span className="mt-3 text-sm font-medium text-gray-800">
                        Upload website logo
                      </span>
                      <span className="mt-0.5 text-xs text-gray-500">Drag &amp; drop or click</span>
                    </span>
                  )}

                  <input
                    id="logo-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleLogoChange}
                    className="sr-only"
                  />
                </label>

                {/* FILE INFO + RULES */}
                <div className="min-w-0">
                  {logo && (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <FaImage className="shrink-0 text-gray-400" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-800">{logo.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatSize(logo.size)}
                            {dimensions &&
                              ` \u00B7 ${dimensions.width} \u00D7 ${dimensions.height} px`}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeLogo}
                        aria-label="Remove logo"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  )}

                  {imageError && (
                    <p
                      data-error="true"
                      className="mt-3 flex items-start gap-1 text-xs font-medium text-red-600"
                    >
                      <span>{"\u26A0"}</span> {imageError}
                    </p>
                  )}

                  <ul className="mt-4 space-y-2 text-[13px] text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-blue/70" />
                      JPG, PNG or WEBP, up to 1 MB
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-blue/70" />
                      Width {MIN_W} to {MAX_W} px
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-blue/70" />
                      Height {MIN_H} to {MAX_H} px
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* ---- RIGHT: NAVBAR PREVIEW ---- */}
          <aside className="xl:sticky xl:top-6">
            <Card
              icon={<MdViewAgenda size={18} />}
              title="Navbar preview"
              right={
                <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                  Live
                </span>
              }
            >
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex h-16 items-center justify-between gap-4 px-4">
                  <div className="relative h-9 w-32">
                    {preview ? (
                      <Image
                        unoptimized
                        src={preview}
                        alt="Logo in navbar"
                        fill
                        className="object-contain object-left"
                      />
                    ) : (
                      <div className="flex h-full items-center gap-2 text-gray-400">
                        <FaImage />
                        <span className="text-xs font-medium">Your logo</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span className="h-2 w-10 rounded-full bg-gray-200" />
                    <span className="h-2 w-10 rounded-full bg-gray-200" />
                    <span className="h-2 w-10 rounded-full bg-gray-200" />
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-500">
                Clicking the logo opens{" "}
                <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-primary-blue">
                  {path.trim() || "/"}
                </span>
              </p>
            </Card>
          </aside>
        </div>

        {/* ---- STICKY ACTION BAR ---- */}
        <div className="sticky bottom-0 z-20 -mx-5 mt-8 border-t border-gray-200 bg-white/90 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="hidden text-xs text-gray-500 sm:block">
              Fields marked <span className="text-red-500">*</span> are required.
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/admin/logo")}
                disabled={loading}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-blue-red px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save logo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminAddLogo;