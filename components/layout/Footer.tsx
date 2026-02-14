'use client';

import { motion } from 'framer-motion';
import { Rocket, Github, Twitter, Mail } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-space-gray-900 border-t border-space-gray-800">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Rocket className="w-6 h-6 text-cosmic-purple" />
                            <span className="text-xl font-bold font-display text-star-white">
                                AstroView
                            </span>
                        </div>
                        <p className="text-space-gray-300 mb-4 max-w-md">
                            Making the universe accessible to everyone. Real-time space data, simplified for students, educators, and space enthusiasts.
                        </p>
                        <div className="flex gap-4">
                            <motion.a
                                whileHover={{ scale: 1.1 }}
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-space-gray-500 hover:text-star-white transition-colors"
                            >
                                <Github className="w-5 h-5" />
                            </motion.a>
                            <motion.a
                                whileHover={{ scale: 1.1 }}
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-space-gray-500 hover:text-star-white transition-colors"
                            >
                                <Twitter className="w-5 h-5" />
                            </motion.a>
                            <motion.a
                                whileHover={{ scale: 1.1 }}
                                href="mailto:hello@astroview.space"
                                className="text-space-gray-500 hover:text-star-white transition-colors"
                            >
                                <Mail className="w-5 h-5" />
                            </motion.a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-star-white font-semibold mb-4">Explore</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/events" className="text-space-gray-300 hover:text-star-white transition-colors">
                                    Celestial Events
                                </Link>
                            </li>
                            <li>
                                <Link href="/missions" className="text-space-gray-300 hover:text-star-white transition-colors">
                                    Space Missions
                                </Link>
                            </li>
                            <li>
                                <Link href="/satellites" className="text-space-gray-300 hover:text-star-white transition-colors">
                                    Satellite Tracker
                                </Link>
                            </li>
                            <li>
                                <Link href="/impact" className="text-space-gray-300 hover:text-star-white transition-colors">
                                    Real-World Impact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-star-white font-semibold mb-4">Learn</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/learn" className="text-space-gray-300 hover:text-star-white transition-colors">
                                    Educational Content
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-space-gray-300 hover:text-star-white transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/api" className="text-space-gray-300 hover:text-star-white transition-colors">
                                    API Documentation
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-space-gray-300 hover:text-star-white transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-space-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-space-gray-500 text-sm">
                        © 2026 AstroView. Made with ❤️ for space enthusiasts.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link href="/privacy" className="text-space-gray-500 hover:text-star-white transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-space-gray-500 hover:text-star-white transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
