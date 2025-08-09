// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Introduce the data processing function
const { getParkingData } = require('./services/parkingService');

const app = express();
const PORT = process.env.PORT || 3000;

// Add CORS support
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://127.0.0.1:8080'
  ],
  credentials: true
}));

// JSON express
app.use(express.json());

// Define API routes
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

// Start server listening
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoint: http://localhost:${PORT}/api/merged-parking`);
});

