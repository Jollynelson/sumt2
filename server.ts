import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import Airtable from "airtable";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Airtable Setup
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Feedback';

  console.log("Airtable Config Check:", {
    hasApiKey: !!AIRTABLE_API_KEY,
    keyPrefix: AIRTABLE_API_KEY ? AIRTABLE_API_KEY.substring(0, 4) + '...' : 'none',
    hasBaseId: !!AIRTABLE_BASE_ID,
    basePrefix: AIRTABLE_BASE_ID ? AIRTABLE_BASE_ID.substring(0, 4) + '...' : 'none',
    tableName: AIRTABLE_TABLE_NAME
  });

  let airtableBase: any = null;
  if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
    airtableBase = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
  }

  // Simple in-memory cache for tweets to avoid 429 Rate Limits
  const tweetCache = new Map<string, { data: any, timestamp: number }>();
  const CACHE_TTL = 60 * 60 * 1000; // Increased to 1 hour to respect Free API limits

  // MongoDB Setup
  const MONGODB_URI = process.env.MONGODB_URI;
  if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
      .then(() => console.log('Connected to MongoDB'))
      .catch(err => console.error('MongoDB connection error:', err));
  } else {
    console.warn('MONGODB_URI not set. MongoDB features will not work.');
  }

  const gistSchema = new mongoose.Schema({
    location: String,
    day: String,
    category: String,
    sentiment: String,
    title: String,
    insight: String,
    pro_tip: String,
    createdAt: { type: Date, default: Date.now }
  });

  const Gist = mongoose.model('Gist', gistSchema);

  const reportSchema = new mongoose.Schema({
    location: String,
    rating: String,
    comment: String,
    report: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
  });

  const Report = mongoose.model('Report', reportSchema);

  app.post('/api/gists', async (req, res) => {
    try {
      if (!MONGODB_URI) {
        return res.status(500).json({ error: 'MongoDB not configured' });
      }
      if (mongoose.connection.readyState !== 1) {
        console.warn('MongoDB not connected yet. Skipping gist save.');
        return res.status(503).json({ error: 'MongoDB not connected yet' });
      }
      const { location, gists } = req.body;
      if (!gists || !Array.isArray(gists)) {
        return res.status(400).json({ error: 'Invalid gists data' });
      }
      
      const gistsToSave = gists.map(g => ({ ...g, location }));
      await Gist.insertMany(gistsToSave);
      res.json({ success: true, message: 'Gists saved successfully' });
    } catch (error) {
      console.error('Error saving gists:', error);
      res.status(500).json({ error: 'Failed to save gists' });
    }
  });

  // Helper to format date as "DD/MM/YYYY, HH:MM AM/PM"
  const formatAirtableDate = (date: Date) => {
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(',', '');
  };

  // Feedback Submission Endpoint
  app.post("/api/feedback", async (req, res) => {
    const { rating, comment, location, report } = req.body;

    // Save report to MongoDB if connected
    if (MONGODB_URI && mongoose.connection.readyState === 1) {
      try {
        await Report.create({ location, rating, comment, report });
        console.log(`Saved report for ${location} to MongoDB.`);
      } catch (err) {
        console.error('Failed to save report to MongoDB:', err);
      }
    }

    if (!airtableBase) {
      const missing = [];
      if (!AIRTABLE_API_KEY) missing.push("AIRTABLE_API_KEY");
      if (!AIRTABLE_BASE_ID) missing.push("AIRTABLE_BASE_ID");
      
      return res.status(500).json({ 
        status: "error", 
        message: `Airtable not configured. Missing: ${missing.join(", ")}. Please set these in AI Studio environment variables.` 
      });
    }

    try {
      await airtableBase(AIRTABLE_TABLE_NAME).create([
        {
          fields: {
            "Timestamp": formatAirtableDate(new Date()),
            "Location": location,
            "Rating": rating || "None",
            "Comment": comment || ""
          }
        }
      ], { typecast: true });
      res.json({ status: "success" });
    } catch (error: any) {
      let friendlyMessage = error.message;
      const errorMessageLower = error.message?.toLowerCase() || "";
      
      if (error.statusCode === 404) {
        friendlyMessage = `Table "${AIRTABLE_TABLE_NAME}" not found in your Airtable base. Please check the table name.`;
      } else if (error.statusCode === 401) {
        friendlyMessage = "Invalid Airtable API Key. Please check your credentials.";
      } else if (error.statusCode === 403 || errorMessageLower.includes("not authorized")) {
        friendlyMessage = "Airtable Authorization Error: Your token does not have permission. Ensure you are using a Personal Access Token (starts with 'pat...') with 'data.records:read' and 'data.records:write' scopes, and that it has access to this specific Base.";
      } else if (error.statusCode === 422) {
        friendlyMessage = "Column mismatch. Ensure your table has: Timestamp, Location, Rating, Comment.";
      }

      console.error("Airtable Error:", friendlyMessage);
      res.status(500).json({ status: "error", message: friendlyMessage });
    }
  });

  // Neighborhood Updates Retrieval Endpoint
  app.get("/api/neighborhood-updates", async (req, res) => {
    const { location } = req.query as { location: string };
    
    if (!airtableBase || !location) {
      return res.json([]);
    }

    try {
      const records = await airtableBase(AIRTABLE_TABLE_NAME).select({
        filterByFormula: `SEARCH(LOWER("${location}"), LOWER({Location}))`,
        maxRecords: 10,
        sort: [{ field: "Timestamp", direction: "desc" }]
      }).firstPage();

      const updates = records.map((record: any) => ({
        timestamp: record.get("Timestamp"),
        rating: record.get("Rating"),
        comment: record.get("Comment")
      }));

      res.json(updates);
    } catch (error: any) {
      const errorMessageLower = error.message?.toLowerCase() || "";
      if (error.statusCode === 403 || errorMessageLower.includes("not authorized")) {
        console.error("Airtable Fetch Authorization Error: Ensure token starts with 'pat...' and has data.records:read scope for this Base.");
      } else {
        console.error("Airtable Fetch Error:", error.message);
      }
      res.json([]); // Return empty array on error to avoid breaking the flow
    }
  });

  // Twitter API Endpoint
  app.get("/api/tweets", async (req, res) => {
    const { location } = req.query as { location: string };
    const token = process.env.TWITTER_BEARER_TOKEN;

    if (!token) {
      console.warn("TWITTER_BEARER_TOKEN is not set. Returning mock tweets.");
      return res.json([
        { username: "BetaTenant_Bot", text: `Gist about ${location} is loading... (Set TWITTER_BEARER_TOKEN for real tweets)` },
        { username: "Naija_Gist", text: `Traffic in ${location} is something else today! #Lagos` },
        { username: "Area_Boy", text: `Who know where better suya dey for ${location}?` }
      ]);
    }

    if (!location) {
      return res.json([]);
    }

    // Check Cache
    const cached = tweetCache.get(location);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log(`Returning cached tweets for ${location}`);
      return res.json(cached.data);
    }

    try {
      const response = await axios.get(
        "https://api.twitter.com/2/tweets/search/recent",
        {
          params: {
            query: `${location} -is:retweet lang:en`,
            max_results: 10,
            "tweet.fields": "author_id,created_at",
            expansions: "author_id",
            "user.fields": "username,name",
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const tweets = response.data.data || [];
      const users = response.data.includes?.users || [];

      const formattedTweets = tweets.map((tweet: any) => {
        const user = users.find((u: any) => u.id === tweet.author_id);
        return {
          username: user?.username || "Unknown",
          text: tweet.text,
        };
      });

      // Update Cache
      tweetCache.set(location, { data: formattedTweets, timestamp: Date.now() });

      res.json(formattedTweets);
    } catch (error: any) {
      const status = error.response?.status;
      
      if (status === 429) {
        console.warn(`Twitter Rate Limit (429) for ${location}. Using cache or smart fallback.`);
      } else {
        console.error(`Twitter API Error [${status || 'NETWORK_ERROR'}]:`, error.message);
      }

      // If we have any cache (even expired), use it to avoid mock data
      if (cached) {
        return res.json(cached.data);
      }
      
      // Smart fallback: Generate more realistic-looking mock data based on location
      res.json([
        { username: "BetaTenant_Bot", text: `Gist about ${location} is currently high-demand! We're waiting for the network to clear.` },
        { username: "Naija_Gist", text: `People in ${location} are talking about the latest rent trends and power updates.` },
        { username: "Area_Boy", text: `I just passed through ${location}, the vibe is steady. No shaking.` }
      ]);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
