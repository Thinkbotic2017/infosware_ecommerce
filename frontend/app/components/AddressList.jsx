"use client";

import React, { useState } from "react";
import api from "../lib/axios";
import toast from "react-hot-toast";

const FIELDS = ["fullName", "mobile", "address", "street", "city", "state", "zipCode"];

/**
 * Props:
 *   addresses   - unique addresses, each with an `ids` array (see Address.jsx)
 *   selectedId  - currently selected address id (ids[0])
 *   onSelect    - (id) => void
 *   onDeleted   - (ids) => void
 *   onUpdated   - (ids, payload) => void
 *   radioName   - unique name per list ("shippingAddress" / "billingAddress")
 *   accent      - "blue" | "red"
 */
function AddressList({
    addresses,
    selectedId,
    onSelect,
    onDeleted,
    onUpdated,
    radioName = "address",
    accent = "blue",
}) {
    const [editingId, setEditingId] = useState(null);
    const [edited, setEdited] = useState({});

    const selectedStyle =
        accent === "red"
            ? "border-primary-red bg-red-50/10 shadow-sm ring-1 ring-primary-red/30"
            : "border-primary-blue bg-blue-50/10 shadow-sm ring-1 ring-primary-blue/30";

    const handleDelete = async (addr) => {
        try {
            await Promise.all(addr.ids.map((id) => api.delete(`/api/user/address/${id}`)));
            onDeleted(addr.ids);
            toast.success("Address deleted successfully");
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete address");
        }
    };

    const handleEditClick = (addr) => {
        setEditingId(addr.ids[0]);
        const values = {};
        FIELDS.forEach((f) => (values[f] = addr[f] ?? ""));
        setEdited(values);
    };

    const validate = () => {
        if (!edited.fullName?.trim()) return toast.error("Full name is required"), false;
        if (!/^[A-Za-z ]+$/.test(edited.fullName.trim()))
            return toast.error("Full name should contain only letters"), false;
        if (!edited.mobile?.trim()) return toast.error("Mobile number is required"), false;
        if (edited.mobile.trim().length !== 10)
            return toast.error("Mobile number must contain exactly 10 digits"), false;
        if (!edited.address?.trim()) return toast.error("Address is required"), false;
        if (edited.address.trim().length < 5)
            return toast.error("Address must be at least 5 characters"), false;
        if (!edited.street?.trim()) return toast.error("Street is required"), false;
        if (!edited.city?.trim()) return toast.error("City is required"), false;
        if (!/^[A-Za-z ]+$/.test(edited.city.trim())) return toast.error("Enter valid city"), false;
        if (!edited.state?.trim()) return toast.error("State is required"), false;
        if (!/^[A-Za-z ]+$/.test(edited.state.trim())) return toast.error("Enter valid state"), false;
        if (!edited.zipCode?.trim()) return toast.error("Zip code is required"), false;
        if (!/^\d{6}$/.test(edited.zipCode.trim()))
            return toast.error("Enter valid 6 digit pincode"), false;
        return true;
    };

    const handleSave = async (addr) => {
        if (!validate()) return;
        try {
            // only address fields are sent, never `type` or `id`
            const payload = {};
            FIELDS.forEach((f) => (payload[f] = String(edited[f] ?? "").trim()));

            await Promise.all(addr.ids.map((id) => api.put(`/api/user/address/${id}`, payload)));
            onUpdated(addr.ids, payload);
            setEditingId(null);
            toast.success("Address updated successfully");
        } catch (error) {
            console.log(error);
            toast.error("Failed to update address");
        }
    };

    if (addresses.length === 0) return null;

    return (
        <div className="grid grid-cols-1 gap-4">
            {addresses.map((addr) => {
                const id = addr.ids[0];
                const isSelected = selectedId === id;

                return (
                    <div
                        key={id}
                        className={`rounded-2xl border transition-all ${
                            isSelected ? selectedStyle : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                    >
                        {editingId === id ? (
                            /* ── EDIT FORM ── */
                            <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { key: "fullName", placeholder: "Full Name" },
                                        { key: "mobile", placeholder: "Mobile" },
                                        { key: "address", placeholder: "Address", span: true },
                                        { key: "street", placeholder: "Street" },
                                        { key: "city", placeholder: "City" },
                                        { key: "state", placeholder: "State" },
                                        { key: "zipCode", placeholder: "Zip Code" },
                                    ].map(({ key, placeholder, span }) => (
                                        <input
                                            key={key}
                                            maxLength={key === "mobile" ? 10 : key === "zipCode" ? 6 : undefined}
                                            value={edited[key] || ""}
                                            onChange={(e) => {
                                                let v = e.target.value.replace(/^\s+/, "");
                                                if (["fullName", "city", "state"].includes(key))
                                                    v = v.replace(/[^A-Za-z ]/g, "");
                                                if (key === "mobile") v = v.replace(/\D/g, "").slice(0, 10);
                                                if (key === "zipCode") v = v.replace(/\D/g, "").slice(0, 6);
                                                setEdited({ ...edited, [key]: v });
                                            }}
                                            placeholder={placeholder}
                                            className={`border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-blue/20 outline-none${
                                                span ? " md:col-span-2" : ""
                                            }`}
                                        />
                                    ))}
                                    <div className="flex gap-3 mt-2 md:col-span-2">
                                        <button
                                            type="button"
                                            onClick={() => handleSave(addr)}
                                            className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingId(null)}
                                            className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* ── ADDRESS CARD ── */
                            <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5">
                                <input
                                    type="radio"
                                    name={radioName}
                                    checked={isSelected}
                                    onChange={() => onSelect(id)}
                                    className="mt-1 w-4 h-4 shrink-0 border-gray-300 cursor-pointer"
                                />

                                <div
                                    className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 cursor-pointer"
                                    onClick={() => onSelect(id)}
                                >
                                    <div className="flex-grow min-w-0">
                                        <p className="font-bold text-gray-800 text-base truncate mb-1">
                                            {addr.fullName}
                                        </p>
                                        <p className="text-gray-600 text-sm break-words">
                                            {addr.address}, {addr.street}
                                        </p>
                                        <p className="text-gray-600 text-sm break-words">
                                            {addr.city}, {addr.state} -{" "}
                                            <span className="font-semibold">{addr.zipCode}</span>
                                        </p>
                                        <p className="text-gray-600 text-sm mt-1.5 font-medium break-words">
                                            Mobile: <span className="text-gray-800">{addr.mobile}</span>
                                        </p>
                                    </div>

                                    <div className="flex gap-2 shrink-0 mt-2 sm:mt-0">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditClick(addr);
                                            }}
                                            className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-yellow-200 transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(addr);
                                            }}
                                            className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-200 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default AddressList;