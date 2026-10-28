"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FaCheck, FaMapMarkerAlt, FaTruck, FaArrowLeft } from "react-icons/fa";
import api from "../../lib/axios";
import { STEPS, prettyStatus, statusColor, imgUrl } from "../../lib/orderStatus";

const money = (n) =>
  "₹" +
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const ADDRESS_FIELDS = ["fullName", "mobile", "address", "street", "city", "state"];
const zipOf = (a) => a?.zipCode || a?.pincode || "";

const sameAddress = (a, b) => {
  if (!a || !b) return false;
  const norm = (v) => String(v ?? "").trim().toLowerCase();
  return (
    ADDRESS_FIELDS.every((f) => norm(a[f]) === norm(b[f])) && norm(zipOf(a)) === norm(zipOf(b))
  );
};

function AddressCard({ title, a }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5">
      <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <FaMapMarkerAlt className="text-primary-blue" /> {title}
      </h2>
      <p className="font-medium text-gray-800">{a.fullName}</p>
      <p className="text-sm text-gray-600">
        {[a.address, a.street, a.city, a.state].filter(Boolean).join(", ")}
        {zipOf(a) && ` - ${zipOf(a)}`}
      </p>
      <p className="text-sm text-gray-600 mt-1">Phone: {a.mobile}</p>
    </div>
  );
}

export default function TrackOrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const hasData = useRef(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await api.get(`/api/user/order/${id}`);
        if (!active) return;
        setOrder(res.data?.order || res.data);
        setError("");
        hasData.current = true;
      } catch (err) {
        console.error("Track error:", err);
        // A failed 30s refresh should not wipe a page that already loaded
        if (active && !hasData.current) setError("Could not load this order");
      }
    };

    load();
    const timer = setInterval(load, 30000); // live refresh every 30s
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [id]);

  if (error)
    return (
      <div className="min-h-screen flex flex-col gap-3 items-center justify-center">
        <p>{error}</p>
        <Link href="/order" className="text-primary-blue font-medium">
          Back to My Orders
        </Link>
      </div>
    );
  if (!order)
    return <div className="min-h-screen flex items-center justify-center">Loading order...</div>;

  const shipping = order.shippingAddress || {};
  const billing = order.billingAddress || null;
  const addressesSame = !billing || sameAddress(shipping, billing);

  const items = order.items || [];
  const history = (item) =>
    Object.fromEntries((item.statusHistory || []).map((h) => [h.status, h]));

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      <div className="max-w-[1000px] mx-auto px-4 lg:px-0 mt-8">
        <Link
          href="/order"
          className="text-primary-blue text-sm font-medium flex items-center gap-2 mb-4"
        >
          <FaArrowLeft /> Back to My Orders
        </Link>

        <div className="bg-white rounded-2xl shadow-md p-5 mb-5">
          <h1 className="text-xl font-bold text-gray-800">
            Order #{String(order._id).slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: one tracking card per product */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {items.map((item) => {
              const current = STEPS.findIndex((s) => s.key === item.status);
              const h = history(item);
              const cancelled = item.status === "CANCELLED";

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
                >
                  <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-5">
                    <img
                      src={imgUrl(item.img)}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      <p className="font-bold text-primary-red">{money(item.price)}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                        item.status
                      )}`}
                    >
                      {prettyStatus(item.status)}
                    </span>
                  </div>

                  {cancelled ? (
                    <p className="text-red-600 font-medium">
                      This item was cancelled
                      {item.cancelledAt &&
                        ` on ${new Date(item.cancelledAt).toLocaleDateString("en-IN")}`}
                      .
                    </p>
                  ) : (
                    <ol>
                      {STEPS.map((step, i) => {
                        const done = i <= current;
                        const entry = h[step.key];
                        return (
                          <li key={step.key} className="relative flex gap-4 pb-7 last:pb-0">
                            {i < STEPS.length - 1 && (
                              <span
                                className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${
                                  i < current ? "bg-green-500" : "bg-gray-200"
                                }`}
                              />
                            )}
                            <span
                              className={`z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                done ? "bg-green-500 text-white" : "bg-gray-200"
                              } ${
                                i === current && item.status !== "DELIVERED"
                                  ? "ring-4 ring-green-100"
                                  : ""
                              }`}
                            >
                              {done && <FaCheck className="text-[10px]" />}
                            </span>
                            <div>
                              <p className={done ? "font-semibold text-gray-800" : "text-gray-400"}>
                                {step.label}
                              </p>
                              {entry && (
                                <p className="text-xs text-gray-500">
                                  {new Date(entry.updatedAt).toLocaleString("en-IN")}
                                  {entry.note ? ` · ${entry.note}` : ""}
                                </p>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}

                  {(item.courierName || item.trackingId || item.estimatedDelivery) && (
                    <div className="mt-5 flex items-start gap-3 bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                      <FaTruck className="text-primary-blue mt-1" />
                      <div className="space-y-0.5">
                        {item.courierName && (
                          <p>
                            Courier: <b>{item.courierName}</b>
                          </p>
                        )}
                        {item.trackingId && (
                          <p>
                            Tracking ID: <b>{item.trackingId}</b>
                          </p>
                        )}
                        {item.estimatedDelivery && (
                          <p>
                            Expected by:{" "}
                            <b>
                              {new Date(item.estimatedDelivery).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </b>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT: address + price details */}
          <div className="flex flex-col gap-5">
            {addressesSame ? (
              <AddressCard title="Shipping & Billing Address" a={shipping} />
            ) : (
              <>
                <AddressCard title="Delivery Address" a={shipping} />
                <AddressCard title="Billing Address" a={billing} />
              </>
            )}

            <div className="bg-white rounded-2xl shadow-md p-5">
              <h2 className="font-bold text-gray-800 mb-3">Price Details</h2>
              <div className="space-y-2 text-sm text-gray-700">
                {(order.payment?.pricingDetails || []).map((p) => (
                  <div key={p.label} className="flex justify-between">
                    <span>{p.label}</span>
                    <span>{money(p.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-gray-800">
                  <span>Amount Paid</span>
                  <span className="text-primary-red">{money(order.payment?.amount)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Payment: {order.payment?.method || "Online"} · {order.payment?.status}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}