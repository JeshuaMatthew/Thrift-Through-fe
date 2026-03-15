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
import { Filter } from "lucide-react";

import PinDetailCard from "../Components/PinDetailCard";
import CommunityPins from "../Components/CommunityPins";
import ItemPins from "../Components/ItemPins";
import UserPin from "../Components/UserPin";
import ItemDetailPopup from "../Components/ItemDetailPopup";
import { ThriftService, type Item } from "../../Services/ThriftsServices";
import { CommunityService } from "../../Services/CommunitiesServices";

const formatToGeoJSON = (data: any[], type: "community" | "item") => {
  return data.map((point) => ({
    type: "Feature" as const,
    properties: {
      cluster: false,
      id: point.id,
      name: point.name,
      type,
      transactionType: point.transactionType,
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
  const [isControlsVisible, setIsControlsVisible] = useState(true);

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
        transactionType: i.transaction_type,
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

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [aiInsights, setAIInsights] = useState<any>(null);
  const [isAILoading, setIsAILoading] = useState(false);

  const handleItemClick = async (id: number, lng: number, lat: number) => {
    setSelectedItem(null);
    setAIInsights(null);
    setIsAILoading(true);

    mapRef.current?.flyTo({
      center: [lng, lat - 0.002],
      zoom: 15,
      duration: 800,
    });

    const thriftService = new ThriftService();
    const item = await thriftService.getThriftDetailById(id);
    if (item) {
      setSelectedItem(item);
      // Mock AI Insights
      setTimeout(() => {
        setAIInsights({
          predictedMarketPrice: item.itemprice + item.itemprice * 0.1, // Dynamic mock logic
          carbonFootprintSavings: 2.5,
        });
        setIsAILoading(false);
      }, 1000);
    } else {
      setIsAILoading(false);
    }
  };

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
        <div
          className={`absolute bottom-4 left-4 z-10 bg-bg-clean/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-bg-vermillion/30 flex flex-col transition-all duration-300 overflow-hidden font-questrial ${
            isControlsVisible
              ? "w-80 p-6"
              : "w-12 h-12 p-0 justify-center items-center"
          }`}
        >
          {isControlsVisible ? (
            <>
              {/* Header with Close Button */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-gasoek font-normal tracking-wide text-tx-primary">
                  Pencarian
                </span>
                <button
                  onClick={() => setIsControlsVisible(false)}
                  className="p-1.5 rounded-lg hover:bg-bg-fresh text-tx-muted hover:text-bg-vermillion transition-all"
                >
                  <Filter size={18} />
                </button>
              </div>

              {/* Radius Control */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-gasoek font-normal tracking-wide text-tx-muted uppercase">
                    Radius (km)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="200"
                    step="0.1"
                    value={radius}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val) && val >= 0.1 && val <= 200)
                        setRadius(val);
                    }}
                    className="w-16 px-2 py-1.5 text-xs font-gasoek font-normal tracking-wide bg-bg-fresh border border-bg-fresh/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-bg-vermillion/50 transition-all"
                  />
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="200"
                  step="0.1"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full h-1.5 bg-bg-vermillion/20 rounded-lg appearance-none cursor-pointer accent-bg-vermillion"
                />
              </div>

              <hr className="border-bg-vermillion/10 my-1" />

              {/* Visibility Toggles */}
              <div className="flex flex-col gap-4">
                <label className="text-xs font-gasoek font-normal tracking-wide text-tx-muted uppercase flex items-center gap-2">
                  Tampilkan:
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={showCommunities}
                      onChange={() => setShowCommunities(!showCommunities)}
                      className="w-5 h-5 accent-bg-vermillion bg-bg-fresh border-bg-fresh/50 rounded-lg cursor-pointer transition-all"
                    />
                    <span className="text-sm font-medium text-tx-secondary group-hover:text-tx-primary transition-colors">
                      Komunitas
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={showItems}
                      onChange={() => setShowItems(!showItems)}
                      className="w-5 h-5 accent-bg-vermillion bg-bg-fresh border-bg-fresh/50 rounded-lg cursor-pointer transition-all"
                    />
                    <span className="text-sm font-medium text-tx-secondary group-hover:text-tx-primary transition-colors">
                      Barang Penjual
                    </span>
                  </label>
                </div>
                <div className="flex items-center gap-3 mt-2 pt-3 border-t border-bg-vermillion/5">
                  <button
                    className="text-[11px] font-gasoek font-normal tracking-wide text-bg-vermillion hover:bg-bg-vermillion/10 px-2 py-1 rounded-md transition-all disabled:text-gray-400 disabled:no-underline cursor-pointer uppercase"
                    onClick={() => {
                      setShowCommunities(true);
                      setShowItems(true);
                    }}
                    disabled={showCommunities && showItems}
                  >
                    Semua
                  </button>
                  <span className="text-bg-vermillion/20 font-light">|</span>
                  <button
                    className="text-[11px] font-gasoek font-normal tracking-wide text-tx-muted hover:bg-tx-muted/10 px-2 py-1 rounded-md transition-all disabled:opacity-30 cursor-pointer uppercase"
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
            </>
          ) : (
            <button
              onClick={() => setIsControlsVisible(true)}
              className="w-full h-full flex items-center justify-center text-bg-vermillion hover:bg-bg-fresh transition-all"
              title="Tampilkan Filter"
            >
              <Filter size={20} />
            </button>
          )}
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
              "line-color": "#eb503c",
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
                    className="bg-bg-vermillion text-white flex items-center justify-center font-gasoek font-normal tracking-wide rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-bg-vermillion/90 transition-colors"
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
                    className="bg-bg-fresh text-tx-primary flex items-center justify-center font-gasoek font-normal tracking-wide rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-bg-fresh/90 transition-colors"
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
                  handleItemClick(pinData.id, lng, lat);
                }}
              >
                <ItemPins longitude={lng} latitude={lat} name={pinData.name} transactionType={pinData.transactionType} />
              </div>
            );
          })}
      </Map>

      {/* RENDER PIN DETAIL CARD (For Communities) */}
      <AnimatePresence>
        {selectedPin && (
          <PinDetailCard
            pin={selectedPin}
            onClose={() => setSelectedPin(null)}
          />
        )}
      </AnimatePresence>

      <ItemDetailPopup
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
        aiInsights={aiInsights}
        isAILoading={isAILoading}
      />
    </div>
  );
};

export default MapPage;
