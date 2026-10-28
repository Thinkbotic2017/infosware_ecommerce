// "use client";

// import ProductCard from "./Card";
// import { FaArrowRight } from "react-icons/fa6";
// import ProductSlider from "./Slider";
// const products = [
//   {
//     image: "/product-1.jpg",
//     title: "Premium Headphones",
//     category: "Electronics",
//     price: 2999,
//     oldPrice: 3999,
//     rating: 5,
//   },

//   {
//     image: "/product-2.jpg",
//     title: "Smart Watch",
//     category: "Gadgets",
//     price: 4999,
//     oldPrice: 5999,
//     rating: 5,
//   },
  
//   {
//     image: "/product-1.jpg",
//     title: "Wireless Earbuds",
//     category: "Audio",
//     price: 1999,
//     oldPrice: 2499,
//     rating: 4,
//   },
//   {
//     image: "/product-2.jpg",
//     title: "Gaming Console",
//     category: "Gaming",
//     price: 5999,
//     oldPrice: 6999,
//     rating: 5,
//   },
//    {
//     image: "/product-2.jpg",
//     title: "Gaming Console",
//     category: "Gaming",
//     price: 5999,
//     oldPrice: 6999,
//     rating: 5,
//   },
//    {
//     image: "/product-2.jpg",
//     title: "Gaming Console",
//     category: "Gaming",
//     price: 5999,
//     oldPrice: 6999,
//     rating: 5,
//   },
// ];

// export default function TopRatedProducts() {
//   return (
//     <div className="md:px-10 py-14 bg-white">

//       <div className="max-w-[1400] mx-auto">

       
//         <div className="flex items-center justify-between mb-10">

//           <div className="pl-3">
//             <div className="flex items-center gap-2 mb-1">
//               <span className="w-2 h-2 bg-primary-red rounded-full"></span>
//               <p className="text-xs font-medium text-primary-red uppercase tracking-wider">
//                 Customer Favorites
//               </p>
//             </div>

//             <h2 className="text-2xl  md:text-3xl font-bold text-[#0f172a]">
//               Top Rated Products
//             </h2>
//           </div>

//           <div className="flex justify-center items-center gap-1 text-primary-blue hover:underline cursor-pointer">
//             <button className="text-md font-bold text-primary-blue hover:underline">
//             View All 
//               </button>
//               <FaArrowRight />
//           </div>

        

//         </div>

//         <ProductSlider   products={products} variant="topRated" />

//       </div>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";

import axios from "axios";

import { FaArrowRight } from "react-icons/fa";

import ProductSlider from "./Slider";
import api, { BASE_URL } from "@/app/lib/axios";
import Link from "next/link";

function Product() {

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    const fetchTopRatedProducts = async () => {

      try {

        const response = await api.get(
          `/api/comman/toprated`
        );

        console.log(response.data);

        const formattedProducts = response.data.map((item) => ({

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
          isPlaceholder: item.isPlaceholder === true,
          priceVerified: item.priceVerified === true,

        }));

        setProducts(formattedProducts);

      } catch (error) {

        console.error(
          "Error fetching products:",
          error
        );

      } finally {

        setLoading(false);

      }
    };

    fetchTopRatedProducts();

  }, []);

  return (

    <div className="md:px-10 py-10 bg-[#f8fafc]">

      {/* 🔥 HEADER */}
      <div className="flex items-center justify-between mb-10">

        <div className="ps-3">

          <div className="flex items-center gap-2 mb-1">

            <span className="w-2 h-2 bg-primary-red rounded-full"></span>

            <p className="text-xs font-medium text-primary-red uppercase tracking-wider">

              Trending Now

            </p>

          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a]">

          Top Rated Products

          </h2>

        </div>

        {/* VIEW ALL */}
          <Link href="/products">
        <div className="flex items-center gap-1 text-primary-blue hover:underline cursor-pointer">


          <button className="text-sm md:text-md font-bold">

            View All

          </button>

          <FaArrowRight />
          

        </div>
       </Link>

      </div>

      {/*  LOADING */}
      {loading ? (

        <div className="flex justify-center items-center py-20">

          <p className="text-gray-500 text-lg">

            Loading Products...

          </p>

        </div>

      ) : (

        products.length === 0 ? (
          <p className="py-8 text-center text-gray-600">
            No top-rated products are saved in the database.
          </p>
        ) : (
          <div className="flex justify-center items-center">
            <ProductSlider products={products} variant="topRated" />
          </div>
        )

      )}

    </div>
  );
}

export default Product;