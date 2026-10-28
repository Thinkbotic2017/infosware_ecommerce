"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaLock, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';
import { MdOutlineSecurity } from 'react-icons/md';
import Address from '../components/Address';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import OrderSummary from '../components/OrderSummary';

const loadRazorpay = () =>
    new Promise((resolve) => {
        if (typeof window !== "undefined" && window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

// Keep only the real address fields
const pickAddress = (a) =>
    a
        ? {
              fullName: a.fullName,
              mobile: a.mobile,
              address: a.address,
              street: a.street,
              city: a.city,
              state: a.state,
              zipCode: a.zipCode,
          }
        : null;

const fmt = (n) =>
    Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// The coupon may be stored as a string or as { code, discount }
const getCouponCode = (summary) => {
    const c = summary?.appliedCoupon ?? summary?.couponCode;
    if (!c) return "";
    return typeof c === "string" ? c : c.code || "";
};

const METHODS = [
    {
        key: "ONLINE",
        title: "Pay Online",
        desc: "UPI, cards, net banking and wallets via Razorpay",
        icon: FaCreditCard,
    },
    {
        key: "COD",
        title: "Cash on Delivery",
        desc: "Pay in cash when your order arrives",
        icon: FaMoneyBillWave,
    },
];

export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const submittingRef = useRef(false);

    const [selectedShipping, setSelectedShipping] = useState(null);
    const [selectedBilling, setSelectedBilling] = useState(null);
    const [step, setStep] = useState(1);
    const [finalTotal, setFinalTotal] = useState(0);
    const [summaryData, setSummaryData] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("ONLINE");

    // COD rules set by the admin (0 = no limit)
    const [codSettings, setCodSettings] = useState({
        codEnabled: true,
        codMinAmount: 0,
        codMaxAmount: 0,
    });

    // Total shown on screen. If OrderSummary has not reported it yet,
    // fall back to the summary data.
    const total =
        Number(finalTotal) ||
        Number(summaryData?.total) ||
        Number(summaryData?.grandTotal) ||
        Number(summaryData?.finalTotal) ||
        0;

    // Is COD allowed right now, and if not, why?
    let codReason = "";
    if (!codSettings.codEnabled) {
        codReason = "Currently unavailable";
    } else if (codSettings.codMinAmount > 0 && total > 0 && total < codSettings.codMinAmount) {
        codReason = `Available on orders of ${rupees(codSettings.codMinAmount)} or more`;
    } else if (codSettings.codMaxAmount > 0 && total > codSettings.codMaxAmount) {
        codReason = `Available on orders up to ${rupees(codSettings.codMaxAmount)}`;
    }
    const codAllowed = codReason === "";

    const stopProcessing = () => {
        submittingRef.current = false;
        setIsProcessing(false);
    };

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await api.get('/api/user/cart');
                setCart(res.data?.items || []);
            } catch (error) {
                console.error("Failed to fetch cart", error);
                toast.error("Failed to load cart");
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, []);

    // Ask the server if COD is allowed and for which amounts
    useEffect(() => {
        api
            .get("/api/comman/payment-settings")
            .then((r) =>
                setCodSettings({
                    codEnabled: r.data.codEnabled !== false,
                    codMinAmount: Number(r.data.codMinAmount) || 0,
                    codMaxAmount: Number(r.data.codMaxAmount) || 0,
                })
            )
            .catch(() => {});
    }, []);

    // If COD is not allowed, switch to Pay Online automatically
    useEffect(() => {
        if (!codAllowed && paymentMethod === "COD") {
            setPaymentMethod("ONLINE");
        }
    }, [codAllowed, paymentMethod]);

    const handleContinueToPayment = (shippingAddr, billingAddr) => {
        const ship = pickAddress(shippingAddr?.shipping || shippingAddr);
        const bill = pickAddress(billingAddr?.billing || billingAddr);
        setSelectedShipping(ship);
        setSelectedBilling(bill || ship);
        setStep(2);
    };

    // The server has emptied the cart. Clear it here and tell the rest of
    // the app (cart page, navbar count) to reload it.
    const orderSuccess = (orderId, message) => {
        toast.success(message);
        setCart([]);
        if (typeof window !== "undefined") {
            localStorage.removeItem("cart"); // harmless if you don't use it
            window.dispatchEvent(new Event("cart-updated"));
        }
        router.push(`/order/${orderId}`);
    };

    // Warn in the console if the server total differs from the total on screen
    const checkTotal = (serverTotal) => {
        if (Math.abs(Number(serverTotal) - Number(total)) > 1) {
            console.warn(
                `Total mismatch: screen shows ${total}, server charged ${serverTotal}`
            );
        }
    };

    // ONLINE: backend verifies the Razorpay signature
    const verifyPayment = async (payload) => {
        try {
            const res = await api.post("/api/user/verify-payment", payload);
            if (res.data.success) {
                orderSuccess(res.data.orderId, "Payment successful!");
            } else {
                toast.error("Payment verification failed");
                stopProcessing();
            }
        } catch (error) {
            console.error("Verify error:", error.response?.data || error);
            toast.error(error.response?.data?.message || "Payment verification failed");
            stopProcessing();
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedShipping) return toast.error("Please select a shipping address first");
        if (cart.length === 0) return toast.error("Your cart is empty");
        if (!summaryData) return toast.error("Order summary is still loading, please wait");
        if (paymentMethod === "COD" && !codAllowed) {
            return toast.error(`Cash on Delivery: ${codReason}`);
        }
        if (submittingRef.current) return; // blocks double clicks

        submittingRef.current = true;
        setIsProcessing(true);

        try {
            // The server builds items and the total from the saved cart,
            // so we only send the addresses and the coupon code.
            const payload = {
                shippingAddress: selectedShipping,
                billingAddress: selectedBilling || selectedShipping,
                couponCode: getCouponCode(summaryData),
            };

            /* ───────── CASH ON DELIVERY ───────── */
            if (paymentMethod === "COD") {
                const res = await api.post("/api/user/place-cod-order", payload);
                if (res.data.success) {
                    checkTotal(res.data.amount);
                    orderSuccess(res.data.orderId, "Order placed! Pay when it arrives.");
                } else {
                    toast.error(res.data.message || "Could not place order");
                    stopProcessing();
                }
                return;
            }

            /* ───────── ONLINE (RAZORPAY) ───────── */
            const res = await api.post("/api/user/create-order", payload);

            if (!res.data.success) {
                toast.error(res.data.message || "Failed to initialize payment");
                stopProcessing();
                return;
            }

            checkTotal(res.data.razorpayOrder.amount / 100);

            // Dummy mode (PAYMENT_MODE=mock on the backend): skip the popup
            if (res.data.mock) {
                await verifyPayment({
                    razorpay_order_id: res.data.razorpayOrder.id,
                });
                return;
            }

            const loaded = await loadRazorpay();
            if (!loaded) {
                toast.error("Could not load Razorpay. Check your internet connection.");
                stopProcessing();
                return;
            }

            const rzp = new window.Razorpay({
                key: res.data.key,
                amount: res.data.razorpayOrder.amount,
                currency: "INR",
                name: "Think-Botic",
                description: "Order payment",
                order_id: res.data.razorpayOrder.id,
                prefill: {
                    name: selectedShipping.fullName,
                    email: user?.email || "",
                    contact: selectedShipping.mobile,
                },
                theme: { color: "#2563eb" },
                handler: (response) => verifyPayment(response),
                modal: { ondismiss: () => stopProcessing() },
            });

            rzp.on("payment.failed", (resp) => {
                console.error("Razorpay failed:", resp.error);
                toast.error(resp.error?.description || "Payment failed, please try again");
                stopProcessing();
            });

            rzp.open();
        } catch (error) {
            console.error("Order error:", error);
            toast.error(error.response?.data?.message || "Something went wrong, please try again");
            stopProcessing();
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading checkout...</div>;
    }

    const isCOD = paymentMethod === "COD" && codAllowed;

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-20">
            <div className="max-w-[1200px] mx-auto px-4 lg:px-0 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT SIDE: STEPS */}
                <div className="lg:col-span-2 flex flex-col gap-5">
                    <Address onContinueToPayment={handleContinueToPayment} />

                    {/* STEP 2: PAYMENT */}
                    {step === 2 && (
                        <div className="bg-white rounded-2xl shadow-md ring-4 ring-primary-blue/5 border border-primary-blue/30 p-6 animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4 mb-5 flex items-center gap-2">
                                <FaLock className="text-primary-blue" /> Payment Method
                            </h2>

                            {/* METHOD CHOICE */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                {METHODS.map(({ key, title, desc, icon: Icon }) => {
                                    const disabled = key === "COD" && !codAllowed;
                                    const active = paymentMethod === key && !disabled;
                                    return (
                                        <label
                                            key={key}
                                            aria-disabled={disabled}
                                            className={`flex items-start gap-3 rounded-xl border p-4 transition ${
                                                disabled
                                                    ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-50"
                                                    : active
                                                    ? "cursor-pointer border-primary-blue bg-blue-50/30 ring-1 ring-primary-blue/30"
                                                    : "cursor-pointer border-gray-200 hover:border-gray-300"
                                            } ${isProcessing ? "pointer-events-none opacity-70" : ""}`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                checked={active}
                                                disabled={disabled}
                                                onChange={() => !disabled && setPaymentMethod(key)}
                                                className="mt-1 w-4 h-4 disabled:cursor-not-allowed"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-800 flex items-center gap-2">
                                                    <Icon className="text-primary-blue" /> {title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {disabled ? codReason : desc}
                                                </p>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>

                            <p className="text-gray-600 mb-6">
                                {isCOD ? "You will pay " : "You are about to pay "}
                                <span className="font-bold text-lg text-primary-red">₹{fmt(total)}</span>
                                {isCOD ? " in cash when your order is delivered." : " using Razorpay secure gateway."}
                            </p>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={isProcessing}
                                className="w-full md:w-auto px-10 py-4 bg-gradient-blue-red text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-70 flex justify-center items-center gap-2"
                            >
                                {isProcessing ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : isCOD ? (
                                    <FaMoneyBillWave className="text-sm opacity-80" />
                                ) : (
                                    <FaLock className="text-sm opacity-80" />
                                )}
                                {isProcessing
                                    ? isCOD ? "Placing Order..." : "Processing Payment..."
                                    : isCOD ? "Place Order (Cash on Delivery)" : `Pay ₹${fmt(total)} Securely`}
                            </button>

                            {!isCOD && (
                                <div className="mt-6 flex flex-col items-start gap-2 text-xs text-gray-400 font-medium bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                        <MdOutlineSecurity className="text-lg text-green-500" />
                                        <span>Safe and Secure Payments via Razorpay</span>
                                    </div>
                                    <p>Your payment information is encrypted and securely processed.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE: ORDER SUMMARY */}
                <OrderSummary onSummaryChange={setSummaryData} onTotalChange={setFinalTotal} />
            </div>
        </div>
    );
}