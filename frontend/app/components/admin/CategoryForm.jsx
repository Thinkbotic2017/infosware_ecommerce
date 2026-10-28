"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api, { BASE_URL } from "@/app/lib/axios";
import {
  FaSave,
  FaImage,
  FaArrowLeft,
  FaCloudUploadAlt,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaRegCircle,
  FaExchangeAlt,
} from "react-icons/fa";
import { MdCategory, MdPhotoLibrary, MdViewAgenda } from "react-icons/md";

// ── Image rules ──────────────────────────────────────────────────────────
const OUTPUT_SIZE = 500; // every category image is saved as 500 x 500 px
const MIN_SIDE = 100; // width and height must each be at least this
const MAX_SIDE = 800; // width and height must each be at most this
const MAX_FILE_SIZE = 5 * 1024 * 1024; // original file limit (compressed before upload)
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const NAME_MAX = 60;

// Works whether the saved image name has the "uploads/" prefix or not
const getImageUrl = (image) => {
  if (!image) return "";
  const imagePath = image.replace(/^\/+/, "");
  const uploadPath = imagePath.startsWith("uploads/")
    ? imagePath
    : `uploads/${imagePath}`;

  return `${BASE_URL}/${uploadPath}`;
};

// 1234567 -> "1.2 MB"
const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Loads a File into an <img> element
const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Invalid image file"));
    };

    image.src = objectUrl;
  });

// Crops the image to a centered square and resizes it to OUTPUT_SIZE
const makeSquareFile = async (file) => {
  const image = await loadImage(file);

  const side = Math.min(image.width, image.height);
  const sourceX = (image.width - side) / 2;
  const sourceY = (image.height - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const context = canvas.getContext("2d");
  context.imageSmoothingQuality = "high";

  // White background in case the image has transparent areas
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  context.drawImage(image, sourceX, sourceY, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  const toBlob = (type, quality) =>
    new Promise((resolve) => canvas.toBlob(resolve, type, quality));

  let blob = await toBlob("image/webp", 0.88);
  let extension = "webp";

  // Fallback for browsers that cannot export WEBP
  if (!blob || blob.type !== "image/webp") {
    blob = await toBlob("image/jpeg", 0.9);
    extension = "jpg";
  }

  if (!blob) {
    throw new Error("Could not process the image");
  }

  const baseName = file.name.replace(/\.[^/.]+$/, "") || "category";

  return new File([blob], `${baseName}.${extension}`, { type: blob.type });
};

// ─── Theme classes (light) ───────────────────────────────────────────────────
const inputLayout =
  "w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4";
const inputCls = `${inputLayout} border-slate-300 bg-white text-slate-900 focus:border-sky-500 focus:ring-sky-500/15`;
const inputErrCls = `${inputLayout} border-red-400 bg-red-50 text-slate-900 focus:border-red-500 focus:ring-red-500/15`;

// ─── Sub-component ───────────────────────────────────────────────────────────
function Card({ icon, title, subtitle, right, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            {icon}
          </span>
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export default function CategoryForm({ initialData, mode = "add" }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [filePreview, setFilePreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      category: "",
      img: "",
    },
  });

  // Stable primitive values (these don't change on every render)
  const initialId = initialData?._id;
  const initialCategory = initialData?.category;
  const initialImg = initialData?.img;

  const isEdit = mode === "edit";

  // PREFILL EDIT DATA
  useEffect(() => {
    if (!isEdit || !initialId) return;

    reset({
      category: initialCategory || "",
      img: "",
    });
  }, [isEdit, initialId, initialCategory, reset]);

  // LIVE VALUES (used for the store preview card)
  const imageFile = watch("img");
  const watchedName = watch("category") || "";
  const selectedFile = imageFile && imageFile[0] ? imageFile[0] : null;

  // PREVIEW OF A NEWLY SELECTED FILE
  useEffect(() => {
    if (!selectedFile) {
      setFilePreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setFilePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // New file wins; otherwise show the saved image (edit mode)
  const existingUrl = isEdit && initialImg ? getImageUrl(initialImg) : "";
  const preview = filePreview || existingUrl;

  const hasName = watchedName.trim().length >= 2;
  const hasImage = Boolean(preview) && !errors.img;
  const doneCount = Number(hasName) + Number(hasImage);

  // DRAG AND DROP
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setValue("img", e.dataTransfer.files, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const removeSelectedFile = () => {
    setValue("img", "", { shouldValidate: false, shouldDirty: true });
  };

  // SUBMIT
  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const categoryName = data.category.trim();

      const formData = new FormData();
      formData.append("category", categoryName);
      formData.append("name", categoryName); // FIX: backend requires "name" too

      if (data.img && data.img[0]) {
        // Crop to a square and resize to 500 x 500 before upload
        const squareFile = await makeSquareFile(data.img[0]);
        formData.append("img", squareFile);
      }

      // No Content-Type header: the browser sets the multipart boundary
      // automatically for FormData.
      if (!isEdit) {
        await api.post("/api/admin/landingpage/categories", formData);
        toast.success("Category added");
      } else {
        await api.put(`/api/admin/landingpage/category/${initialId}`, formData);
        toast.success("Category updated");
      }

      router.push("/admin/category");
    } catch (error) {
      console.log("SERVER SAYS:", error.response?.data);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.msg ||
          error.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // OPTIONAL NAME SUGGESTIONS (names already used by your products).
  // You can still type any new name you like.
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await api.get("/api/comman/products");
        const products = response.data.data || [];

        const unique = [...new Set(products.map((item) => item.category).filter(Boolean))];

        setSuggestions(unique);
      } catch (error) {
        console.log(error);
      }
    };

    fetchSuggestions();
  }, []);

  return (
    <div className="min-h-screen rounded-2xl bg-slate-50 p-5 sm:p-8">
      {/* ───────────── HEADER ───────────── */}
      <div className="mb-8 flex items-start gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/category")}
          aria-label="Back to categories"
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
        >
          <FaArrowLeft className="text-sm" />
        </button>

        <div>
          <nav className="mb-1 text-xs text-slate-500">
            <span>Categories</span>
            <span className="mx-1.5">/</span>
            <span className="font-medium text-slate-700">{isEdit ? "Edit" : "New"}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {isEdit ? "Edit category" : "Add category"}
            </h1>
            {isEdit && (
              <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                Editing
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Categories group your products and appear as tiles on the store home page.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
          {/* ───────────── LEFT ───────────── */}
          <div className="space-y-6 xl:col-span-2">
            {/* DETAILS */}
            <Card
              icon={<MdCategory size={18} />}
              title="Details"
              subtitle="The name shoppers will see on the store"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="category" className="text-[13px] font-medium text-slate-700">
                    Category name <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-xs tabular-nums ${
                      watchedName.length >= NAME_MAX ? "font-semibold text-red-600" : "text-slate-400"
                    }`}
                  >
                    {watchedName.length}/{NAME_MAX}
                  </span>
                </div>

                <input
                  id="category"
                  type="text"
                  list="category-suggestions"
                  maxLength={NAME_MAX}
                  autoComplete="off"
                  placeholder="e.g. Printers, RFID Tags, Card Readers"
                  {...register("category", {
                    required: "Category name is required",
                    validate: (value) =>
                      value.trim().length >= 2 || "Name must be at least 2 characters",
                  })}
                  className={errors.category ? inputErrCls : inputCls}
                />

                <datalist id="category-suggestions">
                  {suggestions.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>

                {errors.category ? (
                  <p data-error="true" className="flex items-center gap-1 text-xs font-medium text-red-600">
                    <span>⚠</span> {errors.category.message}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Use the same name your products use, so shoppers who click this category see the
                    right products.
                  </p>
                )}
              </div>
            </Card>

            {/* IMAGE */}
            <Card
              icon={<MdPhotoLibrary size={18} />}
              title="Image *"
              subtitle="Shown inside a circle on the store. We crop it to a square for you"
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-[176px_1fr]">
                {/* DROP ZONE */}
                <label
                  htmlFor="category-image"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`group relative mx-auto block h-44 w-44 cursor-pointer overflow-hidden rounded-2xl border-2 transition focus-within:ring-4 focus-within:ring-sky-500/20 sm:mx-0 ${
                    preview
                      ? "border-sky-300 bg-slate-50"
                      : dragging
                      ? "border-dashed border-sky-500 bg-sky-50"
                      : errors.img
                      ? "border-dashed border-red-300 bg-red-50"
                      : "border-dashed border-slate-300 bg-slate-50 hover:border-sky-500 hover:bg-sky-50/60"
                  }`}
                >
                  {preview ? (
                    <>
                      <Image
                        unoptimized
                        src={preview}
                        alt="Category preview"
                        fill
                        className="object-cover"
                      />
                      <span className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/60 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                        <FaExchangeAlt />
                        Replace
                      </span>
                    </>
                  ) : (
                    <span className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-sky-600 shadow-sm">
                        <FaCloudUploadAlt size={22} className={errors.img ? "text-red-500" : ""} />
                      </span>
                      <span className="mt-3 text-sm font-medium text-slate-800">Upload image</span>
                      <span className="mt-0.5 text-xs text-slate-500">Drag & drop or click</span>
                    </span>
                  )}

                  <input
                    id="category-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    {...register("img", {
                      required: !isEdit ? "Category image is required" : false,

                      validate: async (files) => {
                        // NO FILE
                        if (!files || !files[0]) {
                          return true;
                        }

                        const file = files[0];

                        // FILE TYPE
                        if (!ALLOWED_TYPES.includes(file.type)) {
                          return "Only JPG, PNG and WEBP allowed";
                        }

                        // FILE SIZE (the image is compressed before upload)
                        if (file.size > MAX_FILE_SIZE) {
                          return "Image size must be under 5 MB";
                        }

                        // IMAGE DIMENSIONS: between MIN_SIDE and MAX_SIDE
                        try {
                          const image = await loadImage(file);

                          if (image.width < MIN_SIDE || image.height < MIN_SIDE) {
                            return `Image is too small. Width and height must be at least ${MIN_SIDE} px. Your image is ${image.width} × ${image.height}.`;
                          }

                          if (image.width > MAX_SIDE || image.height > MAX_SIDE) {
                            return `Image is too large. Width and height must be at most ${MAX_SIDE} px. Your image is ${image.width} × ${image.height}.`;
                          }
                        } catch {
                          return "Invalid image file";
                        }

                        return true;
                      },
                    })}
                  />
                </label>

                {/* REQUIREMENTS + FILE INFO */}
                <div className="min-w-0">
                  {selectedFile ? (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <FaImage className="shrink-0 text-slate-400" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-slate-500">{formatSize(selectedFile.size)}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={removeSelectedFile}
                        aria-label="Remove selected image"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ) : isEdit && existingUrl ? (
                    <p className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-600">
                      Current image is shown. Upload a new one to replace it.
                    </p>
                  ) : null}

                  {errors.img && (
                    <p
                      data-error="true"
                      className="mt-3 flex items-start gap-1 text-xs font-medium text-red-600"
                    >
                      <span>⚠</span> {errors.img.message}
                    </p>
                  )}

                  <ul className="mt-4 space-y-2 text-[13px] text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                      JPG, PNG or WEBP, up to 5 MB
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                      Width and height between {MIN_SIDE} and {MAX_SIDE} px
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                      Saved as {OUTPUT_SIZE} × {OUTPUT_SIZE} px
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* ───────────── RIGHT: STICKY PREVIEW ───────────── */}
          <aside className="xl:sticky xl:top-6">
            <Card
              icon={<MdViewAgenda size={18} />}
              title="Store preview"
              right={
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Live
                </span>
              }
            >
              <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white px-4 py-8 text-center">
                {/* Same look as the circle on the store home page */}
                <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-sky-50 shadow-sm ring-1 ring-sky-100">
                  {preview ? (
                    <Image
                      unoptimized
                      src={preview}
                      alt="Store preview"
                      fill
                      className="object-contain p-3 mix-blend-multiply"
                    />
                  ) : (
                    <FaImage className="text-3xl text-sky-200" />
                  )}
                </div>

                <p
                  className={`mt-4 line-clamp-2 break-words text-sm font-medium ${
                    watchedName.trim() ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {watchedName.trim() || "Category name"}
                </p>
              </div>

              {/* CHECKLIST */}
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">Completeness</span>
                  <span className="tabular-nums text-slate-500">{doneCount}/2</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-blue-red transition-all duration-300"
                    style={{ width: `${(doneCount / 2) * 100}%` }}
                  />
                </div>

                <ul className="mt-4 space-y-2 text-sm">
                  <li
                    className={`flex items-center gap-2.5 ${
                      hasName ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {hasName ? <FaCheckCircle className="text-emerald-500" /> : <FaRegCircle />}
                    Name added
                  </li>
                  <li
                    className={`flex items-center gap-2.5 ${
                      hasImage ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {hasImage ? <FaCheckCircle className="text-emerald-500" /> : <FaRegCircle />}
                    Image added
                  </li>
                </ul>
              </div>
            </Card>
          </aside>
        </div>

        {/* ───────────── STICKY ACTION BAR ───────────── */}
        <div className="sticky bottom-0 z-20 -mx-5 mt-8 border-t border-slate-200 bg-white/90 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="hidden text-xs text-slate-500 sm:block">
              Fields marked <span className="text-red-500">*</span> are required.
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/admin/category")}
                disabled={loading}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
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
                    {isEdit ? "Update category" : "Save category"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}