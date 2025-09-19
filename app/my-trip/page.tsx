"use client";

import TripCalendar from "./components/TripCalendar";
import { useEffect, useState } from "react";
import { Activity, CalendarActivity } from "@/types/Activity";
import axios from "axios";
import { redirect, useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import RouteMap from "./components/RouteMap";
// import { StreamingContextProvider } from "../contexts/StreamingContext";
import { HotelCarousel } from "./components/HotelCarousel";
import { HotelProvider, useHotelContext } from "../contexts/HotelContext";
// import { useAutoScroll } from "./hooks/useAutoScroll";
// import ActivityNameList from "./components/ActivityNameList";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import ActivityCard from "./components/ActivityCard";
// import useStreaming from "./hooks/useStreaming";
const ItineraryPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = searchParams.get("date");
  const [selectedActivities,setSelectedActivities]=useState<(Activity&{attraction:string})[]>([])
  //   const {
  //     // isComplete,
  //     events,
  //     // itineraryItems,
  //     // error,
  //     connectionStatus,
  //     // startStreaming,
  //     // stopStreaming,
  //   } = useStreaming();
  const [calendarEvents, setCalendarEvents] = useState<CalendarActivity[]>([]);
  //   const { hotels } = useHotelContext();
  //   const carouselRef = useAutoScroll(hotels);
  console.log(selectedActivities,"yellow")
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [locationName, setLocationName] = useState<string | null>(null);

  useEffect(() => {
    async function getItinerary() {
      try {
        // const { data: user } = await axios.get("/api/user");
        // if (!user) {
        //   redirect("/auth");
        // }

        const nodeApiBaseUrl = process.env.NEXT_PUBLIC_NANO_NODE_API_URL;
        const response = await axios.get(
          `${nodeApiBaseUrl}/explore/my-itinerary/sample`
        );
        const unformattedCalendarEvents = response.data.calendar_events;
        setCalendarEvents(
          unformattedCalendarEvents.map((e:any) => ({
            ...e,
            start: new Date(e.start),
            end: new Date(e.end),
          }))
        );

      } catch (err: any) {
        console.log(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    getItinerary();
  }, []);


  useEffect(() => {
    async function getItinerary() {
      try {
        // const { data: user } = await axios.get("/api/user");
        // if (!user) {
        //   redirect("/auth");
        // }

        const nodeApiBaseUrl = process.env.NEXT_PUBLIC_NANO_NODE_API_URL;
        const response = await axios.get(
          `${nodeApiBaseUrl}/explore/my-activities/sample`
        );
        setSelectedActivities(response.data.selectedActivities)
        console.log(selectedActivities)
      } catch (err: any) {
        console.log(err.message);
      } finally {
      }
    }

    getItinerary();
  }, []);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-grey-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-min bg-gray-50">
      <div className="h-full p-0">
        <div className="min-h-min bg-gradient-to-br from-grey-50 to-white p-3">
          <div className="max-w-7xl mx-auto flex flex-col gap-10 bg-[#fff8f1]">
            <div className="flex w-full gap-2">
              <TripCalendar events={calendarEvents} />
              <RouteMap itineraryItems={calendarEvents}/>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-1 flex-wrap ">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-[200px]
              ">
                {selectedActivities.map((activity) => {
                  return (
                    <ActivityCard
                    isSelected={false}
                      key={activity.id}
                      activity={activity}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryPage;
