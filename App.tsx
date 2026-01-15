
import React, { useState, useCallback, useEffect } from 'react';
import { SynthesisState, GlobalWindow, AppMode } from './types';
import { analyzeAudioFile } from './services/audioProcessor';
import { SynthesisService } from './services/gemini';
import { AudioUploader } from './components/AudioUploader';
import { SynthesisDashboard } from './components/SynthesisDashboard';
import { VisualStudio } from './components/VisualStudio';
import { ChatInterface } from './components/ChatInterface';
import { VideoCombiner } from './components/VideoCombiner';
import { NeuralAnalyzer } from './components/NeuralAnalyzer';
import { AboutSection } from './components/AboutSection';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('synthesis');
  const [state, setState] = useState<SynthesisState>({
    isAnalyzing: false,
    isGeneratingPrompt: false,
    isGeneratingSeed: false,
    isSynthesizingVideo: false,
    error: null,
    videoUrl: null,
    seedImageUrl: null,
    prompt: null,
    audioAnalysis: null,
  });

  const [hasApiKey, setHasApiKey] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      const gWin = window as unknown as GlobalWindow;
      if (gWin.aistudio) {
        try {
          const hasKey = await gWin.aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        } catch (e) {
          console.error("Failed to check API key status", e);
        }
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    const gWin = window as unknown as GlobalWindow;
    if (gWin.aistudio) {
      await gWin.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const startSynthesis = async (file: File) => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null, videoUrl: null }));
    try {
      const synthesisService = new SynthesisService();
      const analysis = await analyzeAudioFile(file);
      setState(prev => ({ ...prev, audioAnalysis: analysis, isAnalyzing: false, isGeneratingPrompt: true }));

      const visualPrompt = await synthesisService.generateVisualPrompt(analysis);
      setState(prev => ({ ...prev, prompt: visualPrompt, isGeneratingPrompt: false, isGeneratingSeed: true }));

      const seedImage = await synthesisService.generateSeedImage(visualPrompt);
      setState(prev => ({ ...prev, seedImageUrl: seedImage, isGeneratingSeed: false, isSynthesizingVideo: true }));

      const videoUrlRes = await synthesisService.synthesizeVideo(visualPrompt, seedImage);
      setState(prev => ({ ...prev, videoUrl: videoUrlRes.url, isSynthesizingVideo: false }));
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found.")) {
        setHasApiKey(false);
        handleSelectKey();
      }
      setState(prev => ({ ...prev, error: err.message, isAnalyzing: false, isGeneratingPrompt: false, isGeneratingSeed: false, isSynthesizingVideo: false }));
    }
  };

  const renderContent = () => {
    if (!hasApiKey) return (
      <div className="text-center mt-10 md:mt-20 px-4 max-w-md mx-auto">
        <h2 className="text-xl md:text-2xl font-bold mb-4 uppercase tracking-tighter">Authorization Required</h2>
        <p className="text-zinc-500 text-sm md:text-base mb-8 leading-relaxed">This high-performance engine requires direct access to Veo and Gemini models. Ensure you are using a paid API project.</p>
        <button onClick={handleSelectKey} className="w-full md:w-auto px-12 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-zinc-200 transition-all">Select API Key</button>
      </div>
    );

    switch (mode) {
      case 'visual-studio': return <VisualStudio />;
      case 'neural-chat': return <ChatInterface />;
      case 'combine': return <VideoCombiner />;
      case 'analyzer': return <NeuralAnalyzer />;
      case 'about': return <AboutSection />;
      case 'synthesis':
      default:
        return !audioFile ? (
          <div className="animate-in fade-in zoom-in duration-500 w-full max-w-2xl px-4">
            <AudioUploader onFileSelect={(f) => { setAudioFile(f); startSynthesis(f); }} disabled={state.isAnalyzing} />
          </div>
        ) : (
          <div className="w-full flex flex-col items-center px-4">
             {state.error && <div className="mb-6 w-full max-w-4xl p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 text-xs md:text-sm">Error: {state.error}</div>}
             <SynthesisDashboard state={state} />
             {(state.videoUrl || state.error) && (
               <button onClick={() => { setAudioFile(null); setState(s => ({ ...s, videoUrl: null })); }} className="mt-12 text-zinc-500 hover:text-white transition-colors text-[10px] md:text-sm uppercase tracking-widest font-black py-4 px-8 border border-zinc-800 rounded-full">New Synthesis</button>
             )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 lg:p-12 relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] md:w-[40%] h-[40%] bg-blue-500 rounded-full blur-[100px] md:blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] md:w-[40%] h-[40%] bg-zinc-600 rounded-full blur-[100px] md:blur-[120px] animate-pulse" />
      </div>

      <header className="w-full max-w-7xl flex flex-col items-center mb-12 md:mb-20 gap-10">
        <div className="flex flex-col items-center cursor-pointer group text-center" onClick={() => setMode('synthesis')}>
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white opacity-100 uppercase motion-blur-logo"
            data-text="DANNYX.ONLINE"
          >
            DANNYX.ONLINE
          </h1>
          <span className="text-[8px] md:text-[10px] uppercase tracking-[0.5em] md:tracking-[0.8em] text-zinc-500 font-bold mt-2 group-hover:text-white transition-all duration-500">Integrated Neural Workspace</span>
        </div>
        
        {hasApiKey && (
          <div className="w-full flex flex-col items-center gap-8">
            <nav className="flex bg-zinc-900/50 p-1.5 rounded-full border border-zinc-800/80 backdrop-blur-xl overflow-x-auto no-scrollbar scroll-smooth shadow-2xl shadow-black/50">
              {[
                { id: 'synthesis', label: 'Synthesis' },
                { id: 'combine', label: 'Combine' },
                { id: 'analyzer', label: 'Analyzer' },
                { id: 'visual-studio', label: 'Studio' },
                { id: 'neural-chat', label: 'Fast Chat' }
              ].map((m) => (
                <button 
                  key={m.id}
                  onClick={() => setMode(m.id as AppMode)}
                  className={`whitespace-nowrap px-5 md:px-8 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase transition-all duration-300 ${mode === m.id ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`}
                >
                  {m.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center justify-center gap-8 md:gap-12">
              <button 
                onClick={() => setMode('about')}
                className={`flex items-center gap-3 group transition-all duration-500 ${mode === 'about' ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
              >
                <div className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-500 ${mode === 'about' ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-zinc-800 bg-transparent'}`}>
                  <span className={`text-[11px] font-black font-mono transition-colors ${mode === 'about' ? 'text-purple-400' : 'text-zinc-500'}`}>?</span>
                </div>
                <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${mode === 'about' ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'}`}>About</span>
              </button>

              <div className={`flex items-center gap-3 text-[9px] md:text-[10px] font-mono uppercase font-black tracking-[0.2em] px-4 py-2 bg-zinc-900/30 rounded-full border border-zinc-800/50 ${hasApiKey ? 'text-green-500' : 'text-red-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${hasApiKey ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                <span>{hasApiKey ? 'Neural Active' : 'Offline'}</span>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="w-full max-w-7xl flex justify-center flex-1">
        {renderContent()}
      </main>

      <footer className="mt-16 md:mt-24 pb-10 w-full text-center text-[8px] md:text-[10px] text-zinc-600 uppercase tracking-[0.3em] px-4 opacity-50 font-black">
        &copy; {new Date().getFullYear()} DannyX Laboratories // Kernel V3.2 Stable // Multiscreen Encoded
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default App;
