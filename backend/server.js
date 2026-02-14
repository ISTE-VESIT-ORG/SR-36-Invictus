const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/launches', require('./routes/launches'));
app.use('/api/iss-operations', require('./routes/iss-operations'));
app.use('/api/asteroids', require('./routes/asteroids'));
app.use('/api/cache', require('./routes/cache'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'AstroView Backend is running!',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 AstroView Backend running on http://localhost:${PORT}`);
});
