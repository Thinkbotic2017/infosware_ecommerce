"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/app/lib/axios";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaPlus, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { MdWarningAmber } from "react-icons/md";

// ─── Sub-components ──────────────────────────────────────────────────────────
function InfoTile({ icon, label, children }) {
  return (
    <div className="bg-[#f8fafc] rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-xl text-primary-blue">{icon}</span>
        <div className="min-w-0">
          <p className="text-sm text-gray-500">{label}</p>
          <div className="mt-0.5 font-semibold text-[#0f172a] break-words">{children}</div>
        </div>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
      <div className="h-7 w-56 rounded bg-gray-100" />
      <div className="h-4 w-full max-w-xl rounded bg-gray-100" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="h-20 rounded-2xl bg-gray-100" />
        <div className="h-20 rounded-2xl bg-gray-100" />
      </div>
      <div className="h-24 rounded-2xl bg-gray-100" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function FooterPage() {
  const [footer, setFooter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // FETCH
  const fetchFooter = async () => {
    try {
      const res = await api.get("/api/admin/landingpage/footer");
      setFooter(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooter();
  }, []);

  // DELETE
  const handleDelete = async () => {
    if (!footer?._id) return;
    setDeleting(true);
    try {
      await api.delete(`/api/admin/landingpage/footer/${footer._id}`);
      toast.success("Footer deleted");
      setFooter(null);
      setConfirmOpen(false);
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a]">Footer Management</h1>
          <p className="text-gray-500 mt-2">Manage footer details dynamically</p>
        </div>

        {!loading && !footer && (
          <Link
            href="/admin/footer/add"
            className="bg-gradient-blue-red text-white px-6 py-3 rounded-xl flex items-center gap-3 font-semibold hover:opacity-90 transition"
          >
            <FaPlus />
            Add Footer
          </Link>
        )}
      </div>

      {/* CONTENT */}
      {loading ? (
        <PageSkeleton />
      ) : footer ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          {/* TOP */}
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-[#0f172a]">Company Footer</h2>
              <p className="text-gray-500 mt-3 max-w-2xl leading-7">
                {footer.companyDescription || "No description added."}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/footer/edit/${footer._id}`}
                className="bg-primary-blue text-white px-4 md:px-5 py-3 rounded-xl flex items-center gap-2 font-medium hover:opacity-90 transition"
              >
                <FaEdit />
                Edit
              </Link>

              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="bg-red-100 text-red-600 px-4 py-3 md:px-5 rounded-xl flex items-center gap-2 font-medium hover:bg-red-200 transition"
              >
                <FaTrash />
                Delete
              </button>
            </div>
          </div>

          {/* CONTACT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <InfoTile icon={<FaPhone />} label="Phone">
              {footer.phone || "—"}
            </InfoTile>
            <InfoTile icon={<IoMail />} label="Email">
              <span className="wrap-anywhere">{footer.email || "—"}</span>
            </InfoTile>
          </div>

          {/* ADDRESS */}
          <div className="mt-6">
            <InfoTile icon={<FaMapMarkerAlt />} label="Address">
              <span className="font-medium leading-7 whitespace-pre-line">
                {footer.address || "—"}
              </span>
            </InfoTile>
          </div>

          {/* QUICK LINKS */}
          <div className="mt-10">
            <h3 className="text-xl font-bold text-[#0f172a] mb-5">Quick Links</h3>
            {footer.quickLinks?.length ? (
              <div className="flex flex-wrap gap-3">
                {footer.quickLinks.map((item, i) => (
                  <div
                    key={i}
                    className="bg-primary-blue/10 text-primary-blue px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No quick links added.</p>
            )}
          </div>

          {/* SOCIALS */}
          <div className="mt-10">
            <h3 className="text-xl font-bold text-[#0f172a] mb-5">Social Links</h3>
            {footer.socials?.length ? (
              <div className="flex flex-wrap gap-3">
                {footer.socials.map((item, i) => (
                  <div
                    key={i}
                    className="bg-red-100 text-primary-red px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {item.platform}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No social links added.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-20 text-center">
          <h2 className="text-2xl font-bold text-[#0f172a]">No Footer Found</h2>
          <p className="text-gray-500 mt-3">Create footer content for website</p>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <MdWarningAmber size={24} />
              </span>
              <div>
                <h3 id="delete-title" className="text-lg font-bold text-[#0f172a]">
                  Delete footer?
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  The footer will be removed from your website. This can't be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-60"
              >
                {deleting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                {deleting ? "Deleting..." : "Delete footer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}