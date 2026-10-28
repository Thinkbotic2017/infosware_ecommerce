"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import api from "@/app/lib/axios";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function AdminSales() {
  const [data, setData] = useState({ sales: [], pages: 1 });
  const [page, setPage] = useState(1);
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/admin/sales", {
        params: { page, limit: 15, method },
      });
      setData(res.data);
    } catch (e) {
      console.error("Sales error:", e.response?.data || e.message);
      setError("Could not load sales.");
    } finally {
      setLoading(false);
    }
  }, [page, method]);

  useEffect(() => {
    load();
  }, [load]);

  const sales = data.sales || [];

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-blue-red px-6 py-6 text-white shadow">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Total Sales</h1>
          <p className="mt-1 text-sm text-white/90">History of all paid orders</p>
        </div>
        <Link
          href="/admin/payments"
          className="rounded-full bg-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/30"
        >
          Payment details
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total Sales", money(data.totalSales)],
          ["Paid Orders", data.orderCount || 0],
          ["Online / COD", `${money(data.onlineSales)} / ${money(data.codSales)}`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 break-all text-2xl font-bold text-[#0f172a]">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#0f172a]">Sales History</h2>
          <select
            value={method}
            onChange={(e) => {
              setPage(1);
              setMethod(e.target.value);
            }}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
          >
            <option value="">All methods</option>
            <option value="online">Online</option>
            <option value="cod">COD</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Items</th>
                <th className="py-2 pr-4">Method</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-red-500">{error}</td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">No sales yet.</td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s._id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs">#{String(s._id).slice(-6)}</td>
                    <td className="py-3 pr-4">{s.user}</td>
                    <td className="py-3 pr-4">{s.items}</td>
                    <td className="py-3 pr-4 uppercase">{s.method}</td>
                    <td className="py-3 pr-4 font-medium">{money(s.amount)}</td>
                    <td className="py-3 text-gray-500">
                      {new Date(s.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-gray-500">Page {page} of {data.pages || 1}</span>
          <button
            type="button"
            disabled={page >= (data.pages || 1)}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
