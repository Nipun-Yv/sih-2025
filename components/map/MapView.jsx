
'use client'
import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


import { locations, tileLayers, tileCycleOrder } from './constants';

import MapControls from './MapControls';
import SearchBar from './SearchBar';
import LayerSidebar from './LayerSidebar';
import InfoPanel from './InfoPanel';
import TourismCarousel from './TourismCarousel';
import FitBoundsToMarkers from './FitBoundsToMarkers';

export default function MapView() {
  const [currentTile, setCurrentTile] = useState(tileLayers.light);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState(['markers']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const containerRef = useRef(null);

  const INITIAL_CENTER = [23.6, 85.3];
  const INITIAL_ZOOM = 8;

  const handleLayerToggle = (layerId) => {
    setSelectedLayers(prev => prev.includes(layerId) ? prev.filter(id => id !== layerId) : [...prev, layerId]);
  };

  const handleSearch = () => {
    if (!map) return;
    const found = locations.find(loc => loc.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (found) {
      map.flyTo([found.lat, found.lng], 12);
      setSelectedLocation(found);
    } else {
      alert("Location not found!");
    }
  };

  const handleToggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => alert(`Fullscreen error: ${err.message}`));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLocate = () => {
    if (!map) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        map.flyTo([latitude, longitude], 13);
      },
      (err) => alert(`Unable to get location: ${err.message}`)
    );
  };

  const handleCycleTile = () => {
    const currentIndex = tileCycleOrder.indexOf(currentTile.key);
    const nextIndex = (currentIndex + 1) % tileCycleOrder.length;
    const nextKey = tileCycleOrder[nextIndex];
    setCurrentTile(tileLayers[nextKey]);
  };

  return (
    <div className="w-full">
      <div ref={containerRef} className="relative w-full h-[600px] bg-gray-100 overflow-hidden">
        <MapContainer
          whenCreated={setMap}
          center={INITIAL_CENTER}
          zoom={INITIAL_ZOOM}
          className="w-full h-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url={currentTile.url} attribution={currentTile.attribution} />
          <AttributionControl prefix="" />
          <FitBoundsToMarkers />

          {selectedLayers.includes('markers') && locations.map((location) => (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={new L.Icon({
                iconUrl: location.image,
                iconSize: [35, 35], iconAnchor: [17, 35], popupAnchor: [0, -35],
                className: 'rounded-full border-2 border-white shadow-md'
              })}
              eventHandlers={{ click: () => setSelectedLocation(location) }}
            >
              <Popup><div className="font-bold">{location.name}</div></Popup>
            </Marker>
          ))}

          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={new L.Icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconSize: [25, 41], iconAnchor: [12, 41],
              })}
            />
          )}
          
          <MapControls
            onToggleFullscreen={handleToggleFullscreen}
            isFullscreen={isFullscreen}
            onLocate={handleLocate}
            onCycleTile={handleCycleTile}
            currentTileName={currentTile.name}
          />
        </MapContainer>

        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={handleSearch} />
        <LayerSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          currentTile={currentTile}
          onTileChange={setCurrentTile}
          selectedLayers={selectedLayers}
          onLayerToggle={handleLayerToggle}
        />
        <InfoPanel
          selectedLocation={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      </div>

      <div className="mt-8">
        <TourismCarousel isFullscreen={isFullscreen} />
      </div>
    </div>
  );
}