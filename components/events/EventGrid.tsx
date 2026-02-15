'use client';

import { EventCard } from './EventCard';
import { CelestialEvent } from '@/types/events';

interface EventGridProps {
    events: CelestialEvent[];
    title?: string;
    eventType?: string;
}

export function EventGrid({ events, title = 'Upcoming Celestial Events', eventType = 'celestial' }: EventGridProps) {
    return (
        <div className="py-20 px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-star-white font-display mb-4">
                        {title}
                    </h2>
                    <p className="text-lg text-space-gray-300 max-w-2xl mx-auto">
                        {eventType === 'celestial' && 'Never miss a meteor shower, eclipse, or satellite pass. Get personalized alerts based on your location.'}
                        {eventType === 'launch' && 'Watch upcoming rocket launches from around the world.'}
                        {eventType === 'iss' && 'Track International Space Station operations and activities.'}
                        {eventType === 'asteroid' && 'Monitor near-Earth asteroid flybys and close approaches.'}
                        {eventType === 'aurora' && 'Real-time aurora activity tracking based on solar storm intensity (KP Index).'}
                        {eventType === 'solar-flare' && 'Monitor solar flares and space weather events that may impact Earth.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event, index) => (
                        <EventCard 
                            key={event.id} 
                            event={event} 
                            index={index}
                            eventType={eventType}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
