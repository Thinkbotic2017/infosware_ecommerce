
"use client";

import {

  useEffect,

  useState

} from "react";

import {

  useParams,

  useRouter

} from "next/navigation";

import api, {

  BASE_URL

} from "@/app/lib/axios";

import toast from "react-hot-toast";

import Image from "next/image";

import {

  FaSave,

  FaImage

} from "react-icons/fa";

export default function Page() {

  const { id } =
    useParams();

  const router =
    useRouter();

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [formData, setFormData] =
    useState({

      label: "LOGO",

      path: "/",
    });

  const [logo, setLogo] =
    useState(null);

  const [preview, setPreview] =
    useState("");

  // FETCH LOGO

  const fetchLogo =
    async () => {

      try {

        const response =
          await api.get(
            `/api/admin/navbar`
          );

        const logoData =

          response.data.Navbars.find(

            (item) =>

              item._id === id
          );

        if (!logoData) {

          toast.error(
            "Logo not found"
          );

          router.push(
            "/admin/logo"
          );

          return;
        }

        setFormData({

          label:
            logoData.label,

          path:
            logoData.path,
        });

   
setPreview(`${BASE_URL}/uploads/${logoData.logo}`);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);
      }
    };

  // IMAGE CHANGE

const handleImageChange = (e) => {

  const file =
    e.target.files[0];

  if (!file) return;

  // FILE SIZE

  const maxSize =
    1 * 1024 * 1024;

  if (
    file.size > maxSize
  ) {

    toast.error(
      "Image size must be under 1MB"
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

  const image =
    new window.Image();

  const objectUrl =
    URL.createObjectURL(
      file
    );

  image.onload = () => {

    // MIN WIDTH

    if (
      image.width < 150
    ) {

      toast.error(
        "Logo width must be at least 150px"
      );

      return;

    }

    // MAX WIDTH

    if (
      image.width > 800
    ) {

      toast.error(
        "Logo width must not exceed 800px"
      );

      return;

    }

    // MIN HEIGHT

    if (
      image.height < 40
    ) {

      toast.error(
        "Logo height must be at least 40px"
      );

      return;

    }

    // MAX HEIGHT

    if (
      image.height > 200
    ) {

      toast.error(
        "Logo height must not exceed 200px"
      );

      return;

    }

    setLogo(file);

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

};

  // INPUT CHANGE

  const handleChange =
    (e) => {

      setFormData({

        ...formData,

        [e.target.name]:
          e.target.value,
      });
    };

  // UPDATE LOGO

  const handleSubmit =
    async (e) => {

      e.preventDefault();
      if (
  !formData.path.trim()
) {

  toast.error(
    "Path is required"
  );

  return;

}

if (
  !formData.path.startsWith("/")
) {

  toast.error(
    "Path must start with /"
  );

  return;

}

      try {

        setUpdating(true);

        const data =
          new FormData();

        data.append(
          "label",
          formData.label
        );

        data.append(
          "path",
          formData.path
        );

        if (logo) {

          data.append(
            "img",
            logo
          );
        }

        await api.put(

`/api/admin/navbar/${id}/logo`,

          data,

          {

            headers: {

              "Content-Type":
"multipart/form-data",
            },
          }
        );

        toast.success(
          "Logo updated successfully"
        );

        router.push(
          "/admin/logo"
        );

      } catch (error) {

        console.log(error);

        toast.error(

error.response?.data?.msg ||

"Update failed"
        );

      } finally {

        setUpdating(false);
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

    <div className="max-w-3xl mx-auto">

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-[#0f172a]">

          Edit Logo

        </h1>

      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >

        <div className="p-8 space-y-7">

          {/* LABEL */}

          <div>

            <label className="text-sm font-semibold text-gray-700">

              Label

            </label>

            <input
              type="text"
              value={formData.label}
              disabled
              className="w-full mt-3 border border-gray-200 rounded-2xl px-5 py-4 bg-gray-100"
            />

          </div>

          {/* PATH */}

          <div>

            <label className="text-sm font-semibold text-gray-700">

              Redirect Path

            </label>

            <input
              type="text"
              name="path"
              value={formData.path}
              onChange={handleChange}
              className="w-full mt-3 border border-gray-200 rounded-2xl px-5 py-4 outline-none"
            />

          </div>

          {/* IMAGE */}

          <div>

            <label className="text-sm font-semibold text-gray-700">

              Logo Image

            </label>

            <div className="mt-4 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50 p-8 text-center">

              {preview ? (

                <div className="relative w-full h-[220px] rounded-2xl overflow-hidden">

                  <Image
                    src={preview}
                    alt="preview"
                    fill
                    unoptimized
                    className="object-contain"
                  />

                </div>

              ) : (

                <div>

                  <FaImage className="mx-auto text-5xl text-gray-400 mb-5" />

                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-6"
              />

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="border-t border-gray-100 p-6 flex justify-end">

          <button
            type="submit"
            disabled={updating}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-blue-red text-white font-semibold"
          >

            <FaSave />

            {updating
              ? "Updating..."
              : "Update Logo"}

          </button>

        </div>

      </form>

    </div>
  );
}

