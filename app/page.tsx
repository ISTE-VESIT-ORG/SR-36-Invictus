'use client';

import AnimatedHero from '@/components/hero/AnimatedHero';
import { EventGrid } from '@/components/events/EventGrid';
import { EnhancedStats } from '@/components/dashboard/QuickStats';
import { sampleEvents } from '@/data/events';
import Link from 'next/link';
import { GlowingButton } from '@/components/ui/GlowingButton';
import { GradientText } from '@/components/ui/GradientText';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ApodSection } from '@/components/apod/ApodSection';
import { useState, useEffect } from 'react';

interface ApodData {
    date: string;
    title: string;
    explanation: string;
    url: string;
    hdurl?: string;
    media_type: 'image' | 'video';
    copyright?: string;
}

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [apodData, setApodData] = useState<ApodData | null>(null);
    const [apodLoading, setApodLoading] = useState(true);
    const [apodError, setApodError] = useState<string | null>(null);

    // Fetch APOD data
    useEffect(() => {
        async function fetchApod() {
            try {
                const response = await fetch('/api/apod');
                if (!response.ok) {
                    throw new Error('Failed to fetch APOD');
                }
                const data = await response.json();
                setApodData(data);
            } catch (error) {
                console.error('Error fetching APOD:', error);
                setApodError('Unable to load today\'s space image');
            } finally {
                setApodLoading(false);
            }
        }

        fetchApod();
    }, []);

    return (
        <main className="bg-space-black min-h-screen">
            {/* Animated Hero */}
            <AnimatedHero />

            {/* Call to Action - Show only for guests */}
            {!user && !loading && (
                <section className="relative z-10 py-20 px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-star-white font-display mb-6">
                            <GradientText animate>Ready to Explore the Cosmos?</GradientText>
                        </h2>
                        <p className="text-lg text-space-gray-300 mb-8">
                            Join thousands of space enthusiasts discovering the universe through AstroView
                        </p>
                        <button
                            onClick={() => router.push('/login')}
                            className="px-8 py-4 bg-gradient-to-r from-cosmic-purple to-nebula-pink text-white rounded-full text-lg font-semibold shadow-2xl hover:shadow-cosmic-purple/50 transition-all"
                        >
                            Start Exploring →
                        </button>
                    </div>
                </section>
            )}

            {/* Welcome message for logged-in users */}
            {user && !loading && (
                <section className="relative z-10 py-20 px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-star-white font-display mb-6">
                            <GradientText animate>Welcome Back, {user.displayName || 'Explorer'}!</GradientText>
                        </h2>
                        <p className="text-lg text-space-gray-300 mb-8">
                            Continue your cosmic journey by exploring the latest space events and missions
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => router.push('/events')}
                                className="px-8 py-4 bg-gradient-to-r from-cosmic-purple to-nebula-pink text-white rounded-full text-lg font-semibold shadow-2xl hover:shadow-cosmic-purple/50 transition-all"
                            >
                                View Events →
                            </button>
                            <button
                                onClick={() => router.push('/missions')}
                                className="px-8 py-4 bg-space-gray-800 hover:bg-space-gray-700 text-white rounded-full text-lg font-semibold border border-space-gray-700 transition-all"
                            >
                                Browse Missions
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* NASA APOD Section */}
            <ApodSection 
                apodData={apodData} 
                loading={apodLoading} 
                error={apodError} 
            />
        </main>
    );
}
