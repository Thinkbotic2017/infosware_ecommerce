export const STEPS = [
  { key: "PENDING", label: "Order Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PACKED", label: "Packed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

export const prettyStatus = (s = "") =>
  s.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// Overall status of an order, worked out from its items
export function getOrderStatus(order) {
  const items = order?.items || [];
  if (!items.length) return "PENDING";
  const active = items.filter((i) => i.status !== "CANCELLED");
  if (!active.length) return "CANCELLED";
  if (active.every((i) => i.status === "DELIVERED")) return "DELIVERED";
  const rank = (s) => STEPS.findIndex((x) => x.key === s);
  return active.reduce((a, b) => (rank(a.status) <= rank(b.status) ? a : b)).status;
}

// Hide orders whose payment never completed.
// If your old Cashfree orders disappear, add their payment.status value here.
export const isPaid = (order) => {
  const s = String(order?.payment?.status || "").toLowerCase();
  return s !== "pending" && s !== "failed";
};

export const statusColor = (s) =>
  s === "DELIVERED"
    ? "bg-green-50 text-green-700"
    : s === "CANCELLED"
    ? "bg-red-50 text-red-600"
    : "bg-blue-50 text-primary-blue";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export const imgUrl = (img) =>
  !img ? "/product-1.jpg" : img.startsWith("http") ? img : `${API}/uploads/${img.replace(/^\/?uploads\//, "")}`;