"use client"
import Pagination from "@/app/components/Pagination";
import { useAuth } from "@/app/context/AuthContext";
import api, { BASE_URL } from "@/app/lib/axios";
import Image from "next/image";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";


const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);

  const [totalPages,
    setTotalPages] =
    useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get(`api/admin/recentOrders?page=${page}&limit=4`);

        const data = res.data.data;
        setTotalPages(res.data.totalPages);
        console.log("recentOrders", data);

        if (
          Array.isArray(data)
        ) {

          setOrders(data);

        } else {

          setOrders([]);
        }
      } catch (err) {
        setOrders([]);
      }
    };
    fetchOrders();
  }, [user, page]);

  const handleRowClick = (
    orderId,
    productId
  ) => {

    router.push(

      `/admin/setting/recentOrders/${orderId}?product=${productId}`

    );
  };

  return (

    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>

          <h1 className="text-3xl font-bold text-[#0f172a]">

            Orders Management

          </h1>

          <p className="text-gray-500 mt-1">

            Track and manage customer orders

          </p>

        </div>

        <div className="bg-primary-blue/10 text-primary-blue px-5 py-3 rounded-2xl font-semibold self-start sm:self-auto">

          {orders.length}
          {" "}
          Total Orders

        </div>

      </div>

      {/* EMPTY */}

      {orders.length === 0 ? (

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-20 text-center">

          <h2 className="text-2xl font-bold text-[#0f172a]">

            No Orders Found

          </h2>

          <p className="text-gray-500 mt-2">

            Orders will appear here

          </p>

        </div>

      ) : (

        <div className="space-y-5">

          {orders.map((order) => (

            <div
              key={order._id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >

              {/* ORDER HEADER */}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-5 border-b border-gray-100 bg-gray-50">

                <div>

                  <h2 className="text-lg font-bold text-[#0f172a]">

                    Order ID:
                    {" "}
                    <span className="text-primary-blue">

                      #{order._id.slice(-6)}

                    </span>

                  </h2>

                  {/* <p className="text-sm text-gray-500 mt-1">

                User:
                {" "}
                {order.userId?.firstName}

              </p> */}

                </div>

                {/* STATUS */}

                <div className="self-start sm:self-auto">
  <div
    className={`w-fit px-4 py-2 rounded-full text-xs font-semibold ${
      order.payment?.status === "pending"
        ? "bg-red-100 text-red-600"
        : "bg-green-100 text-green-600"
    }`}
  >
    {order.payment?.status}
  </div>
</div>

              </div>

              {/* PRODUCTS */}

              <div className="divide-y divide-gray-100">

                {order.items.map(
                  (item, idx) => (

                    <div
                      key={
                        item.productId
                          ?._id ||
                        item.productId ||
                        idx
                      }
                      onClick={() =>
                        handleRowClick(

                          order._id,

                          item.productId
                            ?._id ||
                          item.productId
                        )
                      }
                      className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 sm:p-6 hover:bg-gray-50 transition cursor-pointer"
                    >

                      {/* IMAGE */}

                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 mx-auto sm:mx-0">
                        <Image
                          src={

                            item.img
                              ? `${BASE_URL}/${item.img}`
                              : item.productId?.img
                                ? `${BASE_URL}/${item.productId.img}`
                                : "/no-image.png"
                          }
                          alt={
                            item.title ||
                            item.productId?.name ||
                            "Product"
                          }
                          width={100}
                          height={100}
                          unoptimized
                          className="w-full h-full object-contain"
                        />

                      </div>

                      {/* DETAILS */}

                      <div className="flex-1 text-center sm:text-left">

                        <h3 className="text-lg font-bold text-[#0f172a]">

                          {item.productId?.name}

                        </h3>

                        <div className="flex items-center justify-center sm:justify-start gap-3 mt-3 flex-wrap">

                          <p className="text-xl font-bold text-primary-blue">

                            ₹{item.price}

                          </p>

                          <p className="text-gray-400 line-through">

                            ₹{item.oldPrice || "N/A"}

                          </p>

                        </div>

                        <div className="flex justify-center sm:justify-start mt-4">

                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">

                            Qty:
                            {" "}
                            {item.quantity || 1}

                          </span>

                        </div>

                      </div>

                      {/* RIGHT SIDE */}

                      <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">

                        {/* DATE */}

                        <div>

                          <p className="text-xs text-gray-500">

                            Order Date

                          </p>

                          <p className="text-sm font-medium text-[#0f172a]">

                            {order.deliveredAt

                              ? new Date(
                                order.deliveredAt
                              ).toLocaleDateString()

                              : new Date(
                                order.createdAt
                              ).toLocaleDateString()}
                          </p>

                        </div>

                        {/* VIEW */}

                        <button className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-blue-red text-white text-sm font-semibold hover:opacity-90 transition">

                          View Details

                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          ))}
          <div className="flex justify-center mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>

      )}

    </div>

  )
};

export default AdminOrders;