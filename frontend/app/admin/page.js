"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaUsers, FaBoxOpen, FaShoppingCart, FaCreditCard } from "react-icons/fa";
import { MdInventory } from "react-icons/md";

import api, { BASE_URL } from "../lib/axios";
import { useAuth } from "../context/AuthContext";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// Order total: orderSummary.total, else totalAmount, else sum of items
const getOrderTotal = (order) => {
  const saved = order?.orderSummary?.total ?? order?.totalAmount;
  if (typeof saved === "number") return saved;
  return (order?.items || []).reduce(
    (sum, item) => sum + Number(item?.price || 0) * Number(item?.quantity || 1),
    0
  );
};

const statusStyle = (status) => {
  const s = String(status || "").toLowerCase();
  if (["paid", "success", "delivered"].includes(s)) return "bg-green-100 text-green-700";
  if (["failed", "cancelled", "canceled"].includes(s)) return "bg-red-100 text-red-700";
  return "bg-orange-100 text-orange-700";
};

export default function AdminDashboard() {
  const { user } = useAuth();

  const [inquiryCount, setInquiryCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [totalSale, setTotalSale] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [cartNotificationCount, setCartNotificationCount] = useState(0);
  const [bulkOrderCount, setBulkOrderCount] = useState(0);
  const [customizationCount, setCustomizationCount] = useState(0);
  const [recentOrder, setRecentOrder] = useState([]);
  const [lowStockProduct, setLowStockProduct] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // INQUIRIES
    api
      .get("api/admin/inquiry")
      .then((res) => {
        const inquiries = Array.isArray(res.data) ? res.data : [];
        setBulkOrderCount(inquiries.filter((i) => i.isBulkOrder).length);
        setCustomizationCount(inquiries.filter((i) => i.isCustomization).length);
      })
      .catch(() => {
        setBulkOrderCount(0);
        setCustomizationCount(0);
      });

    // TOTAL INQUIRIES
    api
      .get("api/admin/inquiry/count")
      .then((res) => setInquiryCount(res.data.count || 0))
      .catch(() => setInquiryCount(0));

    // RECENT ORDERS
    api
      .get("api/admin/recentOrders")
      .then((res) => {
        const list = res.data?.data || [];
        setOrderCount(res.data?.totalDocuments ?? list.length);
        setRecentOrder(list);
      })
      .catch(() => {
        setOrderCount(0);
        setRecentOrder([]);
      });

    // TOTAL SALE (same numbers as the Sales page)
    api
      .get("/api/admin/sales", { params: { limit: 1 } })
      .then((res) => setTotalSale(res.data?.totalSales || 0))
      .catch((err) => {
        console.error("Total sales error:", err.response?.data || err.message);
        setTotalSale(0);
      });

    // USERS
    api
      .get("api/admin/users")
      .then((res) => {
        const usersData = Array.isArray(res.data) ? res.data : [];
        setUsers(usersData);
        setUsersCount(usersData.length);
      })
      .catch(() => setUsersCount(0));

    // PRODUCTS (low stock)
    api
      .get("api/admin/productpage")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setLowStockProduct(list.filter((p) => p.stock <= 5));
      })
      .catch(() => setLowStockProduct([]));

    // CART ALERTS
    api
      .get("api/admin/cart-notifications")
      .then((res) => {
        const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
        const count = Array.isArray(res.data)
          ? res.data.filter((cart) =>
              cart.items.some((item) => new Date(item.addedAt) <= new Date(threeDaysAgo))
            ).length
          : 0;
        setCartNotificationCount(count);
      })
      .catch(() => setCartNotificationCount(0));
  }, [user]);

  // SUMMARY CARDS (each one is a link)
  const summaryCards = [
    {
      title: "Total Users",
      value: usersCount,
      icon: <FaUsers />,
      bg: "bg-blue-100 text-blue-600",
      href: "/admin/user",
    },
    {
      title: "Total Sales",
      value: money(totalSale),
      icon: <FaBoxOpen />,
      bg: "bg-green-100 text-green-600",
      href: "/admin/sales",
    },
    {
      title: "Total Orders",
      value: orderCount,
      icon: <FaShoppingCart />,
      bg: "bg-yellow-100 text-yellow-700",
      href: "/admin/setting/recentOrders",
    },
  ];

  return (
    <div className="min-w-0 space-y-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-blue-red px-6 py-6 text-white shadow">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-white/90">
            Welcome back{user?.username ? `, ${user.username}` : ""}. Here is what is happening in
            your store.
          </p>
        </div>

        <Link
          href="/admin/payments"
          className="flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/30"
        >
          <FaCreditCard /> Payments
        </Link>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="block rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-gray-500">{card.title}</p>
                <h2 className="break-all text-xl font-bold text-[#0f172a] sm:text-2xl lg:text-3xl">
                  {card.value}
                </h2>
              </div>

              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${card.bg}`}
              >
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* MIDDLE */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* RECENT ORDERS */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="text-xl font-bold text-[#0f172a]">Recent Orders</h2>
              <p className="mt-1 text-sm text-gray-500">Latest customer purchases</p>
            </div>

            <Link
              href="/admin/setting/recentOrders"
              className="font-medium text-primary-red hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto p-6">
            <div className="min-w-[300px] space-y-4">
              {recentOrder.length === 0 ? (
                <div className="text-center text-gray-400">No recent orders</div>
              ) : (
                recentOrder.slice(0, 3).map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between rounded-2xl bg-gray-50 p-4"
                  >
                    <div>
                      <h3 className="font-semibold text-[#0f172a]">#{order._id.slice(-6)}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    <div className="text-right">
                      <h3 className="font-bold text-primary-blue">{money(getOrderTotal(order))}</h3>
                      <span
                        className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyle(
                          order.payment?.status
                        )}`}
                      >
                        {order.payment?.status || "pending"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* LOW STOCK */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="text-xl font-bold text-[#0f172a]">Low Stock Products</h2>
              <p className="mt-1 text-sm text-gray-500">Products running out of stock</p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-xl text-red-600">
              <MdInventory />
            </div>
          </div>

          <div className="overflow-x-auto p-6">
            <div className="min-w-[300px] space-y-4">
              {lowStockProduct.length === 0 ? (
                <div className="py-10 text-center text-gray-400">No low stock products</div>
              ) : (
                lowStockProduct.map((low) => (
                  <div
                    key={low._id}
                    className="flex items-center justify-between rounded-2xl bg-gray-50 p-4 transition hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 overflow-hidden rounded-2xl border border-gray-100 bg-white">
                        <img
                          src={`${BASE_URL}/${low.img}`}
                          alt={low.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#0f172a]">{low.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{low.category}</p>
                      </div>
                    </div>

                    {low.stock === 0 ? (
                      <div className="rounded-full bg-red-100 px-4 py-2 text-xs font-semibold text-red-600">
                        Out of Stock
                      </div>
                    ) : (
                      <div className="rounded-full bg-yellow-100 px-4 py-2 text-xs font-semibold text-yellow-700">
                        {low.stock} Left
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* USERS */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="flex justify-between border-b border-gray-100 px-6 py-5">
            <h2 className="text-xl font-bold text-[#0f172a]">Users Overview</h2>

            <Link href="/admin/user" className="font-medium text-primary-red hover:underline">
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[300px] divide-y divide-gray-100">
              {users.length === 0 ? (
                <div className="p-10 text-center text-gray-400">No users found</div>
              ) : (
                users
                  .slice(-3)
                  .reverse()
                  .map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center justify-between px-6 py-5 transition hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-blue-red text-lg font-bold text-white">
                          {u.username?.charAt(0)?.toUpperCase()}
                        </div>

                        <div>
                          <h3 className="font-semibold text-[#0f172a]">{u.username}</h3>
                          <p className="mt-1 text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* INQUIRIES */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-xl font-bold text-[#0f172a]">Inquiry Analytics</h2>
          </div>

          <div className="p-6">
            <div className="grid w-full grid-cols-2 gap-4">
              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-sm text-gray-500">Total Inquiries</p>
                <h3 className="mt-2 text-3xl font-bold text-blue-600">{inquiryCount}</h3>
              </div>

              <div className="rounded-2xl bg-red-50 p-5">
                <p className="text-sm text-gray-500">Bulk Orders</p>
                <h3 className="mt-2 text-3xl font-bold text-red-600">{bulkOrderCount}</h3>
              </div>

              <div className="rounded-2xl bg-yellow-50 p-5">
                <p className="text-sm text-gray-500">Customization</p>
                <h3 className="mt-2 text-3xl font-bold text-yellow-700">{customizationCount}</h3>
              </div>

              <div className="rounded-2xl bg-green-50 p-5">
                <p className="text-sm text-gray-500">Cart Alerts</p>
                <h3 className="mt-2 text-3xl font-bold text-green-600">{cartNotificationCount}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}