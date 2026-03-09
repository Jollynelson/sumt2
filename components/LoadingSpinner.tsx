
import React, { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  location: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ location }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    const loc = location?.trim() || 'the neighborhood';
    const locLower = loc.toLowerCase();
    const isLagos = locLower.includes('lagos') || 
                    ['lekki', 'ikeja', 'ajah', 'surulere', 'yaba', 'ikoyi', 'victoria island', 'oshodi', 'mile 2', 'ojota'].some(s => locLower.includes(s));
    
    const baseMessages = [
      `Locking on to ${loc}...`,
      `Syncing Power Grid (Band A/B)...`,
      `Scanning Security Logs...`,
      `Checking Flood & Road reports...`,
      `Gathering Social Gist...`,
      `Synthesizing Intelligence...`,
    ];

    const humorousMessages = isLagos ? [
      "Currently stuck in traffic at Underbridge to get you gist...",
      "Bribing agbero for exclusive neighborhood info...",
      "Avoiding potholes while scanning the streets...",
      "Waiting for Third Mainland Bridge to open...",
      "Negotiating with NEPA for power status...",
      "Asking the suya man for the latest amebo...",
      "Chasing Danfo to overhear passenger gist...",
      "Dodging LASTMA while checking parking rules...",
      "Scanning for 'Area Boys' to confirm security...",
      "Checking if flood don reach knee for Lekki...",
    ] : [
      "Checking if transformer don blow for your side...",
      "Asking the local security man for update...",
      "Scanning for flood (abeg carry umbrella)...",
      "Gathering gist from the local suya spot...",
      "Consulting the neighborhood elders...",
      "Tracking the nearest 'pure water' vendor...",
      "Waiting for network to stable for your area...",
      "Checking if landlord don increase rent again...",
      "Scanning for noise from the nearby church/mosque...",
      "Asking the Aboki for the latest exchange rate gist...",
    ];

    // Memory Feature: Try to get cached gist from localStorage
    const memoryKey = `beta_tenant_memory_${locLower.replace(/\s+/g, '_')}`;
    const cachedMemory = localStorage.getItem(memoryKey);
    let memoryMessages: string[] = [];
    
    if (cachedMemory) {
      try {
        const memoryData = JSON.parse(cachedMemory);
        if (memoryData.gist && Array.isArray(memoryData.gist)) {
          memoryMessages = memoryData.gist.map((g: string) => `Recalling: ${g}`);
        }
      } catch (e) {
        console.error("Memory recall failed", e);
      }
    }

    // Mix them up with variety
    const finalMessages = [...baseMessages];
    
    // Insert humorous messages at odd intervals
    humorousMessages.sort(() => Math.random() - 0.5).slice(0, 6).forEach((msg, i) => {
      finalMessages.splice((i * 2) + 1, 0, msg);
    });

    // Add memory messages if they exist
    if (memoryMessages.length > 0) {
      memoryMessages.slice(0, 3).forEach((msg, i) => {
        finalMessages.push(msg);
      });
    }

    setMessages(finalMessages);
    setCurrentMessage(finalMessages[0]);
  }, [location]);

  useEffect(() => {
    if (messages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentMessage(prev => {
        const idx = (messages.indexOf(prev) + 1) % messages.length;
        return messages[idx];
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-10">
      <div className="relative">
          {/* Outer Glow */}
          <div className="absolute inset-0 bg-[#000066]/10 rounded-full blur-3xl animate-pulse scale-150"></div>
          
          {/* Orbital Rings */}
          <div className="relative flex items-center justify-center h-32 w-32">
            {/* Ring 1 - Outer */}
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-dashed border-[#000066]/20"></div>
            
            {/* Ring 2 - Middle */}
            <div className="absolute inset-4 animate-spin-reverse rounded-full border-2 border-t-[#FF7043] border-r-transparent border-b-[#FF7043] border-l-transparent"></div>
            
            {/* Ring 3 - Inner */}
            <div className="absolute inset-8 animate-spin rounded-full border border-dashed border-[#000066]/40"></div>
            
            {/* Center Core */}
            <div className="relative z-10 w-12 h-12 bg-[#000066] rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
              <div className="relative z-10 w-2 h-2 bg-white rounded-full animate-ping"></div>
              
              {/* Scanning Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-400/50 blur-sm animate-[scan_2s_linear_infinite]"></div>
            </div>

            {/* Floating Data Nodes */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#FF7043] rounded-lg animate-bounce delay-75 shadow-lg shadow-orange-500/20"></div>
            <div className="absolute -bottom-1 -left-3 w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-150 shadow-lg shadow-blue-500/20"></div>
          </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(48px); }
        }
      `}} />

      <div className="text-center space-y-3 max-w-md">
        <div className="h-12 flex items-center justify-center">
          <p className="text-[#000066] font-black text-xl tracking-tight animate-fade-in px-4 italic leading-tight">
            "{currentMessage}"
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#000066] animate-[loading_3s_ease-in-out_infinite]"></div>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">BETA TENANT INTEL ENGINE v2.0</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 70%; transform: translateX(0%); }
          100% { width: 0%; transform: translateX(100%); }
        }
      `}} />
    </div>
  );
};

export default LoadingSpinner;
