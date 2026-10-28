"use client";

import { useEffect, useState }
from "react";

import Image from "next/image";

import Link from "next/link";

import toast from "react-hot-toast";

import api, {
  BASE_URL,
} from "@/app/lib/axios";

import {
  FaTrash,
  FaPlus,
} from "react-icons/fa";

import { MdEdit }
from "react-icons/md";
import Pagination from "@/app/components/Pagination";

export default function Page() {

  const [categories,
    setCategories] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

    const [page,
    setPage] =
    useState(1);

const [totalPages,
setTotalPages] =
useState(1);

  // FETCH

  const fetchCategories =
    async () => {
      try {
        const response =
          await api.get(
            `api/admin/landingpage/categories?page=${page}&limit=4`
          );

        setCategories(
          Array.isArray(
            response.data.data
          )
          
          
            ? response.data.data
            : []
        );
setTotalPages(response.data.totalPages);

      } catch (error) {

        console.log(error);

        toast.error(
          "Failed to fetch categories"
        );

      } finally {
        setLoading(false);
      }
    };

  // DELETE

  const deleteCategory =
    async (id) => {
      try {
        const confirmDelete =
          window.confirm(
            "Delete category?"
          );

        if (!confirmDelete)
          return;

        await api.delete(
          `api/admin/landingpage/category/${id}`
        );
        toast.success(
          "Category deleted"
        );

        setCategories((prev) =>
          prev.filter(
            (item) =>
              item._id !== id
          )
        );
      } catch (error) {

        console.log(error);

        toast.error(
          "Delete failed"
        );

      }
    };

  useEffect(() => {

    fetchCategories();

  }, [page]);

  return (

    <div>

      {/* HEADER */}

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

        <div>

          <h1 className="text-3xl font-bold text-[#0f172a]">

            Categories

          </h1>

          <p className="text-gray-500 mt-1">

            Manage ecommerce categories

          </p>

        </div>

        <Link
          href="/admin/category/add/"
          className="flex items-center justify-center gap-3 px-5 py-3 rounded-2xl bg-gradient-blue-red text-white font-semibold shadow-md hover:opacity-90 transition self-start"
        >

          <FaPlus />

          Add Category

        </Link>

      </div>

      {/* TABLE */}

     <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">

        {/* HEADER */}

        <div className="grid grid-cols-3 min-w-[500px] gap-4 px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">

          <div>Image</div>

          <div>Category</div>

          <div className="text-center">

            Actions

          </div>

        </div>

        {/* BODY */}

        {loading ? (

          <div className="py-20 text-center text-gray-500">

            Loading...

          </div>

        ) : categories.length ===
          0 ? (

          <div className="py-20 text-center text-gray-500">

            No categories found

          </div>

        ) : (

          categories.map(
            (item) => (

              <div
                key={item._id}
                
        className="grid grid-cols-3 min-w-[500px] gap-4 items-center px-4 sm:px-6 py-3 border-b border-gray-100 hover:bg-gray-50 transition"
              >

                {/* IMAGE */}

              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-gray-100">

                  <Image
                    unoptimized
                    src={`${BASE_URL}/${item.img}`}
                    alt={item.category}
                    fill
                    className="object-cover"
                  />

                </div>

                {/* CATEGORY */}

                <div>

                <h3 className="font-bold text-sm sm:text-base text-[#0f172a] break-words">

                    {item.category}

                  </h3>

                </div>

                {/* CREATED */}

                {/* <div className="text-sm text-gray-500">

                  {new Date(
                    item.createdAt
                  ).toLocaleDateString()}

                </div> */}

                {/* ACTIONS */}

          <div className="flex items-center justify-center gap-2 sm:gap-3">
                  {/* EDIT */}


                  <Link
                    href={`/admin/category/edit/${item._id}`}
                    className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition flex items-center justify-center"
                  >

                    <MdEdit />

                  </Link>

                  {/* DELETE */}

                  <button
                    onClick={() =>
                      deleteCategory(
                        item._id
                      )
                    }
                    className="w-10 h-10 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center justify-center"
                  >
                    <FaTrash />

                  </button>

                </div>

              </div>

            )
          )
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