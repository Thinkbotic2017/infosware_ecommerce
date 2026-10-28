"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const { user } = useAuth();
  const { setCartItems } = useCart();

  const [status, setStatus] = useState("verifying"); // verifying | success | failed
  const [errorMsg, setErrorMsg] = useState("");

  // Guards against double execution (user object changes, Strict Mode, re-renders)
  const hasRun = useRef(false);

  // Use a stable string, not the whole user object
  const userId = user?._id || user?.id;

  useEffect(() => {
    if (!orderId || !userId) return;
    if (hasRun.current) return;
    hasRun.current = true;

    const verifyAndCreateOrder = async () => {
      try {
        // 1. Verify payment with Cashfree
        const verifyRes = await api.get(`/api/user/verify-order/${orderId}`);

        if (
          verifyRes.data.success &&
          verifyRes.data.data.order_status === "PAID"
        ) {
          // 2. Read pending order details
          const pendingDetails = localStorage.getItem("pendingOrderDetails");

          if (pendingDetails) {
            // Remove BEFORE posting so no second run can reuse it
            localStorage.removeItem("pendingOrderDetails");

            const parsed = JSON.parse(pendingDetails);

            // 3. Create the order once
            await api.post("/api/user/order", {
              userId,
              shippingAddress: parsed.shippingAddress,
              billingAddress: parsed.billingAddress,
              items: parsed.items,
              orderSummary: parsed.orderSummary,
              payment: {
                method: "Cashfree",
                status: "Success",
                transactionId: orderId,
              },
            });

            // 4. Clear cart
            setCartItems([]);
            localStorage.removeItem("cartItems");
          }

          setStatus("success");
        } else {
          setStatus("failed");
          setErrorMsg("Payment was not successful or was cancelled.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("failed");
        setErrorMsg("Failed to verify payment status.");
      }
    };

    verifyAndCreateOrder();
  }, [orderId, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 max-w-md w-full text-center relative z-10 overflow-hidden">
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-blue-red opacity-5 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-blue-red opacity-5 rounded-full blur-2xl"></div>

      {status === "verifying" && (
        <div className="py-10">
          <div className="w-16 h-16 border-4 border-gray-100 border-t-primary-blue rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Verifying Payment...
          </h2>
          <p className="text-gray-500">
            Please do not close this window or refresh the page.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="py-6 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-6xl text-green-500 drop-shadow-sm" />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-3 tracking-tight">
            Payment Successful!
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Thank you for your purchase. Your order has been placed
            successfully. A confirmation email has been sent to you.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-sm text-gray-600 font-medium border border-gray-100 flex flex-col gap-1">
            <span>Order ID</span>
            <span className="font-bold text-gray-900 text-base">{orderId}</span>
          </div>
          <Link href="/user/orders">
            <button className="w-full py-4 bg-gradient-blue-red text-white rounded-xl font-bold hover:opacity-90 transition shadow-md transform hover:-translate-y-0.5">
              View My Orders
            </button>
          </Link>
          <Link href="/">
            <button className="w-full py-4 mt-3 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition">
              Continue Shopping
            </button>
          </Link>
        </div>
      )}

      {status === "failed" && (
        <div className="py-6 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaTimesCircle className="text-6xl text-red-500 drop-shadow-sm" />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-3 tracking-tight">
            Payment Failed
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">{errorMsg}</p>
          <Link href="/delivery">
            <button className="w-full py-4 bg-primary-red text-white rounded-xl font-bold hover:bg-red-700 transition shadow-md transform hover:-translate-y-0.5">
              Try Again
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-blue rounded-full animate-spin mx-auto"></div>
        }
      >
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}