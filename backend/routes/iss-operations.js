const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const API_URL = process.env.SPACE_DEVS_API || 'https://ll.thespacedevs.com/2.2.0';

// Cache configuration
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
let issCache = {
    data: null,
    timestamp: null,
};

// Helper function to check if cache is valid
function isCacheValid() {
    if (!issCache.data || !issCache.timestamp) {
        return false;
    }
    const now = Date.now();
    return (now - issCache.timestamp) < CACHE_DURATION;
}

// Get random direction
function randomDirection() {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.floor(Math.random() * directions.length)];
}

// Allowed ISS event types
const ALLOWED_ISS_TYPES = [
    'EVA',
    'Docking',
    'Undocking',
    'Reentry',
    'Splashdown',
    'ISS Reboost'
];

// GET /api/iss-operations - Fetch ISS operations
router.get('/', async (req, res) => {
    try {
        // Check if we have valid cached data
        if (isCacheValid()) {
            console.log('✅ Serving ISS operations from cache');
            return res.json({
                success: true,
                count: issCache.data.length,
                data: issCache.data,
                cached: true,
                cacheAge: Math.floor((Date.now() - issCache.timestamp) / 1000 / 60),
            });
        }

        console.log('🔄 Fetching fresh ISS operations from API...');
        const response = await fetch(`${API_URL}/event/upcoming/`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch ISS operations from Space Devs API');
        }
        
        const data = await response.json();
        
        // Filter and transform ISS events
        const issEvents = data.results
            .filter(event => ALLOWED_ISS_TYPES.includes(event.type?.name))
            .slice(0, 12)
            .map(event => {
                const startDate = new Date(event.date);
                
                return {
                    id: event.id.toString(),
                    name: event.name,
                    type: 'iss',
                    subtype: event.type?.name.toLowerCase().replace(/\s+/g, '_') || 'operation',
                    date: startDate.toISOString(),
                    peakTime: startDate.toISOString(),
                    duration: 120,
                    visibility: {
                        location: 'International Space Station',
                        coordinates: { lat: 0, lng: 0 },
                        bestViewTime: startDate.toISOString(),
                        direction: randomDirection(),
                        visibilityScore: 90,
                    },
                    description: {
                        simple: `${event.name} - ISS Operation: ${event.type?.name}`,
                        detailed: event.description || `International Space Station ${event.type?.name} operation`,
                    },
                    whyItMatters: 'ISS operations are critical for maintaining the space station and conducting scientific research in orbit.',
                    observationTips: [
                        'Watch live streams from NASA or ESA',
                        'Follow official space agency updates',
                        'ISS orbits Earth every 90 minutes',
                    ],
                    weatherDependent: false,
                    images: [],
                    agency: event.agencies?.map(a => a.name).join(', ') || 'NASA/ESA',
                    sourceUrl: event.url,
                };
            });
        
        // Update cache
        issCache.data = issEvents;
        issCache.timestamp = Date.now();
        console.log(`✅ Cached ${issEvents.length} ISS operations for 1 hour`);
        
        res.json({
            success: true,
            count: issEvents.length,
            data: issEvents,
            cached: false,
        });
        
    } catch (error) {
        console.error('Error fetching ISS operations:', error);
        
        // If API fails but we have old cache, serve it anyway
        if (issCache.data) {
            console.log('⚠️ API failed, serving stale cache');
            return res.json({
                success: true,
                count: issCache.data.length,
                data: issCache.data,
                cached: true,
                stale: true,
            });
        }

        // Fallback sample data when API is unavailable and cache is empty
        const now = new Date();
        const fallbackIss = [
            {
                id: 'demo-iss-1',
                name: 'Demo ISS Operation: EVA Prep',
                type: 'iss',
                subtype: 'operation',
                date: now.toISOString(),
                peakTime: now.toISOString(),
                duration: 120,
                visibility: {
                    location: 'International Space Station',
                    coordinates: { lat: 0, lng: 0 },
                    bestViewTime: now.toISOString(),
                    direction: randomDirection(),
                    visibilityScore: 90,
                },
                description: {
                    simple: 'Demo ISS operation data (API unavailable).',
                    detailed: 'This is sample data shown when the Space Devs API cannot be reached.',
                },
                whyItMatters: 'ISS operations are critical for maintaining the space station and conducting research in orbit.',
                observationTips: [
                    'Follow official NASA/ESA updates.',
                    'Watch live ISS streams for activities.',
                    'ISS orbits Earth every 90 minutes.',
                ],
                weatherDependent: false,
                images: [],
                agency: 'NASA/ESA',
                sourceUrl: 'https://www.nasa.gov',
            },
        ];

        issCache.data = fallbackIss;
        issCache.timestamp = Date.now();

        return res.json({
            success: true,
            count: fallbackIss.length,
            data: fallbackIss,
            cached: true,
            stale: true,
            fallback: true,
        });
        
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ISS operations',
            message: error.message,
        });
    }
});

// GET /api/iss-operations/:id - Get single ISS operation by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // First check if operation is in cache (even if stale)
        if (issCache.data) {
            const cachedOp = issCache.data.find(op => op.id === id);
            if (cachedOp) {
                console.log(`✅ Serving ISS operation ${id} from cache`);
                return res.json({
                    success: true,
                    data: cachedOp,
                    cached: true,
                    stale: !isCacheValid(),
                });
            }
        }
        
        console.log(`🔄 Fetching ISS operation ${id} from API...`);
        const response = await fetch(`${API_URL}/event/upcoming/`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch ISS operations');
        }
        
        const data = await response.json();
        const event = data.results.find(e => 
            e.id.toString() === id && ALLOWED_ISS_TYPES.includes(e.type?.name)
        );
        
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'ISS operation not found',
            });
        }
        
        const startDate = new Date(event.date);
        
        const transformedEvent = {
            id: event.id.toString(),
            name: event.name,
            type: 'iss',
            subtype: event.type?.name.toLowerCase().replace(/\s+/g, '_') || 'operation',
            date: startDate.toISOString(),
            peakTime: startDate.toISOString(),
            duration: 120,
            visibility: {
                location: 'International Space Station',
                coordinates: { lat: 0, lng: 0 },
                bestViewTime: startDate.toISOString(),
                direction: randomDirection(),
                visibilityScore: 90,
            },
            description: {
                simple: `${event.name} - ISS Operation: ${event.type?.name}`,
                detailed: event.description || `International Space Station ${event.type?.name} operation`,
            },
            whyItMatters: 'ISS operations are critical for maintaining the space station and conducting scientific research in orbit.',
            observationTips: [
                'Watch live streams from NASA or ESA',
                'Follow official space agency updates',
                'ISS orbits Earth every 90 minutes',
            ],
            weatherDependent: false,
            images: [],
            agency: event.agencies?.map(a => a.name).join(', ') || 'NASA/ESA',
            sourceUrl: event.url,
        };
        
        res.json({
            success: true,
            data: transformedEvent,
            cached: false,
        });
        
    } catch (error) {
        console.error('Error fetching ISS operation:', error);
        
        // If API fails but we have cached data, serve it anyway
        if (issCache.data) {
            const cachedOp = issCache.data.find(op => op.id === req.params.id);
            if (cachedOp) {
                console.log('⚠️ API failed, serving stale cache');
                return res.json({
                    success: true,
                    data: cachedOp,
                    cached: true,
                    stale: true,
                });
            }
        }
        res.status(500).json({
            success: false,
            error: 'Failed to fetch ISS operation',
            message: error.message,
        });
    }
});

// Export cache management functions
router.getCache = () => issCache;
router.clearCache = () => {
    issCache.data = null;
    issCache.timestamp = null;
    console.log('🗑️ ISS operations cache cleared');
};

module.exports = router;
