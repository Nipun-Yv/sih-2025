
import ImageList from "./ImageList"

const ImagePrompting = ({selectedFiles,setSelectedFiles,prompt,setPrompt}:{selectedFiles:File[],
    setSelectedFiles:React.Dispatch<React.SetStateAction<File[]>>,
    prompt:string,setPrompt:React.Dispatch<React.SetStateAction<string>>}) => {
  return (
    <>
    <div className="flex-[1.8] p-5 flex flex-col gap-3 pb-2">
        <img src="https://dnn24.com/wp-content/uploads/2025/02/Kohbar-Painting-.jpg" 
        className="max-h-[55vh] aspect-square w-full"/>
        <div className="flex-1">
            <textarea
            placeholder="Enter your customisation instructions here..."
            className="w-full h-full resize-none text-gray-600 p-2 leading-tight
            text-xs border-3 rounded-lg"
            value={prompt}
            onChange={(e)=>setPrompt(e.currentTarget.value)}
            />
        </div>
    </div>
    <div className="flex-1">
        <ImageList selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles}/>
    </div>
    </>
  )
}

export default ImagePrompting