"use client";

import React, { useEffect, useState } from "react";

import axios from "axios";

import { FaArrowRight } from "react-icons/fa";

import ProductSlider from "./Slider";
import api, { BASE_URL } from "../../lib/axios";

function Product() {

  /* STATES */
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);



  /*  FETCH PRODUCTS */
  useEffect(() => {

    const fetchTopProducts = async () => {

      try {

        const response = await api.get(
          `/api/comman/productCards`
        );

        console.log(response.data.data);

        /* FORMAT DATA */
        const formattedProducts = response.data.data.map((item) => ({

          id: item._id,

          image:  `${BASE_URL}/${item.img}`,

          title: item.name,

          category: item.category,

          price: item.price,

          oldPrice: item.oldPrice,

          rating: Math.round(item.rating || 4),

          discount: item.discount,

          brand: item.Brand,

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

    fetchTopProducts();

  }, [BASE_URL]);

  return (

    <div className="md:px-10 py-10 bg-[#f8fafc]">

      {/*  HEADER */}
      <div className="flex items-center justify-between mb-10">

        <div className="ps-3">

          <div className="flex items-center gap-2 mb-1">

            <span className="w-2 h-2 bg-primary-red rounded-full"></span>

            <p className="text-xs font-medium text-primary-red uppercase tracking-wider">

              Trending Now

            </p>

          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a]">

            Featured Products

          </h2>

        </div>

        {/* VIEW ALL */}
        <div className="flex items-center gap-1 text-primary-blue hover:underline cursor-pointer">

          <button className="text-md font-bold">

            View All

          </button>

          <FaArrowRight />

        </div>

      </div>

      {/* 🔥 LOADING */}
      {loading ? (

        <div className="flex justify-center items-center py-20">

          <p className="text-gray-500 text-lg">

            Loading Products...

          </p>

        </div>

      ) : (

        /*  SLIDER */
        <div className="flex justify-center items-center">

          <ProductSlider products={products} />

        </div>

      )}

    </div>
  );
}

export default Product;