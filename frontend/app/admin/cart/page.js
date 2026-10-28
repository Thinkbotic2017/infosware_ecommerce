"use client"
import { useAuth } from '@/app/context/AuthContext';
import api from '@/app/lib/axios';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

function page() {

 const {user } = useAuth();
  const [cartConfig, setCartConfig] = useState({
    cartDiscount: 0,
    deliveryFee: 0,
    minFreeDeliveryAmount: 0,
    availableCoupons: [],
  });

  // Individual edit states
  const [editField, setEditField] = useState({
    cartDiscount: false,
    deliveryFee: false,
    minFreeDeliveryAmount: false,
  });
  const [couponEditIndex, setCouponEditIndex] = useState(null);

  useEffect(() => {
    fetchCartConfig();
  }, []);

  const fetchCartConfig = async () => {
    try {
      const response = await api.get(`api/user/cart-config`);
      setCartConfig({
        cartDiscount: response.data.cartDiscount || 0,
        deliveryFee: response.data.deliveryFee || 0,
        minFreeDeliveryAmount: response.data.minFreeDeliveryAmount || 0,
        availableCoupons: Array.isArray(response.data.availableCoupons)
          ? response.data.availableCoupons
          : [],
      });
    } catch (error) {
      toast.error('Unable to fetch cart config');
    }
  };

  const handleInputChange = (field, value) => {
    setCartConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveField = async (field) => {
    try {
      await api.post(
        `api/user/cart-config`,
        cartConfig
      );
      setEditField(prev => ({ ...prev, [field]: false }));
      toast.success('Cart config updated!');
    } catch {
      toast.error('Failed to update cart config');
    }
  };

  // Coupon editing
  const handleCouponChange = (idx, field, value) => {
    const updated = [...cartConfig.availableCoupons];
    updated[idx][field] = value;
    setCartConfig(prev => ({ ...prev, availableCoupons: updated }));
  };

  const handleSaveCoupon = async (idx) => {
    try {
      await api.post(
        `api/user/cart-config`,
        cartConfig
       
      );
      setCouponEditIndex(null);
      toast.success('Coupon updated!');
      fetchCartConfig(); 
    } catch {
      toast.error('Failed to update coupon');
    }
  };

  const handleDeleteCoupon = (idx) => {
    const updated = cartConfig.availableCoupons.filter((_, i) => i !== idx);
    setCartConfig(prev => ({ ...prev, availableCoupons: updated }));
    setCouponEditIndex(null);
  };


  const handleAddCoupon = () => {
    setCartConfig(prev => ({
      ...prev,
      availableCoupons: [
        ...prev.availableCoupons,
        { code: '', discount: 0, description: '', validityDays: 0, hidden: false },
        
      ],
    }));
    setCouponEditIndex(cartConfig.availableCoupons.length);
  };


 return (

<div className="space-y-8">

  {/* PAGE HEADER */}

  <div className="flex items-center justify-between">

    <div>

      <h1 className="text-3xl font-bold text-[#0f172a]">

        Cart Settings

      </h1>

      <p className="text-gray-500 mt-1">

        Manage discounts, delivery fees and coupons

      </p>

    </div>

  </div>

  {/* TOP CARDS */}

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

    {/* CART DISCOUNT */}

    <div className="bg-white rounded-md border border-gray-100 shadow-sm p-6">

      <div className="flex items-center justify-between mb-5">

        <div>

          <p className="text-sm text-gray-500">

            Cart Discount

          </p>

          <h2 className="text-3xl font-bold text-[#0f172a]">

            {cartConfig.cartDiscount}%

          </h2>

        </div>

      </div>

      <input
        type="number"
        value={cartConfig.cartDiscount}
        disabled={!editField.cartDiscount}
        onChange={(e) =>
          handleInputChange(
            "cartDiscount",
            Number(e.target.value)
          )
        }
        className="w-full border border-gray-200 rounded-md px-4 py-3 outline-none"
      />

      <button
        onClick={() =>

          editField.cartDiscount

            ? handleSaveField(
                "cartDiscount"
              )

            : setEditField((prev) => ({
                ...prev,
                cartDiscount: true,
              }))
        }

        className="w-full mt-4 py-3 rounded-md bg-gradient-blue-red text-white font-semibold"
      >

        {editField.cartDiscount
          ? "Save"
          : "Edit"}

      </button>

    </div>

    {/* DELIVERY FEE */}

    <div className="bg-white rounded-md border border-gray-100 shadow-sm p-6">

      <p className="text-sm text-gray-500">

        Delivery Fee

      </p>

      <h2 className="text-3xl font-bold text-[#0f172a] mb-5">

        ₹{cartConfig.deliveryFee}

      </h2>

      <input
        type="number"
        value={cartConfig.deliveryFee}
        disabled={!editField.deliveryFee}
        onChange={(e) =>
          handleInputChange(
            "deliveryFee",
            Number(e.target.value)
          )
        }
        className="w-full border border-gray-200 rounded-md px-4 py-3 outline-none"
      />

      <button
        onClick={() =>

          editField.deliveryFee

            ? handleSaveField(
                "deliveryFee"
              )

            : setEditField((prev) => ({
                ...prev,
                deliveryFee: true,
              }))
        }

        className="w-full mt-4 py-3 rounded-md bg-gradient-blue-red text-white font-semibold"
      >

        {editField.deliveryFee
          ? "Save"
          : "Edit"}

      </button>

    </div>

    {/* FREE DELIVERY */}

    <div className="bg-white rounded-md border border-gray-100 shadow-sm p-6">

      <p className="text-sm text-gray-500">

        Free Delivery Above

      </p>

      <h2 className="text-3xl font-bold text-[#0f172a] mb-5">

        ₹{cartConfig.minFreeDeliveryAmount}

      </h2>

      <input
        type="number"
        value={
          cartConfig.minFreeDeliveryAmount
        }
        disabled={
          !editField.minFreeDeliveryAmount
        }
        onChange={(e) =>
          handleInputChange(
            "minFreeDeliveryAmount",
            Number(e.target.value)
          )
        }
        className="w-full border border-gray-200 rounded-md px-4 py-3 outline-none"
      />

      <button
        onClick={() =>

          editField.minFreeDeliveryAmount

            ? handleSaveField(
                "minFreeDeliveryAmount"
              )

            : setEditField((prev) => ({
                ...prev,
                minFreeDeliveryAmount: true,
              }))
        }

        className="w-full mt-4 py-3 rounded-md bg-gradient-blue-red text-white font-semibold"
      >

        {editField.minFreeDeliveryAmount
          ? "Save"
          : "Edit"}

      </button>

    </div>

  </div>

  {/* COUPONS */}

  <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden">

    {/* HEADER */}

    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">

      <div>

        <h2 className="text-2xl font-bold text-[#0f172a]">

          Coupons

        </h2>

        <p className="text-gray-500 text-sm mt-1">

          Manage available discount coupons

        </p>

      </div>

      <button
        onClick={handleAddCoupon}
        className="px-5 py-3 rounded-md bg-gradient-blue-red text-white font-semibold"
      >

        + Add Coupon

      </button>

    </div>

    {/* TABLE */}

    <div className="overflow-x-auto">

      <table className="w-full">

        <thead className="bg-gray-50 text-left text-sm text-gray-500">

          <tr>

            <th className="px-6 py-4">
              Code
            </th>

            <th className="px-6 py-4">
              Discount
            </th>

            <th className="px-6 py-4">
              Description
            </th>

            <th className="px-6 py-4">
              Validity
            </th>

            <th className="px-6 py-4">
              Hidden
            </th>

            <th className="px-6 py-4 text-center">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {cartConfig.availableCoupons.map(
            (c, idx) => (

              <tr
                key={idx}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >

                {/* CODE */}

                <td className="px-6 py-4">

                  <input
                    type="text"
                    value={c.code}
                    disabled={
                      couponEditIndex !== idx
                    }
                    onChange={(e) =>
                      handleCouponChange(
                        idx,
                        "code",
                        e.target.value
                      )
                    }
                    className="border w-20 border-gray-200 rounded-xl px-3 py-2 outline-none"
                  />

                </td>

                {/* DISCOUNT */}

                <td className="px-6 py-4">

                  <div className="flex items-center gap-2">

                    <input
                      type="number"
                      value={c.discount}
                      disabled={
                        couponEditIndex !== idx
                      }
                      onChange={(e) =>
                        handleCouponChange(
                          idx,
                          "discount",
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className="w-18 border border-gray-200 rounded-xl px-3 py-2 outline-none"
                    />

                    <span>%</span>

                  </div>

                </td>

                {/* DESCRIPTION */}

                <td className="px-6 py-4">

                  <input
                    type="text"
                    value={c.description}
                    disabled={
                      couponEditIndex !== idx
                    }
                    onChange={(e) =>
                      handleCouponChange(
                        idx,
                        "description",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none"
                  />
                </td>

                {/* VALIDITY */}

                <td className="px-6 py-4">

                  <input
                    type="number"
                    value={
                      c.validityDays
                    }
                    disabled={
                      couponEditIndex !== idx
                    }
                    onChange={(e) =>
                      handleCouponChange(
                        idx,
                        "validityDays",
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="w-16 border border-gray-200 rounded-xl px-3 py-2 outline-none"
                  />

                </td>

                {/* HIDDEN */}

                <td className="px-6 py-4">

                  <input
                    type="checkbox"
                    checked={!!c.hidden}
                    disabled={
                      couponEditIndex !== idx
                    }
                    onChange={(e) =>
                      handleCouponChange(
                        idx,
                        "hidden",
                        e.target.checked
                      )
                    }
                  />

                </td>

                {/* ACTIONS */}

                <td className="px-6 py-4">

                  <div className="flex items-center justify-center gap-3">

                    {couponEditIndex ===
                    idx ? (

                      <button
                        onClick={() =>
                          handleSaveCoupon(
                            idx
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-green-100 text-green-700 font-semibold"
                      >

                        Save

                      </button>

                    ) : (

                      <button
                        onClick={() =>
                          setCouponEditIndex(
                            idx
                          )
                        }
                        className="px-4 py-2 rounded-xl bg-blue-100 text-blue-700 font-semibold"
                      >

                        Edit

                      </button>

                    )}

                    <button
                      onClick={() =>
                        handleDeleteCoupon(
                          idx
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-red-100 text-red-600 font-semibold"
                    >

                      Delete

                    </button>

                  </div>

                </td>

              </tr>

            )
          )}

        </tbody>

      </table>

    </div>

  </div>

</div>
)
}

export default page
