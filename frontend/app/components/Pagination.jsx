"use client";

import React from "react";

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {

  const handlePageChange = (page) => {

    onPageChange(page);

    setTimeout(() => {

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    }, 100);
  };

  // GENERATE PAGE NUMBERS

  const getPageNumbers = () => {

    const pages = [];

    // ALWAYS SHOW FIRST PAGE

    pages.push(1);

    // LEFT DOTS

    if (currentPage > 2) {

      pages.push("...");

    }

    // MIDDLE PAGES

    for (
      let i = currentPage - 1;
      i <= currentPage + 1;
      i++
    ) {

      if (
        i > 1 &&
        i < totalPages
      ) {

        pages.push(i);

      }
    }

    // RIGHT DOTS

    if (
      currentPage < totalPages - 2
    ) {

      pages.push("...");

    }

    // LAST PAGE

    if (totalPages > 1) {

      pages.push(totalPages);

    }

    return [...new Set(pages)];
  };

  const pages =
    getPageNumbers();

  return (

    <div
      className="
        flex
        items-center
        justify-center
        gap-2
        mt-6
        mb-10
        flex-wrap
      "
    >

      {/* PREV */}

      <button
        disabled={currentPage === 1}
        onClick={() =>
          handlePageChange(
            currentPage - 1
          )
        }
        className="
          px-3
          sm:px-4
          py-2
          rounded-xl
          border
          border-gray-200
          bg-white
          shadow-sm
          text-sm
          font-medium
          disabled:opacity-40
          disabled:cursor-not-allowed
          hover:border-primary-blue
          transition
        "
      >

        Prev

      </button>

      {/* PAGE BUTTONS */}

      {pages.map((page, index) => (

        <React.Fragment key={index}>

          {page === "..." ? (

            <span
              className="
                px-2
                text-gray-400
                font-semibold
              "
            >

              ...

            </span>

          ) : (

            <button
              onClick={() =>
                handlePageChange(page)
              }
              className={`

                min-w-[40px]
                h-[40px]

                sm:min-w-[44px]
                sm:h-[44px]

                px-3
                rounded-xl
                text-sm
                font-semibold
                transition

                ${
                  currentPage === page

                    ? "bg-gradient-blue-red text-white shadow-md"

                    : `
                      bg-white
                      border
                      border-gray-200
                      text-gray-700
                      hover:border-primary-blue
                      hover:text-primary-blue
                    `
                }
              `}
            >

              {page}

            </button>

          )}

        </React.Fragment>

      ))}

      {/* NEXT */}

      <button
        disabled={
          currentPage === totalPages
        }
        onClick={() =>
          handlePageChange(
            currentPage + 1
          )
        }
        className="
          px-3
          sm:px-4
          py-2
          rounded-xl
          border
          border-gray-200
          bg-white
          shadow-sm
          text-sm
          font-medium
          disabled:opacity-40
          disabled:cursor-not-allowed
          hover:border-primary-blue
          transition
        "
      >

        Next

      </button>

    </div>
  );
}

export default Pagination;