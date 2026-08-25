# WeatherGPT — Hyper-Local Meteorological Intelligence Platform

WeatherGPT is a full-stack meteorological intelligence and weather analysis application designed to provide hyper-local real-time observations, multi-spectral geospatial telemetry, predictive microclimate modeling, and actionable agricultural and civil weather advisories.

---

## 🌟 Key Features

### 1. Real-Time Meteorological Telemetry
- **Hyper-Local Atmospheric Metrics**: Live temperature, feels-like thermal comfort index, relative humidity, barometric pressure (hPa), cloud cover, and UV radiation indexing.
- **Precision Wind Telemetry**: Sustained wind velocity, peak gust measurements, and 360° directional compass tracking.
- **Air Quality Index (AQI)**: Real-time particulate matter analysis ($PM_{2.5}$, $PM_{10}$, $NO_2$, $O_3$, $CO$, $SO_2$) with health risk classifications.

### 2. Multi-Spectral Geospatial Radar & Satellite Suite
- **Doppler Radar Reflectivity**: Live high-resolution radar scans with range rings ($50\text{ km}$, $120\text{ km}$, $220\text{ km}$) and dBZ reflectivity gradients for precipitation intensity detection.
- **Dynamic Thermal Zones**: Regional surface temperature contours and color-coded telemetry badges across national and local weather stations.
- **Particle Wind Streamline Engine**: Custom HTML5 canvas physics rendering real-time atmospheric particle flow vectors based on live wind velocity and compass bearings.
- **Satellite Infrared (IR)**: Cloud-top temperature scanning and convective storm cloud detection.

### 3. AI Meteorological Advisory & Briefing Assistant
- **Natural Language Forecasting**: Conversational assistant capable of synthesizing complex meteorological data into clean, structured, and easy-to-read briefings.
- **Multi-Lingual Capabilities**: Native support for English, Hindi, Marathi, Bengali, Tamil, Telugu, Gujarati, Kannada, Malayalam, Punjabi, and Odia.
- **Severe Weather Callouts**: Automated categorization of weather alerts, rain probabilities, and commute/travel recommendations.

### 4. Specialized Sector Modules
- **Agrometeorological Advisory**: Soil moisture stress analysis, automated irrigation scheduling, crop spraying conditions, and harvest safety windows.
- **Tropical Cyclone Tracking Center**: Active cyclonic disturbance tracking, central barometric pressure telemetry, storm movement trajectories, and coastal warning bulletins.
- **7-Day Predictive Modeling**: Interactive temperature curves, precipitation distribution charts, and hourly thermal profiles.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 (TypeScript)
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (`motion/react`)
- **Mapping & GIS**: Leaflet & React-Leaflet, CartoDB Dark Matter base tiles
- **Data Visualization**: Recharts & Canvas API
- **Icons**: Lucide React

### Backend & Middleware
- **Runtime**: Node.js & Express (TypeScript)
- **Build & Compilation**: Vite 6, tsx, esbuild
- **Data Providers**: Open-Meteo API, RainViewer Doppler Tile Feeds, Regional Meteorological Data Networks

---

## 📂 Project Structure

```text
├── public/
│   ├── favicon.svg             # Meteorological SVG favicon
│   └── weathergpt-logo.svg     # Brand vector asset
├── server/
│   ├── geminiService.ts        # AI meteorological reasoning & briefing engine
│   └── weatherService.ts       # Open-Meteo & geospatial telemetry service
├── src/
│   ├── components/
│   │   ├── agriculture/        # Agrometeorological advice components
│   │   ├── alerts/             # Severe weather warning banners
│   │   ├── brand/              # WeatherGPT logo & identity components
│   │   ├── chat/               # Conversational briefing panel
│   │   ├── climate/            # Historical climate & anomaly visualizers
│   │   ├── cyclone/            # Tropical cyclone tracking center
│   │   ├── forecast/           # 7-day forecast & hourly analytics
│   │   ├── layout/             # Header, Navigation, and Sidebar
│   │   ├── map/                # Doppler Radar, Wind Streams, Thermal Zones
│   │   └── weather/            # Current metric widgets & AQI cards
│   ├── data/                   # Indian & global station coordinates
│   ├── types.ts                # TypeScript interfaces & types
│   ├── App.tsx                 # Core application controller
│   └── main.tsx                # Client application entry point
├── server.ts                   # Express server with Vite middleware
├── vite.config.ts              # Vite bundler configuration
└── package.json                # Project dependencies and run scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** / **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/weathergpt.git
cd weathergpt
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root:
```env
# Optional: Model API Key for conversational meteorological reasoning
GEMINI_API_KEY=your_api_key_here
```
*(Note: Core weather telemetry, Doppler radar, thermal zones, AQI, and forecasts run fully with real-time public meteorological APIs even without an API key).*

### 4. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## 🚀 Deploying to Vercel (1-Click Deployment)

This project is pre-configured for instant **Vercel** deployment with serverless API functions and Vite Edge CDN assets:

### Method 1: Using GitHub & Vercel Dashboard (Recommended)
1. Push this repository to your **GitHub** account.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. (Optional) In **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your API key, if using conversational AI)*
5. Click **"Deploy"**. Vercel will automatically build the React Vite frontend and deploy the `/api` serverless backend functions.

### Method 2: Using Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## 📦 Production Build (Docker / Node.js Server)

To build the optimized static client bundle and compile the CommonJS production server:

```bash
npm run build
npm start
```

---

## 🛡️ License

This project is open-source and available under the [MIT License](LICENSE).
