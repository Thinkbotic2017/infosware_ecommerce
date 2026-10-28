"use client";

import React,
{
  useEffect,
  useState,
  useRef
} from "react";

import {
  useParams
} from "next/navigation";

import jsPDF
  from "jspdf";

import api,
{
  BASE_URL
}
  from "@/app/lib/axios";

import Image
  from "next/image";
import html2canvas
  from "html2canvas";
export default function OrderInvoice() {
  const params =
    useParams();

  const orderId =
    params?.id;

  const [order,
    setOrder] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);

  const invoiceRef =
    useRef();

  // FETCH ORDER

  useEffect(() => {

    const fetchOrder =
      async () => {

        try {

          const res =
            await api.get(

              `/api/user/order/${orderId}`
            );

          console.log("invoice ", res.data)
          setOrder(
            res.data
          );

        } catch (error) {

          console.log(error);

          setOrder(null);

        } finally {

          setLoading(false);
        }
      };

    if (orderId) {

      fetchOrder();
    }

  }, [orderId]);

  const preloadImages =
    async () => {

      const images =
        document.images;

      const promises =
        [...images].map(
          (img) => {

            return new Promise(
              (resolve) => {

                if (img.complete)
                  return resolve();

                img.onload =
                  resolve;

                img.onerror =
                  resolve;
              }
            );
          }
        );

      await Promise.all(
        promises
      );
    };

  // DOWNLOAD PDF


  const handleDownload =
    async () => {

      try {

        const input =
          invoiceRef.current;

        if (!input) return;
        await preloadImages();
        const canvas =
          await html2canvas(

            input,

            {

              scale: 3,

              useCORS: true,
              imageTimeout: 0,

              allowTaint: true,

              backgroundColor:
                "#ffffff",

              logging: false,

              onclone: (doc) => {

                const elements =

                  doc.querySelectorAll("*");

                elements.forEach(
                  (el) => {

                    const style =
                      window.getComputedStyle(el);

                    // FIX LAB COLORS

                    if (

                      style.color.includes(
                        "lab"
                      ) ||

                      style.color.includes(
                        "oklch"
                      ) ||

                      style.color.includes(
                        "oklab"
                      )
                    ) {

                      el.style.color =
                        "#000000";
                    }

                    if (

                      style.backgroundColor.includes(
                        "lab"
                      ) ||

                      style.backgroundColor.includes(
                        "oklch"
                      ) ||

                      style.backgroundColor.includes(
                        "oklab"
                      )
                    ) {

                      el.style.backgroundColor =
                        "#ffffff";
                    }

                    if (

                      style.borderColor.includes(
                        "lab"
                      ) ||

                      style.borderColor.includes(
                        "oklch"
                      ) ||

                      style.borderColor.includes(
                        "oklab"
                      )
                    ) {

                      el.style.borderColor =
                        "#e5e7eb";
                    }
                  }
                );
              },
            }
          );

        const imgData =
          canvas.toDataURL(
            "image/png"
          );

        const pdf =
          new jsPDF({

            orientation:
              "portrait",

            unit: "px",

            format: "a4",
          });

        const pdfWidth =
          pdf.internal.pageSize.getWidth();

        const pdfHeight =
          (canvas.height *
            pdfWidth) /

          canvas.width;

        const pageHeight =
          pdf.internal.pageSize.getHeight();

        let heightLeft =
          pdfHeight;

        let position = 0;

        // FIRST PAGE

        pdf.addImage(

          imgData,

          "PNG",

          0,

          position,

          pdfWidth,

          pdfHeight
        );

        heightLeft -=
          pageHeight;

        // MULTIPLE PAGES

        while (
          heightLeft > 0
        ) {

          position =
            heightLeft -
            pdfHeight;

          pdf.addPage();

          pdf.addImage(

            imgData,

            "PNG",

            0,

            position,

            pdfWidth,

            pdfHeight
          );

          heightLeft -=
            pageHeight;
        }

        pdf.save(

          `Invoice-${order?._id}.pdf`
        );

      } catch (error) {

        console.log(
          "PDF Error:",
          error
        );
      }
    };
  // LOADING

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center text-xl font-bold">

        Loading Invoice...

      </div>
    );
  }

  // NO ORDER

  if (!order) {

    return (

      <div className="min-h-screen flex items-center justify-center text-xl font-bold">

        Order Not Found

      </div>
    );
  }

  return (

    <div className="bg-[#f8fafc] min-h-screen py-8 px-4">

      {/* TOP BUTTON */}

      <div className="max-w-5xl mx-auto flex justify-end mb-0">

        {/* <button

          onClick={
            handleDownload
          }

          className="px-6 py-3 rounded-xl bg-gradient-blue-red text-white font-semibold shadow hover:scale-[1.02] transition"
        >

          Download Invoice

        </button> */}

      </div>

      {/* INVOICE */}

      <div

        ref={invoiceRef}

        className="max-w-5xl mx-auto bg-white rounded-md shadow-xl overflow-hidden border border-gray-100"
      >

        {/* HEADER */}

        <div className="  text-white px-6 sm:px-10 pt-8 flex flex-col sm:flex-row justify-between gap-6 bg-[#f8fafc] pb-4">

          <div>

            <h1 className="text-4xl font-bold text-primary-blue tracking-wide">

              INVOICE

            </h1>
            <p className="mt-2 text-sm opacity-90 text-primary-red">

              Thank you for shopping with us

            </p>

          </div>

          <div className="flex flex-col items-start sm:items-end ">

            <div className=" flex items-center justify-center overflow-hidden">

              <img
                src="/favicon.ico"
                alt="logo"
                width={50}
                height={50}
                className="object-contain"
              />

            </div>



          </div>

        </div>

        {/* ORDER INFO */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 sm:px-10 py-8 border-b border-gray-100">

          <div>

            <p className="text-xs uppercase text-gray-400 font-semibold">

              Order ID

            </p>

            <h3 className="font-bold text-[#0f172a] mt-1 break-all">

              {order?._id}

            </h3>

          </div>

          <div>

            <p className="text-xs uppercase text-gray-400 font-semibold">

              Date

            </p>

            <h3 className="font-bold text-[#0f172a] mt-1">

              {

                new Date(
                  order?.createdAt
                ).toLocaleDateString()
              }

            </h3>

          </div>

          <div>

            <p className="text-xs uppercase text-gray-400 font-semibold">

              Payment

            </p>

            <span className="inline-flex mt-2 px-4 py-1.5 rounded-full bg-green-100 text-green-600 text-sm font-bold">

              {
                order?.payment?.status ||
                "PAID"
              }

            </span>

          </div>

        </div>

        {/* ADDRESS */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 sm:px-10 py-8 border-b border-gray-100">

          {/* SHIPPING */}

          <div className="bg-[#f8fafc] rounded-2xl p-6">

            <h2 className="font-bold text-primary-blue mb-4 text-lg">

              Shipping Address

            </h2>

            <div className="space-y-2 text-gray-600">

              <p className="font-semibold text-[#0f172a]">

                {
                  order?.shippingAddress?.fullName
                }

              </p>

              <p>

                {
                  order?.shippingAddress?.address
                }

              </p>

              <p>

                {
                  order?.shippingAddress?.city
                },

                {" "}

                {
                  order?.shippingAddress?.state
                }

              </p>

              <p>

                Pin:
                {" "}

                {
                  order?.shippingAddress?.zipCode
                }

              </p>

              <p>

                Mobile:
                {" "}

                {
                  order?.shippingAddress?.mobile
                }

              </p>

            </div>

          </div>

          {/* BILLING */}

          <div className="bg-[#f8fafc] rounded-2xl p-6">

            <h2 className="font-bold text-primary-blue mb-4 text-lg">

              Billing Address

            </h2>

            <div className="space-y-2 text-gray-600">

              <p className="font-semibold text-[#0f172a]">

                {
                  order?.billingAddress?.fullName
                }

              </p>

              <p>

                {
                  order?.billingAddress?.address
                }

              </p>

              <p>

                {
                  order?.billingAddress?.city
                },

                {" "}

                {
                  order?.billingAddress?.state
                }

              </p>

              <p>

                Pin:
                {" "}

                {
                  order?.billingAddress?.zipCode
                }

              </p>

              <p>

                Mobile:
                {" "}

                {
                  order?.billingAddress?.mobile
                }

              </p>

            </div>

          </div>

        </div>

        {/* PRODUCTS */}

        <div className="px-4 sm:px-10 py-8 overflow-x-auto">

          <table className="w-full min-w-[650px]">

            <thead>

              <tr className="border-b border-gray-200 text-left text-sm text-gray-500">

                <th className="pb-4 font-semibold">

                  Product

                </th>

                <th className="pb-4 font-semibold">

                  Qty

                </th>

                <th className="pb-4 font-semibold">

                  Price

                </th>

                <th className="pb-4 font-semibold">

                  Total

                </th>

              </tr>

            </thead>

            <tbody>

              {order?.items?.map(
                (item, index) => (

                  <tr
                    key={index}
                    className="border-b border-gray-100"
                  >

                    {/* PRODUCT */}

                    <td className="py-5">

                      <div className="flex items-center gap-4">

                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">

                          <Image
                            unoptimized
                            src={

                              item?.img

                                ? `${BASE_URL}/${item.img}`

                                : item?.productId?.img

                                  ? `${BASE_URL}/${item.productId.img}`

                                  : "/no-image.png"
                            }

                            width={80}
                            height={80}
                            alt="product"
                            className="w-full h-full object-cover"
                          />

                        </div>

                        <div>

                          <h3 className="font-bold text-[#0f172a]">

                            {

                              item?.title ||

                              item?.productId?.name
                            }

                          </h3>

                          <p className="text-sm text-gray-500 mt-1">

                            {

                              item?.category ||

                              item?.productId?.category
                            }

                          </p>

                        </div>

                      </div>

                    </td>

                    {/* QTY */}

                    <td className="font-semibold">

                      {item?.quantity}

                    </td>

                    {/* PRICE */}

                    <td className="font-semibold text-primary-red">

                      ₹{item?.price}

                    </td>

                    {/* TOTAL */}

                    <td className="font-bold text-[#0f172a]">

                      ₹
                      {
                        item?.price * item?.quantity
                      }

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

        {/* SUMMARY */}

        {/* SUMMARY */}

        <div className="px-6 sm:px-10 py-8 border-t border-gray-100 bg-[#fcfcfc]">

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
                      }
`}
                  >

                    {item.label}

                  </span>

                  <span
                    className={`

${item.label ===
                        "Order Total"

                        ? "text-xl font-bold text-primary-red"

                        : "text-gray-800"
                      }
`}
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
        {/* FOOTER */}

        <div className="bg-[#f8fafc] px-6 sm:px-10 py-6 text-center text-sm text-gray-500">

          Thank you for shopping with Infosware ❤️

        </div>

      </div>

      <button

        onClick={
          handleDownload
        }
        className="px-6 py-3 rounded-xl bg-gradient-blue-red text-white font-semibold shadow hover:scale-[1.02] transition mt-8"
      >

        Download Invoice

      </button>
    </div>
  );
}