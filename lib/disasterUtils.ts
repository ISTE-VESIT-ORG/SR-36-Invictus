// Remove top-level L import to avoid SSR issues if this file is imported in server components
// import L from 'leaflet'; 

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

export interface NormalizedDisasterEvent {
  id: string;
  title: string;
  category: string; // 'Wildfires', 'Severe Storms', 'Volcanoes', 'Sea and Lake Ice', etc.
  date: string;
  lat: number;
  lng: number;
  magnitudeValue?: number;
  magnitudeUnit?: string;
  sourceUrl?: string;
  description?: string; // Optional for UI details
}

interface EonetGeometry {
  date: string;
  type: string;
  coordinates: number[] | number[][] | number[][][];
  magnitudeValue?: number;
  magnitudeUnit?: string;
}

interface EonetEventLike {
  id: string;
  title: string;
  description?: string | null;
  link?: string;
  categories?: { id: string; title: string }[];
  sources?: { id: string; url: string }[];
  geometry?: EonetGeometry[];
  geometries?: EonetGeometry[];
}

interface BackendEventLike {
  id: string;
  title: string;
  description?: string | null;
  disaster_type?: string;
  event_date?: string;
  source_url?: string;
  magnitude_value?: number | null;
  magnitude_unit?: string | null;
  coordinates?: { lat: number; lng: number }[] | { lat: number; lng: number };
}

// ----------------------------------------------------------------------
// DATA NORMALIZATION
// ----------------------------------------------------------------------

/**
 * Normalizes raw EONET data or existing backend shape into a clean, flat structure.
 * Handles extracting the latest geometry coordinates.
 */
export function normalizeDisasterData(
  event: EonetEventLike | BackendEventLike
): NormalizedDisasterEvent | null {
  let lat = NaN;
  let lng = NaN;
  let date = new Date().toISOString();
  let magnitudeValue: number | undefined;
  let magnitudeUnit: string | undefined;

  const eonetGeometries = 'geometry' in event && Array.isArray(event.geometry)
    ? event.geometry
    : 'geometries' in event && Array.isArray(event.geometries)
      ? event.geometries
      : null;

  if (eonetGeometries && eonetGeometries.length > 0) {
    const latestGeo = eonetGeometries[eonetGeometries.length - 1];
    date = latestGeo.date || date;

    const coords = latestGeo.coordinates;
    if (Array.isArray(coords) && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      // Point: [lng, lat]
      lng = coords[0];
      lat = coords[1];
    }

    magnitudeValue = latestGeo.magnitudeValue;
    magnitudeUnit = latestGeo.magnitudeUnit;
  } else if ('coordinates' in event && Array.isArray(event.coordinates)) {
    const latestCoord = event.coordinates[event.coordinates.length - 1];
    if (latestCoord) {
      lat = latestCoord.lat;
      lng = latestCoord.lng;
    }
    date = event.event_date || date;
    magnitudeValue = event.magnitude_value ?? undefined;
    magnitudeUnit = event.magnitude_unit ?? undefined;
  } else if ('coordinates' in event && event.coordinates && !Array.isArray(event.coordinates)) {
    lat = event.coordinates.lat;
    lng = event.coordinates.lng;
    date = event.event_date || date;
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.warn('Invalid EONET geometry, skipping event', {
      id: event.id,
      title: event.title,
    });
    return null;
  }

  const category =
    ('disaster_type' in event && event.disaster_type) ||
    ('categories' in event && event.categories && event.categories[0]?.title) ||
    'Unknown';

  const sourceUrl =
    ('source_url' in event && event.source_url) ||
    ('sources' in event && event.sources && event.sources[0]?.url) ||
    ('link' in event && event.link) ||
    undefined;

  return {
    id: event.id,
    title: event.title,
    category,
    date,
    lat,
    lng,
    magnitudeValue,
    magnitudeUnit,
    sourceUrl,
    description: 'description' in event ? event.description ?? undefined : undefined,
  };
}

// ----------------------------------------------------------------------
// ICONS
// ----------------------------------------------------------------------

export const createDisasterIcon = (category: string) => {
  // Dynamic import or check for window to support SSR safe usage
  if (typeof window === 'undefined') return null;

  const L = require('leaflet');
  const normCategory = category.toLowerCase();
  
  let color = '#10b981'; // Default Emerald
  let iconEmoji = '📍';

  if (normCategory.includes('wildfire')) {
    color = '#ef4444'; // Red
    iconEmoji = '🔥';
  } else if (normCategory.includes('flood')) {
    color = '#3b82f6'; // Blue
    iconEmoji = '🌊';
  } else if (normCategory.includes('storm')) {
    color = '#8b5cf6'; // Purple
    iconEmoji = '⛈️';
  } else if (normCategory.includes('volcano')) {
    color = '#f97316'; // Orange
    iconEmoji = '🌋';
  } else if (normCategory.includes('ice') || normCategory.includes('snow')) {
    color = '#06b6d4'; // Cyan
    iconEmoji = '🧊';
  }

  // Use a DivIcon for custom styling without external images
  return L.divIcon({
    html: `
      <div class="relative group">
        <div style="
          background-color: ${color}; 
          width: 24px; 
          height: 24px; 
          border-radius: 50%; 
          border: 2px solid white; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          font-size: 14px;
        ">
          ${iconEmoji}
        </div>
        <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid white;"></div>
      </div>
    `,
    className: 'custom-disaster-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 28], // Bottom center
    popupAnchor: [0, -30],
  });
};
