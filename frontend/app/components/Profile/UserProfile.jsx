"use client";

import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/lib/axios";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaEnvelope, FaPhone, FaUser } from "react-icons/fa";

// removes leading spaces while typing
const trimStart = (e) => {
  e.target.value = e.target.value.replace(/^\s+/, "");
};

function UserProfile() {
  const { user, setUser, refreshUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // PREFILL USER DATA
  useEffect(() => {
    if (user) {
      reset({
        username: user.username || "",
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        phone: user.phone?.replace("+91", "") || "",
        gender: user.gender || "",
      });
    }
  }, [user, reset]);

  // SUBMIT
  const onSubmit = async (data) => {
    try {
      const userId = user?._id || user?.id;
      if (!userId) {
        toast.error("Session not ready, please refresh the page");
        return;
      }

      const updatedData = {
        ...data,
        phone: data.phone.startsWith("+91") ? data.phone : `+91${data.phone}`,
      };

      const response = await api.put(`api/auth/update/${userId}`, updatedData);

      // Merge the server's user into the current one, never replace it
      const serverUser =
        response.data?.user ||
        response.data?.updatedUser ||
        response.data?.userData;

      if (serverUser && serverUser.username) {
        setUser((prev) => ({ ...prev, ...serverUser }));
      } else {
        setUser((prev) => ({ ...prev, ...updatedData }));
        await refreshUser();
      }

      toast.success("User updated successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error updating user");
    }
  };

  const Field = ({ label, name, icon: Icon, type = "text", placeholder, rules, onInput }) => (
    <div>
      <label className="profileLabel">{label}</label>
      <div className="profileInputWrapper">
        <Icon className="profileIcon" />
        <input
          type={type}
          className="profileInput"
          placeholder={placeholder}
          onInput={onInput || trimStart}
          {...register(name, rules)}
        />
      </div>
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-primary-red">Personal Information</h3>
            <p className="text-gray-500 text-sm mt-1">Update your profile details here.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-6">
              {Field({
                label: "Username",
                name: "username",
                icon: FaUser,
                placeholder: "Username",
                rules: {
                  required: "Username is required",
                  pattern: {
                    value: /^[A-Za-z0-9_]+$/,
                    message: "Only letters, numbers and underscore allowed",
                  },
                  minLength: { value: 3, message: "Minimum 3 characters" },
                },
              })}

              {Field({
                label: "First Name",
                name: "firstname",
                icon: FaUser,
                placeholder: "First Name",
                rules: {
                  required: "First name is required",
                  pattern: { value: /^[A-Za-z ]+$/, message: "Only letters allowed" },
                  minLength: { value: 2, message: "Minimum 2 characters" },
                },
              })}

              {Field({
                label: "Last Name",
                name: "lastname",
                icon: FaUser,
                placeholder: "Last Name",
                rules: {
                  required: "Last name is required",
                  pattern: { value: /^[A-Za-z ]+$/, message: "Only letters allowed" },
                },
              })}

              {Field({
                label: "Email Address",
                name: "email",
                icon: FaEnvelope,
                type: "email",
                placeholder: "Email",
                rules: {
                  required: "Email is required",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                },
              })}

              {Field({
                label: "Phone Number",
                name: "phone",
                icon: FaPhone,
                placeholder: "Phone Number",
                onInput: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                },
                rules: {
                  required: "Phone number is required",
                  pattern: { value: /^[0-9]{10}$/, message: "Phone must be 10 digits" },
                },
              })}
            </div>

            {/* GENDER */}
            <div className="mt-6">
              <label className="profileLabel">Gender</label>
              <div className="flex flex-wrap gap-4 mt-3">
                {["Male", "Female", "Other"].map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 cursor-pointer border border-gray-200 rounded-xl px-5 py-3 hover:border-primary-blue transition"
                  >
                    <input
                      type="radio"
                      value={item}
                      {...register("gender", { required: "Please select gender" })}
                      className="accent-primary-blue"
                    />
                    <span className="text-sm font-medium">{item}</span>
                  </label>
                ))}
              </div>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-2">{errors.gender.message}</p>
              )}
            </div>

            {/* BUTTON */}
            <div className="mt-10 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-blue-red text-white rounded-2xl font-bold shadow-md hover:shadow-xl hover:scale-[1.02] transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;