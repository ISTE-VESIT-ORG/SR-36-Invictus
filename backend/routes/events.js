const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const API_URL = process.env.SPACE_DEVS_API || 'https://ll.thespacedevs.com/2.2.0';

// Cache configuration
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
let eventsCache = {
    data: null,
    timestamp: null,
};

// Helper function to check if cache is valid
function isCacheValid() {
    if (!eventsCache.data || !eventsCache.timestamp) {
        return false;
    }
    const now = Date.now();
    return (now - eventsCache.timestamp) < CACHE_DURATION;
}

// Map API event types to our internal types
function mapEventType(apiType) {
    if (!apiType) return 'meteor-shower';
    
    const type = apiType.toLowerCase();
    if (type.includes('eclipse')) return 'eclipse';
    if (type.includes('meteor')) return 'meteor-shower';
    if (type.includes('iss')) return 'iss-pass';
    if (type.includes('aurora')) return 'aurora';
    if (type.includes('moon')) return 'full-moon';
    if (type.includes('alignment')) return 'planetary-alignment';
    if (type.includes('comet')) return 'comet';
    
    return 'meteor-shower';
}

// Get random direction
function randomDirection() {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.floor(Math.random() * directions.length)];
}

// GET /api/events - Fetch upcoming celestial events
router.get('/', async (req, res) => {
    try {
        // Check if we have valid cached data
        if (isCacheValid()) {
            console.log('✅ Serving events from cache');
            return res.json({
                success: true,
                count: eventsCache.data.length,
                data: eventsCache.data,
                cached: true,
                cacheAge: Math.floor((Date.now() - eventsCache.timestamp) / 1000 / 60), // in minutes
            });
        }

        console.log('🔄 Fetching fresh events from API...');
        const response = await fetch(`${API_URL}/event/upcoming/`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch events from Space Devs API');
        }
        
        const data = await response.json();
        
        // Transform API data to our format
        const events = data.results.slice(0, 12).map(event => {
            const startDate = new Date(event.date);
            
            return {
                id: event.id.toString(),
                name: event.name,
                type: mapEventType(event.type?.name),
                date: startDate.toISOString(),
                peakTime: startDate.toISOString(),
                duration: 120, // Default duration in minutes
                visibility: {
                    location: event.location || 'Global',
                    coordinates: { lat: 0, lng: 0 },
                    bestViewTime: startDate.toISOString(),
                    direction: randomDirection(),
                    visibilityScore: Math.floor(Math.random() * 40) + 60,
                },
                description: {
                    simple: event.description || 'A celestial event worth observing.',
                    detailed: event.description || '',
                },
                whyItMatters: 'This celestial event provides valuable astronomical observation opportunities.',
                observationTips: [
                    'Find a dark location away from city lights.',
                    'Allow 20-30 minutes for your eyes to adjust.',
                    'Check local weather conditions before heading out.',
                ],
                weatherDependent: true,
                images: event.feature_image ? [event.feature_image] : [],
            };
        });
        
        // Update cache
        eventsCache.data = events;
        eventsCache.timestamp = Date.now();
        console.log(`✅ Cached ${events.length} events for 1 hour`);
        
        res.json({
            success: true,
            count: events.length,
            data: events,
            cached: false,
        });
        
    } catch (error) {
        console.error('Error fetching events:', error);
        
        // If API fails but we have old cache, serve it anyway
        if (eventsCache.data) {
            console.log('⚠️ API failed, serving stale cache');
            return res.json({
                success: true,
                count: eventsCache.data.length,
                data: eventsCache.data,
                cached: true,
                stale: true,
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to fetch celestial events',
            message: error.message,
        });
    }
});

// GET /api/events/:id - Get single event by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // First check if event is in cache
        if (isCacheValid() && eventsCache.data) {
            const cachedEvent = eventsCache.data.find(e => e.id === id);
            if (cachedEvent) {
                console.log(`✅ Serving event ${id} from cache`);
                return res.json({
                    success: true,
                    data: cachedEvent,
                    cached: true,
                });
            }
        }
        
        console.log(`🔄 Fetching event ${id} from API...`);
        // If not in cache or cache invalid, fetch from API
        const response = await fetch(`${API_URL}/event/upcoming/`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        const event = data.results.find(e => e.id.toString() === id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found',
            });
        }
        
        const startDate = new Date(event.date);
        
        const transformedEvent = {
            id: event.id.toString(),
            name: event.name,
            type: mapEventType(event.type?.name),
            date: startDate.toISOString(),
            peakTime: startDate.toISOString(),
            duration: 120,
            visibility: {
                location: event.location || 'Global',
                coordinates: { lat: 0, lng: 0 },
                bestViewTime: startDate.toISOString(),
                direction: randomDirection(),
                visibilityScore: Math.floor(Math.random() * 40) + 60,
            },
            description: {
                simple: event.description || 'A celestial event worth observing.',
                detailed: event.description || '',
            },
            whyItMatters: 'This celestial event provides valuable astronomical observation opportunities.',
            observationTips: [
                'Find a dark location away from city lights.',
                'Allow 20-30 minutes for your eyes to adjust.',
                'Check local weather conditions before heading out.',
            ],
            weatherDependent: true,
            images: event.feature_image ? [event.feature_image] : [],
        };
        
        res.json({
            success: true,
            data: transformedEvent,
            cached: false,
        });
        
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch event',
            message: error.message,
        });
    }
});

// Export cache management functions
router.getCache = () => eventsCache;
router.clearCache = () => {
    eventsCache.data = null;
    eventsCache.timestamp = null;
    console.log('🗑️ Cache cleared');
};

module.exports = router;
