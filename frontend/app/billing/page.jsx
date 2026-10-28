"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Could not load Razorpay");

      const res = await fetch(`${API}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ billing: form }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Order failed");

      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        name: "Think-Botic",
        order_id: data.order.id,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        handler: async (response) => {
          const v = await fetch(`${API}/api/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(response),
          });
          const result = await v.json();
          if (result.success) router.push("/payment-success");
          else alert("Payment verification failed");
        },
      });
      rzp.on("payment.failed", () => alert("Payment failed, please try again"));
      rzp.open();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePay} style={{ maxWidth: 400, margin: "40px auto", display: "grid", gap: 10 }}>
      <h2>Billing Details</h2>
      <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
      <textarea name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
      <button type="submit" disabled={loading}>
        {loading ? "Please wait..." : "Pay Now"}
      </button>
    </form>
  );
}