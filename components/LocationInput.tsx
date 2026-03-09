
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { NIGERIA_LOCATIONS } from '../src/constants/locations';

interface LocationInputProps {
  location: string;
  setLocation: (location: string) => void;
  onSummarize: () => void;
  isLoading: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({ location, setLocation, onSummarize, isLoading }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Flatten locations for searching
  const allLocations = useMemo(() => {
    const list: string[] = [];
    NIGERIA_LOCATIONS.states.forEach(state => {
      state.cities.forEach(city => {
        list.push(`${city.city}, ${state.state}`);
        city.areas.forEach(area => {
          list.push(`${area}, ${city.city}, ${state.state}`);
        });
      });
    });
    return list;
  }, []);

  const suggestions = useMemo(() => {
    if (!location || location.length < 2) return [];
    const search = location.toLowerCase();
    return allLocations
      .filter(loc => loc.toLowerCase().includes(search))
      .slice(0, 8); // Limit to 8 suggestions
  }, [location, allLocations]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (suggestions.length > 0 && showSuggestions) {
        handleSelect(suggestions[0]);
      } else {
        onSummarize();
      }
    }
  };

  const handleSelect = (selected: string) => {
    setLocation(selected);
    setShowSuggestions(false);
    // Automatically trigger summarize on select for better UX
    setTimeout(() => onSummarize(), 100);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 relative w-full">
      <div className="relative flex-grow w-full group" ref={dropdownRef}>
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <input
          type="text"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search a location (e.g. Ikeja, Lagos)"
          className="w-full pl-16 pr-12 py-6 bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm focus:ring-8 focus:ring-blue-50 focus:bg-white focus:border-blue-500 outline-none transition-all duration-300 placeholder-slate-400 text-slate-800 font-bold text-lg"
          disabled={isLoading}
        />

        {showSuggestions && location.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-sm">
            <div className="py-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(suggestion)}
                    className="w-full px-8 py-5 text-left hover:bg-blue-50/50 transition-all flex items-center justify-between group border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      </div>
                      <span className="text-slate-700 font-bold text-base group-hover:text-blue-700 transition-colors">{suggestion}</span>
                    </div>
                    <span className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-8 py-10 text-center">
                  <p className="text-slate-400 font-medium italic">No matching locations found in our database.</p>
                  <p className="text-slate-300 text-xs mt-2 uppercase tracking-widest font-black">Try another neighborhood</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <button
        onClick={onSummarize}
        disabled={isLoading || !location}
        className="w-full sm:w-auto h-[76px] px-8 bg-[#000066] text-white font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-blue-900/30 hover:shadow-blue-900/50 hover:-translate-y-1 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-3"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        )}
      </button>
    </div>
  );
};

export default LocationInput;
