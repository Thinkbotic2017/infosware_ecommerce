"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../lib/axios";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const WishlistContext =
  createContext();

export const WishlistProvider =
({
  children,
}) => {

  const [wishlistItems,
  setWishlistItems] =
    useState([]);

  const [loading,
  setLoading] =
    useState(true);

  const { user } =
    useAuth();

  // FETCH WISHLIST

  const fetchWishlist =
    async () => {

      try {

        // LOGIN USER

        if (user) {

          const res =
            await api.get(
              "/api/user/wishlist"
            );

          console.log(
            "Wishlist Data",
            res.data
          );

          setWishlistItems(

            res.data || []
          );
        }
 else {
  setWishlistItems([]);
}
        // GUEST USER

        // else {

        //   const guestWishlist =
        //     JSON.parse(

        //       localStorage.getItem(
        //         "wishlist"
        //       )

        //     ) || [];

        //   setWishlistItems(
        //     guestWishlist
        //   );
        // }

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    fetchWishlist();

  }, [user]);

  // ADD TO WISHLIST

  const addToWishlist =
    async (product) => {

      try {

        // LOGIN USER

        if (user) {

          await api.post(
            "/api/user/wishlist",
            {
              productId:
                product._id ||
                product.id,
            }
          );

          // REFETCH

          await fetchWishlist();
        }

        // GUEST USER

        else {

          let updatedWishlist =
            [...wishlistItems];

          const exists =
            updatedWishlist.find(

              (item) =>

                (item._id ||
                  item.id) ===

                (product._id ||
                  product.id)
            );

          if (exists) {

            toast.error(
              "Already in wishlist"
            );

            return;
          }

          updatedWishlist.push(
            product
          );

          // localStorage.setItem(

          //   "wishlist",

          //   JSON.stringify(
          //     updatedWishlist
          //   )
          // );

          setWishlistItems(
            updatedWishlist
          );
        }

        toast.success(
          "Added to wishlist"
        );

      } catch (error) {

        console.log(error);

        toast.error(
          "Failed to add wishlist"
        );
      }
    };

  // REMOVE FROM WISHLIST

  const removeFromWishlist =
    async (productId) => {

      try {

        // LOGIN USER

        if (user) {

          await api.delete(
            `/api/user/wishlist/${productId}`
          );

          // REFETCH

          await fetchWishlist();
        }

        // GUEST USER

        else {

          const updatedWishlist =
            wishlistItems.filter(

              (item) =>

                (item._id ||
                  item.id) !==
                productId
            );

          setWishlistItems(
            updatedWishlist
          );

          // localStorage.setItem(

          //   "wishlist",

          //   JSON.stringify(
          //     updatedWishlist
          //   )
          // );
        }

        toast.success(
          "Removed from wishlist"
        );

      } catch (error) {

        console.log(error);

        toast.error(
          "Failed to remove wishlist"
        );
      }
    };

  return (

    <WishlistContext.Provider
      value={{

        wishlistItems,

        setWishlistItems,

        addToWishlist,

        removeFromWishlist,

        wishlistCount:
          wishlistItems.length,

        loading,
      }}
    >

      {children}

    </WishlistContext.Provider>
  );
};

export const useWishlist =
  () =>
    useContext(
      WishlistContext
    );