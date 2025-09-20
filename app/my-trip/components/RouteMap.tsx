"use client";
import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { Activity, CalendarActivity, ItineraryItem } from "@/types/Activity";
import axios from "axios";
import { useMap } from "../../contexts/MapContext"; 
import { useHotelContext } from "../../contexts/HotelContext";
import { CalendarDays, Loader2Icon } from "lucide-react";
import { Hotel } from "@/types/Hotel";
import { FaHome } from "react-icons/fa";

const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
};

type DecodedPath = {
  lat: number;
  lng: number;
};

export default function RouteMap({itineraryItems}:{itineraryItems:CalendarActivity[]}) {
  // Use the context to get the loaded state. No more direct calls to useJsApiLoader here.
  const { isLoaded, loadError } = useMap();
  const isComplete=true;
  const [hotels,setHotels]=useState<Hotel[]>([])
  const [locations, setLocations] = useState<DecodedPath[]>([]);
  const [hotelLocations, setHotelLocations] = useState<DecodedPath[]>([]);
  const [routePath, setRoutePath] = useState<DecodedPath[]>([]);
  console.log(hotels)
  const springApiBaseUrl = process.env.NEXT_PUBLIC_SPRING_API_URL;
  // ... (the rest of your component logic remains the same)
  const sum = locations.reduce(
    (accumulator, current) => ({
      lat: accumulator.lat + (current.lat || 0),
      lng: accumulator.lng + (current.lng || 0),
    }),
    { lat: 0, lng: 0 }
  );

  const center =
    locations.length > 0
      ? {
          lat: sum.lat / locations.length,
          lng: sum.lng / locations.length,
        }
      : { lat: 23.3004, lng: 85.271 };

  useEffect(() => {
    async function markLocations() {
      if (!itineraryItems || itineraryItems.length === 0) return;
      try {
        const activityIds = itineraryItems.map((item) => item.activity_id);

        const { data } = await axios.post(
          `${springApiBaseUrl}/activity-details`,
          { selectedActivities: activityIds }
        );
        setLocations(
          data.data.map((element: Activity) => ({
            lat: element.latitude,
            lng: element.longitude,
          }))
        );
      } catch (err: any) {
        console.error("Error fetching activity details:", err.message);
      }
    }
    if (isComplete) {
      markLocations();
    }
  }, [isComplete, itineraryItems]);

  useEffect(() => {
    if (locations.length < 2 || !isLoaded) {
      setRoutePath([]);
      return;
    }

    const fetchRoute = async () => {
      const origin = locations[0];
      const destination = locations[locations.length - 1];
      const intermediates = locations.slice(1, -1).map((loc) => ({
        location: {
          latLng: {
            latitude: loc.lat,
            longitude: loc.lng,
          },
        },
      }));

      try {
        const response = await axios.post(
          "https://routes.googleapis.com/directions/v2:computeRoutes",
          {
            origin: {
              location: {
                latLng: { latitude: origin.lat, longitude: origin.lng },
              },
            },
            destination: {
              location: {
                latLng: {
                  latitude: destination.lat,
                  longitude: destination.lng,
                },
              },
            },
            intermediates: intermediates,
            travelMode: "DRIVE",
            polylineEncoding: "ENCODED_POLYLINE",
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key":
                process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
              "X-Goog-FieldMask": "routes.polyline.encodedPolyline",
            },
          }
        );
        const encodedPolyline =
          response.data.routes[0].polyline.encodedPolyline;

        if (encodedPolyline && window.google?.maps?.geometry?.encoding) {
          const decodedPath =
            window.google.maps.geometry.encoding.decodePath(encodedPolyline);
          setRoutePath(
            decodedPath.map((p) => ({ lat: p.lat(), lng: p.lng() }))
          );
        }
      } catch (error) {
        console.error("Error fetching route from Routes API:", error);
      }
    };

    fetchRoute();
  }, [locations, isLoaded]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        // const { data: user } = await axios.get("/api/user");
        // if (!user) {
        //   redirect("/auth");
        // }
        const response = await axios.post(
          `${springApiBaseUrl}/hotels/nearby-hotels`,
          {
            userId: "sample",
            locationList: routePath,
          }
        );
        setHotelLocations(
          response.data.data.map((element: any) => ({
            lat: element.latitude,
            lng: element.longitude,
          }))
        );
      
        setHotels(response.data.data);
      } catch (error: any) {
        console.error(error.message);
        console.log("Failed to fetch hotel markers");
      }
    };
    if (routePath.length > 0) {
      fetchHotels();
    }
  }, [routePath, isLoaded]);
  // Handle loading and error states gracefully
  if (loadError) return <div>Error loading map</div>;

  return (
    <div className="flex-1/4 max-h-[70vh]">
                <div className="bg-white rounded-xl p-6 border border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-center">
                    <div>
                      <p className="text-sm text-orange-600  text-center font-light flex gap-5">
                        {hotelLocations.length==0?"Searching  for":<FaHome className="text-2xl"/>} Hotels and Stays closest to your route path
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        
                      </p>
                    </div>
                    <div className="w-10 h-10  rounded-lg flex items-center justify-center">
                      {hotelLocations.length==0?
                      <Loader2Icon color="orange"  style={{ animation: "spin 1s linear infinite" }}/>
                      :null}
                    </div>
                  </div>
                </div>
      {isLoaded ? (
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={9}>
          {locations.map((position, idx) => (
            <Marker key={idx} position={position} />
          ))}
          {routePath.length > 0 && (
            <Polyline
              path={routePath}
              options={{
                strokeColor: "orange",
                strokeOpacity: 0.8,
                strokeWeight: 4,
                geodesic: true,
              }}
            />
          )}
   {hotelLocations.map((position, idx) => {
            const price = hotels[idx]?.price || 0;

const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="20" viewBox="0 0 32 20">
  
    <defs>
    
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="1" stdDeviation="0.5" flood-opacity="0.2" />
      </filter>
      
    </defs>

    <!-- Background pill -->
    <g>
    
      <rect x="2" y="0" width="22" height="9" rx="3" ry="3" fill="#ff823c" />
      
      <!-- Home icon (4×4) -->
      <g transform="translate(4,2)" fill="white">
        <!-- Roof -->
        <path d="M0 2 L2 0 L4 2 Z" />
        <!-- Base -->
        <rect x="0.6" y="2" width="2.8" height="2" rx="0.3" />
      </g>
      
      <!-- Price text -->
      <text x="15" y="6" text-anchor="middle"
            font-family="Arial, sans-serif"
            font-size="4"
            fill="white">
        ₹${price}
      </text>
    </g>
  </svg>
`;


            return (
              <Marker
                key={idx}
                position={position}
                icon={{
                  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                    svg
                  )}`,
                  scaledSize: new google.maps.Size(80, 50),
                  anchor: new google.maps.Point(40, 50), // anchor bottom-center
                }}
              />
            );
          })} 
        </GoogleMap>
      ) : (
        <div>Loading Map...</div>
      )}
    </div>
  );
}
