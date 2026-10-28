"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import ProductCard from "./Card";

export default function ProductSlider({ products, title, variant = "default" }) {
  return (
    <div className="w-full px-4 lg:px-10">

      <h2 className="text-2xl font-bold mb-6 text-[#0f172a]">
        {title}
      </h2>

      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={20}
        grabCursor={true}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }}
      >
        {products.map((item, i) => (
          <SwiperSlide className="mb-2" key={i}>
            <ProductCard {...item} variant={variant} />
          </SwiperSlide>
        ))}
      </Swiper>

    </div>
  );
}