const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Mock local file reading
function fetchFromLocalFile() {
  try {
    const baysData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/on-street-parking-bays.json'), 'utf8')
    );
    const sensorsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/on-street-parking-bay-sensors.json'), 'utf8')
    );

    // Normalize sensor kerbsideid to string for robust matching
    const sensorsByKerbsideId = new Map();
    for (const s of sensorsData) {
      if (s?.kerbsideid != null) sensorsByKerbsideId.set(String(s.kerbsideid), s);
    }

    // Combine datasets using normalized key; if no matching sensor, mark status as null (unknown)
    return baysData.map(bay => {
      const key = bay?.kerbsideid != null ? String(bay.kerbsideid) : null;
      const sensor = key ? sensorsByKerbsideId.get(key) : undefined;

      const statusBoolean = sensor == null
        ? null
        : sensor.status_description === 'Unoccupied';

      return {
        id: bay.kerbsideid,
        name: bay.roadsegmentdescription || 'Unknown Street',
        lat: bay.latitude ?? -37.8136,
        lng: bay.longitude ?? 144.9631,
        rates: { hourly: 8, daily: 35 },
        status: statusBoolean,
        last_updated: sensor?.status_timestamp || null
      };
    });
  } catch (err) {
    console.error('Error in fetchFromLocalFile:', err.message);
    return getMockData();
  }
}

// Read from cloud database
async function fetchFromCloudDB() {
  // Ensure the mysql2/promise package is installed
  const mysql = require('mysql2/promise');

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

    // Normalize IDs to string before matching to prevent type mismatches
    const sensorsByKerbsideId = new Map();
    for (const s of sensors) {
      if (s?.kerbsideid != null) sensorsByKerbsideId.set(String(s.kerbsideid), s);
    }

    const merged = bays.map(bay => {
      const key = bay?.kerbsideid != null ? String(bay.kerbsideid) : null;
      const sensor = key ? sensorsByKerbsideId.get(key) : undefined;
      return {
        id: bay.kerbsideid,
        name: bay.roadsegmentdescription || 'Unknown Street',
        lat: bay.latitude || -37.8136,
        lng: bay.longitude || 144.9631,
        rates: {
          hourly: 8,
          daily: 35
        },
        status: sensor == null ? null : sensor.status_description === 'Unoccupied',
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

// Mock data
function getMockData(){
  return [
    {
      name: 'King Street between Flinders Lane and Collins Street',
      lat: -37.8185,
      lng: 144.9568,
      rates: {
        hourly: 8,
        daily: 35
      },
      status: false,
      last_updated: new Date().toISOString()
    },
    {
      name: 'Lonsdale Street between King Street and Spencer Street',
      lat: -37.8163,
      lng: 144.9612,
      rates: {
        hourly: 10,
        daily: 40
      },
      status: true,
      last_updated: new Date().toISOString()
    }
  ];
}

// Filter function to apply keyword search
function filterByKeyword(data, keyword) {
  if (!keyword) return data;
  const lower = keyword.toLowerCase();
  return data.filter(d => d.name?.toLowerCase().includes(lower));
}

// Haversine formula to calculate distance between two coordinates
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radium
  const toRad = (deg) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Provide a unified interface function for index.js to call
async function getParkingData(source = 'local', keyword = '', lat = null, lng = null, radiusKm = null) {
  let data;
  try {
    data = (source === 'cloud') ? await fetchFromCloudDB() : fetchFromLocalFile();
  } catch (error) {
    console.error('Error fetching data:', error);
    data = getMockData(); // Backup plan using mock Data
  }

  // filter by keyword
  data = filterByKeyword(data, keyword);

  // filter by distance if lat, lng and radiusKm are provided
  if (lat && lng && radiusKm) {
    data = data.filter(item => {
      if (item.lat && item.lng) {
        return haversineDistance(lat, lng, item.lat, item.lng) <= radiusKm;
      }
      return false;
    });
  }

  // Filter function to apply keyword search
  function filterByKeyword(data, keyword) {
    if (!keyword) return data;
    const lower = keyword.toLowerCase();
    return data.filter(d => d.name?.toLowerCase().includes(lower)
    );
  }

  return data;
}

// export the getParkingData function for use in index.js
module.exports = { getParkingData};