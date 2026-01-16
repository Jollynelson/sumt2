
import React, { useState, useCallback } from 'react';
import type { Summary } from './types';
import { summarizeLocationData } from './services/geminiService';
import LocationInput from './components/LocationInput';
import SummaryDisplay from './components/SummaryDisplay';
import LoadingSpinner from './components/LoadingSpinner';

const BetaTenantLogo: React.FC = () => (
  <div className="flex flex-col items-center">
    <div className="relative w-24 h-24 mb-4">
      {/* The Arch Shape */}
      <div className="absolute inset-0 bg-[#000066] rounded-t-full border-4 border-[#000066] flex items-center justify-center overflow-hidden">
        {/* The 4 Colored Squares */}
        <div className="grid grid-cols-2 gap-1 mt-6">
          <div className="w-5 h-6 bg-[#D1E9FF] rounded-t-full"></div>
          <div className="w-5 h-6 bg-white rounded-t-full"></div>
          <div className="w-5 h-5 bg-[#FF7043] rounded-sm"></div>
          <div className="w-5 h-5 bg-[#FFC1E3] rounded-sm"></div>
        </div>
      </div>
    </div>
    <h1 className="text-4xl font-black text-[#000066] tracking-tighter uppercase flex items-center gap-1">
      BETA TENANT
    </h1>
  </div>
);

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

      if ("geolocation" in navigator) {
          try {
              // Reduced timeout to 1.5s for faster responsiveness
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                  navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 1500 });
              });
              latLng = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
              };
          } catch (geoError) {
              console.warn("Geolocation skipped/timed out, proceeding with text-only search.");
          }
      }

      const generatedSummary = await summarizeLocationData(location, latLng);
      setSummary(generatedSummary);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-8 space-y-8">
            <header className="text-center py-4 bg-[#F8FAFC] -mx-8 -mt-8 mb-8 border-b border-slate-100">
              <BetaTenantLogo />
              <p className="text-slate-500 mt-3 font-medium px-4">
                Real-time neighborhood intelligence for the smart tenant.
              </p>
            </header>

            <LocationInput
              location={location}
              setLocation={setLocation}
              onSummarize={handleSummarize}
              isLoading={isLoading}
            />

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl text-center" role="alert">
                <p className="font-bold">Accuracy Alert ⚠️</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {isLoading && <LoadingSpinner location={location} />}

            {summary && !isLoading && <SummaryDisplay summary={summary} location={location}/>}

            {!summary && !isLoading && !error && (
                <div className="text-center text-slate-400 py-16 px-4 border-2 border-dashed border-slate-200 rounded-3xl">
                    <p className="text-5xl mb-4">📍</p>
                    <p className="text-lg font-medium">Ready to explore? Enter a neighborhood to get the latest gist.</p>
                </div>
            )}
          </div>
        </div>
        <footer className="mt-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          Powered by Beta Tenant Intelligence Engine
        </footer>
      </div>
    </div>
  );
};

export default App;
