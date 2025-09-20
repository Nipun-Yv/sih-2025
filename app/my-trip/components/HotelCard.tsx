import { Hotel } from "@/types/Hotel";
import { Star } from "lucide-react";
import Link from "next/link";

export const HotelCard = ({ hotel }: { hotel: Hotel }) => (

  <div className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-xl border border-orange-100 mx-4 overflow-hidden transform transition-all hover:scale-[1.02] hover:shadow-2xl">
    <Link href={`/my-trip`}>
    <div className="h-48 relative overflow-hidden">
      {hotel.hotel_image_urls && (
        <img
          src={hotel.hotel_image_urls.split(';')[0]}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute bottom-3 right-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
        ₹{hotel.price.toLocaleString()}/night
      </div>
    </div>
    

    <div className="p-5">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg text-gray-900 truncate mr-2">{hotel.name}</h3>
        <div className="flex items-center bg-amber-50 px-2 py-1 rounded-full">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-amber-700 font-bold ml-1">{hotel.user_rating}</span>
        </div>
      </div>
      
      {/* Star Rating */}
      <div className="flex mt-2">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < hotel.star_rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
      
      {/* Amenities Pill */}
      {hotel.amenities_list && (
        <div className="mt-3 flex flex-wrap gap-1">
          {hotel.amenities_list.split(';').slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full"
            >
              {amenity.trim()}
            </span>
          ))}
        </div>
      )}
    </div>
    </Link>
  </div>
);
