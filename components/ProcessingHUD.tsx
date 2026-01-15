
import React, { useState, useEffect } from 'react';

interface Props {
  isActive: boolean;
  baseStatus: string;
}

const STATUS_MESSAGES = [
  "Harmonizing spectral harmonics (High Fidelity)...",
  "Mapping visual latent space (Deep Neural Scan)...",
  "Synthesizing ultra-dense textures...",
  "Injecting fluid dynamic metadata...",
  "Optimizing 1080p pixel coherence...",
  "Calibrating neural visual weights (Pro Engine)...",
  "Structuring atmospheric layers...",
  "Rendering volumetric light fields...",
  "Finalizing master metadata injection...",
  "Encoding optimal visual stream..."
];

export const ProcessingHUD: React.FC<Props> = ({ isActive, baseStatus }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    let interval: number;
    if (isActive) {
      setProgress(0);
      setStatusIndex(0);
      
      // Simulated progress bar logic - slower for high quality
      interval = window.setInterval(() => {
        setProgress(prev => {
          if (prev < 30) return prev + 0.4; // Slower progress
          if (prev < 70) return prev + 0.2;
          if (prev < 90) return prev + 0.05;
          if (prev < 98) return prev + 0.01;
          return prev;
        });
      }, 100);

      // Rotating status updates
      const statusInterval = window.setInterval(() => {
        setStatusIndex(prev => (prev + 1) % STATUS_MESSAGES.length);
      }, 5000);

      return () => {
        window.clearInterval(interval);
        window.clearInterval(statusInterval);
      };
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="w-full max-w-lg mx-auto bg-zinc-900/60 border border-white/5 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-500">
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-purple-400 font-black uppercase tracking-[0.3em] mb-1">
            {baseStatus}
          </span>
          <h4 className="text-white text-sm font-mono transition-all duration-700 animate-pulse">
            {STATUS_MESSAGES[statusIndex]}
          </h4>
        </div>
        <span className="text-white font-mono text-xs font-bold">
          {Math.floor(progress)}%
        </span>
      </div>

      <div className="relative w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 via-white to-purple-400 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(168,85,247,0.5)]"
          style={{ width: `${progress}%` }}
        />
        <div 
          className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
          style={{ left: `${progress - 10}%` }}
        />
      </div>

      <div className="mt-6 flex justify-between items-center opacity-40">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i} 
              className={`w-1 h-3 rounded-full ${i < (progress / 20) ? 'bg-purple-500' : 'bg-zinc-800'}`} 
            />
          ))}
        </div>
        <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-black flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
          High-Fidelity Link Active
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(1000%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}} />
    </div>
  );
};
