
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
}

export interface TweetData {
  username: string;
  text: string;
}

export interface NewsArticle {
  headline: string;
  source: string;
  url: string;
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
}

export class LocationNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LocationNotFoundError';
  }
}
