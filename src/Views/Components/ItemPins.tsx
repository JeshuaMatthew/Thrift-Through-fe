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
      <div className="bg-bg-fresh p-2 rounded-full shadow-lg border-2 border-white cursor-pointer hover:scale-110 hover:bg-bg-fresh/90 transition-all group relative">
        <ShoppingBasket size={20} className="text-tx-primary" />

        {name && (
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-tx-primary text-bg-clean text-xs px-2.5 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-questrial font-bold shadow-xl">
            {name}
          </span>
        )}
      </div>
    </Marker>
  );
};

export default ItemPins;