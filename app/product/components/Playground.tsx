"use client"
import ColorPalette from "./ColorPalette";
import { Button } from "@/components/ui/button";
import ImagePrompting from "./ImagePrompting";
import { useState } from "react";
import axios from "axios";
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
    const [selectedFiles,setSelectedFiles]=useState<File[]>([])
    const [prompt,setPrompt]=useState<string>("")
    const submitRequest=async()=>{
        const formData = new FormData();
        selectedFiles.forEach((file, idx) => {
            formData.append("images", file);
        });
        formData.set("prompt",prompt)
        try {
            console.log(process.env.NANO_NODE_API_URL)
            const response = await axios.post(`${process.env.NEXT_PUBLIC_NANO_NODE_API_URL}/image-gen/redesign`, 
            formData
            );
            const data = response.data
        }
        catch(err){

        }
    }
  return (
    <div className="bg-white h-full w-full shadow-xl rounded-md flex flex-col">
        <div className="basis-[75%] flex max-h-[75%]">
            <ImagePrompting selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles}
            prompt={prompt} setPrompt={setPrompt}/>
        </div>
        <div className="flex-[0.6] flex pl-5">
            <ColorPalette colors={hexes}/>
            <div className="flex-[2] p-3 flex flex-col gap-5">
                <p className="text-gray-500 text-xs font-thin">Please note, the template generated would only serve as a reference for the artisan for the purposes
                    of design, it is not guaranteed that the final product will match the  image
                </p>
                <Button variant={"outline"} className="flex-1 border-amber-500 font-thin"
                onClick={submitRequest}>
                    Generate Ideas
                </Button>
            </div>

        </div>
    </div>
  )
}

export default Playground