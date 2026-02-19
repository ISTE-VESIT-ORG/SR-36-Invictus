'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';
import type { Marker as LeafletMarker } from 'leaflet';
import dynamic from 'next/dynamic';
import {
  Thermometer,
  MapPin,
  Search,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Droplets,
  Snowflake,
  Wind,
  BarChart,
  Clock,
} from 'lucide-react';

// Lazy-load the map component (Leaflet doesn't work with SSR)
const ClimateMap = dynamic(() => import('./ClimateMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-space-gray-900 text-space-gray-400 animate-pulse">
      Loading climate map...
    </div>
  ),
});

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

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
  alerts?: string[]; // Optional alerts array
}

interface ClimateSummary {
  avgTemperatureAnomaly: number;
  avgCO2: number;
  avgSeaLevelRise: number;
  avgIceLoss: number;
  totalRegions: number;
  lastUpdated?: string; // ISO timestamp
  cacheAgeHours?: number; // Hours since last update
}

interface ClimateClientProps {
  initialMetrics: ClimateMetric[];
  historicalData: ClimateMetric[];
  summary: ClimateSummary;
}

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

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

export default function ClimateClient({
  initialMetrics,
  historicalData,
  summary,
}: ClimateClientProps) {
  // Normalize metrics to ensure alerts is always an array
  const normalizedMetrics = initialMetrics.map(metric => ({
    ...metric,
    alerts: metric.alerts ?? [],
  }));

  const [metrics, setMetrics] = useState<ClimateMetric[]>(normalizedMetrics);
  const [selectedMetric, setSelectedMetric] = useState<ClimateMetric | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);

  const markerRefs = useRef<Record<string, LeafletMarker | null>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use cached summary from backend (same data as Impact card)
  const globalStats = useMemo(() => ({
    avgTempAnomaly: summary.avgTemperatureAnomaly,
    avgCO2: summary.avgCO2,
    avgSeaLevel: summary.avgSeaLevelRise,
    avgIceLoss: summary.avgIceLoss,
  }), [summary]);

  // Filter metrics by search
  const filteredMetrics = useMemo(() => {
    if (!searchTerm) return metrics;
    const lower = searchTerm.toLowerCase();
    return metrics.filter(
      (m) =>
        m.region.toLowerCase().includes(lower) ||
        m.location.toLowerCase().includes(lower)
    );
  }, [metrics, searchTerm]);

  // Sort metrics by temperature anomaly (highest first)
  const sortedMetrics = useMemo(() => {
    return [...filteredMetrics].sort(
      (a, b) => b.temperature_anomaly_c - a.temperature_anomaly_c
    );
  }, [filteredMetrics]);

  // Historical trend data (last 5 years)
  const trendData = useMemo(() => {
    if (historicalData.length === 0) return [];
    
    // Group by year
    const byYear = historicalData.reduce((acc, item) => {
      const year = new Date(item.lastUpdated).getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(item);
      return acc;
    }, {} as Record<number, ClimateMetric[]>);

    // Calculate yearly averages
    return Object.entries(byYear)
      .map(([year, items]) => ({
        year: parseInt(year),
        avgTemp: +(items.reduce((s, i) => s + i.temperature_anomaly_c, 0) / items.length).toFixed(2),
        avgCO2: Math.round(items.reduce((s, i) => s + i.co2_ppm, 0) / items.length),
      }))
      .sort((a, b) => a.year - b.year);
  }, [historicalData]);

  return (
    <div className="min-h-screen bg-space-black pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-meteor-orange/10 text-meteor-orange">
              <Thermometer className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-star-white font-display">
              Climate Change Monitoring
            </h1>
          </div>
          <p className="text-space-gray-300 text-lg max-w-3xl">
            Tracking global temperature anomalies, greenhouse gas concentrations, sea level rise, and ice mass loss across major regions using satellite observations and climate models.
          </p>
        </div>

        {/* Global Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Temperature Anomaly */}
          <div className="bg-space-gray-900 border border-space-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Thermometer className="w-6 h-6 text-meteor-orange" />
              {globalStats.avgTempAnomaly >= 1.0 ? (
                <TrendingUp className="w-5 h-5 text-red-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-yellow-500" />
              )}
            </div>
            <p className="text-3xl font-bold text-star-white mb-1">
              +{globalStats.avgTempAnomaly}°C
            </p>
            <p className="text-sm text-space-gray-400">Avg Temperature Anomaly</p>
          </div>

          {/* CO2 Concentration */}
          <div className="bg-space-gray-900 border border-space-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Wind className="w-6 h-6 text-galaxy-cyan" />
              <TrendingUp className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-star-white mb-1">
              {globalStats.avgCO2} ppm
            </p>
            <p className="text-sm text-space-gray-400">Atmospheric CO₂</p>
          </div>

          {/* Sea Level Rise */}
          <div className="bg-space-gray-900 border border-space-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Droplets className="w-6 h-6 text-aurora-green" />
              <TrendingUp className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-star-white mb-1">
              +{globalStats.avgSeaLevel}mm
            </p>
            <p className="text-sm text-space-gray-400">Sea Level Rise</p>
          </div>

          {/* Ice Mass Loss */}
          <div className="bg-space-gray-900 border border-space-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Snowflake className="w-6 h-6 text-cosmic-purple" />
              <TrendingUp className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-star-white mb-1">
              {globalStats.avgIceLoss}Gt
            </p>
            <p className="text-sm text-space-gray-400">Ice Mass Loss (Annual)</p>
          </div>
        </div>

        {/* Cache Age Display */}
        {summary.cacheAgeHours !== undefined && (
          <div className="flex items-center justify-center gap-2 text-xs text-space-gray-400 my-6">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatCacheAge(summary.cacheAgeHours)}</span>
            <span className="text-space-gray-600">•</span>
            <span className="text-space-gray-500">Data refreshes every 6 hours</span>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Map + Search */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Bar */}
            <div className="bg-space-gray-900 border border-space-gray-700 rounded-xl p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-space-gray-400" />
                <input
                  type="text"
                  placeholder="Search by region..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-space-gray-800 border border-space-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-star-white placeholder-space-gray-400 focus:outline-none focus:border-cosmic-purple/50"
                />
              </div>
            </div>

            {/* Map */}
            <div className="bg-space-gray-900 border border-space-gray-700 rounded-xl overflow-hidden">
              <div className="h-[500px] relative">
                {mounted && (
                  <ClimateMap
                    metrics={filteredMetrics}
                    selectedMetric={selectedMetric}
                    markerRefs={markerRefs}
                    onMetricSelect={(metricId) => {
                      const metric = filteredMetrics.find(m => m.id === metricId);
                      setSelectedMetric(metric || null);
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Region List */}
          <div className="space-y-6">
            {/* Region Cards */}
            <div className="bg-space-gray-900 border border-space-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-galaxy-cyan" />
                <h2 className="text-xl font-bold text-star-white">
                  Climate Regions ({sortedMetrics.length})
                </h2>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {sortedMetrics.map((metric) => (
                  <button
                    key={metric.id}
                    onClick={() => setSelectedMetric(metric)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedMetric?.id === metric.id
                        ? 'bg-cosmic-purple/20 border-cosmic-purple'
                        : 'bg-space-gray-800 border-space-gray-700 hover:border-cosmic-purple/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-star-white text-sm">{metric.region}</h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          metric.temperature_anomaly_c >= 1.5
                            ? 'bg-red-500/20 text-red-400'
                            : metric.temperature_anomaly_c >= 1.0
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        +{metric.temperature_anomaly_c}°C
                      </span>
                    </div>

                    <p className="text-xs text-space-gray-400 mb-3">{metric.location}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-space-gray-400">CO₂:</span>{' '}
                        <span className="text-star-white font-semibold">{metric.co2_ppm}ppm</span>
                      </div>
                      <div>
                        <span className="text-space-gray-400">Sea Level:</span>{' '}
                        <span className="text-star-white font-semibold">+{metric.sea_level_rise_mm}mm</span>
                      </div>
                    </div>

                    {metric.alerts && metric.alerts.length > 0 && (
                      <div className="mt-2 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-meteor-orange flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-meteor-orange">{metric.alerts[0]}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Historical Trends */}
        {trendData.length > 0 && (
          <div className="mt-8 bg-space-gray-900 border border-space-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart className="w-5 h-5 text-galaxy-cyan" />
              <h2 className="text-xl font-bold text-star-white">Historical Trends (Last 5 Years)</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Temperature Trend */}
              <div>
                <h3 className="text-sm font-semibold text-space-gray-400 mb-3">Temperature Anomaly</h3>
                <div className="space-y-2">
                  {trendData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-sm text-space-gray-400 w-12">{item.year}</span>
                      <div className="flex-1 h-8 bg-space-gray-800 rounded-lg overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-meteor-orange to-red-500 flex items-center justify-end pr-2"
                          style={{ width: `${(item.avgTemp / 2) * 100}%` }}
                        >
                          <span className="text-xs font-bold text-white">+{item.avgTemp}°C</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CO2 Trend */}
              <div>
                <h3 className="text-sm font-semibold text-space-gray-400 mb-3">CO₂ Concentration</h3>
                <div className="space-y-2">
                  {trendData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-sm text-space-gray-400 w-12">{item.year}</span>
                      <div className="flex-1 h-8 bg-space-gray-800 rounded-lg overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-galaxy-cyan to-cosmic-purple flex items-center justify-end pr-2"
                          style={{ width: `${((item.avgCO2 - 380) / 80) * 100}%` }}
                        >
                          <span className="text-xs font-bold text-white">{item.avgCO2}ppm</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Insights */}
        <div className="mt-8 bg-space-gray-900 border border-space-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-star-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-meteor-orange" />
            Key Climate Insights
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-space-gray-800 border border-space-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-star-white mb-2">Arctic Amplification</h3>
              <p className="text-sm text-space-gray-300">
                Arctic regions are warming 2-3× faster than the global average, leading to accelerated ice loss and ecosystem changes.
              </p>
            </div>

            <div className="bg-space-gray-800 border border-space-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-star-white mb-2">CO₂ Milestone</h3>
              <p className="text-sm text-space-gray-300">
                Global CO₂ concentrations have exceeded 420 ppm, the highest levels in over 3 million years.
              </p>
            </div>

            <div className="bg-space-gray-800 border border-space-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-star-white mb-2">Sea Level Acceleration</h3>
              <p className="text-sm text-space-gray-300">
                Global mean sea level is rising at 3.4mm per year, threatening coastal communities and ecosystems worldwide.
              </p>
            </div>

            <div className="bg-space-gray-800 border border-space-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-star-white mb-2">Ice Sheet Mass Balance</h3>
              <p className="text-sm text-space-gray-300">
                Greenland and Antarctica are losing ~280 billion tons of ice per year, contributing significantly to sea level rise.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
