import React from 'react';
import { Marker } from 'react-map-gl/maplibre';
import { ShoppingBasket, RefreshCw } from 'lucide-react';

interface ItemPinsProps {
  longitude: number;
  latitude: number;
  name?: string;
  transactionType?: string;
}

const ItemPins: React.FC<ItemPinsProps> = ({ longitude, latitude, name, transactionType }) => {
  const isBarter = transactionType === 'Barter';
  
  return (
    <Marker longitude={longitude} latitude={latitude} anchor="center">
      <div className={`${isBarter ? 'bg-bg-vermillion' : 'bg-bg-fresh'} p-2 rounded-full shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-all group relative`}>
        {isBarter ? (
          <ShoppingBasket size={20} className="text-bg-clean" />
        ) : (
          <ShoppingBasket size={20} className="text-tx-primary" />
        )}

        {/* Badge or icon for barter? Let's just use different color for now, maybe small icon badge */}
        {isBarter && (
          <div className="absolute -top-1 -right-1 bg-tx-primary text-bg-clean rounded-full p-0.5 border border-white">
            <RefreshCw size={8} />
          </div>
        )}

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