"use client";

import {

  useEffect,

  useMemo,

  useState,

} from "react";

import { useCart } from "../context/CartContext";
import api from "../lib/axios";
import toast from "react-hot-toast";

function OrderSummary({
showCoupon = true,
 onSummaryChange,
 onTotalChange,

}) {

  const {

    cartItems,

  } = useCart();

  const [couponInput,
    setCouponInput] =
    useState("");

  const [appliedCoupon,
    setAppliedCoupon] =
    useState(null);

const [couponLoaded,
setCouponLoaded] =
useState(false);

const [OrderSummary,setOrderSummary]=useState(null);

const [showCoupons,
setShowCoupons] =
useState(false);


  const [availableCoupons,
    setAvailableCoupons] =
    useState([]);

  const [pricingConfig,
    setPricingConfig] =
    useState({

      cartDiscount: 0,

      deliveryFee: 0,

      minFreeDeliveryAmount: 0,
    });

const [couponInitialized,
setCouponInitialized] =
useState(false);

useEffect(() => {

  const savedCoupon =
    localStorage.getItem(
      "appliedCoupon"
    );

  if (savedCoupon) {

    setAppliedCoupon(
      JSON.parse(savedCoupon)
    );

  }

  setCouponInitialized(true);

}, []);
useEffect(() => {

  if (!couponInitialized)
    return;

  const fetchSummary =
    async () => {

      const res =
        await api.get(
          `/api/user/orderSummary?couponCode=${appliedCoupon?.code || ""}`
        );

      setOrderSummary(
        res.data.summary
      );
    };

  fetchSummary();

}, [
  cartItems,
  appliedCoupon,
  couponInitialized
]);
// useEffect(() => {

// const savedCoupon =
// localStorage.getItem(
// "appliedCoupon"
// );

// if (savedCoupon) {


// setAppliedCoupon(
//   JSON.parse(savedCoupon)
// );


// }

// }, []);


useEffect(() => {

if (appliedCoupon) {


localStorage.setItem(
  "appliedCoupon",
  JSON.stringify(appliedCoupon)
);


} else {


localStorage.removeItem(
  "appliedCoupon"
);


}

}, [appliedCoupon]);


  useEffect(() => {

    const fetchConfig =
      async () => {

        try {

          const res =
            await api.get(

              "/api/user/cart-config"
            );

          setPricingConfig({

            cartDiscount:
              res.data.cartDiscount || 0,

            deliveryFee:
              res.data.deliveryFee || 0,

            minFreeDeliveryAmount:
              res.data.minFreeDeliveryAmount || 0,
          });

         const coupons =
  Array.isArray(
    res.data.availableCoupons
  )

    ? res.data.availableCoupons

    : [];

setAvailableCoupons(
  coupons
);
setCouponLoaded(true);
        } catch (error) {

          console.log(error);
        }
      };

    fetchConfig();

  }, []);

useEffect(() => {

  if (
    !couponLoaded ||
    !appliedCoupon
  ) return;

  const couponExists =
    availableCoupons.some(
      (coupon) =>

        coupon.code ===
        appliedCoupon.code
    );

  if (!couponExists) {

    setAppliedCoupon(null);

    localStorage.removeItem(
      "appliedCoupon"
    );

  }

}, [

  availableCoupons,

  appliedCoupon,

  couponLoaded

]);


// const coupons =
//   Array.isArray(
//     res.data.availableCoupons
//   )
//     ? res.data.availableCoupons
//     : [];

// setAvailableCoupons(
//   coupons
// );

  // CART TOTAL

const cartTotal =
  useMemo(() => {

    return cartItems.reduce(

      (acc, item) =>

        acc +

        item.price *

        (item.quantity || 1),

      0
    );

  }, [cartItems]);




const oldPriceTotal =
  useMemo(() => {

    return cartItems.reduce(

      (acc, item) =>

        acc +

        (item.oldPrice ||
          item.price) *

        (item.quantity || 1),

      0
    );

  }, [cartItems]);


const productDiscount =

  oldPriceTotal -
  cartTotal;

const cartDiscount =

  (cartTotal *

    pricingConfig.cartDiscount) /

  100;


const couponDiscount =

  appliedCoupon

    ? (cartTotal *

      appliedCoupon.discount) /

    100

    : 0;

const subtotal =

  cartTotal -

  cartDiscount -

  couponDiscount;

const avgGstPercent =

  cartItems.length > 0

    ? cartItems.reduce(

      (acc, item) =>

        acc + (item.gst || 0),

      0

    ) / cartItems.length

    : 0;

const gstAmount =

  (subtotal *

    avgGstPercent) /

  100;

const deliveryFee =

  subtotal >=
  pricingConfig.minFreeDeliveryAmount

    ? 0

    : pricingConfig.deliveryFee;



const total =

  subtotal +

  gstAmount +

  deliveryFee;

 
  
useEffect(() => {

  if (onTotalChange) {

    onTotalChange(total);
  }

  if (onSummaryChange) {

    onSummaryChange({

      cartTotal,

      cartDiscount,

      couponDiscount,

      gstAmount,

      deliveryFee,

      total,
    });
  }

}, [

  total,

  cartTotal,

  cartDiscount,

  couponDiscount,

  gstAmount,

  deliveryFee,
]);



const handleApplyCoupon =
  () => {

    const coupon =
      availableCoupons.find(
        (c) =>
          c.code.toLowerCase() ===
          couponInput
            .trim()
            .toLowerCase()
      );

  if (!coupon) {

  toast.error(
    "Invalid coupon code"
  );

  return;
}

toast.success(
  "Coupon applied successfully"
);

    setAppliedCoupon(
      coupon
    );

    setCouponInput("");
  };

  return (

    <div className="sticky top-24 bg-white rounded-md border border-gray-100 shadow-sm p-4">

      {/* TITLE */}

      <h2 className="text-2xl font-bold text-[#0f172a] mb-2">

        Order Summary

      </h2>

      {/* PRICE DETAILS */}

      <div className="space-y-2">

        <div className="flex justify-between text-gray-600">

          <span>

            Old Price

          </span>

          <span>

            ₹{OrderSummary?.oldPriceTotal}

          </span>

        </div>

        <div className="flex justify-between text-gray-600">

          <span>

            Cart Total

          </span>

          <span>

            ₹{OrderSummary?.cartTotal}

          </span>

        </div>

        {/* <div className="flex justify-between text-green-600">

          <span>

            Product Discount

          </span>

          <span>

            - ₹{productDiscount.toFixed(2)}

          </span>

        </div> */}

        <div className="flex justify-between text-green-600">

          <span>

            Cart Discount

          </span>

          <span>

            - ₹{OrderSummary?.cartDiscount}

          </span>

        </div>

        <div className="flex justify-between text-green-600">

          <span>

            Coupon Discount

          </span>

          <span>

            - ₹{OrderSummary?.couponDiscount}

          </span>

        </div>

           <div className="flex justify-between ">

          <span>

            Subtotal

          </span>

          <span>

             ₹{OrderSummary?.subtotal}

          </span>

        </div>

        <div className="flex justify-between text-red-600">

          <span>
            GST ({OrderSummary?.avgGstPercent}%)
          </span>

          <span>

            +₹{OrderSummary?.gstAmount}

          </span>

        </div>

        <div className="flex justify-between text-gray-600">

          <span>

            Delivery Fee

          </span>

          <span>

            {OrderSummary?.deliveryFee === 0

              ? "Free"

              : `₹${OrderSummary?.deliveryFee}`}
          </span>

        </div>

      </div>

      {/* TOTAL */}

      <div className="border-t border-gray-200 my-2"></div>

      <div className="flex justify-between items-center">

        <h3 className="text-xl font-bold text-primary-red">

          Total

        </h3>

        <h3 className="text-xl font-bold text-primary-red">

          ₹{OrderSummary?.total}

        </h3>

      </div>




      {/* COUPON SECTION */}


{/* COUPON SECTION */}

{showCoupon && (

  <div className="mt-8">

    {/* HEADER */}

    <div className="flex items-center justify-between mb-4">

      <h4 className="font-semibold text-[#0f172a]">

        Coupons

      </h4>

      <button
        type="button"
        onClick={() =>

          setShowCoupons(
            !showCoupons
          )
        }
        className="text-primary-red font-medium hover:underline"
      >

        {showCoupons

          ? "Hide Coupons"

          : "Show Coupons"}
      </button>

    </div>

    {/* APPLIED COUPON */}

    {appliedCoupon && (

      <div className="border border-green-200 bg-green-50 rounded-2xl p-4 flex items-center justify-between mb-4">

        <div>

          <h5 className="font-bold text-green-700">

        Coupon Code:   {appliedCoupon.code}

          </h5>

          <p className="text-sm text-green-600">

            {appliedCoupon.discount}% OFF Applied

          </p>

        </div>

        <button
          type="button"
          onClick={() =>

            setAppliedCoupon(
              null
            )
          }
          className="text-red-500 font-medium"
        >

          Remove

        </button>

      </div>
    )}
<div className="flex flex-col sm:flex-row gap-2 mb-4">

  <input
    type="text"
    value={couponInput}
    onChange={(e) =>
      setCouponInput(
        e.target.value
      )
    }
    placeholder="Enter coupon code"
    className="w-full flex-1 border border-gray-200 rounded-xl px-4 py-3 outline-none"
  />

  <button
    type="button"
    onClick={handleApplyCoupon}
    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-blue-red text-white font-semibold whitespace-nowrap"
  >
    Apply
  </button>

</div>
    {/* COUPON LIST */}

    {showCoupons && (

      <div className="space-y-3">

        {availableCoupons.filter(
    (coupon) => !coupon.hidden
  ).map(
          (coupon, index) => (

            <div
              key={index}
              className={`border rounded-2xl p-4 flex items-center justify-between

${

appliedCoupon?.code ===
coupon.code

? "border-primary-red bg-red-50"

: "border-gray-200"
}
`}
            >

              {/* LEFT */}

              <div>

                <h5 className="font-bold text-[#0f172a]">

                  {coupon.code}

                </h5>

                <p className="text-sm text-gray-500">

                  {coupon.description ||

                    `${coupon.discount}% OFF`}
                </p>

              </div>

              {/* APPLY */}

              <button
                type="button"
                onClick={() =>

                  setAppliedCoupon(
                    coupon
                  )
                }
                disabled={

appliedCoupon?.code ===
coupon.code
                }
                className="px-4 py-2 rounded-xl bg-gradient-blue-red text-white text-sm font-semibold disabled:opacity-50"
              >

                {appliedCoupon?.code ===
coupon.code

                  ? "Applied"

                  : "Apply"}
              </button>

            </div>
          )
        )}

      </div>
    )}

  </div>
)}




      {/* CHECKOUT */}


    </div>
  );
}

export default OrderSummary;

