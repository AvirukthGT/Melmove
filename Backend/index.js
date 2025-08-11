// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Debug: 找出带占位符的环境变量
Object.entries(process.env)
  .filter(([k, v]) => typeof v === 'string' && /\$\{.+\}/.test(v))
  .forEach(([k, v]) => console.log('[ENV with ${..}]', k, '=', v));

// Debug: 追踪谁在注册路由
const app = express();
const _use = app.use.bind(app);
app.use = function (...args) {
  if (typeof args[0] === 'string') {
    console.log('[APP.USE]', args[0]);
  }
  return _use(...args);
};
const _get = app.get.bind(app);
app.get = function (path, ...rest) {
  console.log('[APP.GET]', path);
  return _get(path, ...rest);
};

const { getParkingData } = require('./services/parkingService');
const PORT = process.env.PORT || 3000;

// ===== Global CORS configuration =====
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,                
  /^http:\/\/127\.0\.0\.1:\d+$/,              
  /^https:\/\/melmove\.vercel\.app$/,         
  /^https:\/\/melmove-git-.*\.vercel\.app$/   
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const ok = allowedOrigins.some(pattern => pattern.test(origin));
    if (ok) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json());

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

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ===== for python prediction api =====
const PREDICT_API_BASE = process.env.PREDICT_API_BASE; // 在 Render 环境变量里配置，https://melmove-python-prediction.onrender.com
if (!PREDICT_API_BASE) {
  console.warn('[WARN] PREDICT_API_BASE not set. Prediction routes will not work.');
}

// /predict —— 透传 JSON 数据
app.get('/predict', async (req, res) => {
  try {
    const { zone = '', hours = '24' } = req.query;
    const url = `${PREDICT_API_BASE}/predict?zone=${encodeURIComponent(zone)}&hours=${encodeURIComponent(hours)}`;
    const r = await fetch(url);
    const text = await r.text();
    res.status(r.status);
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json; charset=utf-8');
    res.send(text);
  } catch (e) {
    console.error('Proxy /predict error:', e);
    res.status(502).json({ ok: false, error: { code: 'PREDICT_UPSTREAM_ERROR', message: String(e) } });
  }
});

// /predict_plot —— 透传 PNG 图
app.get('/predict_plot', async (req, res) => {
  try {
    const { zone = '', hours = '24' } = req.query;
    const url = `${PREDICT_API_BASE}/predict_plot?zone=${encodeURIComponent(zone)}&hours=${encodeURIComponent(hours)}`;
    const r = await fetch(url);
    const buf = Buffer.from(await r.arrayBuffer());
    res.status(r.status);
    res.setHeader('Content-Type', r.headers.get('content-type') || 'image/png');
    res.send(buf);
  } catch (e) {
    console.error('Proxy /predict_plot error:', e);
    res.status(502).json({ ok: false, error: { code: 'PREDICT_UPSTREAM_ERROR', message: String(e) } });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
