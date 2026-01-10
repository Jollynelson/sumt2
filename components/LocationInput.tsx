
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
      <div className="relative flex-grow w-full">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., New York, Tokyo, London"
          className="w-full pl-5 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-300 placeholder-gray-500"
          disabled={isLoading}
        />
      </div>
      <button
        onClick={onSummarize}
        disabled={isLoading || !location}
        className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
      >
        {isLoading ? 'Analyzing...' : 'Summarize'}
      </button>
    </div>
  );
};

export default LocationInput;
