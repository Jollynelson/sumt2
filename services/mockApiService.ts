import type { WeatherData, TweetData, NewsArticle } from '../types';
import { LocationNotFoundError } from '../types';

const UNSUPPORTED_LOCATION = 'atlantis';

const pickRandom = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export const getMockWeatherData = (location: string): Promise<WeatherData> => {
  console.log(`Fetching mock weather for ${location}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (location.toLowerCase().trim() === UNSUPPORTED_LOCATION) {
        const errorMessages = [
          `We check space, we check ground, we no see "${location}" for map. You sure say no be typo?`,
          `This "${location}" you typed... e be like say na inside dream you see am. Weather people never hear of am.`,
          `My weather app just crash trying to find "${location}". You wan spoil my phone?`,
        ];
        reject(new LocationNotFoundError(pickRandom(errorMessages)));
      } else {
        resolve({
          temperature: 32,
          condition: 'Sunny with small cloud',
          humidity: 85,
          wind_speed: 10,
        });
      }
    }, 300);
  });
};

export const getMockTweetsData = (location: string): Promise<TweetData[]> => {
    console.log(`Fetching mock tweets for ${location}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (location.toLowerCase().trim() === UNSUPPORTED_LOCATION) {
                 const errorMessages = [
                  `Even Twitter ghost town pass "${location}". Zero gist, zero tweets.`,
                  `The people for "${location}" dey mind their business o. No single tweet about them.`,
                  `Searched for "${location}" gist until my data finish. Nothing. E be like say dem dey hide their wahala.`
                ];
                reject(new LocationNotFoundError(pickRandom(errorMessages)));
            } else {
                resolve([
                    { username: 'FunkeOAP', text: `This ${location} traffic is not for the weak o. Hian! #LagosLife` },
                    { username: 'ChefTunde', text: `Just had the best suya at that spot in ${location}. My life has changed! #NaijaFood` },
                    { username: 'DavidDev', text: `Power has been stable in my area of ${location} for 2 days straight. Is this heaven? #NEPA` },
                    { username: 'AishaStyle', text: `The new collection at the boutique in ${location} is fire! My bank account is crying. #Fashion` },
                ]);
            }
        }, 500);
    });
};

export const getMockNewsData = (location: string): Promise<NewsArticle[]> => {
    console.log(`Fetching mock news for ${location}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
             if (location.toLowerCase().trim() === UNSUPPORTED_LOCATION) {
                const errorMessages = [
                  `Breaking News: Absolutely nothing dey happen for "${location}". The place calm, maybe too calm... 🧐`,
                  `Even newspaper vendors for "${location}" dey sell blank paper. No news at all.`,
                  `If you find any news about "${location}", abeg let us know. Because we see nothing.`,
                ];
                reject(new LocationNotFoundError(pickRandom(errorMessages)));
            } else {
                resolve([
                    { headline: `${location} State government announces plan to fix major potholes on the expressway.`, source: 'Naija Tribune', url: '#', timeAgo: '2 hours ago' },
                    { headline: `Afrobeat star to hold concert in ${location} this December.`, source: 'Pulse NG', url: '#', timeAgo: '4 hours ago' },
                    { headline: `Local tech hub in ${location} secures international funding.`, source: 'TechCabal', url: '#', timeAgo: '1 day ago' },
                    { headline: `Heavy rainfall expected in ${location} this weekend, authorities warn of potential flooding.`, source: 'Channels News', url: '#', timeAgo: '2 days ago' },
                ]);
            }
        }, 400);
    });
};