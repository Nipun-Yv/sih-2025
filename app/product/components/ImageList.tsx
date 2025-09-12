"use client"

import { InputEvent, useRef, useState } from "react";
import { FaPlus } from "react-icons/fa6"
import ImagePreview from "./ImagePreview";
const ImageList = ({selectedFiles,setSelectedFiles}:{selectedFiles:File[],
    setSelectedFiles:React.Dispatch<React.SetStateAction<File[]>>}) => {
        
    const inputRef=useRef<HTMLInputElement | null>(null)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files); 
    setSelectedFiles((prev) => [
        ...prev,
        ...files.filter(
        (file) => !prev.some((f) => f.name === file.name && f.size === file.size)
        ),
    ]);
};
    const handleRemoveFile = (index:number) => {
        setSelectedFiles((selectedFiles) => selectedFiles.filter((_, i) => i !== index));
    };
    const handlePlusClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  return (
    <div className="h-full w-full p-3 flex flex-col gap-3 overflow-scroll border-1 rounded-bl-md items-center
    bg-amber-500 shadow-md">
        {selectedFiles.map((file,index)=>{
          return (
            <div className="aspect-square w-[90%] border-2 rounded-md shadow-lg relative"
            key={file.name}>
                <ImagePreview file={file} />
                <button
                onClick={() => handleRemoveFile(index)}
                className="absolute -top-2 -right-2 bg-white text-amber-600 border-0 
                w-[20px] h-[20px] cursor-pointer flex items-center justify-center rounded-full pb-1"
                >
                    ×
                </button>
            </div>)
        })
        }
        <div className="aspect-square w-[90%] border-2 border-amber-400 rounded-md flex  flex-col items-center justify-center shadow-lg"
            onClick={handlePlusClick}>
            <FaPlus size={30} className="text-white font-light"/>
            <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm"
                hidden
                ref={inputRef}
                placeholder="Hello"
            />
        </div>
    </div>
  )
}

export default ImageList