"use client";

import React from "react";
import toast from "react-hot-toast";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";

function AddCart({
  product,
  selectedColor,
  qty = 1,
  className = "",
}) {
  const { user, loading } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const handleAddToCart = async () => {
    // Still checking the session, so don't send a logged-in user to login
    if (loading) return;

    // Guest: go to login, then come back to this same page
    if (!user) {
      toast.error("Please login first");
      router.push(`/signin?redirect=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    try {
      await addToCart({
        _id: product._id,
        title: product.title || product.name,
        image: product.image || product.img,
        price: product.price,
        oldPrice: product.oldPrice,
        category: product.category,
        quantity: qty,
        imageColor: selectedColor || "",
      });

      router.push("/cart");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      className={`
        bg-white
        text-primary-blue
        px-8
        py-2
        rounded-full
        text-xs
        font-medium
        shadow
        hover:bg-gray-100
        transition
        disabled:opacity-60
        ${className}
      `}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleAddToCart();
      }}
    >
      Add
    </button>
  );
}

export default AddCart;