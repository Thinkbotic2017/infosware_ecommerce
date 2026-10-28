"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaClock, FaMapMarkerAlt, FaPaperPlane, FaPhone } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";

import api from "@/app/lib/axios";
import { useAuth } from "@/app/context/AuthContext";

const PAGE_X = "px-4 md:px-8 xl:px-12";

const INFO = [
  {
    icon: FaPhone,
    title: "Call Us",
    text: "+91 9667661934",
    href: "tel:+919667661934",
  },
  {
    icon: IoIosMail,
    title: "Email Us",
    text: "info@infosware.in",
    href: "mailto:info@infosware.in",
  },
  {
    icon: FaMapMarkerAlt,
    title: "Visit Us",
    text: "Sector 3, Noida, Uttar Pradesh - 201301",
  },
  {
    icon: FaClock,
    title: "Support",
    text: "Available 24/7",
  },
];

function ContactPage() {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      subject: "",
      message: "",
    },
  });

  // Fill name, email and mobile automatically for logged-in users
  useEffect(() => {
    if (!user) return;

    setValue("name", user?.firstname || user?.username || "");
    setValue("email", user?.email || "");
    setValue("mobile", user?.phone?.replace("+91", "") || "");
  }, [user, setValue]);

  const onSubmit = async (data) => {
    try {
      // Uses your existing inquiry route, so no new backend code is needed.
      // The subject and message are sent together in "description".
      const payload = {
        productName: "General Enquiry",
        productCategory: "General",
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        altMobile: "",
        quantity: "1",
        description: `${data.subject}\n\n${data.message}`,
        isBulkOrder: false,
        isCustomization: false,
      };

      const res = await api.post("/api/comman/inquiry", payload);

      toast.success(res.data?.message || "Message sent successfully");

      reset({
        name: user?.firstname || user?.username || "",
        email: user?.email || "",
        mobile: user?.phone?.replace("+91", "") || "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* PAGE HEADER */}
      <section className={`bg-gradient-blue-red py-10 text-white ${PAGE_X}`}>
        <h1 className="text-3xl font-bold md:text-4xl">Contact Us</h1>
        <p className="mt-2 text-sm text-white/90 md:text-base">
          Have a question or need help with an order? Send us a message and our team will get
          back to you.
        </p>
      </section>

      <div className={`mx-auto grid max-w-6xl gap-6 py-10 lg:grid-cols-[340px_1fr] ${PAGE_X}`}>
        {/* INFO CARDS */}
        <div className="space-y-4">
          {INFO.map(({ icon: Icon, title, text, href }) => {
            const card = (
              <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-blue-red text-white">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">{title}</p>
                  <p className="text-[15px] font-semibold text-[#0f172a]">{text}</p>
                </div>
              </div>
            );

            return href ? (
              <a key={title} href={href} className="block">
                {card}
              </a>
            ) : (
              <div key={title}>{card}</div>
            );
          })}
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl"
        >
          <div className="border-b border-gray-100 bg-gray-50 px-8 py-6">
            <h2 className="text-2xl font-bold text-[#0f172a]">Send us a message</h2>
            <p className="text-sm text-gray-500">Fill in the form and we will reply soon</p>
          </div>

          <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2">
            {/* NAME */}
            <div>
              <label className="label">Your Name *</label>
              <input
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/^\s+/, "");
                }}
                {...register("name", {
                  setValueAs: (value) => value.replace(/^\s+/, ""),
                  required: "Name is required",
                  pattern: {
                    value: /^[A-Za-z ]+$/,
                    message: "Only letters allowed",
                  },
                  minLength: {
                    value: 2,
                    message: "Minimum 2 characters",
                  },
                })}
                className="input"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="label">Email Address *</label>
              <input
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/^\s+/, "");
                }}
                {...register("email", {
                  setValueAs: (value) => value.replace(/^\s+/, ""),
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email",
                  },
                })}
                className="input"
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* MOBILE */}
            <div>
              <label className="label">Mobile Number *</label>
              <input
                type="text"
                maxLength={10}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }}
                {...register("mobile", {
                  setValueAs: (value) => value.replace(/^\s+/, ""),
                  required: "Mobile number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Mobile must be 10 digits",
                  },
                })}
                className="input"
                placeholder="9999999999"
              />
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-500">{errors.mobile.message}</p>
              )}
            </div>

            {/* SUBJECT */}
            <div>
              <label className="label">Subject *</label>
              <input
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/^\s+/, "");
                }}
                {...register("subject", {
                  setValueAs: (value) => value.replace(/^\s+/, ""),
                  required: "Subject is required",
                  minLength: {
                    value: 3,
                    message: "Minimum 3 characters",
                  },
                })}
                className="input"
                placeholder="How can we help?"
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
              )}
            </div>

            {/* MESSAGE */}
            <div className="md:col-span-2">
              <label className="label">Your Message *</label>
              <textarea
                rows={6}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/^\s+/, "");
                }}
                {...register("message", {
                  setValueAs: (value) => value.replace(/^\s+/, ""),
                  required: "Message is required",
                  minLength: {
                    value: 5,
                    message: "Minimum 5 characters required",
                  },
                  maxLength: {
                    value: 1000,
                    message: "Message too long",
                  },
                })}
                className="input resize-none"
                placeholder="Write your message here..."
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 bg-gray-50 px-8 py-6">
            <p className="text-sm text-gray-500">Our team will contact you within 24 hours.</p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-2xl bg-gradient-blue-red px-8 py-3 font-bold text-white shadow-md transition hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaPaperPlane size={14} />
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContactPage;