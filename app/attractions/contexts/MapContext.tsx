
"use client";

import React, { createContext, useContext } from "react";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";

const libraries: Libraries = ["places", "geometry"];


interface MapContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const MapContext = createContext<MapContextType>({
  isLoaded: false,
  loadError: undefined,
});

export const useMap = () => useContext(MapContext);

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });
  return (
    <MapContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </MapContext.Provider>
  );
};