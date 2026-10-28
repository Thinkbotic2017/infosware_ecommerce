
"use client";

import React, {
    useEffect,
    useState,
} from "react";

import {
    FaStar
} from "react-icons/fa";

import api
    from "@/app/lib/axios";

import toast
    from "react-hot-toast";

function Review({

    productId,
}) {

    const [rating,
        setRating] =
        useState(0);

    const [review,
        setReview] =
        useState("");

    const [loading,
        setLoading] =
        useState(false);

    const [alreadyRated,
        setAlreadyRated] =
        useState(false);

    // GET USER RATING

    useEffect(() => {

        if (!productId) return;

        fetchMyRating();

    }, [productId]);

    // FETCH MY REVIEW

    const fetchMyRating =
        async () => {

            try {

                const res =
                    await api.get(

                        `/api/user/product/${productId}/my-rating`
                    );

                console.log(
                    "my rating",
                    res.data
                );

                if (
                    res.data?.rating
                ) {

                    setRating(
                        res.data.rating
                    );

                    setReview(
                        res.data.review || ""
                    );

                    setAlreadyRated(true);

                }

                else {
                    setAlreadyRated(false);
                }

            } catch (error) {

                console.log(error);
            }
        };

    // SUBMIT REVIEW

    const handleSubmit =
        async () => {

            if (!rating) {

                toast.error(
                    "Please select rating"
                );

                return;
            }

            try {

                setLoading(true);

                await api.post(

                    `/api/user/product/${productId}/rate`,

                    {

                        rating,

                        review,
                    }
                );

                toast.success(
                    "Review Submitted"
                );

                fetchMyRating();

            } catch (error) {

                console.log(error);

                toast.error(
                    "Failed to submit review"
                );

            } finally {

                setLoading(false);
            }
        };

    return (

        <div className="mt-10 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">

            {/* HEADING */}

            <div className="mb-6">

                <h2 className="text-2xl font-bold text-[#0f172a]">

                    Write a Review

                </h2>

                <p className="text-sm text-gray-500 mt-1">

                    Share your experience with this product

                </p>

            </div>

            {/* STARS */}

            <div className="flex items-center gap-2 text-3xl mb-6 cursor-pointer">

                {[1, 2, 3, 4, 5].map((star) => (

                    <FaStar

                        key={star}

                        onClick={() =>
                        {
                            !alreadyRated && (
                                    setRating(star)
                            )
                        }
                        }

                     className={`transition duration-200

${
star <= rating

? "text-yellow-400 scale-110"

: "text-gray-300"
}

${
!alreadyRated &&
"cursor-pointer hover:text-yellow-300"
}

${
alreadyRated &&
"cursor-default"
}
`}
                    />
                ))}

            </div>

            {
alreadyRated && (

<p className="text-green-600 font-medium mt-3">

You already reviewed this product.

</p>

)
}

            {/* REVIEW BOX */}

           {


 !alreadyRated  && (
     <textarea

                rows={5}

                value={review}

                onChange={(e) =>
                    setReview(
                        e.target.value
                    )
                }

                placeholder="Write your review here..."

                className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 outline-none resize-none transition focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 focus:bg-white"
            />
 )
           }


            {/* BUTTON */}
{
    !alreadyRated && (

        
            <div className="mt-6 flex justify-end">

                <button

                    onClick={handleSubmit}

                    disabled={loading}

                    className="px-8 py-3 bg-gradient-blue-red text-white rounded-2xl font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50"
                >

                    {
                        loading

                            ? "Submitting..."

                            : "Submit Review"
                    }

                </button>

            </div>
    )
}

            {/* SHOW SELECTED */}

            {rating > 0 && (

                <div className="mt-5 text-sm text-gray-500">

                    You rated this product
                    {" "}

                    <span className="font-bold text-primary-blue">

                        {rating} / 5

                    </span>

                </div>
            )}

        </div>
    );
}

export default Review;

