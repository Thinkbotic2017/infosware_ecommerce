"use client";

import { useAuth } from "@/app/context/AuthContext";
import api, { BASE_URL } from "@/app/lib/axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Badge text and colour for the payment status
const paymentBadge = (payment) => {
  const status = payment?.status;
  const isCod = payment?.method === "cod";

  if (status === "paid") {
    return { text: "PAID", cls: "bg-green-100 text-green-600" };
  }
  if (status === "failed") {
    return { text: "FAILED", cls: "bg-red-100 text-red-600" };
  }
  if (isCod) {
    return { text: "PAY ON DELIVERY", cls: "bg-amber-100 text-amber-700" };
  }
  return { text: "PAYMENT PENDING", cls: "bg-amber-100 text-amber-700" };
};

const imageSrc = (product) =>
  product?.img
    ? `${BASE_URL}/${product.img}`
    : product?.productId?.img
      ? `${BASE_URL}/${product.productId.img}`
      : "/no-image.png";

const productName = (product) =>
  product?.title || product?.name || product?.productId?.name || "Product";

export default function Page() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // limit=1000 loads every order in one request
        const res = await api.get("/api/user/orders?page=1&limit=1000");
        const data = res.data?.data;
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log(err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="p-10 text-center text-lg font-semibold">Loading...</div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mt-6">
      {orders.length > 0 ? (
        orders.map((order) => {
          const items = order?.items || [];
          const badge = paymentBadge(order?.payment);
          const isPaid = order?.payment?.status === "paid";
          const amount = order?.payment?.amount ?? order?.orderSummary?.total ?? 0;

          return (
            <div
              key={order?._id}
              className="bg-white border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
            >
              {/* TOP */}
              <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50">
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Transaction ID
                  </p>
                  <h3 className="font-bold text-[#0f172a] mt-1">{order?._id}</h3>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {order?.payment?.method && (
                    <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase">
                      {order.payment.method === "cod" ? "Cash on Delivery" : "Online"}
                    </span>
                  )}
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-bold ${badge.cls}`}
                  >
                    {badge.text}
                  </span>
                </div>
              </div>

              {/* BODY */}
              <div className="p-5 sm:p-6 flex flex-col xl:flex-row gap-6 xl:items-center xl:justify-between">
                {/* LEFT */}
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* PRODUCT IMAGES */}
                  <div className="flex items-center gap-3 shrink-0">
                    {items.slice(0, 2).map((product, idx) => (
                      <div
                        key={idx}
                        className="relative w-[78px] h-[78px] sm:w-[90px] sm:h-[90px] rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
                      >
                        <Image
                          unoptimized
                          src={imageSrc(product)}
                          fill
                          alt={productName(product)}
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}

                    {items.length > 2 && (
                      <div className="h-[78px] sm:h-[90px] px-4 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700 whitespace-nowrap">
                        +{items.length - 2} more
                      </div>
                    )}
                  </div>

                  {/* PRODUCT INFO */}
                  <div>
                    <p className="text-sm text-primary-blue font-medium">
                      {items[0]?.category || items[0]?.productId?.category || "N/A"}
                    </p>

                    <h2 className="text-xl font-bold text-[#0f172a] mt-1">
                      {items.length === 1
                        ? productName(items[0])
                        : `${items.length} Products Ordered`}
                    </h2>

                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {items.slice(0, 2).map(productName).join(", ")}
                      {items.length > 2 && (
                        <span className="font-medium text-[#0f172a]">
                          {" "}+{items.length - 2} more
                        </span>
                      )}
                    </p>

                    {/* META */}
                    <div className="flex flex-wrap gap-x-8 gap-y-4 mt-5">
                      <div>
                        <p className="text-xs text-gray-500">
                          {isPaid ? "Amount Paid" : "Amount to Pay"}
                        </p>
                        <h4 className="font-bold mt-1 text-primary-red">
                          ₹{fmt(amount)}
                        </h4>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Order Date</p>
                        <h4 className="font-semibold mt-1">
                          {order?.createdAt
                            ? new Date(order.createdAt).toLocaleDateString("en-IN")
                            : "-"}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href={`/user/payment/${order?._id}`}>
                    <button className="px-5 py-2 rounded-xl bg-gradient-blue-red text-white font-semibold shadow-sm hover:shadow-md transition">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-[#0f172a]">No Orders Found</h2>
          <p className="text-gray-500 mt-2">
            Start shopping to see your orders here.
          </p>
          <Link href="/products">
            <button className="mt-6 px-6 py-3 bg-gradient-blue-red text-white rounded-xl font-semibold">
              Continue Shopping
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}