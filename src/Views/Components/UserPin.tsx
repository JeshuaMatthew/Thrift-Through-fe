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
        <div className="absolute w-8 h-8 bg-bg-vermillion rounded-full opacity-75 animate-ping"></div>
        <div className="relative w-4 h-4 bg-bg-vermillion border-2 border-white rounded-full shadow-md z-10"></div>
        <div className="absolute bottom-full mb-2 bg-tx-primary text-bg-clean text-xs px-2.5 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 font-questrial font-bold">
          Lokasi Anda
        </div>
      </div>
    </Marker>
  );
};

export default UserPin;