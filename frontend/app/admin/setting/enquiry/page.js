"use client"
import { useAuth } from '@/app/context/AuthContext';
import api from '@/app/lib/axios';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const page = () => {
  const { user} = useAuth();
  const [inquiries, setInquiries] = useState([]);

  const fetchInquiries = async () => {
    try {
      const res = await api.get(`api/admin/inquiry`);
      setInquiries(res.data);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      toast.error('Failed to fetch inquiries');
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      try {
        await api.delete(`api/admin/inquiry/${id}`);
        setInquiries((prev) => prev.filter((inq) => inq._id !== id));
        toast.success('Inquiry deleted successfully');
      } catch (error) {
        console.error('Error deleting inquiry:', error);
        toast.error('Failed to delete inquiry');
      }
    }
  };

  // Type color helper
  const getTypeStyle = (inq) => {
    if (inq.isBulkOrder) {
      return { color: '#CC2423', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' };
    }
    if (inq.isCustomization) {
      return { color: '#1787C6', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' };
    }
  }

  return (

<div className="space-y-8">

  {/* HEADER */}

 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

    <div>

      <h1 className="text-3xl font-bold text-[#0f172a]">

        Product Inquiries

      </h1>

      <p className="text-gray-500 mt-1">

        Manage customer product inquiries and requests

      </p>

    </div>

  <div className="bg-primary-blue/10 text-primary-blue px-5 py-3 rounded-2xl font-semibold self-start sm:self-auto">

      {inquiries.length}
      {" "}
      Total Inquiries

    </div>

  </div>

  {/* EMPTY STATE */}

  {inquiries.length === 0 ? (

    <div className="bg-white rounded-md border border-gray-100 shadow-sm p-20 text-center">

      <h2 className="text-2xl font-bold text-[#0f172a]">

        No Inquiries Found

      </h2>

      <p className="text-gray-500 mt-2">

        Customer inquiries will appear here

      </p>

    </div>

  ) : (

<div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-x-auto">


      {/* TABLE HEADER */}      

<div className="hidden md:grid grid-cols-12 gap-4 px-6 py-5 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">

        <div>Inquiry</div>

        <div>Name</div>

        <div className="col-span-2">

          Contact

        </div>

        <div>Qty</div>

        <div className="col-span-2">

          Description

        </div>

        <div className='col-span-2'>Type</div>

        <div className="col-span-2">

          Date

        </div>

        <div className="text-center">
          Action

        </div>

      </div>

      {/* TABLE BODY */}

      {inquiries.map((inq) => (

        <div
          key={inq._id}
        className="
grid
grid-cols-1
md:grid-cols-12
gap-4
px-4
sm:px-6
py-5
border-b
border-gray-100
hover:bg-gray-50
transition
items-start
"
        >

          {/* ENQUIRY NUMBER */}

          <div className="md:col-span-1">

            <div className="bg-gray-100 text-[#0f172a] px-3 py-2 rounded-md text-xs font-semibold inline-block">

              {inq.enquiryNumber}

            </div>

          </div>

          {/* NAME */}

          <div className="md:col-span-1">

            <h3 className="font-semibold text-[#0f172a]">

              {inq.name}

            </h3>

          </div>

          {/* CONTACT */}

         <div className="md:col-span-2 space-y-2">

            <div>

              <p className="text-xs text-gray-500">

                Email

              </p>

              <p className="text-sm text-[#0f172a] break-all max-w-full">

                {inq.email}

              </p>

            </div>

            <div>

              <p className="text-xs text-gray-500">

                Mobile

              </p>

              <p className="text-sm text-[#0f172a]">

                {inq.mobile}

              </p>

            </div>

          </div>

          {/* QUANTITY */}

          <div className="md:col-span-1">

            <div className="   text-primary-blue  text-sm font-semibold inline-block">

              {inq.quantity}

            </div>

          </div>

          {/* DESCRIPTION */}

    <div className="md:col-span-2">

            <p className="text-sm text-gray-600 line-clamp-3">

              {inq.description || "-"}

            </p>

          </div>

          {/* TYPE */}

          <div className="md:col-span-2">

            {inq.isBulkOrder ? (

              <span className=" text-red-600 text-xs font-semibold">

                Bulk Order

              </span>

            ) : inq.isCustomization ? (

              <span className="text-primary-blue text-xs font-semibold  ">

                Customization

              </span>

            ) : (

              <span className="bg-green-100 text-green-600 px-3 py-2 rounded-full text-xs font-semibold">

                Normal

              </span>

            )}

          </div>

          {/* DATE */}

<div className="md:col-span-2">

            <p className="text-sm text-[#0f172a]">

              {new Date(
                inq.submittedAt
              ).toLocaleDateString()}

            </p>

            <p className="text-xs text-gray-500 mt-1">

              {new Date(
                inq.submittedAt
              ).toLocaleTimeString()}

            </p>

          </div>

          {/* ACTION */}

          <div className="flex justify-start md:justify-center">
            <button
              onClick={() =>
                handleDelete(inq._id)
              }
              className="px-4 py-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition text-sm font-semibold"
            >
              Delete
            </button>

          </div>

        </div>

      ))}

    </div>

  )}

</div>

)
};

export default page;
