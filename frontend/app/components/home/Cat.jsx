"use client";

import { useEffect, useState } from "react";

import axios from "axios";

import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";

import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

export default function CategoryProducts() {

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  /*  FETCH CATEGORIES */
  useEffect(() => {

    const fetchCategories = async () => {

      try {

        const response = await axios.get(
          `${apiUrl}/api/comman/categories`
        );

        console.log(response.data);

        setCategories(response.data.data);

      } catch (error) {

        console.error(
          "Error fetching categories:",
          error
        );

      } finally {

        setLoading(false);

      }
    };

    fetchCategories();

  }, [apiUrl]);

  return (

    <div className="w-full py-12 px-4 lg:px-10 bg-white">

      <div className="max-w-[1400px] mx-auto">

        {/*  HEADER */}
        <div className="flex items-center justify-between mb-8">

          <div>

            <p className="text-sm text-primary-red font-semibold uppercase tracking-wider">

              Explore Categories

            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a] mt-1">

              Shop by Categories

            </h2>

          </div>

        </div>

        {/* LOADING */}
        {loading ? (

          <div className="flex justify-center py-20">

            <p className="text-gray-500">
              Loading Categories...
            </p>

          </div>

        ) : (

          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={20}
            grabCursor={true}
            breakpoints={{
              320: { slidesPerView: 2 },
              640: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              1024: { slidesPerView: 6 },
            }}
          >

            {categories.map((item, i) => (

              <SwiperSlide
                key={i}
                className="mb-4 h-auto"
              >
                <div
                  className="
                    bg-[#f8fafc]
                    border border-gray-100
                    rounded-2xl sm:rounded-3xl
                    p-3
                    text-center
                    hover:shadow-md
                    transition-all duration-300
                    group
                    h-full flex flex-col justify-between items-center
                  "
                >
                  {/* IMAGE */}
                  <div className="relative w-full h-[60px] sm:h-[80px] md:h-[100px] mb-3 shrink-0">
                    <Image
                      src={`${apiUrl}/${item.img}`}
                      alt={item.category}
                      fill
                      unoptimized
                      className="
                        object-contain
                        group-hover:scale-110
                        transition duration-300
                      "
                    />
                  </div>

                  {/* CATEGORY */}
                  <h3 className="font-semibold text-xs sm:text-sm text-[#0f172a] line-clamp-2 w-full">
                    {item.category}
                  </h3>
                </div>
              </SwiperSlide>

            ))}

          </Swiper>

        )}

      </div>

    </div>
  );
}