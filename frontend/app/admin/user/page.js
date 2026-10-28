"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import api from "@/app/lib/axios";

import toast from "react-hot-toast";

import {
  FaSearch,
  FaTrash,
  FaUserShield,
  FaUser,
} from "react-icons/fa";

import { MdEdit } from "react-icons/md";
import Searchbar from "@/app/components/admin/Searchbar";

export default function Page() {

  const [users, setUsers] = useState([]);
const [
  filteredUsers,

  setFilteredUsers

] = useState([]);
  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");
const [showDeleteModal,
  setShowDeleteModal] =
  useState(false);

const [selectedUserId,
  setSelectedUserId] =
  useState(null);
  // FETCH USERS

  const getAllUsersData = async () => {

    try {

      const response =
        await api.get(
          "/api/admin/users"
        );
console.log("users ::" ,response.data.users)
     const allUsers =
  Array.isArray(response.data)
    ? response.data
    : [];

setUsers(allUsers);

setFilteredUsers(
  allUsers
);
    } catch (error) {

      console.log(error);

      toast.error(
        "Failed to fetch users"
      );

      setUsers([]);

    } finally {

      setLoading(false);

    }
  };

  // DELETE USER

  const deleteUser = async (id) => {

    try {

      // const confirmDelete =
      //   window.confirm(
      //     "Delete this user?"
      //   );

      // if (!confirmDelete) return;

      await api.delete(
        `/api/admin/users/delete/${id}`
      );

      toast.success(
        "User deleted"
      );

      setUsers((prev) =>
        prev.filter(
          (user) => user._id !== id
        )
      );
  
  setFilteredUsers((prev) =>
  prev.filter(
    (user) => user._id !== id
  )
);

    } catch (error) {

      console.log(error);

      toast.error(
        "Delete failed"
      );

    }
  };

  useEffect(() => {

    getAllUsersData();

  }, []);

  // SEARCH FILTER

 const handleFilter = () => {

  const filtered =
    users.filter((user) => {

      return (

        user.username
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        user.email
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        user.phone
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )

      );

    });

  setFilteredUsers(filtered);

};

const handleReset = () => {

  setSearch("");

  setFilteredUsers(users);

};

  return (

    <div className="min-h-screen">

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-4">

        <div>

          <h1 className="text-2xl font-bold text-[#0f172a]">

            Users Data

          </h1>

          {/* <p className="text-gray-500 mt-1">

            Manage all registered users

          </p> */}

        </div>

        {/* SEARCH */}

      </div>

<Searchbar

  search={search}

  setSearch={setSearch}

  placeholder="Search by username, email"

  onFilter={handleFilter}

  onReset={handleReset}

/>
      {/* TABLE */}

      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">

        {/* TABLE HEADER */}

        <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-4 bg-gray-100 border-b border-gray-100 text-sm font-semibold text-gray-600">

          <div>User</div>

          <div>Email</div>

          <div>Phone</div>

          <div>Role</div>

          <div>Edit</div>

          <div>Delete</div>

        </div>

        {/* USERS */}

        {loading ? (

          <div className="p-10 text-center text-gray-500">

            Loading users...

          </div>

        ) : filteredUsers.length === 0 ? (

          <div className="p-10 text-center text-gray-500">

            No users found

          </div>

        ) : (

          filteredUsers.map((user) => (

            <div
              key={user._id}
              className="grid grid-cols-1 md:grid-cols-6 gap-4 px-6 py-5 border-b border-gray-100 hover:bg-gray-50 transition"
            >

              {/* USER */}

              <div className="flex items-center gap-3">
{/* 
                <div className="w-11 h-11 rounded-full bg-gradient-blue-red text-white flex items-center justify-center font-bold shadow-sm">

                  {user?.username
                    ?.charAt(0)
                    .toUpperCase()}

                </div> */}

                <div>

                  <h3 className="font-semibold text-[#0f172a] break-all">

                    {user.username}

                  </h3>

                  {/* <p className="text-xs text-gray-500">

                    ID:
                    {" "}
                    {user._id.slice(0, 8)}

                  </p> */}

                </div>
              </div>

              {/* EMAIL */}

              <div className="flex items-center text-gray-700 text-sm break-all">

                {user.email}

              </div>

              {/* PHONE */}

              <div className="flex items-center text-gray-700 text-sm">

                {user.phone}

              </div>

              {/* ROLE */}

              <div className="flex items-center">

                {user.isAdmin ? (

                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">

                    <FaUserShield size={14} />

                    Admin

                  </span>

                ) : (

                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">

                    <FaUser size={14} />

                    Customer

                  </span>

                )}

              </div>

              {/* EDIT */}

              <div className="flex items-center">

                <Link
                  href={`/admin/user/${user._id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition text-sm font-medium"
                >

                  <MdEdit size={16} />

                  Edit

                </Link>

              </div>

              {/* DELETE */}

              <div className="flex items-center">

                <button
                 onClick={() => {

  setSelectedUserId(
    user._id
  );

  setShowDeleteModal(
    true
  );

}}
                  disabled={user.isAdmin}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                    user.isAdmin

                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"

                      : "bg-red-100 text-red-600 hover:bg-red-200"
                  }`}
                >

                  <FaTrash size={16} />

                  Delete

                </button>

              </div>

            </div>

          ))
        )}

      </div>
{showDeleteModal && (

      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

        <div className="bg-white p-6 rounded-xl w-[400px] shadow-lg">

          <h2 className="text-lg font-semibold">

            Delete User

          </h2>

          <p className="mt-2 text-gray-500">

            Are you sure you want to delete this user?

          </p>

          <div className="flex justify-end gap-3 mt-6">

            <button
              onClick={() =>
                setShowDeleteModal(false)
              }
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={() => {

                deleteUser(
                  selectedUserId
                );

                setShowDeleteModal(
                  false
                );

              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Delete
            </button>

          </div>

        </div>

      </div>

    )}
    </div>

    
  );
}