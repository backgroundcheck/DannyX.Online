
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AudioAnalysis } from '../types';
import { SynthesisService } from '../services/gemini';
import { ProcessingHUD } from './ProcessingHUD';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  audioFile: File | null;
  analysis: AudioAnalysis | null;
}

export const ChatInterface: React.FC<Props> = ({ isOpen, onClose, audioFile, analysis }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [intensity, setIntensity] = useState(50);
  const [absurdity, setAbsurdity] = useState(25);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const service = useRef(new SynthesisService());

  useEffect(() => {
    chatRef.current = service.current.createFastChat();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isSynthesizing]);

  const handleSend = async (customMsg?: string) => {
    const userMsg = customMsg || input.trim();
    if (!userMsg || isLoading) return;
    
    if (!customMsg) setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'model', text: `ENGINE ERROR: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeExpressSynthesis = async () => {
    if (!analysis) return;
    setIsSynthesizing(true);
    setResultVideoUrl(null);
    
    setMessages(prev => [...prev, { 
      role: 'model', 
      text: `INITIATING MASTER SYNTHESIS...\nIntensity set to ${intensity}%\nAbsurdity mapped to ${absurdity}%\nAnalyzing Audio Causality...` 
    }]);

    try {
      const prompt = await service.current.generateExpressPrompt(analysis, intensity, absurdity);
      const seedImage = await service.current.generateSeedImage(prompt);
      const videoRes = await service.current.synthesizeVideo(prompt, seedImage);
      
      setResultVideoUrl(videoRes.url);
      setMessages(prev => [...prev, { role: 'model', text: "SYNTHESIS COMPLETE. Immersion ready for observation." }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'model', text: `CRITICAL FAILURE: ${err.message}` }]);
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-300" 
          onClick={onClose} 
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-full sm:w-[500px] md:w-[600px] bg-zinc-950/95 backdrop-blur-3xl border-l border-zinc-900 z-[200] shadow-[ -50px_0_100px_rgba(0,0,0,0.8)] transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Spectral Border Pulse Accent */}
        <div className={`absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-blue-600 via-purple-500 to-blue-600 opacity-60 ${isLoading || isSynthesizing ? 'animate-pulse' : ''}`} />

        <div className="px-6 md:px-10 py-8 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/50">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-[0.4em]">Synthesis Engine</h3>
            </div>
            <span className="text-[9px] font-mono text-zinc-600 mt-1 uppercase tracking-widest">Active Link // DannyX Protocol v3.2</span>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-700 transition-all active:scale-90"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar">
          {/* Initial State / Audio Context */}
          {!audioFile ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center px-4">
              <div className="p-8 bg-zinc-900/30 rounded-full border border-zinc-900 mb-8 animate-pulse">
                <span className="text-2xl opacity-40 font-mono tracking-tighter">Awaiting Audio</span>
              </div>
              <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-black text-zinc-500 mb-4">Input Required</p>
              <p className="text-[10px] md:text-xs text-zinc-700 max-w-[280px] leading-relaxed font-mono">Upload an audio track in the main dashboard to initialize the synthesis engine.</p>
            </div>
          ) : (
            <>
              {/* Audio Analysis Summary Card in Chat */}
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-[2rem] p-6 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Audio Context Injected</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-[10px] font-mono text-zinc-500">Source: <span className="text-white">{audioFile.name}</span></div>
                  <div className="text-[10px] font-mono text-zinc-500">BPM: <span className="text-white">{analysis?.bpm}</span></div>
                  <div className="text-[10px] font-mono text-zinc-500">Energy: <span className="text-white">{analysis?.energy}</span></div>
                  <div className="text-[10px] font-mono text-zinc-500">Mood: <span className="text-white">{analysis?.moodDescription}</span></div>
                </div>
              </div>

              {/* Sliders for Neural Parameters */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Parametric Injection</span>
                  <div className="h-px flex-1 mx-4 bg-zinc-900" />
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                      <span className="text-zinc-500">Intensity</span>
                      <span className="text-blue-400">{intensity}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={intensity} 
                      onChange={(e) => setIntensity(parseInt(e.target.value))}
                      className="w-full accent-blue-500 h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                      <span className="text-zinc-500">Absurdity</span>
                      <span className="text-purple-400">{absurdity}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={absurdity} 
                      onChange={(e) => setAbsurdity(parseInt(e.target.value))}
                      className="w-full accent-purple-500 h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <button 
                    onClick={executeExpressSynthesis}
                    disabled={isSynthesizing || isLoading}
                    className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-zinc-200 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.05)] disabled:opacity-20"
                  >
                    {isSynthesizing ? 'Rendering Immersive Field...' : 'Engage Express Synthesis'}
                  </button>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="space-y-8">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] px-6 py-4 rounded-[1.5rem] text-[11px] md:text-xs leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user' 
                        ? 'bg-zinc-800 text-white font-medium border border-zinc-700 rounded-tr-none' 
                        : 'bg-zinc-900/50 text-zinc-300 border border-zinc-900 rounded-tl-none font-mono'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}

                {isSynthesizing && (
                  <div className="animate-in fade-in zoom-in-95">
                    <ProcessingHUD isActive={true} baseStatus="EXPRESS SYNTHESIS" />
                  </div>
                )}

                {resultVideoUrl && (
                  <div className="animate-in zoom-in-95 duration-700 space-y-4">
                    <div className="relative group aspect-video bg-black rounded-[2rem] overflow-hidden border border-zinc-800 shadow-2xl">
                      <video src={resultVideoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                      
                      {/* Integrated Logo Watermark */}
                      <div className="absolute top-4 right-6 pointer-events-none group-hover:opacity-100 transition-opacity opacity-60">
                         <div className="text-[10px] md:text-xs font-black tracking-tighter uppercase motion-blur-logo" data-text="DANNYX.ONLINE">DANNYX.ONLINE</div>
                      </div>
                      <div className="absolute bottom-4 right-6 pointer-events-none opacity-40">
                         <div className="text-[8px] font-mono tracking-[0.3em] uppercase">DannyX.online</div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                       <a href={resultVideoUrl} download="dannyx_synthesis.mp4" className="flex-1 py-4 bg-zinc-100 text-black text-center rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all">Download Master</a>
                       <button onClick={() => setResultVideoUrl(null)} className="flex-1 py-4 border border-zinc-800 text-zinc-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">Reset Cell</button>
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-900/30 border border-zinc-800 px-6 py-4 rounded-[1.5rem] rounded-tl-none animate-pulse text-zinc-600 text-[10px] font-mono">
                      DECODING NEURAL INTENT...
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </>
          )}
        </div>
        
        {audioFile && (
          <div className="p-6 md:p-10 bg-zinc-950 border-t border-zinc-900 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Command visual behavior..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 md:px-8 py-4 md:py-5 text-xs md:text-sm focus:outline-none focus:border-blue-500/50 transition-all font-mono text-zinc-300 placeholder:text-zinc-700"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || isSynthesizing || !input.trim()}
                className="absolute right-3 top-3 bottom-3 bg-white text-black px-6 flex items-center justify-center rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-0 shadow-lg active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            <div className="mt-4 flex justify-between items-center px-1">
               <span className="text-[8px] text-zinc-700 uppercase font-black tracking-widest">Synthesis Engine Ready</span>
               <span className="text-[8px] text-zinc-700 font-mono italic">Prompt sculpting enabled</span>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #18181b;
          border-radius: 10px;
        }
      `}} />
    </>
  );
};
