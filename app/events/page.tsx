// import Image from 'next/image';
// import { Calendar, MapPin, Clock, Star, Bell } from 'lucide-react';

// export default function EventsPage() {
//     const featuredEvents = [
//         {
//             name: 'Total Solar Eclipse',
//             date: 'April 8, 2026',
//             time: '2:30 PM - 4:45 PM',
//             visibility: 'Excellent',
//             location: 'North America',
//             description: 'A rare total solar eclipse will darken the skies across North America. The moon will completely block the sun.',
//             tips: 'Use certified eclipse glasses. Never look directly at the sun without protection.',
//             image: '/images/eclipse.png',
//         },
//         {
//             name: 'Aurora Borealis Peak',
//             date: 'March 20-22, 2026',
//             time: '10:00 PM - 2:00 AM',
//             visibility: 'Very Good',
//             location: 'Northern Latitudes',
//             description: 'Strong solar activity will create spectacular northern lights displays across high-latitude regions.',
//             tips: 'Find dark skies away from city lights. Best viewing between 10 PM and 2 AM.',
//             image: '/images/aurora.png',
//         },
//         {
//             name: 'Geminids Meteor Shower',
//             date: 'December 13-14, 2026',
//             time: '9:00 PM - 4:00 AM',
//             visibility: 'Excellent',
//             location: 'Worldwide',
//             description: 'One of the best meteor showers of the year with up to 120 meteors per hour at peak.',
//             tips: 'Allow 20 minutes for your eyes to adjust. Lie flat and look straight up.',
//             image: '/images/meteor-shower.png',
//         },
//     ];

//     return (
//         <div className="min-h-screen bg-space-black">
//             {/* Hero Section with Background */}
//             <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
//                 <Image
//                     src="/images/meteor-shower.png"
//                     alt="Meteor shower"
//                     fill
//                     className="object-cover"
//                     quality={85}
//                     priority
//                 />
//                 {/* Strong dark overlay for text visibility */}
//                 <div className="absolute inset-0 bg-gradient-to-b from-space-black/80 via-space-black/70 to-space-black" />

//                 <div className="relative z-10 text-center px-8 max-w-4xl">
//                     <h1 className="text-5xl md:text-7xl font-bold text-star-white font-display mb-4 drop-shadow-2xl">
//                         Celestial Events
//                     </h1>
//                     <p className="text-xl md:text-2xl text-star-white drop-shadow-lg">
//                         Track meteor showers, eclipses, and satellite passes. Never miss a spectacular sky event.
//                     </p>
//                 </div>
//             </div>

//             {/* Content Section */}
//             <div className="py-16 px-8 bg-gradient-to-b from-space-black via-space-gray-900 to-space-black">
//                 <div className="max-w-7xl mx-auto">

//                     {/* Featured Events */}
//                     <h2 className="text-3xl md:text-4xl font-bold text-star-white font-display mb-8 text-center">
//                         Featured Events
//                     </h2>

//                     <div className="grid lg:grid-cols-3 gap-6 mb-12">
//                         {featuredEvents.map((event, i) => (
//                             <div
//                                 key={i}
//                                 className="group relative bg-space-gray-900 border border-space-gray-700 hover:border-cosmic-purple/50 rounded-2xl overflow-hidden transition-all duration-300"
//                             >
//                                 {/* Event Image */}
//                                 <div className="relative h-48 overflow-hidden">
//                                     <Image
//                                         src={event.image}
//                                         alt={event.name}
//                                         fill
//                                         className="object-cover group-hover:scale-110 transition-transform duration-500"
//                                     />
//                                     <div className="absolute inset-0 bg-gradient-to-t from-space-gray-900 via-space-gray-900/50 to-transparent" />

//                                     {/* Badge */}
//                                     <div className="absolute top-4 right-4">
//                                         <Star className="w-6 h-6 text-meteor-orange" fill="currentColor" />
//                                     </div>
//                                 </div>

//                                 {/* Content */}
//                                 <div className="p-6">
//                                     <h3 className="text-2xl font-bold text-star-white font-display mb-3">
//                                         {event.name}
//                                     </h3>

//                                     <div className="space-y-2 mb-4">
//                                         <div className="flex items-center gap-2 text-space-gray-300">
//                                             <Calendar className="w-4 h-4 text-galaxy-cyan" />
//                                             <span className="text-sm">{event.date}</span>
//                                         </div>
//                                         <div className="flex items-center gap-2 text-space-gray-300">
//                                             <Clock className="w-4 h-4 text-aurora-green" />
//                                             <span className="text-sm">{event.time}</span>
//                                         </div>
//                                         <div className="flex items-center gap-2 text-space-gray-300">
//                                             <MapPin className="w-4 h-4 text-nebula-pink" />
//                                             <span className="text-sm">{event.location}</span>
//                                         </div>
//                                     </div>

//                                     <p className="text-space-gray-300 text-sm mb-4">
//                                         {event.description}
//                                     </p>

//                                     <div className="bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg p-3 mb-4">
//                                         <p className="text-xs text-cosmic-purple font-medium">
//                                             💡 {event.tips}
//                                         </p>
//                                     </div>

//                                     <button className="w-full py-2 px-4 bg-cosmic-purple hover:bg-cosmic-purple/90 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2">
//                                         <Bell className="w-4 h-4" />
//                                         Set Reminder
//                                     </button>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     {/* Features */}
//                     <div className="grid md:grid-cols-3 gap-6">
//                         <div className="bg-space-gray-900/80 border border-space-gray-700 rounded-xl p-6 text-center hover:border-cosmic-purple/50 transition-all">
//                             <div className="text-4xl mb-3">📅</div>
//                             <h3 className="text-lg font-bold text-star-white mb-2">Event Calendar</h3>
//                             <p className="text-sm text-space-gray-400">
//                                 View all upcoming events in an interactive calendar
//                             </p>
//                         </div>
//                         <div className="bg-space-gray-900/80 border border-space-gray-700 rounded-xl p-6 text-center hover:border-cosmic-purple/50 transition-all">
//                             <div className="text-4xl mb-3">🗺️</div>
//                             <h3 className="text-lg font-bold text-star-white mb-2">Visibility Maps</h3>
//                             <p className="text-sm text-space-gray-400">
//                                 Check if events are visible from your location
//                             </p>
//                         </div>
//                         <div className="bg-space-gray-900/80 border border-space-gray-700 rounded-xl p-6 text-center hover:border-cosmic-purple/50 transition-all">
//                             <div className="text-4xl mb-3">🔔</div>
//                             <h3 className="text-lg font-bold text-star-white mb-2">Smart Alerts</h3>
//                             <p className="text-sm text-space-gray-400">
//                                 Get notified before events happen in your area
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
import { EventGrid } from '@/components/events/EventGrid';
import { fetchCelestialEvents, fetchLaunches, fetchISSOperations, fetchAsteroids } from '@/lib/fetchCelestialEvents';

// Disable static generation to allow dynamic API fetching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventsPage() {
    const [celestialEvents, launches, issOperations, asteroids] = await Promise.all([
        fetchCelestialEvents(),
        fetchLaunches(),
        fetchISSOperations(),
        fetchAsteroids(),
    ]);

    return (
        <main className="bg-space-black min-h-screen pt-24">
            <section className="relative z-10 bg-gradient-to-b from-space-black via-space-gray-900 to-space-black">
                {/* Celestial Events Section */}
                {celestialEvents.length > 0 && (
                    <EventGrid 
                        title="🌌 Upcoming Celestial Events"
                        events={celestialEvents} 
                        eventType="celestial"
                    />
                )}

                {/* Launches Section */}
                {launches.length > 0 && (
                    <EventGrid 
                        title="🚀 Upcoming Launches"
                        events={launches}
                        eventType="launch"
                    />
                )}

                {/* ISS Operations Section */}
                {issOperations.length > 0 && (
                    <EventGrid 
                        title="👨‍🚀 ISS Operations"
                        events={issOperations}
                        eventType="iss"
                    />
                )}

                {/* Asteroids Section */}
                {asteroids.length > 0 && (
                    <EventGrid 
                        title="☄️ Asteroid Flybys"
                        events={asteroids}
                        eventType="asteroid"
                    />
                )}

                {/* Loading fallback */}
                {celestialEvents.length === 0 && launches.length === 0 && issOperations.length === 0 && asteroids.length === 0 && (
                    <div className="py-20 px-8">
                        <div className="max-w-4xl mx-auto text-center">
                            <p className="text-xl text-space-gray-300 mb-4">
                                🚀 Loading events...
                            </p>
                            <p className="text-sm text-space-gray-400">
                                Make sure the backend server is running on port 5000
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
