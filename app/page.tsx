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

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Redirect authenticated users to the Events page
    if (!loading && user) {
        router.push('/events');
        return null; // Don't render anything while redirecting
    }

    return (
        <main className="bg-space-black min-h-screen">
            {/* Animated Hero */}
            <AnimatedHero />

            {/* Content for Authenticated Users - Removed as we redirect to /events */}


            {/* Call to Action for Guests */}
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
                            Get Started Free →
                        </button>
                    </div>
                </section>
            )}
        </main>
    );
}
