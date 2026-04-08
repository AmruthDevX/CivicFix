import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';

// Fix typical Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for statuses (simplified)
const getIcon = (status) => {
  const color = status === 'resolved' ? 'green' : status === 'in_progress' ? 'orange' : 'red';
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 14, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function CivicMap({ reports, userLoc, onMapClick }) {
  const defaultCenter = [40.7128, -74.0060]; // NYC default
  
  return (
    <div className="w-full h-full z-0 relative">
      <MapContainer 
        center={userLoc ? [userLoc.lat, userLoc.lng] : defaultCenter} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLoc && (
           <>
             <MapUpdater center={userLoc} />
             <CircleMarker 
               center={[userLoc.lat, userLoc.lng]} 
               radius={8} 
               pathOptions={{ fillColor: '#3b82f6', color: 'white', weight: 2, fillOpacity: 1 }} 
             >
                <Popup>You are here</Popup>
             </CircleMarker>
           </>
        )}
        
        {reports.map(r => (
          <Marker key={r.id} position={[r.lat, r.lng]} icon={getIcon(r.status)}>
            <Popup className="rounded-xl overflow-hidden">
              <div className="p-1">
                <div className="text-xs font-bold uppercase text-slate-500 mb-1">{r.category}</div>
                <h3 className="font-semibold text-sm mb-2">{r.description}</h3>
                <div className="flex gap-2">
                   <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white
                     ${r.status === 'resolved' ? 'bg-green-500' : r.status==='in_progress' ? 'bg-amber-500' : 'bg-red-500'}`}>
                     {r.status.replace('_', ' ')}
                   </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
