import { Hotel } from "@/types/Hotel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HotelCard } from "./HotelCard";

export const HotelCarousel = ({ hotels }: { hotels: Hotel[] }) => {
  if (!hotels.length) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-transparent bg-clip-text">
            Luxury Stays
          </span>
          <span className="mx-2">•</span>
          <span>Curated For You</span>
        </h2>
        <div className="flex space-x-2">
          <button className="p-2 rounded-full bg-white border border-orange-200 text-orange-500 hover:bg-orange-50">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full bg-white border border-orange-200 text-orange-500 hover:bg-orange-50">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-6 -mx-4 px-4">
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
    </div>
  );
};
