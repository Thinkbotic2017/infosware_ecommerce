"use client";

import { useAuth } from "@/app/context/AuthContext";
import api, { BASE_URL } from "@/app/lib/axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  useParams,
  useSearchParams
  
} from "next/navigation";

import { FaStar } from "react-icons/fa";
import Review from "@/app/components/Review";
import OrderSummary from "@/app/components/OrderSummary";

const steps = [
  { key: "PENDING", label: "Order Confirmed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
  { key: "DELIVERED", label: "Delivered" },
];

export default function OrderDetails() {
  const params = useParams();

  const orderId = params.id;
  const searchParams =
  useSearchParams();

const productId =
  searchParams.get("product");
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/api/user/order/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    if (user && orderId) fetchOrder();
  }, [user, orderId]);
const item =

  order?.items?.find(

    (product) =>

      (
        product.productId?._id ||

        product.productId
      ) === productId

  ) ||

  order?.items?.[0];
  // ✅ Find which step index the current status is at
  const currentStep = steps.findIndex((s) => s.key === item?.status);

  if (loading) return <div className="p-10 text-center text-lg font-semibold">Loading...</div>;
  if (!order || !item) return <div className="p-10 text-center text-lg font-semibold">No Order Found</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">

            {/* HEADER */}
            <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-lg font-bold text-[#0f172a]">Order Details</h1>
                <p className="text-sm text-gray-500 mt-1">Order ID : {order?._id}</p>
              </div>
              <span className="px-4 py-2 rounded-full bg-green-100 text-green-600 text-xs font-bold">
                {order?.payment?.status?.toUpperCase() || "PAID"}
              </span>
            </div>

            {/* PRODUCT */}
            <div className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row gap-6">

                {/* IMAGE */}
                <div className="w-full lg:w-[120px] h-[120px] rounded-sm overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                  <Image
                    unoptimized
                    src={
                      item?.img
                        ? `${BASE_URL}/${item.img}`
                        : item?.productId?.img
                          ? `${BASE_URL}/${item.productId.img}`
                          : "/no-image.png"
                    }

              
                    width={120}
                    height={120}
                    alt={item?.title || item?.productId?.name || "Product"}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* DETAILS */}
                <div className="flex-1">
                  <p className="text-primary-blue font-medium text-sm">
                    {item?.category || item.productId?.category || "N/A"}
                  </p>
                  <h2 className="text-xl font-bold text-[#0f172a] mt-1">
                    {item?.title || item?.productId?.name || "Product"}
                  </h2>
                  <h3 className="text-2xl font-bold text-primary-red mt-2">₹{item?.price}</h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-5">
                    <div>
                      <p className="text-xs text-gray-500">Quantity</p>
                      <h4 className="font-semibold text-sm mt-1">{item?.quantity}</h4>
                    </div>
                    {
  item?.imageColor?.trim() && (

    <div>

      <p className="text-xs text-gray-500">

        Color

      </p>

      <div
        className="
          flex
          items-center
          gap-2
          mt-1
        "
      >

        <span
          className="
            w-4
            h-4
            rounded-full
            border
            border-gray-300
          "
          style={{
            backgroundColor:
              item.imageColor
          }}
        />

        <h4
          className="
            font-semibold
            text-sm
            capitalize
          "
        >

          {item.imageColor}

        </h4>

      </div>

    </div>

  )
}
                    <div>
                      <p className="text-xs text-gray-500">Payment</p>
                      <h4 className="font-semibold text-sm mt-1">{order?.payment?.status || "PAID"}</h4>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ordered On</p>
                      <h4 className="font-semibold text-sm mt-1">
                        {new Date(order?.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ DYNAMIC TIMELINE — reads from order.status + order.statusHistory */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h3 className="text-sm font-semibold text-gray-500 mb-6 uppercase tracking-wide">
                  Order Tracking
                </h3>

                <div className="relative">
                  {/* VERTICAL LINE — only up to currentStep */}
                  <div className="absolute left-[7px] top-2 w-[2px] bg-gray-200"
                    style={{ height: "calc(100% - 16px)" }}
                  />
                  {/* ✅ FILLED LINE — grows as order progresses */}
                  <div
                    className="absolute left-[7px] top-2 w-[2px] bg-gradient-blue-red transition-all duration-500"
                    style={{
                      // Each step is ~64px apart (space-y-8 = 32px + content)

                      height: currentStep <= 0 ? "0px" : `${(currentStep / (steps.length - 1)) * 100}%`,
                    }}
                  />

                  <div className="space-y-8">
                    {steps.map((step, index) => {
                      const isCompleted = index <= currentStep;
                      const isActive = index === currentStep;

                      // ✅ Get date from statusHistory for this step
                      const historyEntry = item?.statusHistory?.find(
                        (h) => h.status === step.key
                      );

                      const stepDate =
                        step.key === "PENDING"
                          ? new Date(order?.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                          : historyEntry
                            ? new Date(historyEntry.updatedAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })
                            : null;

                      return (
                        <div key={step.key} className="relative flex gap-5 items-start">

                          {/* ✅ DOT — filled + colored if completed, hollow if not yet */}
                          <div
                            className={`relative z-10 w-4 h-4 rounded-full shrink-0 border-2 mt-0.5 transition-all duration-300
                              ${isCompleted
                                ? "bg-gradient-blue-red border-transparent shadow-md"
                                : "bg-white border-gray-300"
                              }`}
                          />

                          <div>
                            {/* STEP LABEL */}
                            <div className="flex items-center gap-2">
                              <h3 className={`font-bold text-sm ${isCompleted ? "text-[#0f172a]" : "text-gray-400"
                                }`}>
                                {step.label}
                              </h3>

                              {/* ✅ "In Progress" badge — only on current active step */}
                              {isActive && item?.status !== "DELIVERED" && (
                                <span className="text-[10px] font-bold text-white bg-primary-blue px-2 py-0.5 rounded-full animate-pulse">
                                  In Progress
                                </span>
                              )}

                              {/* ✅ Delivered badge */}
                              {step.key === "DELIVERED" && isCompleted && (
                                <span className="text-[10px] font-bold text-white bg-green-500 px-2 py-0.5 rounded-full">
                                  ✓ Delivered
                                </span>
                              )}
                            </div>

                            {/* ✅ DATE — show if available, else "Pending" */}
                            <p className={`text-xs mt-0.5 ${stepDate ? "text-gray-500" : "text-gray-300"
                              }`}>
                              {stepDate ?? "Pending"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* review */}


              {item.deliveredAt && (

                <Review

                  productId={
                    item?.productId?._id
                  }

                />

              )
              }

            </div>

          </div>
        </div>


        {/* RIGHT */}
        <div className="space-y-4">

          {/* SHIPPING */}
          <div className="bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-primary-blue">Shipping Address</h2>
            <div className="space-y-2 mt-3">
              <h3 className="font-semibold text-lg text-[#0f172a]">{order?.shippingAddress?.fullName}</h3>
              <p className="text-gray-600">Phone : {order?.shippingAddress?.mobile}</p>
              <p className="text-gray-600 leading-relaxed">
                {order?.shippingAddress?.address}, {order?.shippingAddress?.city}, {order?.shippingAddress?.state}
              </p>
            </div>
          </div>

          {/* BILLING */}
          <div className="bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-primary-blue">Billing Address</h2>
            <div className="space-y-2 mt-3">
              <h3 className="font-semibold text-lg text-[#0f172a]">{order?.billingAddress?.fullName}</h3>
              <p className="text-gray-600">Phone : {order?.billingAddress?.mobile}</p>
              <p className="text-gray-600 leading-relaxed">
                {order?.billingAddress?.address}, {order?.billingAddress?.city}, {order?.billingAddress?.state}
              </p>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          {/* <div className="bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-bold text-primary-red mb-6">Order Summary</h2>
          <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
            <span className="text-xl font-semibold text-[#0f172a]">Total</span>
            <span className="text-xl font-semibold text-primary-red">₹{order?.orderSummary?.total}</span>
          </div>
        </div> */}



          <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-md mb-4">

           

            <h2 className="text-2xl font-bold text-primary-red mb-6">

              Order Summary

            </h2>

            <div className="space-y-4">

              {order?.orderSummary?.pricingDetails?.map(

                (item, index) => (

                  <div
                    key={index}
                    className={`
                      flex justify-between items-center
      
${item.label ===
                        "Order Total"

                        ? "pt-4 mt-4 border-t border-gray-200"

                        : ""
                      }
`}
                  >

                    <span
                      className={`

${item.label ===
                          "Order Total"

                          ? "text-xl font-bold text-[#0f172a]"

                          : "text-gray-600"
                        }`}
                    >

                      {item.label}

                    </span>

                    <span
                      className={`

                  ${item.label ===
                          "Order Total"

                          ? "text-xl font-bold text-primary-red"

                          : "text-gray-800"
                        }`}
                    >

                      ₹

                      {Number(
                        item.value
                      ).toFixed(2)}

                    </span>

                  </div>
                )
              )}

            </div>

          </div>

{/* <OrderSummary  /> */}

        </div>
      </div>
    </div>
  );
}