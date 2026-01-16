
import React, { useCallback, useState } from 'react';
import type { Summary, Sentiment, LocationVibe, WeatherData, SocialTrends, RentersGuide, FeedbackSubmission, NewsArticle, DeepDive } from '../types';
import ShareIcon from './icons/ShareIcon';
import WeatherIcon from './icons/WeatherIcon';
import SocialIcon from './icons/SocialIcon';
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

const WeatherCard: React.FC<{ weather: WeatherData }> = ({ weather }) => (
  <div className="bg-[#000066] rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
    <div className="flex items-center gap-5">
      <div className="bg-white/10 p-4 rounded-2xl"><WeatherIcon /></div>
      <div>
        <div className="text-5xl font-black tracking-tighter">{weather.temperature}°</div>
        <div className="text-blue-100 font-bold uppercase text-xs tracking-widest mt-1">{weather.condition}</div>
      </div>
    </div>
    <div className="flex gap-8 w-full sm:w-auto justify-between sm:justify-start border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-8">
      <div>
        <div className="text-blue-300 text-[10px] uppercase font-black tracking-widest mb-1">Humidity</div>
        <div className="text-white font-bold text-lg">{weather.humidity}%</div>
      </div>
      <div>
        <div className="text-blue-300 text-[10px] uppercase font-black tracking-widest mb-1">Wind</div>
        <div className="text-white font-bold text-lg">{weather.wind_speed}km/h</div>
      </div>
    </div>
  </div>
);

const NewsFeed: React.FC<{ news: NewsArticle[] }> = ({ news }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-[#FF7043] rounded-xl flex items-center justify-center text-white">
        <NewsIcon />
      </div>
      <div>
        <h3 className="text-[#000066] text-xs font-black uppercase tracking-widest">Local Gist</h3>
        <p className="text-slate-400 text-[10px] font-bold">LATEST HAPPENINGS</p>
      </div>
    </div>
    <div className="space-y-4">
      {news.map((item, i) => (
        <a key={i} href={item.url || '#'} target="_blank" rel="noopener noreferrer" className="block group">
          <div className="flex gap-4 items-start pb-4 border-b border-slate-100 last:border-0 last:pb-0">
             <div className="min-w-[4px] h-[4px] mt-2 rounded-full bg-[#FF7043] group-hover:scale-150 transition-transform"></div>
             <div>
                <p className="text-slate-800 font-bold text-sm leading-snug group-hover:text-[#FF7043] transition-colors">{item.headline}</p>
                <div className="flex gap-2 mt-1.5 items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{item.source}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-[10px] font-medium text-slate-400">{item.timeAgo}</span>
                </div>
             </div>
          </div>
        </a>
      ))}
      {news.length === 0 && <p className="text-slate-400 text-sm italic">No major gist reported recently.</p>}
    </div>
  </div>
);

const SecurityMatrix: React.FC<{ security: DeepDive['security'] }> = ({ security }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-full">
     <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xl">👮🏽</div>
        <div>
          <h3 className="text-slate-800 text-xs font-black uppercase tracking-widest">Security Matrix</h3>
          <p className="text-slate-400 text-[10px] font-bold">SAFETY ANALYSIS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
            <h4 className="text-emerald-800 font-black text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Safe Zones
            </h4>
            <ul className="space-y-3">
                {security.safeZones.length > 0 ? security.safeZones.map((zone, i) => (
                    <li key={i} className="text-xs font-bold text-emerald-800 flex items-start gap-2 leading-tight">
                        <span className="text-emerald-500 flex-shrink-0">✓</span> {zone}
                    </li>
                )) : <li className="text-xs text-emerald-600/50 italic">No specific data available</li>}
            </ul>
        </div>

        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4">
             <h4 className="text-rose-800 font-black text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Areas of Concern
            </h4>
             <ul className="space-y-3">
                {security.concernZones.length > 0 ? security.concernZones.map((zone, i) => (
                    <li key={i} className="text-xs font-bold text-rose-800 flex items-start gap-2 leading-tight">
                        <span className="text-rose-500 flex-shrink-0">⚠️</span> {zone}
                    </li>
                )) : <li className="text-xs text-rose-600/50 italic">No major red flags reported</li>}
            </ul>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-slate-500 text-xs font-medium italic">
            <span className="font-bold text-slate-700 not-italic">💡 Tenant Tip: </span>
            {security.advisory}
        </p>
      </div>
  </div>
);

const PowerGrid: React.FC<{ power: DeepDive['power'] }> = ({ power }) => (
    <div className="bg-[#0F172A] text-white rounded-3xl p-6 shadow-md h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-xl text-black">⚡</div>
            <div>
                <h3 className="text-white text-xs font-black uppercase tracking-widest">Power Grid</h3>
                <p className="text-slate-400 text-[10px] font-bold">BAND CLASSIFICATION</p>
            </div>
        </div>

        {/* Status Banner - Fixed Distortion here */}
        <div className="mb-6 p-3 bg-white/5 border border-yellow-400/30 rounded-xl">
            <p className="text-[10px] font-bold text-yellow-400 leading-relaxed">
               {power.gridStability || 'Real-time grid stability data loading...'}
            </p>
        </div>

        <div className="space-y-6 flex-grow">
            <div>
                <div className="flex justify-between items-center mb-3">
                    <span className="text-yellow-400 font-black text-xs uppercase tracking-wider">Band A (20hrs+)</span>
                    <span className="text-[9px] bg-yellow-400/20 text-yellow-200 px-2 py-0.5 rounded font-black uppercase">Premium</span>
                </div>
                <div className="flex flex-wrap gap-2">
                     {power.bandA.length > 0 ? power.bandA.map((area, i) => (
                        <span key={i} className="px-3 py-2 bg-white/10 border border-white/5 rounded-xl text-[11px] font-bold text-slate-100 hover:bg-white/20 transition-colors">
                            {area}
                        </span>
                     )) : <span className="text-xs text-slate-500 italic">None detected</span>}
                </div>
            </div>

             <div className="w-full h-px bg-white/5"></div>

             <div>
                <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-400 font-black text-xs uppercase tracking-wider">Band B (16hrs+)</span>
                    <span className="text-[9px] bg-white/10 text-slate-400 px-2 py-0.5 rounded font-black uppercase">Standard</span>
                </div>
                <div className="flex flex-wrap gap-2">
                     {power.bandB.length > 0 ? power.bandB.map((area, i) => (
                        <span key={i} className="px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-[11px] font-bold text-slate-400 hover:bg-white/10 transition-colors">
                            {area}
                        </span>
                     )) : <span className="text-xs text-slate-500 italic">None detected</span>}
                </div>
            </div>
        </div>
    </div>
);

const TerrainReport: React.FC<{ infra: DeepDive['infrastructure'] }> = ({ infra }) => (
    <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6 shadow-sm h-full">
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center text-xl">🚧</div>
            <div>
                <h3 className="text-amber-900 text-xs font-black uppercase tracking-widest">Terrain Report</h3>
                <p className="text-amber-700/60 text-[10px] font-bold">FLOOD & ROADS</p>
            </div>
        </div>

        <div className="space-y-6">
            {/* Good Roads */}
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

            {/* Bad Roads */}
            <div className="flex items-start gap-3 pt-4 border-t border-amber-200/50">
                <div className="w-6 h-6 bg-amber-400 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] shadow-sm">🛣️</div>
                <div className="flex-1">
                    <h4 className="text-amber-900 font-black text-[10px] uppercase tracking-wider mb-2">Known Bad Roads</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {infra.badRoads.length > 0 ? infra.badRoads.map((road, i) => (
                            <span key={i} className="px-2 py-1 bg-white border border-amber-200 rounded-lg text-[10px] font-bold text-amber-800 decoration-amber-900/30 line-through decoration-1">{road}</span>
                        )) : <span className="text-[10px] text-amber-700/50 font-medium">Clear of major potholes</span>}
                    </div>
                </div>
            </div>

            {/* Flood Zones */}
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

            {/* Projects */}
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
  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-8 h-full">
    
    {/* Header & Witty Remark */}
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl">🏘️</div>
        <div>
          <h3 className="text-[#000066] text-xs font-black uppercase tracking-widest">Neighborhood Guide</h3>
          <p className="text-slate-400 text-[10px] font-bold">LIVABILITY REPORT</p>
        </div>
      </div>
      
      {guide.wittyRemark && (
        <div className="bg-[#FFF8F5] border-l-4 border-[#FF7043] p-4 rounded-r-xl">
          <p className="text-slate-800 font-bold text-sm italic leading-relaxed">"{guide.wittyRemark}"</p>
        </div>
      )}
    </div>

    {/* Green Flags */}
    {guide.greenFlags && guide.greenFlags.length > 0 && (
      <div>
        <label className="text-[10px] text-emerald-600 uppercase font-black tracking-widest block mb-3">Green Flags 🚩</label>
        <div className="flex flex-wrap gap-2">
          {guide.greenFlags.map((flag, i) => (
            <span key={i} className="px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              {flag}
            </span>
          ))}
        </div>
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Rent & Safety */}
      <div className="space-y-6">
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-3">Est. Annual Rent</label>
          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
             <div className="p-3 flex justify-between items-center bg-slate-50/50">
                <span className="text-slate-500 text-xs font-bold">Self Con</span>
                <span className="text-[#000066] font-black text-xs">{guide.rentPrices.selfCon}</span>
             </div>
             <div className="p-3 flex justify-between items-center">
                <span className="text-slate-500 text-xs font-bold">1 Bedroom</span>
                <span className="text-[#000066] font-black text-xs">{guide.rentPrices.oneBedroom}</span>
             </div>
             <div className="p-3 flex justify-between items-center bg-slate-50/50">
                <span className="text-slate-500 text-xs font-bold">2 Bedroom</span>
                <span className="text-[#000066] font-black text-xs">{guide.rentPrices.twoBedroom}</span>
             </div>
             <div className="p-3 flex justify-between items-center">
                <span className="text-slate-500 text-xs font-bold">3 Bedroom+</span>
                <span className="text-[#000066] font-black text-xs">{guide.rentPrices.threeBedroomPlus}</span>
             </div>
          </div>
        </div>

        <div>
           <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-2">Safety Rating</label>
           <div className={`p-4 rounded-xl border-l-4 font-black text-sm flex items-center gap-3 shadow-sm ${
             guide.securityRating.toLowerCase().includes('safe') 
             ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
             : 'bg-amber-50 border-amber-500 text-amber-800'
           }`}>
             <span className="text-lg">🛡️</span> {guide.securityRating}
           </div>
        </div>
      </div>

      {/* Transport & Schools */}
      <div className="space-y-6">
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-2">Transport</label>
          <div className="border border-slate-200 p-4 rounded-2xl space-y-3 bg-slate-50/30">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {guide.transportation.modes.map((mode, i) => (
                <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 uppercase">{mode}</span>
              ))}
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-slate-400 font-bold uppercase">Freq:</span>
               <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{guide.transportation.frequency}</span>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <p className="text-[9px] text-slate-400 font-bold uppercase mb-2">Routes</p>
              <div className="flex flex-col gap-1.5">
                 {guide.transportation.majorRoutes.map((route, i) => (
                   <span key={i} className="text-[11px] text-[#000066] font-bold leading-tight">📍 {route}</span>
                 ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-2">Top Schools</label>
          <div className="space-y-2">
            {guide.schools.map((school, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="min-w-0 pr-2">
                  <p className="text-slate-800 font-bold text-xs truncate">{school.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{school.proximity}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded whitespace-nowrap">{school.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    
    <div className="pt-6 border-t border-slate-100">
      <p className="text-slate-600 text-sm leading-relaxed"><span className="text-[#000066] font-bold">Agent's Note:</span> {guide.livabilityNote}</p>
    </div>
  </div>
);

const SocialRadar: React.FC<{ social: SocialTrends }> = ({ social }) => (
  <div className="bg-[#E0F2FE] rounded-3xl p-6 h-full relative overflow-hidden group border-none shadow-sm flex flex-col">
    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
       <div className="scale-150 text-[#000066]"><SocialIcon /></div>
    </div>
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-blue-500">
        <SocialIcon />
      </div>
      <h3 className="text-[#000066] text-xs font-black uppercase tracking-widest">Live Pulse</h3>
    </div>
    
    <div className="space-y-5 flex-1">
      <div>
        <p className="text-[#000066] text-sm font-bold leading-relaxed relative z-10 mb-3">"{social.topDiscussion}"</p>
        <div className="flex flex-wrap gap-1.5">
          {social.hashtags.map((tag, i) => (
            <span key={i} className="px-2.5 py-1 bg-white rounded-md text-[10px] font-black text-blue-600 uppercase tracking-tighter shadow-sm">#{tag.replace('#','')}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200/40">
        <div>
           <p className="text-[9px] text-blue-800 font-black uppercase tracking-tighter mb-1.5">Peak Hours</p>
           <p className="text-[11px] text-[#000066] font-black flex items-center gap-1.5">
             <span className="text-base">🕒</span> {social.activeTime || 'Evening'}
           </p>
        </div>
        <div>
           <p className="text-[9px] text-blue-800 font-black uppercase tracking-tighter mb-1.5">Platforms</p>
           <div className="flex flex-wrap gap-1">
              {(social.platforms || []).map((p, i) => (
                <span key={i} className="text-[8px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase">{p}</span>
              ))}
           </div>
        </div>
      </div>

      <div className="pt-2 mt-auto">
        <div className="flex justify-between text-[10px] text-blue-800 font-black uppercase mb-1"><span>Vibe Density</span><span>{social.vibeScore}/10</span></div>
        <div className="w-full bg-white h-2 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full" style={{ width: `${social.vibeScore * 10}%` }}></div>
        </div>
      </div>
    </div>
  </div>
);

const FeedbackSection: React.FC<{ location: string }> = ({ location }) => {
  const [feedback, setFeedback] = useState<FeedbackSubmission>({
    rating: null,
    comment: '',
    location
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.rating) return;
    setSubmitted(true);
    console.log('Feedback submitted:', feedback);
  };

  if (submitted) return (
    <div className="mt-8 bg-emerald-50 border border-emerald-100 rounded-3xl p-8 text-center animate-fade-in shadow-sm">
      <p className="text-emerald-800 font-black text-xl mb-1">Intelligence Recorded! 🧠</p>
      <p className="text-emerald-600 text-sm font-medium">Your contribution helps us build a better database.</p>
      <button 
        onClick={() => { setSubmitted(false); setFeedback({ rating: null, comment: '', location }); }}
        className="mt-4 text-emerald-700 font-bold text-xs uppercase tracking-widest hover:underline"
      >
        Send another update
      </button>
    </div>
  );

  return (
    <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-[#000066] font-black text-xl">Confirm the Gist?</h4>
            <p className="text-slate-500 text-sm font-medium">Is this report for {location} accurate?</p>
          </div>
          <div className="flex gap-3 sm:gap-4 w-full md:w-auto">
            <button 
              type="button"
              onClick={() => setFeedback(prev => ({ ...prev, rating: 'up' }))} 
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 border-2 rounded-xl transition-all font-bold group ${feedback.rating === 'up' ? 'bg-[#000066] border-[#000066] text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-[#000066]'}`}
            >
              <span className={`text-xl`}>👍</span> Spot On
            </button>
            <button 
              type="button"
              onClick={() => setFeedback(prev => ({ ...prev, rating: 'down' }))} 
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 border-2 rounded-xl transition-all font-bold group ${feedback.rating === 'down' ? 'bg-[#FF7043] border-[#FF7043] text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-[#FF7043]'}`}
            >
              <span className={`text-xl`}>👎</span> No O
            </button>
          </div>
        </div>
        <button 
          type="submit"
          disabled={!feedback.rating}
          className="w-full py-4 bg-[#000066] text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none transition-all transform active:scale-[0.98]"
        >
          Submit Intelligence
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
      {/* Top Row: Left Column (Weather + Gist + Guide) vs Right Column (Social Pulse) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            {summary.weather && <WeatherCard weather={summary.weather} />}
            {summary.latestNews && summary.latestNews.length > 0 && <NewsFeed news={summary.latestNews} />}
            {/* Moved Renters Guide under Local Gist (NewsFeed) */}
            {summary.rentersGuide && <RentersGuideCard guide={summary.rentersGuide} />}
        </div>
        <div className="lg:col-span-1 h-full">
            {summary.social && <SocialRadar social={summary.social} />}
        </div>
      </div>
    
      {/* Deep Dive Section: Power, Security, Terrain */}
      {summary.deepDive && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
             <div className="h-full">
                <PowerGrid power={summary.deepDive.power} />
             </div>
             <div className="h-full">
                <SecurityMatrix security={summary.deepDive.security} />
             </div>
             <div className="md:col-span-2 lg:col-span-1 h-full">
                <TerrainReport infra={summary.deepDive.infrastructure} />
             </div>
         </div>
      )}

      {/* Vibes Stream */}
      <div className="space-y-6">
        <h4 className="text-[#000066] text-xs font-black uppercase tracking-[0.3em] mb-4 pl-2">Intelligence Stream</h4>
        {summary.vibes.map((v, i) => {
          const styles = sentimentStyles[v.mainInsight.sentiment] || sentimentStyles.NEUTRAL;
          return (
            <div key={i} className={`rounded-3xl p-6 transition-all hover:shadow-lg border border-slate-200 shadow-sm ${styles.container}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl border border-slate-100">{v.icon}</div>
                  <h3 className="text-[#000066] font-black text-lg tracking-tight uppercase">{v.category}</h3>
                </div>
                <button onClick={() => handleShare(v)} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-[#000066] transition-all"><ShareIcon /></button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <span className="text-4xl hidden md:block">{v.mainInsight.icon}</span>
                <div className="space-y-2">
                  <h4 className="font-bold text-lg text-slate-800">{v.mainInsight.title}</h4>
                  <p className="text-slate-600 font-medium leading-relaxed">{v.mainInsight.description}</p>
                </div>
              </div>
              {v.subInsight && (
                <div className="mt-5 pl-6 border-l-2 border-slate-200 flex items-center">
                  <p className="text-xs font-bold text-slate-400 italic tracking-wide">VERIFIED: {v.subInsight.text}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <FeedbackSection location={location} />

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
