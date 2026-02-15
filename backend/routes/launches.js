const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const API_URL = process.env.SPACE_DEVS_API || 'https://ll.thespacedevs.com/2.2.0';

// Cache configuration
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
let launchesCache = {
    data: null,
    timestamp: null,
    fetchHistory: [], // Store last 5 fetch timestamps
};

// Helper function to check if cache is valid
function isCacheValid() {
    if (!launchesCache.data || !launchesCache.timestamp) {
        return false;
    }
    const now = Date.now();
    return (now - launchesCache.timestamp) < CACHE_DURATION;
}

// Get random direction
function randomDirection() {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.floor(Math.random() * directions.length)];
}

// GET /api/launches - Fetch upcoming launches
router.get('/', async (req, res) => {
    try {
        // Check if we have valid cached data
        if (isCacheValid()) {
            console.log('✅ Serving launches from cache');
            return res.json({
                success: true,
                count: launchesCache.data.length,
                data: launchesCache.data,
                cached: true,
                cacheAge: Math.floor((Date.now() - launchesCache.timestamp) / 1000 / 60),
                metadata: {
                    apiSource: 'The Space Devs API - Launches',
                    apiEndpoint: `${API_URL}/launch/upcoming/`,
                    lastFetched: new Date(launchesCache.timestamp).toISOString(),
                    fetchedAt: launchesCache.timestamp,
                    fetchHistory: launchesCache.fetchHistory,
                }
            });
        }

        console.log('🔄 Fetching fresh launches from API...');
        const response = await fetch(`${API_URL}/launch/upcoming/`);
        
        if (!response.ok) {
            console.error(`❌ Space Devs API returned status: ${response.status} ${response.statusText}`);
            throw new Error('Failed to fetch launches from Space Devs API');
        }
        
        const data = await response.json();
        
        // Transform API data to our format
        const launches = data.results.slice(0, 12).map(launch => {
            const startDate = new Date(launch.net);
            
            return {
                id: launch.id.toString(),
                name: launch.name,
                type: 'launch',
                subtype: 'rocket_launch',
                date: startDate.toISOString(),
                peakTime: startDate.toISOString(),
                duration: 30, // Typical launch duration in minutes
                visibility: {
                    location: launch.pad?.location?.name || 'TBD',
                    coordinates: { lat: 0, lng: 0 },
                    bestViewTime: startDate.toISOString(),
                    direction: randomDirection(),
                    visibilityScore: 85,
                },
                description: {
                    simple: `${launch.name} - Rocket launch by ${launch.launch_service_provider?.name || 'Unknown Agency'}`,
                    detailed: launch.mission?.description || `Upcoming ${launch.name} launch`,
                },
                whyItMatters: 'Space launches are crucial for satellite deployment, space exploration, and scientific missions.',
                observationTips: [
                    'Check launch site visibility from your location',
                    'Watch official launch stream online',
                    'Clear weather is essential for viewing',
                ],
                weatherDependent: true,
                images: [],
                agency: launch.launch_service_provider?.name,
                status: launch.status?.name,
                pad: launch.pad?.name,
                sourceUrl: launch.url,
            };
        });
        
        // Update cache
        launchesCache.data = launches;
        launchesCache.timestamp = Date.now();
        
        // Add to fetch history (keep last 5)
        launchesCache.fetchHistory.unshift({
            timestamp: launchesCache.timestamp,
            date: new Date().toISOString(),
        });
        if (launchesCache.fetchHistory.length > 5) {
            launchesCache.fetchHistory = launchesCache.fetchHistory.slice(0, 5);
        }
        
        console.log(`✅ Cached ${launches.length} launches for 1 hour`);
        
        res.json({
            success: true,
            count: launches.length,
            data: launches,
            cached: false,
            metadata: {
                apiSource: 'The Space Devs API - Launches',
                apiEndpoint: `${API_URL}/launch/upcoming/`,
                lastFetched: new Date().toISOString(),
                fetchedAt: Date.now(),
                fetchHistory: launchesCache.fetchHistory,
            }
        });
        
    } catch (error) {
        console.error('Error fetching launches:', error);
        
        // If API fails but we have old cache, serve it anyway
        if (launchesCache.data) {
            console.log('⚠️ API failed, serving stale cache');
            return res.json({
                success: true,
                count: launchesCache.data.length,
                data: launchesCache.data,
                cached: true,
                stale: true,
            });
        }

        // Fallback sample data when API is unavailable and cache is empty
        const now = new Date();
        const fallbackLaunches = [
            {
                id: 'demo-launch-1',
                name: 'Demo Launch: Artemis Test Flight',
                type: 'launch',
                subtype: 'rocket_launch',
                date: now.toISOString(),
                peakTime: now.toISOString(),
                duration: 30,
                visibility: {
                    location: 'Kennedy Space Center, FL',
                    coordinates: { lat: 28.5729, lng: -80.6490 },
                    bestViewTime: now.toISOString(),
                    direction: randomDirection(),
                    visibilityScore: 85,
                },
                description: {
                    simple: 'Demo launch data (API unavailable).',
                    detailed: 'This is sample data shown when the Space Devs API cannot be reached.',
                },
                whyItMatters: 'Space launches are crucial for satellite deployment, space exploration, and scientific missions.',
                observationTips: [
                    'Check official launch streams for live coverage.',
                    'Clear weather improves visibility.',
                    'Arrive early if viewing locally.',
                ],
                weatherDependent: true,
                images: [],
                agency: 'Demo Agency',
                status: 'TBD',
                pad: 'LC-39A',
                sourceUrl: 'https://thespacedevs.com',
            },
        ];

        launchesCache.data = fallbackLaunches;
        launchesCache.timestamp = Date.now();

        return res.json({
            success: true,
            count: fallbackLaunches.length,
            data: fallbackLaunches,
            cached: true,
            stale: true,
            fallback: true,
        });
        
        res.status(500).json({
            success: false,
            error: 'Failed to fetch launches',
            message: error.message,
        });
    }
});

// GET /api/launches/:id - Get single launch by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // First check if launch is in cache (even if stale)
        if (launchesCache.data) {
            const cachedLaunch = launchesCache.data.find(l => l.id === id);
            if (cachedLaunch) {
                console.log(`✅ Serving launch ${id} from cache`);
                return res.json({
                    success: true,
                    data: cachedLaunch,
                    cached: true,
                    stale: !isCacheValid(),
                });
            }
        }
        
        console.log(`🔄 Fetching launch ${id} from API...`);
        const response = await fetch(`${API_URL}/launch/upcoming/`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch launches');
        }
        
        const data = await response.json();
        const launch = data.results.find(l => l.id.toString() === id);
        
        if (!launch) {
            return res.status(404).json({
                success: false,
                error: 'Launch not found',
            });
        }
        
        const startDate = new Date(launch.net);
        
        const transformedLaunch = {
            id: launch.id.toString(),
            name: launch.name,
            type: 'launch',
            subtype: 'rocket_launch',
            date: startDate.toISOString(),
            peakTime: startDate.toISOString(),
            duration: 30,
            visibility: {
                location: launch.pad?.location?.name || 'TBD',
                coordinates: { lat: 0, lng: 0 },
                bestViewTime: startDate.toISOString(),
                direction: randomDirection(),
                visibilityScore: 85,
            },
            description: {
                simple: `${launch.name} - Rocket launch by ${launch.launch_service_provider?.name || 'Unknown Agency'}`,
                detailed: launch.mission?.description || `Upcoming ${launch.name} launch`,
            },
            whyItMatters: 'Space launches are crucial for satellite deployment, space exploration, and scientific missions.',
            observationTips: [
                'Check launch site visibility from your location',
                'Watch official launch stream online',
                'Clear weather is essential for viewing',
            ],
            weatherDependent: true,
            images: [],
            agency: launch.launch_service_provider?.name,
            status: launch.status?.name,
            pad: launch.pad?.name,
            sourceUrl: launch.url,
        };
        
        res.json({
            success: true,
            data: transformedLaunch,
            cached: false,
        });
        
    } catch (error) {
        console.error('Error fetching launch:', error);
        
        // If API fails but we have cached data, serve it anyway
        if (launchesCache.data) {
            const cachedLaunch = launchesCache.data.find(l => l.id === req.params.id);
            if (cachedLaunch) {
                console.log('⚠️ API failed, serving stale cache');
                return res.json({
                    success: true,
                    data: cachedLaunch,
                    cached: true,
                    stale: true,
                });
            }
        }
        res.status(500).json({
            success: false,
            error: 'Failed to fetch launch',
            message: error.message,
        });
    }
});

// Export cache management functions
router.getCache = () => launchesCache;
router.clearCache = () => {
    launchesCache.data = null;
    launchesCache.timestamp = null;
    console.log('🗑️ Launches cache cleared');
};

module.exports = router;
