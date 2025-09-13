"use client"
import { useEffect, useState } from "react";
import AdditionalProductCard from "./AdditionalProduct"
import { Product } from "@/types/Product";
import { useRouter } from "next/router";
import axios from "axios";
import { Loader2 } from "lucide-react";
  const product = {
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', // Placeholder image
    name: 'NIKE BLACK',
    description: 'Lorem ipsum dolor sit amet consectetur it repellendus neque!',
    availableSizes: [37, 48, 40, 42],
  };

const ProductList = () => {
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
  
  if(loading){
    return (
          <div className="w-full h-[30vh] shadow-lg flex p-5 overflow-x-scroll gap-5
    rounded-md bg-white items-center border-amber-400 border-1 justify-center">
      <Loader2 className="animate-spin text-orange-400 text-2xl" size={40} color={'orange'}/>
    </div>
    )
  }
  return (
    <div className="w-full h-[30vh] shadow-lg flex p-5 overflow-x-scroll gap-5
    rounded-md bg-white items-center border-amber-400 border-1">
      {productList?productList.map((product)=>(<AdditionalProductCard {...product} key={product.id}/>)):<div></div>}
    </div>
  )
}

export default ProductList