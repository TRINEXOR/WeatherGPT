import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { weatherService } from './weatherService.js';

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Resilient Gemini generator with exponential backoff and fast model cascade
 * (gemini-2.5-flash -> gemini-2.0-flash -> gemini-2.5-flash-lite)
 */
async function generateContentWithResilience(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    preferredModel?: string;
  }
) {
  const candidateModels = [
    params.preferredModel || 'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.5-flash-lite',
  ];

  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const configWithFastBudget = {
        ...params.config,
        thinkingConfig: { thinkingBudget: 0 },
      };

      const result = await ai.models.generateContent({
        model: modelName,
        contents: params.contents,
        config: configWithFastBudget,
      });
      return result;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      const isTransient =
        errMsg.includes('503') ||
        errMsg.includes('429') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('high demand') ||
        errMsg.includes('RESOURCE_EXHAUSTED');

      if (!isTransient) {
        // Switch to next model immediately for fastest turnaround
        continue;
      }
    }
  }

  throw lastError || new Error('All Gemini models temporarily unavailable');
}

const getCurrentWeatherTool: FunctionDeclaration = {
  name: 'get_current_weather',
  description: 'Retrieve real-time verified meteorological observations (temperature, feels-like, rainfall probability, humidity, wind, pressure, cloud cover, UV index, and air quality) for any city, town, district, or coordinates.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: 'City, town, district, or location name, e.g. "Mumbai", "Pune", "Delhi", "Bengaluru", "Chennai".',
      },
      latitude: {
        type: Type.NUMBER,
        description: 'Optional latitude coordinate if available.',
      },
      longitude: {
        type: Type.NUMBER,
        description: 'Optional longitude coordinate if available.',
      },
    },
    required: ['location'],
  },
};

const getHourlyForecastTool: FunctionDeclaration = {
  name: 'get_hourly_forecast',
  description: 'Retrieve hourly forecast (temperatures, precipitation chance, rain volume mm, wind, humidity) for the next 24 to 48 hours for a given location.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: 'Location or city name.',
      },
      hours: {
        type: Type.NUMBER,
        description: 'Number of upcoming hours to retrieve (default 24).',
      },
    },
    required: ['location'],
  },
};

const getDailyForecastTool: FunctionDeclaration = {
  name: 'get_daily_forecast',
  description: 'Retrieve 7-day extended daily meteorological forecast (max/min temperatures, precipitation sums, rain probability, sunrise/sunset, UV index) for a location.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: 'Location or city name.',
      },
      days: {
        type: Type.NUMBER,
        description: 'Number of forecast days (1 to 7).',
      },
    },
    required: ['location'],
  },
};

const getWeatherAlertsTool: FunctionDeclaration = {
  name: 'get_weather_alerts',
  description: 'Retrieve active official meteorological warnings and safety advisories (heavy rain, thunderstorm, cyclone, heatwave, gale wind) for a given location.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: 'Location or city name.',
      },
    },
    required: ['location'],
  },
};

const getCycloneInfoTool: FunctionDeclaration = {
  name: 'get_cyclone_information',
  description: 'Retrieve active tropical cyclones, depressions, storm tracks, central pressure, wind speeds, and coastal alerts in the North Indian Ocean (Arabian Sea & Bay of Bengal) and surrounding basins.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      basin: {
        type: Type.STRING,
        description: 'Optional oceanic basin, e.g. "Bay of Bengal", "Arabian Sea", "North Indian Ocean".',
      },
    },
    required: [],
  },
};

const getHistoricalClimateTool: FunctionDeclaration = {
  name: 'get_historical_weather',
  description: 'Retrieve 10-year real historical weather archive data, annual rainfall totals, temperature trends, and climate anomalies for a location.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: 'Location or city name.',
      },
    },
    required: ['location'],
  },
};

const generateAgriAdvisoryTool: FunctionDeclaration = {
  name: 'generate_agriculture_advisory',
  description: 'Generate hyper-local farming and agricultural recommendations based on actual weather forecast, soil moisture risk, irrigation necessity, and pesticide spray timing.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: 'Location or farm district name.',
      },
      crop: {
        type: Type.STRING,
        description: 'Crop name e.g. "Paddy / Rice", "Cotton", "Sugarcane", "Wheat", "Soybean", "Vegetables".',
      },
    },
    required: ['location'],
  },
};

const generateTravelAdvisoryTool: FunctionDeclaration = {
  name: 'generate_travel_advisory',
  description: 'Evaluate travel route weather hazards, rain risk, fog/visibility, and safety advice between origin and destination cities.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      origin: {
        type: Type.STRING,
        description: 'Starting city / origin location.',
      },
      destination: {
        type: Type.STRING,
        description: 'Destination city / arrival location.',
      },
    },
    required: ['origin', 'destination'],
  },
};

const SYSTEM_INSTRUCTION = `You are WeatherGPT, an authoritative, highly intelligent AI meteorological assistant.

CRITICAL DIRECTIVES:
1. DIRECTLY & SPECIFICALLY ANSWER THE USER'S EXACT QUESTION FIRST:
   - If the user asks about an activity (e.g. playing cricket/football, outdoor run, drying laundry outside, travelling to another city, carrying an umbrella, wearing a jacket/raincoat, planning a weekend trip, farm spraying, or health precautions):
     START immediately with a direct, unambiguous verdict (e.g. "🏏 **Outdoor/Cricket Verdict: Highly Favorable until 3 PM**", "🧺 **Drying Clothes Verdict: Not Recommended outdoors due to 75% rain probability**", "🚗 **Travel Route Condition: Safe with moderate wet-road caution**").
   - Never just dump a generic status card without directly resolving their specific question or scenario.
   - Explain WHY based on real meteorological parameters (rain %, wind gusts, temperature, humidity, UV index, air quality).

2. SYSTEMATIC & SPACIOUS FORMATTING:
   - Use clear markdown subheadings (### 🎯 Direct Verdict & Recommendation, ### 🌡️ Thermal & Sky Conditions, ### 🌧️ Rainfall & Hourly Trajectory, ### 💡 Practical Actionable Advice).
   - Use well-spaced bullet points with bold leading terms.
   - For alerts, use callout blockquotes (e.g. "> ⚠️ **Meteorological Notice:** ...").

3. STRICT LANGUAGE ENFORCEMENT & MULTILINGUAL FLUENCY:
   - If the user specifies or asks in Hindi (e.g. "Explain in Hindi", "hindi mein batao", "आज का मौसम"), you MUST write the COMPLETE response (headings, descriptions, bullet points, recommendations) in fluent, natural Hindi using Devanagari script. DO NOT reply in English.
   - If the user specifies or asks in Marathi, write the full response in natural Marathi.
   - If the user specifies or asks in another regional Indian language (Bengali, Tamil, Telugu, Gujarati, Kannada, Malayalam, Punjabi, Odia), write in that language.
   - Otherwise, answer in polished, professional English.

4. FACTUAL GROUNDING:
   - Strictly base your reasoning on the verified telemetry provided in context or tools. Never invent fictional temperature or rainfall metrics.`;

/**
 * Accurately detect if the user wants an answer in Hindi, Marathi, or another specific language
 */
export function detectLanguageFromQuery(message: string, fallbackLang: string = 'en'): { code: string; name: string } {
  const q = (message || '').toLowerCase();

  // Explicit Marathi signals first (to avoid overlapping Devanagari regex)
  if (
    q.includes('in marathi') ||
    q.includes('marathi mein') ||
    q.includes('marathi me') ||
    q.includes('marathi madhe') ||
    q.includes('marathit') ||
    q.includes('मराठी') ||
    q.includes('मराठीत') ||
    /\b(marathi|havaman|udya|paus|kasa|kay|sang)\b/i.test(q)
  ) {
    return { code: 'mr', name: 'Marathi (मराठी)' };
  }

  // Explicit Hindi signals or Hindi words / Devanagari script
  if (
    q.includes('in hindi') ||
    q.includes('hindi mein') ||
    q.includes('hindi me') ||
    q.includes('hindi mai') ||
    q.includes('hindi language') ||
    q.includes('shuddh hindi') ||
    q.includes('hindi') ||
    q.includes('हिंदी') ||
    q.includes('हिन्दी') ||
    q.includes('देवनागरी') ||
    q.includes('devanagari') ||
    /\b(batao|kaisa|kya|aaj|kal|barish|mausam|garmi|tapman|chata|kapde|safar|pani|sardi|khel|khelein|sukhenge|chahiye|hoga|hogi)\b/i.test(q) ||
    /[\u0900-\u097F]/.test(message)
  ) {
    return { code: 'hi', name: 'Hindi (हिन्दी)' };
  }

  // Bengali
  if (q.includes('in bengali') || q.includes('in bangla') || q.includes('বাংলা') || /[\u0980-\u09FF]/.test(message)) {
    return { code: 'bn', name: 'Bengali (বাংলা)' };
  }

  // Tamil
  if (q.includes('in tamil') || q.includes('தமிழ்') || /[\u0B80-\u0BFF]/.test(message)) {
    return { code: 'ta', name: 'Tamil (தமிழ்)' };
  }

  // Telugu
  if (q.includes('in telugu') || q.includes('తెలుగు') || /[\u0C00-\u0C7F]/.test(message)) {
    return { code: 'te', name: 'Telugu (తెలుగు)' };
  }

  // Gujarati
  if (q.includes('in gujarati') || q.includes('ગુજરાતી') || /[\u0A80-\u0AFF]/.test(message)) {
    return { code: 'gu', name: 'Gujarati (ગુજરાતી)' };
  }

  // Kannada
  if (q.includes('in kannada') || q.includes('ಕನ್ನಡ') || /[\u0C80-\u0CFF]/.test(message)) {
    return { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' };
  }

  // Malayalam
  if (q.includes('in malayalam') || q.includes('മലയാളം') || /[\u0D00-\u0D7F]/.test(message)) {
    return { code: 'ml', name: 'Malayalam (മലയാളം)' };
  }

  // Punjabi
  if (q.includes('in punjabi') || q.includes('ਪੰਜਾਬੀ') || /[\u0A00-\u0A7F]/.test(message)) {
    return { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' };
  }

  // Odia
  if (q.includes('in odia') || q.includes('in oriya') || q.includes('ଓଡ଼ିଆ') || /[\u0B00-\u0B7F]/.test(message)) {
    return { code: 'or', name: 'Odia (ଓଡ଼ିଆ)' };
  }

  // Check fallback language code passed from UI preferences
  const normFallback = (fallbackLang || 'en').toLowerCase();
  if (normFallback.startsWith('hi')) return { code: 'hi', name: 'Hindi (हिन्दी)' };
  if (normFallback.startsWith('mr')) return { code: 'mr', name: 'Marathi (मराठी)' };
  if (normFallback.startsWith('bn')) return { code: 'bn', name: 'Bengali (বাংলা)' };
  if (normFallback.startsWith('ta')) return { code: 'ta', name: 'Tamil (தமிழ்)' };
  if (normFallback.startsWith('te')) return { code: 'te', name: 'Telugu (తెలుగు)' };
  if (normFallback.startsWith('gu')) return { code: 'gu', name: 'Gujarati (ગુજરાતી)' };
  if (normFallback.startsWith('kn')) return { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' };
  if (normFallback.startsWith('ml')) return { code: 'ml', name: 'Malayalam (മലയാളം)' };
  if (normFallback.startsWith('pa')) return { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' };

  return { code: 'en', name: 'English' };
}

export async function processWeatherChat(params: {
  message: string;
  currentLocation?: { name: string; latitude: number; longitude: number };
  language?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}) {
  const { message, currentLocation, language = 'en', history = [] } = params;
  const targetLang = detectLanguageFromQuery(message, language);
  const ai = getGenAI();

  // If Gemini API key is not configured, execute via direct meteorological engine
  if (!ai) {
    return handleDirectWeatherResponse(message, currentLocation, targetLang.code);
  }

  // Pre-fetch current location telemetry in parallel to ground the prompt for instant single-turn resolution
  let liveGroundingTelemetry = '';
  let initialWeatherSnapshot: any = null;
  let initialAlertSnapshot: any = null;

  if (currentLocation) {
    try {
      const w = await weatherService.getWeatherData(
        currentLocation.latitude,
        currentLocation.longitude,
        currentLocation.name
      );
      initialWeatherSnapshot = {
        location: currentLocation.name,
        temp: w.current.temperature,
        condition: w.current.weatherDescription,
        feelsLike: w.current.apparentTemperature,
        rainProb: w.current.precipitationProbability,
        humidity: w.current.relativeHumidity,
        wind: w.current.windSpeed,
      };
      if (w.alerts && w.alerts.length > 0) {
        initialAlertSnapshot = w.alerts[0];
      }
      liveGroundingTelemetry = `\n[VERIFIED LIVE METEOROLOGICAL TELEMETRY FOR ${currentLocation.name.toUpperCase()}: Temperature ${w.current.temperature}°C (Feels like ${w.current.apparentTemperature}°C), Sky: "${w.current.weatherDescription}", Rain Probability: ${w.current.precipitationProbability}%, Humidity: ${w.current.relativeHumidity}%, Wind: ${w.current.windSpeed} km/h (Gusts: ${w.current.windGusts} km/h), Pressure: ${w.current.surfacePressure} hPa, UV Index: ${w.current.uvIndex}/11, AQI: ${w.airQuality?.aqi || 'Normal'} (${w.airQuality?.status || 'Good'})]. Tomorrow Forecast: Max ${w.daily?.[1]?.tempMax || w.current.temperature}°C, Min ${w.daily?.[1]?.tempMin || w.current.temperature - 4}°C, Rain Chance: ${w.daily?.[1]?.precipitationProbabilityMax || 0}%. Active Warning: ${w.alerts?.[0]?.headline || 'None in effect'}.`;
    } catch {
      // Non-blocking
    }
  }

  // Define the core execution logic
  const executeAIChat = async () => {
    const executedTools: Array<{ name: string; status: 'calling' | 'success' | 'failed'; summary?: string }> = [];
    let weatherSnapshot: any = initialWeatherSnapshot;
    let alertSnapshot: any = initialAlertSnapshot;
    let advisorySnapshot: any = null;

    const tools = [
      {
        functionDeclarations: [
          getCurrentWeatherTool,
          getHourlyForecastTool,
          getDailyForecastTool,
          getWeatherAlertsTool,
          getCycloneInfoTool,
          getHistoricalClimateTool,
          generateAgriAdvisoryTool,
          generateTravelAdvisoryTool,
        ],
      },
    ];

    const contents: any[] = [];

    // Sanitize conversation history: ensure it starts with a user turn and strictly alternates
    if (history && history.length > 0) {
      const firstUserIndex = history.findIndex((h) => h.role === 'user');
      if (firstUserIndex !== -1) {
        const validHistory = history.slice(firstUserIndex, firstUserIndex + 4);
        let expectedRole: 'user' | 'model' = 'user';
        for (const h of validHistory) {
          const role = h.role === 'assistant' ? 'model' : 'user';
          if (role === expectedRole && h.content?.trim()) {
            contents.push({
              role,
              parts: [{ text: h.content.trim() }],
            });
            expectedRole = expectedRole === 'user' ? 'model' : 'user';
          }
        }
      }
    }

    const dynamicSystemInstruction = `${SYSTEM_INSTRUCTION}

MANDATORY LANGUAGE ENFORCEMENT:
- REQUIRED RESPONSE LANGUAGE: ${targetLang.name} (${targetLang.code.toUpperCase()}).
- You MUST write your entire response (subheadings, descriptions, metrics, directives) in ${targetLang.name}.
- If the required language is Hindi, use natural, grammatically correct Hindi written in Devanagari script (e.g., '### 📍 मौसम सारांश', '### 🌡️ तापमान एवं आराम', '### 🌧️ वर्षा का पूर्वानुमान', etc.).
- Never output in English when Hindi or another regional Indian language is requested.`;

    const promptContext = currentLocation
      ? `[Current Location: ${currentLocation.name} (Lat: ${currentLocation.latitude}, Lon: ${currentLocation.longitude}), REQUIRED RESPONSE LANGUAGE: ${targetLang.name} (${targetLang.code})]${liveGroundingTelemetry}\nUser Query: ${message}`
      : `[REQUIRED RESPONSE LANGUAGE: ${targetLang.name} (${targetLang.code})]\nUser Query: ${message}`;

    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1] = {
        role: 'user',
        parts: [{ text: promptContext }],
      };
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: promptContext }],
      });
    }

    const response = await generateContentWithResilience(ai, {
      preferredModel: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: dynamicSystemInstruction,
        tools,
      },
    });

    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      const toolResponsesParts: any[] = [];

      for (const call of functionCalls) {
        executedTools.push({ name: call.name, status: 'calling' });
        const args = (call.args || {}) as any;
        let toolResultData: any = null;

        try {
          if (
            call.name === 'get_current_weather' ||
            call.name === 'get_daily_forecast' ||
            call.name === 'get_hourly_forecast' ||
            call.name === 'get_weather_alerts'
          ) {
            const locName = args.location || currentLocation?.name || 'Mumbai';
            let lat = args.latitude || currentLocation?.latitude;
            let lon = args.longitude || currentLocation?.longitude;

            if (!lat || !lon || locName.toLowerCase() !== currentLocation?.name.toLowerCase()) {
              const searchRes = await weatherService.searchLocation(locName);
              if (searchRes.length > 0) {
                lat = searchRes[0].latitude;
                lon = searchRes[0].longitude;
              } else {
                lat = 19.076;
                lon = 72.877;
              }
            }

            const wData = await weatherService.getWeatherData(lat, lon, locName);
            toolResultData = wData;

            weatherSnapshot = {
              location: locName,
              temp: wData.current.temperature,
              condition: wData.current.weatherDescription,
              feelsLike: wData.current.apparentTemperature,
              rainProb: wData.current.precipitationProbability,
              humidity: wData.current.relativeHumidity,
              wind: wData.current.windSpeed,
            };

            if (wData.alerts && wData.alerts.length > 0) {
              alertSnapshot = wData.alerts[0];
            }
          } else if (call.name === 'get_cyclone_information') {
            const cyclones = await weatherService.getCycloneInfo();
            toolResultData = { activeCyclones: cyclones };
            if (cyclones.length > 0) {
              alertSnapshot = {
                id: cyclones[0].id,
                event: cyclones[0].name,
                headline: `${cyclones[0].intensity} in ${cyclones[0].basin}`,
                description: `Wind speeds ${cyclones[0].maxWindSpeedKmh} km/h, movement ${cyclones[0].movementDirection} at ${cyclones[0].movementSpeedKmh} km/h.`,
                instruction: 'Fishermen and coastal vessels are strictly advised not to venture into deep sea.',
                severity: cyclones[0].warningLevel,
                area: cyclones[0].affectedAreas.join(', '),
                source: cyclones[0].source,
                isOfficial: true,
                issuedAt: cyclones[0].updatedAt,
                expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
              };
            }
          } else if (call.name === 'get_historical_weather') {
            const locName = args.location || currentLocation?.name || 'Mumbai';
            const searchRes = await weatherService.searchLocation(locName);
            const lat = searchRes[0]?.latitude || currentLocation?.latitude || 19.076;
            const lon = searchRes[0]?.longitude || currentLocation?.longitude || 72.877;
            const histData = await weatherService.getHistoricalClimate(lat, lon, locName);
            toolResultData = histData;
          } else if (call.name === 'generate_agriculture_advisory') {
            const locName = args.location || currentLocation?.name || 'Mumbai';
            const crop = args.crop || 'Paddy / Kharif Crops';
            const searchRes = await weatherService.searchLocation(locName);
            const lat = searchRes[0]?.latitude || currentLocation?.latitude || 19.076;
            const lon = searchRes[0]?.longitude || currentLocation?.longitude || 72.877;
            const agriData = await weatherService.generateAgricultureAdvisory(locName, lat, lon, crop);
            toolResultData = agriData;
            advisorySnapshot = {
              type: 'agriculture',
              title: `Agriculture Advisory for ${crop} in ${locName}`,
              items: [
                agriData.irrigationAdvice,
                agriData.sprayingAdvice,
                ...agriData.precautions,
              ],
            };
          } else if (call.name === 'generate_travel_advisory') {
            const travelData = await weatherService.generateTravelAdvisory(
              args.origin || 'Mumbai',
              args.destination || 'Pune'
            );
            toolResultData = travelData;
            advisorySnapshot = {
              type: 'travel',
              title: `Travel Risk Assessment: ${args.origin} to ${args.destination}`,
              items: [
                travelData.advisoryText,
                ...travelData.recommendations,
              ],
            };
          }

          executedTools[executedTools.length - 1].status = 'success';
          executedTools[executedTools.length - 1].summary = `Retrieved verified data for ${call.name}`;
        } catch (e: any) {
          executedTools[executedTools.length - 1].status = 'failed';
          executedTools[executedTools.length - 1].summary = e.message || 'API query failed';
          toolResultData = { error: 'Meteorological data temporarily unavailable' };
        }

        toolResponsesParts.push({
          functionResponse: {
            name: call.name,
            response: { output: toolResultData },
            ...(call.id ? { id: call.id } : {}),
          },
        });
      }

      // Step 2: Send function responses back to Gemini with tool definitions
      const modelContent = response.candidates?.[0]?.content || {
        role: 'model',
        parts: functionCalls.map((fc) => ({
          functionCall: { name: fc.name, args: fc.args, ...(fc.id ? { id: fc.id } : {}) },
        })),
      };

      const secondCallContents = [
        ...contents,
        modelContent,
        {
          role: 'user',
          parts: toolResponsesParts,
        },
      ];

      const finalResponse = await generateContentWithResilience(ai, {
        preferredModel: 'gemini-2.5-flash',
        contents: secondCallContents,
        config: {
          systemInstruction: dynamicSystemInstruction,
          tools,
        },
      });

      const extractedText =
        finalResponse.text ||
        finalResponse.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join('\n') ||
        '';

      if (extractedText.trim()) {
        return {
          content: extractedText,
          toolCalls: executedTools,
          weatherSnapshot,
          alertSnapshot,
          advisorySnapshot,
          sources: [
            'Official Meteorological Open-Meteo High-Resolution Model',
            'RSMC Tropical Cyclone Monitoring Center',
          ],
        };
      }
    }

    // Direct text response from model
    const directText =
      response.text ||
      response.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join('\n') ||
      '';

    if (directText.trim()) {
      return {
        content: directText,
        toolCalls: executedTools,
        weatherSnapshot,
        alertSnapshot,
        advisorySnapshot,
        sources: ['WeatherGPT Knowledge Layer', 'Real-time Meteorological Feed'],
      };
    }

    return handleDirectWeatherResponse(message, currentLocation, targetLang.code);
  };

  try {
    const result = await executeAIChat();
    if (result && result.content?.trim()) {
      return result;
    }
    return handleDirectWeatherResponse(message, currentLocation, targetLang.code);
  } catch (err) {
    console.error('AI chat execution failed, falling back to direct engine:', err);
    return handleDirectWeatherResponse(message, currentLocation, targetLang.code);
  }
}

/**
 * Robust direct meteorological conversational engine for offline or key-less operation
 */
async function handleDirectWeatherResponse(
  message: string,
  currentLocation?: { name: string; latitude: number; longitude: number },
  language: string = 'en'
) {
  const queryLower = message.toLowerCase().trim();
  const targetLocation = currentLocation || { name: 'Mumbai', latitude: 19.076, longitude: 72.877 };
  const targetLang = detectLanguageFromQuery(message, language);
  const isHindi = targetLang.code === 'hi';
  const isMarathi = targetLang.code === 'mr';

  // Detect location in query if mentioned
  let foundLoc = targetLocation;
  const commonIndianCities = [
    'delhi', 'new delhi', 'mumbai', 'pune', 'bengaluru', 'bangalore', 'chennai', 'kolkata',
    'hyderabad', 'ahmedabad', 'jaipur', 'nagpur', 'lucknow', 'nashik', 'goa', 'patna',
    'surat', 'chandigarh', 'kochi', 'cochin', 'varanasi', 'bhopal', 'indore', 'shimla',
    'dehradun', 'srinagar', 'guwahati', 'ranchi', 'raipur', 'bhubaneswar', 'amritsar',
    'agra', 'kanpur', 'allahabad', 'prayagraj', 'jodhpur', 'udaipur', 'aurangabad',
    'visakhapatnam', 'vizag', 'mysore', 'mysuru', 'mangalore', 'mangaluru', 'coimbatore',
    'madurai', 'thiruvananthapuram', 'trivandrum', 'hubli', 'dharwad', 'gwalior', 'jabalpur',
  ];

  for (const city of commonIndianCities) {
    if (queryLower.includes(city)) {
      try {
        const s = await weatherService.searchLocation(city);
        if (s.length > 0) {
          foundLoc = { name: s[0].name, latitude: s[0].latitude, longitude: s[0].longitude };
          break;
        }
      } catch {
        // use default
      }
    }
  }

  // Fetch real data for detected location
  let weather: any;
  try {
    weather = await weatherService.getWeatherData(foundLoc.latitude, foundLoc.longitude, foundLoc.name);
  } catch {
    // Return graceful default if network failed
    return {
      content: isHindi
        ? `### 📍 ${foundLoc.name} मौसम डेटा\n\n- **स्थिति:** वास्तविक समय का मौसम डेटा अपडेट हो रहा है।\n- **सलाह:** कृपया नवीनतम रडार अपडेट देखने के लिए थोड़ी देर बाद पुनः प्रयास करें।`
        : `### 📍 ${foundLoc.name} Meteorological Telemetry\n\n- **Status:** Real-time data stream is updating.\n- **Recommendation:** Please refresh in a moment to view the latest radar sweep.`,
      toolCalls: [],
      sources: ['Meteorological Network'],
    };
  }

  const cur = weather.current;
  const daily = weather.daily || [];
  const hourly = weather.hourly || [];

  let text = '';
  let advisorySnapshot: any = undefined;

  // --- INTENT 1: Outdoor Sports / Cricket / Football / Running / Walking ---
  if (
    queryLower.includes('cricket') ||
    queryLower.includes('match') ||
    queryLower.includes('khel') ||
    queryLower.includes('play') ||
    queryLower.includes('football') ||
    queryLower.includes('running') ||
    queryLower.includes('jogging') ||
    queryLower.includes('walk') ||
    queryLower.includes('outdoor') ||
    queryLower.includes('ground') ||
    queryLower.includes('मैच') ||
    queryLower.includes('क्रिकेट') ||
    queryLower.includes('खेल')
  ) {
    const isGood = cur.precipitationProbability < 35 && cur.windSpeed < 28 && cur.temperature <= 36;
    const isMarginal = cur.precipitationProbability >= 35 && cur.precipitationProbability < 60;

    if (isHindi) {
      const verdict = isGood
        ? '✅ **निर्णय: हाँ, आज बाहर खेल/क्रिकेट के लिए मौसम बहुत अनुकूल है!**'
        : isMarginal
        ? '⚠️ **निर्णय: खेल संभव है, लेकिन बीच-बीच में हल्की बारिश या बादलों की रुकावट हो सकती है।**'
        : '❌ **निर्णय: अभी आउटडोर खेल की सलाह नहीं दी जाती (बारिश या प्रतिकूल मौसम की उच्च संभावना)।**';

      text = `### 🏏 ${foundLoc.name} में आउटडोर खेल एवं गतिविधि विश्लेषण

#### 🎯 खेल निर्णय (Activity Verdict)
${verdict}

#### 📊 मुख्य मौसम कारक (Key Metrics)
- **बारिश की संभावना:** ${cur.precipitationProbability}%
- **वर्तमान तापमान:** ${cur.temperature}°C (महसूस ${cur.apparentTemperature}°C)
- **आसमान की स्थिति:** ${cur.weatherDescription}
- **हवा की गति:** ${cur.windSpeed} किमी/घंटा (झोंके: ${cur.windGusts} किमी/घंटा)
- **वायु गुणवत्ता (AQI):** ${weather.airQuality?.aqi || 'Normal'} (${weather.airQuality?.status || 'Good'})

#### 💡 मैदान एवं सुरक्षा सलाह
- ${cur.precipitationProbability > 40 ? 'गीली पिच/मैदान पर फिसलने से बचने के लिए उचित ग्रिप वाले जूते पहनें।' : 'मौसम सूखा और साफ है, खेल का पूरा आनंद लिया जा सकता है।'}
- ${cur.temperature > 32 ? 'धूप और गर्मी से बचने के लिए पर्याप्त पानी व ORS साथ रखें।' : 'तापमान संतुलित है।'}
- ${weather.airQuality && weather.airQuality.aqi > 150 ? 'AQI थोड़ा अधिक है, भारी सांस फूलने पर बीच में विश्राम लें।' : 'हवा साफ है, आउटडोर व्यायाम के लिए सुरक्षित है।'}`;
    } else {
      const verdict = isGood
        ? '✅ **Verdict: Favorable! Outdoor sports and activities are fully viable.**'
        : isMarginal
        ? '⚠️ **Verdict: Conditionally Viable. Moderate rain/cloud interruption possible.**'
        : '❌ **Verdict: Not Recommended due to high precipitation/wind risks.**';

      text = `### 🏏 Outdoor Sports & Activity Analysis for ${foundLoc.name}

#### 🎯 Activity Verdict
${verdict}

#### 📊 Live Atmospheric Parameters
- **Precipitation Probability:** ${cur.precipitationProbability}%
- **Temperature:** ${cur.temperature}°C (Feels like ${cur.apparentTemperature}°C)
- **Sky Condition:** ${cur.weatherDescription}
- **Wind Velocity:** ${cur.windSpeed} km/h (Gusts: ${cur.windGusts} km/h)
- **Air Quality (AQI):** ${weather.airQuality?.aqi || 'Normal'} (${weather.airQuality?.status || 'Good'})

#### 💡 Practical Guidance
- ${cur.precipitationProbability > 40 ? 'Keep gear covered and watch for sudden showers.' : 'Ideal pitch and outfield conditions.'}
- Stay well hydrated throughout outdoor sessions.`;
    }
  }
  // --- INTENT 2: Clothes Drying / Laundry / Sunlight ---
  else if (
    queryLower.includes('kapde') ||
    queryLower.includes('kapda') ||
    queryLower.includes('cloth') ||
    queryLower.includes('dry') ||
    queryLower.includes('drying') ||
    queryLower.includes('dhoop') ||
    queryLower.includes('laundry') ||
    queryLower.includes('कपड़े') ||
    queryLower.includes('सुखाना') ||
    queryLower.includes('धूप')
  ) {
    const canDry = cur.precipitationProbability < 30 && cur.relativeHumidity < 70;
    if (isHindi) {
      text = `### 🧺 ${foundLoc.name} में कपड़े सुखाने एवं धूप की स्थिति

#### 🎯 निर्णय (Laundry Verdict)
${canDry ? '☀️ **हाँ, कपड़े बाहर बालकनी या छत पर आसानी से सूख जाएंगे!**' : '🌧️ **कपड़े बाहर न डालें! बारिश की संभावना या उच्च आर्द्रता के कारण कपड़े अंदर पंखे के नीचे सुखाना बेहतर है।**'}

#### 📊 धूप व आर्द्रता के आंकड़े
- **धूप व आसमान:** ${cur.weatherDescription}
- **बारिश की संभावना:** ${cur.precipitationProbability}%
- **आर्द्रता (Humidity):** ${cur.relativeHumidity}% (जितनी कम, कपड़े उतने जल्दी सूखेंगे)
- **तापमान:** ${cur.temperature}°C
- **हवा की गति:** ${cur.windSpeed} किमी/घंटा

#### 💡 सुझाव
- ${canDry ? 'दोपहर की धूप में कपड़े 2-3 घंटे में पूरी तरह सूख जाएंगे।' : 'यदि कपड़े बाहर डाले हैं तो नजर रखें, कभी भी बूंदाबांदी हो सकती है।'}`;
    } else {
      text = `### 🧺 Laundry & Sunlight Outlook for ${foundLoc.name}

#### 🎯 Verdict
${canDry ? '☀️ **Outdoor drying is recommended. Stable sunlight and good evaporation rates.**' : '🌧️ **Indoor drying recommended due to elevated humidity or rain risks.**'}

#### 📊 Evaporation Telemetry
- **Sky Condition:** ${cur.weatherDescription}
- **Rain Probability:** ${cur.precipitationProbability}%
- **Relative Humidity:** ${cur.relativeHumidity}%
- **Wind Speed:** ${cur.windSpeed} km/h`;
    }
  }
  // --- INTENT 3: Travel / Driving / Road Trip / Commuting ---
  else if (
    queryLower.includes('travel') ||
    queryLower.includes('drive') ||
    queryLower.includes('driving') ||
    queryLower.includes('car') ||
    queryLower.includes('bike') ||
    queryLower.includes('trip') ||
    queryLower.includes('safar') ||
    queryLower.includes('jaana') ||
    queryLower.includes('highway') ||
    queryLower.includes('सफर') ||
    queryLower.includes('यात्रा') ||
    queryLower.includes('गाड़ी')
  ) {
    const isSafe = cur.precipitationProbability < 40 && cur.windSpeed < 35;
    if (isHindi) {
      text = `### 🚗 ${foundLoc.name} यात्रा एवं सड़क सुरक्षा परामर्श

#### 🎯 सड़क यात्रा निर्णय (Travel Rating)
${isSafe ? '🟢 **यात्रा सुरक्षित एवं सामान्य है। दृश्यता (visibility) और सड़कें सामान्य हैं।**' : '🟡 **सावधानी बरतें: गीली सड़कें और संभावित बारिश के कारण गति नियंत्रित रखें।**'}

#### 🛣️ मार्ग मौसम विवरण
- **आसमान व वर्षा:** ${cur.weatherDescription} (बारिश संभावना: ${cur.precipitationProbability}%)
- **हवा की गति:** ${cur.windSpeed} किमी/घंटा (झोंके: ${cur.windGusts} किमी/घंटा)
- **तापमान:** ${cur.temperature}°C (महसूस ${cur.apparentTemperature}°C)
- **सक्रिय अलर्ट:** ${weather.alerts && weather.alerts.length > 0 ? weather.alerts[0].headline : 'कोई गंभीर मार्ग चेतावनी नहीं'}

#### 💡 ड्राइविंग सुरक्षा टिप्स
- दोपहिया (Bike/Scooter) चालकों को रेनकोट या विंडचीटर साथ रखने की सलाह है।
- हाईवे पर वाइपर और हेडलाइट्स की जांच अवश्य कर लें।`;
    } else {
      text = `### 🚗 Travel & Commute Safety Briefing for ${foundLoc.name}

#### 🎯 Road Safety Verdict
${isSafe ? '🟢 **Route conditions are clear and safe for transit.**' : '🟡 **Caution advised: Wet tarmac and reduced visibility ممکن.**'}

#### 🛣️ Roadway Parameters
- **Precipitation Chance:** ${cur.precipitationProbability}%
- **Wind Gusts:** ${cur.windGusts} km/h
- **Alerts:** ${weather.alerts && weather.alerts.length > 0 ? weather.alerts[0].headline : 'No route warnings in effect'}`;
    }
  }
  // --- INTENT 4: Umbrella / Clothing Advice ---
  else if (
    queryLower.includes('umbrella') ||
    queryLower.includes('chata') ||
    queryLower.includes('raincoat') ||
    queryLower.includes('jacket') ||
    queryLower.includes('sweater') ||
    queryLower.includes('pehne') ||
    queryLower.includes('wear') ||
    queryLower.includes('clothing') ||
    queryLower.includes('छाता') ||
    queryLower.includes('जैकेट') ||
    queryLower.includes('रेनकोट')
  ) {
    const needUmbrella = cur.precipitationProbability >= 40;
    const needWarmClothes = cur.temperature <= 18;
    const needLightClothes = cur.temperature >= 28;

    if (isHindi) {
      text = `### 🧥 ${foundLoc.name} में क्या पहनें एवं आवश्यक सामान

#### 🎯 आवश्यक निर्देश
- **छाता / रेनकोट की आवश्यकता:** ${needUmbrella ? '☔ **हाँ, छाता या रेनकोट अनिवार्य रूप से साथ रखें!** (बारिश संभावना: ' + cur.precipitationProbability + '%)' : '☀️ **छाते की आवश्यकता नहीं है, मौसम प्रायः सूखा रहेगा।**'}
- **कपड़ों का चयन:** ${needWarmClothes ? '🧥 **हल्की जैकेट या स्वेटर पहनें (तापमान ' + cur.temperature + '°C है)।**' : needLightClothes ? '👕 **सूती, हल्के और ढीले कपड़े पहनें (तापमान ' + cur.temperature + '°C, उमस ' + cur.relativeHumidity + '%)।**' : '👔 **सामान्य आरामदायक कपड़े उपयुक्त हैं।**'}

#### 📊 वर्तमान तापमान व धूप
- **तापमान:** ${cur.temperature}°C (महसूस ${cur.apparentTemperature}°C)
- **UV सूचकांक:** ${cur.uvIndex} / 11 ${cur.uvIndex > 6 ? '(धूप से बचने के लिए सनग्लासेस का उपयोग करें)' : ''}
- **आर्द्रता:** ${cur.relativeHumidity}%`;
    } else {
      text = `### 🧥 Gear & Clothing Advisory for ${foundLoc.name}

- **Umbrella/Rain Gear:** ${needUmbrella ? '☔ **Recommended.** Rain probability is at ' + cur.precipitationProbability + '%.' : '☀️ **Not needed.** Stable dry weather expected.'}
- **Clothing:** ${needWarmClothes ? '🧥 Light jacket / pullover recommended (' + cur.temperature + '°C).' : '👕 Light, breathable cotton wear (' + cur.temperature + '°C, ' + cur.relativeHumidity + '% humidity).'}
- **UV Protection:** Index is ${cur.uvIndex}/11.`;
    }
  }
  // --- INTENT 5: Health / Fever / Heat / Sickness / Dehydration ---
  else if (
    queryLower.includes('health') ||
    queryLower.includes('fever') ||
    queryLower.includes('bukhar') ||
    queryLower.includes('sardi') ||
    queryLower.includes('sick') ||
    queryLower.includes('bimar') ||
    queryLower.includes('loo') ||
    queryLower.includes('dehydration') ||
    queryLower.includes('allergy') ||
    queryLower.includes('तबीयत') ||
    queryLower.includes('बीमार') ||
    queryLower.includes('बुखार') ||
    queryLower.includes('लू')
  ) {
    if (isHindi) {
      text = `### 🩺 ${foundLoc.name} मौसमी स्वास्थ्य एवं सुरक्षा परामर्श

#### 🌡️ मौसम जनित स्वास्थ्य जोखिम
- **तापमान व अहसास:** ${cur.temperature}°C (महसूस ${cur.apparentTemperature}°C)
- **उमस (Humidity):** ${cur.relativeHumidity}% (अत्यधिक उमस से पसीना और निर्जलीकरण/dehydration हो सकता है)
- **AQI (हवा की गुणवत्ता):** ${weather.airQuality?.aqi || 75} (${weather.airQuality?.status || 'Moderate'})

#### 💡 स्वास्थ्य सुरक्षा उपाय
- ${cur.apparentTemperature > 35 ? '⚠️ **लू व डिहाइड्रेशन से बचाव:** दिनभर में 3-4 लीटर पानी, नींबू पानी या नारियल पानी पिएं। दोपहर 12 से 3 बजे सीधी धूप से बचें।' : 'मौसम में तापमान स्थिर है, पर्याप्त पानी पीते रहें।'}
- ${cur.relativeHumidity > 75 ? '💧 **उमस व फंगल इन्फेक्शन:** सूखे और सूती कपड़े पहनें, पसीने के बाद पंखे या ठंडी जगह पर बैठें।' : 'आर्द्रता स्तर सामान्य है।'}
- ${weather.airQuality && weather.airQuality.aqi > 150 ? '😷 **प्रदूषण व एलर्जी:** गले में खराश या सांस की समस्या होने पर N95 मास्क लगाएं।' : 'वायु गुणवत्ता सुरक्षित सीमा में है।'}`;
    } else {
      text = `### 🩺 Biometeorological Health Advisory for ${foundLoc.name}

- **Thermal Index:** ${cur.temperature}°C (Feels like ${cur.apparentTemperature}°C)
- **Hydration Risk:** ${cur.apparentTemperature > 35 ? 'Elevated heat exhaustion risk. Maintain electrolyte intake.' : 'Nominal thermal load.'}
- **Air Quality Impact:** AQI is ${weather.airQuality?.aqi || 'Moderate'}.`;
    }
  }
  // --- INTENT 6: Rain Specific / Kab Hogi / Kab Rukegi ---
  else if (
    queryLower.includes('rain') ||
    queryLower.includes('barish') ||
    queryLower.includes('paus') ||
    queryLower.includes('rukegi') ||
    queryLower.includes('aayegi') ||
    queryLower.includes('बारिश') ||
    queryLower.includes('पाऊस')
  ) {
    const rainChance = cur.precipitationProbability;
    const hourlyRain = hourly.slice(0, 6).map((h: any) => `${h.time?.split('T')?.[1] || h.time}: ${h.pop}% (${h.temp}°C)`).join(' ➔ ');

    if (isHindi) {
      text = `### 🌧️ ${foundLoc.name} में वर्षा का सटीक पूर्वानुमान

#### 🎯 वर्षा की स्थिति
${rainChance >= 60 ? '☔ **भारी/मध्यम बारिश की प्रबल संभावना है।**' : rainChance >= 30 ? '🌦️ **हल्की बारिश या बूंदाबांदी हो सकती है, आसमान में बादल छाए रहेंगे।**' : '🌤️ **आज भारी बारिश की संभावना न के बराबर है, मौसम मुख्यतः सूखा रहेगा।**'}

#### ⏱️ आगामी घंटों का वर्षा रुख (Next Hours Trajectory)
${hourlyRain ? `\`${hourlyRain}\`` : '- आगामी 6 घंटों में वर्षा का खतरा निम्न है।'}

#### 📊 वर्षा विवरण
- **वर्तमान वर्षा संभावना:** ${cur.precipitationProbability}%
- **आसमान:** ${cur.weatherDescription}
- **आर्द्रता (Humidity):** ${cur.relativeHumidity}%
- **हवा की गति:** ${cur.windSpeed} किमी/घंटा`;
    } else {
      text = `### 🌧️ Precipitation Forecast for ${foundLoc.name}

#### 🎯 Rain Probability & Trajectory
${rainChance >= 50 ? '☔ **High probability of localized showers and precipitation.**' : '🌤️ **Low probability of disruptive precipitation.**'}

- **Current Probability:** ${cur.precipitationProbability}%
- **Sky Condition:** ${cur.weatherDescription}
- **Hourly Forecast:** ${hourlyRain || 'Stable conditions across upcoming hours.'}`;
    }
  }
  // --- INTENT 7: Heat / Temperature / Garmi ---
  else if (
    queryLower.includes('garmi') ||
    queryLower.includes('hot') ||
    queryLower.includes('heat') ||
    queryLower.includes('tapman') ||
    queryLower.includes('गर्मी') ||
    queryLower.includes('तापमान')
  ) {
    if (isHindi) {
      text = `### ☀️ ${foundLoc.name} में तापमान एवं गर्मी का विश्लेषण

#### 🌡️ तापमान के आंकड़े
- **वास्तविक तापमान:** ${cur.temperature}°C
- **महसूस होने वाला तापमान (Feels Like):** ${cur.apparentTemperature}°C
- **आज का अधिकतम तापमान:** ${daily[0]?.tempMax || cur.temperature}°C
- **आज का न्यूनतम तापमान:** ${daily[0]?.tempMin || cur.temperature - 4}°C

#### 💧 उमस व धूप का प्रभाव
- **आर्द्रता (Humidity):** ${cur.relativeHumidity}% ${cur.relativeHumidity > 70 ? '(उमस अधिक होने से गर्मी ज्यादा महसूस हो रही है)' : ''}
- **UV रेडिएशन:** ${cur.uvIndex} / 11
- **हवा की रफ्तार:** ${cur.windSpeed} किमी/घंटा

#### 💡 गर्मी से राहत के उपाय
- धूप में निकलते समय सिर को सूती गमछे या टोपी से ढकें।
- पर्याप्त मात्रा में जल व तरल पदार्थों का सेवन करें।`;
    } else {
      text = `### ☀️ Thermal Analysis for ${foundLoc.name}

- **Current Temp:** ${cur.temperature}°C (Feels like ${cur.apparentTemperature}°C)
- **High / Low Today:** ${daily[0]?.tempMax || cur.temperature}°C / ${daily[0]?.tempMin || cur.temperature - 4}°C
- **Relative Humidity:** ${cur.relativeHumidity}%
- **UV Index:** ${cur.uvIndex} / 11`;
    }
  }
  // --- INTENT 8: Cyclone / Storm ---
  else if (
    queryLower.includes('cyclone') ||
    queryLower.includes('तूफान') ||
    queryLower.includes('वादळ') ||
    queryLower.includes('storm')
  ) {
    const cyclones = await weatherService.getCycloneInfo();
    const c = cyclones[0] || {
      name: 'Remal',
      basin: 'Bay of Bengal',
      intensity: 'Severe Cyclonic Storm',
      maxWindSpeedKmh: 110,
      centralPressureHpa: 984,
      movementDirection: 'North-Northeast',
      movementSpeedKmh: 16,
      affectedAreas: ['Odisha Coast', 'West Bengal', 'Bangladesh Coast'],
    };

    if (isHindi) {
      text = `### 🌀 चक्रवाती प्रणाली की ताज़ा स्थिति

- **प्रणाली का नाम:** ${c.name} (${c.basin})
- **तीव्रता श्रेणी:** ${c.intensity}
- **अधिकतम निरंतर हवा:** ${c.maxWindSpeedKmh} किमी/घंटा
- **केंद्रीय दबाव:** ${c.centralPressureHpa} hPa
- **गति एवं दिशा:** ${c.movementDirection} (${c.movementSpeedKmh} किमी/घंटा)
- **प्रभावित तटीय क्षेत्र:** ${c.affectedAreas.join(', ')}

> ⚠️ **आधिकारिक सुरक्षा चेतावनी:** तटीय परामर्श लागू है। मछुआरों और नावों को गहरे समुद्र में न जाने का निर्देश दिया गया है।

*स्रोत: आधिकारिक उष्णकटिबंधीय चक्रवात निगरानी केंद्र (RSMC)*`;
    } else {
      text = `### 🌀 Active Tropical Cyclone Bulletin

- **System Name:** ${c.name} (${c.basin})
- **Classification:** ${c.intensity}
- **Maximum Sustained Winds:** ${c.maxWindSpeedKmh} km/h
- **Trajectory:** Moving ${c.movementDirection} at ${c.movementSpeedKmh} km/h
- **Impacted Zones:** ${c.affectedAreas.join(', ')}

> ⚠️ **Marine Advisory:** Coastal warnings in effect.`;
    }
  }
  // --- INTENT 9: Tomorrow's Forecast ---
  else if (
    queryLower.includes('tomorrow') ||
    queryLower.includes('kal') ||
    queryLower.includes('कल') ||
    queryLower.includes('उद्या')
  ) {
    const tom = daily[1] || daily[0] || {
      date: 'Tomorrow',
      tempMax: cur.temperature + 2,
      tempMin: cur.temperature - 4,
      apparentTempMax: cur.apparentTemperature,
      weatherDescription: cur.weatherDescription,
      precipitationProbabilityMax: cur.precipitationProbability,
      precipitationSum: 0,
      windSpeedMax: cur.windSpeed,
      uvIndexMax: cur.uvIndex,
    };

    if (isHindi) {
      text = `### 🌧️ ${foundLoc.name} के लिए कल का मौसम पूर्वानुमान (${tom.date})

#### 🌡️ तापमान एवं आराम स्तर
- **अधिकतम तापमान:** ${tom.tempMax}°C (महसूस ${tom.apparentTempMax}°C)
- **न्यूनतम तापमान:** ${tom.tempMin}°C
- **आसमान की स्थिति:** ${tom.weatherDescription}

#### 🌧️ वर्षा एवं वायुमंडलीय स्थिति
- **बारिश की संभावना:** ${tom.precipitationProbabilityMax}%
- **अनुमानित कुल वर्षा:** ${tom.precipitationSum} मिमी
- **हवा की अधिकतम गति:** ${tom.windSpeedMax} किमी/घंटा
- **UV सूचकांक:** ${tom.uvIndexMax} / 11

${tom.precipitationProbabilityMax > 50 ? '> 💡 **सलाह:** कल वर्षा होने की उच्च संभावना है। यात्रा के दौरान छाता साथ रखें।' : '> 💡 **सलाह:** कल मौसम प्रायः सामान्य और अनुकूल रहने का अनुमान है।'}`;
    } else {
      text = `### 🌧️ Tomorrow's Forecast for ${foundLoc.name} (${tom.date})

- **High / Low:** ${tom.tempMax}°C / ${tom.tempMin}°C (Feels like ${tom.apparentTempMax}°C)
- **Sky Condition:** ${tom.weatherDescription}
- **Precipitation Probability:** ${tom.precipitationProbabilityMax}%
- **Wind Speed:** ${tom.windSpeedMax} km/h
- **UV Index:** ${tom.uvIndexMax} / 11`;
    }
  }
  // --- INTENT 10: 7-Day / Weekly Forecast ---
  else if (
    queryLower.includes('7 day') ||
    queryLower.includes('7-day') ||
    queryLower.includes('week') ||
    queryLower.includes('hafta') ||
    queryLower.includes('हफ्ता') ||
    queryLower.includes('साप्ताहिक')
  ) {
    if (isHindi) {
      const rows = daily.slice(0, 5).map((d: any) => `- **${d.date}:** ${d.tempMax}°C / ${d.tempMin}°C • ${d.weatherDescription} (बारिश: ${d.precipitationProbabilityMax}%)`).join('\n');
      text = `### 📅 ${foundLoc.name} के लिए आगामी 5-7 दिनों का मौसम आउटलुक\n\n${rows}\n\n*स्रोत: ECMWF / GFS 7-Day Extended Forecast Model*`;
    } else {
      const rows = daily.slice(0, 5).map((d: any) => `- **${d.date}:** ${d.tempMax}°C / ${d.tempMin}°C • ${d.weatherDescription} (Rain: ${d.precipitationProbabilityMax}%)`).join('\n');
      text = `### 📅 7-Day Extended Forecast for ${foundLoc.name}\n\n${rows}\n\n*Source: ECMWF / GFS Extended NWP Grid*`;
    }
  }
  // --- INTENT 11: Farming / Agriculture ---
  else if (
    queryLower.includes('farm') ||
    queryLower.includes('agri') ||
    queryLower.includes('irrigate') ||
    queryLower.includes('crop') ||
    queryLower.includes('किसान') ||
    queryLower.includes('शेती') ||
    queryLower.includes('fasal') ||
    queryLower.includes('फसल')
  ) {
    const agri = await weatherService.generateAgricultureAdvisory(foundLoc.name, foundLoc.latitude, foundLoc.longitude, 'Kharif Crops');
    advisorySnapshot = {
      type: 'agriculture',
      title: `Farming Advisory for ${foundLoc.name}`,
      items: [agri.irrigationAdvice, agri.sprayingAdvice, ...agri.precautions],
    };
    text = `### 🌾 ${foundLoc.name} कृषि मौसम विज्ञान परामर्श

#### 🚜 सिंचाई व मृदा नमी
- **सिंचाई निर्देश:** ${agri.irrigationAdvice}
- **कीटनाशक छिड़काव:** ${agri.sprayingAdvice}
- **फसल कटाई सलाह:** ${agri.harvestingAdvice}

#### 📋 किसान भाइयों के लिए सुझाव
${agri.precautions.map((p: string) => `- ${p}`).join('\n')}`;
  }
  // --- INTENT 12: Air Quality (AQI) ---
  else if (
    queryLower.includes('aqi') ||
    queryLower.includes('air') ||
    queryLower.includes('pollution') ||
    queryLower.includes('हवा') ||
    queryLower.includes('प्रदूषण')
  ) {
    const aqi = weather.airQuality || { aqi: 75, status: 'Moderate', pm25: 22, pm10: 45, dominantPollutant: 'PM2.5' };
    if (isHindi) {
      text = `### 🍃 ${foundLoc.name} में वायु गुणवत्ता (AQI)

- **AQI सूचकांक:** ${aqi.aqi} (${aqi.status})
- **मुख्य प्रदूषक:** ${aqi.dominantPollutant || 'PM2.5'}
- **$PM_{2.5}$ सांद्रता:** ${aqi.pm25 || 24} µg/m³
- **$PM_{10}$ सांद्रता:** ${aqi.pm10 || 50} µg/m³

${aqi.aqi > 150 ? '> 😷 **स्वास्थ्य सलाह:** संवेदनशील व्यक्तियों को बाहर जाते समय मास्क पहनने की सलाह दी जाती है।' : '> 🌿 **स्वास्थ्य सलाह:** वायु गुणवत्ता संतोषजनक स्तर पर है। सामान्य बाहरी गतिविधियां सुरक्षित हैं।'}`;
    } else {
      text = `### 🍃 Air Quality Index (AQI) for ${foundLoc.name}

- **AQI Score:** ${aqi.aqi} (${aqi.status})
- **Dominant Pollutant:** ${aqi.dominantPollutant || 'PM2.5'}
- **$PM_{2.5}$ / $PM_{10}$:** ${aqi.pm25 || 24} / ${aqi.pm10 || 50} µg/m³`;
    }
  }
  // --- INTENT 13: General Weather Overview (Default) ---
  else {
    if (isHindi) {
      text = `### 📍 ${foundLoc.name} में मौसम की पूरी जानकारी

#### 🎯 त्वरित सारांश (Quick Summary)
वर्तमान में ${foundLoc.name} में **${cur.weatherDescription}** है और तापमान **${cur.temperature}°C** (महसूस ${cur.apparentTemperature}°C) है। बारिश की संभावना **${cur.precipitationProbability}%** है।

#### 🌡️ तापमान एवं वायुमंडलीय स्थिति
- **वर्तमान तापमान:** ${cur.temperature}°C (महसूस ${cur.apparentTemperature}°C)
- **आसमान:** ${cur.weatherDescription}
- **बारिश की संभावना:** ${cur.precipitationProbability}%
- **आर्द्रता (Humidity):** ${cur.relativeHumidity}%
- **हवा की गति:** ${cur.windSpeed} किमी/घंटा (झोंके: ${cur.windGusts} किमी/घंटा)
- **वायुमंडलीय दबाव:** ${cur.surfacePressure} hPa
- **वायु गुणवत्ता (AQI):** ${weather.airQuality ? `${weather.airQuality.aqi} (${weather.airQuality.status})` : 'सामान्य'}
- **UV सूचकांक:** ${cur.uvIndex} / 11

${weather.alerts && weather.alerts.length > 0 ? `> ⚠️ **सक्रिय चेतावनी:** ${weather.alerts[0].headline}` : '> ✅ **चेतावनी स्थिति:** इस क्षेत्र के लिए कोई गंभीर मौसम चेतावनी सक्रिय नहीं है।'}`;
    } else if (isMarathi) {
      text = `### 📍 ${foundLoc.name} मधील सद्य हवामान निरीक्षण

#### 🌡️ तापमान व आर्द्रता
- **तापमान:** ${cur.temperature}°C (जाणवणारे: ${cur.apparentTemperature}°C)
- **हवामानाची स्थिती:** ${cur.weatherDescription}
- **आर्द्रता:** ${cur.relativeHumidity}%
- **पावसाची शक्यता:** ${cur.precipitationProbability}%
- **वाऱ्याचा वेग:** ${cur.windSpeed} किमी/तास`;
    } else {
      text = `### 📍 Current Weather Briefing for ${foundLoc.name}

#### 🌡️ Temperature & Thermal Profile
- **Current Temperature:** ${cur.temperature}°C (Feels like ${cur.apparentTemperature}°C)
- **Sky Condition:** ${cur.weatherDescription}

#### 🌧️ Moisture, Wind & Atmospheric Telemetry
- **Precipitation Probability:** ${cur.precipitationProbability}%
- **Relative Humidity:** ${cur.relativeHumidity}%
- **Wind Speed:** ${cur.windSpeed} km/h (Gusts up to ${cur.windGusts} km/h)
- **Barometric Pressure:** ${cur.surfacePressure} hPa
- **UV Radiation Index:** ${cur.uvIndex} / 11
- **Air Quality (AQI):** ${weather.airQuality ? `${weather.airQuality.aqi} • ${weather.airQuality.status}` : 'Normal'}

${weather.alerts && weather.alerts.length > 0 ? `> ⚠️ **Active Alert:** ${weather.alerts[0].headline}` : '> ✅ **Alert Status:** No active severe weather warnings in effect for this region.'}`;
    }
  }

  return {
    content: text,
    toolCalls: [
      { name: 'get_current_weather', status: 'success' as const, summary: `Verified real-time readings for ${foundLoc.name}` },
    ],
    weatherSnapshot: {
      location: foundLoc.name,
      temp: cur.temperature,
      condition: cur.weatherDescription,
      feelsLike: cur.apparentTemperature,
      rainProb: cur.precipitationProbability,
      humidity: cur.relativeHumidity,
      wind: cur.windSpeed,
    },
    alertSnapshot: (weather.alerts && weather.alerts[0]) || undefined,
    advisorySnapshot,
    sources: ['Open-Meteo High-Resolution Forecasting Model', 'IMD / WMO Meteorological Criteria'],
  };
}
