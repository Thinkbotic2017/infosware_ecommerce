"use client";

import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/lib/axios";
import { useEffect, useState }
from "react";
import { FaHeart } from "react-icons/fa";

export default function Page() {

const [notifications,
setNotifications] =
useState([]);

const [loading,
setLoading] =
useState(true);
const {user}= useAuth();
useEffect(() => {


const fetchNotifications =
  async () => {

    try {

      const res =
        await api.get(
          "/api/admin/cart-notifications"
        );

      setNotifications(
        res.data || []
      );

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

fetchNotifications();


}, []);

// FILTER OLD CART ITEMS

const filteredNotifications =
notifications
.map((cart) => {


    const oldItems =
      cart.items.filter(
        (item) =>

          new Date(
            item.addedAt
          ) <=

          new Date(
            Date.now() -
            1 * 60 * 1000

          )
      );

    if (oldItems.length === 0)
      return null;

    return {

      ...cart,

      oldItems,

    };

  })
  .filter(Boolean);


return (


<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

  {/* HEADER */}

  <div className="mb-6">

    <h2 className="text-2xl font-bold text-gray-800">

      Cart Notifications

    </h2>

    <p className="text-sm text-gray-500 mt-1">

      Users with products in cart
      for more than 3 days

      
    </p>

  </div>

  {/* LOADING */}

  {loading ? (

    <div className="text-gray-500">

      Loading...

    </div>

  ) : filteredNotifications.length === 0 ? (

    <div className="text-gray-500 text-sm">

      No notifications found.

    </div>

  ) : (

    <div className="space-y-5">

      {filteredNotifications.map(
        (cart) => {

          const email =
            cart.userId?.email || "";

          const phone =
            cart.userId?.phone || "";

          const subject =
            encodeURIComponent(
              "Cart Reminder"
            );

          const body = encodeURIComponent(
`🛍️ Hi,

We noticed that you left some items in your cart.

⏳ These products are still available, but stock is limited and prices may change at any time.

🚀 Complete your purchase now to secure your items.

🔗 Resume your order:
${window.location.origin}/cart

Need help? Our support team is always ready to assist you.

Thank you for shopping with Infosware ${<FaHeart/>}

Team Infosware`
);

const message = `
👋 Hi ,

🛒 Your cart is waiting!

⏳ The items you selected are still available.

🔥 Complete your order before stock runs out.

👉 Continue shopping:
${window.location.origin}/cart

❤️ Thank you for choosing Infosware

🚀 Team Infosware
`;

console.log(message);

const mailtoLink =
   `mailto:${email}?subject=${subject}&body=${body}`;


          const phoneNumberOnly =
            phone.replace(/\D/g, "");

          const whatsappLink =
  `https://api.whatsapp.com/send?phone=${phoneNumberOnly}&text=${encodeURIComponent(message)}`;
console.log(whatsappLink);
          return (

            <div
              key={cart._id}
              className="border border-gray-200 rounded-2xl p-5"
            >

              {/* USER DETAILS */}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">

                <div>

                  <p className="text-sm text-gray-500">

                    Email

                  </p>

                  {email ? (

                    <a
                      href={mailtoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary-blue hover:underline"
                    >

                      {email}

                    </a>

                  ) : (

                    <p className="text-gray-700">

                      N/A

                    </p>

                  )}

                </div>

                <div>

                  <p className="text-sm text-gray-500">

                    Mobile

                  </p>

                  {phone ? (

                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-green-600 hover:underline"
                    >

                      {phone}

                    </a>

                  ) : (

                    <p className="text-gray-700">

                      N/A

                    </p>

                  )}

                </div>

              </div>

              {/* PRODUCTS */}

              <div className="space-y-3">

                {cart.oldItems.map(
                  (item) => (

                    <div
                      key={item._id}
                      className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                    >

                      <div>

                        <h4 className="font-semibold text-gray-800">

                          {item.name}

                        </h4>

                        <p className="text-xs text-gray-500 mt-1">

                          Added on{" "}

                          {new Date(
                            item.addedAt
                          ).toLocaleDateString()}

                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          );

        }
      )}

    </div>

  )}

</div>


);
}
