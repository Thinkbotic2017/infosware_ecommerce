'use client'
import { useEffect, useState } from "react";

import { useAuth } from "@/app/context/AuthContext";
import api, { BASE_URL } from "@/app/lib/axios";

const page = () => {
    const {user } = useAuth();
    const [products, setProducts] = useState([]);
    const [answerMap, setAnswerMap] = useState({});
    const [loading, setLoading] = useState(true);
const [submittingId, setSubmittingId] = useState(null);
 useEffect(() => {

    const fetchProducts = async () => {

        try {

            const res = await api.get(
                `/api/admin/productpage/pendingques`
            );

            console.log("admin ques", res.data.data);

            setProducts(res.data.data || []);

        } catch (err) {

            console.log(err);

            setProducts([]);

        } finally {

            setLoading(false);

        }
    };

    fetchProducts();

}, [user]);

    const handleAnswerChange = (qaId, value) => {
        setAnswerMap(prev => ({ ...prev, [qaId]: value }));
    };

    const handleAnswerSubmit = async (productId, qaId) => {
        const answer = answerMap[qaId];
        if (!answer) return;
        try {
            await api.put(
                `/api/admin/productpage/${productId}/question/${qaId}`,
                { answer }
            );
            // Remove the answered question from the UI
            setProducts(products =>
                products
                    .map(product =>
                        product._id === productId
                            ? {
                                ...product,
                                quesAns: product.quesAns.filter(qa => qa._id !== qaId),
                            }
                            : product
                    )
                    .filter(product => product.quesAns.length > 0)
            );
            setAnswerMap(prev => ({ ...prev, [qaId]: "" }));
        } catch (err) {
            alert("Failed to submit answer");
        }
    };

    if (loading) return <div>Loading Q&A...</div>;

   return (

<div className="space-y-8">

  {/* HEADER */}

  {/* <div className="flex items-center justify-between">

    <div>

      <h1 className="text-3xl font-bold text-[#0f172a]">

        Product Questions

      </h1>

      <p className="text-gray-500 mt-1">

        Answer customer product questions

      </p>

    </div>

    <div className="bg-yellow-100 text-yellow-700 px-5 py-3 rounded-2xl font-semibold">

      {products.length}
      {" "}
      Pending Products

    </div>

  </div> */}

  {/* LOADING */}

  {loading ? (

    <div className="bg-white rounded-md border border-gray-100 shadow-sm p-20 text-center">

      <h2 className="text-2xl font-bold text-[#0f172a]">

        Loading Q&A...

      </h2>

    </div>

  ) : products.length === 0 ? (

    <div className="bg-white rounded-md border border-gray-100 shadow-sm p-20 text-center">

      <h2 className="text-2xl font-bold text-[#0f172a]">

        No Questions Found

      </h2>

      <p className="text-gray-500 mt-2">

        All customer questions are answered

      </p>

    </div>

  ) : (

    <div className="space-y-6">

      {products.map((product) => (

        <div
          key={product._id}
          className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden"
        >

          {/* PRODUCT HEADER */}

          <div className="flex items-center gap-5 p-2  ">

            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0">

              <img
                src={`${BASE_URL}/${Array.isArray(product.img)
                  ? product.img[0]
                  : product.img}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />

            </div>

            <div className="flex-1">

              <h2 className="text-xl font-bold text-[#0f172a]">

                {product.name}

              </h2>

              <p className="text-gray-500 text-sm mt-1">

                {product.category}

              </p>

            </div>

            <div className="bg-red-100 text-red-600 px-4 py-2 rounded-md text-xs font-semibold">

              {product.quesAns.length}
            {" "}
              Questions

            </div>

          </div>

          {/* QUESTIONS */}

          <div className="p-4 space-y-5">

            {product.quesAns.map((qa) => (

              <div
                key={qa._id}
                className="border border-gray-100 rounded-2xl p-5 bg-gray-50"
              >

                {/* QUESTION */}

                <div className="mb-4">

                  <p className="text-sm font-semibold text-primary-blue mb-2">

                    Customer Question

                  </p>

                  <h3 className="text-[#0f172a] font-medium">

                    {qa.key}

                  </h3>

                </div>

                {/* ANSWER FORM */}

                <form
                  onSubmit={(e) => {

                    e.preventDefault();

                    handleAnswerSubmit(
                      product._id,
                      qa._id
                    );

                  }}
                  className="flex flex-col lg:flex-row gap-4"
                >

                  <input
                    type="text"
                    value={
                      answerMap[qa._id] || ""
                    }
                    onChange={(e) =>
                      handleAnswerChange(
                        qa._id,
                        e.target.value
                      )
                    }
                    placeholder="Type your answer..."
                    required
                    className="flex-1 border border-gray-200 rounded-md px-5 py-3 outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition bg-white"
                  />

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-md bg-gradient-blue-red text-white font-semibold hover:opacity-90 transition shrink-0"
                  >

                    Submit Answer

                  </button>

                </form>

              </div>

            ))}

          </div>

        </div>

      ))}

    </div>

  )}

</div>

)
};

export default page;

