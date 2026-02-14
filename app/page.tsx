import AnimatedHero from '@/components/hero/AnimatedHero';
import { EventGrid } from '@/components/events/EventGrid';
import { EnhancedStats } from '@/components/dashboard/QuickStats';
import { sampleEvents } from '@/data/events';
import Link from 'next/link';

export default function Home() {
    return (
        <main className="bg-space-black min-h-screen">
            {/* Animated Hero */}
            <AnimatedHero />

            {/* Dashboard Content */}
            <section className="relative z-10 bg-gradient-to-b from-space-black via-space-gray-900 to-space-black">
                <EnhancedStats />
                <EventGrid events={sampleEvents} />

                {/* Call to Action */}
                <div className="py-20 px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-star-white font-display mb-6">
                            Ready to Explore the Cosmos?
                        </h2>
                        <p className="text-lg text-space-gray-300 mb-8">
                            Join thousands of space enthusiasts discovering the universe through AstroView
                        </p>
                        <Link href="/login">
                            <button className="px-8 py-4 bg-gradient-to-r from-cosmic-purple to-nebula-pink text-white rounded-full text-lg font-semibold shadow-2xl hover:shadow-cosmic-purple/50 transition-all">
                                Get Started Free →
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
