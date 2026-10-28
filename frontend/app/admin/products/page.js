"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import Image from "next/image";

import api, {
  BASE_URL,
} from "@/app/lib/axios";

import toast from "react-hot-toast";

import {
  FaTrash,
  FaCopy,
  FaPlus,
} from "react-icons/fa";

import { MdEdit } from "react-icons/md";

import Searchbar
from "@/app/components/admin/Searchbar";
import Pagination from "@/app/components/Pagination";

export default function Page() {

  const [products, setProducts] =
    useState([]);

  const [
    filteredProducts,

    setFilteredProducts

  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  // FETCH PRODUCTS
const [page,
    setPage] =
    useState(1);
const [totalPages,
setTotalPages] =
useState(1);
  const fetchProducts =
    async () => {

      try {

        const response =
          await api.get(
            `/api/admin/productpage?page=${page}&limit=6`);

        const allProducts =
          Array.isArray(
            response.data.data
          )
            ? response.data.data
            : [];

        setProducts(allProducts);
setTotalPages(
response.data.totalPages
);
        setFilteredProducts(
          allProducts
        );

      } catch (error) {

        console.log(error);

        toast.error(
          "Failed to fetch products"
        );

      } finally {

        setLoading(false);

      }
    };

  // DELETE PRODUCT

  const deleteProduct =
    async (id) => {

      try {

        const confirmDelete =
          window.confirm(
            "Delete this product?"
          );

        if (!confirmDelete)
          return;

        await api.delete(
          `/api/admin/productpage/${id}`
        );

        toast.success(
          "Product deleted"
        );

        const updatedProducts =
          products.filter(
            (item) =>
              item._id !== id
          );

        setProducts(
          updatedProducts
        );

        setFilteredProducts(
          updatedProducts
        );

      } catch (error) {

        console.log(error);

        toast.error(
          "Delete failed"
        );

      }
    };

  // FILTER PRODUCTS

  const handleFilter = () => {

    const filtered =
      products.filter(
        (product) => {

          return (

            product.name
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||

            product.category
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||

            product.Brand
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              )

          );
        }
      );

    setFilteredProducts(
      filtered
    );
  };

  // RESET FILTER

  const handleReset = () => {

    setSearch("");

    setFilteredProducts(
      products
    );
  };

  useEffect(() => {

    fetchProducts();

  }, [page]);

  return (

    <div className="min-h-screen">

      {/* HEADER */}

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-8">

        <div>

          <h1 className="text-3xl font-bold text-[#0f172a]">

            All Products

          </h1>

          <p className="text-gray-500 mt-1">

            Manage all ecommerce products

          </p>

        </div>

        {/* ADD PRODUCT */}

        <Link
          href="/admin/products/add"
          className="flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-gradient-blue-red text-white font-semibold shadow-md hover:opacity-90 transition w-fit"
        >

          <FaPlus />

          Add Product

        </Link>

      </div>

      {/* SEARCHBAR */}

      <Searchbar

        search={search}

        setSearch={setSearch}

        placeholder="Search products..."

        onFilter={handleFilter}

        onReset={handleReset}

      />

      {/* LOADING */}

      {loading ? (

        <div className="text-center py-20 text-lg font-semibold text-gray-500">

          Loading products...

        </div>

      ) : filteredProducts.length ===
        0 ? (

        <div className="text-center py-20 text-gray-500">

          No products found

        </div>

      ) : (

        <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
          <div className="min-w-[800px]">
          {/* TABLE HEADER */}

          <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-gray-100 border-b border-gray-100 text-sm font-semibold text-gray-600">

            <div>Image</div>

            <div className="col-span-2">

              Product

            </div>

            <div>Price</div>

            <div>Status</div>

            <div className="text-center">

              Actions

            </div>

          </div>

          {/* PRODUCTS */}

          {filteredProducts.map(
            (product) => (

              <div
                key={product._id}
                className="grid grid-cols-6 gap-4 items-center px-6 py-5 border-b border-gray-100 hover:bg-gray-50 transition"
              >

                {/* IMAGE */}

                <div className="relative w-20 h-20 rounded-2xl overflow-hidden">

                  <Image
                    unoptimized
                    src={`${BASE_URL}/${product.img}`}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                  />

                </div>

                {/* PRODUCT */}

                <div className="col-span-2">

                  <h3 className="font-semibold text-[#0f172a] line-clamp-1">

                    {product.name}

                  </h3>

                  <p className="text-sm text-gray-500 mt-1">

                    ID:
                    {" "}
                    {product._id.slice(0, 8)}

                  </p>

                </div>

                {/* PRICE */}

                <div>

                  {product.catalogStatus === "draft" &&
                  product.estimatedPriceMin != null &&
                  product.estimatedPriceMax != null ? (
                    <>
                      <h3 className="font-bold text-amber-700">
                        ₹{product.estimatedPriceMin}–₹{product.estimatedPriceMax}
                      </h3>
                      <p className="text-xs text-amber-700">Estimate only</p>
                    </>
                  ) : (
                    <h3 className="font-bold text-[#0f172a]">
                      ₹{product.price}
                    </h3>
                  )}

                  {product.catalogStatus !== "draft" && product.oldPrice > 0 && (

                    <p className="text-xs text-gray-400 line-through">

                      ₹{product.oldPrice}

                    </p>

                  )}

                </div>

                {/* STATUS */}

                <div>

                  <span
                    className={`px-3 py-1 rounded-md text-xs font-semibold ${
                      product.catalogStatus === "draft"
                        ? "bg-amber-100 text-amber-700"
                        : product.stock > 0
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                    }`}
                  >

                    {product.catalogStatus === "draft"
                      ? "Draft · Not for sale"
                      : product.stock > 0
                        ? "In Stock"
                        : "Out of Stock"}

                  </span>

                </div>

                {/* ACTIONS */}

                <div className="flex items-center justify-center gap-3">

                  {/* EDIT */}

                  <Link
                    href={`/admin/products/edit/${product._id}`}
                    className="w-8 h-8 rounded-xl bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition flex items-center justify-center"
                  >

                    <MdEdit size={18} />

                  </Link>

                  {/* DUPLICATE */}

                  <Link
                    href={`/admin/products/duplicate/${product._id}`}
                    className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition flex items-center justify-center"
                  >

                    <FaCopy size={15} />

                  </Link>

                  {/* DELETE */}

                  <button
                    onClick={() =>
                      deleteProduct(
                        product._id
                      )
                    }
                    className="w-8 h-8 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center justify-center"
                  >

                    <FaTrash size={14} />

                  </button>

                </div>

              </div>

            )
          )}
          </div>

          <Pagination


                  currentPage={page}

                  totalPages={totalPages}

                  onPageChange={setPage}
                />
        </div>

      )}

    </div>
  );
}