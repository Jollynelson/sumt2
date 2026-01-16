export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  wind_speed: number;
}

export interface SocialTrends {
  hashtags: string[];
  topDiscussion: string;
  vibeScore: number; // 1-10 scale of how busy the social scene is
  activeTime: string; // e.g., "7 PM - 11 PM"
  platforms: string[]; // e.g., ["Twitter", "Instagram", "TikTok"]
}

export interface RentPrices {
  selfCon: string; // Self con / Single room
  oneBedroom: string;
  twoBedroom: string;
  threeBedroomPlus: string;
}

export interface DeepDive {
  security: {
    safeZones: string[]; // List of safe estates/streets
    concernZones: string[]; // List of areas with reported issues
    advisory: string; // e.g. "Safe areas cost 40% more..."
  };
  power: {
    bandA: string[]; // 20hrs+ areas
    bandB: string[]; // 16hrs+ areas
    gridStability: string; // General comment on stability
  };
  infrastructure: {
    floodProne: string[]; // Areas that flood
    badRoads: string[]; // Areas with potholes/bad roads
    goodRoads: string[]; // Areas with good access
    ongoingProjects: string[]; // List of construction/developments
  };
}

export interface RentersGuide {
  areaType: string; // e.g., "Gated Estate", "Bustling Residential"
  securityRating: string; // e.g., "Safe", "Needs Caution"
  amenities: string[]; // General amenities
  greenFlags: string[]; // Positive attributes
  wittyRemark: string; // Sarcastic/Funny comment about the area (e.g. flood)
  schools: {
    name: string;
    rating: string; // e.g. "Excellent", "Highly Rated", "Average"
    proximity: string; // e.g. "5 mins drive", "Within the estate"
  }[];
  transportation: {
    modes: string[]; // e.g. ["Buses", "Keke", "Taxis"]
    frequency: string; // e.g. "High frequency", "Regular"
    majorRoutes: string[]; // e.g. ["Lekki-Epe Expressway", "Third Mainland Bridge"]
  };
  rentPrices: RentPrices;
  livabilityNote: string;
}

export interface FeedbackSubmission {
  rating: 'up' | 'down' | null;
  comment: string;
  location: string;
}

export interface TweetData {
  username: string;
  text: string;
}

export interface NewsArticle {
  headline: string;
  source: string;
  url: string; // If available, otherwise empty string
  timeAgo: string; // e.g. "2 hours ago"
}

export type Sentiment = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export interface Insight {
  title: string;
  description: string;
  sentiment: Sentiment;
  icon: string; // Emoji
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface LocationVibe {
  category: string;
  icon: string; // Emoji for the category
  mainInsight: Insight;
  subInsight?: {
    text: string;
    sentiment: Sentiment;
  };
}

export interface Summary {
  vibes: LocationVibe[];
  sources: GroundingSource[];
  weather?: WeatherData;
  social?: SocialTrends;
  rentersGuide?: RentersGuide;
  latestNews?: NewsArticle[];
  deepDive?: DeepDive;
}

export class LocationNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LocationNotFoundError';
  }
}