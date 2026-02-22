const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Simple admin auth: set ADMIN_TOKEN in env to require the header
function requireAdmin(req, res, next) {
    const token = process.env.ADMIN_TOKEN;
    if (!token) return next();
    const provided = req.headers['x-admin-token'];
    if (!provided || provided !== token) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

// POST /api/admin/refresh - force a cache refresh and warm endpoints
router.post('/refresh', requireAdmin, async (req, res) => {
    const start = Date.now();
    const results = { backend: [], frontend: [], cleared: [] };

    try {
        // Clear backend route caches if available
        try { require('./events').clearCache(); results.cleared.push('events'); } catch (e) {}
        try { require('./launches').clearCache(); results.cleared.push('launches'); } catch (e) {}
        try { require('./iss-operations').clearCache(); results.cleared.push('iss-operations'); } catch (e) {}
        try { require('./asteroids').clearCache(); results.cleared.push('asteroids'); } catch (e) {}

        // Warm backend endpoints
        const backendEndpoints = [
            `http://localhost:${process.env.PORT || 5000}/api/events`,
            `http://localhost:${process.env.PORT || 5000}/api/launches`,
            `http://localhost:${process.env.PORT || 5000}/api/iss-operations`,
            `http://localhost:${process.env.PORT || 5000}/api/asteroids`,
        ];

        for (const url of backendEndpoints) {
            try {
                const t0 = Date.now();
                const r = await fetch(url, { timeout: 20_000 });
                const ms = Date.now() - t0;
                results.backend.push({ url, status: r.status, ms });
            } catch (err) {
                results.backend.push({ url, error: String(err) });
            }
        }

        // Warm frontend (Next.js) endpoints
        const FRONTEND_BASE = req.body.frontendBase || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const frontendEndpoints = [
            `${FRONTEND_BASE}/api/impact/summary`,
            `${FRONTEND_BASE}/api/missions`,
        ];

        for (const url of frontendEndpoints) {
            try {
                const t0 = Date.now();
                const r = await fetch(url, { timeout: 20_000 });
                const ms = Date.now() - t0;
                results.frontend.push({ url, status: r.status, ms });
            } catch (err) {
                results.frontend.push({ url, error: String(err) });
            }
        }

        results.tookMs = Date.now() - start;
        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, error: String(err) });
    }
});

// GET /api/admin/status - show cache ages for backend routes
router.get('/status', requireAdmin, (req, res) => {
    const status = {};
    try {
        const events = require('./events');
        const evCache = events.getCache ? events.getCache() : null;
        status.events = evCache && evCache.timestamp ? { cached: true, ageMs: Date.now() - evCache.timestamp } : { cached: false };
    } catch (e) { status.events = { error: String(e) }; }

    try {
        const launches = require('./launches');
        const laCache = launches.getCache ? launches.getCache() : null;
        status.launches = laCache && laCache.timestamp ? { cached: true, ageMs: Date.now() - laCache.timestamp } : { cached: false };
    } catch (e) { status.launches = { error: String(e) }; }

    try {
        const iss = require('./iss-operations');
        const isCache = iss.getCache ? iss.getCache() : null;
        status.iss = isCache && isCache.timestamp ? { cached: true, ageMs: Date.now() - isCache.timestamp } : { cached: false };
    } catch (e) { status.iss = { error: String(e) }; }

    res.json({ success: true, status });
});

module.exports = router;
