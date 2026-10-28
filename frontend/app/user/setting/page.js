"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FaCamera,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
} from "react-icons/fa";
import { DiVim } from "react-icons/di";
import UserProfile from "@/app/components/Profile/UserProfile";

export default function Page() {
  return (
   <div>
    <UserProfile />
   </div>
  );
}