import { CelestialEvent } from '@/types/events';

// Use backend API instead of direct Space Devs API call
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

export async function fetchCelestialEvents(): Promise<CelestialEvent[]> {
    try {
        const res = await fetch(`${BACKEND_API_URL}/events`, {
            next: { revalidate: 3600 }, // revalidate every 1 hour
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
        // Return empty array on error to prevent page crash
        return [];
    }
}

export async function fetchLaunches(): Promise<CelestialEvent[]> {
    try {
        const res = await fetch(`${BACKEND_API_URL}/launches`, {
            next: { revalidate: 3600 },
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
}

export async function fetchISSOperations(): Promise<CelestialEvent[]> {
    try {
        const res = await fetch(`${BACKEND_API_URL}/iss-operations`, {
            next: { revalidate: 3600 },
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
}

export async function fetchAsteroids(): Promise<CelestialEvent[]> {
    try {
        const res = await fetch(`${BACKEND_API_URL}/asteroids`, {
            next: { revalidate: 3600 },
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
}
