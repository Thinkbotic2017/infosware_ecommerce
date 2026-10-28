"use client";

import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { useEffect, useState } from "react";

import api, { BASE_URL } from "@/app/lib/axios";

import { useAuth } from "@/app/context/AuthContext";

function CardContent({
  item,
  textPosition = "bottom-left",
}) {

  const pos =
    textPosition === "top-left"
      ? "top-4 left-4"
      : "bottom-4 left-4";

  return (

    <div
      className={`absolute ${pos} text-white z-10`}
    >

      <p className="text-xs uppercase opacity-75">

        {item.category}

      </p>

      <h3 className="text-sm font-semibold mt-0.5">

        {item.name}

      </h3>

      <span className="text-xs opacity-80">

        Shop Now →

      </span>

    </div>
  );
}

// NORMAL CARD

function ProductCard({ item }) {

  return (

    <Link
      href={`/products/${item._id}`}
      className="block w-full h-full"
    >

      <div
        className="
          relative
          w-full
          h-full
          min-h-[220px]
          md:min-h-0
          rounded-3xl
          overflow-hidden
          group
          cursor-pointer
        "
      >

        <Image
          src={`${BASE_URL}/${item.img}`}
          alt={item.name}
          fill
          unoptimized
          className="
            object-fit
            group-hover:scale-110
            transition
            duration-500
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-black/20
            group-hover:bg-black/30
            transition
          "
        />

        <CardContent
          item={item}
          textPosition="bottom-left"
        />

      </div>

    </Link>
  );
}

// OVERLAP CARD

function SplitOverlapCard({
  card1,
  card2,
}) {

  const [front, setFront] =
    useState("card1");

  const isFront1 =
    front === "card1";

  return (

    <div
      className="
        relative
        w-full
        h-full
        min-h-[260px]
        rounded-3xl
        overflow-hidden
        shadow-lg
      "
    >

      {/* TOP RIGHT INFO */}

      <div
        className="
          absolute
          top-4
          right-4
          z-[0]
          text-left
          text-black
          max-w-[42%]
        "
      >

        <p
          className="
            text-[10px]
            uppercase
            opacity-60
            tracking-wider
          "
        >

          {card2.category}

        </p>

        <h4
          className="
            text-sm
            font-semibold
            leading-tight
            mt-0.5
            opacity-90
          "
        >

          {card2.name}

        </h4>

        {card2.price && (

          <p
            className="
              text-xs
              opacity-70
              mt-0.5
            "
          >

            ₹{card2.price}

          </p>

        )}

      </div>

      {/* BOTTOM LEFT INFO */}

      <div
        className="
          absolute
          bottom-4
          left-4
          z-[0]
          text-black
          max-w-[42%]
        "
      >

        <p
          className="
            text-[10px]
            uppercase
            opacity-60
            tracking-wider
          "
        >

          {card1.category}

        </p>

        <h4
          className="
            text-sm
            font-semibold
            leading-tight
            mt-0.5
            opacity-90
          "
        >

          {card1.name}

        </h4>

        {card1.price && (

          <p
            className="
              text-xs
              opacity-70
              mt-0.5
            "
          >

            ₹{card1.price}

          </p>

        )}

      </div>

      {/* CARD 2 */}

      <div
        className="
          absolute
          rounded-2xl
          overflow-hidden
          transition-all
          duration-300
          cursor-pointer
        "
        style={{
          bottom: "0",
          right: "0",
          width: "55%",
          height: "60%",
          zIndex: isFront1 ? 1 : 3,
        }}
        onClick={() =>
          setFront("card2")
        }
      >

        <div
          className="
            relative
            w-full
            h-full
            group
          "
        >

          <Image
            src={`${BASE_URL}/${card2.img}`}
            alt={card2.name}
            fill
            unoptimized
            className="
              object-fit
              group-hover:scale-105
              transition
              duration-500
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-black/20
              group-hover:bg-black/35
              transition
            "
          />

          <Link
            href={`/products/${card2._id}`}
            onClick={(e) =>
              e.stopPropagation()
            }
            className="
              absolute
              bottom-3
              left-3
              z-20
            "
          >

            <button
              className="
                text-white
                px-3
                py-1.5
                rounded-full
                text-xs
                font-medium
                hover:bg-primary-blue
                transition-all
                duration-300
                shadow
              "
            >

              Shop Now →

            </button>

          </Link>

        </div>

      </div>

      {/* CARD 1 */}

      <div
        className="
          absolute
          rounded-2xl
          overflow-hidden
          transition-all
          duration-300
          cursor-pointer
        "
        style={{
          top: "0",
          left: "0",
          width: "55%",
          height: "60%",
          zIndex: isFront1 ? 3 : 1,
        }}
        onClick={() =>
          setFront("card1")
        }
      >

        <div
          className="
            relative
            w-full
            h-full
            group
          "
        >

          <Image
            src={`${BASE_URL}/${card1.img}`}
            alt={card1.name}
            fill
            unoptimized
            className="
              object-fit
              group-hover:scale-110
              transition
              duration-500
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-black/20
              group-hover:bg-black/30
              transition
            "
          />

          <Link
            href={`/products/${card1._id}`}
            onClick={(e) =>
              e.stopPropagation()
            }
            className="
              absolute
              bottom-3
              left-3
              z-20
            "
          >

            <button
              className="
                text-white
                px-3
                py-1.5
                rounded-full
                text-xs
                font-medium
                transition-all
                duration-300
                shadow
              "
            >

              Shop Now →

            </button>

          </Link>

        </div>

      </div>

    </div>
  );
}

function EmptySlot() {

  return (

    <div
      className="
        w-full
        h-full
        rounded-3xl
      "
    />

  );
}

export default function RecentlyViewed() {

  const [products, setProducts] =
    useState([]);

  const { user, loading } =
    useAuth();

  useEffect(() => {

    if (loading) return;

    const fetchProducts =
      async () => {

        try {

          if (user) {

            const res =
              await api.get(
                "/api/user/recentlyViewed"
              );

            setProducts(
              (res.data.data || []).slice(
                0,
                5
              )
            );

          } else {

            const guestProducts =
              JSON.parse(
                localStorage.getItem(
                  "recentlyViewed"
                )
              ) || [];

            setProducts(
              guestProducts.slice(0, 5)
            );
          }

        } catch (err) {

          console.log(err);

        }
      };

    fetchProducts();

  }, [user, loading]);

  if (
    !products ||
    products.length === 0
  )
    return null;

  const count =
    products.length;

  const slot1 = () => {

    if (count === 0)
      return <EmptySlot />;

    if (count >= 4)
      return (

        <SplitOverlapCard
          card1={products[0]}
          card2={products[3]}
        />

      );

    return (
      <ProductCard item={products[0]} />
    );
  };

  const slot2 = () => {

    if (count < 2)
      return <EmptySlot />;

    if (count >= 5)
      return (

        <SplitOverlapCard
          card1={products[1]}
          card2={products[4]}
        />

      );

    return (
      <ProductCard item={products[1]} />
    );
  };

  const slot3 = () => {

    if (count < 3)
      return <EmptySlot />;

    return (
      <ProductCard item={products[2]} />
    );
  };

  return (

    <div
      className="
        px-4
        sm:px-6
        lg:px-10
        py-10
        md:py-14
        bg-white
        overflow-hidden
      "
    >

      <div className="max-w-[1400px] mx-auto">

        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            mb-8
            md:mb-10
          "
        >

          <div>

            <div
              className="
                flex
                items-center
                gap-2
                mb-1
              "
            >

              <span
                className="
                  w-2
                  h-2
                  bg-primary-red
                  rounded-full
                "
              />

              <p
                className="
                  text-xs
                  font-medium
                  text-primary-red
                  uppercase
                  tracking-wider
                "
              >

                Explore

              </p>

            </div>

            <h2
              className="
                text-2xl
                md:text-3xl
                font-bold
                text-[#0f172a]
              "
            >

              Recently viewed

            </h2>

          </div>

          <Link href="/products">

            <div
              className="
                flex
                items-center
                gap-2
                text-primary-blue
                hover:underline
                cursor-pointer
              "
            >

              <button
                className="
                  text-sm
                  md:text-md
                  font-bold
                "
              >

                View All

              </button>

              <FaArrowRight />

            </div>

          </Link>

        </div>

        {/* MOBILE */}

        <div
          className="
            grid
            grid-cols-2
            gap-4
            md:hidden
          "
        >

          {products
            .slice(0, 4)
            .map((item) => (

              <Link
                key={item._id}
                href={`/products/${item._id}`}
                className="group"
              >

                <div
                  className="
                    relative
                    aspect-[3/4]
                    rounded-2xl
                    overflow-hidden
                    bg-gray-100
                  "
                >

                  <Image
                    src={`${BASE_URL}/${item.img}`}
                    alt={item.name}
                    fill
                    unoptimized
                    className="
                      object-cover
                      transition-transform
                      duration-500
                      group-hover:scale-105
                    "
                  />

                  <div
                    className="
                      absolute
                      inset-0
                      bg-black/20
                    "
                  />

                  <div
                    className="
                      absolute
                      bottom-3
                      left-3
                      text-white
                      z-10
                    "
                  >

                    <p
                      className="
                        text-[10px]
                        uppercase
                        opacity-80
                      "
                    >

                      {item.category}

                    </p>

                    <h3
                      className="
                        text-sm
                        font-semibold
                        line-clamp-2
                      "
                    >

                      {item.name}

                    </h3>

                    {item.price && (

                      <p
                        className="
                          text-xs
                          mt-1
                          opacity-90
                        "
                      >

                        ₹{item.price}

                      </p>

                    )}

                  </div>

                </div>

              </Link>

            ))}

        </div>

        {/* DESKTOP */}

        <div
          className="
            hidden
            md:flex
            gap-6
            h-[260px]
          "
        >

          <div className="relative flex-[2] min-w-0">

            {slot1()}

          </div>

          <div className="relative flex-[2] min-w-0">

            {slot2()}

          </div>

          <div className="relative flex-[1] min-w-0">

            {slot3()}

          </div>

        </div>

      </div>

    </div>
  );
}