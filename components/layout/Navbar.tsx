'use client';

import { motion } from 'framer-motion';
import { Rocket, Github, Twitter } from 'lucide-react';
import Link from 'next/link';

export function Navbar() {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-space-black/80 backdrop-blur-lg border-b border-space-gray-800"
        >
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Rocket className="w-6 h-6 text-cosmic-purple" />
                        </motion.div>
                        <span className="text-xl font-bold font-display text-star-white group-hover:text-cosmic-purple transition-colors">
                            AstroView
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/events" className="text-space-gray-300 hover:text-star-white transition-colors">
                            Events
                        </Link>
                        <Link href="/missions" className="text-space-gray-300 hover:text-star-white transition-colors">
                            Missions
                        </Link>
                        <Link href="/impact" className="text-space-gray-300 hover:text-star-white transition-colors">
                            Impact
                        </Link>
                        <Link href="/learn" className="text-space-gray-300 hover:text-star-white transition-colors">
                            Learn
                        </Link>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 bg-cosmic-purple hover:bg-cosmic-purple/80 text-white rounded-full font-semibold transition-colors"
                    >
                        Get Started
                    </motion.button>
                </div>
            </div>
        </motion.nav>
    );
}
