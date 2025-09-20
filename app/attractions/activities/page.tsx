"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import DraggableTextarea from "../components/DraggableTextArea";
import ActivityCard from "../components/ActivityCard";
import ActivityMap from "../components/ActivityMap";
import { Activity } from "@/types/Activity";
import { Attraction } from "@/types/Attraction";
import { MapProvider } from "../../contexts/MapContext";

export default function ActivitiesPage({ params }: { params: any }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTabs, setActiveTabs] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const attractionIds = searchParams.get("attractions")?.split(",") || [];
  useEffect(() => {
    if (attractionIds.length > 0) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const attractionsData = await Promise.all(
        attractionIds.map(async (id) => {
          console.log("Printing the key where getting the error",process.env.NEXT_PUBLIC_NANO_NODE_API_URL)
          const response = await axios.get(`${process.env.NEXT_PUBLIC_NANO_NODE_API_URL}/explore/attractions/${id}`)
          return response.data
        })
      );

      const activitiesData = await Promise.all(
        attractionIds.map(async (id) => {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_NANO_NODE_API_URL}/explore/attractions/${id}/activities`);
          const data = response.data
          return data.map((activity: Activity) => ({
            ...activity,
            attractionId: id,
          }));
        })
      );

      setAttractions(attractionsData);
      setActivities(activitiesData.flat());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActivity = (activity: Activity) => {
    setSelectedActivities((prev) => {
      const isSelected = prev.find((a) => a.id === activity.id);
      if (isSelected) {
        return prev.filter((a) => a.id !== activity.id);
      } else {
        return [...prev, activity];
      }
    });
  };

  const toggleTab = (category: string) => {
    setActiveTabs((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };
  const toggleAll = () => {
    setActiveTabs([]);
};

  const getTotalCost = () => {
    return selectedActivities.reduce((total, activity) => {
      return total + (activity.price || 0);
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

//   const getActivityIcon = (category: string) => {
//     const icons = {
//       adventure: "🏔️",
//       cultural: "🎭",
//       food: "🍽️",
//       shopping: "🛍️",
//       entertainment: "🎡",
//       spiritual: "🙏",
//       photography: "📸",
//       educational: "📚",
//       relaxation: "🧘",
//       sports: "⚽",
//     };
//     return icons[category.toLowerCase()] || "🎯";
//   };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getFilteredActivities = () => {
    if (activeTabs.length === 0) return activities;
    return activities.filter((activity) =>
      activeTabs.includes(activity.category.toLowerCase())
    );
  };

  const getUniqueCategories = () => {
    const categories = [
      ...new Set(activities.map((a) => a.category.toLowerCase())),
    ];
    return categories.sort();
  };

  // Updated function to redirect to /ai route
  const proceedToAI = async () => {
    try {
      if (selectedActivities.length === 0) {
        alert("Please select at least one activity");
        return;
      }
      // if(selectedDate===""){
      //   alert("Please select a start date");
      //   return;
      // }
      console.log(selectedActivities);

      const activityIds = selectedActivities.map((a) => a.id);

      const springApiBaseUrl = process.env.NEXT_PUBLIC_SPRING_API_URL;
      // const { data: user } = await axios.get("/api/user");
      // if (!user) {
      //   router.push("/auth");
      //   return;
      // }
      await axios.post(`${springApiBaseUrl}/activities`, {
        selectedActivities: activityIds,
        userId: "sample",
        locationId: "jharkhand_india",
      });
      router.push(`/itinerary`);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <MapProvider>
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Available Activities
              </h1>
              <div className="mt-2">
                <label className="text-sm font-medium text-gray-700 mr-2" htmlFor="itinerary-date">
                  Select Date:
                </label>
                <input
                  type="date"
                  id="itinerary-date"
                  className="rounded-md border-gray-300 shadow-sm focus:ring-orange-500 focus:border-orange-500 text-sm px-3 py-1"
                  // value={selectedDate}
                  // onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <p className="text-orange-600 mt-1">
                Choose activities for your selected attractions
              </p>
            </div>
            <Link
              href={`/locations/${params.locationId}/attractions`}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              ← Back to Attractions
            </Link>
          </div>
        </div>
      </div>

      {/* Selected Attractions Header */}
      <div className="bg-orange-100 border-b border-orange-200 flex justify-between">
        <div className="flex-2/3 px-2 sm:px-6 lg:px-8 py-4">
          <h2 className="text-lg font-semibold text-orange-800 mb-2">
            Selected Attractions:
          </h2>
          <div className="flex flex-wrap gap-2">
            {attractions.map((attraction) => (
              <span
                key={attraction.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-200 text-orange-800"
              >
                {attraction.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-1/3 p-2 justify-end">
          <DraggableTextarea setActiveTabs={setActiveTabs}/>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={toggleAll}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTabs.length === getUniqueCategories().length
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Activities ({activities.length})
            </button>

            {getUniqueCategories().map((category) => {
              const count = activities.filter(
                (a) => a.category.toLowerCase() === category
              ).length;
              return (
                <button
                  key={category}
                  onClick={() => toggleTab(category)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap capitalize ${
                    activeTabs.includes(category)
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                   {category} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Activities Counter with Cost */}
      {selectedActivities.length > 0 && (
        <div className="bg-orange-500 text-white py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-medium">
                  {selectedActivities.length} activit
                  {selectedActivities.length !== 1 ? "ies" : "y"} selected
                </span>
                <div className="flex items-center space-x-1 bg-white/20 rounded-lg px-3 py-1">
                  <span className="font-semibold">
                    Total: {formatCurrency(getTotalCost())}
                  </span>
                </div>
              </div>
              <button
                onClick={proceedToAI}
                className="bg-white text-orange-500 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Generate AI Itinerary →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-0 lg:-px-2 py-8">
        {getFilteredActivities().length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No activities found
            </h2>
            <p className="text-gray-500">
              Try selecting different attractions or check back later!
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full w-full s md:flex-row max-h-[90vh] min-h-[90vh]">
            <div className="w-90 flex-shrink-0 border-l border-gray-200 bg-white p-4 rounded-md shadow-2xl">
              <ActivityMap
                activities={getFilteredActivities().map((activity) => {
                  const attraction = attractions.find(
                    (a: Attraction) => a.id === activity.attractionId
                  );
                  return {
                    ...activity,
                    attractionImageUrl: (attraction as Attraction).imageUrl,
                    attractionName: (attraction as Attraction).name,
                  };
                })}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex-wrap ">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-[200px]">
                {getFilteredActivities().map((activity) => {
                  const isSelected = selectedActivities.find(
                    (a) => a.id === activity.id
                  );
                  const attraction = attractions.find(
                    (a) => a.id === activity.attractionId
                  );

                  return (
                    <ActivityCard
                      key={activity.id}
                      toggleActivity={toggleActivity}
                      attraction={attraction as Attraction}
                      isSelected={isSelected ? true : false}
                      activity={activity}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar with Enhanced Cost Display */}
      {selectedActivities.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {selectedActivities.length} activit
                  {selectedActivities.length !== 1 ? "ies" : "y"} selected
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>
                    Duration:{" "}
                    {formatDuration(
                      selectedActivities.reduce((sum, a) => sum + a.duration, 0)
                    )}
                  </span>
                  <span className="text-green-600 font-semibold">
                    Total Cost: {formatCurrency(getTotalCost())}
                  </span>
                </div>
              </div>
              <button
                onClick={proceedToAI}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-sm"
              >
                Generate AI Itinerary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </MapProvider>
  );
}
