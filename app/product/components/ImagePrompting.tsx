
import ImageList from "./ImageList"

const ImagePrompting = ({selectedFiles,setSelectedFiles,prompt,setPrompt,centerDisplayUrl,loader}:{selectedFiles:File[],
    setSelectedFiles:React.Dispatch<React.SetStateAction<File[]>>,
    prompt:string,setPrompt:React.Dispatch<React.SetStateAction<string>>,
    centerDisplayUrl:string, loader:boolean}) => {
  return (
    <>
    <div className="flex-[1.8] p-5 flex flex-col gap-3 pb-2">
        {loader?
        <div className="max-h-[55vh] aspect-square w-full flex items-center justify-center border-1" > 
            <img src="https://assets-v2.lottiefiles.com/a/53b80118-1161-11ee-b538-4f02e47c3050/fdOrUHkGeL.gif" className="w-[10vh] h-[10vh] animate-spin opacity-60"/>
        </div>:
        <img src={centerDisplayUrl||"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfdkstspqR0mFhMgNqOPwGyFnapT77Q0QUVw&s"}
        className="max-h-[55vh] aspect-square w-full"/>}
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