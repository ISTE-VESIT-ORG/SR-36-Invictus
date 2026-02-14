'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Info, Thermometer, Ruler, Orbit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Planet Data
const celestialBodies = [
    {
        name: 'Sun',
        type: 'Star',
        description: 'The star at the center of our Solar System. It is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions in its core.',
        details: 'The Sun radiates energy mainly as visible light, ultraviolet light, and infrared radiation. It allows life to exist on Earth.',
        color: 'from-yellow-400 via-orange-500 to-red-600',
        shadowColor: 'shadow-orange-500/50',
        stats: {
            diameter: '1.39 million km',
            temperature: '5,500°C (Surface)',
            distance: '0 AU',
            moons: '0',
        },
    },
    {
        name: 'Mercury',
        type: 'Terrestrial Planet',
        description: 'The smallest planet in the Solar System and the closest to the Sun. It has no atmosphere to speak of to keep heat in.',
        details: 'Mercury\'s surface resembles that of the Earth\'s Moon, scarred by many impact craters resulting from collisions with meteoroids and comets.',
        color: 'from-gray-300 via-gray-400 to-gray-500',
        shadowColor: 'shadow-gray-400/50',
        stats: {
            diameter: '4,880 km',
            temperature: '-173°C to 427°C',
            distance: '0.39 AU',
            moons: '0',
        },
    },
    {
        name: 'Venus',
        type: 'Terrestrial Planet',
        description: 'The second planet from the Sun. It is named after the Roman goddess of love and beauty.',
        details: 'Venus has a thick, toxic atmosphere filled with carbon dioxide and it\'s perpetually shrouded in thick, yellowish clouds of sulfuric acid.',
        color: 'from-yellow-200 via-orange-300 to-orange-400',
        shadowColor: 'shadow-orange-300/50',
        stats: {
            diameter: '12,104 km',
            temperature: '462°C',
            distance: '0.72 AU',
            moons: '0',
        },
    },
    {
        name: 'Earth',
        type: 'Terrestrial Planet',
        description: 'Our home planet is the third planet from the Sun, and the only place we know of so far that\'s inhabited by living things.',
        details: 'Earth is the only planet in our solar system with liquid water on the surface.',
        color: 'from-blue-400 via-green-400 to-blue-600',
        shadowColor: 'shadow-blue-400/50',
        stats: {
            diameter: '12,742 km',
            temperature: '-88°C to 58°C',
            distance: '1 AU',
            moons: '1',
        },
    },
    {
        name: 'Mars',
        type: 'Terrestrial Planet',
        description: 'The fourth planet from the Sun – a dusty, cold, desert world with a very thin atmosphere.',
        details: 'Mars is also a dynamic planet with seasons, polar ice caps, canyons, extinct volcanoes, and evidence that it was even more active in the past.',
        color: 'from-red-400 via-red-600 to-orange-700',
        shadowColor: 'shadow-red-500/50',
        stats: {
            diameter: '6,779 km',
            temperature: '-87°C to -5°C',
            distance: '1.52 AU',
            moons: '2',
        },
    },
    {
        name: 'Jupiter',
        type: 'Gas Giant',
        description: 'Fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun.',
        details: 'Jupiter\'s familiar stripes and swirls are actually cold, windy clouds of ammonia and water, floating in an atmosphere of hydrogen and helium.',
        color: 'from-orange-200 via-yellow-700 to-orange-900',
        shadowColor: 'shadow-orange-400/50',
        stats: {
            diameter: '139,820 km',
            temperature: '-108°C',
            distance: '5.2 AU',
            moons: '95',
        },
    },
    {
        name: 'Saturn',
        type: 'Gas Giant',
        description: 'The sixth planet from the Sun and the second-largest in the Solar System, after Jupiter. It is a gas giant with an average radius of about nine and a half times that of Earth.',
        details: 'Adorned with a dazzling system of icy rings, Saturn is unique among the planets. It is not the only planet to have rings, but none are as spectacular or as complex as Saturn\'s.',
        color: 'from-yellow-200 via-yellow-500 to-yellow-800',
        shadowColor: 'shadow-yellow-400/50',
        stats: {
            diameter: '116,460 km',
            temperature: '-139°C',
            distance: '9.58 AU',
            moons: '146',
        },
        hasRings: true,
    },
    {
        name: 'Uranus',
        type: 'Ice Giant',
        description: 'The seventh planet from the Sun. It has the third-largest planetary radius and fourth-largest planetary mass in the Solar System.',
        details: 'Uranus is very cold and windy. The ice giant is surrounded by 13 faint rings and 27 small moons as it rotates at a nearly 90-degree angle from the plane of its orbit.',
        color: 'from-cyan-200 via-cyan-400 to-blue-500',
        shadowColor: 'shadow-cyan-400/50',
        stats: {
            diameter: '50,724 km',
            temperature: '-197°C',
            distance: '19.2 AU',
            moons: '27',
        },
    },
    {
        name: 'Neptune',
        type: 'Ice Giant',
        description: 'The eighth and farthest-known Solar planet from the Sun. In the Solar System, it is the fourth-largest planet by diameter, the third-most-massive planet, and the densest giant planet.',
        details: 'Dark, cold, and whipped by supersonic winds, ice giant Neptune is the eighth and most distant planet in our solar system.',
        color: 'from-blue-600 via-blue-700 to-indigo-900',
        shadowColor: 'shadow-blue-600/50',
        stats: {
            diameter: '49,244 km',
            temperature: '-201°C',
            distance: '30.1 AU',
            moons: '14',
        },
    },
];

export default function SolarSystemTour() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const nextPlanet = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % celestialBodies.length);
    };

    const prevPlanet = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + celestialBodies.length) % celestialBodies.length);
    };

    const currentBody = celestialBodies[currentIndex];

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
        }),
    };

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative font-sans text-white">
            {/* Animated Starfield Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-space-gray-900 via-black to-black opacity-80" />

                {/* Animated Stars (CSS) */}
                {[...Array(50)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-white rounded-full"
                        initial={{
                            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                            scale: Math.random() * 0.5 + 0.5,
                            opacity: Math.random() * 0.5 + 0.2,
                        }}
                        animate={{
                            opacity: [0.2, 0.8, 0.2],
                            scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        style={{
                            width: Math.random() * 2 + 1 + 'px',
                            height: Math.random() * 2 + 1 + 'px',
                        }}
                    />
                ))}
            </div>

            {/* Back Button */}
            <Link href="/learn" className="absolute top-8 left-8 z-50 flex items-center gap-2 text-white/70 hover:text-white transition-colors group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-semibold tracking-wide">Exit Tour</span>
            </Link>

            {/* Main Content Area */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">

                {/* Planet Visual */}
                <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] flex items-center justify-center perspective-1000">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="absolute w-full h-full flex items-center justify-center"
                        >
                            <div className={`relative w-4/5 h-4/5 rounded-full bg-gradient-to-br ${currentBody.color} ${currentBody.shadowColor} shadow-[0_0_60px_rgba(0,0,0,0.6)]`}>
                                {/* Rings for Saturn */}
                                {currentBody.hasRings && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[40%] rounded-[50%] border-[20px] border-yellow-200/30 rotate-12 shadow-[0_0_20px_rgba(255,255,100,0.2)]" />
                                )}
                                {/* Atmosphere Glow */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/60 via-transparent to-white/20" />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Controls */}
                <div className="absolute bottom-12 w-full max-w-4xl px-8 flex items-center justify-between">
                    <button
                        onClick={prevPlanet}
                        className="p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all active:scale-95 group"
                    >
                        <ChevronLeft className="w-8 h-8 text-white group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <div className="text-center space-y-2">
                        <motion.h1
                            key={currentBody.name}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-4xl md:text-6xl font-bold font-display uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60"
                        >
                            {currentBody.name}
                        </motion.h1>
                        <motion.p
                            key={currentBody.type}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-white/60 text-lg font-light tracking-widest uppercase"
                        >
                            {currentBody.type}
                        </motion.p>
                    </div>

                    <button
                        onClick={nextPlanet}
                        className="p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all active:scale-95 group"
                    >
                        <ChevronRight className="w-8 h-8 text-white group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Info Panel (Floating) */}
                <motion.div
                    key={`${currentBody.name}-info`}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute top-24 right-8 w-80 md:w-96 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
                >
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-cosmic-purple" />
                        Planetary Facts
                    </h3>

                    <p className="text-white/80 text-sm leading-relaxed mb-6">
                        {currentBody.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                                <Ruler className="w-3 h-3" />
                                Diameter
                            </div>
                            <div className="text-white font-mono text-sm">{currentBody.stats.diameter}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                                <Thermometer className="w-3 h-3" />
                                Temp
                            </div>
                            <div className="text-white font-mono text-sm">{currentBody.stats.temperature}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                                <Orbit className="w-3 h-3" />
                                Distance
                            </div>
                            <div className="text-white font-mono text-sm">{currentBody.stats.distance}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                                <div className="w-3 h-3 rounded-full border border-white/50" />
                                Moons
                            </div>
                            <div className="text-white font-mono text-sm">{currentBody.stats.moons}</div>
                        </div>
                    </div>
                </motion.div>

                {/* Progress Dots */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                    {celestialBodies.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setDirection(idx > currentIndex ? 1 : -1);
                                setCurrentIndex(idx);
                            }}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white' : 'bg-white/30 hover:bg-white/50'
                                }`}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}
