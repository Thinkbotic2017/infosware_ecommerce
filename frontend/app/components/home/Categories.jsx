"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import api, { BASE_URL } from "@/app/lib/axios";

function CategorySkeleton() {
  return (
    <div className="flex animate-pulse flex-col items-center">
      <div className="aspect-square w-full max-w-[160px] rounded-full bg-gray-200" />
      <div className="mt-3 h-4 w-2/3 rounded bg-gray-200" />
    </div>
  );
}

export default function CategoryProducts() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("api/comman/categories");
        setCategories(res.data.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="w-full bg-white px-4 py-12 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        {/* HEADER */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0f172a]">
              Shop by categories
            </h2>
            <p className="mt-1 text-sm text-gray-500">Find what you need faster.</p>
          </div>

          {/* ARROWS */}
          {categories.length > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Previous categories"
                className="cat-prev flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-primary-blue hover:text-primary-blue disabled:opacity-40 [&.swiper-button-disabled]:cursor-not-allowed [&.swiper-button-disabled]:opacity-40"
              >
                <FaChevronLeft size={12} />
              </button>
              <button
                type="button"
                aria-label="Next categories"
                className="cat-next flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-primary-blue hover:text-primary-blue disabled:opacity-40 [&.swiper-button-disabled]:cursor-not-allowed [&.swiper-button-disabled]:opacity-40"
              >
                <FaChevronRight size={12} />
              </button>
            </div>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && categories.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-[#0f172a]">No categories yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Add categories from the admin panel and they will show up here.
            </p>
          </div>
        )}

        {/* CATEGORIES */}
        {!loading && categories.length > 0 && (
          <Swiper
            modules={[Navigation]}
            navigation={{ prevEl: ".cat-prev", nextEl: ".cat-next" }}
            spaceBetween={16}
            grabCursor
            breakpoints={{
              320: { slidesPerView: 2 },
              640: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              1024: { slidesPerView: 6 },
            }}
            className="!pb-4 !pt-2"
          >
            {categories.map((item, i) => (
              <SwiperSlide key={item._id || i} className="!h-auto">
                <Link
                  href={`/products?category=${encodeURIComponent(item.category)}`}
                  className="group flex h-full flex-col items-center"
                >
                  {/* Outer gradient ring */}
                  <div className="w-full max-w-[160px] rounded-full bg-gradient-to-br from-primary-blue/50 via-sky-200 to-primary-blue/10 p-[3px] shadow-md transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-primary-blue/20">
                    {/* Inner tinted circle with white gap */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-full bg-gradient-to-br from-slate-100 to-slate-200 ring-4 ring-white">
                      <Image
                        unoptimized
                        src={item.img ? `${BASE_URL}/${item.img}` : "/no-image.png"}
                        alt={item.category}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                        className="object-contain p-4 mix-blend-multiply transition duration-300 group-hover:scale-110"
                      />
                    </div>
                  </div>

                  {/* Label */}
                  <h3 className="mt-4 w-full truncate text-center text-sm font-semibold text-[#0f172a] transition group-hover:text-primary-blue">
                    {item.category}
                  </h3>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}