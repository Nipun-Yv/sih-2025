import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { locations } from './constants';

const FitBoundsToMarkers = (): null => {
  const map = useMap();

  useEffect(() => {
    if (locations?.length) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map]);

  return null;
};

export default FitBoundsToMarkers;