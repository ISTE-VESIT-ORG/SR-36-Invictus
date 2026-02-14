'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface StarfieldProps {
    className?: string; // Additional classes
    density?: 'low' | 'medium' | 'high'; // Control number of stars
    speed?: 'slow' | 'medium' | 'fast'; // Control animation speed
}

export function Starfield({ className = '', density = 'medium', speed = 'medium' }: StarfieldProps) {
    const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; delay: number; duration: number }[]>([]);

    useEffect(() => {
        // Generate stars on mount
        const count = density === 'low' ? 30 : density === 'medium' ? 60 : 100;
        const newStars = Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: Math.random() * 100, // percentage
            y: Math.random() * 100, // percentage
            size: Math.random() * 2 + 1, // px
            delay: Math.random() * 5, // s
            duration: Math.random() * 3 + (speed === 'slow' ? 4 : speed === 'medium' ? 2 : 1), // s
        }));
        setStars(newStars);
    }, [density, speed]);

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {/* Helper gradient for depth - optional */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-space-black/20" />

            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute bg-white rounded-full will-change-transform"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                    }}
                    animate={{
                        opacity: [0.2, 0.8, 0.2],
                        scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}
