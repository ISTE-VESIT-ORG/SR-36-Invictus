'use client';

import { MutableRefObject } from 'react';
import type { Marker as LeafletMarker } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Thermometer, Wind, Droplets, Snowflake } from 'lucide-react';

export interface ClimateMetric {
  id: string;
  region: string;
  location: string;
  lat: number;
  lng: number;
  temperature_anomaly_c: number;
  co2_ppm: number;
  sea_level_rise_mm: number;
  ice_mass_loss_gt: number;
  lastUpdated: string;
  alerts?: string[];
}

interface ClimateMapProps {
  metrics: ClimateMetric[];
  selectedMetric: ClimateMetric | null;
  markerRefs: MutableRefObject<Record<string, LeafletMarker | null>>;
  onMetricSelect: (metricId: string) => void;
}

const createClimateIcon = (tempAnomaly: number) => {
  const color =
    tempAnomaly >= 1.5 ? '#ef4444' : // red (critical warming)
    tempAnomaly >= 1.0 ? '#f59e0b' : // yellow (concerning)
    tempAnomaly >= 0.5 ? '#fbbf24' : // light yellow
    '#10b981'; // green (below average)

  return L.divIcon({
    className: 'custom-climate-icon',
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
        🌡️
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const MapController = ({
  selectedMetric,
  allMetrics,
  markerRefs,
}: {
  selectedMetric: ClimateMetric | null;
  allMetrics: ClimateMetric[];
  markerRefs: MutableRefObject<Record<string, LeafletMarker | null>>;
}) => {
  const map = useMap();

  // Handle metric selection
  if (selectedMetric) {
    map.flyTo([selectedMetric.lat, selectedMetric.lng], 4, {
      duration: 1.5,
    });
    const marker = markerRefs.current[selectedMetric.id];
    if (marker) {
      marker.openPopup();
    }
  }

  // Fit bounds on initial load
  if (allMetrics.length > 0 && !selectedMetric) {
    const bounds = L.latLngBounds(
      allMetrics
        .filter(m => Number.isFinite(m.lat) && Number.isFinite(m.lng))
        .map((m) => [m.lat, m.lng])
    );
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 4 });
    }
  }

  return null;
};

const MapLegend = () => (
  <div className="absolute bottom-6 left-6 bg-space-gray-900/95 backdrop-blur border border-space-gray-700 rounded-lg p-4 z-[1000] shadow-xl">
    <h4 className="text-sm font-bold text-star-white mb-2">Temperature Anomaly</h4>
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-red-500"></div>
        <span className="text-xs text-space-gray-300">≥ +1.5°C (Critical)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
        <span className="text-xs text-space-gray-300">+1.0°C - +1.5°C</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-yellow-300"></div>
        <span className="text-xs text-space-gray-300">+0.5°C - +1.0°C</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-green-500"></div>
        <span className="text-xs text-space-gray-300">&lt; +0.5°C</span>
      </div>
    </div>
  </div>
);

export default function ClimateMap({
  metrics,
  selectedMetric,
  markerRefs,
  onMetricSelect,
}: ClimateMapProps) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
      className="rounded-xl z-0"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <MapController
        selectedMetric={selectedMetric}
        allMetrics={metrics}
        markerRefs={markerRefs}
      />

      {metrics.map((metric) => {
        if (!Number.isFinite(metric.lat) || !Number.isFinite(metric.lng)) {
          return null;
        }

        return (
          <Marker
            key={metric.id}
            position={[metric.lat, metric.lng]}
            icon={createClimateIcon(metric.temperature_anomaly_c)}
            ref={(ref) => {
              if (ref) {
                markerRefs.current[metric.id] = ref;
              }
            }}
            eventHandlers={{
              click: () => onMetricSelect(metric.id),
            }}
          >
            <Popup>
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        metric.temperature_anomaly_c >= 1.5
                          ? '#ef4444'
                          : metric.temperature_anomaly_c >= 1.0
                          ? '#f59e0b'
                          : metric.temperature_anomaly_c >= 0.5
                          ? '#fbbf24'
                          : '#10b981',
                    }}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-space-gray-500">
                    {metric.location}
                  </span>
                </div>

                <h3 className="font-bold text-base mb-3">{metric.region}</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-4 h-4" />
                      <span>Temp Anomaly</span>
                    </div>
                    <span className="font-bold">+{metric.temperature_anomaly_c}°C</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Wind className="w-4 h-4" />
                      <span>CO₂</span>
                    </div>
                    <span className="font-medium">{metric.co2_ppm} ppm</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Droplets className="w-4 h-4" />
                      <span>Sea Level</span>
                    </div>
                    <span className="font-medium">+{metric.sea_level_rise_mm}mm</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Snowflake className="w-4 h-4" />
                      <span>Ice Loss</span>
                    </div>
                    <span className="font-medium">{metric.ice_mass_loss_gt}Gt</span>
                  </div>
                </div>

                {metric.alerts && metric.alerts.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800 mt-3">
                    <div className="font-bold mb-1">⚠️ Alerts</div>
                    {metric.alerts.map((alert, i) => (
                      <div key={i}>{alert}</div>
                    ))}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

      <MapLegend />
    </MapContainer>
  );
}
