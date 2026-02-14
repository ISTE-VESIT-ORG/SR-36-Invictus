import { Calendar, MapPin, Eye, Clock, Compass, Info, Lightbulb, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { EventType } from '@/types/events';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchEventDetails(id: string, type: string = 'celestial') {
    try {
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
                        <div className="space-y-3">
                            <button className="w-full py-3 px-6 bg-gradient-to-r from-cosmic-purple to-nebula-pink text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cosmic-purple/50 transition-all">
                                <Calendar className="w-4 h-4" />
                                Add to Calendar
                            </button>
                            <button className="w-full py-3 px-6 bg-space-gray-800 hover:bg-space-gray-700 text-star-white border border-space-gray-700 rounded-xl font-semibold transition-colors">
                                Set Reminder
                            </button>
                            <button className="w-full py-3 px-6 bg-space-gray-800 hover:bg-space-gray-700 text-star-white border border-space-gray-700 rounded-xl font-semibold transition-colors">
                                Share Event
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
