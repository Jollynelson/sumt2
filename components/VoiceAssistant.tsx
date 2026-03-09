
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

interface VoiceAssistantProps {
  location: string;
  onLocationUpdate: (newLocation: string) => void;
}

// Audio Utilities
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ location, onLocationUpdate }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [modelResponse, setModelResponse] = useState('');
  
  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    activeSourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    activeSourcesRef.current.clear();
    
    setIsActive(false);
    setIsConnecting(false);
    setTranscript('');
    setModelResponse('');
  }, []);

  const startSession = async () => {
    setIsConnecting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        } 
      });
      mediaStreamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inputCtx, output: outputCtx };

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } },
          },
          systemInstruction: `You are the "Beta Tenant Voice Assistant" (Amebo AI). 
          
          CURRENT CONTEXT: Focus on "${location || 'Nigeria'}". 
          
          PERSONALITY & SCOPE:
          You are a neighborhood expert who knows ALL the gist. Be flexible! 
          Talk about:
          1. Rental Gist: Who are the landlords? Is parking a headache? Which street gets noisy?
          2. Area Vibe: Where is the best place to eat? Is the nightlife "lit" or is it a graveyard?
          3. Real-time Intel: "I'm checking the weather for ${location} right now, and the gist on the street is..."
          4. Trade-offs: Contrast the expensive areas with the affordable ones (e.g. Ewet Housing vs Nwaniba).
          5. Scams: Keep an eye out for 'pocket-cleaning' agents but don't obsess over it unless asked.
          
          UYO SPECIAL REFERENCE:
          Ifasked about Uyo, remember: "Uyo clean pass your village, but agents fit clean your pocket with inspection fees if you no wise. If Ewet Housing too cost, Nwaniba dey for jejely life."
          
          TONE: Witty, street-smart, helpful, sarcastic Pidgin.
          Keep responses snappy for voice.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(2048, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => {
                if (session) session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setModelResponse(prev => prev + message.serverContent!.outputTranscription!.text);
            } else if (message.serverContent?.inputTranscription) {
              setTranscript(prev => prev + message.serverContent!.inputTranscription!.text);
            }

            if (message.serverContent?.turnComplete) {
              setTimeout(() => {
                setTranscript('');
                setModelResponse('');
              }, 2000);
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextsRef.current) {
              const { output } = audioContextsRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, output.currentTime);
              const buffer = await decodeAudioData(decode(audioData), output, 24000, 1);
              const source = output.createBufferSource();
              source.buffer = buffer;
              source.connect(output.destination);
              source.addEventListener('ended', () => activeSourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              activeSourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Amebo Live Error:', e);
            stopSession();
          },
          onclose: () => {
            stopSession();
          },
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to initialize Amebo Live:', err);
      setIsConnecting(false);
    }
  };

  return (
    <>
      <button
        onClick={isActive ? stopSession : startSession}
        disabled={isConnecting}
        className={`flex items-center gap-3 px-6 py-5 rounded-3xl font-black uppercase tracking-widest text-xs transition-all duration-300 shadow-xl ${
          isActive 
            ? 'bg-rose-500 text-white shadow-rose-900/20' 
            : 'bg-[#FF7043] text-white shadow-orange-900/20 hover:shadow-orange-900/40 hover:-translate-y-1'
        } ${isConnecting ? 'animate-pulse' : ''}`}
      >
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
          {isActive && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          )}
        </div>
        <span>{isActive ? 'Stop Gist' : 'Amebo Live'}</span>
      </button>

      {/* Live Gist Modal */}
      {isActive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#000066]/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden relative">
            <div className="bg-[#000066] p-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">⚡</div>
                <div>
                  <h2 className="font-black text-xl uppercase tracking-tighter">Live Neighborhood Gist</h2>
                  <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest">Active Intelligence Session</p>
                </div>
              </div>
              <button onClick={stopSession} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="p-8 space-y-8 min-h-[300px] flex flex-col">
              <div className="flex-grow space-y-6">
                {transcript && (
                  <div className="animate-slide-up">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 ml-1">You said</p>
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-none">
                      <p className="text-slate-500 font-bold italic">"{transcript}"</p>
                    </div>
                  </div>
                )}

                <div className="animate-slide-up delay-100">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 ml-1">Amebo AI Gist</p>
                  <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl rounded-tl-none shadow-sm">
                    <p className="text-[#000066] font-black text-xl leading-snug">
                      {modelResponse || "I'm checking the latest neighborhood gist, real-time weather, and community reports..."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 mb-4 animate-slide-up delay-100">
                <p className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span> Amebo Tip
                </p>
                <p className="text-xs font-bold text-orange-800 italic">
                  "Landlord wahala? Parking space drama? I dey scan everything for ground. No just look house, look the people wey dey stay there too!"
                </p>
              </div>

              <div className="flex flex-col items-center gap-6 pt-8 border-t border-slate-100">
                <div className="flex items-end gap-1.5 h-16">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-2 bg-[#FF7043] rounded-full animate-voice-wave"
                      style={{ 
                        height: `${30 + Math.random() * 70}%`, 
                        animationDelay: `${i * 0.08}s`,
                        opacity: transcript || modelResponse ? 1 : 0.3
                      }}
                    />
                  ))}
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Ask about the neighborhood gist...</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400">SESSION: {location || 'General Nigeria'} • REAL-TIME INTEL</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceAssistant;
