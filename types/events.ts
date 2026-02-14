export type EventType =
    | 'meteor-shower'
    | 'eclipse'
    | 'iss-pass'
    | 'aurora'
    | 'full-moon'
    | 'planetary-alignment'
    | 'comet';

export interface CelestialEvent {
    id: string;
    name: string;
    type: EventType;
    date: Date;
    peakTime: Date;
    duration: number; // minutes
    visibility: {
        location: string;
        coordinates: { lat: number; lng: number };
        bestViewTime: Date;
        direction: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
        visibilityScore: number; // 0-100
    };
    description: {
        simple: string;
        detailed: string;
    };
    whyItMatters: string;
    observationTips: string[];
    weatherDependent: boolean;
    images: string[];
}
