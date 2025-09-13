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

const Playground = ({displayUrl}:{displayUrl:string}) => {
    const [selectedFiles,setSelectedFiles]=useState<File[]>([])
    const [prompt,setPrompt]=useState<string>("")
    const [loader,setLoader]=useState<boolean>(false)
    const [centerDisplayUrl,setCenterDisplayUrl]=useState<string>(displayUrl)
    const submitRequest=async()=>{
       const response = await fetch(centerDisplayUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch the image from ${centerDisplayUrl}`);
        }
        const imageBlob = await response.blob();
        const formData = new FormData();
        formData.append("images", imageBlob, "center_display_image.png");
        selectedFiles.forEach((file, idx) => {
            formData.append("images", file);
        });
        formData.set("prompt",prompt)
        try {
            setLoader(true)
            const response = await axios.post(`${process.env.NEXT_PUBLIC_NANO_NODE_API_URL}/image-gen/redesign`, 

            formData,{ responseType: 'arraybuffer'}
            );
            const imageBlob = new Blob([response.data], { type: response.headers['content-type'] });
            const imageUrl = URL.createObjectURL(imageBlob);
            setCenterDisplayUrl(imageUrl)
        }
        catch(err:any){
            console.error("Unable to render image",err.message)
        }
        finally{
            setLoader(false)
        }
    }
  return (
    <div className="bg-white h-full w-full shadow-xl rounded-md flex flex-col">
        <div className="basis-[75%] flex max-h-[75%]">
            <ImagePrompting loader={loader} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles}
            prompt={prompt} setPrompt={setPrompt} centerDisplayUrl={centerDisplayUrl}/>
        </div>
        <div className="flex-[0.6] flex pl-5">
            <ColorPalette colors={hexes}/>
            <div className="flex-[2] p-3 flex flex-col gap-5">
                <p className="text-gray-500 text-xs font-thin">Please note, the template generated would only serve as a reference for the artisan for the purposes
                    of design, it is not guaranteed that the final product will match the  image
                </p>
                <Button variant={"outline"} className="flex-1 border-amber-500 font-thin hover:cursor-pointer"
                onClick={submitRequest} disabled={loader}>
                    Generate Ideas
                </Button>
            </div>

        </div>
    </div>
  )
}

export default Playground