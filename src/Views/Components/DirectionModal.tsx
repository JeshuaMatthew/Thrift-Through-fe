import React, { useState, useEffect, useRef } from "react";
import Map, {
  NavigationControl,
  GeolocateControl,
  type MapRef,
  Marker,
  Source,
  Layer,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { X, Navigation, MapPin, ExternalLink, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DirectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoords: { lng: number; lat: number } | null;
  itemCoords: { lng: number; lat: number };
  itemName: string;
}

const DirectionModal: React.FC<DirectionModalProps> = ({
  isOpen,
  onClose,
  userCoords,
  itemCoords,
  itemName,
}) => {
  const mapRef = useRef<MapRef>(null);
  const [route, setRoute] = useState<any>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && userCoords && itemCoords) {
      fetchRoute();
    }
  }, [isOpen, userCoords, itemCoords]);

  const fetchRoute = async () => {
    if (!userCoords) return;
    try {
      const resp = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${userCoords.lng},${userCoords.lat};${itemCoords.lng},${itemCoords.lat}?overview=full&geometries=geojson`,
      );
      const data = await resp.json();
      if (data.routes && data.routes.length > 0) {
        setRoute(data.routes[0].geometry);
        setDistance(data.routes[0].distance);
        setDuration(data.routes[0].duration);

        // Fit bounds
        const lats = [userCoords.lat, itemCoords.lat];
        const lngs = [userCoords.lng, itemCoords.lng];
        mapRef.current?.fitBounds(
          [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ],
          { padding: 80, duration: 2000 },
        );
      }
    } catch (error) {
      console.error("Failed to fetch route:", error);
    }
  };

  const openInGoogleMaps = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${userCoords?.lat},${userCoords?.lng}&destination=${itemCoords.lat},${itemCoords.lng}&travelmode=driving`,
      "_blank",
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-tx-primary/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-bg-clean border border-bg-vermillion/30 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[85vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-bg-vermillion/10 flex items-center justify-between bg-white/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-bg-fresh flex items-center justify-center text-tx-primary shadow-sm">
                  <Navigation size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-gasoek text-tx-primary tracking-wide leading-tight">
                    Petunjuk Arah
                  </h2>
                  <p className="text-xs font-questrial text-tx-secondary">
                    Lokasi:{" "}
                    <span className="text-bg-vermillion font-bold">
                      {itemName}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-tx-muted hover:bg-bg-vermillion/10 hover:text-bg-vermillion rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Map Body */}
            <div className="flex-1 relative">
              {!userCoords && (
                <div className="absolute inset-0 z-10 bg-bg-clean/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-bg-vermillion/10 rounded-full flex items-center justify-center mb-4">
                    <MapPin
                      size={32}
                      className="text-bg-vermillion animate-bounce"
                    />
                  </div>
                  <h3 className="font-gasoek text-tx-primary mb-2">
                    Lokasi kamu tidak terdeteksi
                  </h3>
                  <p className="text-sm font-questrial text-tx-secondary max-w-xs">
                    Aktifkan izin lokasi pada browser kamu untuk melihat rute
                    dari posisimu saat ini.
                  </p>
                </div>
              )}

              <Map
                ref={mapRef}
                initialViewState={{
                  longitude: itemCoords.lng,
                  latitude: itemCoords.lat,
                  zoom: 14,
                }}
                mapStyle="https://tiles.openfreemap.org/styles/liberty"
                style={{ width: "100%", height: "100%" }}
              >
                <GeolocateControl position="top-right" />
                <NavigationControl position="top-right" />

                {/* User Marker */}
                {userCoords && (
                  <Marker
                    longitude={userCoords.lng}
                    latitude={userCoords.lat}
                    anchor="bottom"
                  >
                    <div className="relative group">
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-md shadow-md text-[10px] font-gasoek whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        Kamu di sini
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-white ring-4 ring-blue-500/20">
                        <Navigation size={14} className="fill-current" />
                      </div>
                    </div>
                  </Marker>
                )}

                {/* Item Marker */}
                <Marker
                  longitude={itemCoords.lng}
                  latitude={itemCoords.lat}
                  anchor="bottom"
                >
                  <div className="relative group">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-bg-vermillion text-white px-2 py-1 rounded-md shadow-md text-[10px] font-gasoek whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Lokasi Barang
                    </div>
                    <div className="w-8 h-8 rounded-full bg-bg-vermillion border-2 border-white shadow-lg flex items-center justify-center text-white ring-4 ring-bg-vermillion/20">
                      <MapPin size={16} className="fill-current" />
                    </div>
                  </div>
                </Marker>

                {/* Route Line */}
                {route && (
                  <Source
                    id="route"
                    type="geojson"
                    data={{ type: "Feature", properties: {}, geometry: route }}
                  >
                    <Layer
                      id="route-layer"
                      type="line"
                      layout={{ "line-join": "round", "line-cap": "round" }}
                      paint={{
                        "line-color": "#eb503c",
                        "line-width": 5,
                        "line-opacity": 0.8,
                      }}
                    />
                  </Source>
                )}
              </Map>

              {/* Route Info Overlay */}
              {distance !== null && duration !== null && (
                <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row gap-4">
                  <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-bg-vermillion/20 shadow-xl flex items-center gap-4 grow">
                    <div className="flex-1 border-r border-gray-100 pr-4">
                      <p className="text-[10px] uppercase font-gasoek text-tx-muted tracking-wider mb-0.5">
                        Jarak Estimasi
                      </p>
                      <p className="text-xl font-gasoek text-tx-primary">
                        {(distance / 1000).toFixed(1)}{" "}
                        <span className="text-xs">KM</span>
                      </p>
                    </div>
                    <div className="flex-1 pl-2">
                      <p className="text-[10px] uppercase font-gasoek text-tx-muted tracking-wider mb-0.5">
                        Waktu Tempuh
                      </p>
                      <p className="text-xl font-gasoek text-tx-primary">
                        {(duration / 60).toFixed(0)}{" "}
                        <span className="text-xs">Menit</span>
                      </p>
                    </div>
                    <div className="hidden sm:flex w-10 h-10 rounded-full bg-bg-fresh items-center justify-center text-tx-primary shrink-0">
                      <Info size={18} />
                    </div>
                  </div>

                  <button
                    onClick={openInGoogleMaps}
                    className="bg-tx-primary text-bg-clean hover:bg-black px-6 py-4 rounded-2xl font-gasoek text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shrink-0 group"
                  >
                    Buka Google Maps
                    <ExternalLink
                      size={16}
                      className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DirectionModal;
