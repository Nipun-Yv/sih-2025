import { Button } from "@/components/ui/button"
import { FaCaretDown } from "react-icons/fa6"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


const ProductCard = () => {
  return (
    <Card className="w-full h-[70vh] shadow-lg">
      {/* <CardHeader>
        <CardTitle>Traditional Warli Artform</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader> */}
      <CardContent className="flex">
        <div className="flex-1 p-2 shadow-lg rounded-md flex items-center justify-center">
            <img src="https://dnn24.com/wp-content/uploads/2025/02/Kohbar-Painting-.jpg" 
            className="w-full aspect-square"/>
        </div>
        <div className="flex-1 px-10 flex-col flex gap-3 w-full rounded-md py-4 border-[0.5]
        border-l-0 rounded-l-none">
            <h2 className="font-bold text-xl text-gray-500">
                Traditional Warli Artform
            </h2>
            <p className="font-light text-gray-400 text-[14px]">
                The Sriratna's Whiteboard is the perfect solution for people that are looking for dry erase marker boards for use at home.
                 However, these boards cannot be used for sticking notes, charts, etc.
            </p>
            <div className="h-[15vh] w-full border-[0.5] rounded-md flex">
                <div className="flex-1 items-center justify-center flex flex-col p-5">
                    <p><sup>$</sup> <span className="text-2xl">45.99</span></p>
                    <p className="text-gray-400 text-xs text-center">Inclusive of all taxes, excluding delivery fees</p>
                </div>
                <div className="flex-1 shadow-xl 
                text-center rounded-md items-center justify-center text-xs flex p-3 flex-col">
                    <p className="text-green-600 font-bold flex"><FaCaretDown/> Verified Seller</p>
                    <p className="text-gray-500 font-extralight">Sold by <b>Ramanujan Textiles, Jharkhand, 122001</b></p>
                </div>
            </div>
            <Button className="p-6 bg-[#ff5040] ">
                Purchase Now
            </Button>
            <Button className="p-6 border-1 bg-transparent text-gray-400 font-light">
                Undo Customisation
            </Button>
        </div>
      </CardContent>
      {/* <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Button variant="outline" className="w-full">
          Login with Google
        </Button>
      </CardFooter> */}
    </Card>
  )
}

export default ProductCard