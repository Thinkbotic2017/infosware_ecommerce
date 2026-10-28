"use client";


import OrderDetails from "@/app/components/Profile/OrderDetails";
import { Suspense } from "react";


export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderDetails />
    </Suspense>
  );
}