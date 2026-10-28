"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import api from "@/app/lib/axios";

export default function SigninPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [loginType, setLoginType] = useState("user"); // "user" | "admin"
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isAdminLogin = loginType === "admin";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const username = formData.username.trim();
    const password = formData.password;

    if (!username || !password) {
      toast.error("Please enter your username and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", {
        username,
        password,
        loginType, // backend can use this too (see note below)
      });

      const loggedUser =
        response.data.userData || response.data.user || response.data;

      if (!loggedUser || response.data.success === false) {
        toast.error(response.data.message || "Login failed.");
        return;
      }

      const userIsAdmin = !!(loggedUser.isAdmin || loggedUser.role === "admin");

      // ADMIN LOGIN: only real admins are allowed
      if (isAdminLogin) {
        if (!userIsAdmin) {
          // End the session that was just created
          try {
            await api.post("/api/auth/logout");
          } catch (_) {}
          setUser(null);
          toast.error("This account is not an admin.");
          return;
        }

        setUser(loggedUser);
        toast.success("Welcome, Admin!");
        router.push("/admin");
        return;
      }

      // USER LOGIN: normal flow
      setUser(loggedUser);
      toast.success("Login successful!");
      router.push("/");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);

      const status = error.response?.status;
      const serverMsg =
        error.response?.data?.msg || error.response?.data?.message;

      if (status === 401 || status === 400) {
        toast.error(serverMsg || "Invalid username or password.");
      } else if (status === 403) {
        toast.error(serverMsg || "You do not have permission to log in here.");
      } else if (status === 404) {
        toast.error(serverMsg || "Account not found. Please check your username.");
      } else if (!error.response) {
        toast.error("Cannot connect to the server. Please check your backend.");
      } else {
        toast.error(serverMsg || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "peer w-full px-4 pt-5 pb-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900 focus:bg-white focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 outline-none transition-all disabled:opacity-60";
  const labelClass =
    "absolute left-4 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-sm";

  const tabClass = (active) =>
    `flex-1 py-2.5 rounded-md text-sm font-bold transition-all duration-200 ${
      active
        ? "bg-white text-gray-900 shadow"
        : "text-white/80 hover:text-white"
    }`;

  return (
    <div className="min-h-screen flex bg-gradient-blue-red overflow-hidden">
      {/* LEFT SIDE */}
      <div className="relative hidden lg:flex lg:w-1/2 overflow-hidden items-center justify-center">
        <div className="absolute inset-0"></div>
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center justify-center px-10 mt-5 text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">Infosware</h1>
          <p className="text-white/80 mt-4 text-lg max-w-md leading-relaxed">
            Build your account and explore premium shopping experiences with
            futuristic technology and modern design.
          </p>
          <div className="relative w-[500px] h-[500px] mt-6">
            <DotLottieReact src="/ecomm_cart.lottie" loop autoplay />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 relative">
        <div className="absolute top-10 right-10 w-40 h-40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-52 h-52 rounded-full blur-3xl"></div>

        <div
          className="relative z-10 w-full max-w-2xl backdrop-blur-xl rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1"
          style={{
            boxShadow:
              "rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px",
          }}
        >
          {/* USER / ADMIN SWITCH */}
          <div className="flex gap-1 p-1 mb-8 rounded-lg bg-white/15">
            <button
              type="button"
              onClick={() => setLoginType("user")}
              disabled={loading}
              className={tabClass(!isAdminLogin)}
            >
              User Login
            </button>
            <button
              type="button"
              onClick={() => setLoginType("admin")}
              disabled={loading}
              className={tabClass(isAdminLogin)}
            >
              Admin Login
            </button>
          </div>

          {/* HEADER */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white">
              {isAdminLogin ? "Admin Login" : "Login"}
            </h2>
            <p className="text-white mt-3">
              {isAdminLogin
                ? "Sign in to manage products and the store."
                : "Welcome back! Please login to continue."}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <input
                type="text"
                name="username"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder=" "
                disabled={loading}
                className={inputClass}
              />
              <label className={labelClass}>Username</label>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder=" "
                disabled={loading}
                className={`${inputClass} pr-20`}
              />
              <label className={labelClass}>Password</label>

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-600 hover:text-gray-900"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md bg-gradient-blue text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? "Logging in..."
                : isAdminLogin
                ? "Login as Admin"
                : "Login"}
            </button>
          </form>

          {/* Signup link only for normal users: admins are created in the database */}
          {!isAdminLogin && (
            <div className="mt-6 text-center">
              <p className="text-white text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-primary-blue font-bold hover:text-primary-blue transition"
                >
                  Signup
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}