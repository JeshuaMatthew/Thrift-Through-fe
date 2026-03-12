import React, { useState, useRef, useEffect, useMemo } from "react";
import Map, {
  NavigationControl,
  GeolocateControl,
  type MapRef,
  Marker,
  Source,
  Layer,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import useSupercluster from "use-supercluster";
import { AnimatePresence } from "framer-motion";
import { UsersRound, ShoppingBasket, Filter } from "lucide-react";

import PinDetailCard from "../Components/PinDetailCard";
import { ThriftService } from "../../Services/ThriftsServices";
import { CommunityService } from "../../Services/CommunitiesServices";

// ==========================================
// 1. PIN COMPONENTS
// ==========================================

interface CommunityPinsProps {
  longitude: number;
  latitude: number;
  name?: string;
}

const CommunityPins: React.FC<CommunityPinsProps> = ({
  longitude,
  latitude,
  name,
}) => {
  return (
    <Marker longitude={longitude} latitude={latitude} anchor="center">
      <div className="bg-blue-600 p-2 rounded-full shadow-lg border-2 border-white cursor-pointer hover:scale-110 hover:bg-blue-700 transition-all group relative">
        <UsersRound size={20} className="text-white" />

        {name && (
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {name}
          </span>
        )}
      </div>
    </Marker>
  );
};

interface ItemPinsProps {
  longitude: number;
  latitude: number;
  name?: string;
}

const ItemPins: React.FC<ItemPinsProps> = ({ longitude, latitude, name }) => {
  return (
    <Marker longitude={longitude} latitude={latitude} anchor="center">
      <div className="bg-orange-500 p-2 rounded-full shadow-lg border-2 border-white cursor-pointer hover:scale-110 hover:bg-orange-600 transition-all group relative">
        <ShoppingBasket size={20} className="text-white" />

        {name && (
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {name}
          </span>
        )}
      </div>
    </Marker>
  );
};

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

// ==========================================
// 2. MAIN MAP PAGE
// ==========================================

const formatToGeoJSON = (data: any[], type: "community" | "item") => {
  return data.map((point) => ({
    type: "Feature" as const,
    properties: {
      cluster: false,
      id: point.id,
      name: point.name,
      type,
    },
    geometry: {
      type: "Point" as const,
      coordinates: [point.lng, point.lat],
    },
  }));
};

const MapPage: React.FC = () => {
  const mapRef = useRef<MapRef>(null);

  const [bounds, setBounds] = useState<
    [number, number, number, number] | undefined
  >(undefined);
  const [zoom, setZoom] = useState(13);

  const [userLocation, setUserLocation] = useState<{
    lng: number;
    lat: number;
  } | null>(null);

  const [communities, setCommunities] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [radius, setRadius] = useState<number>(30); // in kilometers

  const [showCommunities, setShowCommunities] = useState<boolean>(true);
  const [showItems, setShowItems] = useState<boolean>(true);

  useEffect(() => {
    const fetchCommunities = async () => {
      const communityService = new CommunityService();
      let comms;

      if (userLocation) {
        comms = await communityService.getCommunitiesInArea(
          userLocation.lat,
          userLocation.lng,
          radius,
        );
      } else {
        comms = await communityService.getCommunitiesInArea(
          -6.7984,
          107.5714,
          radius,
        );
      }

      const formatted = comms.map((c) => ({
        id: c.communityid,
        name: c.communityname,
        lng: c.longitude as number,
        lat: c.latitude as number,
      }));
      setCommunities(formatted);
    };

    fetchCommunities();
  }, [userLocation, radius]);

  useEffect(() => {
    const fetchItems = async () => {
      const thriftService = new ThriftService();
      let fetchedItems;
      if (userLocation) {
        fetchedItems = await thriftService.getAvailableThriftsInArea(
          userLocation.lat,
          userLocation.lng,
          radius,
        );
      } else {
        fetchedItems = await thriftService.getAvailableThriftsInArea(
          -6.7984,
          107.5714,
          radius,
        );
      }
      const formatted = fetchedItems.map((i) => ({
        id: i.itemid,
        name: i.itemname,
        lng: i.longitude,
        lat: i.latitude,
      }));
      setItems(formatted);
    };

    fetchItems();
  }, [userLocation, radius]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation({ lng: longitude, lat: latitude });
          mapRef.current?.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            duration: 2000,
            essential: true,
          });
        },
        (error) => {
          console.warn("Gagal mengambil lokasi pengguna:", error.message);
        },
        { enableHighAccuracy: true },
      );
    }
  }, []);

  const updateMapState = () => {
    if (mapRef.current) {
      const mapBounds = mapRef.current.getMap().getBounds();
      setBounds([
        mapBounds.getWest(),
        mapBounds.getSouth(),
        mapBounds.getEast(),
        mapBounds.getNorth(),
      ]);
      setZoom(mapRef.current.getMap().getZoom());
    }
  };

  const { clusters: communityClusters, supercluster: communitySupercluster } =
    useSupercluster({
      points: formatToGeoJSON(communities, "community"),
      bounds,
      zoom,
      options: { radius: 50, maxZoom: 20 },
    });

  const { clusters: itemClusters, supercluster: itemSupercluster } =
    useSupercluster({
      points: formatToGeoJSON(items, "item"),
      bounds,
      zoom,
      options: { radius: 50, maxZoom: 20 },
    });

  const [selectedPin, setSelectedPin] = useState<{
    id: number;
    name: string;
    type: string;
  } | null>(null);

  const maskGeoJSON = useMemo(() => {
    const centerLat = userLocation?.lat ?? -6.7984;
    const centerLng = userLocation?.lng ?? 107.5714;

    const distanceX = radius / (111.32 * Math.cos(centerLat * (Math.PI / 180)));
    const distanceY = radius / 111.32;

    const points = 64;
    const coords: number[][] = [];
    for (let i = 0; i < points; i++) {
      const theta = -(i / points) * (2 * Math.PI);
      const lng = centerLng + distanceX * Math.cos(theta);
      const lat = centerLat + distanceY * Math.sin(theta);
      coords.push([lng, lat]);
    }
    coords.push(coords[0]); // close the inner ring

    const exterior = [
      [-180, -90],
      [180, -90],
      [180, 90],
      [-180, 90],
      [-180, -90],
    ];

    return {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          geometry: {
            type: "Polygon" as const,
            coordinates: [exterior, coords],
          },
          properties: {},
        },
      ],
    };
  }, [userLocation, radius]);

  return (
    <div className="w-full h-screen rounded-xl overflow-hidden shadow-lg border border-gray-200 relative">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 107.5714,
          latitude: -6.7984,
          zoom: 12,
        }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        style={{ width: "100%", height: "100%" }}
        onLoad={updateMapState}
        onMove={updateMapState}
      >
        <GeolocateControl
          position="top-right"
          trackUserLocation={true}
          showUserLocation={false}
        />

        <NavigationControl position="top-right" />

        {userLocation && (
          <UserPin longitude={userLocation.lng} latitude={userLocation.lat} />
        )}

        {/* --- CONTROLS OVERLAY --- */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-md border border-gray-200 flex flex-col gap-4 w-72">
          {/* Radius Control */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700">
                Radius Pencarian (km)
              </label>
              <input
                type="number"
                min="0.1"
                max="200"
                step="0.1"
                value={radius}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!isNaN(val) && val >= 0.1 && val <= 200) setRadius(val);
                }}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <input
              type="range"
              min="0.1"
              max="200"
              step="0.1"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <hr className="border-gray-200" />

          {/* Visibility Toggles */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Filter size={16} /> Tampilkan:
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCommunities}
                onChange={() => setShowCommunities(!showCommunities)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-gray-700">Komunitas</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showItems}
                onChange={() => setShowItems(!showItems)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-gray-700">Barang Penjual</span>
            </label>
            <div className="flex items-center gap-2 mt-1">
              <button
                className="text-xs text-blue-600 hover:text-blue-800 underline disabled:text-gray-400 disabled:no-underline cursor-pointer"
                onClick={() => {
                  setShowCommunities(true);
                  setShowItems(true);
                }}
                disabled={showCommunities && showItems}
              >
                Semua
              </button>
              <span className="text-gray-300">|</span>
              <button
                className="text-xs text-red-600 hover:text-red-800 underline disabled:text-gray-400 disabled:no-underline cursor-pointer"
                onClick={() => {
                  setShowCommunities(false);
                  setShowItems(false);
                }}
                disabled={!showCommunities && !showItems}
              >
                Sembunyikan
              </button>
            </div>
          </div>
        </div>

        {/* --- RADIUS MASK OVERLAY --- */}
        <Source id="mask" type="geojson" data={maskGeoJSON}>
          <Layer
            id="mask-layer"
            type="fill"
            paint={{
              "fill-color": "#0F172A",
              "fill-opacity": 0.5,
            }}
          />
          <Layer
            id="mask-outline-layer"
            type="line"
            paint={{
              "line-color": "#3b82f6",
              "line-width": 2,
              "line-dasharray": [4, 4],
            }}
          />
        </Source>

        {/* --- RENDER COMMUNITY CLUSTERS --- */}
        {showCommunities &&
          communityClusters.map((cluster) => {
            const [lng, lat] = cluster.geometry.coordinates;
            const isCluster = cluster.properties.cluster;
            const pointCount = (cluster.properties as any).point_count;
            const pinData = cluster.properties as any;

            if (isCluster) {
              return (
                <Marker
                  key={`cluster-comm-${cluster.id}`}
                  longitude={lng}
                  latitude={lat}
                  anchor="center"
                >
                  <div
                    className="bg-blue-600 text-white flex items-center justify-center font-bold rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
                    style={{
                      width: `${10 + (pointCount / Math.max(communities.length, 1)) * 30}px`,
                      height: `${10 + (pointCount / Math.max(communities.length, 1)) * 30}px`,
                      minWidth: "35px",
                      minHeight: "35px",
                    }}
                    onClick={() => {
                      if (!communitySupercluster) return;
                      const expansionZoom = Math.min(
                        communitySupercluster.getClusterExpansionZoom(
                          cluster.id as number,
                        ),
                        20,
                      );
                      mapRef.current?.flyTo({
                        center: [lng, lat],
                        zoom: expansionZoom,
                        duration: 500,
                      });
                    }}
                  >
                    {pointCount}
                  </div>
                </Marker>
              );
            }

            return (
              <div
                key={`comm-wrapper-${pinData.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPin({
                    id: pinData.id,
                    name: pinData.name,
                    type: "community",
                  });
                  mapRef.current?.flyTo({
                    center: [lng, lat - 0.002],
                    zoom: 15,
                    duration: 800,
                  });
                }}
              >
                <CommunityPins
                  longitude={lng}
                  latitude={lat}
                  name={pinData.name}
                />
              </div>
            );
          })}

        {/* --- RENDER ITEM CLUSTERS --- */}
        {showItems &&
          itemClusters.map((cluster) => {
            const [lng, lat] = cluster.geometry.coordinates;
            const isCluster = cluster.properties.cluster;
            const pointCount = (cluster.properties as any).point_count;

            const pinData = cluster.properties as any;

            if (isCluster) {
              return (
                <Marker
                  key={`cluster-item-${cluster.id}`}
                  longitude={lng}
                  latitude={lat}
                  anchor="center"
                >
                  <div
                    className="bg-orange-500 text-white flex items-center justify-center font-bold rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-orange-600 transition-colors"
                    style={{
                      width: `${10 + (pointCount / Math.max(items.length, 1)) * 30}px`,
                      height: `${10 + (pointCount / Math.max(items.length, 1)) * 30}px`,
                      minWidth: "35px",
                      minHeight: "35px",
                    }}
                    onClick={() => {
                      if (!itemSupercluster) return;
                      const expansionZoom = Math.min(
                        itemSupercluster.getClusterExpansionZoom(
                          cluster.id as number,
                        ),
                        20,
                      );
                      mapRef.current?.flyTo({
                        center: [lng, lat],
                        zoom: expansionZoom,
                        duration: 500,
                      });
                    }}
                  >
                    {pointCount}
                  </div>
                </Marker>
              );
            }

            return (
              <div
                key={`item-wrapper-${pinData.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPin({
                    id: pinData.id,
                    name: pinData.name,
                    type: "item",
                  });
                  mapRef.current?.flyTo({
                    center: [lng, lat - 0.002],
                    zoom: 15,
                    duration: 800,
                  });
                }}
              >
                <ItemPins longitude={lng} latitude={lat} name={pinData.name} />
              </div>
            );
          })}
      </Map>

      {/* RENDER PIN DETAIL CARD */}
      <AnimatePresence>
        {selectedPin && (
          <PinDetailCard
            pin={selectedPin}
            onClose={() => setSelectedPin(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapPage;
