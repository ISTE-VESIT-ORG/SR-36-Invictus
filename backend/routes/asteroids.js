const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Cache configuration
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
let asteroidsCache = {
    data: null,
    timestamp: null,
    isFallback: false,
    fetchHistory: [], // Store last 5 fetch timestamps
};

// NASA NEO API - Using demo key, user should update with their own
const NASA_NEO_API_KEY = process.env.NASA_NEO_API_KEY || 'DEMO_KEY';
const NASA_NEO_API = `https://api.nasa.gov/neo/rest/v1/feed`;

// Helper function to check if cache is valid
function isCacheValid() {
    if (!asteroidsCache.data || !asteroidsCache.timestamp) {
        return false;
    }
    const now = Date.now();
    return (now - asteroidsCache.timestamp) < CACHE_DURATION;
}

// Get random direction
function randomDirection() {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.floor(Math.random() * directions.length)];
}

// Get date range (today + 7 days)
function getDateRange() {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    
    const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return { startDate, endDate: endDateStr };
}

// GET /api/asteroids - Fetch asteroid flybys
router.get('/', async (req, res) => {
    try {
        // Check if we have valid cached data
        if (isCacheValid() && !asteroidsCache.isFallback) {
            console.log('✅ Serving asteroids from cache');
            return res.json({
                success: true,
                count: asteroidsCache.data.length,
                data: asteroidsCache.data,
                cached: true,
                cacheAge: Math.floor((Date.now() - asteroidsCache.timestamp) / 1000 / 60),
                metadata: {
                    apiSource: 'NASA NEO API',
                    apiEndpoint: `${NASA_NEO_API}`,
                    lastFetched: new Date(asteroidsCache.timestamp).toISOString(),
                    fetchedAt: asteroidsCache.timestamp,
                    fetchHistory: asteroidsCache.fetchHistory,
                }
            });
        }

        console.log('🔄 Fetching fresh asteroids from NASA NEO API...');
        
        const { startDate, endDate } = getDateRange();
        const url = `${NASA_NEO_API}?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_NEO_API_KEY}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error('NASA NEO API error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText,
            });
            throw new Error(`Failed to fetch asteroids from NASA NEO API (${response.status})`);
        }
        
        const data = await response.json();
        
        // Transform API data to our format
        const asteroids = [];
        
        for (let date in data.near_earth_objects) {
            const neoArray = data.near_earth_objects[date];
            
            for (let neo of neoArray.slice(0, 2)) { // Limit to 2 per day
                if (neo.close_approach_data && neo.close_approach_data[0]) {
                    const approach = neo.close_approach_data[0];
                    const approachDate = new Date(approach.close_approach_date_full);
                    
                    asteroids.push({
                        id: neo.id,
                        name: neo.name,
                        type: 'asteroid',
                        subtype: 'flyby',
                        date: approachDate.toISOString(),
                        peakTime: approachDate.toISOString(),
                        duration: 120,
                        visibility: {
                            location: 'Near Earth',
                            coordinates: { lat: 0, lng: 0 },
                            bestViewTime: approachDate.toISOString(),
                            direction: randomDirection(),
                            visibilityScore: neo.is_potentially_hazardous_asteroid ? 70 : 50,
                        },
                        description: {
                            simple: `Asteroid ${neo.name} will pass near Earth on ${approach.close_approach_date}`,
                            detailed: `Asteroid ${neo.name} close approach. Diameter: ${neo.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2)} km. Potentially hazardous: ${neo.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}`,
                        },
                        whyItMatters: 'Tracking asteroid flybys helps us understand potential threats and study solar system composition.',
                        observationTips: [
                            'Most asteroids require telescope to view',
                            'Check brightness magnitude for visibility',
                            'Use astronomy software for precise location',
                        ],
                        weatherDependent: true,
                        images: [],
                        agency: 'NASA JPL',
                        diameter: neo.estimated_diameter.kilometers.estimated_diameter_max,
                        hazardous: neo.is_potentially_hazardous_asteroid,
                        missDistance: approach.miss_distance.kilometers,
                        sourceUrl: neo.nasa_jpl_url,
                    });
                }
            }
        }
        
        // Update cache
        asteroidsCache.data = asteroids.slice(0, 12); // Limit to 12 asteroids
        asteroidsCache.timestamp = Date.now();
        asteroidsCache.isFallback = false;
        
        // Add to fetch history (keep last 5)
        asteroidsCache.fetchHistory.unshift({
            timestamp: asteroidsCache.timestamp,
            date: new Date().toISOString(),
        });
        if (asteroidsCache.fetchHistory.length > 5) {
            asteroidsCache.fetchHistory = asteroidsCache.fetchHistory.slice(0, 5);
        }
        
        console.log(`✅ Cached ${asteroidsCache.data.length} asteroids for 1 hour`);
        
        res.json({
            success: true,
            count: asteroidsCache.data.length,
            data: asteroidsCache.data,
            cached: false,
            metadata: {
                apiSource: 'NASA NEO API',
                apiEndpoint: `${NASA_NEO_API}`,
                lastFetched: new Date().toISOString(),
                fetchedAt: Date.now(),
                fetchHistory: asteroidsCache.fetchHistory,
            }
        });
        
    } catch (error) {
        console.error('Error fetching asteroids:', error);
        
        // If API fails but we have old cache, serve it anyway
        if (asteroidsCache.data) {
            console.log('⚠️ API failed, serving stale cache');
            return res.json({
                success: true,
                count: asteroidsCache.data.length,
                data: asteroidsCache.data,
                cached: true,
                stale: true,
            });
        }

        // Fallback sample data when API is unavailable and cache is empty
        const now = new Date();
        const fallbackAsteroids = [
            {
                id: 'demo-asteroid-1',
                name: 'Demo Asteroid 2026 AB',
                type: 'asteroid',
                subtype: 'flyby',
                date: now.toISOString(),
                peakTime: now.toISOString(),
                duration: 120,
                visibility: {
                    location: 'Near Earth',
                    coordinates: { lat: 0, lng: 0 },
                    bestViewTime: now.toISOString(),
                    direction: randomDirection(),
                    visibilityScore: 60,
                },
                description: {
                    simple: 'Demo asteroid data (API unavailable).',
                    detailed: 'This is sample data shown when the NASA NEO API cannot be reached.',
                },
                whyItMatters: 'Tracking asteroid flybys helps us understand potential threats and study solar system composition.',
                observationTips: [
                    'Most asteroids require a telescope to view.',
                    'Check brightness magnitude for visibility.',
                    'Use astronomy software for precise location.',
                ],
                weatherDependent: true,
                images: [],
                agency: 'NASA JPL',
                diameter: 0.25,
                hazardous: false,
                missDistance: 1200000,
                sourceUrl: 'https://cneos.jpl.nasa.gov',
            },
        ];

        asteroidsCache.data = fallbackAsteroids;
        asteroidsCache.timestamp = Date.now();
        asteroidsCache.isFallback = true;

        return res.json({
            success: true,
            count: fallbackAsteroids.length,
            data: fallbackAsteroids,
            cached: true,
            stale: true,
            fallback: true,
        });
        
        res.status(500).json({
            success: false,
            error: 'Failed to fetch asteroids',
            message: error.message,
        });
    }
});

// GET /api/asteroids/:id - Get single asteroid by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // First check if asteroid is in cache (only if not fallback)
        if (asteroidsCache.data && !asteroidsCache.isFallback) {
            const cachedAsteroid = asteroidsCache.data.find(a => a.id === id);
            if (cachedAsteroid) {
                console.log(`✅ Serving asteroid ${id} from cache`);
                return res.json({
                    success: true,
                    data: cachedAsteroid,
                    cached: true,
                    stale: !isCacheValid(),
                });
            }
        }
        
        console.log(`🔄 Fetching asteroid ${id} from NASA NEO API...`);
        
        const { startDate, endDate } = getDateRange();
        const url = `${NASA_NEO_API}?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_NEO_API_KEY}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error('NASA NEO API error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText,
            });
            throw new Error(`Failed to fetch asteroids (${response.status})`);
        }
        
        const data = await response.json();
        
        let foundAsteroid = null;
        
        for (let date in data.near_earth_objects) {
            const neo = data.near_earth_objects[date].find(n => n.id === id);
            if (neo && neo.close_approach_data && neo.close_approach_data[0]) {
                const approach = neo.close_approach_data[0];
                const approachDate = new Date(approach.close_approach_date_full);
                
                foundAsteroid = {
                    id: neo.id,
                    name: neo.name,
                    type: 'asteroid',
                    subtype: 'flyby',
                    date: approachDate.toISOString(),
                    peakTime: approachDate.toISOString(),
                    duration: 120,
                    visibility: {
                        location: 'Near Earth',
                        coordinates: { lat: 0, lng: 0 },
                        bestViewTime: approachDate.toISOString(),
                        direction: randomDirection(),
                        visibilityScore: neo.is_potentially_hazardous_asteroid ? 70 : 50,
                    },
                    description: {
                        simple: `Asteroid ${neo.name} will pass near Earth on ${approach.close_approach_date}`,
                        detailed: `Asteroid ${neo.name} close approach. Diameter: ${neo.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2)} km. Potentially hazardous: ${neo.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}`,
                    },
                    whyItMatters: 'Tracking asteroid flybys helps us understand potential threats and study solar system composition.',
                    observationTips: [
                        'Most asteroids require telescope to view',
                        'Check brightness magnitude for visibility',
                        'Use astronomy software for precise location',
                    ],
                    weatherDependent: true,
                    images: [],
                    agency: 'NASA JPL',
                    diameter: neo.estimated_diameter.kilometers.estimated_diameter_max,
                    hazardous: neo.is_potentially_hazardous_asteroid,
                    missDistance: approach.miss_distance.kilometers,
                    sourceUrl: neo.nasa_jpl_url,
                };
                break;
            }
        }
        
        if (!foundAsteroid) {
            return res.status(404).json({
                success: false,
                error: 'Asteroid not found',
            });
        }
        
        res.json({
            success: true,
            data: foundAsteroid,
            cached: false,
        });
        
    } catch (error) {
        console.error('Error fetching asteroid:', error);
        
        // If API fails but we have cached data, serve it anyway
        if (asteroidsCache.data) {
            const cachedAsteroid = asteroidsCache.data.find(a => a.id === req.params.id);
            if (cachedAsteroid) {
                console.log('⚠️ API failed, serving stale cache');
                return res.json({
                    success: true,
                    data: cachedAsteroid,
                    cached: true,
                    stale: true,
                });
            }
        }
        res.status(500).json({
            success: false,
            error: 'Failed to fetch asteroid',
            message: error.message,
        });
    }
});

// Export cache management functions
router.getCache = () => asteroidsCache;
router.clearCache = () => {
    asteroidsCache.data = null;
    asteroidsCache.timestamp = null;
    asteroidsCache.isFallback = false;
    console.log('🗑️ Asteroids cache cleared');
};

module.exports = router;
