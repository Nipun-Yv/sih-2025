import { Button } from "@/components/ui/button"
import { FaCaretDown } from "react-icons/fa6"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Product } from "@/types/Product"


const ProductCard = ({productDetails}:{productDetails:Product}) => {
  return (
    <Card className="w-full h-[60vh] shadow-lg">
      <CardContent className="flex bg-white">
        <div className="flex-1 p-2 shadow-lg rounded-md flex items-center justify-center">
            <img src={productDetails.img_url}
            className="w-full aspect-square"/>
        </div>
        <div className="flex-1 px-10 flex-col flex gap-3 w-full rounded-md py-4 border-[0.5]
        border-l-0 rounded-l-none">
            <h2 className="font-bold text-xl text-gray-500">
                {productDetails.title}
            </h2>
            <p className="font-light text-gray-400 text-[14px]">
                {productDetails.description}
            </p>
            <div className="h-[15vh] w-full border-[0.5] rounded-md flex">
                <div className="flex-1 items-center justify-center flex flex-col p-5">
                    <p><sup>₹</sup> <span className="text-2xl">{productDetails.price/100}</span></p>
                    <p className="text-gray-400 text-xs text-center">Inclusive of all taxes, excluding delivery fees</p>
                </div>
                <div className="flex-1 shadow-xl 
                text-center rounded-md items-center justify-center text-xs flex p-3 flex-col">
                    <p className="text-green-600 font-bold flex"><FaCaretDown/> Verified Seller</p>
                    <p className="text-gray-500 font-extralight">Sold by <b>{productDetails.seller}</b></p>
                </div>
            </div>
            <Button className="p-6 bg-[#ff5040] ">
                Purchase Now
            </Button>
            <Button className="p-6 border-1 bg-transparent font-light border-amber-400 text-amber-500">
                Undo Customisation
            </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProductCard