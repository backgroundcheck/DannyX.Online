
import React from 'react';

export const AboutSection: React.FC = () => {
  const features = [
    {
      title: "Audio-Reactive Synthesis Engine",
      description: "Analyzes uploaded audio files to extract technical metadata (BPM, Energy, Spectral Centroid, and Mood) which is then used to autonomously engineer visual prompts."
    },
    {
      title: "High-Fidelity Visual Studio",
      description: "A dedicated workspace for manual control over Text-to-Image and Text-to-Video generation, supporting multiple aspect ratios and 1080p encoding."
    },
    {
      title: "Temporal Extension Protocol",
      description: "Seamlessly extends 8-second video clips into 15-second cinematic sequences using the Veo extension API."
    },
    {
      title: "Neural Stability Audit",
      description: "Employs Gemini 3 Pro to perform deep-frame analysis on generated videos, scoring them for temporal artifacts and motion coherence."
    },
    {
      title: "Multi-Stream Fusion",
      description: "Merges the aesthetics, textures, and dynamics of up to 10 separate video inputs into a single, cohesive master synthesis."
    },
    {
      title: "Media Perception (Neural Analyzer)",
      description: "A sophisticated multi-modal scanning tool that extracts semantic information and technical breakdowns from uploaded images or videos."
    },
    {
      title: "Fast Neural Interface",
      description: "A low-latency, high-speed chat interface powered by Gemini 2.5 Flash Lite for technical queries and engine commands."
    },
    {
      title: "Dynamic Fluid Waveform",
      description: "A real-time visual overlay that reacts to the energy and frequency data of the synthesized audio, integrated directly into the visual field."
    }
  ];

  return (
    <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-[3rem] p-12 md:p-20 backdrop-blur-2xl relative overflow-hidden">
        {/* Aesthetic accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <header className="mb-16">
            <div className="flex items-center gap-4 mb-6">
               <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
               <span className="text-[10px] font-black uppercase tracking-[0.8em] text-zinc-500">System Dossier</span>
               <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight mb-8">
              The Architecture of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600">Visual Resonance.</span>
            </h2>
            
            <div className="max-w-3xl space-y-6">
              <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-light">
                DannyX is a high-end, integrated neural workspace designed for advanced audiovisual synthesis. It serves as a bridge between technical audio data and immersive generative media, leveraging the latest <span className="text-white font-medium">Gemini 3</span> and <span className="text-white font-medium">Veo 3.1</span> models to transform sound into complex, organic visual landscapes.
              </p>
              <p className="text-sm md:text-base text-zinc-500 leading-relaxed italic">
                The application features a cinematic, terminal-inspired aesthetic with high-fidelity HUDs and motion-blurred chromatic branding, emphasizing its identity as a <span className="text-zinc-300">"Neural Laboratory."</span>
              </p>
            </div>
          </header>

          <section>
            <div className="flex items-center gap-4 mb-12">
               <h3 className="text-xs font-black uppercase tracking-[0.4em] text-purple-400">Integrated Protocols</h3>
               <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {features.map((feature, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-start gap-4">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-purple-500 group-hover:shadow-[0_0_8px_rgba(168,85,247,0.8)] transition-all duration-500" />
                    <div>
                      <h4 className="text-sm font-black text-zinc-200 uppercase tracking-widest mb-2 group-hover:text-white transition-colors">{feature.title}</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed font-mono tracking-tight group-hover:text-zinc-400 transition-colors">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer className="mt-20 pt-12 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600">Core Engine</span>
              <span className="text-xs font-mono text-zinc-400">DANNYX.OS // KERNEL V3.2.1-STABLE</span>
            </div>
            <div className="flex gap-4">
               <div className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Neural Sync Active</span>
               </div>
               <div className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Veo 3.1 Link Ready</span>
               </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
