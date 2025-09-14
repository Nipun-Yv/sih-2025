import { LucideArrowUpSquare, MoveIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";

const DraggableTextarea = ({setActiveTabs}:{setActiveTabs:(categories:string[])=>void}) => {
  const [pos, setPos] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [text, setText] = useState("");
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const draggableRef = useRef(null);

  const handleMouseDown = (e: any) => {
    // Don't drag if clicking inside the textarea
    if (e.target.tagName === "TEXTAREA") return;
    setIsDragging(true);
    setOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    });
  };

  const handleMouseMove = (e: any) => {
    if (!isDragging) return;
    setPos({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, offset]);

  const submitDescription=async()=>{
    try{
      const apiUrl=process.env.NEXT_PUBLIC_API_URL;
      const {data:{category_list}}=await axios.post(`${apiUrl}/get-recommendations`,{description:text})
      setActiveTabs(category_list.map((element:{category_type:string})=>(element.category_type.toLowerCase())))
    }
    catch(error:any){
      console.log(error.message)
      setText("Unable to process your query at the moment")
    }
  }
  return (
    <div
      ref={draggableRef}
      className="absolute w-80 bg-white border-2 border-orange-200 rounded-xl shadow-xl shadow-gray-400 cursor-move select-none border-b-0 z-10"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        cursor: isDragging ? "grabbing" : "move",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Optional Drag Handle */}
      <div
        className="flex flex-col items-end px-2 py-2 bg-orange-100 border-b-2 border-orange-200 rounded-t-xl font-medium text-orange-800 text-xs"
      >
        <MoveIcon className="w-4 h-4 text-orange-400 mr-2" />
        Describe how you want your trip to me, I'll find some activities!
      </div>
      <textarea
        className="w-full h-32 p-4 border-none focus:outline-none resize-none text-gray-800 text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your budget, what categories you wish to explore..."
      />
      <Button className="w-full p-6 bg-orange-200 text-amber-700 border-amber-700 border-b-1 hover:bg-orange-300 cursor-pointer shadow-md rounded-t-none"
      onClick={submitDescription}>
        Submit Trip Details
      </Button>
    </div>
  );
};

export default DraggableTextarea;

