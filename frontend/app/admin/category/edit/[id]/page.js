"use client";

import { useEffect,
useState } from "react";

import { useParams }
from "next/navigation";

import api
from "@/app/lib/axios";

import CategoryForm
from "@/app/components/admin/CategoryForm";

export default function Page() {

  const { id } =
    useParams();

  const [category,
    setCategory] =
    useState(null);

  useEffect(() => {

    const fetchCategory =
      async () => {

        try {

          const response =
            await api.get(
              `/api/admin/landingpage/category/${id}`
            );

          setCategory(
            response.data
          );

        } catch (error) {

          console.log(error);

        }
      };

    fetchCategory();

  }, [id]);

  if (!category) {

    return (
      <div>
        Loading...
      </div>
    );
  }

  return (

    <CategoryForm

      mode="edit"

      initialData={category}

    />

  );
}