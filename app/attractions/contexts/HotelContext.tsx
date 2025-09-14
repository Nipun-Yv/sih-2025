"use client";

import { Hotel } from "@/types/Hotel";
import React, { createContext, useContext, useState } from "react";

interface HotelContextType {
  hotels:Hotel[],
  setHotels:React.Dispatch<React.SetStateAction<Hotel[]>>
}

const HotelContext = createContext<HotelContextType|undefined>(undefined);

export const HotelProvider = ({ children }: { children: React.ReactNode }) => {
    const [hotels,setHotels]=useState<Hotel[]>([ ]);
  return (
    <HotelContext.Provider value={{ hotels,setHotels}}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotelContext = () => {
  const context = useContext(HotelContext);
  if (!context) throw new Error('useMyContext must be used within a MyContextProvider');
  return context;
};