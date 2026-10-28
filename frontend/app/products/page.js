import { Suspense } from "react";
import ProductsPage from "../components/products/ProductPage";

function ProductsSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="h-[72px] border-b border-gray-200 bg-white" />
      <div className="flex">
        <div className="m-4 hidden h-[500px] w-[260px] animate-pulse rounded-xl bg-white lg:block" />
        <div className="mt-8 grid flex-1 grid-cols-2 gap-4 px-4 lg:grid-cols-3 lg:px-10 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsPage />
    </Suspense>
  );
}