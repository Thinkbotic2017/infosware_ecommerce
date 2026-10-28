"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import api from "@/app/lib/axios";

import FooterForm
from "@/app/components/admin/FooterForm";

export default function Page() {

  const { id } =
    useParams();

  const [footer,
  setFooter] =
    useState(null);

  useEffect(() => {

    const fetchFooter =
      async () => {

        try {

          const res =
            await api.get(
              "/api/admin/landingpage/footer"
            );

          setFooter(
            res.data.data
          );

        } catch (error) {

          console.log(error);

        }
      };

    fetchFooter();

  }, []);

  if (!footer)
    return null;

  return (

    <FooterForm
      mode="edit"
      initialData={footer}
      footerId={id}
    />

  );
}