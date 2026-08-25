import express from 'express';
import { weatherService } from '../server/weatherService.js';
import { processWeatherChat } from '../server/geminiService.js';

const app = express();
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'WeatherGPT Meteorological Intelligence Server',
    timestamp: new Date().toISOString(),
  });
});

// Location search (Geocoding)
app.get('/api/location/search', async (req, res) => {
  try {
    const q = String(req.query.q || '');
    if (!q.trim()) {
      return res.json([]);
    }
    const results = await weatherService.searchLocation(q);
    res.json(results);
  } catch (err: any) {
    console.error('Error in /api/location/search:', err);
    res.status(500).json({ error: err.message || 'Geocoding service failure' });
  }
});

// Reverse geocoding
app.get('/api/location/reverse', async (req, res) => {
  try {
    const lat = parseFloat(String(req.query.lat));
    const lon = parseFloat(String(req.query.lon));
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Valid latitude and longitude required' });
    }
    const loc = await weatherService.reverseGeocode(lat, lon);
    res.json(loc);
  } catch (err: any) {
    console.error('Error in /api/location/reverse:', err);
    res.status(500).json({ error: err.message || 'Reverse geocoding failure' });
  }
});

// Full weather data (current + hourly + daily + alerts + AQI)
app.get('/api/weather/current', async (req, res) => {
  try {
    const lat = parseFloat(String(req.query.lat || '19.076'));
    const lon = parseFloat(String(req.query.lon || '72.877'));
    const name = String(req.query.name || 'Mumbai');

    const data = await weatherService.getWeatherData(lat, lon, name);
    res.json(data);
  } catch (err: any) {
    console.error('Error in /api/weather/current:', err);
    res.status(500).json({ error: 'Weather data temporarily unavailable from provider. Please try again shortly.' });
  }
});

// Active weather alerts
app.get('/api/weather/alerts', async (req, res) => {
  try {
    const lat = parseFloat(String(req.query.lat || '19.076'));
    const lon = parseFloat(String(req.query.lon || '72.877'));
    const name = String(req.query.name || 'Mumbai');

    const data = await weatherService.getWeatherData(lat, lon, name);
    res.json({
      location: name,
      alerts: data.alerts || [],
      source: 'Official Meteorological Alert Feeds (IMD/WMO Criteria)',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error in /api/weather/alerts:', err);
    res.status(500).json({ error: 'Unable to retrieve alert feed' });
  }
});

// Radar & Satellite Map timestamps proxy
let radarCache: { data: any; timestamp: number } | null = null;
app.get('/api/weather/radar-maps', async (req, res) => {
  try {
    if (radarCache && Date.now() - radarCache.timestamp < 120000) {
      return res.json(radarCache.data);
    }
    const response = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
      headers: { 'User-Agent': 'WeatherGPT/1.0' },
    });
    if (response.ok) {
      const data = await response.json();
      radarCache = { data, timestamp: Date.now() };
      return res.json(data);
    }
    throw new Error(`RainViewer API returned status ${response.status}`);
  } catch (err: any) {
    console.warn('Failed to fetch live RainViewer maps:', err.message);
    const nowSec = Math.floor(Date.now() / 1000);
    const rounded = Math.floor(nowSec / 600) * 600;
    res.json({
      host: 'https://tilecache.rainviewer.com',
      radar: {
        past: [{ time: rounded, path: `/v2/radar/${rounded}/256/{z}/{x}/{y}/2/1_1.png` }],
        nowcast: [],
      },
      satellite: {
        infrared: [{ time: rounded, path: `/v2/satellite/${rounded}/256/{z}/{x}/{y}/0/0_0.png` }],
      },
    });
  }
});

// Active tropical cyclone tracking bulletin
app.get('/api/cyclones', async (req, res) => {
  try {
    const cyclones = await weatherService.getCycloneInfo();
    res.json(cyclones);
  } catch (err: any) {
    console.error('Error in /api/cyclones:', err);
    res.status(500).json({ error: 'Cyclone monitoring service unavailable' });
  }
});

// Historical climate analysis (10-year trends)
app.get('/api/climate/trends', async (req, res) => {
  try {
    const lat = parseFloat(String(req.query.lat || '19.076'));
    const lon = parseFloat(String(req.query.lon || '72.877'));
    const name = String(req.query.name || 'Mumbai');

    const climateData = await weatherService.getHistoricalClimate(lat, lon, name);
    res.json(climateData);
  } catch (err: any) {
    console.error('Error in /api/climate/trends:', err);
    res.status(500).json({ error: 'Historical climate data unavailable' });
  }
});

// Agriculture advisory endpoint
app.post('/api/advisory/agriculture', async (req, res) => {
  try {
    const { location = 'Mumbai', lat = 19.076, lon = 72.877, crop = 'Kharif Crops' } = req.body;
    const advisory = await weatherService.generateAgricultureAdvisory(location, lat, lon, crop);
    res.json(advisory);
  } catch (err: any) {
    console.error('Error in /api/advisory/agriculture:', err);
    res.status(500).json({ error: 'Agriculture advisory generation failed' });
  }
});

// Travel route weather endpoint
app.post('/api/advisory/travel', async (req, res) => {
  try {
    const { origin = 'Mumbai', destination = 'Pune' } = req.body;
    const advisory = await weatherService.generateTravelAdvisory(origin, destination);
    res.json(advisory);
  } catch (err: any) {
    console.error('Error in /api/advisory/travel:', err);
    res.status(500).json({ error: 'Travel advisory generation failed' });
  }
});

// Conversational AI Weather Assistant
app.post('/api/chat', async (req, res) => {
  try {
    const { message, currentLocation, language, history } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const result = await processWeatherChat({
      message,
      currentLocation,
      language,
      history,
    });

    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.json({
      content: 'Meteorological advisory service is momentarily busy. Please try your question again in a moment.',
      toolCalls: [],
      sources: ['Real-time Meteorological Feed'],
    });
  }
});

export default app;
