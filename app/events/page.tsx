import { EventGrid } from '@/components/events/EventGrid';
import {
    fetchAsteroids,
    fetchCelestialEvents,
    fetchISSOperations,
    fetchLaunches,
} from '@/lib/fetchCelestialEvents';

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
                {celestialEvents.length === 0 &&
                    launches.length === 0 &&
                    issOperations.length === 0 &&
                    asteroids.length === 0 && (
                        <div className="py-20 px-8">
                            <div className="max-w-4xl mx-auto text-center">
                                <p className="text-xl text-space-gray-300 mb-4">🚀 Loading events...</p>
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
