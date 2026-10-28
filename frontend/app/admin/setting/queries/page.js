"use client";

import React,
{
  useEffect,
  useState
}
  from "react";

import api
  from "@/app/lib/axios";

import {

  FaEnvelope,

  FaPhoneAlt,

  FaUser,

  FaCheckCircle,

  FaClock,

}
  from "react-icons/fa";
import Pagination from "@/app/components/Pagination";


export default function AdminQueriesPage() {

  const [queries,
    setQueries] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);
const [page,
    setPage] =
    useState(1);

const [totalPages,
setTotalPages] =
useState(1);
const [openQuery, setOpenQuery] = useState(null);
  // FETCH QUERIES

  const fetchQueries =
    async () => {

      try {

        const res =
          await api.get(
            `api/user/contact?page=${page}&limit=4`
          );
        console.log(" contact queries", res.data);
        console.log(
          "queries",
          res.data
        );

        setQueries(
          res.data.data || []
        );
setTotalPages(res.data.totalPages);
      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    fetchQueries();

  }, [page]);

  // UPDATE STATUS

  const handleStatusChange =
    async (id, status) => {

      try {

        await api.put(

          `/api/user/contact/status/${id}`,

          { status }
        );

        // UPDATE UI

        setQueries(

          queries.map(
            (item) =>

              item._id === id

                ? {

                  ...item,

                  status,
                }

                : item
          )
        );

      } catch (error) {

        console.log(error);
      }
    };

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center text-xl font-bold">

        Loading Queries...

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#f8fafc] p-3 sm:p-6 lg:p-0">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0f172a]">

          Customer Queries

        </h1>

        <p className="text-gray-500 mt-2">

          Manage customer support requests

        </p>

      </div>

      {/* EMPTY */}

      {queries.length === 0 ? (

        <div className="bg-white rounded-md shadow-sm border border-gray-100 p-10 text-center">

          <h2 className="text-2xl font-bold text-gray-700">

            No Queries Found

          </h2>

        </div>

      ) : (

        <div className="grid gap-4">

         {queries.map((item) => (

  <div
    key={item._id}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
  >

    {/* HEADER */}

    <button
      onClick={() =>

        setOpenQuery(
          openQuery === item._id
            ? null
            : item._id
        )
      }

      className="
        w-full
        flex
        items-center
        justify-between
        p-5
        text-left
      "
    >

      <div>

        <h2 className="font-bold text-lg text-[#0f172a]">

          {item.name}

        </h2>

        <p className="text-sm text-gray-500">

          {new Date(
            item.createdAt
          ).toLocaleDateString()}

        </p>

      </div>

      <div
        className={`

          px-4
          py-2
          rounded-full
          text-xs
          font-bold

          ${
            item.status === "RESOLVED"

              ? "bg-green-100 text-green-600"

              : "bg-red-100 text-primary-red"
          }

        `}
      >

        {item.status}

      </div>

    </button>

    {/* DETAILS */}

    {openQuery === item._id && (

      <div className="border-t border-gray-100 p-5">

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-5">

  {/* CONTACT DETAILS */}

  <div className="flex-1">

    <div className="flex items-center gap-3 mb-3">

      <FaEnvelope className="text-primary-blue" />

      <span className="break-all">
        {item.email}
      </span>

    </div>

    <div className="flex items-center gap-3">

      <FaPhoneAlt className="text-primary-red" />

      <span>
        {item.phone}
      </span>

    </div>

  </div>

  {/* STATUS UPDATE */}

  <div className="w-full md:w-[220px]">

    <label className="block text-sm font-semibold text-gray-600 mb-2">
      Update Status
    </label>

    <select
      value={item.status}
      onChange={(e) =>
        handleStatusChange(
          item._id,
          e.target.value
        )
      }
      className="
        w-full
        px-4
        py-3
        rounded-xl
        border
        border-gray-200
        bg-white
      "
    >

      <option value="PENDING">
        Pending
      </option>

      <option value="RESOLVED">
        Resolved
      </option>

    </select>

  </div>

</div>
        {/* DESCRIPTION */}

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">

          <h3 className="font-semibold mb-2">

            Query Description

          </h3>

          <p className="text-gray-600">

            {item.description}

          </p>

        </div>

        {/* STATUS UPDATE */}

        {/* <div className="mt-4">

          <select
            value={item.status}
            onChange={(e) =>
              handleStatusChange(
                item._id,
                e.target.value
              )
            }
            className="
              w-full
              px-4
              py-3
              rounded-xl
              border
              border-gray-200
            "
          >

            <option value="PENDING">
              Pending
            </option>

            <option value="RESOLVED">
              Resolved
            </option>

          </select>

        </div> */}

      </div>

    )}

  </div>

))}

        </div>
      )}
  <div className="flex justify-center mt-6">
  <Pagination
    currentPage={page}
    totalPages={totalPages}
    onPageChange={setPage}
  />
</div>
    </div>
  );
}