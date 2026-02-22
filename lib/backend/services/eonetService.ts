// NASA EONET v3 API Service

export interface EonetEvent {
    id: string;
    title: string;
    description: string | null;
    link: string;
    categories: { id: string; title: string }[];
    sources: { id: string; url: string }[];
    geometry?: {
        date: string;
        type: string;
        coordinates: number[];
        magnitudeValue?: number;
        magnitudeUnit?: string;
    }[];
    geometries?: {
        date: string;
        type: string;
        coordinates: number[]; // Look like [lng, lat] for Point
        magnitudeValue?: number;
        magnitudeUnit?: string;
    }[];
}

import { fetchWithRetry } from '@/lib/backend/fetchWithRetry';

export const eonetService = {
    async fetchActiveDisasters(): Promise<EonetEvent[]> {
        const API_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=20'; // Fetch last 20 days to ensure freshness
        
        try {
            const data = await fetchWithRetry<{ events: any[] }>(API_URL, {
                headers: { 'Accept': 'application/json' },
                timeoutMs: 4000,
                retries: 2,
                metricName: 'eonet'
            });

            return data.events || [];

        } catch (error) {
            console.error('Error fetching from NASA EONET API:', error);
            throw error;
        }
    },

    normalizeDisasterEvent(eonetEvent: EonetEvent): any {
        // Find most recent geometry (location update)
        // EONET v3 uses `geometry` but some responses still include `geometries`
        const geometries = eonetEvent.geometry || eonetEvent.geometries || [];
        const geometry = geometries.length > 0 ? geometries[geometries.length - 1] : null;

        // Coordinates logic:
        // Point: [lng, lat]
        // Polygon: [[[lng, lat], ...]] (nested)
        
        let lat = 0;
        let lng = 0;
        let valid = false;

        if (geometry && geometry.coordinates) {
             const coords = geometry.coordinates;
             if (typeof coords[0] === 'number') {
                 // Point [lng, lat]
                 lng = coords[0];
                 lat = coords[1];
                 valid = true;
             } else if (Array.isArray(coords[0])) {
                 // Try to handle Polygon/LineString by taking first point
                 // Usually [[[lng, lat], ...]]
                 const first = coords[0];
                 if (Array.isArray(first) && first.length >= 2 && typeof first[0] === 'number') {
                      lng = first[0];
                      lat = first[1];
                      valid = true;
                 } else if (typeof first === 'number') {
                      // LineString [[lng, lat], ...]
                      lng = coords[0];
                      lat = coords[1];
                      valid = true;
                 }
             }
        }

        // If not valid, default to 0,0 but we will filter these out later if possible
        // Ideally we return null here but the return type is 'any' (object).
        // Let's set a flag or just return 0,0 and let controller filter.
        
        const type = eonetEvent.categories.length > 0 ? eonetEvent.categories[0].title : 'Unknown';

        return {
            id: eonetEvent.id,
            title: eonetEvent.title,
            disaster_type: type,
            description: eonetEvent.description || `Active ${type} event monitored by NASA EONET.`,
            // Normalized to our backend schema [{lat, lng}]
            coordinates: valid ? [{ lat, lng }] : [], 
            magnitude_value: geometry?.magnitudeValue || null,
            magnitude_unit: geometry?.magnitudeUnit || null,
            event_date: geometry?.date || new Date().toISOString(),
            source_url: eonetEvent.sources.length > 0 ? eonetEvent.sources[0].url : eonetEvent.link,
        };
    }
};
