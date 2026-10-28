"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  FaPlus,
  FaMinus,
  FaCloudUploadAlt,
  FaPalette,
  FaTimes,
  FaChevronDown,
  FaArrowLeft,
  FaImage,
  FaCheckCircle,
  FaRegCircle,
} from "react-icons/fa";
import { MdInventory, MdLocalOffer, MdVerified, MdInfo, MdSearch } from "react-icons/md";
import toast from "react-hot-toast";
import api, { BASE_URL } from "@/app/lib/axios";

// ─── Constants ───────────────────────────────────────────────────────────────
// Any file size and any pixel width/height is allowed
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXT_RE = /\.(jpe?g|png|webp)$/i;

// SEO limits
const SEO_TITLE_MAX = 60;
const SEO_DESC_MAX = 160;
const SEO_KW_MAX = 255;

// ─── Theme classes (light) ───────────────────────────────────────────────────
const inputLayout =
  "w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4";
const inputCls = `${inputLayout} border-slate-300 bg-white text-slate-900 focus:border-sky-500 focus:ring-sky-500/15`;
const inputErrCls = `${inputLayout} border-red-400 bg-red-50 text-slate-900 focus:border-red-500 focus:ring-red-500/15`;
const inputReadonlyCls = `${inputLayout} cursor-not-allowed border-emerald-200 bg-emerald-50 font-semibold text-emerald-700`;
const textareaCls = `${inputCls} min-h-[96px] resize-y`;
const textareaErrCls = `${inputErrCls} min-h-[96px] resize-y`;

const emptyKV = () => ({ key: "", value: "" });

const formatINR = (n) => Number(n).toLocaleString("en-IN");

// Validate a single image File — returns true or an error string.
// Checks type and that the file is a real image. No size or pixel limits.
const validateImageFile = (file) =>
  new Promise((resolve) => {
    if (!ALLOWED_MIME.includes(file.type) || !ALLOWED_EXT_RE.test(file.name)) {
      return resolve("Only JPG, PNG, or WEBP files are allowed.");
    }

    // Make sure the file can actually be opened as an image
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(true);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve("Invalid or corrupt image file.");
    };
    img.src = objectUrl;
  });

// ─── Sub-components ──────────────────────────────────────────────────────────
function Section({ icon, title, subtitle, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            {icon}
          </span>
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        <FaChevronDown
          className={`text-xs text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && <div className="border-t border-slate-100 p-6">{children}</div>}
    </section>
  );
}

function Field({ label, required, error, children, hint, charCount }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-medium text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {charCount !== undefined && (
            <span
              className={`text-xs tabular-nums ${
                charCount.over ? "font-semibold text-red-600" : "text-slate-400"
              }`}
            >
              {charCount.current}/{charCount.max}
            </span>
          )}
        </div>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && (
        <p data-error="true" className="flex items-center gap-1 text-xs font-medium text-red-600">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// Returns { current, max, over } for the character counter
function getCount(value = "", max) {
  const current = (value || "").length;
  return { current, max, over: current > max };
}

function KVEditor({ field, data, onChange, onAdd, onRemove, errors: kvErrors = {} }) {
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="flex flex-1 flex-col gap-1">
            <input
              type="text"
              name="key"
              value={item.key}
              onChange={(e) => onChange(e, index, field)}
              placeholder="Name"
              className={kvErrors[`${field}_${index}_key`] ? inputErrCls : inputCls}
            />
            {kvErrors[`${field}_${index}_key`] && (
              <p data-error="true" className="text-xs text-red-600">
                ⚠ {kvErrors[`${field}_${index}_key`]}
              </p>
            )}
          </div>

          <div className="flex flex-[2] flex-col gap-1">
            <input
              type="text"
              name="value"
              value={item.value}
              onChange={(e) => onChange(e, index, field)}
              placeholder="Value"
              className={kvErrors[`${field}_${index}_value`] ? inputErrCls : inputCls}
            />
            {kvErrors[`${field}_${index}_value`] && (
              <p data-error="true" className="text-xs text-red-600">
                ⚠ {kvErrors[`${field}_${index}_value`]}
              </p>
            )}
          </div>

          <div className="flex gap-1.5 pt-0.5">
            {index === data.length - 1 && (
              <button
                type="button"
                onClick={() => onAdd(field)}
                aria-label="Add row"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 transition hover:bg-sky-100"
              >
                <FaPlus size={11} />
              </button>
            )}
            {index > 0 && (
              <button
                type="button"
                onClick={() => onRemove(index, field)}
                aria-label="Remove row"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
              >
                <FaMinus size={11} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SideCard({ icon, title, right, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            {icon}
          </span>
          <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
        </div>
        {right}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductForm({ mode = "add", productId, initialData, onSuccess }) {
  const router = useRouter();

  const isEdit = mode === "edit";
  const isDuplicate = mode === "duplicate";

  const pageTitle = isEdit ? "Edit product" : isDuplicate ? "Duplicate product" : "Add product";
  const pageSubtitle = isEdit
    ? "Update the product details below."
    : isDuplicate
    ? "A copy of the original. Modify it as needed."
    : "Fill in the details to list a new product.";
  const submitLabel = isEdit ? "Update product" : isDuplicate ? "Save as new product" : "Save product";

  // ── react-hook-form ─────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm({
    defaultValues: initialData
      ? {
          name: initialData.name || "",
          Brand: initialData.Brand || "",
          category: initialData.category || "",
          subCategory: initialData.subCategory || "",
          stock: initialData.stock ?? "",
          oldPrice: initialData.oldPrice ?? "",
          price: initialData.price ?? "",
          gst: initialData.gst ?? "",
          descriptions: initialData.descriptions || "",
          productDescription: initialData.productDescription || "",
        }
      : {},
  });

  const safeKV = (arr) => (Array.isArray(arr) && arr.length ? arr : [emptyKV()]);

  const [formData, setFormData] = useState({
    discount: initialData?.discount || "",
    priceAlert: initialData?.priceAlert || "",
    stock: initialData?.stock ?? "",
    img: null,
    imageUrl: "",
    specifications: safeKV(initialData?.specifications),
    warranty: safeKV(initialData?.warranty),
    otherinfo: safeKV(initialData?.otherinfo),
    otherinfoText: initialData?.otherinfoText || "",
    offers: safeKV(initialData?.offers),
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    metaKeywords: initialData?.metaKeywords || "",
  });

  const [existingImgUrl, setExistingImgUrl] = useState(
    initialData?.img ? `${BASE_URL}/${initialData.img}` : null
  );
  const [mainImagePreview, setMainImagePreview] = useState(null);

  const [colorImages, setColorImages] = useState(
    initialData?.colorVariants?.length
      ? initialData.colorVariants.map((cv) => ({
          color: cv.color || "",
          images: [],
          previews: cv.images || [],
          existing: cv.images || [],
        }))
      : [{ color: "", images: [], previews: [], existing: [] }]
  );

  const [isSingleImage, setIsSingleImage] = useState(false);
  const [isColorWise, setIsColorWise] = useState(false);

  // ── custom validation error maps (for non-RHF fields) ─────────────────
  const [kvErrors, setKvErrors] = useState({});
  const [colorErrors, setColorErrors] = useState({});
  const [imageError, setImageError] = useState("");

  // ── auto-calculate discount ────────────────────────────────────────────
  const watchPrice = watch("price");
  const watchOldPrice = watch("oldPrice");

  useEffect(() => {
    const price = parseFloat(watchPrice);
    const oldPrice = parseFloat(watchOldPrice);
    if (oldPrice > 0 && price > 0 && oldPrice > price) {
      setFormData((prev) => ({
        ...prev,
        discount: Math.round(((oldPrice - price) / oldPrice) * 100).toString(),
      }));
    } else {
      setFormData((prev) => ({ ...prev, discount: "" }));
    }
  }, [watchPrice, watchOldPrice]);

  // ── handlers ──────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e, index, field) => {
    const { name, value } = e.target;
    const updated = [...formData[field]];
    updated[index][name] = value;
    setFormData({ ...formData, [field]: updated });
    // Clear error on change
    const errKey = `${field}_${index}_${name}`;
    if (kvErrors[errKey])
      setKvErrors((prev) => {
        const n = { ...prev };
        delete n[errKey];
        return n;
      });
  };

  const handleAddField = (field) =>
    setFormData({ ...formData, [field]: [...formData[field], emptyKV()] });
  const handleRemoveField = (index, field) =>
    setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setIsSingleImage(false);
      setMainImagePreview(null);
      return;
    }
    const result = await validateImageFile(file);
    if (result !== true) {
      setImageError(result);
      return;
    }
    setImageError("");
    setIsSingleImage(true);
    setIsColorWise(false);
    const url = URL.createObjectURL(file);
    setMainImagePreview(url);
    setExistingImgUrl(null);
    setFormData((prev) => ({ ...prev, img: file, imageUrl: url }));
  };

  const handleColorImageChange = async (idx, field, value) => {
    const updated = [...colorImages];
    if (field === "images") {
      const files = Array.from(value);
      const errMap = { ...colorErrors };

      // Validate each file
      const validations = await Promise.all(files.map((f) => validateImageFile(f)));
      const badIdx = validations.findIndex((r) => r !== true);
      if (badIdx !== -1) {
        errMap[`color_${idx}_images`] = validations[badIdx];
        setColorErrors(errMap);
        return;
      }
      delete errMap[`color_${idx}_images`];
      setColorErrors(errMap);

      updated[idx].images = files;
      updated[idx].previews = [
        ...updated[idx].existing,
        ...files.map((f) => URL.createObjectURL(f)),
      ];
      const anySelected = updated.some((ci) => ci.images.length > 0);
      setIsColorWise(anySelected);
      if (anySelected) setIsSingleImage(false);
    } else {
      updated[idx][field] = value;
      if (colorErrors[`color_${idx}_color`]) {
        setColorErrors((prev) => {
          const n = { ...prev };
          delete n[`color_${idx}_color`];
          return n;
        });
      }
    }
    setColorImages(updated);
  };

  // ── Validate non-RHF sections ─────────────────────────────────────────
  /**
   * Returns { isValid: bool, summary: string[] }
   */
  const validateCustomSections = async () => {
    const newKvErrors = {};
    const newColorErrors = {};
    const summary = [];

    // ── Image ──────────────────────────────────────────────────────────
    const needsImage = !isEdit && !isDuplicate && !existingImgUrl && !isColorWise;
    if (needsImage && !formData.img) {
      setImageError("Main product image is required.");
      summary.push("Main product image is required.");
    } else if (formData.img) {
      const imgResult = await validateImageFile(formData.img);
      if (imgResult !== true) {
        setImageError(imgResult);
        summary.push(`Image: ${imgResult}`);
      } else {
        setImageError("");
      }
    }

    // ── Color variants ────────────────────────────────────────────────
    colorImages.forEach((ci, idx) => {
      if (ci.images.length > 0 && !ci.color.trim()) {
        newColorErrors[`color_${idx}_color`] = "Color name is required when images are uploaded.";
        summary.push(`Color Variant ${idx + 1}: Color name is required.`);
      }
      if (ci.color.trim() && ci.images.length === 0 && !ci.existing?.length) {
        newColorErrors[`color_${idx}_images`] = "Please upload at least one image for this color.";
        summary.push(`Color Variant ${idx + 1}: At least one image is required.`);
      }
    });

    // ── KV editors — check for orphaned keys (key without value) ──────
    ["specifications", "warranty", "otherinfo", "offers"].forEach((section) => {
      formData[section].forEach((item, idx) => {
        if (item.key.trim() && !item.value.trim()) {
          newKvErrors[`${section}_${idx}_value`] = "Value is required when key is set.";
          summary.push(
            `${section.charAt(0).toUpperCase() + section.slice(1)} row ${idx + 1}: Value missing.`
          );
        }
        if (!item.key.trim() && item.value.trim()) {
          newKvErrors[`${section}_${idx}_key`] = "Key is required when value is set.";
          summary.push(
            `${section.charAt(0).toUpperCase() + section.slice(1)} row ${idx + 1}: Key missing.`
          );
        }
      });
    });

    // ── SEO character limits ──────────────────────────────────────────
    if (formData.metaTitle.length > SEO_TITLE_MAX) {
      summary.push(`SEO Title exceeds ${SEO_TITLE_MAX} characters.`);
    }
    if (formData.metaDescription.length > SEO_DESC_MAX) {
      summary.push(`SEO Description exceeds ${SEO_DESC_MAX} characters.`);
    }
    if (formData.metaKeywords.length > SEO_KW_MAX) {
      summary.push(`SEO Keywords exceeds ${SEO_KW_MAX} characters.`);
    }

    setKvErrors(newKvErrors);
    setColorErrors(newColorErrors);

    const isValid =
      summary.length === 0 &&
      Object.keys(newKvErrors).length === 0 &&
      Object.keys(newColorErrors).length === 0;

    return { isValid, summary };
  };

  // ── submit ─────────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    // 1. Trigger RHF validation
    const rhfValid = await trigger();

    // 2. Validate custom sections
    const { isValid: customValid, summary } = await validateCustomSections();

    if (!rhfValid || !customValid) {
      // Scroll to first visible error
      setTimeout(() => {
        const firstErr = document.querySelector("[data-error='true']");
        if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);

      // Toast summary
      const rhfMessages = Object.values(errors)
        .map((e) => e?.message)
        .filter(Boolean);
      const allMessages = [...rhfMessages, ...summary];
      const unique = [...new Set(allMessages)];

      if (unique.length === 1) {
        toast.error(unique[0]);
      } else if (unique.length > 0) {
        toast.error(
          <div className="text-sm">
            <p className="mb-1 font-semibold">
              Please fix {unique.length} error{unique.length > 1 ? "s" : ""}:
            </p>
            <ul className="list-inside list-disc space-y-0.5 text-xs">
              {unique.slice(0, 5).map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
              {unique.length > 5 && <li className="text-gray-400">…and {unique.length - 5} more</li>}
            </ul>
          </div>,
          { duration: 6000 }
        );
      }
      return;
    }

    const merged = { ...formData, ...data };
    const fd = new FormData();

    // Fields that map to Number in the Mongoose schema — never send "" for these
    const NUMBER_FIELDS = new Set([
      "price",
      "oldPrice",
      "gst",
      "stock",
      "discount",
      "rating",
      "ratingCount",
      "ratingTotal",
    ]);
    const SKIP_KEYS = new Set(["images", "imagesPreview", "imageUrl"]);

    Object.entries(merged).forEach(([key, value]) => {
      // ── Main image ──
      if (key === "img") {
        if (formData.img) {
          // New image selected
          fd.append("img", formData.img);
        } else if (existingImgUrl) {
          // Edit / duplicate: keep the existing image
          fd.append("existingImg", initialData?.img);
        }
        return;
      }

      if (SKIP_KEYS.has(key)) return;

      // ── Key/value arrays: drop empty rows before sending ──
      if (Array.isArray(value) && value.length && typeof value[0] === "object") {
        const cleaned = value.filter((r) => r.key?.trim() && r.value?.trim());
        fd.append(key, JSON.stringify(cleaned));
        return;
      }

      // ── Number fields: only send valid numbers ──
      if (NUMBER_FIELDS.has(key)) {
        const num = Number(value);
        if (value !== "" && value !== null && value !== undefined && !isNaN(num)) {
          fd.append(key, num);
        }
        return;
      }

      // ── All other fields — send as-is (empty string is fine for text fields) ──
      fd.append(key, value ?? "");
    });

    // ── Color variants: names, images and counts must line up ──
    const activeColors = colorImages.filter((ci) => ci.color.trim());

    activeColors.forEach(({ color, images, existing }) => {
      images.forEach((imgFile) => fd.append("colorImages", imgFile));
      fd.append("colorNames", color.trim());
      fd.append("existingColorImages", JSON.stringify(existing));
    });

    if (activeColors.length) {
      fd.append("colorImageCounts", JSON.stringify(activeColors.map((ci) => ci.images.length)));
    }

    try {
      if (isEdit) {
        await api.put(`/api/admin/productpage/${productId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        });
        toast.success("Product updated successfully!");
      } else {
        await api.post("/api/admin/productpage", fd, {
          headers: { "Content-Type": "multipart/form-data" },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        });
        toast.success(isDuplicate ? "Product duplicated successfully!" : "Product added successfully!");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/products");
      }

      if (!isEdit) {
        reset();
        setFormData({
          discount: "",
          priceAlert: "",
          stock: "",
          img: null,
          imageUrl: "",
          otherinfoText: "",
          specifications: [emptyKV()],
          warranty: [emptyKV()],
          otherinfo: [emptyKV()],
          offers: [emptyKV()],
          metaTitle: "",
          metaDescription: "",
          metaKeywords: "",
        });
        setColorImages([{ color: "", images: [], previews: [], existing: [] }]);
        setMainImagePreview(null);
        setExistingImgUrl(null);
        setKvErrors({});
        setColorErrors({});
        setImageError("");
      }
    } catch (err) {
      console.error("Save product error:", err.response?.data || err);
      toast.error(
        err.response?.data?.message ||
          (isEdit ? "Failed to update product." : "Failed to save product.")
      );
    }
  };

  const shownImage = mainImagePreview || existingImgUrl;

  // ── live values for the preview card and checklist ─────────────────────
  const values = watch();
  const previewPrice = Number(watchPrice) || 0;
  const previewOldPrice = Number(watchOldPrice) || 0;

  const checklist = [
    { label: "Product name", done: (values.name || "").trim().length >= 2 },
    { label: "Category", done: (values.category || "").trim().length >= 2 },
    { label: "Sub-category", done: (values.subCategory || "").trim().length >= 2 },
    { label: "Selling price", done: previewPrice > 0 },
    { label: "GST", done: values.gst !== "" && values.gst !== undefined && !isNaN(Number(values.gst)) },
    { label: "Stock", done: values.stock !== "" && values.stock !== undefined && !isNaN(Number(values.stock)) },
    { label: "Product image", done: Boolean(shownImage) || isColorWise },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const progress = Math.round((doneCount / checklist.length) * 100);

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen rounded-2xl bg-slate-50 p-5 sm:p-8">
      {/* ───────────── HEADER ───────────── */}
      <div className="mb-8 flex items-start gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
        >
          <FaArrowLeft className="text-sm" />
        </button>

        <div>
          <nav className="mb-1 text-xs text-slate-500">
            <span>Products</span>
            <span className="mx-1.5">/</span>
            <span className="font-medium text-slate-700">
              {isEdit ? "Edit" : isDuplicate ? "Duplicate" : "New"}
            </span>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{pageTitle}</h1>
            {isDuplicate && (
              <span className="rounded-md bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
                Duplicate
              </span>
            )}
            {isEdit && (
              <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                Editing
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">{pageSubtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ───────────── NOTICES ───────────── */}
        {isEdit && initialData?.catalogStatus === "draft" && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Unpublished draft, not for sale</p>
            {initialData.estimatedPriceMin != null && initialData.estimatedPriceMax != null && (
              <p className="mt-1">
                Visual category estimate: ₹{initialData.estimatedPriceMin}–₹
                {initialData.estimatedPriceMax}.
              </p>
            )}
            <p className="mt-1">
              {initialData.estimateNote || "This range is not a verified selling price."} Confirm the
              exact model, product details, selling price, and stock before saving a completed
              listing. Saving a valid listing publishes it.
            </p>
          </div>
        )}
        {isEdit && initialData?.isPlaceholder && initialData?.catalogStatus !== "draft" && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            This is a temporary image preview. Enter the verified product name, category, positive
            price, and stock, then save to publish it as a normal listing.
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
          {/* ───────────── LEFT (2/3) ───────────── */}
          <div className="space-y-6 xl:col-span-2">
            {/* Basic Info */}
            <Section
              icon={<MdInventory size={18} />}
              title="Basic information"
              subtitle="Name, brand, category and descriptions"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field label="Product name" required error={errors.name?.message}>
                    <input
                      type="text"
                      placeholder="e.g. Sony WH-1000XM5"
                      className={errors.name ? inputErrCls : inputCls}
                      {...register("name", {
                        required: "Product name is required",
                        minLength: { value: 2, message: "Minimum 2 characters required" },
                        maxLength: { value: 200, message: "Maximum 200 characters allowed" },
                        validate: (v) => v.trim().length > 0 || "Name cannot contain only spaces",
                      })}
                    />
                  </Field>
                </div>

                <Field label="Brand" error={errors.Brand?.message}>
                  <input
                    type="text"
                    placeholder="e.g. Sony"
                    className={errors.Brand ? inputErrCls : inputCls}
                    {...register("Brand", {
                      minLength: { value: 2, message: "Brand name too short" },
                      maxLength: { value: 100, message: "Brand name too long" },
                      validate: (v) => !v || v.trim().length > 0 || "Invalid brand",
                    })}
                  />
                </Field>

                <Field label="Category" required error={errors.category?.message}>
                  <input
                    type="text"
                    placeholder="e.g. Electronics"
                    className={errors.category ? inputErrCls : inputCls}
                    {...register("category", {
                      required: "Category is required",
                      minLength: { value: 2, message: "Category too short" },
                      maxLength: { value: 100, message: "Category too long" },
                      validate: (v) => v.trim().length > 0 || "Invalid category",
                    })}
                  />
                </Field>

                <Field label="Sub-category" required error={errors.subCategory?.message}>
                  <input
                    type="text"
                    placeholder="e.g. Headphones"
                    className={errors.subCategory ? inputErrCls : inputCls}
                    {...register("subCategory", {
                      required: "Sub-category is required",
                      minLength: { value: 2, message: "Sub-category too short" },
                      maxLength: { value: 100, message: "Sub-category too long" },
                      validate: (v) => v.trim().length > 0 || "Invalid sub-category",
                    })}
                  />
                </Field>

                <Field label="Stock" required error={errors.stock?.message}>
                  <input
                    type="number"
                    placeholder="0"
                    className={errors.stock ? inputErrCls : inputCls}
                    {...register("stock", {
                      required: "Stock is required",
                      min: { value: 0, message: "Stock cannot be negative" },
                      max: { value: 999999, message: "Stock value too large" },
                      validate: (v) => !isNaN(v) || "Invalid stock value",
                    })}
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field
                    label="Short description"
                    error={errors.descriptions?.message}
                    charCount={getCount(watch("descriptions"), 500)}
                  >
                    <textarea
                      placeholder="A brief summary shown on product cards..."
                      className={errors.descriptions ? textareaErrCls : textareaCls}
                      {...register("descriptions", {
                        maxLength: { value: 500, message: "Short description exceeds 500 characters" },
                        validate: (v) => !v || v.trim().length > 0 || "Invalid description",
                      })}
                    />
                  </Field>
                </div>

                <div className="md:col-span-2">
                  <Field
                    label="Detailed product description"
                    error={errors.productDescription?.message}
                    charCount={getCount(watch("productDescription"), 3000)}
                  >
                    <textarea
                      placeholder="Full product description..."
                      className={`${
                        errors.productDescription ? textareaErrCls : textareaCls
                      } min-h-[140px]`}
                      {...register("productDescription", {
                        maxLength: {
                          value: 3000,
                          message: "Detailed description exceeds 3000 characters",
                        },
                        validate: (v) => !v || v.trim().length > 0 || "Invalid description",
                      })}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* Pricing */}
            <Section
              icon={<MdLocalOffer size={18} />}
              title="Pricing & GST"
              subtitle="MRP, selling price, discount and tax"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Old price (MRP)" error={errors.oldPrice?.message}>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className={`${errors.oldPrice ? inputErrCls : inputCls} pl-8`}
                      {...register("oldPrice", {
                        min: { value: 0, message: "Old price cannot be negative" },
                        max: { value: 10_000_000, message: "Price value too large" },
                        validate: (v) => !isNaN(v) || "Invalid price",
                      })}
                    />
                  </div>
                </Field>

                <Field label="Selling price" required error={errors.price?.message}>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className={`${errors.price ? inputErrCls : inputCls} pl-8`}
                      {...register("price", {
                        required: "Selling price is required",
                        min: { value: 1, message: "Price must be greater than 0" },
                        max: { value: 10_000_000, message: "Price value too large" },
                        validate: (v) => {
                          if (isNaN(v)) return "Invalid price";
                          const old = Number(watchOldPrice);
                          if (old && Number(v) > old) return "Selling price cannot exceed MRP";
                          return true;
                        },
                      })}
                    />
                  </div>
                  {watchPrice && !isNaN(Number(watchPrice)) && (
                    <p className="mt-1 text-xs font-semibold text-emerald-600">
                      You receive: ₹{(Number(watchPrice) * 0.97).toFixed(2)} (after 3% fee)
                    </p>
                  )}
                </Field>

                <Field label="Discount (%)">
                  <input
                    type="text"
                    readOnly
                    value={formData.discount ? `${formData.discount}% OFF` : ""}
                    placeholder="Auto-calculated"
                    className={inputReadonlyCls}
                  />
                </Field>

                <Field label="GST (%)" required error={errors.gst?.message}>
                  <input
                    type="number"
                    placeholder="e.g. 18"
                    className={errors.gst ? inputErrCls : inputCls}
                    {...register("gst", {
                      required: "GST is required",
                      min: { value: 0, message: "GST cannot be negative" },
                      max: { value: 100, message: "GST cannot exceed 100%" },
                      validate: (v) => !isNaN(v) || "Invalid GST value",
                    })}
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field label="Price alert" hint="Short promotional text shown near the price">
                    <input
                      type="text"
                      name="priceAlert"
                      value={formData.priceAlert}
                      onChange={handleInputChange}
                      placeholder="e.g. Limited time offer!"
                      maxLength={100}
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* Specifications */}
            <Section
              icon={<MdVerified size={18} />}
              title="Specifications"
              subtitle="Technical details shown on the product page"
            >
              <KVEditor
                field="specifications"
                data={formData.specifications}
                onChange={handleArrayChange}
                onAdd={handleAddField}
                onRemove={handleRemoveField}
                errors={kvErrors}
              />
            </Section>

            {/* Warranty */}
            <Section
              icon={<MdVerified size={18} />}
              title="Warranty"
              subtitle="Coverage period and terms"
            >
              <KVEditor
                field="warranty"
                data={formData.warranty}
                onChange={handleArrayChange}
                onAdd={handleAddField}
                onRemove={handleRemoveField}
                errors={kvErrors}
              />
            </Section>

            {/* Other Info */}
            <Section
              icon={<MdInfo size={18} />}
              title="Other information"
              subtitle="Extra details and notes"
              defaultOpen={false}
            >
              <div className="space-y-5">
                <KVEditor
                  field="otherinfo"
                  data={formData.otherinfo}
                  onChange={handleArrayChange}
                  onAdd={handleAddField}
                  onRemove={handleRemoveField}
                  errors={kvErrors}
                />
                <Field label="Plain text info">
                  <textarea
                    name="otherinfoText"
                    value={formData.otherinfoText}
                    onChange={handleInputChange}
                    placeholder="Any additional info..."
                    maxLength={1000}
                    className={textareaCls}
                  />
                </Field>
              </div>
            </Section>

            {/* Offers */}
            <Section
              icon={<MdLocalOffer size={18} />}
              title="Offers & deals"
              subtitle="Bank offers, exchange offers and more"
              defaultOpen={false}
            >
              <KVEditor
                field="offers"
                data={formData.offers}
                onChange={handleArrayChange}
                onAdd={handleAddField}
                onRemove={handleRemoveField}
                errors={kvErrors}
              />
            </Section>

            {/* SEO */}
            <Section
              icon={<MdSearch size={18} />}
              title="SEO settings"
              subtitle="How this product appears in search engines"
              defaultOpen={false}
            >
              <div className="space-y-5">
                <Field
                  label="SEO title"
                  hint={`Recommended: 50–${SEO_TITLE_MAX} characters`}
                  error={
                    formData.metaTitle.length > SEO_TITLE_MAX
                      ? `Exceeds ${SEO_TITLE_MAX} character limit`
                      : undefined
                  }
                  charCount={getCount(formData.metaTitle, SEO_TITLE_MAX)}
                >
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    placeholder="Page title for search engines"
                    className={formData.metaTitle.length > SEO_TITLE_MAX ? inputErrCls : inputCls}
                  />
                </Field>

                <Field
                  label="SEO description"
                  hint={`Recommended: 150–${SEO_DESC_MAX} characters`}
                  error={
                    formData.metaDescription.length > SEO_DESC_MAX
                      ? `Exceeds ${SEO_DESC_MAX} character limit`
                      : undefined
                  }
                  charCount={getCount(formData.metaDescription, SEO_DESC_MAX)}
                >
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    placeholder="Brief summary for search results..."
                    className={
                      formData.metaDescription.length > SEO_DESC_MAX ? textareaErrCls : textareaCls
                    }
                  />
                </Field>

                <Field
                  label="SEO keywords"
                  hint="Comma-separated keywords"
                  error={
                    formData.metaKeywords.length > SEO_KW_MAX
                      ? `Exceeds ${SEO_KW_MAX} character limit`
                      : undefined
                  }
                  charCount={getCount(formData.metaKeywords, SEO_KW_MAX)}
                >
                  <input
                    type="text"
                    name="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={handleInputChange}
                    placeholder="e.g. headphones, noise cancelling, sony"
                    className={formData.metaKeywords.length > SEO_KW_MAX ? inputErrCls : inputCls}
                  />
                </Field>
              </div>
            </Section>
          </div>

          {/* ───────────── RIGHT (1/3) ───────────── */}
          <div className="space-y-6">
            {/* Live preview + checklist */}
            <SideCard
              icon={<FaImage size={15} />}
              title="Listing preview"
              right={
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Live
                </span>
              }
            >
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="relative flex h-48 items-center justify-center bg-slate-50">
                  {shownImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={shownImage}
                      alt="Product preview"
                      className="h-full w-full object-contain p-3 mix-blend-multiply"
                    />
                  ) : (
                    <FaImage className="text-4xl text-slate-300" />
                  )}

                  {formData.discount && (
                    <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white">
                      {formData.discount}% OFF
                    </span>
                  )}
                </div>

                <div className="space-y-1 border-t border-slate-100 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">
                    {(values.Brand || "").trim() || (values.category || "").trim() || "Brand / category"}
                  </p>
                  <p
                    className={`line-clamp-2 text-sm font-semibold ${
                      (values.name || "").trim() ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {(values.name || "").trim() || "Product name"}
                  </p>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-lg font-bold text-slate-900">
                      {previewPrice > 0 ? `₹${formatINR(previewPrice)}` : "₹0"}
                    </span>
                    {previewOldPrice > previewPrice && previewPrice > 0 && (
                      <span className="text-sm text-slate-400 line-through">
                        ₹{formatINR(previewOldPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* CHECKLIST */}
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">Listing completeness</span>
                  <span className="tabular-nums text-slate-500">
                    {doneCount}/{checklist.length}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-blue-red transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <ul className="mt-4 space-y-2 text-sm">
                  {checklist.map((item) => (
                    <li
                      key={item.label}
                      className={`flex items-center gap-2.5 ${
                        item.done ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {item.done ? (
                        <FaCheckCircle className="text-emerald-500" />
                      ) : (
                        <FaRegCircle />
                      )}
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </SideCard>

            {/* Main Image */}
            <SideCard
              icon={<FaCloudUploadAlt size={17} />}
              title={isEdit ? "Main product image" : "Main product image *"}
            >
              <label
                htmlFor="mainImage"
                className={`flex h-56 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${
                  imageError
                    ? "border-red-300 bg-red-50"
                    : shownImage
                    ? "border-sky-300 bg-slate-50"
                    : "border-slate-300 bg-slate-50 hover:border-sky-500 hover:bg-sky-50/60"
                }`}
              >
                {shownImage ? (
                  <div className="relative h-full w-full p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={shownImage}
                      alt="Preview"
                      className="h-full w-full rounded-lg bg-white object-contain p-2"
                    />
                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={(e) => {
                        e.preventDefault();
                        setMainImagePreview(null);
                        setExistingImgUrl(null);
                        setFormData((prev) => ({ ...prev, img: null, imageUrl: "" }));
                        setValue("img", null);
                        setIsSingleImage(false);
                        setImageError("");
                      }}
                      className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600"
                    >
                      <FaTimes size={11} />
                    </button>
                    {existingImgUrl && !mainImagePreview && (
                      <span className="absolute bottom-4 left-4 rounded-md bg-slate-900/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                        Current image
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 px-4 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-sky-600 shadow-sm">
                      <FaCloudUploadAlt size={22} className={imageError ? "text-red-500" : ""} />
                    </span>
                    <p className="text-sm font-medium text-slate-800">
                      {isEdit ? "Click to replace image" : "Click to upload"}
                    </p>
                    <p className="text-xs text-slate-500">
                      PNG, JPG or WEBP · any size · any dimensions
                    </p>
                  </div>
                )}
              </label>

              <input
                id="mainImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {imageError && (
                <p
                  data-error="true"
                  className="mt-3 flex items-center gap-1 text-xs font-medium text-red-600"
                >
                  <span>⚠</span> {imageError}
                </p>
              )}
            </SideCard>

            {/* Color Variants */}
            <SideCard icon={<FaPalette size={15} />} title="Color variants">
              <div className="space-y-4">
                {colorImages.map((ci, idx) => (
                  <div
                    key={idx}
                    className={`space-y-3 rounded-xl border bg-slate-50 p-4 ${
                      colorErrors[`color_${idx}_color`] || colorErrors[`color_${idx}_images`]
                        ? "border-red-300"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Variant {idx + 1}
                      </span>
                      {colorImages.length > 1 && (
                        <button
                          type="button"
                          disabled={isSingleImage}
                          aria-label="Remove variant"
                          onClick={() => setColorImages(colorImages.filter((_, i) => i !== idx))}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100 disabled:opacity-40"
                        >
                          <FaTimes size={10} />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <input
                        type="text"
                        placeholder="Color name (e.g. Midnight Black)"
                        value={ci.color}
                        onChange={(e) => handleColorImageChange(idx, "color", e.target.value)}
                        className={colorErrors[`color_${idx}_color`] ? inputErrCls : inputCls}
                      />
                      {colorErrors[`color_${idx}_color`] && (
                        <p data-error="true" className="text-xs text-red-600">
                          ⚠ {colorErrors[`color_${idx}_color`]}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        className={`flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 text-center transition ${
                          colorErrors[`color_${idx}_images`]
                            ? "border-red-300 bg-red-50"
                            : ci.images.length
                            ? "border-sky-300 bg-white"
                            : "border-slate-300 bg-white hover:border-sky-500"
                        }`}
                      >
                        <span className="text-xs font-medium text-slate-600">
                          {ci.images.length
                            ? `${ci.images.length} new file(s) selected`
                            : ci.existing?.length
                            ? `${ci.existing.length} saved, click to add more`
                            : "Upload images (JPG/PNG/WEBP, any size)"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleColorImageChange(idx, "images", e.target.files)}
                        />
                      </label>
                      {colorErrors[`color_${idx}_images`] && (
                        <p data-error="true" className="text-xs text-red-600">
                          ⚠ {colorErrors[`color_${idx}_images`]}
                        </p>
                      )}
                    </div>

                    {ci.previews.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {ci.previews.map((src, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={i}
                            src={src.startsWith("blob:") ? src : `${BASE_URL}/${src}`}
                            alt=""
                            className="h-12 w-12 rounded-lg border border-slate-200 bg-white object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  disabled={isSingleImage}
                  onClick={() =>
                    setColorImages([
                      ...colorImages,
                      { color: "", images: [], previews: [], existing: [] },
                    ])
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-2.5 text-sm font-semibold text-sky-600 transition hover:border-sky-500 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaPlus size={11} /> Add color variant
                </button>
              </div>
            </SideCard>
          </div>
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
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-blue-red px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <FaPlus size={12} />
                )}
                {isSubmitting ? "Saving..." : submitLabel}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}