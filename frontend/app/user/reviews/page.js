"use client";

import Pagination from "@/app/components/Pagination";
import api, { BASE_URL } from "@/app/lib/axios";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  FaStar
} from "react-icons/fa";



// const [edit,setEdit]=useState(" ");
export default function Page() {

  const [reviews,
setReviews] =
useState([]);

const [loading,
setLoading] =
useState(true);
const [page, setPage] = useState(1);

const [totalPages, setTotalPages] = useState(1);
useEffect(() => {

fetchReviews();

}, [page]);

const fetchReviews =
async () => {

  try {

    const res =
await api.get(
    `/api/user/my-reviews?page=${page}&limit=2`

    );

    console.log(
"reviews",
res.data
);

    setReviews(
res.data.reviews || []
);

setTotalPages(
  res.data.totalPages || 1
);

  } catch (error) {

console.log(error);

  } finally {

setLoading(false);
  }
};




  return (
    <div className="space-y-8">


      {/*  REVIEW LIST */}
      <div className="flex flex-col gap-6 mt-6">

    
{
reviews.length>0 ? (
  reviews.map((item, index) => (

  <div
    key={index}
    className="bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
  >

    <div className="p-5 sm:p-6 flex flex-col lg:flex-row gap-6 lg:items-start lg:justify-between">

      {/* LEFT */}

      <div className="flex flex-col sm:flex-row gap-5 flex-1">

        {/* IMAGE */}

        <div className="w-full sm:w-[100px] h-[100px] overflow-hidden border border-gray-100 bg-gray-50 shrink-0 rounded-xl">

          <Image
          unoptimized
            src={`${BASE_URL}/${item.productImg}`}
            width={300}
            height={300}
            alt={item.productName}
            className="w-full h-full object-fill"
          />

        </div>

        {/* INFO */}

        <div className="flex-1">

          {/* TITLE */}

          <h2 className="text-xl font-bold text-[#0f172a]">

            {item.productName}

          </h2>

          {/* STARS */}

          <div className="flex items-center gap-1 text-yellow-400 mt-2">

            {[1,2,3,4,5].map((star)=>(

              <FaStar
                key={star}
                className={`

                ${
star <= item.rating

? "text-yellow-400"

: "text-gray-300"
}
                `}
              />
            ))}

          </div>

          {/* REVIEW */}

          <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl p-4">

            <p className="text-gray-600 leading-relaxed">

              {item.review}

            </p>

          </div>

        </div>

      </div>

      {/* ACTIONS */}


    </div>

  </div>
))
):(
  <div
      className="
        bg-white
        border
        border-gray-200
        rounded-2xl
        p-10
        text-center
      "
    >

      <h2
        className="
          text-2xl
          font-bold
          text-[#0f172a]
        "
      >

        No Reviews Yet

      </h2>

      <p
        className="
          text-gray-500
          mt-2
        "
      >

        Your product reviews will appear here.

      </p>

    </div>

)


}
{reviews.length > 0 && totalPages > 1 && (

  <div className="flex justify-center mt-6">

    <Pagination
      currentPage={page}
      totalPages={totalPages}
      onPageChange={setPage}
    />

  </div>

)}
      </div>

    </div>
  );
}