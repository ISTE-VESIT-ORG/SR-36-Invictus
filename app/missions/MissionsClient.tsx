'use client';

import Image from 'next/image';
import { Rocket, Calendar, MapPin, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCallback } from 'react';

interface Mission {
  id: string;
  mission_name: string;
  agency_name: string;
  launch_date: string;
  mission_status: string;
  description: string;
  image_url: string | null;
    rover_image_url?: string | null;
}

interface MissionsClientProps {
  initialMissions: Mission[];
}

export default function MissionsClient({ initialMissions }: MissionsClientProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (process.env.NODE_ENV === 'development' && initialMissions.length > 0) {
            console.log('[Missions] Loaded missions:', initialMissions.length);
            console.log('[Missions] Sample mission data:', {
                hasImageUrl: initialMissions[0]?.image_url,
                hasRoverUrl: initialMissions[0]?.rover_image_url,
                missionName: initialMissions[0]?.mission_name
            });
        }
    }, [initialMissions]);

    // Prefetch important routes and warm API endpoints to reduce navigation latency
    const warmEndpoint = useCallback(async (url: string, timeoutMs = 3000) => {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeoutMs);
            await fetch(url, { signal: controller.signal, cache: 'no-store' });
            clearTimeout(id);
        } catch (err) {
            // ignore errors — warming is best-effort
            // console.debug('[Missions] warmEndpoint failed', url, err);
        }
    }, []);

    useEffect(() => {
        // Prefetch page code and warm server APIs
        try {
            router.prefetch('/events');
            router.prefetch('/impact');
            router.prefetch('/learn');

            // Warm API endpoints (best-effort, short timeout)
            const backend = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api').replace(/\/$/, '');
            warmEndpoint(`${backend}/events`);
            warmEndpoint(`${backend}/impact/summary`);
            warmEndpoint(`${backend}/learning-content`);
        } catch (e) {
            // ignore
        }
    }, [router, warmEndpoint]);

    const handleImageError = (missionId: string) => {
        setImageErrors(prev => new Set(prev).add(missionId));
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-space-black flex items-center justify-center">
                <Rocket className="w-12 h-12 text-cosmic-purple animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    const isMarsRoverMission = (mission: Mission) => {
        const name = mission.mission_name.toLowerCase();
        const description = (mission.description || '').toLowerCase();
        return (
            name.includes('mars') ||
            name.includes('rover') ||
            name.includes('curiosity') ||
            name.includes('perseverance') ||
            name.includes('opportunity') ||
            name.includes('spirit') ||
            description.includes('mars') ||
            description.includes('rover') ||
            description.includes('curiosity') ||
            description.includes('perseverance') ||
            description.includes('opportunity') ||
            description.includes('spirit')
        );
    };

    // Dynamic stats
    const activeCount = initialMissions.length;
    const upcomingCount = initialMissions.filter(m => new Date(m.launch_date) > new Date()).length;
    const uniqueAgencies = new Set(initialMissions.map(m => m.agency_name)).size;
    const astronautsCount = "450+"; // Placeholder

    return (
        <div className="min-h-screen bg-space-black pt-24 pb-16">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/iss.png"
                    alt="International Space Station"
                    fill
                    className="object-cover opacity-20"
                    quality={85}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-space-black via-space-black/80 to-space-black" />
            </div>

            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold text-star-white font-display mb-4">
                        Space Missions
                    </h1>
                    <p className="text-xl text-space-gray-300 max-w-2xl mx-auto">
                        Follow active missions from NASA, ISRO, SpaceX, and space agencies worldwide.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-space-gray-900/80 backdrop-blur-sm border border-space-gray-700 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-cosmic-purple mb-1">{activeCount}</div>
                        <div className="text-sm text-space-gray-400">Active Missions</div>
                    </div>
                    <div className="bg-space-gray-900/80 backdrop-blur-sm border border-space-gray-700 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-galaxy-cyan mb-1">{upcomingCount}</div>
                        <div className="text-sm text-space-gray-400">Upcoming Launches</div>
                    </div>
                    <div className="bg-space-gray-900/80 backdrop-blur-sm border border-space-gray-700 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-aurora-green mb-1">{uniqueAgencies}</div>
                        <div className="text-sm text-space-gray-400">Space Agencies</div>
                    </div>
                    <div className="bg-space-gray-900/80 backdrop-blur-sm border border-space-gray-700 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-nebula-pink mb-1">{astronautsCount}</div>
                        <div className="text-sm text-space-gray-400">Astronauts</div>
                    </div>
                </div>

                {/* Missions Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {initialMissions.map((mission) => (
                        <div
                            key={mission.id}
                            className="bg-space-gray-900/80 backdrop-blur-sm border border-space-gray-700 hover:border-cosmic-purple/50 rounded-2xl p-6 transition-all duration-300 flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 min-w-[48px] rounded-lg overflow-hidden bg-space-gray-800 flex-shrink-0">
                                         {(() => {
                                            const hasImageError = imageErrors.has(mission.id);
                                            
                                            // Try rover image first for Mars missions
                                            if (isMarsRoverMission(mission) && mission.rover_image_url && !hasImageError) {
                                                return (
                                                    <Image 
                                                        src={mission.rover_image_url}
                                                        alt="Mars rover"
                                                        fill
                                                        sizes="48px"
                                                        className="object-cover" 
                                                        onError={() => handleImageError(mission.id)}
                                                    />
                                                );
                                            }

                                            // Try mission image
                                            if (mission.image_url && !hasImageError) {
                                                return (
                                                    <Image 
                                                        src={mission.image_url} 
                                                        alt={mission.mission_name} 
                                                        fill
                                                        sizes="48px"
                                                        className="object-cover" 
                                                        onError={() => handleImageError(mission.id)}
                                                    />
                                                );
                                            }

                                            // Fallback: Rocket icon
                                            return (
                                                <div className="w-full h-full bg-gradient-to-br from-cosmic-purple/20 to-galaxy-cyan/20 rounded-lg flex items-center justify-center">
                                                    <Rocket className="w-6 h-6 text-cosmic-purple" />
                                                </div>
                                            );
                                         })()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-star-white font-display line-clamp-1" title={mission.mission_name}>
                                            {mission.mission_name}
                                        </h3>
                                        <p className="text-sm text-cosmic-purple font-medium">{mission.agency_name}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                                    mission.mission_status === 'Active' ? 'bg-aurora-green/20 text-aurora-green' :
                                    mission.mission_status === 'Go for Launch' ? 'bg-galaxy-cyan/20 text-galaxy-cyan' :
                                    mission.mission_status === 'TBD' ? 'bg-meteor-orange/20 text-meteor-orange' :
                                    mission.mission_status.toLowerCase().includes('success') ? 'bg-nebula-pink/20 text-nebula-pink' :
                                        'bg-space-gray-700 text-space-gray-300'
                                    }`}>
                                    {mission.mission_status}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4 flex-grow">
                                <div className="flex items-center gap-2 text-space-gray-300">
                                    <Calendar className="w-4 h-4 text-galaxy-cyan" />
                                    <span className="text-sm">Launch: {new Date(mission.launch_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-space-gray-300">
                                    <TrendingUp className="w-4 h-4 text-aurora-green" />
                                    <span className="text-sm truncate">Status: {mission.mission_status}</span>
                                </div>
                            </div>

                            <p className="text-space-gray-300 text-sm mb-4 line-clamp-3">
                                {mission.description}
                            </p>

                            <Link 
                                href={`/missions/${mission.id}`}
                                onMouseEnter={() => {
                                    // Prefetch mission detail page and warm its backend route
                                    try {
                                        router.prefetch(`/missions/${mission.id}`);
                                        const backend = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api').replace(/\/$/, '');
                                        warmEndpoint(`${backend}/missions/${mission.id}`);
                                    } catch (e) {}
                                }}
                                className="w-full py-2 px-4 bg-space-gray-800 hover:bg-space-gray-700 text-star-white border border-space-gray-700 rounded-lg font-semibold text-sm transition-colors text-center block"
                            >
                                View Details →
                            </Link>
                        </div>
                    ))}
                </div>
                
                {initialMissions.length === 0 && (
                    <div className="text-center py-20">
                        <h2 className="text-3xl font-display text-gray-500">No missions found currently.</h2>
                    </div>
                )}
            </div>
        </div>
    );
}
