import { Layers, X, MapPin } from 'lucide-react';
import { tileLayers, type TileLayer } from './constants';
import type { FC } from 'react';

interface LayerSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentTile: TileLayer;
  onTileChange: (layer: TileLayer) => void;
  selectedLayers: string[];
  onLayerToggle: (layerName: string) => void;
}

const LayerSidebar: FC<LayerSidebarProps> = ({
  isOpen,
  onToggle,
  currentTile,
  onTileChange,
  selectedLayers,
  onLayerToggle,
}) => {
  return (
    <>
      <button
        onClick={onToggle}
        className="absolute top-20 left-4 z-[1001] rounded-lg border border-orange-200 dark:border-orange-900/40 bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-orange-950/30 dark:to-orange-950/20 p-3 text-orange-600 dark:text-orange-300 shadow-lg hover:scale-105 transition-all"
        title="Map Styles"
      >
        <Layers size={20} />
      </button>

      <div
        className={`absolute top-0 left-0 z-[1002] h-full w-80 transform bg-gradient-to-b from-orange-50 via-white to-orange-100 dark:from-orange-950/30 dark:via-background dark:to-orange-950/40 border-r border-orange-200 dark:border-orange-900/40 text-foreground shadow-xl backdrop-blur-sm transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto p-6">
       
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xl font-bold text-orange-600 dark:text-orange-400">
              <Layers size={24} /> Map Styles
            </h3>
            <button
              onClick={onToggle}
              className="rounded-lg p-2 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <h4 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
            Base Maps
          </h4>
          <div className="mb-8 space-y-3">
            {Object.values(tileLayers).map(layer => {
              const IconComponent = layer.icon;
              const isSelected = currentTile.key === layer.key;
              return (
                <button
                  key={layer.name}
                  onClick={() => onTileChange(layer)}
                  className={`w-full rounded-xl p-4 text-left transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                      : 'border border-orange-200 dark:border-orange-800 bg-white/60 dark:bg-orange-950/30 hover:bg-orange-50 dark:hover:bg-orange-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        isSelected
                          ? 'bg-white/20'
                          : 'bg-orange-100 dark:bg-orange-950/50'
                      }`}
                    >
                      <IconComponent
                        size={20}
                        className={isSelected ? 'text-white' : 'text-orange-600 dark:text-orange-400'}
                      />
                    </div>
                    <div>
                      <div className="font-semibold">{layer.name}</div>
                      <div
                        className={`text-sm ${
                          isSelected ? 'text-white/80' : 'text-muted-foreground'
                        }`}
                      >
                        {layer.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <h4 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
            Overlay Layers
          </h4>
          <button
            onClick={() => onLayerToggle('markers')}
            className={`flex w-full items-center justify-between rounded-lg p-3 transition-all ${
              selectedLayers.includes('markers')
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                : 'border border-orange-200 dark:border-orange-800 bg-white/60 dark:bg-orange-950/30 hover:bg-orange-50 dark:hover:bg-orange-900/40'
            }`}
          >
            <div className="flex items-center gap-3 font-medium">
              <MapPin size={18} />
              <span>Location Markers</span>
            </div>
            <div
              className={`h-4 w-4 rounded-full border-2 ${
                selectedLayers.includes('markers')
                  ? 'border-white bg-white'
                  : 'border-orange-400 dark:border-orange-600'
              }`}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="absolute inset-0 z-[999] bg-black/30 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default LayerSidebar;
