"use client";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/Product";

export default function ProductListing() {
  const router=useRouter()
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [productList, setProductList] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_NANO_NODE_API_URL}/products/fetch-products`
        );
        const data = response.data;
        setProductList(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);
  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-8xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent mb-4">
            Traditional Art Collection
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Discover authentic handcrafted masterpieces from skilled artisans
            across India
          </p>
        </div>

        {loading ? (
          <div className="mt-16 flex items-center justify-center">
            <button
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 px-8 rounded-2xl
           hover:from-orange-600 hover:to-amber-600 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl flex"
            >
              <Loader2 className="animate-spin" /> &nbsp; Loading Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {productList?.map((product) => (
              <div
                key={product.id}
                className="group relative hover:cursor-pointer"
                onMouseEnter={() => setHoveredCard(product.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`
                relative bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-3xl
                ${
                  hoveredCard === product.id
                    ? "ring-2 ring-orange-300 ring-opacity-50"
                    : ""
                }
              `}
                >
                  <div className="absolute top-0 left-0 z-20">
                    {product.customisable?
                    <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-sm text-xs font-bold tracking-wide shadow-lg"> 
                    Customisable </span>
                      :null}
                  </div>

                  <div className="absolute top-4 right-4 z-20">
                    <button className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg hover:bg-orange-50 transition-colors duration-300">
                      <svg
                        className="w-5 h-5 text-orange-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="aspect-square bg-gradient-to-br from-red-400 via-orange-400 to-yellow-400 p-1 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center text-white text-6xl font-bold shadow-inner">
                      <img
                        src={product.img_url}
                        className="object-cover h-full rounded-t-xl"
                      />
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                      {product.title}
                    </h3>

                    <div className="flex items-center mb-3">
                      <span className="text-green-600 text-sm font-medium flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verified Seller
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      <div>Sold by {product.seller}</div>
                      <div>{product.location}</div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{product.price/100}
                        </span>
                        {/* <span className="text-lg text-gray-500 line-through">
                          ${product.originalPrice}
                        </span> */}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button onClick={()=>{router.push(`product/${product.id}`)}} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 px-4 rounded-md hover:from-orange-600 hover:to-amber-600 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl">
                        Purchase Now
                      </button>
{/* 
                      <button className="w-full border-2 border-orange-300 text-orange-600 font-semibold py-3 px-4 rounded-xl hover:bg-orange-50 hover:border-orange-400 transition-all duration-300">
                        Customisable
                      </button> */}
                    </div>
                  </div>

                  <div
                    className={`
                  absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl
                `}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 bg-gradient-to-r from-orange-100 to-amber-100 rounded-3xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Discover Authentic Indian Folk Art
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Each piece in our collection represents centuries of cultural
            heritage, handcrafted by skilled artisans who preserve traditional
            techniques passed down through generations.
          </p>
        </div>
      </div>
    </div>
  );
}
