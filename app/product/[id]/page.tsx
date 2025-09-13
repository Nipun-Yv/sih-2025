
import axios from "axios";
import AdditionalProductCard from "../components/AdditionalProduct";
import Playground from "../components/Playground";
import ProductCard from "../components/ProductCard";
import ProductList from "../components/ProductList";
import { Product } from "@/types/Product";

export default async function ProductPage({params}:{params:{id:number}}) {
  const id=(await params).id
  const {data:productDetails}=await axios.get(`${process.env.NEXT_PUBLIC_NANO_NODE_API_URL}/products/product-details/${id}`)
  console.log(productDetails)
  return (
    <div className="h-[100vh] w-full bg-gray-100 p-3">
      <div className="flex h-full -gap-1">
        <div className="flex-[1.5] h-min gap-5 flex flex-col p-3 max-w-[60%]">
          <ProductCard productDetails={productDetails}/>
          <ProductList/>
          <div>
          </div>
        </div>
        <div className="flex-1 p-3">
          <Playground displayUrl={productDetails.img_url}/>
        </div>
      </div>
    </div>
  );
}

