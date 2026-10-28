"use client"
import Link from 'next/link';
import { useEffect, useState } from 'react'
import ProductCard from '../components/home/Card';
import { FaHeartBroken } from 'react-icons/fa';
import Image from 'next/image';
import api, { BASE_URL } from '../lib/axios';
import { useRouter } from 'next/navigation';
import { useCart }
from "../context/CartContext";
import OrderSummary from '../components/OrderSummary';
function page() {
    const [cart, setCart] = useState([]);
 const [qty, setQty] = useState(1);
const [loading, setLoading] = useState(true);
const router=useRouter();

const {

  cartItems,

  removeFromCart,

  setCartItems,

} = useCart();
// increase decrease qty

const  handleIncrease = async (id) => {
    const updatedCartItems = cartItems.map(item =>
      item.productId === id ? { ...item, quantity: (item.quantity || 1) + 1 } : item);
    setCartItems(updatedCartItems);
    await api.post(
      `api/user/cart/update`,
      { cartItems: updatedCartItems }
    
    );
  };

  const handleDecrease = async (id) => {
    const updatedCartItems = cartItems.map(item => {
      if (item.productId === id) {
        const newQuantity = Math.max((item.quantity || 1) - 1, 1);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedCartItems);
    await api.post(
      `api/user/cart/update`,
      { cartItems: updatedCartItems }
    );
  };

// fetch cart data
//   const fetchCartData = async () => {
//     try {
//       const response = await api.get(`api/user/cart`);
//       console.log("cart products", response.data);
//       setCart(response.data.items || []);
//       setLoading(false);

//     } catch (error) {
//       setLoading(false);
//       if (error.response && error.response.status === 401) {
//         // setShowLoginMessage(true);
//         setTimeout(() => {
//           router.push("/login");
//         }, 3000);
//       } else {
//         console.error("Error fetching cart data:", error);
//       }
//     }
//   };
// useEffect(()=>{
//   fetchCartData();
// },[]);
// remove
//  const handleRemove = async (productId) => {
//     try {
     
//       await api.delete(`api/user/cart/remove/${productId}`);
//       setCart(cart.filter(item => item.productId !== productId));
//     } catch (error) {
//       console.error("Failed to remove item from cart:", error);
//     }
//   };
    return (


        <div>
            <div className="bg-[#f8fafc] min-h-screen pb-16">


                <div className="bg-white border-b border-gray-100 py-4 px-4 lg:px-10">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                        <div>
                            <p className="text-xs text-gray-500 mb-1.5 font-medium tracking-wide">
                                <Link href="/" className="hover:text-primary-blue transition">Home</Link> /
                                <span className="text-[#0f172a] font-bold ml-1">Cart</span>
                            </p>
                            <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a] flex items-center gap-3">
                                My Cart
                                <span className="text-sm font-medium bg-primary-red/10 text-primary-red px-3 py-1 rounded-full">
                                    {cartItems.length} items
                                </span>
                            </h1>
                        </div>

                        {/*     
          {wishlistItems.length > 0 && (
            <button className="w-full md:w-auto bg-gradient-blue-red text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:scale-105 transition duration-300">
              Move All to Cart
            </button>
          )} */}

                    </div>
                </div>
{
cartItems.length >0 ? (

           <div className="max-w-[1400px] mx-auto px-4 lg:px-10 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

  {/*  LEFT SIDE  */}

  
  
<div className="lg:col-span-2 flex flex-col gap-4">

    {cartItems.map((item) => (
     <div
  key={item.productId}
  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
>

  {/* LEFT SECTION */}
  <div className="flex flex-col sm:flex-row gap-4 w-full">

    {/* IMAGE */}
    <div className="relative w-full sm:w-[110px] h-[220px] sm:h-[110px] shrink-0 bg-gray-50 rounded-xl overflow-hidden">

      <Image
        unoptimized
        src={`${BASE_URL}/${item.img}`}
        fill
        className="object-contain p-2"
        alt={item.name}
      />

    </div>

    {/* CONTENT */}
    <div className="flex flex-col justify-center flex-1">

      <div>

        <h3 className="font-semibold text-[#0f172a] text-base sm:text-lg line-clamp-2">

          {item.name}

        </h3>

        <p className="text-gray-500 text-sm mt-1">

          {item.category}

        </p>

       {
    item.imageColor ? (
           <p className="text-gray-400 text-sm">

          Color : {item.imageColor}

        </p>
    ): null
       }

      </div>

      {/* PRICE */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">

        <span className="text-primary-red font-bold text-lg">

          ₹{item.price}

        </span>

        <span className="line-through text-gray-400 text-sm">

          ₹{item.oldPrice}

        </span>

      </div>

    </div>

  </div>

  {/* RIGHT SECTION */}
  <div className="flex items-center justify-between sm:justify-end gap-4 w-full lg:w-auto">

    {/* QTY */}
    <div className="flex items-center shadow-sm rounded-xl overflow-hidden border border-gray-100">

      <button
        onClick={() =>
          handleDecrease(item.productId)
        }
        className="px-4 py-2 text-lg hover:bg-gray-50"
      >
        -
      </button>

      <span className="px-4 min-w-[40px] text-center">

        {item.quantity || 1}

      </span>

      <button
        onClick={() =>
          handleIncrease(item.productId)
        }
        className="px-4 py-2 text-lg hover:bg-gray-50"
      >
        +
      </button>

    </div>

    {/* REMOVE */}
    <button
      onClick={() =>
        removeFromCart(
          item.productId
        )
      }
      className="text-red-500 text-sm font-medium whitespace-nowrap"
    >
      Remove
    </button>

  </div>

</div>
    ))}


    <Link href="/delivery">

        <button className="w-full mt-4 bg-gradient-blue-red text-white py-2 rounded-md font-bold hover:opacity-90 transition">

          Proceed To Checkout

        </button>

      </Link>
  </div>

  
  {/* RIGHT SIDE */}


{/* 
<div className=" p-2 rounded-2xl   h-fit sticky top-24">

    <h2 className="text-xl font-bold mb-4">
      Order Summary
    </h2>

   
    {(() => {
      const subtotal = cartItems.reduce(
        (acc, item) => acc + item.price * (item.quantity || 1),
        0
      );
        const oldPriceTotal = cart.reduce(
        (acc, item) => acc + item.oldPrice * (item.quantity || 1),
        0
      );
 
      const shipping = 50;
      const total = subtotal + shipping;
const discount=oldPriceTotal-subtotal;
      return (
        <>
<div className="flex justify-between text-gray-600 mb-2">
            <span>Old Price</span>
            <span>₹{oldPriceTotal}</span>
          </div>

          <div className="flex justify-between text-gray-600 mb-2">
            <span>Cart Total</span>
            <span>₹{subtotal}</span>
          </div>
 <div className="flex justify-between text-gray-600 mb-2">
            <span>Discount</span>
            <span>₹{discount}</span>
          </div>
          <div className="flex justify-between text-gray-600 mb-2">
            <span>Shipping</span>
            <span>₹{shipping}</span>
          </div>
  <div className="flex justify-between text-gray-600 mb-2">
            <span>Coupon Discount</span>
            <span>₹0.0</span>
          </div>
            <div className="flex justify-between text-gray-600 mb-2">
            <span>GST</span>
            <span>₹899</span>
          </div>
            <div className="flex justify-between text-gray-600 mb-2">
            <span>Shipping charges</span>
            <span>₹{shipping}</span>
          </div>
          <div className="border-t my-3"></div>

          <div className="flex justify-between font-bold text-lg">
            <span className='text-primary-red'>Total</span>
            <span className='text-primary-red'>₹{total}</span>
          </div>

          <button className="w-full mt-6 bg-gradient-blue-red  text-white py-2 rounded-xl font-bold">
            <Link href="/delivery">Checkout</Link>

          </button>
        </>
      );
    })()}

  </div> */}


    <OrderSummary  />


</div>


): (

          /*  EMPTY STATE */
          <div className="bg-white rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[450px] border border-gray-100 shadow-sm mt-4">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <FaHeartBroken className="text-primary-red/40 text-5xl" />
            </div>

            <h3 className="text-3xl font-bold text-[#0f172a] mb-3">Your Cart is empty</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed text-lg">
              Looks like you haven't found anything you love yet. Explore our collections and find something perfect!
            </p>

            <Link href="/products">
              <button className="bg-gradient-blue-red text-white px-10 py-3.5 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-primary-blue/20">
                Continue Shopping
              </button>
            </Link>
          </div>

        )

    
}

            </div>
        </div>
    )
}

export default page
