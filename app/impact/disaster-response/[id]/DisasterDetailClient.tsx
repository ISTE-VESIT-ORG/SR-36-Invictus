'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeft, MapPin, Calendar, ExternalLink, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// Fix for default marker icons missing in webpack
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface DisasterEvent {
  id: string;
  title: string;
  disaster_type: string;
  description: string;
  coordinates: { lat: number; lng: number } | { lat: number; lng: number }[];
  event_date: string; // ISO string from backend
  source_url: string | null;
}

export default function DisasterDetailClient({ event }: { event: DisasterEvent }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    
    // Normalize coordinates for map center (Leaflet uses [lat, lng])
    // The backend provides coordinates in { lat, lng } format or array of { lat, lng }
    let centerCoords: [number, number] = [0, 0];

    if (Array.isArray(event.coordinates)) {
        if (event.coordinates.length > 0) {
            centerCoords = [event.coordinates[0].lat, event.coordinates[0].lng];
        }
    } else {
        // Single coordinate object
        centerCoords = [event.coordinates.lat, event.coordinates.lng];
    }
    
    // Helper to format date safely
    const formattedDate = new Date(event.event_date).toLocaleDateString(undefined, {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-space-black pt-24 pb-16 text-white px-4">
            <div className="max-w-6xl mx-auto">
                
                <Link 
                    href="/impact/disaster-response" 
                    className="inline-flex items-center text-cosmic-purple hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Global Map
                </Link>

                <div className="grid lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Header Section */}
                        <div>
                             <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 border ${
                                event.disaster_type === 'Wildfire' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                event.disaster_type === 'Flood' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                event.disaster_type === 'Severe Storm' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            }`}>
                                {event.disaster_type}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-bold font-display mb-4 leading-tight">
                                {event.title}
                            </h1>
                            
                            <div className="flex flex-wrap gap-6 text-space-gray-400 text-sm">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-cosmic-purple" />
                                    {formattedDate}
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-cosmic-purple" />
                                    {centerCoords[0].toFixed(4)}° N, {centerCoords[1].toFixed(4)}° E
                                </div>
                            </div>
                        </div>

                        {/* Description Box */}
                        <div className="bg-space-gray-900/40 backdrop-blur-sm rounded-2xl p-8 border border-space-gray-800">
                            <h2 className="text-xl font-bold mb-4 font-display text-white flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-3 text-meteor-orange" />
                                Event Details
                            </h2>
                            <p className="text-lg text-space-gray-300 leading-relaxed font-light">
                                {event.description || 'No detailed description is currently available for this event from the monitoring source.'}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        {event.source_url && (
                            <div>
                                <a 
                                    href={event.source_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-6 py-3 bg-cosmic-purple hover:bg-cosmic-purple/80 text-white rounded-lg transition-all font-medium shadow-lg shadow-cosmic-purple/20"
                                >
                                    View Official Source <ExternalLink className="w-4 h-4 ml-2" />
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Map & Analysis */}
                    <div className="space-y-6">
                        {/* Map Card */}
                        <div className="bg-space-gray-900 rounded-xl overflow-hidden border border-space-gray-700 h-[400px] shadow-2xl relative z-0">
                            {!mounted ? (
                                <div className="w-full h-full flex items-center justify-center bg-space-gray-900 text-space-gray-400">
                                    Loading map view...
                                </div>
                            ) : (
                                <MapContainer 
                                    center={centerCoords} 
                                    zoom={6} 
                                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                                    scrollWheelZoom={false}
                                >
                                    {/* Dark Mode Tiles */}
                                    <TileLayer
                                        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    />
                                    <Marker position={centerCoords} icon={defaultIcon}>
                                        <Popup className="text-black font-sans text-sm">
                                            <b>{event.title}</b><br/>
                                            {event.disaster_type}
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            )}
                        </div>

                        {/* Info Card */}
                         <div className="bg-space-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-space-gray-800">
                            <h3 className="font-bold text-white mb-2 font-display">Satellite Monitoring</h3>
                            <p className="text-sm text-space-gray-400 leading-relaxed">
                                This event is being actively monitored by the Global Response satellite network. 
                                Data is aggregated from NASA EONET and other international agencies to provide real-time situational awareness.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
