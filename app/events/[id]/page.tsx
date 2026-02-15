import { Calendar, MapPin, Eye, Clock, Compass, Info, Lightbulb, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { EventType } from '@/types/events';
import EventActionButtons from '@/components/events/EventActionButtons';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

async function fetchEventDetails(id: string, type: string = 'celestial') {
    try {
        let metadata = null;
        
        // Handle aurora and solar-flare types from Next.js API routes
        if (type === 'aurora') {
            // Fetch the full KP index data (not just the processed version)
            const res = await fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json', {
                next: { revalidate: 300 }, // Cache for 5 minutes
            });

            if (!res.ok) return null;

            const allData = await res.json();
            
            if (!allData || allData.length === 0) return null;

            // Get latest record
            const latest = allData[allData.length - 1];
            const kp = parseFloat(latest.kp_index);
            const visibilityScore = Math.min(kp * 15, 100);

            metadata = {
                apiSource: 'NOAA SWPC - Planetary K-index',
                apiEndpoint: 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json',
                lastFetched: new Date().toISOString(),
                fetchedAt: Date.now(),
            };

            // Transform aurora data to CelestialEvent format
            const now = new Date();
            return {
                id: `aurora-${now.getTime()}`,
                name: 'Aurora Activity',
                type: 'aurora',
                date: new Date(latest.time_tag),
                peakTime: new Date(latest.time_tag),
                duration: 180,
                visibility: {
                    location: 'Global - High Latitudes',
                    coordinates: { lat: 65, lng: 0 },
                    bestViewTime: new Date(latest.time_tag),
                    direction: 'N',
                    visibilityScore: visibilityScore,
                },
                description: {
                    simple: 'Aurora activity based on real-time solar storm intensity.',
                    detailed: `Real-time aurora activity with KP index of ${kp}. ${
                        kp >= 5
                            ? 'Visible in mid-latitudes!'
                            : 'Best viewed from high northern latitudes.'
                    }`,
                },
                whyItMatters: `KP Index: ${kp}. ${
                    kp >= 7
                        ? 'Rare global aurora event!'
                        : kp >= 5
                        ? 'Aurora visible in mid-latitudes'
                        : 'Aurora activity at high latitudes'
                }`,
                observationTips: [
                    'Best viewed away from city lights',
                    'Look towards the northern horizon',
                    'Peak activity typically around midnight',
                    'Check local weather for clear skies',
                ],
                weatherDependent: true,
                images: [],
                // Store KP history for display (last 30 records)
                kpHistory: allData.slice(-30).reverse(),
                metadata,
            };
        }

        if (type === 'solar-flare') {
            const res = await fetch(`http://localhost:3000/api/solar-flares`, {
                next: { revalidate: 600 }, // Cache for 10 minutes
            });

            if (!res.ok) return null;

            const response = await res.json();
            const data = response.flares || response;
            metadata = response.metadata;
            
            if (!Array.isArray(data)) return null;

            // Find the specific flare by ID (ID contains timestamp)
            const flareData = data.find((flare: any) => {
                const flareId = `solar-flare-${flare.begin_time}-${data.indexOf(flare)}`;
                return flareId === id;
            }) || data[0]; // Default to first flare if not found

            const beginTime = new Date(flareData.begin_time);
            const maxTime = new Date(flareData.max_time);
            const endTime = new Date(flareData.end_time);
            const duration = (endTime.getTime() - beginTime.getTime()) / 60000;

            const flareClass = flareData.current_class || 'Unknown';
            const visibilityScore = flareClass.startsWith('X')
                ? 90
                : flareClass.startsWith('M')
                ? 70
                : 50;

            return {
                id,
                name: `Solar Flare ${flareClass}`,
                type: 'aurora',
                date: beginTime,
                peakTime: maxTime,
                duration: Math.round(duration),
                visibility: {
                    location: 'Sun-Earth System',
                    coordinates: { lat: 0, lng: 0 },
                    bestViewTime: maxTime,
                    direction: 'N',
                    visibilityScore,
                },
                description: {
                    simple: `${flareClass} class solar flare detected`,
                    detailed: `Solar flare of class ${flareClass} detected by GOES satellite. Begin: ${beginTime.toLocaleString()}, Peak: ${maxTime.toLocaleString()}, End: ${endTime.toLocaleString()}`,
                },
                whyItMatters: `${
                    flareClass.startsWith('X')
                        ? 'Strong solar flare - may cause radio blackouts and aurora'
                        : flareClass.startsWith('M')
                        ? 'Moderate solar flare - minor impacts possible'
                        : 'Minor solar flare detected'
                }`,
                observationTips: [
                    'Solar flares can cause radio blackouts',
                    'May trigger auroras in 1-3 days',
                    'Monitor space weather forecasts',
                    'X-class flares can impact satellites',
                ],
                weatherDependent: false,
                images: [],
                metadata,
            };
        }

        // Handle backend API types
        const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';
        
        let endpoint = '/events'; // default
        if (type === 'launch') endpoint = '/launches';
        else if (type === 'iss') endpoint = '/iss-operations';
        else if (type === 'asteroid') endpoint = '/asteroids';
        
        const res = await fetch(`${BACKEND_API_URL}${endpoint}/${id}`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            return null;
        }

        const response = await res.json();
        
        if (!response.success || !response.data) {
            return null;
        }

        // Extract metadata from response
        metadata = response.metadata;

        // Transform dates from ISO strings to Date objects
        const event = response.data;
        return {
            ...event,
            date: new Date(event.date),
            peakTime: new Date(event.peakTime),
            visibility: {
                ...event.visibility,
                bestViewTime: new Date(event.visibility.bestViewTime),
            },
            metadata,
        };
    } catch (error) {
        console.error('Error fetching event details:', error);
        return null;
    }
}

function getEventIcon(type: EventType) {
    const icons = {
        'meteor-shower': '☄️',
        'eclipse': '🌑',
        'iss-pass': '🛰️',
        'aurora': '🌌',
        'full-moon': '🌕',
        'planetary-alignment': '🪐',
        'comet': '☄️',
    };
    return icons[type] || '⭐';
}

function getEventTypeIcon(type: string) {
    switch (type) {
        case 'launch':
            return '🚀';
        case 'iss':
            return '👨‍🚀';
        case 'asteroid':
            return '☄️';
        case 'aurora':
            return '🌌';
        case 'solar-flare':
            return '🌞';
        default:
            return '🌌';
    }
}

export default async function EventDetailPage({ 
    params, 
    searchParams 
}: { 
    params: { id: string }; 
    searchParams: { type?: string } 
}) {
    const eventType = searchParams.type || 'celestial';
    const event = await fetchEventDetails(params.id, eventType);

    if (!event) {
        return (
            <main className="bg-space-black min-h-screen pt-24">
                <div className="max-w-4xl mx-auto px-8 py-20">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-star-white mb-4">Event Not Found</h1>
                        <p className="text-space-gray-300 mb-8">
                            The event you're looking for doesn't exist or could not be loaded.
                        </p>
                        <Link 
                            href="/events"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-cosmic-purple hover:bg-cosmic-purple/90 text-white rounded-full font-semibold transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Events
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    const icon = eventType === 'celestial' ? getEventIcon(event.type as EventType) : getEventTypeIcon(eventType);

    return (
        <main className="bg-space-black min-h-screen pt-24">
            <div className="max-w-5xl mx-auto px-8 py-12">
                {/* Back Button */}
                <Link 
                    href="/events"
                    className="inline-flex items-center gap-2 text-cosmic-purple hover:text-cosmic-purple/80 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to all events
                </Link>

                {/* Hero Section */}
                <div className="bg-gradient-to-br from-space-gray-900 via-space-gray-900 to-cosmic-purple/10 border border-space-gray-700 rounded-3xl p-8 md:p-12 mb-8">
                    <div className="flex items-start gap-6 mb-6">
                        <span className="text-6xl">{icon}</span>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-cosmic-purple/20 border border-cosmic-purple/50 rounded-full text-cosmic-purple text-sm font-semibold capitalize">
                                    {eventType === 'launch' ? 'Rocket Launch' : 
                                     eventType === 'iss' ? 'ISS Operation' :
                                     eventType === 'asteroid' ? 'Asteroid Flyby' :
                                     eventType === 'aurora' ? 'Aurora Activity' :
                                     eventType === 'solar-flare' ? 'Solar Flare' :
                                     (event.type as string).replace('-', ' ')}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-star-white font-display mb-4">
                                {event.name}
                            </h1>
                            <p className="text-xl text-space-gray-300">
                                {event.description.simple}
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-space-black/40 rounded-xl p-4 border border-space-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-galaxy-cyan" />
                                <span className="text-xs text-space-gray-400 uppercase">Start Date</span>
                            </div>
                            <p className="text-star-white font-semibold">
                                {format(event.date, 'MMM d, yyyy')}
                            </p>
                            <p className="text-sm text-space-gray-400">
                                {format(event.peakTime, 'h:mm a')}
                            </p>
                        </div>

                        <div className="bg-space-black/40 rounded-xl p-4 border border-space-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-aurora-green" />
                                <span className="text-xs text-space-gray-400 uppercase">Duration</span>
                            </div>
                            <p className="text-star-white font-semibold">
                                {event.duration} min
                            </p>
                        </div>

                        <div className="bg-space-black/40 rounded-xl p-4 border border-space-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Eye className="w-4 h-4 text-meteor-orange" />
                                <span className="text-xs text-space-gray-400 uppercase">Visibility</span>
                            </div>
                            <p className="text-star-white font-semibold">
                                {event.visibility.visibilityScore}%
                            </p>
                        </div>

                        <div className="bg-space-black/40 rounded-xl p-4 border border-space-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Compass className="w-4 h-4 text-nebula-pink" />
                                <span className="text-xs text-space-gray-400 uppercase">Direction</span>
                            </div>
                            <p className="text-star-white font-semibold">
                                {event.visibility.direction} Sky
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Left Column - Main Details */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Detailed Description */}
                        <div className="bg-space-gray-900/80 border border-space-gray-700 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="w-5 h-5 text-galaxy-cyan" />
                                <h2 className="text-2xl font-bold text-star-white font-display">
                                    About This Event
                                </h2>
                            </div>
                            <p className="text-space-gray-300 leading-relaxed">
                                {event.description.detailed || event.description.simple}
                            </p>
                        </div>

                        {/* Why It Matters */}
                        <div className="bg-space-gray-900/80 border border-space-gray-700 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">✨</span>
                                <h2 className="text-2xl font-bold text-star-white font-display">
                                    Why It Matters
                                </h2>
                            </div>
                            <p className="text-space-gray-300 leading-relaxed">
                                {event.whyItMatters}
                            </p>
                        </div>

                        {/* Observation Tips */}
                        <div className="bg-space-gray-900/80 border border-space-gray-700 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Lightbulb className="w-5 h-5 text-meteor-orange" />
                                <h2 className="text-2xl font-bold text-star-white font-display">
                                    {eventType === 'launch' ? 'Launch Information' :
                                     eventType === 'asteroid' ? 'Asteroid Information' :
                                     'Observation Tips'}
                                </h2>
                            </div>
                            <ul className="space-y-3">
                                {event.observationTips.map((tip: string, index: number) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className="text-cosmic-purple text-xl">•</span>
                                        <span className="text-space-gray-300">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* KP Index History - Only for Aurora Events */}
                        {eventType === 'aurora' && (event as any).kpHistory && (
                            <div className="bg-space-gray-900/80 border border-space-gray-700 rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-2xl">📊</span>
                                    <h2 className="text-2xl font-bold text-star-white font-display">
                                        Recent KP Index History
                                    </h2>
                                </div>
                                <p className="text-space-gray-400 text-sm mb-4">
                                    Last 30 readings (most recent first)
                                </p>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-space-gray-700">
                                                <th className="text-left py-3 px-2 text-space-gray-400 font-semibold">Time (UTC)</th>
                                                <th className="text-center py-3 px-2 text-space-gray-400 font-semibold">KP Index</th>
                                                <th className="text-center py-3 px-2 text-space-gray-400 font-semibold">Est. KP</th>
                                                <th className="text-left py-3 px-2 text-space-gray-400 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(event as any).kpHistory.map((record: any, index: number) => {
                                                const kp = parseFloat(record.kp_index);
                                                const estKp = parseFloat(record.estimated_kp || record.kp_index);
                                                const status = kp >= 7 ? '🔴 Extreme' : kp >= 5 ? '🟠 High' : kp >= 3 ? '🟡 Moderate' : '🟢 Low';
                                                return (
                                                    <tr key={index} className="border-b border-space-gray-800 hover:bg-space-gray-800/50 transition-colors">
                                                        <td className="py-2 px-2 text-space-gray-300">
                                                            {new Date(record.time_tag).toLocaleString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="py-2 px-2 text-center">
                                                            <span className="font-semibold text-aurora-green">{kp.toFixed(2)}</span>
                                                        </td>
                                                        <td className="py-2 px-2 text-center">
                                                            <span className="font-semibold text-galaxy-cyan">{estKp.toFixed(2)}</span>
                                                        </td>
                                                        <td className="py-2 px-2 text-space-gray-300 text-sm">
                                                            {status}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Location & Actions */}
                    <div className="space-y-6">
                        {/* Location */}
                        <div className="bg-space-gray-900/80 border border-space-gray-700 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-nebula-pink" />
                                <h3 className="text-xl font-bold text-star-white font-display">
                                    Location
                                </h3>
                            </div>
                            <p className="text-space-gray-300 mb-2">
                                {event.visibility.location}
                            </p>
                            {event.weatherDependent && (
                                <div className="mt-4 p-3 bg-meteor-orange/10 border border-meteor-orange/30 rounded-lg">
                                    <p className="text-xs text-meteor-orange">
                                        ☀️ Weather dependent - Check local conditions
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Best Viewing Time */}
                        <div className="bg-space-gray-900/80 border border-space-gray-700 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-aurora-green" />
                                <h3 className="text-xl font-bold text-star-white font-display">
                                    Best Time
                                </h3>
                            </div>
                            <p className="text-space-gray-300">
                                {format(event.visibility.bestViewTime, 'MMMM d, yyyy')}
                            </p>
                            <p className="text-sm text-space-gray-400 mt-1">
                                {format(event.visibility.bestViewTime, 'h:mm a')}
                            </p>
                        </div>

                        {/* Data Source - API Metadata */}
                        {(event as any).metadata && (
                            <div className="bg-space-gray-900/80 border border-space-gray-700 rounded-2xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-xl">🔗</span>
                                    <h3 className="text-xl font-bold text-star-white font-display">
                                        Data Source
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-space-gray-400 uppercase mb-1">API Source</p>
                                        <p className="text-space-gray-300 text-sm font-medium">
                                            {(event as any).metadata.apiSource}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-space-gray-400 uppercase mb-1">Endpoint</p>
                                        <p className="text-space-gray-300 text-xs break-all font-mono bg-space-black/40 p-2 rounded border border-space-gray-700">
                                            {(event as any).metadata.apiEndpoint}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-space-gray-400 uppercase mb-1">Last Fetched</p>
                                        <p className="text-space-gray-300 text-sm">
                                            {format(new Date((event as any).metadata.lastFetched), 'MMM d, yyyy h:mm:ss a')}
                                        </p>
                                        <p className="text-xs text-space-gray-500 mt-1">
                                            ({Math.floor((Date.now() - (event as any).metadata.fetchedAt) / 1000 / 60)} minutes ago)
                                        </p>
                                    </div>
                                    
                                    {/* Fetch History Table */}
                                    {(event as any).metadata.fetchHistory && (event as any).metadata.fetchHistory.length > 0 && (
                                        <div>
                                            <p className="text-xs text-space-gray-400 uppercase mb-2">Recent Fetch History</p>
                                            <div className="overflow-hidden rounded border border-space-gray-700">
                                                <table className="w-full text-xs">
                                                    <thead className="bg-space-black/60">
                                                        <tr>
                                                            <th className="text-left py-2 px-3 text-space-gray-400 font-semibold">#</th>
                                                            <th className="text-left py-2 px-3 text-space-gray-400 font-semibold">Fetch Time</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(event as any).metadata.fetchHistory.map((fetch: any, index: number) => (
                                                            <tr key={index} className="border-t border-space-gray-800 hover:bg-space-gray-800/30 transition-colors">
                                                                <td className="py-2 px-3 text-space-gray-400">{index + 1}</td>
                                                                <td className="py-2 px-3 text-space-gray-300">
                                                                    {format(new Date(fetch.date), 'MMM d, h:mm:ss a')}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Additional Info for Launches & Asteroids */}
                        {(eventType === 'launch' || eventType === 'asteroid') && event.agency && (
                            <div className="bg-space-gray-900/80 border border-space-gray-700 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-star-white font-display mb-3">
                                    Agency
                                </h3>
                                <p className="text-space-gray-300">
                                    {event.agency}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <EventActionButtons 
                            eventName={event.name}
                            eventDate={event.date}
                            eventDuration={event.duration}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
