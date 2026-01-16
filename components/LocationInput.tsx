
import React from 'react';

interface LocationInputProps {
  location: string;
  setLocation: (location: string) => void;
  onSummarize: () => void;
  isLoading: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({ location, setLocation, onSummarize, isLoading }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSummarize();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="relative flex-grow w-full group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter neighborhood (e.g. Lekki, Eket, Uyo...)"
          className="w-full pl-14 pr-12 py-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-400 outline-none transition-all duration-300 placeholder-slate-400 text-slate-800 font-bold"
          disabled={isLoading}
        />
      </div>
      <button
        onClick={onSummarize}
        disabled={isLoading || !location}
        className="w-full sm:w-auto h-full px-10 py-5 bg-[#000066] text-white font-black uppercase tracking-widest rounded-3xl shadow-xl shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
      >
        {isLoading ? 'Verifying...' : 'Get Intel'}
      </button>
    </div>
  );
};

export default LocationInput;
