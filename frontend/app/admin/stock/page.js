"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import toast from "react-hot-toast";

import api, {
  BASE_URL,
} from "@/app/lib/axios";

import { MdEdit }
from "react-icons/md";
import Pagination from "@/app/components/Pagination";

export default function Page() {
const [page,
    setPage] =
    useState(1);
const [totalPages,
setTotalPages] =
useState(1);
  const [products,
    setProducts] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  // FETCH PRODUCTS

  const fetchProducts =
    async () => {

      try {

        const res =
          await api.get(
            `/api/admin/productpage?page=${page}&limit=6`
          );

        setProducts(
          Array.isArray(
            res.data.data
          )
            ? res.data.data
            : []
        );
setTotalPages(
res.data.totalPages
);
      } catch (error) {

        console.log(error);

        toast.error(
          "Failed to fetch stock"
        );

      } finally {

        setLoading(false);

      }
    };

  useEffect(() => {

    fetchProducts();

  }, [page]);

  // STATUS

  const getStockStatus =
    (stock) => {

      if (stock === 0) {

        return {
          text: "Out of Stock",
          class:
            "bg-red-100 text-red-600",
        };
      }

      if (stock <= 5) {

        return {
          text: "Few Left",
          class:
            "bg-yellow-100 text-yellow-700",
        };
      }

      return {
        text: "In Stock",
        class:
          "bg-green-100 text-green-600",
      };
    };

  return (

    <div>

      {/* HEADER */}

      <div className="mb-8">

  <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">

          Total Stocks

        </h1>

        {/* <p className="text-gray-500 mt-1">

          Manage product inventory

        </p> */}

      </div>

      {/* TABLE */}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">

        {/* TABLE HEADER */}
<div className="grid grid-cols-5 min-w-[700px] gap-4 px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
        

          <div>Image</div>

          <div className="col-span-2">

            Product

          </div>

          <div>Stock</div>

          <div className="text-center">

            Status

          </div>

        </div>

        {/* BODY */}

        {loading ? (

          <div className="py-20 text-center text-gray-500">

            Loading...

          </div>

        ) : products.length ===
          0 ? (

          <div className="py-20 text-center text-gray-500">

            No products found

          </div>

        ) : (

          products.map((item) => {

            const status =
              getStockStatus(
                item.stock
              );

            return (

              <div
                key={item._id}
className="
grid
grid-cols-5
min-w-[700px]
gap-4
items-center
px-4
sm:px-6
py-4
border-b
border-gray-100
hover:bg-gray-50
transition
"             >

                {/* IMAGE */}

              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-100">

                  <Image
                    unoptimized
                    src={`${BASE_URL}/${item.img}`}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />

                </div>

                {/* PRODUCT */}

       <div className="col-span-2">

                  <h3 className="font-medium text-md text-[#0f172a]">

                    {item.name}

                  </h3>

                  <p className="text-sm text-gray-500 mt-1">

                    {item.category}

                  </p>

                </div>

                {/* STOCK */}

                <div>

                  <div className="flex items-center gap-3">

                    <span className="text-md font-semibold text-[#0f172a]">

                      {item.stock}

                    </span>
{/* 
                    <button className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition flex items-center justify-center">

                      <MdEdit />

                    </button> */}

                  </div>

                </div>

                {/* STATUS */}

                <div className="flex justify-center">

                  <span
                    className={`px-4 py-2 rounded-md text-xs font-semibold ${status.class}`}
                  >

                    {status.text}

                  </span>

                </div>

              </div>

            );
          })
        )}

      </div>
       <div className="flex justify-center mt-6">
  <Pagination
    currentPage={page}
    totalPages={totalPages}
    onPageChange={setPage}
  />
</div>
    </div>
  );
}