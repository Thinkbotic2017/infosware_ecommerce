"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaMapMarkerAlt, FaPlus, FaEdit } from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import api from "../lib/axios";
import toast from "react-hot-toast";
import AddressList from "./AddressList";

const inputCls =
    "w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 outline-none transition";

const COMPARE_FIELDS = ["fullName", "mobile", "address", "street", "city", "state", "zipCode"];

const keyOf = (a) =>
    COMPARE_FIELDS.map((f) => String(a[f] ?? "").trim().toLowerCase()).join("|");

// Merge identical records (old Shipping + Billing duplicates) into one card
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

function Address({ onContinueToPayment }) {
    const [addresses, setAddresses] = useState([]); // raw records from the server
    const [selectedShippingId, setSelectedShippingId] = useState(null);
    const [selectedBillingId, setSelectedBillingId] = useState(null);
    const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [step, setStep] = useState(1);

    const { user } = useAuth();
    const userId = user?._id || user?.id;

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

    const fetchAddresses = async () => {
        if (!userId) return [];
        try {
            const response = await api.get(`/api/user/addresses/${userId}`);
            const formatted = (response.data || []).map((addr) => ({
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
            setAddresses([]);
            return [];
        }
    };

    useEffect(() => { fetchAddresses(); }, [userId]);

    /* ── Save ONE address, then auto-select it ── */
    const onSubmitAddress = async (data) => {
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
            setIsAddingAddress(false);

            const fresh = await fetchAddresses();
            const added = fresh.find((a) => !previousIds.has(a.id));
            if (added) {
                const card = groupAddresses(fresh).find((c) => c.ids.includes(added.id));
                setSelectedShippingId(card ? card.ids[0] : added.id);
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to save address");
        }
    };

    const handleDeleted = (ids) => {
        setAddresses((prev) => prev.filter((a) => !ids.includes(a.id)));
        if (ids.includes(selectedShippingId)) setSelectedShippingId(null);
        if (ids.includes(selectedBillingId)) setSelectedBillingId(null);
    };

    const handleUpdated = (ids, payload) => {
        setAddresses((prev) => prev.map((a) => (ids.includes(a.id) ? { ...a, ...payload } : a)));
    };

    const getAddressById = (id) => uniqueAddresses.find((a) => a.ids.includes(id));

    const finalBillingId = billingSameAsShipping ? selectedShippingId : selectedBillingId;
    const canContinue = !!selectedShippingId && !!finalBillingId;

    const handleContinue = () => {
        setStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (onContinueToPayment) {
            onContinueToPayment(getAddressById(selectedShippingId), getAddressById(finalBillingId));
        }
    };

    return (
        <div className="lg:col-span-2 flex flex-col gap-5">
            <div
                className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 ${
                    step === 1
                        ? "border-primary-blue/30 shadow-md ring-4 ring-primary-blue/5"
                        : "border-gray-100 opacity-90"
                }`}
            >
                {/* Header */}
                <div className="p-5 sm:p-6 flex justify-between items-center border-b border-gray-50">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold bg-primary-blue text-white shadow-md shadow-primary-blue/20">
                            1
                        </span>
                        <h2 className="text-xl font-bold text-gray-800">Delivery & Billing Address</h2>
                    </div>
                    {step > 1 && (
                        <button
                            onClick={() => setStep(1)}
                            className="text-primary-blue text-sm font-semibold flex items-center gap-1.5 hover:text-blue-700 transition"
                        >
                            <FaEdit /> Change
                        </button>
                    )}
                </div>

                {/* ── STEP 1 ── */}
                {step === 1 && (
                    <div className="p-5 sm:p-8 bg-gray-50/30">
                        {/* Empty state */}
                        {uniqueAddresses.length === 0 && !isAddingAddress && (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <FaMapMarkerAlt className="text-2xl" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">No Address Available</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    Please add an address to proceed with your order.
                                </p>
                                <button
                                    onClick={() => setIsAddingAddress(true)}
                                    className="px-6 py-3 bg-gradient-blue-red text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto"
                                >
                                    <FaPlus /> Add New Address
                                </button>
                            </div>
                        )}

                        {/* Address list + continue */}
                        {uniqueAddresses.length > 0 && !isAddingAddress && (
                            <div className="space-y-5">
                                <h3 className="font-semibold text-gray-800 text-lg">
                                    {billingSameAsShipping ? "Select Delivery & Billing Address" : "Select Delivery Address"}
                                </h3>

                                <AddressList
                                    addresses={uniqueAddresses}
                                    selectedId={selectedShippingId}
                                    onSelect={setSelectedShippingId}
                                    onDeleted={handleDeleted}
                                    onUpdated={handleUpdated}
                                    radioName="shippingAddress"
                                    accent="blue"
                                />

                                <button
                                    onClick={() => setIsAddingAddress(true)}
                                    className="text-primary-blue font-semibold text-sm flex items-center gap-1.5 hover:underline"
                                >
                                    <FaPlus className="text-xs" /> Add another address
                                </button>

                                {/* Same for billing? */}
                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        id="billingSame"
                                        type="checkbox"
                                        checked={billingSameAsShipping}
                                        onChange={() => setBillingSameAsShipping(!billingSameAsShipping)}
                                        className="w-4 h-4 accent-primary-red"
                                    />
                                    <label htmlFor="billingSame" className="text-sm font-medium text-gray-700 cursor-pointer">
                                        Use this same address for billing
                                    </label>
                                </div>

                                {/* Different billing address */}
                                {!billingSameAsShipping && (
                                    <div className="space-y-4 pt-4 border-t border-gray-200">
                                        <h3 className="font-semibold text-gray-800 text-lg">Select Billing Address</h3>
                                        <AddressList
                                            addresses={uniqueAddresses}
                                            selectedId={selectedBillingId}
                                            onSelect={setSelectedBillingId}
                                            onDeleted={handleDeleted}
                                            onUpdated={handleUpdated}
                                            radioName="billingAddress"
                                            accent="red"
                                        />
                                    </div>
                                )}

                                <div className="pt-6 border-t border-gray-200 mt-6 flex justify-end">
                                    <button
                                        disabled={!canContinue}
                                        onClick={handleContinue}
                                        className="w-full md:w-auto px-8 py-3.5 bg-gradient-blue-red text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continue to Payment
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Add address form (one address only) */}
                        {isAddingAddress && (
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                    <h3 className="text-lg font-bold text-gray-800">Add New Address</h3>
                                    {uniqueAddresses.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingAddress(false)}
                                            className="text-gray-500 text-sm font-medium hover:text-gray-800 transition"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit(onSubmitAddress)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                        {FIELD_DEFS.map((def) => {
                                            const rules = {
                                                setValueAs: (v) => (typeof v === "string" ? v.replace(/^\s+/, "") : v),
                                                required: `${def.what} is required`,
                                            };
                                            if (def.pattern) rules.pattern = { value: def.pattern, message: def.patternMsg };
                                            if (def.minLength) rules.minLength = { value: def.minLength, message: def.minMsg };

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
                                                        <p className="text-red-500 text-sm mt-1">{errors[def.key].message}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="pt-6 border-t border-gray-200 flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-8 py-3 bg-gradient-blue-red text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                                        >
                                            Save Address
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                {/* ── ADDRESS SUMMARY (step > 1) ── */}
                {step > 1 && selectedShippingId && (() => {
                    const shippingAddr = getAddressById(selectedShippingId);
                    const billingAddr = getAddressById(finalBillingId);
                    if (!shippingAddr) return null;
                    const isSame = !billingAddr || shippingAddr.ids[0] === billingAddr.ids[0];

                    const Card = ({ title, a, accent }) => (
                        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4">
                            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${accent}`}>
                                <FaMapMarkerAlt /> {title}
                            </h4>
                            <p className="font-bold text-gray-800">{a.fullName}</p>
                            <p className="text-gray-600 text-sm mt-1">{a.address}, {a.street}</p>
                            <p className="text-gray-600 text-sm">
                                {a.city}, {a.state} - <span className="font-semibold">{a.zipCode}</span>
                            </p>
                            <p className="text-gray-600 text-sm mt-1 font-medium">
                                Mobile: <span className="text-gray-800">{a.mobile}</span>
                            </p>
                        </div>
                    );

                    return (
                        <div className="px-5 sm:px-8 py-5 bg-gray-50/50 rounded-b-2xl">
                            <div className="flex flex-col md:flex-row gap-6">
                                <Card
                                    title={isSame ? "Shipping & Billing To" : "Shipping To"}
                                    a={shippingAddr}
                                    accent="text-primary-blue"
                                />
                                {!isSame && <Card title="Billing To" a={billingAddr} accent="text-gray-500" />}
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}

export default Address;