import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import Airtable from "airtable";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Airtable Setup
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Feedback';

let airtableBase: any = null;
if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
  airtableBase = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
}

// Simple in-memory cache for tweets to avoid 429 Rate Limits
const tweetCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000;

// MongoDB Setup
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
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

const Gist = mongoose.models.Gist || mongoose.model('Gist', gistSchema);

const reportSchema = new mongoose.Schema({
  location: String,
  rating: String,
  comment: String,
  report: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

app.post('/api/gists', async (req, res) => {
  try {
    if (!MONGODB_URI) {
      return res.status(500).json({ error: 'MongoDB not configured' });
    }
    if (mongoose.connection.readyState !== 1) {
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

  if (MONGODB_URI && mongoose.connection.readyState === 1) {
    try {
      await Report.create({ location, rating, comment, report });
    } catch (err) {
      console.error('Failed to save report to MongoDB:', err);
    }
  }

  if (!airtableBase) {
    return res.status(500).json({ status: "error", message: "Airtable not configured" });
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
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Neighborhood Updates Retrieval Endpoint
app.get("/api/neighborhood-updates", async (req, res) => {
  const { location } = req.query as { location: string };
  if (!airtableBase || !location) return res.json([]);

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
    res.json([]);
  }
});

// Twitter API Endpoint
app.get("/api/tweets", async (req, res) => {
  const { location } = req.query as { location: string };
  const token = process.env.TWITTER_BEARER_TOKEN;

  if (!token) {
    return res.json([
      { username: "BetaTenant_Bot", text: `Gist about ${location} is loading...` },
      { username: "Naija_Gist", text: `Traffic in ${location} is something else today! #Lagos` },
      { username: "Area_Boy", text: `Who know where better suya dey for ${location}?` }
    ]);
  }

  const cached = tweetCache.get(location);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
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
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const tweets = response.data.data || [];
    const users = response.data.includes?.users || [];

    const formattedTweets = tweets.map((tweet: any) => {
      const user = users.find((u: any) => u.id === tweet.author_id);
      return { username: user?.username || "Unknown", text: tweet.text };
    });

    tweetCache.set(location, { data: formattedTweets, timestamp: Date.now() });
    res.json(formattedTweets);
  } catch (error: any) {
    res.json([]);
  }
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupVite().then(() => {
  app.listen(3000, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:3000`);
  });
});

export default app;
