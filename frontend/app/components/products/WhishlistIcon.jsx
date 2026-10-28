"use client";

import React from "react";

import {
  FaRegHeart,
  FaHeart,
} from "react-icons/fa";

import { useAuth }
from "@/app/context/AuthContext";

import { useWishlist }
from "@/app/context/WhishlistContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const WishlistIcon =
({
  productId,
}) => {

  const { user } =
    useAuth();
const router= useRouter();
  const {

    wishlistItems,

    addToWishlist,

    removeFromWishlist,

  } = useWishlist();

  // CHECK EXISTS

  const isInWishlist =
    wishlistItems.some(

      (item) =>

        (item._id ||
          item.id) ===
        productId
    );

  // TOGGLE

  const toggleWishlist =
    async () => {

      if (!user) {

        console.log(
          "User not authenticated"
        );
      toast.error("pls signin first");
      router.push("/signin");

        return;
      }

      if (isInWishlist) {

        removeFromWishlist(
          productId
        );
      }

      else {

        addToWishlist({
          _id: productId,
        });
      }
    };

  return (

    <>

      {isInWishlist ? (

        <FaHeart

          className="text-primary-red cursor-pointer"

          onClick={
            toggleWishlist
          }

          title="Remove from wishlist"
        />

      ) : (

        <FaRegHeart

          className="cursor-pointer"

          onClick={
            toggleWishlist
          }

          title="Add to wishlist"
        />

      )}

    </>
  );
};

export default WishlistIcon;