import { Textarea } from "@/components/ui/textarea"
import ImageList from "./ImageList"
import { Input } from "@/components/ui/input"
import ColorPalette from "./ColorPalette";
import { Button } from "@/components/ui/button";
const hexes = [
  '#FFE5B4', // light peach
  '#FFD0A3', // creamsicle
  '#FEC89A', // pastel orange
  '#FFB77C', // soft apricot
  '#FAB27F', // mellow mango
  '#F4A261', // dusty tangerine
  '#E9A06F', // muted butterscotch
  '#D8A66F', // warm buff
  '#CFA47A', // sandy tan
  '#D9B48F', // beige-orange
  '#EDC9AF', // desert sand
  '#FAD6A5', // light butterscotch
  '#FFE0C7', // linen peach
  '#FFF0DA', // pale creamsicle
  '#FFF7E6'  // near-white apricot
];

const Playground = () => {
  return (
    <div className="bg-white h-full w-full shadow-xl rounded-md flex flex-col">
        <div className="basis-[75%] flex max-h-[75%]">
            <div className="flex-[1.8] p-5 flex flex-col gap-3 pb-2">
                <img src="https://dnn24.com/wp-content/uploads/2025/02/Kohbar-Painting-.jpg" 
                className="max-h-[55vh] aspect-square w-full"/>
                <div className="flex-1">
                <textarea
                placeholder="Enter your customisation instructions here..."
                className="w-full h-full resize-none text-gray-600 p-2 leading-tight
                text-xs border-3 rounded-lg"
                />
                </div>
            </div>
            <div className="flex-1">
                <ImageList/>
            </div>
        </div>
        <div className="flex-[0.6] flex pl-5">
            <ColorPalette colors={hexes}/>
            <div className="flex-[2] p-3 flex flex-col gap-5">
                <p className="text-gray-500 text-xs font-thin">Please note, the template generated would only serve as a reference for the artisan for the purposes
                    of design, it is not guaranteed that the final product will match the  image </p>
                <Button variant={"outline"} className="flex-1 border-amber-500 font-thin">
                    Generate Ideas
                </Button>
            </div>

        </div>
    </div>
  )
}

export default Playground