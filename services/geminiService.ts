
import { GoogleGenAI, Type } from '@google/genai';
import type { Summary, LocationVibe, GroundingSource, WeatherData, SocialTrends } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * We use gemini-2.5-flash because it supports both googleSearch and googleMaps tools simultaneously.
 */

export const summarizeLocationData = async (
  location: string,
  latLng?: { latitude: number; longitude: number }
): Promise<Summary> => {
  const prompt = `
    You are "AmeboAI", the number one gossip in town. Your task is to give the REAL, unfiltered, dramatic gist about ${location}.
    
    Use Google Search and Google Maps to find:
    1. CURRENT WEATHER: Get real-time temperature (Celsius), condition, humidity (%), and wind speed (km/h).
    2. SOCIAL MEDIA TRENDS: Find what is trending on Twitter/X, Instagram, or local forums about ${location}. Identify popular hashtags and the single most talked-about topic right now.
    3. Security: Safety, crime reports, or general "area" reputation.
    4. Infrastructure: Recent news about power, flooding, or network quality.
    5. Vibes: Traffic, popular spots, and general "happenings".

    Format your response STRICTLY as a JSON object with this exact structure:
    {
      "weather": {
        "temperature": 0,
        "condition": "Condition string",
        "humidity": 0,
        "wind_speed": 0
      },
      "social": {
        "hashtags": ["#tag1", "#tag2", "#tag3"],
        "topDiscussion": "Dramatic summary of the hottest social media topic",
        "vibeScore": 8
      },
      "vibes": [
        {
          "category": "Category Name",
          "icon": "Emoji",
          "mainInsight": { "title": "Pidgin Title", "description": "Gossip detail", "sentiment": "POSITIVE/NEGATIVE/NEUTRAL", "icon": "Emoji" },
          "subInsight": { "text": "Nuance detail", "sentiment": "SENTIMENT" }
        }
      ]
    }

    Be dramatic and use Nigerian Pidgin/slang for the vibes and social discussion! For weather, be accurate.
    DO NOT include any Markdown formatting like \`\`\`json. Just the raw JSON string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        toolConfig: latLng ? {
          retrievalConfig: {
            latLng: latLng
          }
        } : undefined,
      },
    });

    const text = response.text || "";
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let parsedVibes: LocationVibe[] = [];
    let weather: WeatherData | undefined = undefined;
    let social: SocialTrends | undefined = undefined;

    try {
        const parsed = JSON.parse(jsonStr);
        parsedVibes = parsed.vibes || [];
        weather = parsed.weather;
        social = parsed.social;
    } catch (e) {
        console.error("Failed to parse JSON from Gemini response", text);
        throw new Error("AmeboAI drink small stout, e talk no clear again. Try again!");
    }

    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({ title: chunk.web.title || 'Web Source', url: chunk.web.uri });
      } else if (chunk.maps) {
        sources.push({ title: chunk.maps.title || 'Maps Location', url: chunk.maps.uri });
      }
    });

    const uniqueSources = Array.from(new Map(sources.map(s => [s.url, s])).values());

    return {
      vibes: parsedVibes,
      sources: uniqueSources,
      weather,
      social
    };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("AmeboAI don go market, e never come back. Check your network or try again later.");
  }
};
