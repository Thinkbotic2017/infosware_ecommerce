"use client";

import { FaSearch, FaTimes } from "react-icons/fa";
import { FaFilter } from "react-icons/fa6";
import { RiResetLeftLine } from "react-icons/ri";

export default function Searchbar({
  search,
  setSearch,
  placeholder = "Search...",
  showFilter = true,
  onFilter,
  onReset,
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-700 p-3 shadow-sm sm:p-4 lg:flex-row lg:items-center lg:justify-between">
      {/* SEARCH */}
      <div className="group flex w-full items-center gap-3 rounded-lg border border-slate-600 bg-slate-800 px-3.5 py-2.5 transition focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-400/15 lg:max-w-[650px]">
        <FaSearch
          size={14}
          className="shrink-0 text-slate-400 transition group-focus-within:text-sky-300"
        />

        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={placeholder}
          className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-400"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-slate-300 transition hover:bg-white/20 hover:text-white"
          >
            <FaTimes size={10} />
          </button>
        )}
      </div>

      {/* ACTIONS */}
      {showFilter && (
        <div className="flex items-center gap-3">
          {/* FILTER */}
          <button
            type="button"
            onClick={onFilter}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-blue-red px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 sm:flex-none"
          >
            <FaFilter size={12} />
            Filter
          </button>

          {/* RESET */}
          <button
            type="button"
            onClick={onReset}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-500 bg-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-600 sm:flex-none"
          >
            <RiResetLeftLine size={15} />
            Reset
          </button>
        </div>
      )}
    </div>
  );
}