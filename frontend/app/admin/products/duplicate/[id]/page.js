// app/admin/products/duplicate/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/app/components/admin/ProductForm";
import api from "@/app/lib/axios";

export default function DuplicateProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/admin/productpage/${id}`)
      .then((res) => {
        const data = res.data;

        // Strip identity fields so it's treated as a brand-new product
        const { _id, __v, createdAt, updatedAt, slug, ...rest } = data;

        // Optionally signal it's a copy in the name
        rest.name = `${rest.name} (Copy)`;

        setProduct(rest);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <span className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm font-medium">Preparing duplicate...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 text-sm">Product not found.</p>
      </div>
    );
  }

  // mode="duplicate" → same POST endpoint as add, but form prefilled + badge shown
  return <ProductForm mode="duplicate" initialData={product} />;
}