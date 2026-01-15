
import React, { useMemo } from 'react';
import { SynthesisState } from '../types';
import { ProcessingHUD } from './ProcessingHUD';

interface Props {
  state: SynthesisState;
}

export const SynthesisDashboard: React.FC<Props> = ({ state }) => {
  const { isAnalyzing, isGeneratingPrompt, isGeneratingSeed, isSynthesizingVideo, audioAnalysis, prompt } = state;

  const isBusy = isAnalyzing || isGeneratingPrompt || isGeneratingSeed || isSynthesizingVideo;

  const steps = [
    { id: 'analysis', label: 'Audio Analysis', active: isAnalyzing, done: !!audioAnalysis },
    { id: 'prompt', label: 'Neural Prompting', active: isGeneratingPrompt, done: !!prompt },
    { id: 'seed', label: 'Seed Generation', active: isGeneratingSeed, done: !!state.seedImageUrl },
    { id: 'video', label: 'Video Synthesis', active: isSynthesizingVideo, done: !!state.videoUrl },
  ];

  // Derive dynamic styles from audio analysis
  const dynamicStyles = useMemo(() => {
    if (!audioAnalysis) return {};
    
    const bpmDuration = 60 / (audioAnalysis.bpm || 120);
    const energyScale = Math.max(0.5, audioAnalysis.energy * 3);
    const hueShift = (audioAnalysis.spectralCentroid / 5000) * 360;
    
    return {
      '--bpm-duration': `${bpmDuration}s`,
      '--energy-scale': energyScale,
      '--centroid-hue': `${hueShift}deg`,
      '--wave-opacity': Math.min(0.6, 0.2 + audioAnalysis.energy),
    } as React.CSSProperties;
  }, [audioAnalysis]);

  return (
    <div className="w-full max-w-4xl bg-zinc-900/40 border border-zinc-800 rounded-[2rem] md:rounded-3xl p-6 md:p-8 backdrop-blur-md" style={dynamicStyles}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 md:mb-10">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center">
            <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full mb-2 md:mb-3 ${step.done ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : step.active ? 'bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-zinc-700'}`} />
            <span className={`text-[8px] md:text-[10px] text-center uppercase tracking-widest font-black ${step.active || step.done ? 'text-white' : 'text-zinc-600'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {isBusy && !state.videoUrl && (
        <div className="mb-8 md:mb-10">
          <ProcessingHUD 
            isActive={isBusy} 
            baseStatus={isSynthesizingVideo ? "Master Synthesis" : "Neural Initialization"} 
          />
        </div>
      )}

      {audioAnalysis && !isBusy && !state.videoUrl && (
        <div className="mb-8 md:mb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4">
          <StatBox label="BPM" value={audioAnalysis.bpm} />
          <StatBox label="Energy" value={audioAnalysis.energy} />
          <StatBox label="Spectral Centroid" value={`${audioAnalysis.spectralCentroid}Hz`} />
          <StatBox label="ZCR (Noisiness)" value={audioAnalysis.zcr} />
          <StatBox label="Dominant Band" value={audioAnalysis.dominantFrequency} />
          <StatBox label="Est. Mood" value={audioAnalysis.moodDescription} />
        </div>
      )}

      {state.videoUrl && (
        <div className="animate-in fade-in zoom-in duration-700">
           <div className="relative group rounded-2xl md:rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl shadow-zinc-500/10 bg-black">
              <video 
                src={state.videoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-auto aspect-video"
              />
              
              {/* Branded watermarks */}
              <div className="absolute top-2 right-4 md:top-4 md:right-8 pointer-events-none z-20">
                <div 
                  className="px-2 md:px-3 py-0.5 md:py-1 font-black text-[10px] md:text-sm tracking-tighter uppercase motion-blur-logo opacity-60 group-hover:opacity-100 transition-opacity"
                  data-text="DANNYX.ONLINE"
                >
                  DANNYX.ONLINE
                </div>
              </div>
              
              {/* Dynamic Fluid Waveform Overlay */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 flex items-end">
                <div className="absolute inset-0 bg-purple-500/5 mix-blend-overlay animate-pulse-bpm opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <svg className="w-full h-24 md:h-48 opacity-[var(--wave-opacity)] group-hover:opacity-80 transition-opacity duration-1000 filter hue-rotate-[var(--centroid-hue)]" viewBox="0 0 1000 100" preserveAspectRatio="none">
                  <path 
                    className="fluid-path path-1" 
                    d="M0,70 C150,20 350,100 500,70 C650,40 850,120 1000,70 V100 H0 Z" 
                    fill="url(#waveGradient1)"
                  />
                  <path 
                    className="fluid-path path-2" 
                    d="M0,60 C200,90 400,30 600,60 C800,90 900,10 1000,60 V100 H0 Z" 
                    fill="url(#waveGradient2)"
                  />
                  <path 
                    className="fluid-path path-3" 
                    d="M0,80 C250,50 500,110 750,80 C1000,50 1000,80 1000,80 V100 H0 Z" 
                    fill="url(#waveGradient3)"
                  />
                  
                  <defs>
                    <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(168, 85, 247, 0.6)" />
                      <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                    </linearGradient>
                    <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
                      <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                    </linearGradient>
                    <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                      <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
           </div>
           
           <div className="mt-8 flex justify-center">
              <a 
                href={state.videoUrl} 
                download="dannyx_synthesis.mp4"
                className="w-full sm:w-auto px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-xs md:text-sm hover:bg-zinc-200 transition-all rounded-full shadow-lg text-center"
              >
                Download Synthesis
              </a>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bpm-duration: 0.5s;
          --energy-scale: 1;
          --centroid-hue: 0deg;
          --wave-opacity: 0.3;
        }

        .fluid-path {
          animation: fluidMotion var(--bpm-duration) ease-in-out infinite alternate;
          filter: blur(8px);
          mix-blend-mode: screen;
          transform-origin: bottom;
          transform: scaleY(var(--energy-scale));
        }

        .path-1 { animation-duration: calc(var(--bpm-duration) * 4.3); animation-delay: -1s; }
        .path-2 { animation-duration: calc(var(--bpm-duration) * 5.7); animation-delay: -3s; }
        .path-3 { animation-duration: calc(var(--bpm-duration) * 3.1); animation-delay: -5s; }

        @keyframes fluidMotion {
          0% { transform: translateY(5px) scaleY(calc(var(--energy-scale) * 0.85)) scaleX(1); }
          50% { transform: translateY(-10px) scaleY(calc(var(--energy-scale) * 1.15)) scaleX(1.02); }
          100% { transform: translateY(5px) scaleY(calc(var(--energy-scale) * 0.95)) scaleX(0.98); }
        }

        .animate-pulse-bpm {
          animation: pulse-bpm var(--bpm-duration) ease-in-out infinite;
        }

        @keyframes pulse-bpm {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.15; }
        }
      `}} />
    </div>
  );
};

const StatBox = ({ label, value }: { label: string, value: string | number }) => (
  <div className="bg-zinc-800/30 p-3 md:p-4 border border-zinc-800 rounded-xl">
    <div className="text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-black">{label}</div>
    <div className="text-sm md:text-lg lg:text-xl font-mono text-white overflow-hidden text-ellipsis whitespace-nowrap">{value}</div>
  </div>
);
