const fs = require('fs');
const path = require('path');

// Mock local file reading
function fetchFromLocalFile() {
  try {
    const baysData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/on-street-parking-bays.json'), 'utf8'));
    const sensorsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/on-street-parking-bay-sensors.json'), 'utf8'));

    // Combine the two datasets
    const merged = baysData.map(bay => {
      const sensor = sensorsData.find(s => s.kerbsideid === bay.kerbsideid);
      return {
        name: bay.roadsegmentdescription || 'Unknown Street',
        location: bay.location || {},
        rates: {
          hourly: 8,
          daily: 35
        },
        available: sensor?.status_description === 'Unoccupied',
        last_updated: sensor?.status_timestamp || null
      };
    });

    return merged;
  } catch (err) {
    console.error('Error in parkingService:', err.message);
    throw err;
  }
}

// Read from cloud database
async function fetchFromCloudDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [bays] = await connection.execute('SELECT * FROM parking_bays');
    const [sensors] = await connection.execute('SELECT * FROM parking_sensors');

    const merged = bays.map(bay => {
      const sensor = sensors.find(s => s.kerbsideid === bay.kerbsideid);
      return {
        name: bay.roadsegmentdescription || 'Unknown Street',
        location: { lat: bay.latitude, lon: bay.longitude },
        rates: {
          hourly: 8,
          daily: 35
        },
        available: sensor?.status_description === 'Unoccupied',
        last_updated: sensor?.status_timestamp || null
      };
    });

    await connection.end();
    return merged;
  } catch (err) {
    console.error('Error querying database:', err.message);
    await connection.end();
    throw err;
  }
}


// Provide a unified interface function for index.js to call
async function getParkingData(source = 'local') {
  if (source === 'cloud') {
    return await fetchFromCloudDB();
  } else {
    return fetchFromLocalFile();
  }
}

// export the getParkingData function for use in index.js
module.exports = {
  getParkingData
};
