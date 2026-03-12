
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import type { Summary, Sentiment, LocationVibe, WeatherData, RentersGuide, FeedbackSubmission, NewsArticle, DeepDive, GistAreaVibe } from '../types';
import ShareIcon from './icons/ShareIcon';
import WeatherIcon from './icons/WeatherIcon';
import NewsIcon from './icons/NewsIcon';

interface SummaryDisplayProps {
  summary: Summary;
  location: string;
}

const sentimentStyles: Record<Sentiment, { container: string; icon: string; text: string }> = {
  POSITIVE: { container: 'border-l-4 border-l-emerald-500 bg-white', icon: 'text-emerald-500', text: 'text-slate-800' },
  NEGATIVE: { container: 'border-l-4 border-l-rose-500 bg-white', icon: 'text-rose-500', text: 'text-slate-800' },
  NEUTRAL: { container: 'border-l-4 border-l-slate-400 bg-white', icon: 'text-slate-500', text: 'text-slate-800' },
};

const getCategoryStyles = (category: NewsArticle['category']) => {
  switch (category) {
    case 'CRITICAL':
      return { 
        bg: 'bg-rose-50', 
        border: 'border-rose-200', 
        text: 'text-rose-900', 
        pill: 'bg-rose-500 text-white',
        icon: '⚠️'
      };
    case 'POSITIVE':
      return { 
        bg: 'bg-emerald-50', 
        border: 'border-emerald-200', 
        text: 'text-emerald-900', 
        pill: 'bg-emerald-500 text-white',
        icon: '💎'
      };
    default:
      return { 
        bg: 'bg-blue-50', 
        border: 'border-blue-200', 
        text: 'text-blue-900', 
        pill: 'bg-blue-500 text-white',
        icon: '📍'
      };
  }
};

const WeatherCard: React.FC<{ weather: WeatherData }> = ({ weather }) => {
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="bg-[#000066] rounded-3xl p-5 sm:p-6 text-white shadow-sm flex flex-col space-y-4 relative overflow-hidden border border-white/5">
      <div className="absolute top-4 right-6 text-[10px] font-black text-white/20 uppercase tracking-widest">
        {currentDate} • {currentTime}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="bg-white/10 p-3 sm:p-4 rounded-2xl"><WeatherIcon /></div>
          <div>
            <div className="text-4xl sm:text-5xl font-black tracking-tighter">{weather.temperature}°C</div>
            <div className="text-blue-100 font-bold uppercase text-[10px] sm:text-xs tracking-widest mt-1">{weather.condition}</div>
          </div>
        </div>
        <div className="flex gap-6 sm:gap-8 w-full sm:w-auto justify-between sm:justify-start border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-8">
          <div>
            <div className="text-blue-300 text-[9px] sm:text-[10px] uppercase font-black tracking-widest mb-1">Humidity</div>
            <div className="text-white font-bold text-base sm:text-lg">{weather.humidity}%</div>
          </div>
          <div>
            <div className="text-blue-300 text-[9px] sm:text-[10px] uppercase font-black tracking-widest mb-1">Wind</div>
            <div className="text-white font-bold text-base sm:text-lg">{weather.wind_speed}km/h</div>
          </div>
        </div>
      </div>
      
      {weather.weatherTip && (
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl">
            <span className="text-xl">💡</span>
            <p className="text-sm font-bold text-blue-50 italic leading-relaxed">
              "{weather.weatherTip}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const GistArea: React.FC<{ vibes: GistAreaVibe[]; location: string }> = ({ vibes, location }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Find best 3 (1 positive, 1 negative, 1 neutral if possible)
  const bestThree = useMemo(() => {
    const positive = vibes.find(v => v.sentiment === 'Positive');
    const negative = vibes.find(v => v.sentiment === 'Negative');
    const neutral = vibes.find(v => v.sentiment === 'Neutral');

    const selected = [positive, negative, neutral].filter(Boolean) as GistAreaVibe[];
    
    // Fill up to 3 if we don't have exactly one of each
    if (selected.length < 3) {
      for (const vibe of vibes) {
        if (selected.length >= 3) break;
        if (!selected.includes(vibe)) {
          selected.push(vibe);
        }
      }
    }
    return selected;
  }, [vibes]);

  useEffect(() => {
    if (bestThree.length > 0) {
      fetch('/api/gists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, gists: bestThree })
      }).catch(err => console.error('Failed to save gists:', err));
    }
  }, [bestThree, location]);

  if (!vibes || vibes.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF7043] rounded-xl flex items-center justify-center text-white text-xl">
            🔥
          </div>
          <div>
            <h3 className="text-[#000066] text-xs font-black uppercase tracking-widest">Gist Area</h3>
            <p className="text-slate-400 text-[10px] font-bold">LIFESTYLE GUIDE</p>
          </div>
        </div>
        {vibes.length > 3 && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-[10px] font-black text-[#FF7043] uppercase tracking-widest hover:underline px-4 py-2 bg-orange-50 rounded-full transition-all"
          >
            View More →
          </button>
        )}
      </div>

      <div className="space-y-3">
        {bestThree.map((item, i) => {
          const isPos = item.sentiment === 'Positive';
          const isNeg = item.sentiment === 'Negative';
          const bg = isPos ? 'bg-emerald-50' : isNeg ? 'bg-rose-50' : 'bg-slate-50';
          const border = isPos ? 'border-emerald-200' : isNeg ? 'border-rose-200' : 'border-slate-200';
          const text = isPos ? 'text-emerald-900' : isNeg ? 'text-rose-900' : 'text-slate-900';
          const icon = isPos ? '💎' : isNeg ? '⚠️' : '📍';

          return (
            <div key={i} className={`p-4 rounded-2xl border ${bg} ${border}`}>
              <div className="flex gap-3 items-start">
                <span className="text-sm mt-0.5">{icon}</span>
                <div className="flex-1">
                  <p className={`font-bold text-sm leading-tight ${text}`}>{item.title}</p>
                  <p className="text-xs mt-1 text-slate-700">{item.insight}</p>
                  <div className="mt-2 text-[10px] font-black uppercase text-slate-500">
                    Pro Tip: <span className="text-slate-700">{item.pro_tip}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex justify-center items-start sm:items-center p-4 pt-24 sm:pt-6 bg-[#000066]/90 animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-[24px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[75vh] sm:max-h-[90vh] border border-slate-200 my-auto">
            <div className="bg-[#000066] p-5 sm:p-8 text-white flex justify-between items-center relative sticky top-0 z-20">
              <div className="relative z-10">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[8px] sm:text-[10px] font-black rounded italic">LIFESTYLE</span>
                  <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tighter italic">Gist Area</h2>
                </div>
                <p className="text-blue-300 text-[9px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em]">ALL VIBES: {location}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="relative z-10 p-2 sm:p-3 bg-white/10 hover:bg-rose-500 hover:scale-110 rounded-xl transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50">
              <div className="grid grid-cols-1 gap-4">
                {vibes.map((item, i) => {
                  const isPos = item.sentiment === 'Positive';
                  const isNeg = item.sentiment === 'Negative';
                  const bg = isPos ? 'bg-emerald-50' : isNeg ? 'bg-rose-50' : 'bg-slate-50';
                  const border = isPos ? 'border-emerald-200' : isNeg ? 'border-rose-200' : 'border-slate-200';
                  const text = isPos ? 'text-emerald-900' : isNeg ? 'text-rose-900' : 'text-slate-900';
                  const pill = isPos ? 'bg-emerald-500' : isNeg ? 'bg-rose-500' : 'bg-slate-500';

                  return (
                    <div key={i} className={`animate-slide-up group p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] border-2 transition-all hover:shadow-md ${bg} ${border}`}>
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <span className={`px-2.5 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white ${pill}`}>
                          {item.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] sm:text-[9px] font-bold text-slate-400">{item.day}</span>
                        </div>
                      </div>
                      <p className={`text-base sm:text-lg font-black leading-tight mb-2 sm:mb-3 ${text}`}>{item.title}</p>
                      <p className="text-xs sm:text-sm text-slate-700 mb-3 sm:mb-4">{item.insight}</p>
                      <div className="pt-3 border-t border-black/5">
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-800 uppercase">Pro Tip:</p>
                        <p className="text-xs text-slate-600 mt-1">{item.pro_tip}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NewsFeed: React.FC<{ news: NewsArticle[]; location: string }> = ({ news, location }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const displayNews = news.slice(0, 3);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF7043] rounded-xl flex items-center justify-center text-white">
            <NewsIcon />
          </div>
          <div>
            <h3 className="text-[#000066] text-xs font-black uppercase tracking-widest">Neighborhood Gist</h3>
            <p className="text-slate-400 text-[10px] font-bold">LATEST UPDATES</p>
          </div>
        </div>
        {news.length > 3 && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-[10px] font-black text-[#FF7043] uppercase tracking-widest hover:underline px-4 py-2 bg-orange-50 rounded-full transition-all"
          >
            View More Gist →
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayNews.map((item, i) => {
          const styles = getCategoryStyles(item.category);
          return (
            <div key={i} className={`p-4 rounded-2xl border ${styles.bg} ${styles.border}`}>
              <div className="flex gap-3 items-start">
                <span className="text-sm mt-0.5">{styles.icon}</span>
                <div className="flex-1">
                  <p className={`font-bold text-sm leading-tight ${styles.text}`}>{item.headline}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] font-black uppercase opacity-60">{item.source}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-[9px] font-medium opacity-60">{item.timeAgo}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Gist Notice Board Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex justify-center items-start sm:items-center p-4 pt-24 sm:pt-6 bg-[#000066]/90 animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-[24px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[75vh] sm:max-h-[90vh] border border-slate-200 my-auto">
            <div className="bg-[#000066] p-5 sm:p-8 text-white flex justify-between items-center relative sticky top-0 z-20">
              <div className="relative z-10">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[8px] sm:text-[10px] font-black rounded italic">EXCLUSIVE</span>
                  <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tighter italic">Neighborhood Notice Board</h2>
                </div>
                <p className="text-blue-300 text-[9px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em]">BETA TENANT GIST HQ: {location}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="relative z-10 p-2 sm:p-3 bg-white/10 hover:bg-rose-500 hover:scale-110 rounded-xl transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50">
              <div className="grid grid-cols-1 gap-4">
                {news.map((item, i) => {
                  const styles = getCategoryStyles(item.category);
                  return (
                    <div key={i} className={`animate-slide-up group p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] border-2 transition-all hover:shadow-md ${styles.bg} ${styles.border}`}>
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <span className={`px-2.5 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${styles.pill}`}>
                          {item.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          <span className="text-[8px] sm:text-[9px] font-bold text-slate-400">{item.timeAgo}</span>
                        </div>
                      </div>
                      <p className={`text-base sm:text-lg font-black leading-tight mb-3 sm:mb-4 ${styles.text}`}>{item.headline}</p>
                      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-black/5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/50 border border-black/5 flex items-center justify-center text-[10px] sm:text-xs">📰</div>
                          <span className="text-[8px] sm:text-[9px] font-black uppercase text-slate-500 italic">{item.source}</span>
                        </div>
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white rounded-xl text-[8px] sm:text-[9px] font-black text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100">Full Story</a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-lg">💡</div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 italic max-w-sm">
                    Gist is verified across social media, local news, and community reports in the last 24 hours.
                  </p>
                </div>
                <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">BETA TENANT INTEL ENGINE v2.0</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SecurityMatrix: React.FC<{ security: DeepDive['security'] }> = ({ security }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col h-full">
     <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xl">👮🏽</div>
        <div>
          <h3 className="text-slate-800 text-xs font-black uppercase tracking-widest">Security Matrix</h3>
          <p className="text-slate-400 text-[10px] font-bold">SAFETY ANALYSIS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
            <h4 className="text-emerald-800 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe Zones
            </h4>
            <ul className="space-y-2 sm:space-y-3">
                {security.safeZones.length > 0 ? security.safeZones.map((zone, i) => (
                    <li key={i} className="text-[11px] sm:text-xs font-bold text-emerald-800 flex items-start gap-2 leading-tight">
                        <span className="text-emerald-500 flex-shrink-0">✓</span> {zone}
                    </li>
                )) : <li className="text-xs text-emerald-600/50 italic">No specific data available</li>}
            </ul>
        </div>

        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4">
             <h4 className="text-rose-800 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mb-3 sm:mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Areas of Concern
            </h4>
             <ul className="space-y-2 sm:space-y-3">
                {security.concernZones.length > 0 ? security.concernZones.map((zone, i) => (
                    <li key={i} className="text-[11px] sm:text-xs font-bold text-rose-800 flex items-start gap-2 leading-tight">
                        <span className="text-rose-500 flex-shrink-0">⚠️</span> {zone}
                    </li>
                )) : <li className="text-xs text-rose-600/50 italic">No major red flags reported</li>}
            </ul>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-slate-500 text-[11px] sm:text-xs font-medium italic">
            <span className="font-bold text-slate-700 not-italic">💡 Tenant Tip: </span>
            {security.advisory}
        </p>
      </div>
  </div>
);

const PowerGrid: React.FC<{ power: DeepDive['power'] }> = ({ power }) => (
    <div className="bg-[#0F172A] text-white rounded-3xl p-5 sm:p-6 shadow-md h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-xl text-black">⚡</div>
            <div>
                <h3 className="text-white text-xs font-black uppercase tracking-widest">Power Grid</h3>
                <p className="text-slate-400 text-[10px] font-bold">BAND CLASSIFICATION</p>
            </div>
        </div>

        <div className="mb-6 p-3 bg-white/5 border border-yellow-400/30 rounded-xl">
            <p className="text-[9px] sm:text-[10px] font-bold text-yellow-400 leading-relaxed">
               {power.gridStability || 'Real-time grid stability data loading...'}
            </p>
        </div>

        <div className="space-y-5 sm:space-y-6 flex-grow">
            <div>
                <div className="flex justify-between items-center mb-3">
                    <span className="text-yellow-400 font-black text-[10px] sm:text-xs uppercase tracking-wider">Band A (20hrs+)</span>
                    <span className="text-[8px] sm:text-[9px] bg-yellow-400/20 text-yellow-200 px-2 py-0.5 rounded font-black uppercase">Premium</span>
                </div>
                <div className="flex flex-wrap gap-2">
                     {power.bandA.length > 0 ? power.bandA.map((area, i) => (
                        <span key={i} className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/10 border border-white/5 rounded-xl text-[10px] sm:text-[11px] font-bold text-slate-100 hover:bg-white/20 transition-colors">
                            {area}
                        </span>
                     )) : <span className="text-xs text-slate-500 italic">None detected</span>}
                </div>
            </div>

             <div className="w-full h-px bg-white/5"></div>

             <div>
                <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-400 font-black text-[10px] sm:text-xs uppercase tracking-wider">Band B (16hrs+)</span>
                    <span className="text-[8px] sm:text-[9px] bg-white/10 text-slate-400 px-2 py-0.5 rounded font-black uppercase">Standard</span>
                </div>
                <div className="flex flex-wrap gap-2">
                     {power.bandB.length > 0 ? power.bandB.map((area, i) => (
                        <span key={i} className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] sm:text-[11px] font-bold text-slate-400 hover:bg-white/10 transition-colors">
                            {area}
                        </span>
                     )) : <span className="text-xs text-slate-500 italic">None detected</span>}
                </div>
            </div>
        </div>
    </div>
);

const TerrainReport: React.FC<{ infra: DeepDive['infrastructure'] }> = ({ infra }) => (
    <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-4 sm:p-6 shadow-sm h-full">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center text-xl">🚧</div>
            <div>
                <h3 className="text-amber-900 text-xs font-black uppercase tracking-widest">Terrain Report</h3>
                <p className="text-amber-700/60 text-[10px] font-bold">FLOOD & ROADS</p>
            </div>
        </div>

        <div className="space-y-6">
            <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] shadow-sm">🟢</div>
                <div className="flex-1">
                    <h4 className="text-emerald-900 font-black text-[10px] uppercase tracking-wider mb-2">Smooth Access</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {infra.goodRoads && infra.goodRoads.length > 0 ? infra.goodRoads.map((area, i) => (
                            <span key={i} className="px-2 py-1 bg-white border border-emerald-100 rounded-lg text-[10px] font-bold text-emerald-800">{area}</span>
                        )) : <span className="text-[10px] text-amber-700/50 italic">Seeking verified paths...</span>}
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3 pt-4 border-t border-amber-200/50">
                <div className="w-6 h-6 bg-amber-400 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] shadow-sm">🛣️</div>
                <div className="flex-1">
                    <h4 className="text-amber-900 font-black text-[10px] uppercase tracking-wider mb-2">Known Bad Roads</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {infra.badRoads.length > 0 ? infra.badRoads.map((road, i) => (
                            <span key={i} className="px-2 py-1 bg-white border border-amber-200 rounded-lg text-[10px] font-bold text-amber-800 line-through decoration-amber-900/30 decoration-1">{road}</span>
                        )) : <span className="text-[10px] text-amber-700/50 font-medium">Clear of major potholes</span>}
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3 pt-4 border-t border-amber-200/50">
                <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] shadow-sm">🌊</div>
                <div className="flex-1">
                    <h4 className="text-blue-900 font-black text-[10px] uppercase tracking-wider mb-2">Flood Prone</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {infra.floodProne.length > 0 ? infra.floodProne.map((area, i) => (
                            <span key={i} className="px-2 py-1 bg-white border border-blue-200 rounded-lg text-[10px] font-bold text-blue-800">{area}</span>
                        )) : <span className="text-[10px] text-amber-700/50 font-medium">Safe from major flooding</span>}
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3 pt-4 border-t border-amber-200/50">
                <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] shadow-sm">🏗️</div>
                <div className="flex-1">
                    <h4 className="text-indigo-900 font-black text-[10px] uppercase tracking-wider mb-2">Projects</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {infra.ongoingProjects && infra.ongoingProjects.length > 0 ? infra.ongoingProjects.map((project, i) => (
                            <span key={i} className="px-2 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-[10px] font-bold text-indigo-800 italic">{project}</span>
                        )) : <span className="text-[10px] text-amber-700/50 italic">No active projects</span>}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const RentersGuideCard: React.FC<{ guide: RentersGuide }> = ({ guide }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-8 sm:space-y-10 h-full">
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl sm:text-2xl">🏘️</div>
        <div>
          <h3 className="text-[#000066] text-xs sm:text-sm font-black uppercase tracking-widest">Neighborhood Guide</h3>
          <p className="text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">LIVABILITY REPORT</p>
        </div>
      </div>
      
      {guide.wittyRemark && (
        <div className="bg-[#FFF8F5] border-l-4 sm:border-l-8 border-[#FF7043] p-4 sm:p-6 rounded-r-2xl sm:rounded-r-3xl relative overflow-hidden">
          <p className="text-slate-800 font-black text-base sm:text-lg italic leading-relaxed relative z-10">"{guide.wittyRemark}"</p>
        </div>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {/* Green Flags */}
      <div className="bg-emerald-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-emerald-100">
        <label className="text-[9px] sm:text-[10px] text-emerald-600 uppercase font-black tracking-[0.2em] sm:tracking-[0.3em] block mb-3 sm:mb-4 flex items-center gap-2">
           <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse"></span> Green Flags
        </label>
        <div className="space-y-2 sm:space-y-3">
          {guide.greenFlags && guide.greenFlags.map((flag, i) => (
            <div key={i} className="flex items-start gap-2 sm:gap-3 bg-white/50 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-emerald-200/50">
              <span className="text-emerald-500 flex-shrink-0 mt-0.5 text-xs sm:text-sm">💎</span>
              <p className="text-[11px] sm:text-xs font-bold text-emerald-900 leading-snug">{flag}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Red Flags */}
      <div className="bg-rose-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-rose-100">
        <label className="text-[9px] sm:text-[10px] text-rose-600 uppercase font-black tracking-[0.2em] sm:tracking-[0.3em] block mb-3 sm:mb-4 flex items-center gap-2">
           <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 animate-pulse"></span> Red Flags
        </label>
        <div className="space-y-2 sm:space-y-3">
          {guide.redFlags && guide.redFlags.length > 0 ? guide.redFlags.map((flag, i) => (
            <div key={i} className="flex items-start gap-2 sm:gap-3 bg-white/50 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-rose-200/50">
              <span className="text-rose-500 flex-shrink-0 mt-0.5 text-xs sm:text-sm">🚩</span>
              <p className="text-[11px] sm:text-xs font-bold text-rose-900 leading-snug">{flag}</p>
            </div>
          )) : <p className="text-xs text-rose-400 font-medium italic">Scanning for danger... none confirmed yet.</p>}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
      <div className="space-y-5 sm:space-y-6">
        <div>
          <label className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-2 sm:mb-3">Est. Annual Rent</label>
          <div className="border border-slate-200 rounded-[24px] sm:rounded-[32px] overflow-hidden divide-y divide-slate-100 shadow-xl shadow-slate-200/20">
             <div className="p-3 sm:p-4 flex justify-between items-center bg-slate-50/50">
                <span className="text-slate-500 text-[11px] sm:text-xs font-bold">Self Con</span>
                <span className="text-[#000066] font-black text-xs sm:text-sm">{guide.rentPrices.selfCon}</span>
             </div>
             <div className="p-3 sm:p-4 flex justify-between items-center bg-white">
                <span className="text-slate-500 text-[11px] sm:text-xs font-bold">1 Bedroom</span>
                <span className="text-[#000066] font-black text-xs sm:text-sm">{guide.rentPrices.oneBedroom}</span>
             </div>
             <div className="p-3 sm:p-4 flex justify-between items-center bg-slate-50/50">
                <span className="text-slate-500 text-[11px] sm:text-xs font-bold">2 Bedroom</span>
                <span className="text-[#000066] font-black text-xs sm:text-sm">{guide.rentPrices.twoBedroom}</span>
             </div>
             <div className="p-3 sm:p-4 flex justify-between items-center bg-white">
                <span className="text-slate-500 text-[11px] sm:text-xs font-bold">3 Bedroom+</span>
                <span className="text-[#000066] font-black text-xs sm:text-sm">{guide.rentPrices.threeBedroomPlus}</span>
             </div>
          </div>
        </div>

        <div>
           <label className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-2">Safety Rating</label>
           <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border-l-4 sm:border-l-8 font-black text-base sm:text-lg flex items-center gap-3 sm:gap-4 shadow-xl shadow-slate-200/20 ${
             guide.securityRating.toLowerCase().includes('safe') 
             ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
             : 'bg-amber-50 border-amber-500 text-amber-800'
           }`}>
             <span className="text-xl sm:text-2xl">🛡️</span> {guide.securityRating}
           </div>
        </div>
      </div>

      <div className="space-y-5 sm:space-y-6">
        <div>
          <label className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-2">Transport</label>
          <div className="border border-slate-200 p-5 sm:p-6 rounded-[24px] sm:rounded-[32px] space-y-3 sm:space-y-4 bg-slate-50/30">
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              {guide.transportation.modes.map((mode, i) => (
                <span key={i} className="px-2 py-0.5 sm:px-3 sm:py-1 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-tighter">{mode}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
               <span className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase">Frequency:</span>
               <span className="text-[9px] sm:text-[10px] font-black text-[#000066] uppercase tracking-widest bg-blue-100 px-2 py-0.5 rounded-md">{guide.transportation.frequency}</span>
            </div>
            <div className="pt-3 sm:pt-4 border-t border-slate-200">
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase mb-2 sm:mb-3">Major Routes</p>
              <div className="flex flex-col gap-1.5 sm:gap-2">
                 {guide.transportation.majorRoutes.map((route, i) => (
                   <span key={i} className="text-[11px] sm:text-xs text-[#000066] font-black leading-tight flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> {route}
                   </span>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="pt-6 sm:pt-8 border-t border-slate-100">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white font-black italic text-xs sm:text-base">BT</div>
        <p className="text-slate-600 text-[13px] sm:text-sm leading-relaxed font-medium">
          <span className="text-[#000066] font-black uppercase tracking-widest text-[9px] sm:text-[10px] block mb-1">Intelligence Conclusion:</span> 
          {guide.livabilityNote}
        </p>
      </div>
    </div>
  </div>
);

const FeedbackSection: React.FC<{ location: string, summary: Summary }> = ({ location, summary }) => {
  const [feedback, setFeedback] = useState<FeedbackSubmission>({
    rating: null,
    comment: '',
    location,
    report: summary
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.rating && !feedback.comment.trim()) {
      alert("Abeg, select a rating or write a comment before submitting.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });
      
      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        console.error("Submission failed:", errorData);
        alert(`Failed to sync: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Feedback error:", error);
      alert("Network wahala. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) return (
    <div className="mt-8 bg-emerald-50 border border-emerald-100 rounded-3xl p-8 text-center animate-fade-in shadow-sm">
      <p className="text-emerald-800 font-black text-xl mb-1">Intelligence Recorded! 🧠</p>
      <p className="text-emerald-600 text-sm font-medium">Your contribution helps us build a better database for the next tenant.</p>
      <button 
        onClick={() => { setSubmitted(false); setFeedback({ rating: null, comment: '', location, report: summary }); }}
        className="mt-4 text-emerald-700 font-bold text-xs uppercase tracking-widest hover:underline"
      >
        Send another update
      </button>
    </div>
  );

  return (
    <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-5 sm:p-10 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-[#000066] font-black text-xl sm:text-2xl tracking-tighter uppercase">Neighborhood Intelligence Update</h4>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">Verify the report for <span className="text-[#000066] font-black">{location}</span></p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
            <button 
              type="button"
              disabled={isSubmitting}
              onClick={() => setFeedback(prev => ({ ...prev, rating: 'up' }))} 
              className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-4 border-2 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] sm:text-xs group ${feedback.rating === 'up' ? 'bg-[#000066] border-[#000066] text-white shadow-xl shadow-blue-900/20' : 'bg-white border-slate-100 text-slate-400 hover:border-[#000066] hover:text-[#000066]'}`}
            >
              <span className={`text-lg sm:text-xl`}>👍</span> Accurate
            </button>
            <button 
              type="button"
              disabled={isSubmitting}
              onClick={() => setFeedback(prev => ({ ...prev, rating: 'down' }))} 
              className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-8 py-4 border-2 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] sm:text-xs group ${feedback.rating === 'down' ? 'bg-[#FF7043] border-[#FF7043] text-white shadow-xl shadow-orange-900/20' : 'bg-white border-slate-100 text-slate-400 hover:border-[#FF7043] hover:text-[#FF7043]'}`}
            >
              <span className={`text-lg sm:text-xl`}>👎</span> Incorrect
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-1">Wetin you see for ground? (Your Suggestion)</label>
          <div className="relative">
            <textarea 
              value={feedback.comment}
              disabled={isSubmitting}
              onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="e.g. 'Actually, Band A for Lekki Phase 1 is now 22hrs' or 'Flooding at Admiralty Way is bad today'..."
              className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition-all placeholder-slate-300 min-h-[120px]"
            />
            <div className="absolute bottom-4 right-6 text-[10px] font-black text-slate-300">
               {feedback.comment.length} / 500
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isSubmitting || (!feedback.rating && !feedback.comment.trim())}
          className="w-full py-5 bg-[#000066] text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              Syncing with Network...
            </>
          ) : (
            "Submit Community Intelligence"
          )}
        </button>
      </form>
    </div>
  );
};

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, location }) => {
  const handleShare = useCallback((vibe: LocationVibe) => {
    if (!navigator.share) return alert("Sharing is not supported on this browser.");
    navigator.share({ title: `Beta Tenant Intel: ${location}`, text: vibe.mainInsight.description, url: window.location.href });
  }, [location]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
            {summary.weather && <WeatherCard weather={summary.weather} />}
            {summary.gistAreaVibes && summary.gistAreaVibes.length > 0 && <GistArea vibes={summary.gistAreaVibes} location={location} />}
        </div>
        <div className="space-y-6">
            {summary.latestNews && summary.latestNews.length > 0 && <NewsFeed news={summary.latestNews} location={location} />}
        </div>
      </div>

      <div className="w-full">
        {summary.rentersGuide && <RentersGuideCard guide={summary.rentersGuide} />}
      </div>
    
      {summary.deepDive && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
             <div className="flex flex-col">
                <PowerGrid power={summary.deepDive.power} />
             </div>
             <div className="flex flex-col">
                <SecurityMatrix security={summary.deepDive.security} />
             </div>
             <div className="md:col-span-2 lg:col-span-1 flex flex-col">
                <TerrainReport infra={summary.deepDive.infrastructure} />
             </div>
         </div>
      )}

      <div className="space-y-6">
        <h4 className="text-[#000066] text-xs font-black uppercase tracking-[0.3em] mb-4 pl-2">Intelligence Stream</h4>
        {summary.vibes.map((v, i) => {
          const styles = sentimentStyles[v.mainInsight.sentiment] || sentimentStyles.NEUTRAL;
          return (
            <div key={i} className={`rounded-3xl p-5 sm:p-6 transition-all hover:shadow-lg border border-slate-200 shadow-sm ${styles.container}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl sm:text-2xl border border-slate-100">{v.icon}</div>
                  <h3 className="text-[#000066] font-black text-base sm:text-lg tracking-tight uppercase">{v.category}</h3>
                </div>
                <button onClick={() => handleShare(v)} className="p-2.5 sm:p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-[#000066] transition-all"><ShareIcon /></button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-start">
                <span className="text-3xl sm:text-4xl hidden md:block">{v.mainInsight.icon}</span>
                <div className="space-y-1.5 sm:space-y-2">
                  <h4 className="font-bold text-base sm:text-lg text-slate-800">{v.mainInsight.title}</h4>
                  <p className="text-[13px] sm:text-sm text-slate-600 font-medium leading-relaxed">{v.mainInsight.description}</p>
                </div>
              </div>
              {v.subInsight && (
                <div className="mt-4 sm:mt-5 pl-4 sm:pl-6 border-l-2 border-slate-200 flex items-center">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 italic tracking-wide">VERIFIED: {v.subInsight.text}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <FeedbackSection key={location} location={location} summary={summary} />

      {summary.sources.length > 0 && (
          <div className="pt-10 border-t border-slate-200">
              <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-5">Sources</h4>
              <div className="flex flex-wrap gap-3">
                  {summary.sources.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:text-[#000066] hover:border-[#000066] transition-all flex items-center gap-2">
                          <span className="truncate max-w-[200px]">{s.title}</span>
                      </a>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default SummaryDisplay;
