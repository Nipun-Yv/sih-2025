import { useStreamingContext } from "../../contexts/StreamingContext";
import { CalendarDays, Check, Loader2Icon } from "lucide-react";
import React from "react";

const ItineraryLoadingBar = ({count}:{count:number}) => {
    const {isComplete}=useStreamingContext();
  return (
    <div className="bg-white rounded-xl p-6 border border-orange-100 shadow-lg hover:shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-transform w-[70%]">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-r from-orange-100 via-orange-200 to-orange-100 transition-opacity"></div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-orange-700">
          Your Itinerary Dashboard
        </h3>
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-orange-600" />
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-orange-600 font-medium mb-1">
          Number of Activities Selected
        </p>
        <p className="text-3xl font-bold text-gray-900">
          {count}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Each itinerary is curated to ensure a seamless travel experience.
        </p>
      </div>
      <div className="h-px bg-orange-100 my-4"></div>
      {!isComplete ? (
        <div className="mt-2 flex flex-col space-y-2">
          <div className="flex items-center space-x-2 animate-pulse">
            <Loader2Icon className="w-4 h-4 text-green-600 animate-spin -mt-3" />
            <span className="text-xs text-green-600 font-medium -mt-3">
              Crafting Your Perfect Journey
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-600 -mt-3" />
            <span className="text-xs text-green-600 font-medium -mt-3">
              Itinerary Complete!
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-1">
            <span className="text-xs text-gray-400 font-medium">
              All set for adventure!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryLoadingBar;
