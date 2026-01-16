
import React, { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  location: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ location }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    const loc = location?.trim() || 'the neighborhood';
    const msg = [
      `Locking on to ${loc}...`,
      `Syncing Power Grid (Band A/B)...`,
      `Scanning Security Logs...`,
      `Checking Flood & Road reports...`,
      `Gathering Social Gist...`,
      `Synthesizing Intelligence...`,
    ];
    setMessages(msg);
    setCurrentMessage(msg[0]);
  }, [location]);

  useEffect(() => {
    if (messages.length === 0) return;
    // Sped up from 2500ms to 1200ms for faster perceived speed
    const interval = setInterval(() => {
      setCurrentMessage(prev => {
        const idx = (messages.indexOf(prev) + 1) % messages.length;
        return messages[idx];
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-8">
      <div className="relative">
          <div className="absolute inset-0 bg-[#000066]/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative flex items-center justify-center h-20 w-20">
            <div className="absolute inset-0 animate-spin rounded-full border-t-2 border-[#000066] opacity-30"></div>
            <div className="absolute inset-2 animate-spin-reverse rounded-full border-b-2 border-[#FF7043] opacity-60"></div>
            <div className="w-10 h-10 bg-[#000066] rounded-xl animate-bounce"></div>
          </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-[#000066] font-black text-xl tracking-tight animate-pulse px-4">{currentMessage}</p>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">BETA TENANT INTEL ENGINE</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
