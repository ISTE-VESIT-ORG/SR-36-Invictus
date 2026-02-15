'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';
import type { Marker as LeafletMarker } from 'leaflet';
import dynamic from 'next/dynamic';
import {
  Sprout,
  MapPin,
  Search,
  TrendingUp,
  TrendingDown,
  Droplets,
  ThermometerSun,
  AlertCircle,
  BarChart,
  Clock,
} from 'lucide-react';

// Lazy-load the map component (Leaflet doesn't work with SSR)
const AgricultureMap = dynamic(() => import('./AgricultureMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-space-gray-900 text-space-gray-400 animate-pulse">
      Loading agriculture map...
    </div>
  ),
});

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

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

export interface AgricultureSummary {
  totalAreaAcres: number;
  avgVegetationHealth: number;
  avgSoilMoisture: number;
  yieldTrendPercent: number;
  activeZones: number;
  lastUpdated?: string; // ISO timestamp
  cacheAgeHours?: number; // Hours since last update
}

interface AgricultureClientProps {
  initialZones: AgricultureZone[];
  summary: AgricultureSummary;
}

// ----------------------------------------------------------------------
// CITY TO REGION MAPPING
// ----------------------------------------------------------------------

const CITY_TO_REGION_MAP: Record<string, string> = {
  // India
  'mumbai': 'Indo-Gangetic Plain',
  'delhi': 'Indo-Gangetic Plain',
  'new delhi': 'Indo-Gangetic Plain',
  'kolkata': 'Indo-Gangetic Plain',
  'bangalore': 'Indo-Gangetic Plain',
  'chennai': 'Indo-Gangetic Plain',
  'hyderabad': 'Indo-Gangetic Plain',
  'pune': 'Indo-Gangetic Plain',
  
  // USA
  'chicago': 'US Midwest',
  'des moines': 'US Midwest',
  'indianapolis': 'US Midwest',
  'kansas city': 'US Midwest',
  'omaha': 'US Midwest',
  'milwaukee': 'US Midwest',
  'minneapolis': 'US Midwest',
  
  // Argentina
  'buenos aires': 'Pampas',
  'rosario': 'Pampas',
  'cordoba': 'Pampas',
  
  // China
  'beijing': 'North China Plain',
  'shanghai': 'North China Plain',
  'tianjin': 'North China Plain',
  
  // Brazil
  'sao paulo': 'Cerrado',
  'brasilia': 'Cerrado',
  'goiania': 'Cerrado',
  
  // Australia
  'sydney': 'Murray-Darling Basin',
  'melbourne': 'Murray-Darling Basin',
  'adelaide': 'Murray-Darling Basin',
  
  // Europe
  'paris': 'European Plains',
  'berlin': 'European Plains',
  'amsterdam': 'European Plains',
  'brussels': 'European Plains',
};

// ----------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------

// Format cache age for display
const formatCacheAge = (hours?: number): string => {
  if (hours === undefined) return '';
  if (hours < 0.1) return 'Updated just now';
  if (hours < 1) return `Updated ${Math.round(hours * 60)} minutes ago`;
  if (hours < 2) return 'Updated 1 hour ago';
  return `Updated ${Math.round(hours)} hours ago`;
};

// Format acres to readable string (matches Impact card formatting)
const formatAreaInAcres = (acres: number): string => {
  if (acres >= 1_000_000_000) {
    return `${(acres / 1_000_000_000).toFixed(1)}B`;
  } else if (acres >= 1_000_000) {
    return `${(acres / 1_000_000).toFixed(0)}M`;
  } else if (acres >= 1_000) {
    return `${(acres / 1_000).toFixed(1)}K`;
  }
  return acres.toLocaleString();
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

export default function AgricultureClient({
  initialZones,
  summary,
}: AgricultureClientProps) {
  const [zones, setZones] = useState<AgricultureZone[]>(initialZones);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const markerRefs = useRef<Record<string, LeafletMarker | null>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter zones by search with smart city-to-region mapping
  const filteredZones = useMemo(() => {
    if (!searchTerm) {
      return zones;
    }

    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    // Check if search term is a city name
    const mappedRegion = CITY_TO_REGION_MAP[normalizedSearch];
    
    if (mappedRegion) {
      // City found - map to agriculture region
      return zones.filter(
        (z) =>
          z.name.toLowerCase().includes(mappedRegion.toLowerCase()) ||
          z.location.toLowerCase().includes(mappedRegion.toLowerCase())
      );
    }
    
    // Normal search - filter by zone name or location
    return zones.filter(
      (z) =>
        z.name.toLowerCase().includes(normalizedSearch) ||
        z.location.toLowerCase().includes(normalizedSearch)
    );
  }, [zones, searchTerm]);

  // Check if current search is a city search
  const isCityMapping = useMemo(() => {
    if (!searchTerm) return false;
    const normalizedSearch = searchTerm.toLowerCase().trim();
    return CITY_TO_REGION_MAP[normalizedSearch] !== undefined;
  }, [searchTerm]);

  const selectedZone = useMemo(
    () => filteredZones.find((z) => z.id === selectedZoneId) || null,
    [filteredZones, selectedZoneId]
  );

  // Use the shared summary data (no recomputation - matches Impact card)
  const stats = {
    totalArea: formatAreaInAcres(summary.totalAreaAcres),
    avgHealth: summary.avgVegetationHealth,
    avgMoisture: summary.avgSoilMoisture,
    avgYieldChange: summary.yieldTrendPercent,
  };

  const hasZones = initialZones.length > 0;

  return (
    <div className="min-h-screen bg-space-black pt-24 pb-8 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 w-full flex-grow flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-2">
              Agriculture Monitoring
            </h1>
            <p className="text-space-gray-300 max-w-2xl">
              Real-time crop health and climate insights powered by NASA POWER
              API
            </p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-3xl font-bold text-aurora-green font-mono">
              {filteredZones.length}
            </div>
            <div className="text-sm text-space-gray-400 uppercase tracking-widest">
              Active Zones
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-space-gray-900/80 backdrop-blur-md rounded-xl p-4 border border-space-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="w-5 h-5 text-cosmic-purple" />
              <span className="text-xs text-space-gray-400 uppercase tracking-wider">
                Total Area
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.totalArea}
            </div>
            <div className="text-xs text-space-gray-500">acres monitored</div>
          </div>

          <div className="bg-space-gray-900/80 backdrop-blur-md rounded-xl p-4 border border-space-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="w-5 h-5 text-aurora-green" />
              <span className="text-xs text-space-gray-400 uppercase tracking-wider">
                Vegetation Health
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.avgHealth}%
            </div>
            <div className="text-xs text-space-gray-500">avg across zones</div>
          </div>

          <div className="bg-space-gray-900/80 backdrop-blur-md rounded-xl p-4 border border-space-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-galaxy-cyan" />
              <span className="text-xs text-space-gray-400 uppercase tracking-wider">
                Soil Moisture
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.avgMoisture}%
            </div>
            <div className="text-xs text-space-gray-500">avg saturation</div>
          </div>

          <div className="bg-space-gray-900/80 backdrop-blur-md rounded-xl p-4 border border-space-gray-700">
            <div className="flex items-center gap-2 mb-2">
              {stats.avgYieldChange >= 0 ? (
                <TrendingUp className="w-5 h-5 text-aurora-green" />
              ) : (
                <TrendingDown className="w-5 h-5 text-meteor-orange" />
              )}
              <span className="text-xs text-space-gray-400 uppercase tracking-wider">
                Yield Trend
              </span>
            </div>
            <div
              className={`text-2xl font-bold ${
                stats.avgYieldChange >= 0
                  ? 'text-aurora-green'
                  : 'text-meteor-orange'
              }`}
            >
              {stats.avgYieldChange >= 0 ? '+' : ''}
              {stats.avgYieldChange}%
            </div>
            <div className="text-xs text-space-gray-500">projected change</div>
          </div>
        </div>

        {/* Cache Age Display */}
        {summary.cacheAgeHours !== undefined && (
          <div className="flex items-center justify-center gap-2 text-xs text-space-gray-400 mb-4">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatCacheAge(summary.cacheAgeHours)}</span>
            <span className="text-space-gray-600">•</span>
            <span className="text-space-gray-500">Data refreshes every 6 hours</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-space-gray-900/80 backdrop-blur-md rounded-xl p-4 mb-6 border border-space-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-space-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search zones or cities (e.g., Mumbai, Chicago)..."
              className="w-full bg-space-black/50 border border-space-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cosmic-purple transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Helper message */}
          <div className="flex items-start gap-2 mt-3 text-xs text-space-gray-400">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p>City searches are mapped to the nearest agricultural region</p>
          </div>
        </div>

        {/* Main Grid: Timeline + Map */}
        <div className="grid lg:grid-cols-3 gap-6 flex-grow mb-6">
          {/* Zone Timeline */}
          <div className="lg:col-span-1 bg-space-gray-900/50 backdrop-blur-sm rounded-xl border border-space-gray-700 overflow-hidden flex flex-col h-[600px] lg:h-auto">
            <div className="p-4 border-b border-space-gray-700 font-bold text-white flex items-center justify-between">
              <div className="flex items-center">
                <Sprout className="w-5 h-5 mr-2 text-aurora-green" />
                {isCityMapping ? 'Nearest Agriculture Zone' : 'Agriculture Zones'}
              </div>
              <span className="text-xs text-space-gray-500 bg-space-gray-800 px-2 py-1 rounded">
                {filteredZones.length} Active
              </span>
            </div>

            <div className="overflow-y-auto flex-grow p-2 space-y-2 custom-scrollbar">
              {!hasZones ? (
                <div className="p-8 text-center text-space-gray-500 flex flex-col items-center justify-center h-full">
                  <Sprout className="w-8 h-8 mb-4 opacity-50" />
                  <p>Unable to load agriculture zone data.</p>
                </div>
              ) : filteredZones.length === 0 ? (
                <div className="p-8 text-center text-space-gray-500 flex flex-col items-center justify-center h-full">
                  <Search className="w-8 h-8 mb-4 opacity-50" />
                  {isCityMapping ? (
                    <>
                      <p className="mb-2">No agricultural zones found near this city.</p>
                      <p className="text-xs text-space-gray-600 mb-4">City-level data is approximated using nearest agricultural region</p>
                    </>
                  ) : (
                    <p>No zones found matching your search.</p>
                  )}
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-cosmic-purple hover:underline text-sm"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                filteredZones.map((zone) => (
                  <div
                    key={zone.id}
                    onClick={() => setSelectedZoneId(zone.id)}
                    className={`cursor-pointer block p-4 rounded-lg border transition-all group relative overflow-hidden mb-2 last:mb-0 ${
                      selectedZoneId === zone.id
                        ? 'bg-space-gray-800 border-cosmic-purple shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                        : 'bg-space-black/40 border-space-gray-800 hover:border-space-gray-600 hover:bg-space-gray-800/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full border ${
                          zone.vegetation_health >= 70
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : zone.vegetation_health >= 50
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}
                      >
                        Health: {zone.vegetation_health}%
                      </span>
                      <span className="text-xs text-space-gray-500">
                        {zone.location}
                      </span>
                    </div>

                    <h3
                      className={`font-bold mb-2 transition-colors line-clamp-1 text-sm ${
                        selectedZoneId === zone.id
                          ? 'text-white'
                          : 'text-space-gray-200 group-hover:text-white'
                      }`}
                    >
                      {zone.name}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 text-xs text-space-gray-400 mb-2">
                      <div className="flex items-center">
                        <Droplets className="w-3 h-3 mr-1" />
                        {zone.soil_moisture}% moisture
                      </div>
                      <div className="flex items-center">
                        <ThermometerSun className="w-3 h-3 mr-1" />
                        {zone.temperature_c}°C
                      </div>
                    </div>

                    {zone.alerts.length > 0 && (
                      <div className="flex items-center text-xs text-meteor-orange">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {zone.alerts.length} alert(s)
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Leaflet Map */}
          <div className="lg:col-span-2 bg-space-gray-900 rounded-xl overflow-hidden border border-space-gray-700 relative min-h-[600px] z-0">
            {mounted && hasZones && (
              <AgricultureMap
                zones={filteredZones}
                selectedZone={selectedZone}
                markerRefs={markerRefs}
                onZoneSelect={(zoneId) => setSelectedZoneId(zoneId)}
              />
            )}
            {!hasZones && (
              <div className="w-full h-full min-h-[600px] flex items-center justify-center text-space-gray-400 text-sm">
                Unable to load agriculture zone data.
              </div>
            )}
          </div>
        </div>

        {/* Insights Panel */}
        <div className="bg-gradient-to-br from-space-gray-900 to-space-gray-800 rounded-xl p-6 border border-space-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <BarChart className="w-6 h-6 text-cosmic-purple" />
            <h2 className="text-2xl font-bold text-white font-display">
              Agricultural Insights
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-space-black/40 rounded-lg p-4 border border-space-gray-700">
              <h3 className="text-sm font-bold text-aurora-green mb-2">
                ✓ Healthy Regions
              </h3>
              <p className="text-xs text-space-gray-300">
                {zones.filter((z) => z.vegetation_health >= 70).length} zones
                show strong vegetation health above 70%. Continue monitoring
                soil moisture levels.
              </p>
            </div>

            <div className="bg-space-black/40 rounded-lg p-4 border border-space-gray-700">
              <h3 className="text-sm font-bold text-meteor-orange mb-2">
                ⚠️ At-Risk Areas
              </h3>
              <p className="text-xs text-space-gray-300">
                {zones.filter((z) => z.crop_stress_level === 'High').length}{' '}
                zones experiencing high crop stress due to temperature extremes
                or water deficit.
              </p>
            </div>

            <div className="bg-space-black/40 rounded-lg p-4 border border-space-gray-700">
              <h3 className="text-sm font-bold text-galaxy-cyan mb-2">
                📊 Yield Outlook
              </h3>
              <p className="text-xs text-space-gray-300">
                Overall yield trend{' '}
                {stats.avgYieldChange >= 0
                  ? 'positive'
                  : 'negative'}{' '}
                at {stats.avgYieldChange}%. Monitor rainfall patterns in coming
                weeks.
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg">
            <p className="text-xs text-space-gray-300">
              <strong className="text-white">Data Source:</strong> NASA POWER
              API provides daily meteorological data from satellite
              observations. Vegetation health and yield trends are derived from
              precipitation, temperature, and soil moisture indicators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
