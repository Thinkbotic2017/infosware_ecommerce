"use client";

import Link from "next/link";
import Image from "next/image";
import { FaShoppingCart } from "react-icons/fa";
import toast from "react-hot-toast";

import { useCart } from "@/app/context/CartContext";
import api, { BASE_URL } from "@/app/lib/axios";
import OrderSummary from "@/app/components/OrderSummary";

export default function DashboardCart() {
  const { cartItems, setCartItems, removeFromCart } = useCart();

  const count = cartItems ? cartItems.length : 0;

  // change quantity, save to the server, and roll back if saving fails
  const changeQuantity = async (productId, delta) => {
    const previous = cartItems;

    const updated = cartItems.map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.max((item.quantity || 1) + delta, 1) }
        : item
    );

    setCartItems(updated);

    try {
      await api.post("api/user/cart/update", { cartItems: updated });
    } catch (error) {
      console.log(error);
      setCartItems(previous);
      toast.error("Failed to update quantity");
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          {/* HEADING (same style as Personal Information) */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-2xl font-bold text-primary-red">My Cart</h3>
              <p className="text-gray-500 text-sm mt-1">
                Review the products in your cart.
              </p>
            </div>

            <span className="text-sm font-medium bg-primary-red/10 text-primary-red px-4 py-1.5 rounded-full self-start sm:self-auto shrink-0">
              {count} {count === 1 ? "item" : "items"}
            </span>
          </div>

          {/* CONTENT */}
          {count > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* ITEMS */}
              <div className="xl:col-span-2 flex flex-col gap-4">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                  >
                    {/* LEFT */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                      <div className="relative w-full sm:w-[110px] h-[220px] sm:h-[110px] shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                        <Image
                          unoptimized
                          src={`${BASE_URL}/${item.img}`}
                          fill
                          className="object-contain p-2"
                          alt={item.name || "Product"}
                        />
                      </div>

                      <div className="flex flex-col justify-center flex-1 min-w-0">
                        <h3 className="font-semibold text-[#0f172a] text-base sm:text-lg line-clamp-2">
                          {item.name}
                        </h3>

                        {item.category && (
                          <p className="text-gray-500 text-sm mt-1">{item.category}</p>
                        )}

                        {item.imageColor ? (
                          <p className="text-gray-400 text-sm">Color : {item.imageColor}</p>
                        ) : null}

                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <span className="text-primary-red font-bold text-lg">
                            ₹{item.price}
                          </span>

                          {item.oldPrice > item.price && (
                            <span className="line-through text-gray-400 text-sm">
                              ₹{item.oldPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full lg:w-auto">
                      <div className="flex items-center shadow-sm rounded-xl overflow-hidden border border-gray-100">
                        <button
                          onClick={() => changeQuantity(item.productId, -1)}
                          className="px-4 py-2 text-lg hover:bg-gray-50"
                        >
                          -
                        </button>

                        <span className="px-4 min-w-[40px] text-center">
                          {item.quantity || 1}
                        </span>

                        <button
                          onClick={() => changeQuantity(item.productId, 1)}
                          className="px-4 py-2 text-lg hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-500 text-sm font-medium whitespace-nowrap"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <Link href="/delivery">
                  <button className="w-full mt-2 bg-gradient-blue-red text-white py-3 rounded-xl font-bold hover:opacity-90 transition">
                    Proceed To Checkout
                  </button>
                </Link>
              </div>

              {/* SUMMARY */}
              <div>
                <OrderSummary />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 py-14 px-6 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-5">
                <FaShoppingCart className="text-primary-red/40 text-4xl" />
              </div>

              <h3 className="text-xl font-bold text-[#0f172a] mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
                Looks like you haven&apos;t added anything yet. Explore our
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
      </div>
    </div>
  );
}