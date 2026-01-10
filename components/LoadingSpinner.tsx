
import React, { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  location: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ location }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    const locationName = location?.trim() || 'this place';
    const capitalizedLocation = locationName.charAt(0).toUpperCase() + locationName.slice(1);

    const generatedMessages = [
      `Scouring Google for the freshest ${capitalizedLocation} gist...`,
      `Checking Google Maps for what people are saying about ${capitalizedLocation}...`,
      `Asking local informants in ${capitalizedLocation} for the real tea...`,
      `Vibe check: Scanning social media for ${capitalizedLocation} wahala...`,
      "Loading... My data person say network slow small...",
      `Checking if people for ${capitalizedLocation} get light today...`,
      "Comparing gossip from three different sources...",
      "Shining eye well-well to find the truth...",
    ];

    setMessages(generatedMessages);
    setCurrentMessage(generatedMessages[0] || 'Loading...');
  }, [location]);

  useEffect(() => {
    if (messages.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentMessage(prevMessage => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex] || messages[0];
      });
    }, 2500);

    return () => clearInterval(intervalId);
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="relative">
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 shadow-lg shadow-purple-500/20"></div>
      </div>
      <div className="space-y-2 text-center">
        <p className="text-white font-medium text-lg animate-pulse">{currentMessage}</p>
        <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">AmeboAI is thinking...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
