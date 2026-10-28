"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaMapMarkerAlt, FaPlus, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/lib/axios";
import AddressList from "@/app/components/AddressList";

const inputCls =
  "w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 outline-none transition";

const COMPARE_FIELDS = ["fullName", "mobile", "address", "street", "city", "state", "zipCode"];

const keyOf = (a) =>
  COMPARE_FIELDS.map((f) => String(a[f] ?? "").trim().toLowerCase()).join("|");

// Merge identical records into one card
const groupAddresses = (list) => {
  const map = new Map();
  list.forEach((a) => {
    const k = keyOf(a);
    if (map.has(k)) map.get(k).ids.push(a.id);
    else map.set(k, { ...a, ids: [a.id] });
  });
  return [...map.values()];
};

const FIELD_DEFS = [
  {
    key: "fullName", label: "Full Name", what: "Full name", placeholder: "John Doe",
    pattern: /^[A-Za-z ]+$/, patternMsg: "Only letters allowed", minLength: 2, minMsg: "Minimum 2 characters",
  },
  {
    key: "mobile", label: "Mobile Number", what: "Mobile number", placeholder: "10-digit number",
    digits: 10, pattern: /^[0-9]{10}$/, patternMsg: "Mobile must be 10 digits",
  },
  {
    key: "address", label: "Complete Address", what: "Address", placeholder: "House/Flat No., Building Name",
    span: true, minLength: 5, minMsg: "Address too short",
  },
  { key: "street", label: "Street / Area", what: "Street", placeholder: "Street / Area Name" },
  {
    key: "city", label: "City", what: "City", placeholder: "City",
    pattern: /^[A-Za-z ]+$/, patternMsg: "Invalid city name",
  },
  {
    key: "state", label: "State", what: "State", placeholder: "State",
    pattern: /^[A-Za-z ]+$/, patternMsg: "Invalid state name",
  },
  {
    key: "zipCode", label: "PIN Code", what: "PIN code", placeholder: "000000",
    digits: 6, pattern: /^[0-9]{6}$/, patternMsg: "PIN code must be 6 digits",
  },
];

export default function ManageAddress() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const [addresses, setAddresses] = useState([]); // raw records
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "", mobile: "", address: "", street: "", city: "", state: "", zipCode: "",
    },
  });

  const uniqueAddresses = useMemo(() => groupAddresses(addresses), [addresses]);

  const currentSelected = uniqueAddresses.some((a) => a.ids[0] === selectedId)
    ? selectedId
    : uniqueAddresses[0]?.ids[0] || null;

  const fetchAddresses = async () => {
    if (!userId) return [];
    try {
      const response = await api.get(`/api/user/addresses/${userId}`);
      const formatted = (Array.isArray(response.data) ? response.data : []).map((addr) => ({
        id: addr._id,
        fullName: addr.fullName,
        mobile: addr.mobile,
        address: addr.address,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode,
      }));
      setAddresses(formatted);
      return formatted;
    } catch (error) {
      console.log(error);
      toast.error("Failed to load addresses");
      setAddresses([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const closeModal = () => {
    if (saving) return;
    reset();
    setModalOpen(false);
  };

  // Close with Escape + lock page scroll while the popup is open
  useEffect(() => {
    if (!modalOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape" && !saving) {
        reset();
        setModalOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [modalOpen, saving, reset]);

  /* ── Save ONE address ── */
  const onSubmitAddress = async (data) => {
    if (saving) return;
    setSaving(true);
    try {
      const previousIds = new Set(addresses.map((a) => a.id));

      await api.post(`/api/user/addresses`, {
        userId,
        type: "Shipping", // kept so your existing backend enum accepts it
        fullName: data.fullName,
        mobile: data.mobile,
        address: data.address,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      });

      toast.success("Address saved successfully");
      reset();
      setModalOpen(false);

      const fresh = await fetchAddresses();
      const added = fresh.find((a) => !previousIds.has(a.id));
      if (added) {
        const card = groupAddresses(fresh).find((c) => c.ids.includes(added.id));
        setSelectedId(card ? card.ids[0] : added.id);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleted = (ids) => {
    setAddresses((prev) => prev.filter((a) => !ids.includes(a.id)));
    if (ids.includes(selectedId)) setSelectedId(null);
  };

  const handleUpdated = (ids, payload) => {
    setAddresses((prev) => prev.map((a) => (ids.includes(a.id) ? { ...a, ...payload } : a)));
  };

  const AddButton = (
    <button
      type="button"
      onClick={() => setModalOpen(true)}
      className="px-6 py-3 bg-gradient-blue-red text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
    >
      <FaPlus /> Add New Address
    </button>
  );

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Manage Addresses</h1>
          <p className="text-gray-500 text-sm mt-1">
            {uniqueAddresses.length > 0
              ? `${uniqueAddresses.length} saved ${
                  uniqueAddresses.length === 1 ? "address" : "addresses"
                }`
              : "Add, edit and manage your saved addresses"}
          </p>
        </div>

        {uniqueAddresses.length > 0 && AddButton}
      </div>

      {/* BODY */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500">
          Loading addresses...
        </div>
      ) : uniqueAddresses.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <FaMapMarkerAlt className="text-2xl" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No Address Available</h3>
          <p className="text-gray-500 text-sm mb-6">
            Add your first address to continue shopping.
          </p>
          <div className="flex justify-center">{AddButton}</div>
        </div>
      ) : (
        <AddressList
          addresses={uniqueAddresses}
          selectedId={currentSelected}
          onSelect={setSelectedId}
          onDeleted={handleDeleted}
          onUpdated={handleUpdated}
          radioName="manageAddress"
          accent="blue"
        />
      )}

      {/* ADD ADDRESS POPUP */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="Add new address"
        >
          <div
            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Add New Address</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Fields marked * are required
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal body + footer */}
            <form
              onSubmit={handleSubmit(onSubmitAddress)}
              className="flex flex-col min-h-0"
            >
              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {FIELD_DEFS.map((def) => {
                    const rules = {
                      setValueAs: (v) =>
                        typeof v === "string" ? v.replace(/^\s+/, "") : v,
                      required: `${def.what} is required`,
                    };
                    if (def.pattern)
                      rules.pattern = { value: def.pattern, message: def.patternMsg };
                    if (def.minLength)
                      rules.minLength = { value: def.minLength, message: def.minMsg };

                    return (
                      <div key={def.key} className={def.span ? "md:col-span-2" : ""}>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          {def.label} *
                        </label>
                        <input
                          type="text"
                          maxLength={def.digits}
                          onInput={(e) => {
                            e.target.value = def.digits
                              ? e.target.value.replace(/\D/g, "").slice(0, def.digits)
                              : e.target.value.replace(/^\s+/, "");
                          }}
                          {...register(def.key, rules)}
                          placeholder={def.placeholder}
                          className={inputCls}
                        />
                        {errors[def.key] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[def.key].message}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-blue-red text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}