import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { ZoomIn, ZoomOut, RotateCcw, Maximize, Minimize, Map, MapPin, X } from 'lucide-react'
import { locations } from './constants'

export default function MapControls({ 
  onToggleFullscreen, 
  isFullscreen, 
  onLocate, 
  onCycleTile, 
  currentTileName,
  hasRoute,
  onClearRoute
}) {
  const map = useMap()

  const handleZoomIn = () => {
    if (map) map.zoomIn()
  }

  const handleZoomOut = () => {
    if (map) map.zoomOut()
  }

  const handleReset = () => {
    if (map && locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]))
      map.flyToBounds(bounds, { padding: [50, 50] })
    }
  }

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <button 
        onClick={handleZoomIn} 
        className="bg-white dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 
                   text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/40 
                   p-3 rounded-lg shadow-lg transition-all" 
        title="Zoom In"
      >
        <ZoomIn size={20} />
      </button>
      
      <button 
        onClick={handleZoomOut} 
        className="bg-white dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 
                   text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/40 
                   p-3 rounded-lg shadow-lg transition-all" 
        title="Zoom Out"
      >
        <ZoomOut size={20} />
      </button>
      
      <button 
        onClick={handleReset} 
        className="bg-white dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 
                   text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/40 
                   p-3 rounded-lg shadow-lg transition-all" 
        title="Reset View"
      >
        <RotateCcw size={20} />
      </button>
      
      <button 
        onClick={onLocate} 
        className="bg-white dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 
                   text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/40 
                   p-3 rounded-lg shadow-lg transition-all" 
        title="Find My Location"
      >
        <MapPin size={18} />
      </button>
      
      <button 
        onClick={onCycleTile} 
        className="bg-white dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 
                   text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/40 
                   p-3 rounded-lg shadow-lg transition-all" 
        title={`Switch base map (current: ${currentTileName})`}
      >
        <Map size={18} />
      </button>
      
      {hasRoute && (
        <button 
          onClick={onClearRoute} 
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg shadow-lg transition-all hover:scale-105" 
          title="Clear Route"
        >
          <X size={18} />
        </button>
      )}
      
      <button 
        onClick={onToggleFullscreen} 
        className="bg-white dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 
                   text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/40 
                   p-3 rounded-lg shadow-lg transition-all" 
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
    </div>
  )
}
