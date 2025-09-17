
import { Layers, X, MapPin } from 'lucide-react';
import { tileLayers } from './constants';

export default function LayerSidebar({ isOpen, onToggle, currentTile, onTileChange, selectedLayers, onLayerToggle }) {
  return (
    <>
      <button onClick={onToggle} className="absolute top-20 left-4 z-[1001] bg-white hover:bg-gray-50 p-3 rounded-lg shadow-lg" title="Map Styles">
        <Layers size={20} />
      </button>
      <div className={`absolute top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-sm shadow-xl z-[1000] transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><Layers size={24} className="text-blue-600" /> Map Styles</h3>
            <button onClick={onToggle} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
          </div>
          <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">Base Maps</h4>
          <div className="space-y-3 mb-8">
            {Object.values(tileLayers).map((layer) => {
              const IconComponent = layer.icon;
              const isSelected = currentTile.key === layer.key;
              return (
                <button key={layer.name} onClick={() => onTileChange(layer)} className={`w-full p-4 rounded-xl text-left transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg' : 'bg-white hover:bg-gray-50 border'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-gray-100'}`}><IconComponent size={20} className={isSelected ? 'text-white' : 'text-gray-600'} /></div>
                    <div>
                      <div className="font-semibold">{layer.name}</div>
                      <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>{layer.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">Overlay Layers</h4>
          <button onClick={() => onLayerToggle('markers')} className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${selectedLayers.includes('markers') ? 'bg-green-100 text-green-800' : 'bg-gray-100 hover:bg-gray-200'}`}>
            <div className="flex items-center gap-3"><MapPin size={18} /><span>Location Markers</span></div>
            <div className={`w-4 h-4 rounded-full border-2 ${selectedLayers.includes('markers') ? 'bg-green-500 border-green-500' : 'border-gray-300'}`} />
          </button>
        </div>
      </div>
      {isOpen && <div className="absolute inset-0 bg-black/20 z-[999]" onClick={onToggle} />}
    </>
  );
}