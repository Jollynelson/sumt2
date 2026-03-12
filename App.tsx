
import React, { useState, useCallback } from 'react';
import type { Summary } from './types';
import { summarizeLocationData } from './services/geminiService';
import LocationInput from './components/LocationInput';
import SummaryDisplay from './components/SummaryDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { Header } from './components/Header';

const App: React.FC = () => {
  const [location, setLocation] = useState<string>('');
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
      // 1. Fetch real-time tweets and Airtable updates (fast)
      const [tweetsResponse, airtableUpdates] = await Promise.all([
        fetch(`/api/tweets?location=${encodeURIComponent(location)}`)
          .then(res => res.ok ? res.json() : [])
          .catch(() => []),
        fetch(`/api/neighborhood-updates?location=${encodeURIComponent(location)}`)
          .then(res => res.ok ? res.json() : [])
          .catch(() => [])
      ]);

      // 2. Pass tweets and Airtable updates to Gemini so it can incorporate the gist into the summary
      const generatedSummary = await summarizeLocationData(location, tweetsResponse, airtableUpdates);

      setSummary({
        ...generatedSummary,
        tweets: tweetsResponse
      });

      // Neighborhood Memory: Save key gist for future recall
      try {
        const locLower = location.toLowerCase();
        const memoryKey = `beta_tenant_memory_${locLower.replace(/\s+/g, '_')}`;
        const keyGist = [
          ...(generatedSummary.latestNews?.slice(0, 2).map(n => n.headline) || []),
          ...(generatedSummary.social?.hashtags?.slice(0, 2).map(h => `#${h}`) || []),
          generatedSummary.rentersGuide?.securityRating ? `Security: ${generatedSummary.rentersGuide.securityRating}` : null
        ].filter(Boolean);

        if (keyGist.length > 0) {
          localStorage.setItem(memoryKey, JSON.stringify({
            gist: keyGist,
            timestamp: Date.now()
          }));
        }
      } catch (e) {
        console.warn("Failed to save neighborhood memory", e);
      }
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
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 font-sans pt-24 md:pt-32 pb-12 px-4">
      <Header />
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="p-4 sm:p-8 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Neighborhood Intelligence</h1>
              <p className="text-slate-500 font-medium">
                Real-time neighborhood intelligence for the smart tenant.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="flex-grow w-full">
                <LocationInput
                  location={location}
                  setLocation={setLocation}
                  onSummarize={handleSummarize}
                  isLoading={isLoading}
                />
              </div>
            </div>

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
                    <p className="text-lg font-medium">Ready to explore? Enter a neighborhood to get the latest intel.</p>
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
