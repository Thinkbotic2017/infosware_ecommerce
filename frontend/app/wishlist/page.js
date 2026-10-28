"use client";

import { useWishlist } from "@/app/context/WhishlistContext";
import ProductCard from "@/app/components/home/Card";
import { BASE_URL } from "@/app/lib/axios";
import { FaHeartBroken } from "react-icons/fa";
import Link from "next/link";

export default function DashboardWishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();

  const count = wishlistItems ? wishlistItems.length : 0;

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      {/* HEADER */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 sm:p-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-red">My Wishlist</h1>
          <p className="text-gray-500 text-sm mt-1">
            Products you have saved for later
          </p>
        </div>

        <span className="text-sm font-medium bg-primary-red/10 text-primary-red px-4 py-1.5 rounded-full shrink-0">
          {count} {count === 1 ? "item" : "items"}
        </span>
      </div>

      {/* BODY */}
      {count > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {wishlistItems.map((item) => {
            const formattedItem = {
              id: item._id || item.id,
              image: item.image || `${BASE_URL}/${item.img}`,
              title: item.title || item.name,
              category: item.category,
              price: item.price,
              oldPrice: item.oldPrice,
              rating: item.rating,
              discount: item.discount || 0,
            };

            return (
              <div key={formattedItem.id} className="relative group">
                <ProductCard {...formattedItem} />

                <button
                  onClick={() => removeFromWishlist(formattedItem.id)}
                  className="absolute top-3 left-3 bg-white/90 backdrop-blur text-gray-600 hover:text-white hover:bg-primary-red px-3 py-1.5 rounded-full text-xs font-bold shadow-sm opacity-0 group-hover:opacity-100 transition duration-300 z-10"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[380px] border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-5">
            <FaHeartBroken className="text-primary-red/40 text-4xl" />
          </div>

          <h3 className="text-2xl font-bold text-[#0f172a] mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
            Looks like you haven&apos;t found anything you love yet. Explore our
            collections and find something perfect!
          </p>

          <Link href="/products">
            <button className="bg-gradient-blue-red text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg shadow-primary-blue/20">
              Continue Shopping
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}