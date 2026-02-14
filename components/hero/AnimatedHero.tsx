'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SimpleHero() {
    const router = useRouter();

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/hero-bg.png"
                    alt="Earth from space with satellite"
                    fill
                    priority
                    className="object-cover"
                    sizes="100vw"
                    quality={90}
                />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-space-black/70 via-space-black/50 to-space-black/80" />
            </div>

            {/* Fallback gradient if image not loaded */}
            <div className="absolute inset-0 bg-gradient-to-b from-space-black via-space-gray-900 to-space-black -z-10" />

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-8 text-center">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-full mb-8 backdrop-blur-sm"
                >
                    <span className="w-2 h-2 bg-cosmic-purple rounded-full animate-pulse" />
                    <span className="text-sm text-cosmic-purple font-medium">Real-time Space Data Platform</span>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold text-star-white font-display mb-6 leading-tight"
                >
                    Explore the Universe
                    <br />
                    <span className="bg-gradient-to-r from-cosmic-purple via-nebula-pink to-galaxy-cyan bg-clip-text text-transparent">
                        Like Never Before
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-xl md:text-2xl text-space-gray-300 mb-12 max-w-3xl mx-auto"
                >
                    Track celestial events, monitor satellites, and discover how space technology impacts Earth—all in real-time.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/login')}
                        className="group px-8 py-4 bg-gradient-to-r from-cosmic-purple to-nebula-pink text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-cosmic-purple/50 transition-all flex items-center gap-2"
                    >
                        Start Exploring
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push('/events')}
                        className="px-8 py-4 bg-space-gray-800/50 backdrop-blur-sm border border-space-gray-700 text-star-white rounded-full font-semibold text-lg hover:bg-space-gray-700/50 transition-all"
                    >
                        View Events
                    </motion.button>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto"
                >
                    {[
                        { value: '5,000+', label: 'Satellites Tracked' },
                        { value: '24/7', label: 'Live Updates' },
                        { value: '50K+', label: 'Active Users' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center backdrop-blur-sm bg-space-black/30 rounded-lg p-4">
                            <div className="text-3xl md:text-4xl font-bold text-star-white font-display mb-1">
                                {stat.value}
                            </div>
                            <div className="text-sm text-space-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-6 h-10 border-2 border-star-white/30 rounded-full flex items-start justify-center p-2"
                >
                    <div className="w-1 h-3 bg-star-white/50 rounded-full" />
                </motion.div>
            </motion.div>

        </div>
    );
}
