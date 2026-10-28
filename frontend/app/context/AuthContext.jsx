"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const AuthContext = createContext();

// Make sure the user object always has an `_id`, whatever name the server used
const normalizeUser = (u) =>
  u ? { ...u, _id: u._id || u.id || u.userId } : u;

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Safe setter: always normalizes, and supports both setUser(obj) and setUser(prev => ...)
  const setUser = (value) =>
    setUserState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      return normalizeUser(next);
    });

  const extractUser = (data) => data?.userData || data?.user || data;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/api/auth/user");
        setUser(extractUser(response.data));
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error("Error fetching user data:", error);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Reload the logged-in user from the server (use after login or profile update)
  const refreshUser = async () => {
    try {
      const response = await api.get("/api/auth/user");
      setUser(extractUser(response.data));
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
      setUser(null);
      toast.success("Logout successful");
      router.push("/signin");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  // Ready-made flag so pages don't repeat the check
  const isAdmin = !!(user?.isAdmin || user?.role === "admin");

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, logout, isAdmin, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);