'use client';

import { MutableRefObject } from 'react';
import type { Marker as LeafletMarker } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export interface AgricultureZone {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  area_hectares: number;
  vegetation_health: number;
  soil_moisture: number;
  crop_stress_level: 'Low' | 'Medium' | 'High';
  yield_trend: number;
  rainfall_mm: number;
  temperature_c: number;
  lastUpdated: string;
  alerts: string[];
}

interface AgricultureMapProps {
  zones: AgricultureZone[];
  selectedZone: AgricultureZone | null;
  markerRefs: MutableRefObject<Record<string, LeafletMarker | null>>;
  onZoneSelect: (zoneId: string) => void;
}

const createAgricultureIcon = (health: number) => {
  const color =
    health >= 70 ? '#10b981' : // green
    health >= 50 ? '#f59e0b' : // yellow
    '#ef4444'; // red

  return L.divIcon({
    className: 'custom-agriculture-icon',
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      ">
        🌾
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const MapController = ({
  selectedZone,
  allZones,
  markerRefs,
}: {
  selectedZone: AgricultureZone | null;
  allZones: AgricultureZone[];
  markerRefs: MutableRefObject<Record<string, LeafletMarker | null>>;
}) => {
  const map = useMap();

  // Handle zone selection
  if (selectedZone) {
    map.flyTo([selectedZone.lat, selectedZone.lng], 6, {
      duration: 1.5,
    });
    const marker = markerRefs.current[selectedZone.id];
    if (marker) {
      marker.openPopup();
    }
  }

  // Fit bounds on initial load
  if (allZones.length > 0 && !selectedZone) {
    const bounds = L.latLngBounds(
      allZones.map((z) => [z.lat, z.lng])
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
  }

  return null;
};

export default function AgricultureMap({
  zones,
  selectedZone,
  markerRefs,
  onZoneSelect,
}: AgricultureMapProps) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
      className="rounded-xl z-0"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        selectedZone={selectedZone}
        allZones={zones}
        markerRefs={markerRefs}
      />

      {zones.map((zone) => (
        <Marker
          key={zone.id}
          position={[zone.lat, zone.lng]}
          icon={createAgricultureIcon(zone.vegetation_health)}
          ref={(ref) => {
            if (ref) {
              markerRefs.current[zone.id] = ref;
            }
          }}
          eventHandlers={{
            click: () => onZoneSelect(zone.id),
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-base mb-2">{zone.name}</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Location:</strong> {zone.location}
                </p>
                <p>
                  <strong>Health:</strong> {zone.vegetation_health}%
                </p>
                <p>
                  <strong>Soil Moisture:</strong> {zone.soil_moisture}%
                </p>
                <p>
                  <strong>Yield Trend:</strong> {zone.yield_trend >= 0 ? '+' : ''}
                  {zone.yield_trend}%
                </p>
              </div>
            </div>
          </Popup>

          {zone.vegetation_health < 50 && (
            <Circle
              center={[zone.lat, zone.lng]}
              radius={200000}
              pathOptions={{
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 0.1,
              }}
            />
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}
