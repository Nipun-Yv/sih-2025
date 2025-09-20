import { Activity } from '@/types/Activity';
import { useMap } from '../../contexts/MapContext';
import { GoogleMap, Marker } from '@react-google-maps/api';
import React from 'react'
const containerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  zIndex:0
};
function getRoundedBoxIcon(name:string,count:number, width = 120, height = 30, radius = 4, bgColor = "#fa8f55", textColor = '#FFFFFF') {
  return {
    url: 'data:image/svg+xml;utf-8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <rect
            x="0"
            y="0"
            width="${width}"
            height="${height}"
            rx="${radius}"
            ry="${radius}"
            fill="${bgColor}"
          />
          <text
            x="50%"
            y="30%"
            text-anchor="middle"
            fill="${textColor}"
            font-family="Arial"
            font-size="8"
            font-weight="bold"
            alignment-baseline="middle"
          >
            ${name}
          </text>
                  <text
            x="50%"
            y="70%"
            text-anchor="middle"
            fill="#fed7aa"
            font-family="Arial"
            font-weight="200"
            font-size="8"
            alignment-baseline="middle"
          >
            ${count} activities
        </text>
        </svg>`
      ),
    scaledSize: new google.maps.Size(width, height)
  };
}

const ActivityMap = ({activities}:{activities:(Activity & {attractionName:string,attractionImageUrl:string})[]}) => {
    const locations=activities.map((activity)=>({lat:activity.latitude as number,lng:activity.longitude as number,
        imageUrl:activity.attractionImageUrl,name:activity.attractionName,attractionId:activity.attractionId}))

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
      : { lat: 28.597040011417835, lng: 77.23768806238938 };
  const { isLoaded, loadError } = useMap();
  if (loadError) return <div>Error loading map</div>;
  return (
    <div className="h-full w-full rounded-xl bg-gray-200 flex items-center justify-center">
        {isLoaded ? (
        <GoogleMap mapContainerStyle={containerStyle}  zoom={10} center={center} options={{mapId:"ad42606e9487d04c"}} >
          {locations.map((position, idx) => {
            return (
              <Marker
                key={position.attractionId+idx.toString()}
                position={{lat:position.lat,lng:position.lng}}
                icon={ getRoundedBoxIcon(position.name,5)}
              />
            );
          }
          )}
            <Marker
                position={center}
            />
        </GoogleMap>
      ) : (
        <div>Loading Map...</div>
      )}
    </div>
  )
}

export default ActivityMap