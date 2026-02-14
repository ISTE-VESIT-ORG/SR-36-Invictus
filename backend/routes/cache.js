const express = require('express');
const router = express.Router();

// Cache status route
router.get('/status', (req, res) => {
    const eventsModule = require('./events');
    const cache = eventsModule.getCache ? eventsModule.getCache() : null;
    
    if (!cache || !cache.timestamp) {
        return res.json({
            cached: false,
            message: 'No cache available',
        });
    }
    
    const now = Date.now();
    const cacheAge = Math.floor((now - cache.timestamp) / 1000 / 60); // in minutes
    const cacheExpiry = 60; // 1 hour in minutes
    const remainingTime = cacheExpiry - cacheAge;
    
    res.json({
        cached: true,
        eventCount: cache.data ? cache.data.length : 0,
        cacheAgeMinutes: cacheAge,
        remainingMinutes: remainingTime > 0 ? remainingTime : 0,
        isValid: remainingTime > 0,
    });
});

// Clear cache route
router.post('/clear', (req, res) => {
    const eventsModule = require('./events');
    if (eventsModule.clearCache) {
        eventsModule.clearCache();
        res.json({
            success: true,
            message: 'Cache cleared successfully',
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Cache clearing not available',
        });
    }
});

module.exports = router;
