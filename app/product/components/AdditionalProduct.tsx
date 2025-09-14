"use client"
import { useRouter } from 'next/navigation';
import React, { useReducer } from 'react';

interface ProductCardProps {
  img_url: string;
  title: string;
  description: string;
  id:number
}

const AdditionalProductCard: React.FC<ProductCardProps> = ({
  img_url,
  title,
  description,
  id
}) => {
  const router=useRouter()
  return (
    <div className='flex min-w-[350px] h-[25vh] max-h-[25vh] rounded-xl bg-white shadow-xl font-sans'>
      <div className='flex-1 h-full overflow-hidden'>
        <img 
          src={img_url} 
          alt={title} 
          className='h-[100%] overflow-hidden object-cover rounded-l-xl' 
          
        />
      </div>
      <div className='flex flex-1 flex-col items-center justify-between p-6 gap-y-1'>
        <div className='flex flex-col items-center justify-center gap-2'>
          <h2 className='text-xl  text-center font-bold text-gray-500 -m-2.5 mb-[-10px] pl-2'>
            {title}
          </h2>
          <p className='text-sm leading-relaxed text-gray-400'>
            {description}
          </p>
        </div>
        <button onClick={()=>router.push(`/product/${id}`)} className='py-2 px-3 w-[100%] text-red-500 font-extralight text-sm border-[0.25] 
         border-red-500  rounded-md cursor-pointer transition-colors duration-200 hover:bg-amber-500 hover:text-white'>
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default AdditionalProductCard;
