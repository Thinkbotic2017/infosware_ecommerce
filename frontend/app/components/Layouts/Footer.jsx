"use client";

import {
  FaPhone,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTwitter,
} from "react-icons/fa";

import {
  IoIosMail,
} from "react-icons/io";

import {
  FaLinkedinIn,
} from "react-icons/fa6";

import Image from "next/image";

import {
  IoLocationSharp,
} from "react-icons/io5";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import api from "@/app/lib/axios";

function Footer() {

  const [footerData,
  setFooterData] =
    useState(null);

  const quickLinks = footerData?.quickLinks?.length
    ? footerData.quickLinks
    : [
        { label: "Home", link: "/" },
        { label: "Shop", link: "/products" },
        { label: "Contact", link: "/productInquiry" },
      ];
  const phone = "+91 9667661934";
  const email = "info@infosware.in";
  const address = "Sector 3, Noida, Uttar Pradesh - 201301";

  useEffect(() => {

    const fetchFooter =
      async () => {

        try {

          const response =
            await api.get(
              `/api/admin/landingpage/footer`
            );

          setFooterData(response.data.data);

        } catch (error) {

          console.log(error);

        }
      };

    fetchFooter();

  }, []);

  // SOCIAL ICONS

  const socialIcons = {

    facebook:
      <FaFacebookF />,

    instagram:
      <FaInstagram />,

    linkedin:
      <FaLinkedinIn />,

    twitter:
      <FaTwitter />,

  };

  return (

    <div className="shadow-2xl bg-white">

      {/* MAIN FOOTER */}

      <div className="px-6  lg:px-12 py-12 shadow-md">

        {/* GRID */}

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* LEFT */}

          <div className="lg:col-span-2 md:col-span-2">

            {/* LOGO */}

    <Link href="/">
    
           <div className="shrink-0">
      <Image
        src="/infosware-logo.png"
        alt="Infosware - Future Ready Solutions"
        width={260}
        height={88}
        className="w-[140px] sm:w-[170px] md:w-[190px] lg:w-[220px] h-auto object-contain mb-5"
      />
  </div>
    </Link>

            {/* DESCRIPTION */}

            <p className="mt-4 text-black max-w-md text-sm leading-relaxed">

              {
                "Infosware | Future Ready Solutions"
              }

            </p>

            <a
              href="https://maps.google.com/?q=Sector+3%2C+Noida%2C+Uttar+Pradesh+201301"
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-2 text-sm hover:text-primary-blue text-black transition mt-6 leading-6"
            >
              <IoLocationSharp
                className="text-primary-red mt-1"
                size={22}
              />
              <span>{address}</span>
            </a>

          </div>

          {/* QUICK LINKS */}

          <div>

            <h2 className="font-semibold text-lg text-primary-red mb-4">

              Quick Links

            </h2>

            <ul className="space-y-3 text-black text-sm">

              {quickLinks.map(
                (item, i) => (

                  <Link
                    href={item.link}
                    key={i}
                  >

                    <li className="hover:text-primary-blue cursor-pointer transition mb-3 ">

                      {item.label}

                    </li>

                  </Link>


                )
              )}

            </ul>

          </div>

          {/* CONTACT */}

          <div>

            <h2 className="font-semibold text-lg text-primary-red mb-4">

              Contact

            </h2>

            <div className="space-y-4 text-black text-sm">

              {/* PHONE */}

              <a
                href={`tel:${phone}`}
                className="flex items-center gap-2 hover:text-primary-blue transition"
              >

                <FaPhone
                  className="text-primary-blue"
                  size={20}
                />

                {
                  phone
                }

              </a>

              {/* EMAIL */}

              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 hover:text-primary-blue transition"
              >

                <IoIosMail
                  className="text-primary-blue"
                  size={20}
                />

                {
                  email
                }

              </a>

            </div>

            {/* SOCIALS */}

            <div className="flex gap-4 mt-6">

              {footerData?.socials?.map(
                (item, i) => (

                  <Link
                    href={item.link}
                    key={i}
                    target="_blank"
                  >

                    <div className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-primary-red hover:bg-gradient-blue-red hover:text-primary-blue transition cursor-pointer">

                      {
                        socialIcons[
                          item.platform?.toLowerCase()
                        ]
                      }

                    </div>

                  </Link>

                )
              )}

            </div>

          </div>

        </div>

      </div>

      {/* BOTTOM */}

      <div className="bg-gradient-blue-red text-white text-center py-4 text-sm">

        {`© ${new Date().getFullYear()} Infosware. All rights reserved.`}

      </div>

    </div>
  );
}

export default Footer;
