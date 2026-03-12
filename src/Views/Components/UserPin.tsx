import React from 'react';
import { Marker } from 'react-map-gl/maplibre';

interface UserPinProps {
  longitude: number;
  latitude: number;
}

const UserPin: React.FC<UserPinProps> = ({ longitude, latitude }) => {
  return (
    <Marker longitude={longitude} latitude={latitude} anchor="center">
      <div className="relative flex items-center justify-center cursor-pointer group">
        
        <div className="absolute w-8 h-8 bg-blue-500 rounded-full opacity-75 animate-ping"></div>
        
        <div className="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md z-10"></div>
        
        <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
          Lokasi Anda
        </div>
        
      </div>
    </Marker>
  );
};

export default UserPin;