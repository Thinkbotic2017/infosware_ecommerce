
"use client";

import { useForm } from "react-hook-form";
import { FaMapMarkerAlt } from "react-icons/fa";
import { useSearchParams } from "next/navigation";


import { useEffect } from "react";



import toast from "react-hot-toast";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/context/AuthContext";


function ProductInquiry() {
const {user} =useAuth();
 const searchParams =
    useSearchParams();

const productName =
searchParams.get("productName") || "";

const productCategory =
searchParams.get("category") || "";
const {

  register,

  handleSubmit,

  formState: { errors },

  reset,
setValue,

} = useForm({

  defaultValues: {

    productName:
      productName || "",

    productCategory:
      productCategory || "",

    name:
      user?.firstname || "",

    email:
      user?.email || "",

    mobile:
      user?.phone?.replace("+91", "") || "",

    altMobile: "",

    quantity: "",

    description: "",
  },
});
useEffect(() => {

  if (user) {

    setValue(
      "name",
      user?.firstname || ""
    );

    setValue(
      "email",
      user?.email || ""
    );

    setValue(
      "mobile",
      user?.phone?.replace("+91", "") || ""
    );

  }

}, [user, setValue]);

  const type =
    searchParams.get("type");

  const heading =
    type === "custom"

      ? "Customization Request"

      : "Bulk Order Inquiry";

  const description =
    type === "custom"

      ? "Tell us your customization requirements."

      : "Get the best pricing for large quantity orders.";

  const badgeText =
    type === "custom"

      ? "CUSTOMIZATION"

      : "BULK ORDER";


const onSubmit =
async (data) => {

  try {

    const payload = {

      ...data,

      isBulkOrder:
        type !== "custom",

      isCustomization:
        type === "custom",
    };

    const res =
      await api.post(

        "/api/comman/inquiry",

        payload
      );

    toast.success(

      res.data.message ||

      "Inquiry submitted successfully"
    );

    reset({

      productName,

      productCategory,

      name:
        user?.username || "",

      email:
        user?.email || "",

      mobile:
        user?.phone?.replace("+91", "") || "",

      altMobile: "",

      quantity: "",

      description: "",
    });

  } catch (error) {

    console.log(error);

    toast.error(

      error.response?.data?.message ||

      "Failed to submit inquiry"
    );
  }
};


  return (

    <div className="min-h-screen bg-[#f8fafc]">

      {/* FORM SECTION */}

      <div className="max-w-5xl mx-auto px-4 lg:px-10 py-12">

        <form

          onSubmit={handleSubmit(onSubmit)}

          className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        >

          {/* HEADER */}

          <div className="relative bg-gray-50 border-b border-gray-100 px-8 py-6">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-2xl bg-primary-blue/10 flex items-center justify-center text-primary-blue text-xl">

                <FaMapMarkerAlt />

              </div>

              <div>

                <h2 className="text-2xl font-bold text-[#0f172a]">

                  Product Inquiry Form

                </h2>

                <p className="text-gray-500 text-sm">

                  Fill in your details and requirements

                </p>

                <div className="absolute top-6 right-6">

                  <span
                    className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide shadow-sm ${
                      type === "custom"

                        ? "bg-primary-red text-white"

                        : "bg-primary-blue text-white"
                    }`}
                  >

                    {badgeText}

                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* FORM BODY */}

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* PRODUCT NAME */}

            <div>

              <label className="label">

                Product Name *

              </label>

              <input
readOnly
                {...register("productName", {

                  required:
                    "Product name is required",
                })}

                className="input bg-gray-100 cursor-not-allowed"

                placeholder="Enter Product Name"
              />

              {errors.productName && (

                <p className="text-red-500 text-sm mt-1">

                  {errors.productName.message}

                </p>
              )}

            </div>

            {/* CATEGORY */}

            <div>

              <label className="label">

                Product Category *

              </label>

              <input
readOnly
                {...register("productCategory", {

                  required:
                    "Product category is required",
                })}

                className="input bg-gray-100 cursor-not-allowed"

                placeholder="Electronics / Fashion"
              />

              {errors.productCategory && (

                <p className="text-red-500 text-sm mt-1">

                  {errors.productCategory.message}

                </p>
              )}

            </div>

            {/* NAME */}

            <div>

              <label className="label">

                Your Name *

              </label>

              <input
               onInput={(e) => {

    e.target.value =
      e.target.value.replace(
        /^\s+/,
        ""
      );

  }}

                {...register("name", {
                    setValueAs: (value) =>
    value.replace(/^\s+/, ""),

                  required:
                    "Name is required",

                  pattern: {

                    value:
/^[A-Za-z ]+$/,

                    message:
"Only letters allowed",
                  },

                  minLength: {

                    value: 2,

                    message:
"Minimum 2 characters",
                  },
                })}

                className="input"

                placeholder="John Doe"
              />

              {errors.name && (

                <p className="text-red-500 text-sm mt-1">

                  {errors.name.message}

                </p>
              )}

            </div>

            {/* EMAIL */}

            <div>

              <label className="label">

                Email Address *

              </label>

              <input
               onInput={(e) => {

    e.target.value =
      e.target.value.replace(
        /^\s+/,
        ""
      );

  }}

                {...register("email", {
                    setValueAs: (value) =>
    value.replace(/^\s+/, ""),

                  required:
                    "Email is required",

                  pattern: {

                    value:
/^[^\s@]+@[^\s@]+\.[^\s@]+$/,

                    message:
"Invalid email",
                  },
                })}

                className="input"

                placeholder="john@example.com"
              />

              {errors.email && (

                <p className="text-red-500 text-sm mt-1">

                  {errors.email.message}

                </p>
              )}

            </div>

            {/* MOBILE */}

            <div>

              <label className="label">

                Mobile Number *

              </label>

              <input
              

                type="text"

                maxLength={10}

                onInput={(e) => {

                  e.target.value =
e.target.value.replace(
/[^0-9]/g,
""
);
                }}

                {...register("mobile", {
  setValueAs: (value) =>
    value.replace(/^\s+/, ""),
                  required:
"Mobile number is required",

                  pattern: {

                    value:
/^[0-9]{10}$/,

                    message:
"Mobile must be 10 digits",
                  },
                })}

                className="input"

                placeholder="9999999999"
              />

              {errors.mobile && (

                <p className="text-red-500 text-sm mt-1">

                  {errors.mobile.message}

                </p>
              )}

            </div>

            {/* ALT MOBILE */}

            <div>

              <label className="label">

                Alternative Mobile

              </label>

              <input

                type="text"

                maxLength={10}

                onInput={(e) => {

                  e.target.value =
e.target.value.replace(
/[^0-9]/g,
""
);
                }}

                {...register("altMobile", {
  setValueAs: (value) =>
    value.replace(/^\s+/, ""),
                  pattern: {

                    value:
/^[0-9]{10}$/,

                    message:
"Alternative mobile must be 10 digits",
                  },
                })}

                className="input"

                placeholder="Optional"
              />

              {errors.altMobile && (

                <p className="text-red-500 text-sm mt-1">

                  {errors.altMobile.message}

                </p>
              )}

            </div>

            {/* QUANTITY */}

            <div className="md:col-span-2">

              <label className="label">

                Required Quantity *

              </label>

              <input

onInput={(e) => {

  e.target.value =
    e.target.value.replace(
      /\D/g,
      ""
    );

}}
                type="text"

                {...register("quantity", {
                  setValueAs: (value) =>
    value.replace(/^\s+/, ""),

                  required:
"Quantity is required",
validate: (value) => {

      if (!/^\d+$/.test(value)) {

        return "Alphabets are not allowed";

      }

      return true;

    },
                  min: {

                    value: 1,

                    message:
"Minimum quantity is 1",
                  },
                })}

                className="input"

                placeholder="Enter Quantity"
              />

              {errors.quantity && (

                <p className="text-red-500 text-sm mt-1">

                  {errors.quantity.message}

                </p>
              )}

            </div>

            {/* DESCRIPTION */}

            <div className="md:col-span-2">

              <label className="label">

                Describe Your Requirements *

              </label>

              <textarea
 onInput={(e) => {

    e.target.value =
      e.target.value.replace(
        /^\s+/,
        ""
      );

  }}
                rows={5}

                {...register("description", {

                    setValueAs: (value) =>
    value.replace(/^\s+/, ""),
                  required:
"Description is required",

                  minLength: {

                    value: 5,

                    message:
"Minimum 5 characters required",
                  },

                  maxLength: {

                    value: 1000,

                    message:
"Description too long",
                  },
                })}

                className="input resize-none"

                placeholder={
                  type === "custom"

                    ? "Explain customization details..."

                    : "Mention quantity, delivery, packaging..."
                }
              />

              {errors.description && (

                <p className="text-red-500 text-sm mt-1">

                  {errors.description.message}

                </p>
              )}

            </div>

          </div>

          {/* FOOTER */}

          <div className="border-t border-gray-100 bg-gray-50 px-8 py-6 flex justify-between items-center flex-wrap gap-4">

            <p className="text-sm text-gray-500">

              Our team will contact you within 24 hours.

            </p>

            <button

              type="submit"

              className="px-8 py-3 bg-gradient-blue-red text-white rounded-2xl font-bold shadow-md hover:shadow-xl hover:scale-[1.02] transition"
            >

              Submit Inquiry

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default ProductInquiry;

