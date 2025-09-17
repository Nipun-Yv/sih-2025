
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { ZoomIn, ZoomOut, RotateCcw, Maximize, Minimize, Map, MapPin } from 'lucide-react';
import { locations } from './constants';

export default function MapControls({ onToggleFullscreen, isFullscreen, onLocate, onCycleTile, currentTileName }) {
  const map = useMap();

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const handleReset = () => {
    const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
    map.flyToBounds(bounds, { padding: [50, 50] });
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button onClick={handleZoomIn} className="bg-white hover:bg-gray-50 p-3 rounded-lg shadow-lg" title="Zoom In"><ZoomIn size={20} /></button>
      <button onClick={handleZoomOut} className="bg-white hover:bg-gray-50 p-3 rounded-lg shadow-lg" title="Zoom Out"><ZoomOut size={20} /></button>
      <button onClick={handleReset} className="bg-white hover:bg-gray-50 p-3 rounded-lg shadow-lg" title="Reset View"><RotateCcw size={20} /></button>
      <button onClick={onLocate} className="bg-white hover:bg-gray-50 p-3 rounded-lg shadow-lg" title="Go to my location"><MapPin size={18} /></button>
      <button onClick={onCycleTile} className="bg-white hover:bg-gray-50 p-3 rounded-lg shadow-lg" title={`Switch base map (current: ${currentTileName})`}><Map size={18} /></button>
      <button onClick={onToggleFullscreen} className="bg-white hover:bg-gray-50 p-3 rounded-lg shadow-lg" title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
    </div>
  );
}