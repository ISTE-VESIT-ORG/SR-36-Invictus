'use client';

import { motion } from 'framer-motion';
import { Rocket, Github, Twitter, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { GlowingButton } from '@/components/ui/GlowingButton';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

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
                    {user && (
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
                    )}

                    {/* CTA Button or User Profile */}
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-star-white font-medium">
                                <div className="w-8 h-8 rounded-full bg-cosmic-purple/20 flex items-center justify-center border border-cosmic-purple/50">
                                    <UserIcon className="w-4 h-4 text-cosmic-purple" />
                                </div>
                                <span className="hidden sm:inline">{user.displayName || 'Explorer'}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-space-gray-400 hover:text-white"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <GlowingButton
                            onClick={() => router.push('/login')}
                            className="text-sm px-6 py-2"
                        >
                            Get Started
                        </GlowingButton>
                    )}
                </div>
            </div>
        </motion.nav>
    );
}
