"use client";

import TripCalendar from "./components/TripCalendar";
import { useEffect, useState } from "react";
import { Activity } from "@/types/Activity";
import axios from "axios";
import { redirect, useRouter } from "next/navigation";
import {
  CalendarDays,
} from "lucide-react";
import RouteMap from "./components/RouteMap";
import { StreamingContextProvider } from "../contexts/StreamingContext";
import { HotelCarousel } from "./components/HotelCarousel";
import { HotelProvider, useHotelContext } from "../contexts/HotelContext";
import { useAutoScroll } from "./hooks/useAutoScroll";
import ItineraryLoadingBar from "./components/ItineraryLoadingBar";
import ActivityNameList from "./components/ActivityNameList";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import useStreaming from "./hooks/useStreaming";
const ItineraryPage = () => {
  const searchParams = useSearchParams();
  const router=useRouter()
  const date = searchParams.get("date"); 
  const {
    // isComplete,
    events,
    // itineraryItems,
    // error,
    connectionStatus,
    // startStreaming,
    // stopStreaming,
  } = useStreaming();
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const { hotels } = useHotelContext();
  const carouselRef = useAutoScroll(hotels);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [locationName, setLocationName] = useState<string | null>(null);

  useEffect(() => {
    async function getActivities() {
      try {
        // const { data: user } = await axios.get("/api/user");
        // if (!user) {
        //   redirect("/auth");
        // }

        const springApiBaseUrl = process.env.NEXT_PUBLIC_SPRING_API_URL;
        const response = await axios.get(
          `${springApiBaseUrl}/activities?userId=sample`
        );

        const fetchedActivities = response.data.data;
        setSelectedActivities(fetchedActivities);

        if (fetchedActivities.length > 0) {
        //   const locationRes = await axios.get(
        //     `/api/location-from-activity?activityId=${fetchedActivities[0].id}`
        //   );
          setLocationName("Jharkhand");
        }
      } catch (err: any) {
        console.log(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    getActivities();
  }, []);

  const storeItinerary=async()=>{
    try{
      console.log("Why")
      await axios.post(`${process.env.NEXT_PUBLIC_NANO_NODE_API_URL}/explore/finalize-itinerary/sample`,{
        activities:events
      })
      console.log("What")
      router.push("/my-trip")
    }
    catch(err){
      console.log(err)
    }
  }
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  return (

      <div className="w-full h-screen bg-gray-50">
        <div className="h-full p-6">
          <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4">
            <div className="max-w-7xl mx-auto">

              <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 mb-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <CalendarDays className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Trip Calendar
                      </h1>
                      <p className="text-orange-600">
                        View your travel itinerary
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className=" bg-amber-500 p-3 px-4 shadow-lg  font-light text-white rounded-md" disabled={! (connectionStatus==="completed") } onClick={()=>storeItinerary()}>
                      Finalise Trip
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="gap-4 mb-6 h-[210px] flex">
                <ItineraryLoadingBar count={selectedActivities.length} />
                <ActivityNameList
                  locationName={locationName}
                  selectedActivities={selectedActivities}
                />
              </div>
              <div className="flex w-full gap-2">
                <TripCalendar events={events} connectionStatus={connectionStatus} />
                <RouteMap />
              </div>
              <div ref={carouselRef}>
                <HotelCarousel hotels={hotels} />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ItineraryPage;
