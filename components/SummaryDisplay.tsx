
import React, { useCallback, useState } from 'react';
import type { Summary, Sentiment, LocationVibe, WeatherData, SocialTrends } from '../types';
import ShareIcon from './icons/ShareIcon';
import WeatherIcon from './icons/WeatherIcon';
import SocialIcon from './icons/SocialIcon';

interface SummaryDisplayProps {
  summary: Summary;
  location: string;
}

const sentimentStyles: Record<Sentiment, { container: string; icon: string; text: string }> = {
  POSITIVE: {
    container: 'border-green-500/50 bg-green-900/20',
    icon: 'text-green-400',
    text: 'text-green-400',
  },
  NEGATIVE: {
    container: 'border-red-500/50 bg-red-900/20',
    icon: 'text-red-400',
    text: 'text-red-400',
  },
  NEUTRAL: {
    container: 'border-gray-600/50 bg-gray-800/20',
    icon: 'text-gray-400',
    text: 'text-gray-400',
  },
};

const WeatherCard: React.FC<{ weather: WeatherData }> = ({ weather }) => (
  <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-md flex flex-wrap items-center justify-between gap-6">
    <div className="flex items-center gap-4">
      <div className="bg-purple-500/20 p-4 rounded-full">
        <WeatherIcon />
      </div>
      <div>
        <div className="text-4xl font-black text-white">{weather.temperature}°C</div>
        <div className="text-purple-300 font-medium">{weather.condition}</div>
      </div>
    </div>
    
    <div className="flex gap-8 border-l border-white/10 pl-8">
      <div className="text-center">
        <div className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-1">Humidity</div>
        <div className="text-white font-bold">{weather.humidity}%</div>
      </div>
      <div className="text-center">
        <div className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-1">Wind</div>
        <div className="text-white font-bold">{weather.wind_speed} km/h</div>
      </div>
    </div>
  </div>
);

const SocialRadar: React.FC<{ social: SocialTrends }> = ({ social }) => (
  <div className="bg-gray-800/60 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden group h-full">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
       <SocialIcon />
    </div>
    <div className="flex items-center gap-2 mb-4">
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
      <h3 className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em]">Social Radar</h3>
    </div>
    
    <div className="space-y-4">
      <div>
        <h4 className="text-white font-bold mb-2 flex items-center gap-2">
            Top Discussion
        </h4>
        <p className="text-gray-300 text-sm italic border-l-2 border-blue-500/50 pl-3">
          "{social.topDiscussion}"
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {social.hashtags.map((tag, i) => (
          <span key={i} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md text-[10px] font-bold text-blue-300 uppercase">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="pt-2">
        <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase mb-1">
          <span>Vibe Activity</span>
          <span>{social.vibeScore}/10</span>
        </div>
        <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
            style={{ width: `${social.vibeScore * 10}%` }}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

const FeedbackSection: React.FC<{ location: string }> = ({ location }) => {
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [userGist, setUserGist] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be sent to an API
    console.log(`Feedback for ${location}: Rating: ${rating}, Gist: ${userGist}`);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mt-8 bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 text-center animate-fade-in">
        <p className="text-purple-300 font-bold text-lg mb-1">Thanks for the gist! 🙏</p>
        <p className="text-purple-400/70 text-sm">Your feedback helps AmeboAI learn the area better.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-white font-bold text-lg">Did we hit the nail on the head?</h4>
          <p className="text-gray-400 text-sm">Rate the accuracy of this gist.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setRating('up')}
            className={`p-3 rounded-xl transition-all ${rating === 'up' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
          </button>
          <button 
            onClick={() => setRating('down')}
            className={`p-3 rounded-xl transition-all ${rating === 'down' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" /></svg>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-gray-300 text-sm font-semibold uppercase tracking-widest">
          Add your own gist about {location}
        </label>
        <textarea 
          value={userGist}
          onChange={(e) => setUserGist(e.target.value)}
          placeholder="Omo, wait o! Something dey happen for this area wey AI never see..."
          className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-gray-200 text-sm focus:ring-2 focus:ring-purple-500 outline-none min-h-[100px] resize-none transition-all placeholder-gray-600"
        />
        <button 
          type="submit"
          disabled={!rating && !userGist}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, location }) => {
  const handleShare = useCallback((vibe: LocationVibe) => {
    if (!navigator.share) {
      alert("Omo, your browser no support this kain sharing function. Try copy and paste.");
      return;
    }

    const title = `The Real Gist for ${location}: ${vibe.category}`;
    let text = `${vibe.mainInsight.icon} ${vibe.mainInsight.title}\n"${vibe.mainInsight.description}"`;

    if (vibe.subInsight) {
      text += `\n\nSide Gist: "${vibe.subInsight.text}"`;
    }
    
    text += `\n\n#AmeboAI #HouseHuntingNG #RealTimeGist`;

    navigator.share({
      title: title,
      text: text,
      url: window.location.href,
    }).catch((error) => console.log('User cancelled share:', error));
  }, [location]);

  if (!summary || ((!summary.vibes || summary.vibes.length === 0) && !summary.weather)) {
    return (
        <div className="text-center text-gray-500 py-12 bg-gray-800/20 rounded-2xl border border-gray-700">
            <p className="text-2xl mb-2">🤷‍♂️</p>
            <p>AmeboAI no see any fresh gist for this place o. E be like say nothing dey happen.</p>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
       <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
            The Real Gist for <span className="text-purple-400">{location}</span>
        </h2>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-300 text-xs font-semibold rounded-full border border-purple-500/20 uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Real-Time Data
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            {summary.weather && <WeatherCard weather={summary.weather} />}
        </div>
        <div className="lg:col-span-1">
            {summary.social && <SocialRadar social={summary.social} />}
        </div>
      </div>

      <div className="grid gap-6">
        {summary.vibes.map((categoryVibe, index) => {
          const mainStyles = sentimentStyles[categoryVibe.mainInsight.sentiment] || sentimentStyles.NEUTRAL;
          const subStyles = categoryVibe.subInsight ? (sentimentStyles[categoryVibe.subInsight.sentiment as Sentiment] || sentimentStyles.NEUTRAL) : null;

          return (
            <div key={index} className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6 transition-all hover:border-gray-600">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-200 flex items-center gap-3">
                        <span className="bg-gray-700/50 p-2 rounded-lg text-2xl leading-none">
                            {categoryVibe.icon}
                        </span>
                        {categoryVibe.category}
                    </h3>
                    <button
                        onClick={() => handleShare(categoryVibe)}
                        className="p-2 text-gray-400 hover:text-purple-400 bg-gray-700/30 rounded-full transition-colors"
                        title="Share this gist"
                    >
                        <ShareIcon />
                    </button>
                </div>

                {/* Main Insight */}
                <div className={`border rounded-xl p-5 flex items-start gap-4 backdrop-blur-sm ${mainStyles.container}`}>
                    <div className={`text-3xl mt-1 ${mainStyles.icon}`}>{categoryVibe.mainInsight.icon}</div>
                    <div className="space-y-1">
                        <h4 className="text-lg font-bold text-white leading-tight">{categoryVibe.mainInsight.title}</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{categoryVibe.mainInsight.description}</p>
                    </div>
                </div>

                {/* Sub Insight */}
                {categoryVibe.subInsight && subStyles && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-700 flex items-start gap-3 py-1">
                         <div className="w-5 flex-shrink-0 text-center">
                            <span className={`text-xl font-bold opacity-60 ${subStyles.text}`}>↳</span>
                        </div>
                        <p className={`text-sm italic leading-snug ${subStyles.text}`}>
                            {categoryVibe.subInsight.text}
                        </p>
                    </div>
                )}
            </div>
          );
        })}
      </div>

      <FeedbackSection location={location} />

      {/* Sources Section */}
      {summary.sources && summary.sources.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-800">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 105.656 5.656l-1.1 1.1" />
                  </svg>
                  Gist Sources (Proof)
              </h4>
              <div className="flex flex-wrap gap-2">
                  {summary.sources.map((source, sIdx) => (
                      <a 
                          key={sIdx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-400 hover:text-purple-400 hover:border-purple-500/50 transition-all flex items-center gap-2"
                      >
                          <span className="truncate max-w-[150px]">{source.title}</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                      </a>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default SummaryDisplay;
