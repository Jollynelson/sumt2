
import { GoogleGenAI, Type } from '@google/genai';
import type { Summary, LocationVibe, GroundingSource, WeatherData, SocialTrends, RentersGuide, NewsArticle, DeepDive } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeLocationData = async (
  location: string,
  latLng?: { latitude: number; longitude: number }
): Promise<Summary> => {
  // Direct, high-speed prompt focusing on essential data extraction
  const prompt = `
    Analyze ${location}, Nigeria for a tenant.
    Use Google Search for real-time data from the last 7 days.
    Output ONLY valid JSON.
    
    Tasks:
    1. Geographic: Verify location.
    2. Rent: Current annual market rates.
    3. Security: Specific safe vs unsafe streets/estates.
    4. Power: List areas in Band A and Band B.
    5. Infrastructure: Areas with floods, bad roads, good roads, and new projects.
    6. News: 3 recent headlines.
    7. Vibe: Witty Pidgin remark.
    8. Social: Top tags, active time, platforms.

    JSON Template:
    {
      "weather": { "temperature": 0, "condition": "string", "humidity": 0, "wind_speed": 0 },
      "social": { "hashtags": [], "topDiscussion": "", "vibeScore": 8, "activeTime": "", "platforms": [] },
      "latestNews": [{ "headline": "", "source": "", "url": "", "timeAgo": "" }],
      "deepDive": {
        "security": { "safeZones": [], "concernZones": [], "advisory": "" },
        "power": { "bandA": [], "bandB": [], "gridStability": "" },
        "infrastructure": { "floodProne": [], "badRoads": [], "goodRoads": [], "ongoingProjects": [] }
      },
      "rentersGuide": {
        "areaType": "", "securityRating": "", "amenities": [], "greenFlags": [], "wittyRemark": "",
        "schools": [{ "name": "", "rating": "", "proximity": "" }],
        "transportation": { "modes": [], "frequency": "", "majorRoutes": [] },
        "rentPrices": { "selfCon": "", "oneBedroom": "", "twoBedroom": "", "threeBedroomPlus": "" },
        "livabilityNote": ""
      },
      "vibes": [{ "category": "", "icon": "", "mainInsight": { "title": "", "description": "", "sentiment": "NEUTRAL", "icon": "" } }]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        // Optimized for speed: Remove Maps tool (slow) and disable thinking (latency)
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const text = response.text || "";
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) throw new Error("Synthesis failed.");
    const jsonStr = text.substring(startIndex, endIndex + 1);
    const parsed = JSON.parse(jsonStr);

    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    chunks.forEach((chunk: any) => {
      if (chunk.web) sources.push({ title: chunk.web.title || 'Source', url: chunk.web.uri });
    });

    return {
      vibes: parsed.vibes || [],
      sources: Array.from(new Map(sources.map(s => [s.url, s])).values()),
      weather: parsed.weather,
      social: parsed.social,
      rentersGuide: parsed.rentersGuide,
      latestNews: parsed.latestNews || [],
      deepDive: parsed.deepDive
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Neighborhood intelligence network is busy. Abeg try again.");
  }
};
