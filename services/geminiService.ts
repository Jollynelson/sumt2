
import { GoogleGenAI, Type } from '@google/genai';
import type { Summary, LocationVibe, GroundingSource, WeatherData, SocialTrends, RentersGuide, NewsArticle, DeepDive } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeLocationData = async (
  location: string,
  tweets: any[] = [],
  airtableUpdates: any[] = []
): Promise<Summary> => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const tweetContext = tweets.length > 0 
    ? `\n\nRECENT SOCIAL MEDIA GIST (from X/Twitter):\n${tweets.map(t => `@${t.username}: ${t.text}`).join('\n')}`
    : '';

  const airtableContext = airtableUpdates.length > 0
    ? `\n\nVERIFIED COMMUNITY UPDATES (from real users in Airtable):\n${airtableUpdates.map(u => `[${u.timestamp}] Rating: ${u.rating} - ${u.comment}`).join('\n')}`
    : '';

  const prompt = `
    Analyze ${location}, Nigeria for a potential tenant. 
    CURRENT DATE & TIME: ${currentDate}.
    
    CRITICAL INSTRUCTION FOR ALL TASKS:
    You MUST focus entirely on the specific location requested: "${location}". 
    - Do NOT return information for other cities or neighborhoods (e.g., if asked for Abaji, Abuja, do NOT return info for Gbagada or Lekki).
    - The gist and vibes MUST be strictly about ${location}. Do NOT provide general information about the state or country unless only the state was searched.
    
    CRITICAL: Use Google Search to find the ABSOLUTE REAL-TIME weather and neighborhood status for ${location} as of ${currentDate}.
    Do not use old or cached data. Search for "current weather in ${location}" and "latest news in ${location}".
    
    ${tweetContext}
    ${airtableContext}

    IMPORTANT: Prioritize the "VERIFIED COMMUNITY UPDATES" provided above. These are real reports from people on the ground in ${location}. If they mention specific issues (like power outages, floods, or security), you MUST include them in the summary and gist area vibes. Always look at these user comments when searching and generating the report.

    TASK 1: REAL-TIME WEATHER & ESSENTIALS
    - Get the ABSOLUTE CURRENT weather for ${location} as of right now (Feb 26, 2026): temperature in °C, condition, humidity, wind.
    - Provide a "weatherTip" in sharp Nigerian Pidgin based on THIS EXACT CURRENT weather (e.g., if sun dey, tell them to carry umbrella or wear light cloth; if rain dey, warn them about flood).
    - Get CURRENT power status (Band A/B) if mentioned recently.

    TASK 2: THE AMEBO GIST (Deep Neighborhood Dive)
    - Search for: "Rental trends", "Landlord drama", "Parking wahala", "Noise levels", "Security alerts", "Agent scams", "New developments", and "Infrastructure updates" in ${location}.
    - Fetch at least 10 distinct local gist items. 
    - Be flexible: talk about nightlife, religious noise, drainage, and "big boy" streets.
    - Categorize items as 'CRITICAL' (Red), 'POSITIVE' (Green), or 'NOTABLE' (Blue).

    TASK 3: RED & GREEN FLAGS
    - Identify specific "Green Flags" (Why move here?)
    - Identify specific "Red Flags" (Why AVOID moving here? e.g. "Transformer blows every month", "Flood reaches waist", "Agents charge 20% for nothing").

    TASK 4: GIST AREA VIBES
    Act as an expert Nigerian Lifestyle & Real Estate AI. Your goal is to provide a witty, street-smart "lifestyle guide" for prospective tenants specifically in ${location}.
    CRITICAL: The vibes MUST be strictly about ${location}. Do NOT provide general information about the state or country unless only the state was searched. Do NOT provide information about other popular areas if the user searched for ${location}.
    TONE: Sarcastic, funny, and deeply relatable. Use authentic Nigerian slang (e.g., 'premium tears', 'doing aerobics', 'landlord wahala', 'shege').
    STRICT WORD COUNTS: Insight: Max 17 words. Pro-Tip: Max 12 words.
    MANDATORY CHECKS:
    If ${location} is known for flooding, you MUST include a 'Environment' vibe about water/canoes.
    If there is recent security chatter, you MUST include a 'Safety' vibe.
    NO CITATIONS: Do NOT include citation numbers [1], [2], [3] etc. in your output. Return clean text only.
    JSON STRUCTURE REQUIREMENTS: Generate exactly 8-12 objects in the "gistAreaVibes" array.
    Categories must be one of: 'Infrastructure', 'Safety', 'Environment', 'Cost of Living', 'Transport', 'Development', 'Social Noise'.
    Sentiment must be: 'Positive', 'Neutral', or 'Negative'.

    WITTY REMARK INSTRUCTION:
    Provide a "wittyRemark" that captures the current vibe of the neighborhood in sharp, street-smart Nigerian Pidgin. 
    Base it on the actual real-time data found (news, social gist, or infrastructure). 
    Only mention "agent inspection fees" or specific scams if they appear in the current search results or social gist for ${location}. 
    Make it feel authentic to the area's current situation.

    Output ONLY valid JSON.
    JSON Template:
    {
      "weather": { "temperature": 0, "condition": "string", "humidity": 0, "wind_speed": 0, "weatherTip": "string" },
      "social": { "hashtags": [], "topDiscussion": "string", "vibeScore": 8, "activeTime": "string", "platforms": [] },
      "latestNews": [{ "headline": "string", "source": "string", "url": "string", "timeAgo": "string", "category": "CRITICAL|POSITIVE|NOTABLE" }],
      "deepDive": {
        "security": { "safeZones": [], "concernZones": [], "advisory": "string" },
        "power": { "bandA": [], "bandB": [], "gridStability": "string" },
        "infrastructure": { "floodProne": [], "badRoads": [], "goodRoads": [], "ongoingProjects": [] }
      },
      "rentersGuide": {
        "areaType": "string", "securityRating": "string", "amenities": [], "greenFlags": [], "redFlags": [],
        "wittyRemark": "string", 
        "schools": [{ "name": "string", "rating": "string", "proximity": "string" }],
        "transportation": { "modes": [], "frequency": "string", "majorRoutes": [] },
        "rentPrices": { "selfCon": "string", "oneBedroom": "string", "twoBedroom": "string", "threeBedroomPlus": "string" },
        "livabilityNote": "string"
      },
      "gistAreaVibes": [
        {
          "day": "string",
          "category": "Safety",
          "sentiment": "Negative",
          "title": "One Punchy Phrase",
          "insight": "The boys are outside doing stop-and-search by the bridge tonight.",
          "pro_tip": "Avoid the express, take the back gate."
        }
      ],
      "vibes": [{ "category": "string", "icon": "string", "mainInsight": { "title": "string", "description": "string", "sentiment": "NEUTRAL", "icon": "string" } }]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
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
      gistAreaVibes: parsed.gistAreaVibes || [],
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
    throw new Error("Intelligence network is busy. Abeg try again.");
  }
};
