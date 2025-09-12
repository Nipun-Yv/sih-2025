"use client"
import React from 'react';

interface ProductCardProps {
  imageUrl: string;
  name: string;
  description: string;
  availableSizes: number[];
}

const AdditionalProductCard: React.FC<ProductCardProps> = ({
  imageUrl,
  name,
  description,
}) => {
  return (
    <div className='flex min-w-[350px] h-[25vh] max-h-[25vh] rounded-xl
     bg-white shadow-lg font-sans'>
      <div className='flex-1 h-full overflow-hidden'>
        <img 
          src={imageUrl} 
          alt={name} 
          className='h-[100%] overflow-hidden object-cover' 
          
        />
      </div>
      <div className='flex flex-1 flex-col items-center justify-between p-6 gap-y-1'>
        <div className='flex flex-col items-center justify-center gap-2'>
          <h2 className='text-xl font-bold text-gray-500 -m-2.5 mb-0'>
            {name.toUpperCase()}
          </h2>
          <p className='text-sm text-center leading-relaxed text-gray-400'>
            {description}
          </p>
        </div>
        <button className='py-2 px-3 w-[100%] text-red-500 font-extralight text-sm border-[0.25] 
         border-red-500  rounded-md cursor-pointer transition-colors duration-200 hover:bg-amber-500 hover:text-white'>
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default AdditionalProductCard;
