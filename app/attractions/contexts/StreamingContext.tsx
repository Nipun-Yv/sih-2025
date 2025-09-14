"use client"
import { ItineraryItem } from '@/types/Activity';
import { createContext, useContext, ReactNode, useState } from 'react';

type StreamingContextType = {
  itineraryItems:ItineraryItem[]
  setItineraryItems: React.Dispatch<React.SetStateAction<ItineraryItem[]>>
  isComplete:boolean
  setIsComplete:React.Dispatch<React.SetStateAction<boolean>>
};

const StreamingContext = createContext<StreamingContextType | undefined>(undefined);


export const StreamingContextProvider = ({ children }: { children: ReactNode }) => {
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  return (
    <StreamingContext.Provider value={{itineraryItems,setItineraryItems,isComplete,setIsComplete}}>
      {children}
    </StreamingContext.Provider>
  )
};

export const useStreamingContext = () => {
  const context = useContext(StreamingContext);
  if (!context) throw new Error('useMyContext must be used within a MyContextProvider');
  return context;
};