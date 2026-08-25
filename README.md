# WeatherGPT

### Hyper-Local Meteorological Intelligence Platform

WeatherGPT is a full-stack meteorological intelligence and weather analysis platform built to bring **real-time weather observations, forecasting, geospatial visualization, environmental monitoring, climate analysis, and actionable weather advisories** into a single interface.

The platform is designed around real meteorological data and provides a conversational way to explore complex weather information.

> **Ask the weather. Understand the risk. Act early.**

---

## Features

### Real-Time Weather Intelligence

WeatherGPT provides detailed atmospheric conditions for a selected location.

#### Atmospheric Metrics

* Temperature
* Feels-like temperature
* Relative humidity
* Atmospheric pressure
* Cloud cover
* UV index
* Precipitation
* Weather condition

#### Wind Telemetry

* Wind speed
* Wind gusts
* Wind direction
* Directional visualization

#### Air Quality

Where supported by the data provider:

* PM2.5
* PM10
* NO₂
* O₃
* CO
* SO₂
* AQI
* Health-risk classification

---

# Geospatial Weather Intelligence

WeatherGPT includes an interactive map for exploring weather conditions geographically.

### Weather Map

The map interface supports:

* Current location
* Location search
* Weather stations
* Temperature visualization
* Rainfall information
* Wind visualization
* Weather alerts
* Cyclone information
* Radar layers
* Satellite products where available

### Wind Stream Visualization

WeatherGPT uses HTML5 Canvas rendering to visualize wind movement based on available wind speed and directional data.

---

# Radar & Precipitation Monitoring

The platform supports real-time radar visualization through available radar data sources.

Features include:

* Radar imagery
* Precipitation visualization
* Radar animation
* Map overlays
* Geographic navigation
* Range-based weather exploration

Radar availability depends on the configured data provider and geographic coverage.

---

# Satellite Weather Information

The application architecture supports satellite-derived weather products where available.

Potential information includes:

* Infrared imagery
* Cloud structure
* Cloud-top temperature
* Convective activity
* Storm development

Only available real data products are displayed.

---

# Conversational Weather Assistant

WeatherGPT provides a natural-language interface for interacting with meteorological information.

Users can ask:

```text
What's the weather in Mumbai right now?

Will it rain tomorrow evening?

What is the temperature this afternoon?

Are there any weather warnings near me?

Is there a cyclone near Maharashtra?

How strong will the wind be tomorrow?

Compare this year's rainfall with previous years.

Explain the forecast in Hindi.
```

The conversational layer works with retrieved meteorological information rather than treating generated text as a substitute for live weather observations.

---

# Multilingual Support

The interface is designed to support multiple Indian languages.

Current language architecture includes:

* English
* Hindi
* Marathi
* Bengali
* Tamil
* Telugu
* Gujarati
* Kannada
* Malayalam
* Punjabi
* Odia

The language system is designed so additional languages can be introduced without changing the core weather-data architecture.

---

# Severe Weather Information

WeatherGPT can organize available severe-weather information into clear categories.

Supported categories include:

* Heavy rainfall
* Extreme rainfall
* Thunderstorms
* Lightning
* Strong winds
* Heatwaves
* Cold waves
* Cyclones
* Flood-related weather conditions
* Coastal weather risks

Where authoritative warning information is available, the source and validity information should be presented clearly.

---

# Cyclone Monitoring

The cyclone section provides a dedicated interface for tropical weather systems.

Depending on available data, it can display:

* Cyclone name
* Current position
* Wind speed
* Central pressure
* Movement direction
* Movement speed
* Forecast trajectory
* Affected areas
* Coastal warning information

Cyclone information is based on available meteorological data sources.

---

# Agriculture Weather Intelligence

WeatherGPT includes a dedicated agricultural weather module.

The module can help analyze:

* Rainfall conditions
* Irrigation timing
* Crop spraying conditions
* Harvest weather windows
* Temperature conditions
* Humidity
* Wind conditions
* Weather-related agricultural risks

Example:

```text
Agriculture Advisory

Rainfall is expected during the afternoon.

Consider reviewing irrigation requirements before the expected rainfall
and avoid spraying immediately before rain.

AI-generated advisory.
```

Agricultural recommendations are intended as weather-based decision support and should not replace professional agricultural guidance.

---

# Forecasting

WeatherGPT provides an interactive forecasting interface.

### Forecast Features

* Current conditions
* Hourly forecast
* 24-hour outlook
* 7-day forecast
* Temperature trends
* Rain probability
* Precipitation totals
* Wind trends
* Humidity
* Sunrise and sunset
* UV information

Forecast values are retrieved from configured meteorological services.

---

# Climate & Historical Analysis

The climate module is designed for historical weather exploration.

Potential analysis includes:

* Historical rainfall
* Temperature trends
* Monthly averages
* Annual averages
* Rainfall anomalies
* Temperature anomalies
* Historical comparisons
* Long-term weather trends

Example:

```text
Compare Mumbai rainfall this year
with the historical average.
```

Numerical calculations should be performed using structured data rather than generated estimates.

---

# Location Intelligence

WeatherGPT supports multiple ways of selecting a location.

### Supported Methods

* City search
* Town search
* District search
* State search
* Pincode-based search where supported
* Browser GPS
* Map selection
* Latitude and longitude

Example:

```text
Mumbai
Pune
Nashik
Nagpur
Bengaluru
Delhi
Chennai
```

The application can also use the browser's geolocation capability to retrieve weather for the user's current position.

---

# Voice Interaction

The application architecture supports voice-based interaction.

Basic flow:

```text
User speaks
     ↓
Speech recognition
     ↓
Weather query
     ↓
Weather data retrieval
     ↓
Response generation
     ↓
Voice output
```

This feature is particularly useful for mobile and accessibility-focused use cases.

---

# Weather Intelligence Architecture

WeatherGPT follows a data-first architecture.

```text
                    USER
                      │
                      ▼
             ┌─────────────────┐
             │  WeatherGPT UI  │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │ Query Processing│
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │ Weather Services│
             └────────┬────────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
          ▼           ▼           ▼
      Forecast      Radar       AQI
       Data         Data        Data
          │           │           │
          └───────────┼───────────┘
                      │
                      ▼
             ┌─────────────────┐
             │ Data Processing │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │ WeatherGPT AI   │
             │ Interpretation  │
             └────────┬────────┘
                      │
                      ▼
                 USER RESPONSE
```

---

# Data Integrity

WeatherGPT follows a real-data approach.

The application is designed to:

* Retrieve weather information from external meteorological providers.
* Preserve provider timestamps where available.
* Distinguish observations from forecasts.
* Distinguish official warnings from generated explanations.
* Handle unavailable provider data gracefully.
* Avoid presenting unavailable information as current.
* Keep external API credentials outside the source code.

### No Demo Weather Data

The application does not intentionally substitute fabricated weather values for unavailable live data.

When a required provider is unavailable, the appropriate unavailable/error state should be displayed.

---

# Technology Stack

## Frontend

* React 19
* TypeScript
* Tailwind CSS
* Motion
* Leaflet
* React-Leaflet
* Recharts
* HTML5 Canvas
* Lucide React

## Backend

* Node.js
* Express
* TypeScript

## Build System

* Vite
* tsx
* esbuild

## Meteorological Services

* Open-Meteo
* RainViewer
* Configurable external meteorological data sources

## Mapping

* Leaflet
* OpenStreetMap-compatible geographic data
* Cartographic weather layers

## Deployment

* Vercel

---

# Project Structure

```text
weathergpt/
│
├── api/
│   ├── health.ts
│   ├── chat.ts
│   │
│   ├── weather/
│   │   ├── current.ts
│   │   ├── hourly.ts
│   │   ├── daily.ts
│   │   └── alerts.ts
│   │
│   └── location/
│       └── search.ts
│
├── server/
│   ├── geminiService.ts
│   ├── weatherService.ts
│   ├── weatherCodes.ts
│   ├── locationService.ts
│   └── alertService.ts
│
├── src/
│   ├── components/
│   │   ├── agriculture/
│   │   ├── alerts/
│   │   ├── brand/
│   │   ├── chat/
│   │   ├── climate/
│   │   ├── cyclone/
│   │   ├── forecast/
│   │   ├── layout/
│   │   ├── locations/
│   │   ├── map/
│   │   ├── modals/
│   │   ├── settings/
│   │   └── weather/
│   │
│   ├── data/
│   ├── types.ts
│   ├── App.tsx
│   └── main.tsx
│
├── public/
│   ├── favicon.svg
│   └── weathergpt-logo.svg
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
└── README.md
```

---

# Getting Started

## Requirements

Install:

* Node.js 18+
* npm
* Git

Verify:

```bash
node --version
npm --version
```

---

## Clone the Repository

```bash
git clone https://github.com/your-username/weathergpt.git

cd weathergpt
```

---

## Install Dependencies

```bash
npm install
```

---

## Environment Configuration

Create a `.env` file based on `.env.example`.

Example:

```env
GEMINI_API_KEY=your_api_key
```

Additional environment variables may be required depending on the configured meteorological services.

Never commit `.env` files containing secrets.

---

# Local Development

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by the development server.

---

# Production Build

Build the application:

```bash
npm run build
```

Start the production server where applicable:

```bash
npm start
```

For Vercel deployment, the production build is handled by the platform.

---

# Vercel Deployment

WeatherGPT is configured for deployment on Vercel.

### Recommended Configuration

```text
Framework:
Vite

Build Command:
npm run build

Output Directory:
dist

Install Command:
npm install
```

### Deployment Steps

1. Push the repository to GitHub.
2. Open your Vercel dashboard.
3. Import the repository.
4. Select the project.
5. Configure the required environment variables.
6. Deploy the application.

After deployment, verify:

```text
/api/health
/api/weather/current
/api/weather/hourly
/api/weather/daily
/api/weather/alerts
/api/chat
```

---

# Environment Variables

Example `.env.example`:

```env
GEMINI_API_KEY=

WEATHER_API_KEY=
WEATHER_API_BASE_URL=

ALERT_API_KEY=
ALERT_API_BASE_URL=

GEOCODING_API_KEY=
GEOCODING_API_BASE_URL=
```

Only configure variables required by the services used by your deployment.

### Security

Never commit:

```text
.env
.env.local
```

Never expose private API keys in client-side source code.

---

# API Endpoints

## Weather

```text
GET /api/weather/current
GET /api/weather/hourly
GET /api/weather/daily
GET /api/weather/alerts
```

Example:

```text
/api/weather/current?lat=19.0760&lon=72.8777
```

---

## Location

```text
GET /api/location/search
GET /api/location/reverse
```

---

## Cyclones

```text
GET /api/cyclones
```

---

## Climate

```text
GET /api/climate/trends
```

---

## Conversational Assistant

```text
POST /api/chat
```

---

## Health

```text
GET /api/health
```

Example:

```json
{
  "status": "ok",
  "service": "WeatherGPT"
}
```

---

# Development Checks

Before deployment:

```bash
npm install
npm run build
```

Verify:

* TypeScript compilation
* Frontend build
* API routes
* Weather retrieval
* Location search
* Forecast rendering
* Map rendering
* Chat functionality
* Alert handling
* Responsive layout

---

# Security Practices

The project follows basic application security practices including:

* Environment-based secrets
* Server-side API requests
* Request validation
* Error handling
* Tool parameter validation
* Protection of private credentials
* External-data validation
* Prompt-injection awareness
* No sensitive credentials in the repository

---

# Responsive Interface

WeatherGPT is designed for:

* Mobile phones
* Tablets
* Laptops
* Desktop displays

The interface prioritizes:

* Clear weather information
* Large interactive controls
* Accessible navigation
* Responsive charts
* Touch-friendly maps
* Readable alert messages
* Simple conversational interaction

---

# Important Disclaimer

WeatherGPT is intended for **informational and decision-support purposes**.

Weather conditions can change rapidly.

For severe weather, emergency situations, aviation, marine operations, agricultural decisions, and other safety-critical activities, users should consult the appropriate official meteorological authorities and emergency services.

Generated explanations and advisories should not be interpreted as official warnings or guaranteed predictions.

---

# License

WeatherGPT is released under the **MIT License**.

See [`LICENSE`](LICENSE) for details.

---

# WeatherGPT

**Ask the weather. Understand the risk. Act early.**
