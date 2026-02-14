'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Bell, Eye } from 'lucide-react';
import { CelestialEvent, EventType } from '@/types/events';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';

interface EventCardProps {
    event: CelestialEvent;
    index: number;
    eventType?: string;
}

export function EventCard({ event, index, eventType = 'celestial' }: EventCardProps) {
    const getEventIcon = (type: EventType) => {
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
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-space-gray-900/80 backdrop-blur-sm border border-space-gray-700 hover:border-cosmic-purple/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
        >
            {/* Event Icon & Name */}
            <div className="flex items-start gap-3 mb-4">
                <span className="text-4xl">{getEventIcon(event.type)}</span>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-star-white font-display">
                        {event.name}
                    </h3>
                    <p className="text-sm text-space-gray-500 capitalize">{event.type.replace('-', ' ')}</p>
                </div>
            </div>

            {/* Description */}
            <p className="text-space-gray-300 text-sm mb-4 line-clamp-2">
                {event.description.simple}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-galaxy-cyan" />
                    <span className="text-space-gray-300">
                        {formatDistanceToNow(event.peakTime, { addSuffix: true })}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4 text-aurora-green" />
                    <span className="text-space-gray-300">{event.visibility.visibilityScore}% visible</span>
                </div>
                <div className="flex items-center gap-2 text-sm col-span-2">
                    <Calendar className="w-4 h-4 text-meteor-orange" />
                    <span className="text-space-gray-300">
                        Start: {format(event.date, 'MMM d, yyyy h:mm a')}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm col-span-2">
                    <MapPin className="w-4 h-4 text-nebula-pink" />
                    <span className="text-space-gray-300">Best view: {event.visibility.direction} sky</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 py-2 px-4 bg-cosmic-purple hover:bg-cosmic-purple/90 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                    <Bell className="w-4 h-4" />
                    Remind Me
                </motion.button>
                <Link href={`/events/${event.id}?type=${eventType}`} className="flex-1">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2 px-4 bg-space-gray-800 hover:bg-space-gray-700 text-star-white border border-space-gray-700 rounded-lg font-semibold text-sm transition-colors"
                    >
                        Details
                    </motion.button>
                </Link>
            </div>
        </motion.div>
    );
}
