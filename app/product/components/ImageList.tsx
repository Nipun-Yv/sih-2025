import { FaPlus } from "react-icons/fa6"


const ImageList = () => {
  return (
    <div className="h-full w-full p-3 flex flex-col gap-3 overflow-scroll border-1 rounded-bl-md items-center
    bg-amber-500">
        <div className="aspect-square w-[90%] border-2 rounded-md flex items-center justify-center shadow-lg">
            {/* <FaPlus size={40} className="text-gray-400"/> */}
            <img src="https://i.pinimg.com/474x/e7/b0/51/e7b051c4a63846ab832e54c700937230.jpg" 
            className="h-full w-full rounded-md opacity-[0.6]"/>
        </div>
        <div className="aspect-square w-[90%] border-2 rounded-md flex items-center justify-center shadow-lg">
            <FaPlus size={40} className="text-white"/>
        </div>
    </div>
  )
}

export default ImageList