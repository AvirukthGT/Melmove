const fs = require('fs');
const path = require('path');
const sql = require('mssql');
const fetchFn = globalThis.fetch;

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
  const pool = await sql.connect({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,            // melmovesqlserver.database.windows.net
    database: process.env.DB_NAME,          // melmove_sql
    port: Number(process.env.DB_PORT) || 1433,
    options: { encrypt: true, trustServerCertificate: false }
  });

  try {
    // 1) 读 gold_parking_latest_status（已含 lat/lon/status/...）
    const result = await pool.request().query(`
      SELECT kerbsideid, status_description, status_timestamp, lastupdated, lat, lon
      FROM gold_parking_latest_status
    `);
    const rows = result.recordset || [];

    // 2) 用本地 bays.json 补充搜索需要的 roadsegmentdescription（name）
    const bays = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/on-street-parking-bays.json'), 'utf8')
    );
    const bayById = new Map();
    for (const b of bays) {
      if (b?.kerbsideid != null) {
        bayById.set(String(b.kerbsideid), {
          roadsegmentdescription: b.roadsegmentdescription || 'Unknown Street',
          lat: b.latitude,
          lng: b.longitude
        });
      }
    }

    // 3) 映射为前端需要的结构（注意 lon -> lng）
    const merged = rows.map(r => {
      const key = r?.kerbsideid != null ? String(r.kerbsideid) : null;
      const bay = key ? bayById.get(key) : undefined;

      const lat = r.lat ?? bay?.lat ?? -37.8136;
      const lng = (r.lon ?? bay?.lng ?? 144.9631);

      return {
        id: r.kerbsideid,
        name: bay?.roadsegmentdescription || 'Unknown Street',
        lat,
        lng,
        rates: { hourly: 8, daily: 35 },
        status: r.status_description == null ? null : r.status_description === 'Unoccupied',
        last_updated: r.status_timestamp || r.lastupdated || null
      };
    });

    return merged;
  } finally {
    await pool.close();
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

// ---------- 3)Use JSON API----------
async function fetchFromJsonApi(url = process.env.JSON_API_URL) {
  if (!url) {
    url = 'https://melmoveinsight.z8.web.core.windows.net/data/part-merged.json';
  }

  const res = await fetchFn(url, {
    // Caching can be disabled on demand. - 304 problem
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  });

  if (!res.ok) {
    throw new Error(`JSON API HTTP ${res.status}`);
  }

  const text = await res.text();

  let records;
  // Supports both pure arrays and NDJSON (one JSON per line)
  const trimmed = text.trim();
  if (trimmed.startsWith('[')) {
    records = JSON.parse(trimmed);
  } else {
    records = trimmed
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => JSON.parse(l));
  }

  // Use local bays json add roadsegmentdescription
  let bayById = null;
  try {
    const bays = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/on-street-parking-bays.json'), 'utf8')
    );
    bayById = new Map();
    for (const b of bays) {
      if (b?.kerbsideid != null) {
        bayById.set(String(b.kerbsideid), b.roadsegmentdescription || 'Unknown Street');
      }
    }
  } catch (e) {
    console.warn('Read local bays.json failed, names may fallback to Unknown Street:', e.message);
  }

  return records.map(r => ({
    id: r.kerbsideid,
    name: bayById?.get(String(r.kerbsideid)) || 'Unknown Street',
    lat: r.lat ?? -37.8136,
    lng: r.lon ?? 144.9631,       // API uses lon, which is mapped to lng here
    rates: { hourly: 8, daily: 35 },
    status: r.status_description == null ? null : r.status_description === 'Unoccupied',
    last_updated: r.status_timestamp || r.lastupdated || null
  }));
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
    if (source === 'cloud') {
      data = await fetchFromCloudDB();
    } else if (source === 'json') {
      data = await fetchFromJsonApi();
    } else {
      data = fetchFromLocalFile();
    }
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