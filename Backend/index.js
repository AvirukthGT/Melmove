// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Introduce the data processing function
const { getParkingData } = require('./services/parkingService');

// Define API routes
app.get('/api/merged-parking', async (req, res) => {
  try {
    // Read the data source settings in .env
    const keyword = req.query.keyword || '';
    const data = await getParkingData(process.env.DATA_SOURCE, keyword);
    res.json(data);
  } catch (e) {
    console.error('Failed to load data:', e.message);
    res.status(500).json({ error: 'Data loading failed' });
  } 
});

// Start server listening
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
