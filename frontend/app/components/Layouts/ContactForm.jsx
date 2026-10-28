"use client";

import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/lib/axios";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";
import { LuMessageCircleMore } from "react-icons/lu";
import { MdDescription } from "react-icons/md";
function ContactModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();


const [formData, SetFormData] = useState({

  name: "",

  email: "",

  phone: "",

  description: "",
});



  useEffect(() => {

    const hasSeenModal =
      localStorage.getItem(
        "contactModalShown"

      );

    if (!hasSeenModal) {

      const timer = setTimeout(() => {

        setOpen(true);

        localStorage.setItem(
          "contactModalShown",
          "true"
        );

      }, 5000);

      return () => clearTimeout(timer);
    }

  }, []);

  useEffect(() => {

    if (user) {

      SetFormData({

        name:
          user?.firstname || "",

        email:
          user?.email || "",

        phone:
          user?.phone?.replace("+91", "") || "",

        description: "",
      });
    }

  }, [user]);

const handleChange = (e) => {

  const { name } = e.target;

  let value = e.target.value;

  // PHONE

  if (name === "phone") {

    value = value
      .replace(/\D/g, "")
      .slice(0, 10);

  }

  // EMAIL

  else if (name === "email") {

    value = value
      .replace(/\s/g, "");

  }

  // OTHER FIELDS

  else {

    value = value.replace(
      /^\s+/,
      ""
    );

  }

  SetFormData({

    ...formData,

    [name]: value,

  });
};
  const handleSubmit =
    async (e) => {

      e.preventDefault();

      // NAME REGEX

      const NameRegex =
        /^[A-Za-z ]+$/;

      if (
        !NameRegex.test(
          formData.name.trim()
        )
      ) {

        toast.error(

          "Name should contain only letters"

        );

        return;
      }

      // NAME LENGTH

      if (
        formData.name
          .trim().length < 2
      ) {

        toast.error(

          "Name must be at least 2 characters"

        );

        return;
      }

      // EMAIL

      const emailRegex =

        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          formData.email
        )
      ) {

        toast.error(
          "Invalid email"
        );

        return;
      }

      // PHONE

      const phoneRegex =
        /^[0-9]{10}$/;

      if (
        !phoneRegex.test(
          formData.phone
        )
      ) {

        toast.error(
          "Phone has min 10 digits"
        );

        return;
      }

      // DESCRIPTION

      if (
        formData.description
          .trim().length < 5
      ) {

        toast.error(
          "Description too short"
        );

        return;
      }

      try {

        setLoading(true);

        const res =
          await api.post(

            "/api/user/contact/create",

            formData
          );

        toast.success(

          "Query submitted successfully"

        );


SetFormData({

  

  description: "",

});

setOpen(false)


      } catch (err) {

        console.log(err);

        toast.error(

          err.response?.data?.message ||

          "Something went wrong"
        );

      } finally {

        setLoading(false);
      }
    };



  return (
    <>

      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-blue-red text-white p-3 rounded-full hover:scale-105"
      >
        <LuMessageCircleMore size={25} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          ></div>


          <div className="relative bg-white w-[90%] max-w-md rounded-2xl p-6 shadow-2xl z-50 animate-fadeIn">


            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4  bg-gradient-blue-red text-white p-2 rounded-full"
            >
              <FaTimes />
            </button>

            <h2 className="text-2xl font-bold mb-4 text-center text-primary-blue ">
              Contact Us
            </h2>

            <form className="space-y-3" onSubmit={handleSubmit}>

              <div>
                <label className="text-sm">Name</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2  focus:ring-primary-blue"
                  placeholder="Enter your name"
                  name="name" value={formData?.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="text-sm">Email</label>
                <input
                  type="email"
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2  focus:ring-primary-blue"
                  placeholder="Enter your email"
                  name="email" value={formData?.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="text-sm">Phone</label>
                <input
                  type="tel"
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2  focus:ring-primary-blue"
                  placeholder="Enter phone number"
                  name="phone" value={formData?.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="text-sm">Description</label>
                <textarea
                  rows={4}
                  placeholder="Enter description"
                  className="w-full mt-1 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  name="description" value={formData?.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <button type="submit" disabled={loading} className="w-full mt-2 bg-gradient-blue-red text-white py-2 rounded-lg">
                Submit
              </button>

            </form>

          </div>
        </div>
      )}
    </>
  );
}

export default ContactModal;