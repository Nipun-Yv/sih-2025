import Link from 'next/link';
import { MapPin, Star, Camera, Headphones } from 'lucide-react';
import type { Location } from './constants';

interface InfoPanelProps {
  selectedLocation: Location;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ selectedLocation }) => {
  const slug = selectedLocation.name.toLowerCase().replace(/\s+/g, '-');
  const arLink = `/ar/${slug}`;
  const vrLink = `/vr/${slug}`;

  return (
    <div className="w-full max-w-sm bg-card rounded-xl overflow-hidden shadow-lg border border-orange-200 dark:border-orange-800 backdrop-blur-sm">
      <div className="relative">
        <img
          src={selectedLocation.image}
          alt={selectedLocation.name}
          className="w-full h-32 sm:h-40 object-cover"
        />
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
            <Star size={12} className="text-yellow-400 fill-current" />
            <span>4.8</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
          <h3 className="text-white font-bold text-lg mb-1">{selectedLocation.name}</h3>
          <div className="flex items-center gap-1 text-white/90 text-sm">
            <MapPin size={14} />
            <span>Jharkhand, India</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
          {selectedLocation.description}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href={arLink}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Camera size={16} className="group-hover:rotate-12 transition-transform duration-200" />
            <span>AR View</span>
          </Link>
          
          <Link
            href={vrLink}
            className="group flex items-center justify-center gap-2 border-2 border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105"
          >
            <Headphones size={16} className="group-hover:rotate-12 transition-transform duration-200" />
            <span>VR Tour</span>
          </Link>
        </div>

        <div className="pt-2 border-t border-orange-100 dark:border-orange-900">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>📍 Popular Destination</span>
            <span>🕒 Open 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;