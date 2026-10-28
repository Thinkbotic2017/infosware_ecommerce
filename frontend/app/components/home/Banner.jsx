"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import api, { BASE_URL } from "@/app/lib/axios";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectCreative } from "swiper/modules";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";
import "swiper/css/effect-creative";

const getBannerImageUrl = (image) => {
  if (!image) return "";
  const imagePath = image.replace(/^\/+/, "");
  const uploadPath = imagePath.startsWith("uploads/")
    ? imagePath
    : `uploads/${imagePath}`;

  return `${BASE_URL}/${uploadPath}`;
};

// Category link first, then the custom button link, then /products
const getBannerLink = (banner) => {
  if (banner?.category) {
    let url = `/products?category=${encodeURIComponent(banner.category)}`;
    if (banner.subcategory) {
      url += `&subcategory=${encodeURIComponent(banner.subcategory)}`;
    }
    return url;
  }
  return banner?.buttonLink || "/products";
};

// Autoplay and loop only make sense with more than one slide
const getSliderProps = (count) => ({
  autoplay:
    count > 1
      ? { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: false }
      : false,
  loop: count > 1,
  pagination: count > 1 ? { clickable: true } : false,
});

// Makes the whole banner clickable, unless it has its own button
function ClickableArea({ href, enabled, children }) {
  if (!enabled) return children;

  return (
    <Link href={href} className="block h-full">
      {children}
    </Link>
  );
}

function MainSlide({ banner, index }) {
  // Main banners: text and button are OFF unless the admin turned them on
  const showText = banner.showText ?? false;
  const showButton = banner.showButton ?? false;
  const href = getBannerLink(banner);

  return (
    <ClickableArea href={href} enabled={!showButton}>
      <div className="relative w-full aspect-[3/1] rounded-3xl overflow-hidden">
        {banner.img && (
          <Image
            src={getBannerImageUrl(banner.img)}
            alt={banner.title || "banner"}
            fill
            priority={index === 0}
            unoptimized
            sizes="(max-width: 1400px) 100vw, 1400px"
            className="object-cover"
          />
        )}

        {/* Dark gradient so the text is readable */}
        {showText && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent"></div>
        )}

        {(showText || showButton) && (
          <div
            className={`absolute inset-0 z-10 flex flex-col px-5 sm:px-8 md:px-12 text-white ${
              showText ? "justify-center" : "justify-end pb-4 sm:pb-8"
            }`}
          >
            {showText && (
              <div className="max-w-[60%] sm:max-w-[50%]">
                {banner.priceText && (
                  <p className="text-xs sm:text-sm font-medium text-orange-300 mb-1">
                    {banner.priceText}
                  </p>
                )}

                <h2 className="text-base sm:text-2xl md:text-4xl font-bold leading-tight">
                  {banner.title}
                </h2>

                {banner.subtitle && (
                  <p className="text-xs sm:text-base md:text-xl font-medium mt-1 text-white/90">
                    {banner.subtitle}
                  </p>
                )}

                {banner.description && (
                  <p className="hidden md:block text-sm mt-3 text-white/80 line-clamp-2">
                    {banner.description}
                  </p>
                )}
              </div>
            )}

            {showButton && (
              <div className={showText ? "mt-3 sm:mt-5" : ""}>
                <Link href={href}>
                  <button className="bg-gradient-blue-red text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full text-xs sm:text-base font-medium shadow-md hover:scale-105 transition duration-300">
                    {banner.buttonText || "Shop Now"}
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </ClickableArea>
  );
}

function SideSlider({ banners, direction = 1 }) {
  if (banners.length === 0) return null;

  const slider = getSliderProps(banners.length);

  return (
    <div className="h-[200px] md:flex-1 lg:h-auto lg:min-h-0 w-full">
      <Swiper
        key={`${banners.length}-${direction}`}
        modules={[Autoplay, Pagination, EffectCreative]}
        effect="creative"
        creativeEffect={{
          prev: { shadow: true, translate: [`${-100 * direction}%`, 0, 0] },
          next: { shadow: true, translate: [`${100 * direction}%`, 0, 0] },
        }}
        {...slider}
        className="rounded-3xl overflow-hidden w-full h-full"
      >
        {banners.map((banner) => {
          // Side banners: older banners keep their text and button
          const showText = banner.showText ?? true;
          const showButton = banner.showButton ?? true;
          const href = getBannerLink(banner);

          return (
            <SwiperSlide
              key={banner._id}
              className="rounded-3xl overflow-hidden"
            >
              <ClickableArea href={href} enabled={!showButton}>
                <div className="relative w-full h-full rounded-3xl overflow-hidden group">
                  {banner.img && (
                    <Image
                      src={getBannerImageUrl(banner.img)}
                      alt={banner.title || "banner"}
                      fill
                      unoptimized
                      className="object-cover transition-all duration-700 group-hover:scale-105"
                    />
                  )}

                  {showText && (
                    <div className="absolute inset-0 bg-black/40"></div>
                  )}

                  {(showText || showButton) && (
                    <div className="absolute bottom-4 left-5 text-white z-10">
                      {showText && (
                        <>
                          <p className="text-xs opacity-80">
                            {banner.subtitle}
                          </p>

                          <h2 className="text-lg sm:text-xl font-semibold">
                            {banner.title}
                          </h2>

                          <p className="text-sm mt-1">{banner.priceText}</p>
                        </>
                      )}

                      {showButton && (
                        <Link href={href}>
                          <button className="mt-2 bg-white text-primary-blue px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-blue hover:text-white hover:scale-105 transition-all duration-300 shadow-lg">
                            {banner.buttonText || "Shop Now"}
                          </button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </ClickableArea>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

export default function Banner() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await api.get("/api/admin/banner");
        setBanners(res.data?.data || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchBanner();
  }, []);

  // "trbanner" banners are treated as main banners
  const mainBanners = banners.filter(
    (item) => item.type === "main" || item.type === "trbanner"
  );
  const sideBanners1 = banners.filter((item) => item.type === "side1");
  const sideBanners2 = banners.filter((item) => item.type === "side2");

  const hasMain = mainBanners.length > 0;
  const hasSide = sideBanners1.length > 0 || sideBanners2.length > 0;

  // Nothing in the database: show nothing (no hardcoded banners)
  if (!hasMain && !hasSide) return null;

  const mainSlider = getSliderProps(mainBanners.length);

  return (
    <div className="w-full bg-[#f8fafc] py-8 px-4 lg:px-10">
      <div className="max-w-[1400px] mx-auto">
        <div
          className={`grid grid-cols-1 gap-6 ${
            hasMain && hasSide ? "lg:grid-cols-3" : ""
          }`}
        >
          {/* MAIN BANNER: 1200 x 400 (3:1) */}
          {hasMain && (
            <div className={hasSide ? "lg:col-span-2" : ""}>
              <Swiper
                key={`main-${mainBanners.length}`}
                modules={[Autoplay, Pagination]}
                {...mainSlider}
                speed={1000}
                className="rounded-3xl overflow-hidden"
              >
                {mainBanners.map((banner, index) => (
                  <SwiperSlide key={banner._id}>
                    <MainSlide banner={banner} index={index} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          {/* SIDE BANNERS: same total height as the main banner on large screens */}
          {hasSide && (
            <div className="relative">
              <div
                className={`flex flex-col md:flex-row lg:flex-col gap-6 ${
                  hasMain ? "lg:absolute lg:inset-0" : ""
                }`}
              >
                <SideSlider banners={sideBanners2} direction={-1} />
                <SideSlider banners={sideBanners1} direction={1} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}