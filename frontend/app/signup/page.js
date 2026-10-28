
"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/app/lib/axios";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === "username") {
      value = value.replace(/[^A-Za-z0-9_]/g, "");
    }

    if (name === "firstname" || name === "lastname") {
      value = value.replace(/[^A-Za-z ]/g, "");
    }

    if (name === "phone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "email") {
      value = value.replace(/\s/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = formData.username.trim();
    const firstname = formData.firstname.trim();
    const lastname = formData.lastname.trim();
    const email = formData.email.trim().toLowerCase();

    const usernameRegex = /^[A-Za-z0-9_]+$/;
    const nameRegex = /^[A-Za-z ]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (username.length < 3 || !usernameRegex.test(username)) {
      toast.error(
        "Username must be at least 3 characters and contain only letters, numbers, or underscores."
      );
      return;
    }

    if (firstname.length < 3 || !nameRegex.test(firstname)) {
      toast.error("Enter a valid first name with at least 3 characters.");
      return;
    }

    if (lastname.length < 3 || !nameRegex.test(lastname)) {
      toast.error("Enter a valid last name with at least 3 characters.");
      return;
    }

    if (!phoneRegex.test(formData.phone)) {
      toast.error("Phone number must contain exactly 10 digits.");
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username,
        firstname,
        lastname,
        phone: formData.phone,
        email,
        password: formData.password,
      };

      const response = await api.post("/api/auth/signUp", payload);

      const loggedUser =
        response.data.user || response.data.userData;

      toast.success("Account created successfully!");

      setFormData({
        username: "",
        firstname: "",
        lastname: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      if (loggedUser) {
        setUser(loggedUser);
        router.push("/");
      } else {
        router.push("/signin");
      }
    } catch (error) {
      console.error(
        "Signup error:",
        error.response?.data || error.message
      );

      const message =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        "";

      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes("username")) {
        toast.error("Username already taken.");
      } else if (lowerMessage.includes("email")) {
        toast.error("Email already registered.");
      } else if (lowerMessage.includes("phone")) {
        toast.error("Phone number already registered.");
      } else if (!error.response) {
        toast.error(
          "Cannot connect to the server. Check your backend."
        );
      } else {
        toast.error(message || "Unable to create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Input styling
  const inputClass =
    "peer w-full px-4 pt-5 pb-2 border border-gray-200 rounded-md bg-gray-50 text-gray-800 placeholder-transparent focus:bg-white focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 outline-none transition-all duration-200 disabled:opacity-60";

  // Float label on focus OR when the input contains text.
  const labelClass =
    "absolute left-4 top-1 text-xs text-gray-500 transition-all duration-200 pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs";

  return (
    <div className="min-h-screen flex bg-gradient-blue-red overflow-hidden">
      {/* LEFT SIDE */}
      <div className="relative hidden lg:flex lg:w-1/2 overflow-hidden items-center justify-center">
        <div className="absolute inset-0"></div>

        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl"></div>

        <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center justify-center px-10 mt-5 text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Infosware
          </h1>

          <p className="text-white/80 mt-4 text-lg max-w-md leading-relaxed">
            Build your account and explore premium shopping
            experiences with futuristic technology and modern design.
          </p>

          <div className="relative w-[500px] h-[500px] mt-6">
            <DotLottieReact
              src="/ecomm_cart.lottie"
              loop
              autoplay
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 relative">
        <div className="absolute top-10 right-10 w-40 h-40 rounded-full blur-3xl"></div>

        <div className="absolute bottom-10 left-10 w-52 h-52 rounded-full blur-3xl"></div>

        {/* SIGNUP CARD */}
        <div
          className="relative z-10 w-full max-w-2xl backdrop-blur-xl rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1"
          style={{
            boxShadow:
              "rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px",
          }}
        >
          {/* HEADER */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white">
              Create Account
            </h2>

            <p className="text-white mt-3">
              Join us and start your premium journey today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* USERNAME */}
            <div className="relative">
              <input
                type="text"
                name="username"
                autoFocus
                autoComplete="username"
                required
                minLength={3}
                value={formData.username}
                onChange={handleChange}
                placeholder=" "
                disabled={loading}
                className={inputClass}
              />
              <label className={labelClass}>Username</label>
            </div>

            {/* FIRST NAME AND LAST NAME */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="relative">
                <input
                  type="text"
                  name="firstname"
                  autoComplete="given-name"
                  required
                  minLength={3}
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder=" "
                  disabled={loading}
                  className={inputClass}
                />
                <label className={labelClass}>First Name</label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="lastname"
                  autoComplete="family-name"
                  required
                  minLength={3}
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder=" "
                  disabled={loading}
                  className={inputClass}
                />
                <label className={labelClass}>Last Name</label>
              </div>
            </div>

            {/* PHONE AND EMAIL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel-national"
                  inputMode="numeric"
                  required
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder=" "
                  disabled={loading}
                  className={inputClass}
                />
                <label className={labelClass}>Phone Number</label>
              </div>

              <div className="relative">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder=" "
                  disabled={loading}
                  className={inputClass}
                />
                <label className={labelClass}>Email Address</label>
              </div>
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder=" "
                disabled={loading}
                className={`${inputClass} pr-16`}
              />
              <label className={labelClass}>Enter Password</label>

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-600 hover:text-primary-blue"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                autoComplete="new-password"
                required
                minLength={8}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder=" "
                disabled={loading}
                className={`${inputClass} pr-16`}
              />
              <label className={labelClass}>Confirm Password</label>

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-600 hover:text-primary-blue"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* SIGNUP BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md bg-gradient-blue text-white font-bold text-lg shadow-lg transition-all duration-300 ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:shadow-xl hover:scale-[1.01]"
              }`}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* LOGIN LINK */}
          <div className="mt-6 text-center">
            <p className="text-white text-sm">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-primary-blue font-bold hover:text-primary-blue transition"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
