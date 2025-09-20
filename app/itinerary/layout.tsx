
import { HotelProvider } from "../contexts/HotelContext";
import { MapProvider } from "../contexts/MapContext";
import { StreamingContextProvider } from "../contexts/StreamingContext";


export default function ItineraryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <HotelProvider>
    <StreamingContextProvider>
        {children}
    </StreamingContextProvider>
    </HotelProvider>
        
  );
}
