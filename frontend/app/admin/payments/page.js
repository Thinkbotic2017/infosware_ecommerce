"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "@/app/lib/axios";

const money = (n) => `\u20B9${Number(n || 0).toLocaleString("en-IN")}`;

const badge = (s) => {
  const v = String(s).toLowerCase();
  if (v === "paid" || v === "success") return "bg-green-100 text-green-700";
  if (v === "failed") return "bg-red-100 text-red-700";
  return "bg-orange-100 text-orange-700";
};

export default function AdminPayments() {
  const [data, setData] = useState({ payments: [], summary: {}, pages: 1 });
  const [page, setPage] = useState(1);
  const [method, setMethod] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // COD rules (0 = no limit)
  const [cod, setCod] = useState({ codEnabled: true, codMinAmount: 0, codMaxAmount: 0 });
  const [minInput, setMinInput] = useState("0");
  const [maxInput, setMaxInput] = useState("0");
  const codEnabled = cod.codEnabled;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/payments", {
        params: { page, limit: 15, method, status },
      });
      setData(res.data);
    } catch (e) {
      console.error("Payments error:", e.response?.data || e.message);
      toast.error("Could not load payment history");
    } finally {
      setLoading(false);
    }
  }, [page, method, status]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api
      .get("/api/admin/payment-settings")
      .then((r) => {
        const d = r.data;
        setCod({
          codEnabled: d.codEnabled !== false,
          codMinAmount: d.codMinAmount || 0,
          codMaxAmount: d.codMaxAmount || 0,
        });
        setMinInput(String(d.codMinAmount || 0));
        setMaxInput(String(d.codMaxAmount || 0));
      })
      .catch(() => {});
  }, []);

  const saveCod = async (patch, okMessage) => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await api.put("/api/admin/payment-settings", patch);
      const d = res.data;
      setCod({
        codEnabled: d.codEnabled !== false,
        codMinAmount: d.codMinAmount || 0,
        codMaxAmount: d.codMaxAmount || 0,
      });
      toast.success(okMessage);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not update COD setting");
    } finally {
      setSaving(false);
    }
  };

  const toggleCod = () =>
    saveCod(
      { codEnabled: !codEnabled },
      !codEnabled ? "COD enabled for users" : "COD disabled for users"
    );

  const saveRange = () =>
    saveCod(
      { codMinAmount: Number(minInput) || 0, codMaxAmount: Number(maxInput) || 0 },
      "COD range saved"
    );

  const rangeText = () => {
    const { codMinAmount: min, codMaxAmount: max } = cod;
    if (!min && !max) return "No limit: COD is offered for every order amount.";
    if (min && max) return `COD is offered for orders from ${money(min)} to ${money(max)}.`;
    if (min) return `COD is offered for orders of ${money(min)} or more.`;
    return `COD is offered for orders up to ${money(max)}.`;
  };

  const summary = data.summary || {};
  const payments = data.payments || [];

  return (
    <div className="min-w-0 space-y-6">
      {/* HEADER */}
      <div className="rounded-2xl bg-gradient-blue-red px-6 py-6 text-white shadow">
        <h1 className="text-2xl font-bold sm:text-3xl">Payments</h1>
        <p className="mt-1 text-sm text-white/90">Payment history and checkout options</p>
      </div>

      {/* COD SWITCH */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div>
          <h2 className="font-semibold text-[#0f172a]">Cash on Delivery</h2>
          <p className="text-sm text-gray-500">
            {codEnabled
              ? "Users can choose COD at checkout."
              : "COD shows as unavailable at checkout and is blocked on the server."}
          </p>
        </div>

        <button
          type="button"
          onClick={toggleCod}
          disabled={saving}
          aria-pressed={codEnabled}
          aria-label="Toggle Cash on Delivery"
          className={`relative h-7 w-14 shrink-0 rounded-full transition ${
            codEnabled ? "bg-green-500" : "bg-gray-300"
          } ${saving ? "opacity-60" : ""}`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
              codEnabled ? "left-8" : "left-1"
            }`}
          />
        </button>
      </div>

      {/* COD RANGE */}
      <div
        className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${
          codEnabled ? "" : "opacity-60"
        }`}
      >
        <h2 className="font-semibold text-[#0f172a]">COD order range</h2>
        <p className="text-sm text-gray-500">
          Choose the order amounts for which you accept COD. Use 0 for no limit.
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="text-sm">
            <span className="mb-1 block text-gray-500">Minimum order ({"\u20B9"})</span>
            <input
              type="number"
              min="0"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              className="w-40 rounded-lg border border-gray-200 px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-gray-500">Maximum order ({"\u20B9"})</span>
            <input
              type="number"
              min="0"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              className="w-40 rounded-lg border border-gray-200 px-3 py-2"
            />
          </label>

          <button
            type="button"
            onClick={saveRange}
            disabled={saving}
            className="rounded-lg bg-gradient-blue-red px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Save range
          </button>
        </div>

        <p className="mt-3 text-sm font-medium text-[#0f172a]">Current rule: {rangeText()}</p>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total Paid", summary.totalPaid],
          ["Online Payments", summary.online],
          ["COD Payments", summary.cod],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 break-all text-2xl font-bold text-[#0f172a]">{money(value)}</p>
          </div>
        ))}
      </div>

      {/* HISTORY */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#0f172a]">Payment History</h2>

          <div className="flex gap-2">
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

            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
            >
              <option value="">All status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Method</th>
                <th className="py-2 pr-4">Payment ID</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No payments found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs">#{String(p._id).slice(-6)}</td>
                    <td className="py-3 pr-4">{p.user}</td>
                    <td className="py-3 pr-4 uppercase">{p.method}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-gray-500">
                      {p.razorpayPaymentId || "-"}
                    </td>
                    <td className="py-3 pr-4 font-medium">{money(p.amount)}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${badge(
                          p.status
                        )}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString("en-IN")}
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

          <span className="text-gray-500">
            Page {page} of {data.pages || 1}
          </span>

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