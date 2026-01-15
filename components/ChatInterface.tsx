
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { SynthesisService } from '../services/gemini';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const service = new SynthesisService();
    chatRef.current = service.createFastChat();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'model', text: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl bg-zinc-900/50 border border-zinc-800 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden h-[500px] md:h-[600px] lg:h-[700px] max-h-[70vh] backdrop-blur-xl shadow-2xl">
      <div className="px-6 md:px-8 py-4 md:py-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/30">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
          <h3 className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.4em]">Fast AI Interface</h3>
        </div>
        <span className="text-[8px] md:text-[9px] font-mono text-zinc-500 hidden sm:block">GEMINI-2.5-FLASH-LITE</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center px-4 md:px-10">
            <div className="p-4 md:p-6 bg-zinc-800/20 rounded-full border border-zinc-800/50 mb-6">
              <svg className="w-8 h-8 md:w-10 md:h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-[9px] md:text-[11px] uppercase tracking-[0.3em] font-bold">Fast-Lane Connection Active</p>
            <p className="text-[10px] md:text-xs mt-4 text-zinc-500 max-w-xs leading-relaxed">Low-latency queries enabled. Ask about synthesis dynamics or technical parameters.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 md:px-6 py-3 md:py-4 rounded-[1.2rem] md:rounded-[1.5rem] text-xs md:text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-white text-black font-medium rounded-tr-none' 
                : 'bg-zinc-800 text-zinc-200 border border-zinc-700/50 rounded-tl-none font-mono text-[11px] md:text-xs'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800/50 border border-zinc-700/50 px-4 md:px-6 py-3 md:py-4 rounded-[1.2rem] md:rounded-[1.5rem] rounded-tl-none animate-pulse text-zinc-500 text-[10px] md:text-xs font-mono">
              PROCESSING...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
      
      <div className="p-4 md:p-6 bg-zinc-950/50 border-t border-zinc-800 flex gap-3 md:gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Command the engine..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-5 md:px-8 py-3 md:py-4 text-xs md:text-sm focus:outline-none focus:border-blue-500/50 transition-all font-mono"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="bg-white text-black w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full hover:bg-zinc-200 transition-all disabled:opacity-50 shadow-lg shadow-white/5 active:scale-95 shrink-0"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
      `}} />
    </div>
  );
};
