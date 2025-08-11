// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Introduce the data processing function
const { getParkingData } = require('./services/parkingService');

const app = express();

// Log environment variables with ${..} for debugging
Object.entries(process.env)
  .filter(([k,v]) => typeof v === 'string' && /\$\{.+\}/.test(v))
  .forEach(([k,v]) => console.log('[ENV with ${..}]', k, '=', v));


const PORT = process.env.PORT || 3000;

// ===== Global CORS configuration (must be placed before routes) =====
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,                // local development
  /^http:\/\/127\.0\.0\.1:\d+$/,              // local development
  /^https:\/\/melmove\.vercel\.app$/,         // production
  /^https:\/\/melmove-git-.*\.vercel\.app$/   // Vercel preview
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); //  Allow no origin (Postman/health check)
    const ok = allowedOrigins.some(pattern => pattern.test(origin));
    if (ok) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Handling OPTIONS preflight requests
app.options('*', cors());
// ============================================

// JSON Parsing
app.use(express.json());

// ===== router =====
// Get parking data (support keywords search & distance filter)
app.get('/api/merged-parking', async (req, res) => {
  try {
    const { keyword, lat, lng, radiusKm } = req.query;
    const data = await getParkingData(
      process.env.DATA_SOURCE,
      keyword || '',
      lat ? parseFloat(lat) : null,
      lng ? parseFloat(lng) : null,
      radiusKm ? parseFloat(radiusKm) : null
    );

    res.json({
      success: true,
      data,
      count: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('Failed to load data:', e.message);
    res.status(500).json({
      success: false,
      error: 'Data loading failed',
      message: e.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoint: http://localhost:${PORT}/api/merged-parking`);
});

