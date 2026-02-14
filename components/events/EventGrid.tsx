'use client';

import { EventCard } from './EventCard';
import { CelestialEvent } from '@/types/events';

interface EventGridProps {
    events: CelestialEvent[];
}

export function EventGrid({ events }: EventGridProps) {
    return (
        <div className="py-20 px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-star-white font-display mb-4">
                        Upcoming Celestial Events
                    </h2>
                    <p className="text-lg text-space-gray-300 max-w-2xl mx-auto">
                        Never miss a meteor shower, eclipse, or satellite pass. Get personalized alerts based on your location.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event, index) => (
                        <EventCard key={event.id} event={event} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}
