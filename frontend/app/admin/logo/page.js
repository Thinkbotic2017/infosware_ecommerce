
"use client";

import {

  useEffect,

  useState

} from "react";

import Link from "next/link";

import Image from "next/image";

import api, {

  BASE_URL

} from "@/app/lib/axios";

import toast from "react-hot-toast";

import {

  FaPlus,

  FaEdit,

  FaTrash

} from "react-icons/fa";

export default function Page() {

  const [logo, setLogo] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // FETCH LOGO


const fetchLogo =
  async () => {

    try {

      const response =
        await api.get(
          "/api/admin/navbar"
        );

      // GET ONLY LOGO

      const logoData =

        response.data.Navbars.find(

          (item) =>

            item.label ===
            "LOGO"
        );

      setLogo(
        logoData || null
      );

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };



  // DELETE LOGO

  const handleDelete =
    async (id) => {

      try {

        await api.delete(

          `/api/admin/navbar/${id}/logo`
        );

        toast.success(
          "Logo deleted"
        );

        setLogo(null);

      } catch (error) {

        console.log(error);

        toast.error(
          "Delete failed"
        );
      }
    };

  useEffect(() => {

    fetchLogo();

  }, []);

  if (loading) {

    return (

      <div className="p-10">

        Loading...

      </div>
    );
  }

  return (

    <div className="max-w-4xl mx-auto">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-3xl font-bold text-[#0f172a]">

            Website Logo

          </h1>

        </div>

        {!logo && (

          <Link
            href="/admin/logo/add"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-blue-red text-white font-semibold"
          >

            <FaPlus />

            Add Logo

          </Link>
        )}

      </div>

      {/* NO LOGO */}

      {!logo ? (

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-20 text-center">

          <h2 className="text-2xl font-bold text-[#0f172a]">

            No Logo Added

          </h2>

        </div>

      ) : (

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          {/* IMAGE */}

          <div className="relative h-[200px] bg-gray-50">



<Image
  src={`${BASE_URL}/uploads/${logo.logo}`}
  alt="Logo"
  fill
  unoptimized
  className="object-contain"
/>





          </div>

          {/* INFO */}

          <div className="p-8">

            <h2 className="text-2xl font-bold text-[#0f172a]">

              {logo.label}

            </h2>

            <p className="text-gray-500 mt-2">

              Redirect:
              {logo.path}

            </p>

            {/* ACTIONS */}

            <div className="flex gap-4 mt-8">

              <Link
                href={`/admin/logo/edit/${logo._id}`}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-100 text-blue-700 font-semibold"
              >

                <FaEdit />

                Edit

              </Link>

              <button
                onClick={() =>
                  handleDelete(
                    logo._id
                  )
                }
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-100 text-red-600 font-semibold"
              >

                <FaTrash />

                Delete

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

