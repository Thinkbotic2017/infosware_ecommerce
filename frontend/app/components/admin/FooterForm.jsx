"use client";

import { useState, useEffect } from "react";
import api from "@/app/lib/axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaSave, FaSpinner, FaPlus, FaTimes } from "react-icons/fa";

// Inputs: light, with a soft blue focus ring
const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#0f172a] outline-none transition placeholder:text-gray-400 focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10";

// Same gradient as the Add footer button
const gradientBtn =
  "flex items-center justify-center gap-2 rounded-lg bg-gradient-blue-red text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

function Field({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionHeader({ title, onAdd, addLabel }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-semibold text-[#0f172a]">{title}</h2>
      <button type="button" onClick={onAdd} className={`${gradientBtn} px-4 py-2 text-xs`}>
        <FaPlus size={10} /> {addLabel}
      </button>
    </div>
  );
}

const emptyLink = () => ({ label: "", link: "" });
const emptySocial = () => ({ platform: "", link: "" });

export default function FooterForm({
  mode = "add",
  initialData = null,
  footerId = null,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyDescription: "",
    address: "",
    phone: "",
    email: "",
    copyright: "",
    quickLinks: [emptyLink()],
    socials: [emptySocial()],
  });

  // PREFILL EDIT DATA
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        companyDescription: initialData.companyDescription || "",
        address: initialData.address || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        copyright: initialData.copyright || "",
        quickLinks: initialData.quickLinks || [],
        socials: initialData.socials || [],
      });
    }
  }, [initialData, mode]);

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // LIST HELPERS (quickLinks / socials)
  const updateItem = (listName, index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [listName]: prev[listName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = (listName, makeItem) => {
    setFormData((prev) => ({
      ...prev,
      [listName]: [...prev[listName], makeItem()],
    }));
  };

  const removeItem = (listName, index) => {
    setFormData((prev) => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index),
    }));
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Skip rows where both boxes are empty
      const quickLinks = formData.quickLinks.filter(
        (q) => (q.label || "").trim() || (q.link || "").trim()
      );
      const socials = formData.socials.filter(
        (s) => (s.platform || "").trim() || (s.link || "").trim()
      );

      const payload = {
        ...formData,
        quickLinks: JSON.stringify(quickLinks),
        socials: JSON.stringify(socials),
      };

      if (mode === "add") {
        await api.post("api/admin/landingpage/footer", payload);
        toast.success("Footer added");
      } else {
        await api.put(`/api/admin/landingpage/footer/${footerId}`, payload);
        toast.success("Footer updated");
      }

      router.push("/admin/footer");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isAdd = mode === "add";

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0f172a]">
          {isAdd ? "Add Footer" : "Edit Footer"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          This content appears at the bottom of every page of your store.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
      >
        {/* DESCRIPTION */}
        <Field label="Company Description" htmlFor="companyDescription">
          <textarea
            id="companyDescription"
            rows={4}
            name="companyDescription"
            value={formData.companyDescription}
            onChange={handleChange}
            placeholder="Tell shoppers who you are"
            className={`${inputCls} resize-none`}
          />
        </Field>

        {/* PHONE + EMAIL */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Phone" htmlFor="phone">
            <input
              id="phone"
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputCls}
            />
          </Field>

          <Field label="Email" htmlFor="email">
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputCls}
            />
          </Field>
        </div>

        {/* ADDRESS */}
        <Field label="Address" htmlFor="address">
          <textarea
            id="address"
            rows={3}
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`${inputCls} resize-none`}
          />
        </Field>

        {/* COPYRIGHT */}
        <Field label="Copyright" htmlFor="copyright">
          <input
            id="copyright"
            type="text"
            name="copyright"
            value={formData.copyright}
            onChange={handleChange}
            placeholder={`\u00A9 2026 Your Company. All rights reserved.`}
            className={inputCls}
          />
        </Field>

        <hr className="border-gray-100" />

        {/* QUICK LINKS */}
        <div>
          <SectionHeader
            title="Quick Links"
            addLabel="Add Link"
            onAdd={() => addItem("quickLinks", emptyLink)}
          />

          {formData.quickLinks.length === 0 ? (
            <p className="text-sm text-gray-400">No links yet.</p>
          ) : (
            <div className="space-y-3">
              {formData.quickLinks.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
                  <input
                    type="text"
                    placeholder="Label"
                    value={item.label || ""}
                    onChange={(e) => updateItem("quickLinks", index, "label", e.target.value)}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    placeholder="Link"
                    value={item.link || ""}
                    onChange={(e) => updateItem("quickLinks", index, "link", e.target.value)}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem("quickLinks", index)}
                    aria-label="Remove link"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SOCIALS */}
        <div>
          <SectionHeader
            title="Social Links"
            addLabel="Add Social"
            onAdd={() => addItem("socials", emptySocial)}
          />

          {formData.socials.length === 0 ? (
            <p className="text-sm text-gray-400">No social links yet.</p>
          ) : (
            <div className="space-y-3">
              {formData.socials.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
                  <input
                    type="text"
                    placeholder="Platform"
                    value={item.platform || ""}
                    onChange={(e) => updateItem("socials", index, "platform", e.target.value)}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    placeholder="Link"
                    value={item.link || ""}
                    onChange={(e) => updateItem("socials", index, "link", e.target.value)}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem("socials", index)}
                    aria-label="Remove social link"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.push("/admin/footer")}
            disabled={loading}
            className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button type="submit" disabled={loading} className={`${gradientBtn} px-8 py-2.5`}>
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FaSave />
                {isAdd ? "Add Footer" : "Update Footer"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}