
import React, { useState, useCallback } from 'react';
import type { Summary } from './types';
import { summarizeLocationData } from './services/geminiService';
import LocationInput from './components/LocationInput';
import SummaryDisplay from './components/SummaryDisplay';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [location, setLocation] = useState<string>('Lagos');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = useCallback(async () => {
    if (!location) {
      setError('Abeg, enter a location first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      let latLng: { latitude: number; longitude: number } | undefined = undefined;

      // Optional: Get user's current location to enhance maps grounding
      if ("geolocation" in navigator) {
          try {
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                  navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
              });
              latLng = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
              };
          } catch (geoError) {
              console.warn("Geolocation failed or denied, proceeding without it.");
          }
      }

      const generatedSummary = await summarizeLocationData(location, latLng);
      setSummary(generatedSummary);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Wahala o! Something just spoil. Abeg try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden">
          <div className="p-8 space-y-8">
            <header className="text-center">
              <div className="flex justify-center mb-4">
                 <div className="bg-purple-500/20 p-3 rounded-full animate-pulse">
                    <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                 </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                AmeboAI: Real Gist Only
              </h1>
              <p className="text-gray-400 mt-2">
                Scanning the web and maps for the realest updates. No filter.
              </p>
            </header>

            <LocationInput
              location={location}
              setLocation={setLocation}
              onSummarize={handleSummarize}
              isLoading={isLoading}
            />

            {error && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-200 px-6 py-4 rounded-xl text-center backdrop-blur-sm" role="alert">
                <p className="font-bold text-lg mb-1">Eish! Wahala Dey! 💥</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            )}

            {isLoading && <LoadingSpinner location={location} />}

            {summary && !isLoading && <SummaryDisplay summary={summary} location={location}/>}

            {!summary && !isLoading && !error && (
                <div className="text-center text-gray-500 py-12 px-4 border-2 border-dashed border-gray-700/50 rounded-2xl">
                    <p className="text-4xl mb-4">🏠</p>
                    <p className="text-lg">Oya, where we dey go today? Enter the place for top.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
