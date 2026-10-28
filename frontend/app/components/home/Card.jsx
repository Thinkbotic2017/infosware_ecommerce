
"use client";

import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import WishlistIcon from "../products/WhishlistIcon";
import AddCart from "../products/AddCart";
import ShareButton from "../products/ShareButton";
import BuyNow from "../products/BuyButton";

const formatINR = (n) => Number(n || 0).toLocaleString("en-IN");

export default function ProductCard({
  id,
  image,
  title,
  category,
  price,
  oldPrice,
  rating,
  discount,
  stockStatus,
  isPlaceholder = false,
  priceVerified = false,
  variant = "default",
  showCounter = false,
}) {
  const hasDiscount = Number(discount) > 0;
  const hasRating = Number(rating) > 0;
  const outOfStock = !isPlaceholder && stockStatus === "out-of-stock";
  const fewLeft = !isPlaceholder && stockStatus === "few-left";
  const showActions = !isPlaceholder && !outOfStock;

  const savings = Number(oldPrice) - Number(price);
  const showOldPrice = !isPlaceholder && Number(oldPrice) > Number(price);

  const productForCart = {
    _id: id,
    image,
    title,
    category,
    price,
    oldPrice,
    discount,
  };

  const stop = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <article
      className={`group flex h-full min-w-0 w-full flex-col overflow-hidden rounded-xl border bg-white text-left transition duration-300 ${
        variant === "topRated"
          ? "border-amber-200 shadow-sm hover:shadow-lg"
          : "border-slate-200 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl"
      }`}
    >
      {/* PRODUCT IMAGE */}
      <div
        className={`relative h-[154px] w-full shrink-0 overflow-hidden bg-gradient-to-b from-slate-50 to-white sm:h-[171px] lg:h-[187px] ${
          variant === "topRated" ? "bg-amber-50/30" : ""
        }`}
      >
        <Link
          href={`/products/${id}`}
          aria-label={title}
          className="flex h-full w-full items-center justify-center"
        >
          <Image
            unoptimized
            src={image}
            alt={title || "Product"}
            width={400}
            height={400}
            className={`h-full w-full object-contain p-3 sm:p-4 mix-blend-multiply transition duration-500 group-hover:scale-105 ${
              outOfStock ? "opacity-40 grayscale" : ""
            }`}
          />
        </Link>

        {/* PRODUCT BADGE */}
        {isPlaceholder ? (
          <span className="absolute left-2 top-2 rounded-md bg-amber-600 px-2 py-1 text-[9px] font-semibold text-white shadow-sm sm:left-3 sm:top-3 sm:text-[10px]">
            Details pending
          </span>
        ) : variant === "topRated" ? (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-amber-500 px-2 py-1 text-[9px] font-semibold text-white shadow-sm sm:left-3 sm:top-3 sm:text-[10px]">
            <FaStar size={9} />
            Top rated
          </span>
        ) : hasDiscount ? (
          <span className="absolute left-2 top-2 rounded-md bg-primary-red px-2 py-1 text-[9px] font-semibold text-white shadow-sm sm:left-3 sm:top-3 sm:text-[10px]">
            {Number(discount)}% OFF
          </span>
        ) : null}

        {/* OUT OF STOCK */}
        {outOfStock && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-[10px] font-semibold text-white shadow sm:text-[11px]">
            Out of stock
          </span>
        )}

        {/* WISHLIST AND SHARE */}
        {showActions && (
          <div className="absolute right-2 top-2 flex flex-col gap-2 sm:right-3 sm:top-3">
            <button
              type="button"
              aria-label="Add to wishlist"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md sm:h-9 sm:w-9"
              onClick={stop}
            >
              <WishlistIcon productId={id} />
            </button>

            <div
              role="presentation"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:text-primary-blue hover:shadow-md sm:h-9 sm:w-9 lg:translate-x-2 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100"
              onClick={stop}
            >
              <ShareButton product={{ _id: id, title }} />
            </div>
          </div>
        )}
      </div>

      {/* PRODUCT DETAILS */}
      <div className="flex flex-1 flex-col gap-1 px-3 py-3 sm:px-4 sm:py-4">
        {/* CATEGORY */}
        <p className="min-h-[14px] truncate text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-[11px]">
          {category || "General"}
        </p>

        {/* PRODUCT NAME */}
        <Link
          href={`/products/${id}`}
          className="block min-w-0"
        >
          <h3
            title={title}
            className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-slate-900 transition hover:text-primary-blue sm:min-h-[3rem] sm:text-base sm:leading-6 lg:text-lg"
          >
            {title}
          </h3>
        </Link>

        {/* RATING */}
        <div className="flex min-h-5 flex-wrap items-center gap-1.5">
          {hasRating ? (
            <>
              <span className="flex shrink-0 items-center gap-1 rounded bg-emerald-600 px-1.5 py-1 text-[10px] font-semibold leading-none text-white">
                {Number(rating).toFixed(1)}
                <FaStar size={8} />
              </span>

              <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px]">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={
                      i < Math.round(Number(rating))
                        ? "text-yellow-400"
                        : "text-slate-200"
                    }
                  />
                ))}
              </span>
            </>
          ) : (
            <span className="text-[10px] text-slate-400 sm:text-xs">
              No ratings yet
            </span>
          )}
        </div>

        {/* PRICE AND SAVINGS */}
        <div className="mt-auto min-w-0 pt-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
            {isPlaceholder && !priceVerified ? (
              <span className="text-sm font-semibold text-amber-700 sm:text-base">
                Price pending
              </span>
            ) : (
              <span className="text-base font-bold leading-tight text-slate-900 sm:text-lg">
                ₹{formatINR(price)}
              </span>
            )}

            {showOldPrice && (
              <span className="text-[10px] leading-tight text-slate-400 line-through sm:text-xs">
                ₹{formatINR(oldPrice)}
              </span>
            )}
          </div>

          <div className="mt-1 flex min-h-[18px] items-start">
            {showOldPrice && savings > 0 && !fewLeft && (
              <span className="text-[10px] font-medium leading-4 text-emerald-600 sm:text-xs">
                You save ₹{formatINR(savings)}
              </span>
            )}

            {fewLeft && (
              <span className="text-[10px] font-medium leading-4 text-orange-600 sm:text-xs">
                Only a few left
              </span>
            )}

            {isPlaceholder && priceVerified && (
              <span className="text-[10px] leading-4 text-amber-700 sm:text-xs">
                Invoice price; details and stock pending
              </span>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        {showActions && (
          <div className="mt-2 grid grid-cols-2 items-stretch gap-2 [&>*]:m-0 [&>*]:min-w-0 [&>*]:w-full [&_button]:w-full [&_button]:min-w-0 [&_button]:px-1.5 [&_button]:py-2 [&_button]:text-[10px] sm:[&_button]:px-2 sm:[&_button]:text-xs">
            <AddCart product={productForCart} />
            <BuyNow product={productForCart} />
          </div>
        )}
      </div>
    </article>
  );
}
