"use client";

import { useEffect, useState } from "react";
import ProductCard from "./Card";
import api, { BASE_URL } from "@/app/lib/axios";
import Link from "next/link";
import {
  Swiper,
  SwiperSlide,
} from "swiper/react";

import {
  Autoplay,
  Pagination,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
export default function Discount() {
const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
const [banners,setBanners]=useState([]);
const [mounted,
setMounted] =
useState(false);
  useEffect(() => {

    const discountedProducts = async () => {

      try {

        const response = await api.get(
          `/api/comman/topdiscounted`
        );

        console.log("top discount",response.data.data);

        const formattedProducts = response.data.data.map((item) => ({

          id: item._id,

         image:  `${BASE_URL}/${item.img}`,

          title: item.name,

          category: item.category,

          price: item.price,

          oldPrice: item.oldPrice,

          rating: Math.round(item.rating),

          discount: item.discount,

          stockStatus: item.stockStatus,

          brand: item.Brand,

        }));

     setProducts(formattedProducts.slice(0, 2));

      } catch (error) {

        console.error(
          "Error fetching products:",
          error
        );

      } finally {

        setLoading(false);

      }
    };

     const fetchBanner= async ()=>{
    try{
const res= await api.get("/api/admin/banner");
console.log("banners",res.data.data);
setBanners(res.data.data || [])
    }
    catch(error){
console.log(error);
    }
  }
fetchBanner();
    discountedProducts();
  }, []);
useEffect(() => {

  setMounted(true);

}, []);

if (!mounted)
return null;
const trBanners =
  banners.filter(
    (item) =>
      item.type === "trbanner"
  );

const featuredProduct =
  products[0];
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-14 bg-[#f8fafc]"   id="today-deals">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT BANNER */}
<Swiper
 key={trBanners.length}
  modules={[
    Autoplay,
    Pagination,
  ]}

  autoplay={{

    delay: 3000,

    disableOnInteraction: false,

    pauseOnMouseEnter: false,
  }}

  observer={true}

  observeParents={true}

  watchSlidesProgress={true}

  pagination={{
    clickable: true,
  }}

  speed={1200}

  loop={true}

  className="rounded-3xl overflow-hidden w-full"
>

  {trBanners.map(
    (banner, index) => {

      const product =
        products[index];

      if (!product)
        return null;

      return (

        <SwiperSlide
          key={banner._id}
        >

          <div className="relative min-h-[380px] sm:min-h-[350px] rounded-3xl overflow-hidden p-6 pb-[180px] sm:pb-8 sm:p-8 flex flex-col justify-between bg-gradient-blue text-white shadow-lg">

            {/* GLOW */}

            <div className="absolute -top-10 -left-10 w-[200px] h-[200px] bg-white/10 rounded-full blur-3xl"></div>

            <div className="absolute bottom-[-60px] right-[-40px] w-[220px] h-[220px] bg-yellow-300/20 rounded-full blur-3xl"></div>

            {/* DISCOUNT */}

            <div className="absolute top-5 right-5 z-20 bg-primary-red text-white text-xs px-3 py-1 rounded-full font-semibold shadow">

              {product.discount}% OFF

            </div>

            {/* TEXT */}

            <div className="z-10 relative w-full sm:max-w-[50%]">

              <p className="text-sm sm:text-lg uppercase text-primary-red font-bold">

                {banner.subtitle}

              </p>

              <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight mt-2">

                {banner.title}

              </h2>

              <p className="text-xs sm:text-sm mt-2 sm:mt-3 opacity-90 line-clamp-2 sm:line-clamp-none">

                {banner.description}

              </p>

              {/* BUTTON */}

              <Link
                href={
                  `/products/${product.id}`
                }
              >

                <button className="mt-4 sm:mt-6 bg-white text-primary-red px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base w-fit hover:scale-105 transition relative z-20">

                  {banner.buttonText ||
                    "Shop Now"} →

                </button>

              </Link>

            </div>

            {/* IMAGE */}

            <div className="absolute right-0 sm:right-[-10px] bottom-[-10px] w-[180px] sm:w-[260px] h-[180px] sm:h-[260px] rotate-[-10deg] z-0">

              <img
                src={product.image}
                alt={product.title}
                className="object-contain w-full h-full drop-shadow-2xl"
              />

            </div>

          </div>

        </SwiperSlide>
      );
    }
  )}

</Swiper>

        {/* RIGHT PRODUCTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 lg:mt-0">

          {products.map((item, index) => (
            <ProductCard
              key={index}
              {...item}
              variant="default"
            />
            
          ))}

        </div>

      </div>
    </div>
  );
}