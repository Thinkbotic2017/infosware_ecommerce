"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaBoxOpen,
  FaChevronLeft,
  FaChevronRight,
  FaHistory,
  FaShoppingBag,
} from "react-icons/fa";
import api from "../lib/axios";
import { getOrderStatus, prettyStatus, statusColor, imgUrl } from "../lib/orderStatus";

const PAGE_SIZE = 5; // orders per page

// Orders with the same products, quantities and total, placed within this
// many minutes of each other, are one bulk order and are shown once.
const DUPLICATE_WINDOW_MIN = 60;

const TABS = [
  { key: "current", label: "Current Order", icon: FaShoppingBag },
  { key: "history", label: "Order History", icon: FaHistory },
];

const money = (n) =>
  "₹" +
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const toArray = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.orders)) return raw.orders;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.orders)) return raw.data.orders;
  return [];
};

const isFinished = (order) => {
  const s = getOrderStatus(order);
  return s === "DELIVERED" || s === "CANCELLED";
};

// Same products + same quantities + same total = same basket
const signature = (o) =>
  (o.items || [])
    .map((i) => `${i.productId?._id || i.productId || i.name}|${i.quantity}|${i.price}`)
    .sort()
    .join(";") +
  "#" +
  Number(o.payment?.amount || 0);

// Keep one order per basket when repeats happen close together.
// The list is newest first, so the newest copy is the one kept.
const collapseDuplicates = (list) => {
  const kept = [];
  const windowMs = DUPLICATE_WINDOW_MIN * 60 * 1000;
  list.forEach((o) => {
    const dup = kept.find(
      (k) =>
        signature(k) === signature(o) &&
        Math.abs(new Date(k.createdAt) - new Date(o.createdAt)) <= windowMs
    );
    if (!dup) kept.push(o);
  });
  return kept;
};

// Page numbers with "..." for long lists: 1 ... 4 5 6 ... 12
const buildPageList = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 1, total - 2, total - 3].forEach((p) => pages.add(p));

  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const list = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) list.push("...");
    list.push(p);
  });
  return list;
};

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const btn =
    "min-w-[40px] h-10 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-1 transition";

  return (
    <nav
      aria-label="Orders pagination"
      className="flex flex-wrap items-center justify-center gap-2 mt-8"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btn} bg-white border-gray-200 text-gray-700 hover:border-primary-blue hover:text-primary-blue disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700`}
      >
        <FaChevronLeft className="text-xs" /> Previous
      </button>

      {buildPageList(currentPage, totalPages).map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-1 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={`${btn} ${
              p === currentPage
                ? "bg-gradient-blue-red text-white border-transparent shadow"
                : "bg-white border-gray-200 text-gray-700 hover:border-primary-blue hover:text-primary-blue"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btn} bg-white border-gray-200 text-gray-700 hover:border-primary-blue hover:text-primary-blue disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700`}
      >
        Next <FaChevronRight className="text-xs" />
      </button>
    </nav>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("current");
  const [pages, setPages] = useState({ current: 1, history: 1 });

  useEffect(() => {
    api
      // The server hides unpaid online attempts; limit=1000 loads everything,
      // and this page removes repeats and splits the rest into pages of 5.
      .get("/api/user/orders?limit=1000")
      .then((res) => {
        const list = toArray(res.data).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(collapseDuplicates(list));
      })
      .catch((err) => {
        console.error("Orders error:", err);
        setError("Could not load your orders. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const currentOrders = useMemo(() => orders.filter((o) => !isFinished(o)), [orders]);
  const historyOrders = useMemo(() => orders.filter(isFinished), [orders]);

  const list = tab === "current" ? currentOrders : historyOrders;
  const counts = { current: currentOrders.length, history: historyOrders.length };

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(pages[tab], totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const shown = list.slice(start, start + PAGE_SIZE);

  const goToPage = (p) => {
    setPages((prev) => ({ ...prev, [tab]: p }));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading your orders...</div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      <div className="max-w-[900px] mx-auto px-4 lg:px-0 mt-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaBoxOpen className="text-primary-blue" /> My Orders
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* TABS */}
        <div className="flex gap-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 mb-6">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                tab === key
                  ? "bg-gradient-blue-red text-white shadow"
                  : "text-gray-600 hover:bg-gray-50 hover:text-primary-blue"
              }`}
            >
              <Icon size={14} />
              {label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  tab === key ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-10 text-center">
            <p className="text-gray-600 mb-4">
              {tab === "current" ? "You have no current orders." : "You have no past orders yet."}
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-gradient-blue-red text-white rounded-xl font-bold shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Showing {start + 1}–{start + shown.length} of {list.length} order
              {list.length !== 1 && "s"}
            </p>

            <div className="flex flex-col gap-4">
              {shown.map((order) => {
                const status = getOrderStatus(order);
                const items = order.items || [];
                return (
                  <Link
                    key={order._id}
                    href={`/order/${order._id}`}
                    className="bg-white rounded-2xl shadow-md border border-gray-100 hover:border-primary-blue/30 hover:shadow-lg transition p-5 block"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                      <div>
                        <p className="font-bold text-gray-800">
                          Order #{String(order._id).slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Placed on {new Date(order.createdAt).toLocaleString("en-IN")} ·{" "}
                          {items.length} item{items.length !== 1 && "s"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.payment?.method === "cod" && order.payment?.status !== "paid" && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                            Pay on delivery
                          </span>
                        )}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(status)}`}
                        >
                          {prettyStatus(status)}
                        </span>
                      </div>
                    </div>

                    {items.map((item, i) => (
                      <div key={item._id || i} className="flex items-center gap-4 py-2">
                        <img
                          src={imgUrl(item.img)}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-800">
                          {money(Number(item.price) * (Number(item.quantity) || 1))}
                        </p>
                      </div>
                    ))}

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
                      <p className="text-sm text-gray-600">
                        Total:{" "}
                        <span className="font-bold text-primary-red">
                          {money(order.payment?.amount)}
                        </span>
                      </p>
                      <span className="text-primary-blue text-sm font-medium flex items-center gap-1">
                        {tab === "current" ? "Track Order" : "View Details"}{" "}
                        <FaChevronRight className="text-xs" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </>
        )}
      </div>
    </div>
  );
}