"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import api,
{
  BASE_URL
}
from "@/app/lib/axios";

import toast from "react-hot-toast";

import {
  FaImage,
} from "react-icons/fa";

export default function EditBannerPage() {

  const { id } =
    useParams();

  const router =
    useRouter();

  const [loading,
  setLoading] =
    useState(false);
const [categories, setCategories] =
  useState({});

const [subcategories, setSubcategories] =
  useState([]);

  const [preview,
  setPreview] =
    useState("");

  const [formData,
  setFormData] =
    useState({

      type: "main",

      title: "",

      subtitle: "",

      description: "",

      buttonText:
        "Shop Now",

      buttonLink:
        "/products",

      priceText: "",

       category: "",

    subcategory: "",

      img: null,

    });

useEffect(() => {

  const fetchCategories =
    async () => {

      try {

        const response =
          await api.get(
            "/api/comman/products"
          );

        const products =
          response.data.data || [];

        const categoryMap =
          {};

        products.forEach(
          (product) => {

            if (
              !categoryMap[
                product.category
              ]
            ) {

              categoryMap[
                product.category
              ] = [];

            }

            if (
              !categoryMap[
                product.category
              ].includes(
                product.subCategory
              )
            ) {

              categoryMap[
                product.category
              ].push(
                product.subCategory
              );

            }

          }
        );

        setCategories(
          categoryMap
        );

      } catch (error) {

        console.log(error);

      }

    };

  fetchCategories();

}, []);

  // FETCH BANNER

  useEffect(() => {

    const fetchBanner =
      async () => {

        try {

          const res =
            await api.get(
              "/api/admin/banner"
            );

          const banner =
            res.data.data.find(

              (item) =>
                item._id === id
            );

          if (!banner)
            return;

          setFormData({

            type:
              banner.type || "",

            title:
              banner.title || "",

            subtitle:
              banner.subtitle || "",

            description:
              banner.description || "",

            buttonText:
              banner.buttonText ||

              "Shop Now",

            buttonLink:
              banner.buttonLink ||

              "/products",

            priceText:
              banner.priceText || "",
              category:
  banner.category || "",

subcategory:
  banner.subcategory || "",

            img: null,

          });
          
          setPreview(

            `${BASE_URL}/uploads/${banner.img}`

          );

        } catch (error) {

          console.log(error);

        }
      };

    fetchBanner();

  }, [id]);

          useEffect(() => {

  if (
    formData.category &&
    categories[
      formData.category
    ]
  ) {

    setSubcategories(

      categories[
        formData.category
      ]

    );

  }

}, [
  categories,
  formData.category,
]);

  // HANDLE INPUT

  const handleChange =
    (e) => {

      const {
        name,
        value,
      } = e.target;

      setFormData({

        ...formData,

        [name]: value,

      });
    };

  // HANDLE IMAGE
 const handleImage =
    (e) => {

      const file =
        e.target.files[0];

      if (!file) return;

      // FILE SIZE

      const maxSize =
        2 * 1024 * 1024;

      if (
        file.size > maxSize
      ) {

        toast.error(
          "Image size must be under 2MB"
        );

        return;
      }

      // FILE TYPE

      const allowedTypes = [

        "image/jpeg",

        "image/jpg",

        "image/png",

        "image/webp",
      ];

      if (

        !allowedTypes.includes(
          file.type
        )

      ) {

        toast.error(
          "Only JPG, PNG and WEBP allowed"
        );

        return;
      }

      // IMAGE DIMENSION

      const image =
        new window.Image();

      const objectUrl =
        URL.createObjectURL(
          file
        );

      image.onload = () => {

        // MIN WIDTH



if (
  image.width < 500
) {

  toast.error(
    "Image width must be at least 500px"
  );

  return;
}

// MAX WIDTH

if (
  image.width > 800
) {

  toast.error(
    "Image width must not exceed 800px"
  );

  return;
}

// MIN HEIGHT

if (
  image.height < 500
) {

  toast.error(
    "Image height must be at least 500px"
  );

  return;
}

// MAX HEIGHT

if (
  image.height > 800
) {

  toast.error(
    "Image height must not exceed 800px"
  );

  return;
}


          
        

        setFormData({

          ...formData,

          img: file,
        });

        setPreview(
          objectUrl
        );
      };

      image.onerror = () => {

        toast.error(
          "Invalid image file"
        );
      };

      image.src =
        objectUrl;
    }


  // UPDATE

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        const data =
          new FormData();

        Object.keys(
          formData
        ).forEach((key) => {

          if (
            formData[key] !==
            null
          ) {

            data.append(

              key,

              formData[key]
            );
          }
        });

        await api.put(

          `/api/admin/banner/${id}`,

          data,

          {
            headers: {

              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        toast.success(
          "Banner updated successfully"
        );

        router.push(
          "/admin/banner"
        );

      } catch (error) {

        console.log(error);

        toast.error(
          "Update failed"
        );

      } finally {

        setLoading(false);

      }
    };

  return (

    <div className="p-6">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-[#0f172a]">

          Edit Banner

        </h1>

        <p className="text-gray-500 mt-2">

          Update banner details

        </p>

      </div>

      {/* FORM */}

      <form
        onSubmit={
          handleSubmit
        }
        className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8"
      >

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT */}

          <div className="space-y-6">

            {/* TYPE */}

            <div>

              <label className="text-sm font-medium text-gray-700">

                Banner Type

              </label>

              <select
                name="type"
                value={
                  formData.type
                }
                onChange={
                  handleChange
                }
                className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 outline-none"
              >

                <option value="main">

                  Main Banner

                </option>

                <option value="side1">

                  Side Banner 1

                </option>
                <option value="side2">

                  Side Banner 2

                </option>

 <option value="trbanner">

                  trbanner

                </option>
              </select>

            </div>

            {/* TITLE */}

            <div>

              <label className="text-sm font-medium text-gray-700">

                Title

              </label>

              <input
                type="text"
                name="title"
                value={
                  formData.title
                }
                onChange={
                  handleChange
                }
                className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 outline-none"
              />

            </div>

            {/* SUBTITLE */}

            <div>

              <label className="text-sm font-medium text-gray-700">

                Subtitle

              </label>

              <input
                type="text"
                name="subtitle"
                value={
                  formData.subtitle
                }
                onChange={
                  handleChange
                }
                className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 outline-none"
              />

            </div>

            {/* DESCRIPTION */}

            <div>

              <label className="text-sm font-medium text-gray-700">

                Description

              </label>

              <textarea
                rows={5}
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 outline-none resize-none"
              />

            </div>

          </div>

          {/* RIGHT */}

          <div className="space-y-6">

            {/* BUTTON TEXT */}

            <div>

              <label className="text-sm font-medium text-gray-700">

                Button Text

              </label>

              <input
                type="text"
                name="buttonText"
                value={
                  formData.buttonText
                }
                onChange={
                  handleChange
                }
                className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 outline-none"
              />

            </div>

            {/* BUTTON LINK */}

            <div>

              <label className="text-sm font-medium text-gray-700">

                Button Link

              </label>

              <input
                type="text"
                name="buttonLink"
                value={
                  formData.buttonLink
                }
                onChange={
                  handleChange
                }
                className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 outline-none"
              />

            </div>

            {/* PRICE */}

            <div>

              <label className="text-sm font-medium text-gray-700">

                Price Text

              </label>

              <input
                type="text"
                name="priceText"
                value={
                  formData.priceText
                }
                onChange={
                  handleChange
                }
                className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 outline-none"
              />

            </div>

<div>

  <label className="text-sm font-medium text-gray-700">
    Category
  </label>

  <select
    value={formData.category}
    onChange={(e) => {

      const category =
        e.target.value;

      setFormData({

        ...formData,

        category,

        subcategory: "",

      });

      setSubcategories(
        categories[
          category
        ] || []
      );

    }}
    className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-blue"
  >

    <option value="">
      Select Category
    </option>

    {Object.keys(categories)
      .map((cat) => (

        <option
          key={cat}
          value={cat}
        >
          {cat}
        </option>

      ))}

  </select>

</div>



<div>

  <label className="text-sm font-medium text-gray-700">
    Subcategory
  </label>

  <select
    name="subcategory"
    value={formData.subcategory}
    onChange={handleChange}
    className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-blue"
  >

    <option value="">
      Select Subcategory
    </option>

    {subcategories.map(
      (sub, index) => (

        <option
          key={`${sub}-${index}`}
          value={sub}
        >
          {sub}
        </option>

      )
    )}

  </select>

</div>
            {/* IMAGE */}

            <div>

              <label className="text-sm font-medium text-gray-700">

                Banner Image

              </label>

              <label className="mt-2 border-2 border-dashed border-gray-300 rounded-2xl h-[240px] flex flex-col items-center justify-center cursor-pointer overflow-hidden">

                {preview ? (

                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />

                ) : (

                  <div className="flex flex-col items-center">

                    <FaImage
                      size={40}
                      className="text-gray-400"
                    />

                    <p className="text-gray-500 mt-3">

                      Upload Banner

                    </p>

                  </div>

                )}

                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={
                    handleImage
                  }
                />

              </label>

            </div>

          </div>

        </div>

        {/* BUTTON */}

        <div className="mt-10 flex justify-end">

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-blue-red text-white px-8 py-3 rounded-xl font-semibold"
          >

            {loading

              ? "Updating..."

              : "Update Banner"}

          </button>

        </div>

      </form>

    </div>
  );
}