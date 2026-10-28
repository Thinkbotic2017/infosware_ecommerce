"use client";

import Image from "next/image";

import Link from "next/link";

import {
  FaArrowRight,
} from "react-icons/fa";

import {
  useEffect,
  useState,
} from "react";

import api,
{
  BASE_URL,
} from "@/app/lib/axios";

export default function CollectionsSection() {

  const [products,
  setProducts] =
    useState([]);

  // FETCH RECENT PRODUCTS

  useEffect(() => {

    const fetchProducts =
      async () => {

        try {

          const res =
            await api.get(
              "/api/comman/products"
            );

          console.log(
            "product recent",
            res.data.data
          );

          // RECENT PRODUCTS

          const recentProducts =
            res.data.data

              ?.sort(

                (a, b) =>

                  
                  new Date(
                    b.createdAt
                  ) -

                  new Date(
                    a.createdAt
                  )
              )

              ?.slice(0, 3);

          setProducts(
            recentProducts || []
          );

        } catch (error) {

          console.log(error);

        }
      };

    fetchProducts();

  }, []);

  return (

    <div className="px-4 sm:px-6 lg:px-10 py-14 bg-white">

      <div className="max-w-[1400px] mx-auto">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-10">

          <div>

            <div className="flex items-center gap-2 mb-1">

              <span className="w-2 h-2 bg-primary-red rounded-full"></span>

              <p className="text-xs font-medium text-primary-red uppercase tracking-wider">

                Explore

              </p>

            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a]">

              New Arrivals

            </h2>

          </div>

          <Link href="/products">

            <div className="flex justify-center items-center gap-2 text-primary-blue hover:underline cursor-pointer">

              <button className="  text-sm md:text-md font-bold   ">

                View All

              </button>

              <FaArrowRight  className="text-sm"/>

            </div>

          </Link>

        </div>

        {/* CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {products.map(
            (item) => (

              <Link
                href={`/products/${item._id}`}
                key={item._id}
              >

                <div className="relative h-[260px] rounded-3xl overflow-hidden group cursor-pointer">

                  {/* IMAGE */}

                  <Image
                    src={`${BASE_URL}/${item.img}`}
                    alt={item.name}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-fit group-hover:scale-110 transition duration-500"
                  />

                  {/* OVERLAY */}

                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>

                  {/* CONTENT */}

                  <div className="absolute bottom-5 left-5 text-white">

                    <p className="text-xs uppercase tracking-wider opacity-80 ">

                      {item.category}

                    </p>

                    <h3 className="text-xl font-semibold mt-1 ">

                      {item.name}

                    </h3>
{/* 
                    <div className="flex items-center gap-3 mt-2">

                      <p className="text-lg font-bold">

                        ₹{item.price}

                      </p>

                      {item.oldPrice && (

                        <p className="text-sm line-through opacity-70">

                          ₹
                          {item.oldPrice}

                        </p>

                      )}

                    </div> */}

                    <p className="text-sm mt-2 opacity-90 " >

                      Shop Now →

                    </p>

                  </div>

                </div>

              </Link>

            )
          )}

        </div>

      </div>

    </div>
  );
}