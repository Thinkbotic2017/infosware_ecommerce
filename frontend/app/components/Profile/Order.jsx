"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import api, { BASE_URL } from "@/app/lib/axios";
import Image from "next/image";
import Link from "next/link";
import Pagination from "@/app/components/Pagination";

// Keep only one order per payment transaction
const dedupeOrders = (list) => {
  const seen = new Set();
  return list.filter((order) => {
    const key = order.payment?.transactionId || order._id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export default function Order() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get(`/api/user/orders?page=${page}&limit=2`);
        const data = res.data.data;
        setTotalPages(res.data.totalPages);
        setOrders(Array.isArray(data) ? dedupeOrders(data) : []);
      } catch (err) {
        setOrders([]);
        console.log(err);
      }
    };

    if (user) fetchOrders();
  }, [user, page]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 mt-6">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order._id}
              className="shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
            >
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b border-gray-100 bg-gray-50">
                <div>
                  <h2 className="font-bold text-[#0f172a]">
                    Order ID: {order._id.slice(-8)}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Ordered On: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                    order.payment?.status === "PAID"
                      ? "bg-green-100 text-green-600"
                      : "bg-orange-100 text-orange-500"
                  }`}
                >
                  {order.payment?.status || "Processing"}
                </span>
              </div>

              {/* PRODUCTS */}
              <div className="p-4 space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="flex flex-col sm:flex-row gap-4 border border-gray-100 rounded-xl p-3"
                  >
                    {/* IMAGE */}
                    <div className="w-full sm:w-[120px] h-[100px] overflow-hidden border border-gray-100 bg-gray-50 shrink-0 rounded-lg">
                      <Image
                        unoptimized
                        src={
                          item.img
                            ? `${BASE_URL}/${item.img}`
                            : item.productId?.img
                            ? `${BASE_URL}/${item.productId.img}`
                            : "/no-image.png"
                        }
                        width={120}
                        height={100}
                        alt={item.title || item.productId?.name || "Product"}
                        className="w-full h-full object-fill"
                      />
                    </div>

                    {/* DETAILS */}
                    <div className="flex-1">
                      <p className="text-sm text-primary-blue font-medium">
                        {item.category || item.productId?.category || "N/A"}
                      </p>

                      <h2 className="text-lg font-semibold text-[#0f172a]">
                        {item.title || item.productId?.name || "Product"}
                      </h2>

                      <div className="flex gap-6 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">Quantity</p>
                          <h4 className="font-semibold text-sm mt-1">
                            {item.quantity || 1}
                          </h4>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <h4 className="font-semibold text-sm mt-1 text-primary-red">
                            ₹{item.price}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`/user/orders/${order._id}?product=${
                          item.productId?._id || item.productId || ""
                        }`}
                      >
                        <button className="px-5 py-2 rounded-xl bg-gradient-blue-red text-white text-sm font-semibold hover:scale-[1.02] transition">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <h2 className="text-2xl font-bold text-gray-700">No Orders Found</h2>
            <p className="text-gray-500 mt-2">Your orders will appear here.</p>
          </div>
        )}
      </div>

      {orders.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}