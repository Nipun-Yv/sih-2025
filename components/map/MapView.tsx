'use client';
import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, AttributionControl, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locations, tileLayers, tileCycleOrder } from './constants';
import MapControls from './MapControls';
import SearchBar from './SearchBar';
import LayerSidebar from './LayerSidebar';
import InfoPanel from './InfoPanel';
import TourismCarousel from './TourismCarousel';
import FitBoundsToMarkers from './FitBoundsToMarkers';

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  image: string;
  description: string; 
}

interface RouteInfo {
  distance: string;
  duration: number;
}

interface UserLocation {
  lat: number;
  lng: number;
}


export default function MapView() {
  const [currentTile, setCurrentTile] = useState(tileLayers.light);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState<string[]>(['markers']);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<number[][]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const INITIAL_CENTER: [number, number] = [23.6, 85.3];
  const INITIAL_ZOOM = 8;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleLayerToggle = (layerId: string) => {
    setSelectedLayers(prev => (prev.includes(layerId) ? prev.filter(id => id !== layerId) : [...prev, layerId]));
  };

  const handleSearch = async () => {
    if (!map || !searchTerm.trim()) {
      alert('Please enter a location to search for!');
      return;
    }

    const found = locations.find(loc => loc.name.toLowerCase().includes(searchTerm.toLowerCase().trim()));

    if (found) {
      map.flyTo([found.lat, found.lng], 12);
      if (userLocation) {
        await fetchRoute(userLocation, found);
      }
      setSearchTerm('');
    } else {
      alert(`Location "${searchTerm}" not found! Available locations: ${locations.map(l => l.name).join(', ')}`);
    }
  };

  const fetchRouteAndFly = async (location: Location) => {
    if (userLocation) {
      await fetchRoute(userLocation, location);
    } else {
        map?.flyTo([location.lat, location.lng], 12);
    }
  };
const handleToggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      alert(`Fullscreen not supported or blocked: ${err}`);
    }
  };

  const handleLocate = () => {
    if (!map) {
      alert('Map not ready yet, please try again in a moment.');
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const newUserLocation = { lat: latitude, lng: longitude };

        setUserLocation(newUserLocation);
        map.flyTo([latitude, longitude], 13);
      },
      error => {
        let errorMessage = 'Unable to get your location. ';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }

        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  const handleCycleTile = () => {
    const currentIndex = tileCycleOrder.indexOf(currentTile.key);
    const nextIndex = (currentIndex + 1) % tileCycleOrder.length;
    const nextKey = tileCycleOrder[nextIndex];
    setCurrentTile(tileLayers[nextKey]);
  };


  const fetchRoute = async (start: UserLocation, end: Location) => {
    setIsLoadingRoute(true);
    try {
      const OSRM_API_URL = process.env.NEXT_PUBLIC_OSRM_API_URL || 'https://router.project-osrm.org';

      const response = await fetch(
        `${OSRM_API_URL}/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`,
      );

      if (!response.ok) throw new Error('Failed to fetch route');
      const data = await response.json();
      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) throw new Error('No route found');
      
      const route = data.routes[0];
      const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
      
      setRouteCoordinates(coordinates);
      setRouteInfo({
        distance: (route.distance / 1000).toFixed(2),
        duration: Math.round(route.duration / 60),
      });

      const bounds = L.latLngBounds([[start.lat, start.lng], [end.lat, end.lng]]);
      map?.fitBounds(bounds, { padding: [50, 50] });

    } catch (error) {
      alert('Unable to fetch route. Please try again.');
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const clearRoute = () => {
    setRouteCoordinates([]);
    setRouteInfo(null);
  };

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="relative h-[400px] w-full overflow-hidden rounded-lg border border-border bg-background shadow-xl sm:h-[500px] lg:h-[600px]"
      >
        <MapContainer
          ref={setMap}
          center={INITIAL_CENTER}
          zoom={INITIAL_ZOOM}
          className="h-full w-full rounded-lg"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url={currentTile.url} attribution={currentTile.attribution} />
          <AttributionControl prefix="" />
          <FitBoundsToMarkers />

          {selectedLayers.includes('markers') &&
            locations.map(location => (
              <Marker
                key={location.id}
                position={[location.lat, location.lng]}
                icon={
                  new L.Icon({
                    iconUrl: location.image,
                    iconSize: [35, 35],
                    iconAnchor: [17, 35],
                    popupAnchor: [0, -35],
                    className: 'rounded-full border-2 border-orange-200 shadow-lg ring-2 ring-orange-100',
                  })
                }
                eventHandlers={{
                  click: () => fetchRouteAndFly(location),
                }}
              >
                <Popup className="custom-popup">
                  <InfoPanel selectedLocation={location} />
                </Popup>
              </Marker>
            ))}

          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={new L.Icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
              })}
            >
               <Popup className="custom-popup">Your Location</Popup>
            </Marker>
          )}

          {routeCoordinates.length > 0 && (
            <Polyline positions={routeCoordinates} color="rgb(234, 88, 12)" weight={5} opacity={0.8} />
          )}

          <MapControls
            onToggleFullscreen={handleToggleFullscreen}
            isFullscreen={isFullscreen}
            onLocate={handleLocate}
            onCycleTile={handleCycleTile}
            currentTileName={currentTile.name}
            hasRoute={routeCoordinates.length > 0}
            onClearRoute={clearRoute}
          />
        </MapContainer>

        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={handleSearch}
          isLoadingRoute={isLoadingRoute}
        />

        {routeInfo && (
          <div className="absolute top-4 left-4 z-[1000] mt-12 w-64 rounded-lg border border-border bg-card/95 p-3 shadow-xl backdrop-blur-sm sm:mt-16 sm:w-80 sm:p-4">
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-sm font-semibold text-card-foreground sm:text-base">Route Information</h3>
                <button
                  onClick={clearRoute}
                  className="rounded-full p-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                  title="Clear Route"
                >✕</button>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground sm:text-sm">
                <div className="flex items-center justify-between">
                  <span>Distance:</span>
                  <span className="rounded-md bg-orange-50 px-2 py-1 font-medium text-card-foreground dark:bg-orange-950">
                    {routeInfo.distance} km
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Duration:</span>
                  <span className="rounded-md bg-orange-50 px-2 py-1 font-medium text-card-foreground dark:bg-orange-950">
                    {routeInfo.duration} min
                  </span>
                </div>
              </div>
          </div>
        )}

        <LayerSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          currentTile={currentTile}
          onTileChange={setCurrentTile}
          selectedLayers={selectedLayers}
          onLayerToggle={handleLayerToggle}
        />
      </div>

      <div className="mt-6 sm:mt-8">
        <TourismCarousel isFullscreen={isFullscreen} />
      </div>
    </div>
  );
}