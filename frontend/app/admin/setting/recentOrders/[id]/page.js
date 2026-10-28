"use client";

import RecentOrder from "@/app/components/admin/RecentOrder";
import { Suspense } from "react";


export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecentOrder />
    </Suspense>
  );
}