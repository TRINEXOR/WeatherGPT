# WeatherGPT

## Hyper-Local Meteorological Intelligence Platform

WeatherGPT is a full-stack meteorological intelligence and weather analysis platform designed to make weather information easier to understand and more actionable.

The platform combines real-time weather observations, forecasts, air-quality information, geospatial visualization, radar data, weather advisories, climate analysis, cyclone monitoring, and conversational weather assistance in a single interface.

It is designed with practical use cases in mind, including agriculture, disaster preparedness, travel planning, urban monitoring, and general weather awareness.

---

## Key Features

### Real-Time Weather Information

WeatherGPT provides real-time atmospheric information including:

- Temperature
- Feels-like temperature
- Relative humidity
- Atmospheric pressure
- Cloud cover
- UV index
- Wind speed
- Wind gusts
- Wind direction
- Air quality information

### Air Quality Monitoring

The platform provides air-quality information and particulate measurements including:

- PM2.5
- PM10
- NO2
- O3
- CO
- SO2

AQI information is presented with corresponding health-risk classifications.

### Interactive Weather Map

The platform provides an interactive geospatial weather interface with:

- Radar visualization
- Rainfall information
- Wind-flow visualization
- Temperature zones
- Weather station information
- Geographic overlays
- Interactive map navigation

### Radar and Rainfall Visualization

WeatherGPT integrates radar tile data to visualize precipitation activity and rainfall patterns.

The radar interface includes range-based visualization and precipitation intensity information.

### Wind Stream Visualization

A custom HTML5 Canvas-based visualization represents atmospheric wind flow using animated particles and directional vectors.

The visualization is generated from wind speed and direction information.

### Conversational Weather Assistant

The conversational interface allows users to ask weather-related questions using natural language.

Examples include:

- "Will it rain today?"
- "What will the weather be tomorrow?"
- "Is it safe to travel?"
- "Should I water my crops today?"
- "What is the weather forecast for the next seven days?"

The assistant converts available meteorological information into structured and understandable responses.

### Multilingual Support

WeatherGPT is designed to support multiple Indian languages, including:

- English
- Hindi
- Marathi
- Bengali
- Tamil
- Telugu
- Gujarati
- Kannada
- Malayalam
- Punjabi
- Odia

### Agricultural Weather Advisory

The agriculture module focuses on weather-based decision support for farmers.

Potential applications include:

- Irrigation planning
- Crop spraying conditions
- Harvest planning
- Rainfall planning
- Weather-risk awareness
- Soil moisture considerations
- Weather-based agricultural decisions

The objective is to make complex weather information easier to use for practical agricultural decisions.

### Cyclone Monitoring

The cyclone module provides a dedicated interface for monitoring tropical disturbances and cyclone-related information.

It can display information such as:

- Storm position
- Movement
- Central pressure
- Storm trajectory
- Coastal warning information

### Forecast Analysis

WeatherGPT provides forecast information across multiple time scales, including:

- Current conditions
- Hourly forecast
- Daily forecast
- Seven-day forecast
- Precipitation probability
- Temperature trends

### Climate Analysis

The platform includes components for examining historical weather information and climate-related trends.

These tools are intended to help users understand changes and patterns in weather data over time.

---

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Motion
- React-Leaflet
- Leaflet
- Recharts
- HTML5 Canvas
- Lucide React

### Backend

- Node.js
- Express
- TypeScript
- tsx
- esbuild

### Data and Weather Services

- Open-Meteo
- RainViewer
- Public meteorological data sources
- Geospatial weather data

### AI Integration

- Server-side AI service integration
- Natural-language weather query processing
- Meteorological response generation

---

## Project Structure

```text
weathergpt/
│
├── public/
│   ├── favicon.svg
│   └── weathergpt-logo.svg
│
├── server/
│   ├── geminiService.ts
│   └── weatherService.ts
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
│   │   ├── map/
│   │   └── weather/
│   │
│   ├── data/
│   ├── types.ts
│   ├── App.tsx
│   └── main.tsx
│
├── server.ts
├── vite.config.ts
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm

You can also use Bun or Yarn if preferred.

### Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/weathergpt.git
cd weathergpt
```

Install dependencies:

```bash
npm install
```

---

## Environment Configuration

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

The API key should remain server-side and must not be exposed through frontend environment variables.

Do not commit `.env` files or API keys to GitHub.

Recommended `.gitignore` entries:

```text
.env
.env.local
.env.production
```

---

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at the local development URL shown by Vite.

---

## Production Build

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

---

## Deployment

### Vercel

WeatherGPT can be deployed using Vercel.

### Deployment Steps

1. Push the project to GitHub.
2. Open the Vercel dashboard.
3. Create a new project.
4. Import the GitHub repository.
5. Configure the required environment variables.
6. Deploy the project.

### Environment Variables

Add the following environment variable in the Vercel project settings:

```text
GEMINI_API_KEY
```

Use the corresponding API key as its value.

Do not add the API key directly to source code.

---

## Data Sources

### Open-Meteo

WeatherGPT uses Open-Meteo for weather and forecast information.

Website:

https://open-meteo.com/

### RainViewer

RainViewer is used for weather radar and precipitation visualization.

Website:

https://www.rainviewer.com/

### Leaflet

Leaflet provides the interactive map framework.

Website:

https://leafletjs.com/

### React-Leaflet

React-Leaflet integrates Leaflet with React.

Website:

https://react-leaflet.js.org/

---

## API and Service Architecture

```text
                    User
                     |
                     v
              React Frontend
                     |
          +----------+----------+
          |                     |
          v                     v
   Weather Services       AI Assistant
          |                     |
          v                     v
    Weather Data          AI Processing
          |                     |
          +----------+----------+
                     |
                     v
              WeatherGPT UI
```

The frontend communicates with backend services, while external weather providers supply meteorological data.

AI-related processing is handled through server-side services.

---

## Use Cases

### Agriculture

WeatherGPT can assist farmers with weather-based decisions such as:

- Irrigation timing
- Crop spraying conditions
- Harvest planning
- Rainfall awareness
- Weather-risk assessment

### Disaster Preparedness

The platform can help users access:

- Severe-weather information
- Heavy rainfall information
- Cyclone information
- Weather alerts
- Location-specific forecasts

### Travel and Daily Planning

Users can use the platform to understand:

- Current weather
- Rain probability
- Temperature trends
- Wind conditions
- Air quality
- Short-term forecasts

### Urban Weather Monitoring

Weather information can support:

- Local weather awareness
- Air-quality monitoring
- Rainfall monitoring
- Temperature analysis
- Weather-related planning

---

## Accessibility

WeatherGPT is designed with accessibility in mind.

The platform includes:

- Multilingual interaction
- Voice-based interaction
- Conversational queries
- Visual weather information
- Location-based weather information

These features are intended to make meteorological information easier to access for users with different technical and language backgrounds.

---

## Project Goals

The main goals of WeatherGPT are:

1. Make weather information easier to understand.
2. Bring multiple meteorological data sources into one interface.
3. Provide contextual weather information through natural-language queries.
4. Improve accessibility for rural and multilingual users.
5. Support agriculture and weather-based decision making.
6. Improve access to severe-weather and cyclone information.
7. Provide useful visualization of complex meteorological data.

---

## Limitations

WeatherGPT depends on the availability, accuracy, coverage, and update frequency of its external weather data sources.

The platform should not be considered a replacement for official emergency warning systems or authoritative meteorological agencies.

For critical weather events and emergency decisions, users should always verify information with official meteorological authorities.

---

## Security

Sensitive credentials must never be committed to the repository.

Before pushing the project to GitHub, verify that the repository does not contain:

```text
.env
.env.local
API keys
Private credentials
Access tokens
Service credentials
```

If an API key is accidentally exposed, revoke and replace it immediately.

---

## License

WeatherGPT is open-source software licensed under the MIT License.

Copyright (c) 2026 Rahul.

See the [LICENSE](LICENSE) file for the complete license terms.

---

## Author

Developed by **Rahul**

B.Tech Artificial Intelligence and Machine Learning  
D. Y. Patil University

WeatherGPT was developed as a practical implementation of a Smart India Hackathon problem statement focused on conversational weather forecasting, alerts, climate information, and meteorological decision support.

---

## Project Status

Active development.

The project may be extended with additional meteorological datasets, official weather services, improved forecasting capabilities, additional regional languages, and enhanced decision-support features.
