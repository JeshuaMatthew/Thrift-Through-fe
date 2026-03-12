import React, { useState, useRef, useEffect } from 'react';
import Map, { NavigationControl, GeolocateControl, type MapRef, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import useSupercluster from 'use-supercluster';

import CommunityPins from './CommunityPins';
import ItemPins from './ItemPins';
import UserPin from './UserPin'; 
import { AnimatePresence } from 'framer-motion';
import PinDetailCard from './PinDetailCard';
import { ThriftService } from '../../Services/ThriftsServices';
import { CommunityService } from '../../Services/CommunitiesServices';

const formatToGeoJSON = (data: any[], type: 'community' | 'item') => {
  return data.map(point => ({
    type: "Feature" as const,
    properties: { 
      cluster: false, 
      id: point.id, 
      name: point.name, 
      type 
    },
    geometry: { 
      type: "Point" as const, 
      coordinates: [point.lng, point.lat] 
    }
  }));
};

const MapComponent: React.FC = () => {
  const mapRef = useRef<MapRef>(null);
  
  const [bounds, setBounds] = useState<[number, number, number, number] | undefined>(undefined);
  const [zoom, setZoom] = useState(13);
  
  const [userLocation, setUserLocation] = useState<{lng: number, lat: number} | null>(null);

  const [communities, setCommunities] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchCommunities = async () => {
      const communityService = new CommunityService();
      const comms = await communityService.getAllCommunities();
      const formatted = comms
        .filter(c => c.longitude !== undefined && c.latitude !== undefined)
        .map(c => ({
          id: c.communityid,
          name: c.communityname,
          lng: c.longitude as number,
          lat: c.latitude as number
        }));
      setCommunities(formatted);
    };

    fetchCommunities();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      const thriftService = new ThriftService();
      let fetchedItems;
      if (userLocation) {
        // Gunakan radius besar (misal: 99999) agar data dummy tidak terfilter jika lokasi asli user ternyata jauh dari Jakarta.
        fetchedItems = await thriftService.getAvailableThriftsInArea(userLocation.lat, userLocation.lng, 99999);
      } else {
        fetchedItems = await thriftService.getAvailableThriftsInArea(-6.1751, 106.8272, 99999);
      }
      const formatted = fetchedItems.map(i => ({
        id: i.itemid,
        name: i.itemname,
        lng: i.longitude,
        lat: i.latitude
      }));
      setItems(formatted);
    };

    fetchItems();
  }, [userLocation]);

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
            essential: true
          });
        },
        (error) => {
          console.warn("Gagal mengambil lokasi pengguna:", error.message);
        },
        { enableHighAccuracy: true }
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
        mapBounds.getNorth()
      ]);
      setZoom(mapRef.current.getMap().getZoom());
    }
  };

  const { clusters: communityClusters, supercluster: communitySupercluster } = useSupercluster({
    points: formatToGeoJSON(communities, 'community'),
    bounds,
    zoom,
    options: { radius: 50, maxZoom: 20 } 
  });

  const { clusters: itemClusters, supercluster: itemSupercluster } = useSupercluster({
    points: formatToGeoJSON(items, 'item'),
    bounds,
    zoom,
    options: { radius: 50, maxZoom: 20 }
  });

  const [selectedPin, setSelectedPin] = useState<{id: number; name: string; type: string} | null>(null);

  return (
    <div className="w-full h-screen rounded-xl overflow-hidden shadow-lg border border-gray-200 relative">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 106.8272, 
          latitude: -6.1751,   
          zoom: 12 
        }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        style={{ width: '100%', height: '100%' }}
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

        {/* --- RENDER COMMUNITY CLUSTERS --- */}
        {communityClusters.map((cluster) => {
          const [lng, lat] = cluster.geometry.coordinates;
          const isCluster = cluster.properties.cluster;
          const pointCount = (cluster.properties as any).point_count;
          const pinData = cluster.properties as any;

          if (isCluster) {
            return (
              <Marker key={`cluster-comm-${cluster.id}`} longitude={lng} latitude={lat} anchor="center">
                <div 
                  className="bg-blue-600 text-white flex items-center justify-center font-bold rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
                  style={{ width: `${10 + (pointCount / Math.max(communities.length, 1)) * 30}px`, height: `${10 + (pointCount / Math.max(communities.length, 1)) * 30}px`, minWidth: '35px', minHeight: '35px' }}
                  onClick={() => {
                    if (!communitySupercluster) return;
                    const expansionZoom = Math.min(communitySupercluster.getClusterExpansionZoom(cluster.id as number), 20);
                    mapRef.current?.flyTo({ center: [lng, lat], zoom: expansionZoom, duration: 500 });
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
                setSelectedPin({ id: pinData.id, name: pinData.name, type: 'community' });
                mapRef.current?.flyTo({ center: [lng, lat - 0.002], zoom: 15, duration: 800 }); 
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
        {itemClusters.map((cluster) => {
          const [lng, lat] = cluster.geometry.coordinates;
          const isCluster = cluster.properties.cluster;
          const pointCount = (cluster.properties as any).point_count;
          
          // PENAMBAHAN BARIS INI UNTUK MEMPERBAIKI ERROR
          const pinData = cluster.properties as any; 

          if (isCluster) {
            return (
              <Marker key={`cluster-item-${cluster.id}`} longitude={lng} latitude={lat} anchor="center">
                <div 
                  className="bg-orange-500 text-white flex items-center justify-center font-bold rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-orange-600 transition-colors"
                  style={{ width: `${10 + (pointCount / Math.max(items.length, 1)) * 30}px`, height: `${10 + (pointCount / Math.max(items.length, 1)) * 30}px`, minWidth: '35px', minHeight: '35px' }}
                  onClick={() => {
                    if (!itemSupercluster) return;
                    const expansionZoom = Math.min(itemSupercluster.getClusterExpansionZoom(cluster.id as number), 20);
                    mapRef.current?.flyTo({ center: [lng, lat], zoom: expansionZoom, duration: 500 });
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
                setSelectedPin({ id: pinData.id, name: pinData.name, type: 'item' });
                mapRef.current?.flyTo({ center: [lng, lat - 0.002], zoom: 15, duration: 800 });
              }}
            >
              <ItemPins 
                longitude={lng}
                latitude={lat}
                name={pinData.name}
              />
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
}

export default MapComponent;