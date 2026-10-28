"use client";

import React,
{
useEffect,
useRef,
useState
} from "react";

import {

FaWhatsapp,

FaFacebook,

FaInstagram,

FaShareAlt

} from "react-icons/fa";

import {
FaXTwitter
} from "react-icons/fa6";

const ShareButton = ({
product
}) => {

const [show,
setShow] =
useState(false);

const [url,
setUrl] =
useState("");

const popupRef =
useRef(null);

// SET PRODUCT URL

useEffect(() => {


if (
  typeof window !==
  "undefined"
) {

  setUrl(


`${window.location.origin}/products/${product?._id}`

);

}


}, [product]);

// CLOSE POPUP ON OUTSIDE CLICK

useEffect(() => {


const handleClickOutside =
  (event) => {

    if (

      popupRef.current &&

      !popupRef.current.contains(
        event.target
      )

    ) {

      setShow(false);

    }

  };

document.addEventListener(

  "mousedown",

  handleClickOutside

);

return () => {

  document.removeEventListener(

    "mousedown",

    handleClickOutside

  );

};


}, []);

// SHARE TEXT

const text =
encodeURIComponent(

`Check out this product: ${product?.title || product?.name}`

);

return (

<div
  ref={popupRef}
  className="relative"
>

  {/* SHARE BUTTON */}

  <button

    onClick={() =>
      setShow(!show)
    }

    className="
      flex
      items-center
      justify-center
    "
  >

    <FaShareAlt
      className="
        cursor-pointer
        text-lg
      "
    />

  </button>

  {/* POPUP */}

  {show && (

    <div
      onClick={(e) => {

    e.stopPropagation();

  }}
      className="
        absolute
        top-10
        right-0
        bg-white
        border
        border-gray-200
        rounded-2xl
        shadow-xl
        p-3
        flex
        items-center
        gap-3
        z-50
        animate-in
        fade-in
        zoom-in-95
        duration-200
      "
    >

      {/* WHATSAPP */}

      <a

        href={`https://wa.me/?text=${text}%20${encodeURIComponent(url)}`}

        target="_blank"

        rel="noopener noreferrer"

        title="Share on WhatsApp"

        className="
          hover:scale-110
          transition
        "
      >

        <FaWhatsapp
          color="#25D366"
          size={24}
        />

      </a>

      {/* FACEBOOK */}

      <a

        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}

        target="_blank"

        rel="noopener noreferrer"

        title="Share on Facebook"

        className="
          hover:scale-110
          transition
        "
      >

        <FaFacebook
          color="#1877F3"
          size={24}
        />

      </a>

      {/* INSTAGRAM */}

      <a

        href="https://www.instagram.com/"

        target="_blank"

        rel="noopener noreferrer"

        title="Instagram"

        className="
          hover:scale-110
          transition
        "
      >

        <FaInstagram
          color="#E4405F"
          size={24}
        />

      </a>

      {/* TWITTER/X */}

      <a

        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`}

        target="_blank"

        rel="noopener noreferrer"

        title="Share on X"

        className="
          hover:scale-110
          transition
        "
      >

        <FaXTwitter
          color="#000"
          size={24}
        />

      </a>

    </div>

  )}

</div>


);

};

export default ShareButton;
