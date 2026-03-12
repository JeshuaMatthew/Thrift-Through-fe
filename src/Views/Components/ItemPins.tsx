// components/ItemPins.tsx
import React from 'react';
import { Marker } from 'react-map-gl/maplibre';
import { ShoppingBasket } from 'lucide-react';

interface ItemPinsProps {
  longitude: number;
  latitude: number;
  name?: string; 
}

const ItemPins: React.FC<ItemPinsProps> = ({ longitude, latitude, name }) => {
  return (
    <Marker longitude={longitude} latitude={latitude} anchor="center">
      <div 
        className="bg-orange-500 p-2 rounded-full shadow-lg border-2 border-white cursor-pointer hover:scale-110 hover:bg-orange-600 transition-all group relative"
      >
        <ShoppingBasket size={20} className="text-white" />
        
        {name && (
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {name}
          </span>
        )}
      </div>
    </Marker>
  );
}

export default ItemPins;