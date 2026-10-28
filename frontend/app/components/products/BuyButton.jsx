"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";

// Where the user goes after Buy Now (your cart / address page)
const AFTER_BUY_PATH = "/cart";
const PENDING_KEY = "pendingBuy";

function BuyNow({
  product,
  qty = 1,
  selectedColor,
  className = "",
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { addToCart } = useCart();
  const [busy, setBusy] = useState(false);
  const ranPending = useRef(false);

  const productId = product?.id || product?._id;

  // Add to cart, then go to the cart / address page
  const runBuy = async (p, quantity, color) => {
    setBusy(true);
    try {
      await addToCart({
        _id: p.id || p._id,
        title: p.title || p.name,
        image: p.image || p.img,
        price: p.price,
        oldPrice: p.oldPrice,
        category: p.category,
        quantity,
        imageColor: color || "",
      });

      router.push(AFTER_BUY_PATH);
    } catch (error) {
      console.error(error);
      toast.error("Could not start checkout. Please try again.");
      setBusy(false);
    }
  };

  // After login the user returns to this page: finish the saved Buy Now
  useEffect(() => {
    if (loading || !user || ranPending.current || !productId) return;

    let pending = null;
    try {
      pending = JSON.parse(localStorage.getItem(PENDING_KEY) || "null");
    } catch (_) {}

    if (!pending || pending.product?._id !== productId) return;

    // Ignore a pending buy older than 30 minutes
    if (Date.now() - (pending.time || 0) > 30 * 60 * 1000) {
      localStorage.removeItem(PENDING_KEY);
      return;
    }

    ranPending.current = true;
    localStorage.removeItem(PENDING_KEY);
    runBuy(pending.product, pending.qty || 1, pending.selectedColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, productId]);

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Still checking the session, so don't send a logged-in user to login
    if (loading || busy) return;

    // Guest: remember this product, go to login, come back here
    if (!user) {
      try {
        localStorage.setItem(
          PENDING_KEY,
          JSON.stringify({
            product: { ...product, _id: productId },
            qty,
            selectedColor: selectedColor || "",
            time: Date.now(),
          })
        );
      } catch (_) {}

      const here = window.location.pathname + window.location.search;
      toast.error("Please login to continue");
      router.push(`/signin?redirect=${encodeURIComponent(here)}`);
      return;
    }

    // Logged in: buy right away
    await runBuy(product, qty, selectedColor);
  };

  return (
    <button
      type="button"
      onClick={handleBuyNow}
      disabled={loading || busy}
      className={`bg-gradient-blue-red text-white px-6 py-2 rounded-full text-xs font-medium shadow hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {busy ? "Please wait..." : "Buy Now"}
    </button>
  );
}

export default BuyNow;