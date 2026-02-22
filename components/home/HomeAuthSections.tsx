'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { GradientText } from '@/components/ui/GradientText';

export default function HomeAuthSections() {
    const { user, loading } = useAuth();
    const router = useRouter();

    return (
        <>
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
        </>
    );
}
