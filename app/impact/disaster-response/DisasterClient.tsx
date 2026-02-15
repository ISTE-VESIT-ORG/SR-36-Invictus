'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';
import type { Marker as LeafletMarker } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, MapPin, Search, ExternalLink, Calendar, BarChart2 } from 'lucide-react';
import { normalizeDisasterData, createDisasterIcon, NormalizedDisasterEvent } from '@/lib/disasterUtils';


// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

interface DisasterEvent {
  id: string;
  title: string;
  disaster_type: string;
  description: string;
  coordinates: { lat: number; lng: number } | { lat: number; lng: number }[]; 
  event_date: string;
  lastUpdated: string;
  source_url?: string; // Sometimes present in props
}

interface DisasterClientProps {
  initialEvents: DisasterEvent[];
}

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

const MapController = ({
    selectedEvent,
    allEvents,
    markerRefs,
}: {
    selectedEvent: NormalizedDisasterEvent | null;
    allEvents: NormalizedDisasterEvent[];
    markerRefs: MutableRefObject<Record<string, LeafletMarker | null>>;
}) => {
    const map = useMap();

    // 1. Zoom to selected event
    useEffect(() => {
        if (selectedEvent && Number.isFinite(selectedEvent.lat) && Number.isFinite(selectedEvent.lng)) {
            map.flyTo([selectedEvent.lat, selectedEvent.lng], 8, {
                duration: 1.5
            });
            const marker = markerRefs.current[selectedEvent.id];
            if (marker) {
                marker.openPopup();
            }
        }
    }, [selectedEvent, map, markerRefs]);

    // 2. Initial Fit Bounds
    useEffect(() => {
        if (allEvents.length === 0) return;
        
        // Don't refit if user selected something specific
        if (selectedEvent) return; 

        // Calculate bounds
        let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
        let validCoords = false;

        allEvents.forEach(e => {
            if (!Number.isFinite(e.lat) || !Number.isFinite(e.lng)) return;
            validCoords = true;
            if (e.lat < minLat) minLat = e.lat;
            if (e.lat > maxLat) maxLat = e.lat;
            if (e.lng < minLng) minLng = e.lng;
            if (e.lng > maxLng) maxLng = e.lng;
        });

        if (validCoords) {
             // Add some padding
             const latBuffer = (maxLat - minLat) * 0.1 || 5;
             const lngBuffer = (maxLng - minLng) * 0.1 || 5;
             
             try {
                map.fitBounds([
                    [minLat - latBuffer, minLng - lngBuffer],
                    [maxLat + latBuffer, maxLng + lngBuffer]
                ], { padding: [40, 40] });
             } catch (e) {
                 console.warn("Could not fit bounds", e);
             }
        }
    }, [allEvents, map]); // Removed selectedEvent dependency to prevent auto-zoom out

    return null;
};

// Map Legend Overlay
const MapLegend = () => (
    <div className="leaflet-bottom leaflet-right m-4 z-[500] pointer-events-none">
        <div className="bg-space-gray-900/90 backdrop-blur-md p-4 rounded-lg border border-space-gray-700 shadow-xl text-xs space-y-2 pointer-events-auto min-w-[120px]">
            <h4 className="font-bold text-white mb-2 uppercase tracking-wider text-[10px] text-space-gray-400">Event Types</h4>
            <div className="flex items-center gap-3 text-space-gray-300">
                <span className="text-lg w-5 text-center">🔥</span> Wildfire
            </div>
            <div className="flex items-center gap-3 text-space-gray-300">
                <span className="text-lg w-5 text-center">🌊</span> Flood
            </div>
            <div className="flex items-center gap-3 text-space-gray-300">
                <span className="text-lg w-5 text-center">⛈️</span> Storm
            </div>
            <div className="flex items-center gap-3 text-space-gray-300">
                 <span className="text-lg w-5 text-center">🌋</span> Volcano
            </div>
            <div className="flex items-center gap-3 text-space-gray-300">
                <span className="text-lg w-5 text-center">🧊</span> Iceberg
            </div>
        </div>
    </div>
);

const matchesFilter = (category: string, filterType: string) => {
    if (filterType === 'All') return true;
    const normalized = category.toLowerCase();
    const filter = filterType.toLowerCase();

    if (filter === 'iceberg') return normalized.includes('ice') || normalized.includes('snow');
    if (filter === 'storm') return normalized.includes('storm');
    if (filter === 'wildfire') return normalized.includes('wildfire');
    if (filter === 'flood') return normalized.includes('flood');
    if (filter === 'volcano') return normalized.includes('volcano');

    return normalized.includes(filter);
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

export default function DisasterClient({ initialEvents }: DisasterClientProps) {
  // Normalize Data on Init
    const normalizedInitialEvents = useMemo(() => {
        const normalized = initialEvents.map(event => normalizeDisasterData(event));
        return normalized.filter(
            (event): event is NormalizedDisasterEvent => event !== null
        );
    }, [initialEvents]);

  const [activeDisasters, setActiveDisasters] = useState<NormalizedDisasterEvent[]>(normalizedInitialEvents);
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
    const markerRefs = useRef<Record<string, LeafletMarker | null>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter Logic
  useEffect(() => {
    let filtered = normalizedInitialEvents;

        if (filterType !== 'All') {
            filtered = filtered.filter(e => matchesFilter(e.category, filterType));
        }

    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setActiveDisasters(filtered);
    // Clear selection if filtered out
    if (selectedEventId && !filtered.find(e => e.id === selectedEventId)) {
        setSelectedEventId(null);
    }
  }, [filterType, searchTerm, normalizedInitialEvents]);

  const selectedEvent = useMemo(() => 
     activeDisasters.find(e => e.id === selectedEventId) || null,
  [selectedEventId, activeDisasters]);

  const hasRawEvents = initialEvents.length > 0;
  const hasValidEvents = normalizedInitialEvents.length > 0;

  const disasterTypes = ['All', 'Wildfire', 'Flood', 'Storm', 'Volcano', 'Iceberg'];

  return (
    <div className="min-h-screen bg-space-black pt-24 pb-8 flex flex-col">
       <div className="max-w-7xl mx-auto px-4 w-full flex-grow flex flex-col">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-8">
              <div>
                  <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-2">Global Disaster Response</h1>
                  <p className="text-space-gray-300 max-w-2xl">
                    Real-time monitoring using OpenStreetMap & NASA EONET. 
                    No API Key required for maps.
                  </p>
              </div>
              <div className="text-right hidden md:block">
                  <div className="text-3xl font-bold text-meteor-orange font-mono">{activeDisasters.length}</div>
                  <div className="text-sm text-space-gray-400 uppercase tracking-widest">Active Events</div>
              </div>
          </div>

          {/* Controls */}
          <div className="bg-space-gray-900/80 backdrop-blur-md rounded-xl p-4 mb-6 border border-space-gray-700 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-grow w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-space-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Search disasters..." 
                    className="w-full bg-space-black/50 border border-space-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cosmic-purple transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                  {disasterTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors border ${
                            filterType === type 
                            ? 'bg-cosmic-purple/20 border-cosmic-purple text-cosmic-purple' 
                            : 'bg-space-gray-800 border-space-gray-700 text-space-gray-300 hover:border-space-gray-500'
                        }`}
                      >
                          {type}
                      </button>
                  ))}
              </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 flex-grow">
              {/* Event List */}
              <div className="lg:col-span-1 bg-space-gray-900/50 backdrop-blur-sm rounded-xl border border-space-gray-700 overflow-hidden flex flex-col h-[600px] lg:h-auto">
                  <div className="p-4 border-b border-space-gray-700 font-bold text-white flex items-center justify-between">
                     <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-meteor-orange" />
                        Active Timeline
                     </div>
                     <span className="text-xs text-space-gray-500 bg-space-gray-800 px-2 py-1 rounded">
                        {activeDisasters.length} Events
                     </span>
                  </div>
                  
                  <div className="overflow-y-auto flex-grow p-2 space-y-2 custom-scrollbar">
                      {!hasValidEvents ? (
                          <div className="p-8 text-center text-space-gray-500 flex flex-col items-center justify-center h-full">
                              <AlertTriangle className="w-8 h-8 mb-4 opacity-50" />
                              <p>
                                {hasRawEvents
                                  ? 'No mappable events available.'
                                  : 'Unable to load live disaster data. Please try again later.'}
                              </p>
                          </div>
                      ) : activeDisasters.length === 0 ? (
                          <div className="p-8 text-center text-space-gray-500 flex flex-col items-center justify-center h-full">
                              <AlertTriangle className="w-8 h-8 mb-4 opacity-50" />
                              <p>No active disaster events found.</p>
                              <button onClick={() => {setFilterType('All'); setSearchTerm('');}} className="mt-4 text-cosmic-purple hover:underline text-sm">
                                  Clear Filters
                              </button>
                          </div>
                      ) : (
                          activeDisasters.map(event => (
                              <div
                                key={event.id}
                                onClick={() => setSelectedEventId(event.id)}
                                className={`cursor-pointer block p-4 rounded-lg border transition-all group relative overflow-hidden mb-2 last:mb-0 ${
                                    selectedEventId === event.id 
                                    ? 'bg-space-gray-800 border-cosmic-purple shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                                    : 'bg-space-black/40 border-space-gray-800 hover:border-space-gray-600 hover:bg-space-gray-800/50'
                                }`}
                              >
                                  <div className="flex justify-between items-start mb-2 relative z-10">
                                      <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                                            event.category.toLowerCase().includes('wildfire') ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            event.category.toLowerCase().includes('flood') ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            event.category.toLowerCase().includes('storm') ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                                            event.category.toLowerCase().includes('volcano') ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                            'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                      }`}>
                                          {event.category}
                                      </span>
                                      <span className="text-xs text-space-gray-500 font-mono">
                                          {new Date(event.date).toLocaleDateString()}
                                      </span>
                                  </div>
                                  <h3 className={`font-bold mb-2 transition-colors line-clamp-2 relative z-10 text-sm ${
                                      selectedEventId === event.id ? 'text-white' : 'text-space-gray-200 group-hover:text-white'
                                  }`}>
                                      {event.title}
                                  </h3>
                                  <div className="flex items-center text-xs text-space-gray-400 relative z-10">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {event.lat.toFixed(2)}, {event.lng.toFixed(2)}
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>

              {/* Leaflet Map */}
              <div className="lg:col-span-2 bg-space-gray-900 rounded-xl overflow-hidden border border-space-gray-700 relative min-h-[600px] z-0">
                                    {!mounted ? (
                      <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-space-gray-900 text-space-gray-400 animate-pulse">
                          Loading satellite intelligence map...
                      </div>
                  ) : (
                                            <MapContainer 
                        center={[20, 0]} 
                        zoom={2} 
                        style={{ height: '600px', width: '100%', zIndex: 0 }}
                        className="z-0"
                      >
                        {/* 1. Map Controller for Interactions */}
                                                <MapController selectedEvent={selectedEvent} allEvents={activeDisasters} markerRefs={markerRefs} />

                        {/* 2. Dark Mode Tiles */}
                                                <TileLayer
                            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                                />

                        {/* 3. Markers */}
                        {activeDisasters.map(event => {
                             if (!Number.isFinite(event.lat) || !Number.isFinite(event.lng)) return null;

                             const icon = createDisasterIcon(event.category);
                             if (!icon) return null;

                             return (
                                 <Marker 
                                    key={event.id} 
                                    position={[event.lat, event.lng]}
                                    icon={icon}
                                    eventHandlers={{
                                        click: () => {
                                            setSelectedEventId(event.id);
                                        },
                                    }}
                                    zIndexOffset={selectedEventId === event.id ? 1000 : 0}
                                    opacity={selectedEventId === event.id || !selectedEventId ? 1 : 0.6}
                                    ref={(ref) => {
                                        markerRefs.current[event.id] = ref ?? null;
                                    }}
                                 >
                                     <Popup className="custom-popup-dark">
                                        <div className="p-1 min-w-[200px]">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div 
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: event.category.toLowerCase().includes('wildfire') ? '#ef4444' : '#3b82f6' }}
                                                />
                                                <span className="text-xs font-bold uppercase tracking-wider text-space-gray-500">
                                                    {event.category}
                                                </span>
                                            </div>
                                            
                                            <h3 className="font-bold text-sm text-gray-900 mb-2 leading-tight">
                                                {event.title}
                                            </h3>

                                            <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
                                                <div className="flex items-center">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {new Date(event.date).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {event.lat.toFixed(2)}, {event.lng.toFixed(2)}
                                                </div>
                                                {event.magnitudeValue && (
                                                    <div className="col-span-2 flex items-center text-orange-600 font-medium">
                                                        <BarChart2 className="w-3 h-3 mr-1" />
                                                        Magnitude: {event.magnitudeValue} {event.magnitudeUnit}
                                                    </div>
                                                )}
                                            </div>

                                            {event.sourceUrl && (
                                                <a 
                                                    href={event.sourceUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="block w-full text-center py-2 px-3 bg-cosmic-purple hover:bg-cosmic-purple/90 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-1"
                                                >
                                                    View Source <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                     </Popup>
                                 </Marker>
                             )
                        })}
                        
                        {/* 4. Legend Overlay */}
                        <MapLegend />

                                                {!hasValidEvents && (
                                                    <div className="absolute inset-0 flex items-center justify-center text-space-gray-400 text-sm pointer-events-none">
                                                        {hasRawEvents
                                                            ? 'No mappable events available.'
                                                            : 'Unable to load live disaster data. Please try again later.'}
                                                    </div>
                                                )}
                                                {hasValidEvents && activeDisasters.length === 0 && (
                                                    <div className="absolute inset-0 flex items-center justify-center text-space-gray-400 text-sm pointer-events-none">
                                                        No active disaster events found.
                                                    </div>
                                                )}
                                            </MapContainer>
                  )}
              </div>
          </div>

       </div>
    </div>
  );
}
