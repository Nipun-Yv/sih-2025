import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import AdditionalProductCard from "./AdditionalProduct"
  const product = {
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', // Placeholder image
    name: 'NIKE BLACK',
    description: 'Lorem ipsum dolor sit amet consectetur it repellendus neque!',
    availableSizes: [37, 48, 40, 42],
  };

const ProductList = () => {
  return (
    <div className="w-full h-[30vh] shadow-lg flex p-5 overflow-x-scroll gap-5
    rounded-md bg-white items-center">
          {/* <AdditionalProductCard {...product}/>
          <AdditionalProductCard {...product}/>
          <AdditionalProductCard {...product}/> */}
    </div>
  )
}

export default ProductList