import { CelestialEvent } from '@/types/events';

// Use backend API instead of direct Space Devs API call
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

// Simple in-memory cache to reduce repeated server-side fetch latency during navigation
type CacheEntry = { ts: number; data: any };
const cache = new Map<string, CacheEntry>();

async function withCache<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
    const existing = cache.get(key);
    const now = Date.now();
    if (existing) {
        const age = now - existing.ts;
        if (age < ttlMs) {
            // fresh
            return existing.data as T;
        }

        // stale: return stale immediately, refresh in background
        (async () => {
            try {
                const startBg = Date.now();
                const data = await fetcher();
                const msBg = Date.now() - startBg;
                console.info(`[fetchCelestialEvents] background refresh ${key} took ${msBg}ms`);
                cache.set(key, { ts: Date.now(), data });
            } catch (err) {
                console.warn(`[fetchCelestialEvents] background refresh failed for ${key}:`, err);
            }
        })();

        return existing.data as T;
    }

    // No cache: fetch synchronously and populate
    const start = Date.now();
    try {
        const data = await fetcher();
        const ms = Date.now() - start;
        console.info(`[fetchCelestialEvents] ${key} fetcher took ${ms}ms`);
        cache.set(key, { ts: Date.now(), data });
        return data;
    } catch (err) {
        const ms = Date.now() - start;
        console.error(`Error in cached fetch for ${key} after ${ms}ms:`, err);
        if (existing) return existing.data as T;
        throw err;
    }
}

export async function fetchCelestialEvents(): Promise<CelestialEvent[]> {
    return withCache('celestial_events', 60_000, async () => {
        try {
            const res = await fetch(`${BACKEND_API_URL}/events`, {
                cache: 'no-store',
            });

            if (!res.ok) {
                throw new Error('Failed to fetch events from backend');
            }

            const response = await res.json();

            if (!response.success || !response.data) {
                throw new Error('Invalid response from backend');
            }

            // Transform dates from ISO strings to Date objects
            return response.data.map((event: any) => ({
                ...event,
                date: new Date(event.date),
                peakTime: new Date(event.peakTime),
                visibility: {
                    ...event.visibility,
                    bestViewTime: new Date(event.visibility.bestViewTime),
                },
            }));
        } catch (error) {
            console.error('Error fetching celestial events:', error);
            return [];
        }
    });
}

export async function fetchLaunches(): Promise<CelestialEvent[]> {
    return withCache('launches', 60_000, async () => {
        try {
            const res = await fetch(`${BACKEND_API_URL}/launches`, {
                cache: 'no-store',
            });

            if (!res.ok) {
                throw new Error('Failed to fetch launches from backend');
            }

            const response = await res.json();

            if (!response.success || !response.data) {
                throw new Error('Invalid response from backend');
            }

            return response.data.map((event: any) => ({
                ...event,
                date: new Date(event.date),
                peakTime: new Date(event.peakTime),
                visibility: {
                    ...event.visibility,
                    bestViewTime: new Date(event.visibility.bestViewTime),
                },
            }));
        } catch (error) {
            console.error('Error fetching launches:', error);
            return [];
        }
    });
}

export async function fetchISSOperations(): Promise<CelestialEvent[]> {
    return withCache('iss_operations', 60_000, async () => {
        try {
            const res = await fetch(`${BACKEND_API_URL}/iss-operations`, {
                cache: 'no-store',
            });

            if (!res.ok) {
                throw new Error('Failed to fetch ISS operations from backend');
            }

            const response = await res.json();

            if (!response.success || !response.data) {
                throw new Error('Invalid response from backend');
            }

            return response.data.map((event: any) => ({
                ...event,
                date: new Date(event.date),
                peakTime: new Date(event.peakTime),
                visibility: {
                    ...event.visibility,
                    bestViewTime: new Date(event.visibility.bestViewTime),
                },
            }));
        } catch (error) {
            console.error('Error fetching ISS operations:', error);
            return [];
        }
    });
}

export async function fetchAsteroids(): Promise<CelestialEvent[]> {
    return withCache('asteroids', 60_000, async () => {
        try {
            const res = await fetch(`${BACKEND_API_URL}/asteroids`, {
                cache: 'no-store',
            });

            if (!res.ok) {
                throw new Error('Failed to fetch asteroids from backend');
            }

            const response = await res.json();

            if (!response.success || !response.data) {
                throw new Error('Invalid response from backend');
            }

            return response.data.map((event: any) => ({
                ...event,
                date: new Date(event.date),
                peakTime: new Date(event.peakTime),
                visibility: {
                    ...event.visibility,
                    bestViewTime: new Date(event.visibility.bestViewTime),
                },
            }));
        } catch (error) {
            console.error('Error fetching asteroids:', error);
            return [];
        }
    });
}

export async function fetchAuroraEvents(): Promise<CelestialEvent[]> {
    return withCache('aurora_events', 300_000, async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/aurora`);

            if (!res.ok) {
                throw new Error('Failed to fetch aurora data');
            }

            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Transform aurora data to CelestialEvent format
            const now = new Date();
            const auroraEvent: CelestialEvent = {
                id: `aurora-${now.getTime()}`,
                name: data.event_name || 'Aurora Activity',
                type: 'aurora',
                date: new Date(data.observation_time),
                peakTime: new Date(data.observation_time),
                duration: 180, // 3 hours typical duration
                visibility: {
                    location: 'Global - High Latitudes',
                    coordinates: { lat: 65, lng: 0 }, // Northern high latitude
                    bestViewTime: new Date(data.observation_time),
                    direction: 'N',
                    visibilityScore: data.visibility_score || 0,
                },
                description: {
                    simple: data.description || 'Aurora borealis activity',
                    detailed: `Real-time aurora activity with KP index of ${data.kp_index}. ${
                        data.kp_index >= 5
                            ? 'Visible in mid-latitudes!'
                            : 'Best viewed from high northern latitudes.'
                    }`,
                },
                whyItMatters: `KP Index: ${data.kp_index}. ${
                    data.kp_index >= 7
                        ? 'Rare global aurora event!'
                        : data.kp_index >= 5
                        ? 'Aurora visible in mid-latitudes'
                        : 'Aurora activity at high latitudes'
                }`,
                observationTips: [
                    'Best viewed away from city lights',
                    'Look towards the northern horizon',
                    'Peak activity typically around midnight',
                    'Check local weather for clear skies',
                ],
                weatherDependent: true,
                images: [],
            };

            return [auroraEvent];
        } catch (error) {
            console.error('Error fetching aurora events:', error);
            return [];
        }
    });
}

export async function fetchSolarFlares(): Promise<CelestialEvent[]> {
    return withCache('solar_flares', 600_000, async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/solar-flares`);

            if (!res.ok) {
                throw new Error('Failed to fetch solar flare data');
            }

            const response = await res.json();
            const data = response.flares || response;

            if (!Array.isArray(data)) {
                throw new Error('Invalid data format');
            }

            // Transform solar flare data to CelestialEvent format
            return data.slice(0, 5).map((flare: any, index: number) => {
                const beginTime = new Date(flare.begin_time);
                const maxTime = new Date(flare.max_time);
                const endTime = new Date(flare.end_time);
                const duration = (endTime.getTime() - beginTime.getTime()) / 60000; // minutes

                const flareClass = flare.current_class || 'Unknown';
                const visibilityScore = flareClass.startsWith('X')
                    ? 90
                    : flareClass.startsWith('M')
                    ? 70
                    : 50;

                return {
                    id: `solar-flare-${flare.begin_time}-${index}`,
                    name: `Solar Flare ${flareClass}`,
                    type: 'aurora' as EventType, // Using aurora type for space weather
                    date: beginTime,
                    peakTime: maxTime,
                    duration: Math.round(duration),
                    visibility: {
                        location: 'Sun-Earth System',
                        coordinates: { lat: 0, lng: 0 },
                        bestViewTime: maxTime,
                        direction: 'N' as const,
                        visibilityScore,
                    },
                    description: {
                        simple: `${flareClass} class solar flare detected`,
                        detailed: `Solar flare of class ${flareClass} detected by GOES satellite. Begin: ${beginTime.toLocaleString()}, Peak: ${maxTime.toLocaleString()}, End: ${endTime.toLocaleString()}`,
                    },
                    whyItMatters: `${
                        flareClass.startsWith('X')
                            ? 'Strong solar flare - may cause radio blackouts and aurora'
                            : flareClass.startsWith('M')
                            ? 'Moderate solar flare - minor impacts possible'
                            : 'Minor solar flare detected'
                    }`,
                    observationTips: [
                        'Solar flares can cause radio blackouts',
                        'May trigger auroras in 1-3 days',
                        'Monitor space weather forecasts',
                        'X-class flares can impact satellites',
                    ],
                    weatherDependent: false,
                    images: [],
                };
            });
        } catch (error) {
            console.error('Error fetching solar flares:', error);
            return [];
        }
    });
}
