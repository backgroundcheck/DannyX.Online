
import React, { useState, useRef, useEffect } from 'react';
import { SynthesisService } from '../services/gemini';
import { ProcessingHUD } from './ProcessingHUD';
import { AudioAnalysis } from '../types';

interface Props {
  analysis: AudioAnalysis | null;
}

export const VisualStudio: React.FC<Props> = ({ analysis }) => {
  const [prompt, setPrompt] = useState('');
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [isRefined, setIsRefined] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [orientation, setOrientation] = useState<'16:9' | '9:16'>('16:9');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [lastRawVideo, setLastRawVideo] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [auditResults, setAuditResults] = useState<string | null>(null);
  const [type, setType] = useState<'image' | 'video'>('image');
  
  // Neural Parameters for Suggester
  const [intensity, setIntensity] = useState(50);
  const [absurdity, setAbsurdity] = useState(25);

  const [targetLength, setTargetLength] = useState(8); 
  const [encodingQuality, setEncodingQuality] = useState<'720p' | '1080p'>('1080p');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const service = useRef(new SynthesisService());

  const ratios = ['1:1', '3:4', '4:3', '9:16', '16:9'];

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('dannyx_prompt_history');
    if (saved) setPromptHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (newPrompt: string) => {
    if (!newPrompt.trim()) return;
    const updated = [newPrompt, ...promptHistory.filter(h => h !== newPrompt)].slice(0, 8);
    setPromptHistory(updated);
    localStorage.setItem('dannyx_prompt_history', JSON.stringify(updated));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !uploadedImage) return;
    setIsProcessing(true);
    setResultUrl(null);
    setAuditResults(null);
    saveToHistory(prompt);
    
    try {
      if (type === 'image') {
        const url = await service.current.generateSeedImage(prompt, aspectRatio);
        setResultUrl(url);
      } else {
        const res = await service.current.synthesizeVideo(prompt, uploadedImage || undefined, orientation, encodingQuality);
        let finalUrl = res.url;
        let currentRaw = res.rawVideo;

        if (targetLength > 8) {
          const extension = await service.current.extendVideo(currentRaw, prompt);
          finalUrl = extension.url;
          currentRaw = extension.rawVideo;
        }

        setResultUrl(finalUrl);
        setLastRawVideo(currentRaw);
      }
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNeuralSuggest = async () => {
    if (!analysis) {
      alert("No audio context detected. Upload audio in the dashboard first.");
      return;
    }
    setIsSuggesting(true);
    try {
      const suggestedPrompt = await service.current.generateExpressPrompt(analysis, intensity, absurdity);
      setPrompt(suggestedPrompt);
      saveToHistory(suggestedPrompt);
    } catch (err: any) {
      alert(`Suggestion failed: ${err.message}`);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAudit = async () => {
    if (!resultUrl || type !== 'video') return;
    setIsAuditing(true);
    try {
      const report = await service.current.auditVideoStability(resultUrl);
      setAuditResults(report);
    } catch (err: any) {
      alert(`Audit failed: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleApplyRefinement = async () => {
    if (!prompt || !auditResults) return;
    setIsRefining(true);
    try {
      const newPrompt = await service.current.refineSynthesisPrompt(prompt, auditResults);
      setPrompt(newPrompt);
      setIsRefined(true);
      setAuditResults(null);
      saveToHistory(newPrompt);
    } catch (err: any) {
      alert(`Refinement failed: ${err.message}`);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 animate-in fade-in duration-700 px-4">
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 backdrop-blur-xl">
        <h2 className="text-lg md:text-xl font-bold mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <span className="w-2 md:w-2.5 h-2 md:h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
             Neural Parameters
          </div>
          <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-600">Refinery v2.2</span>
        </h2>

        <div className="space-y-6 md:space-y-8">
          <div className="flex bg-zinc-950 p-1 rounded-full border border-zinc-800">
            <button onClick={() => setType('image')} className={`flex-1 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${type === 'image' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Image Gen</button>
            <button onClick={() => setType('video')} className={`flex-1 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${type === 'video' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Video Gen</button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[9px] md:text-[10px] font-mono uppercase tracking-widest">
                  <span className="text-zinc-500">Intensity</span>
                  <span className="text-blue-400">{intensity}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={intensity} 
                  onChange={(e) => setIntensity(parseInt(e.target.value))}
                  className="w-full accent-blue-500 h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[9px] md:text-[10px] font-mono uppercase tracking-widest">
                  <span className="text-zinc-500">Absurdity</span>
                  <span className="text-purple-400">{absurdity}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={absurdity} 
                  onChange={(e) => setAbsurdity(parseInt(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black">Atmospheric Prompt</label>
                <div className="flex items-center gap-3">
                  {isRefined && (
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-[7px] md:text-[8px] font-black uppercase tracking-widest animate-in fade-in zoom-in">Neuraly Refined</span>
                  )}
                  <button 
                    onClick={handleNeuralSuggest}
                    disabled={isSuggesting || !analysis}
                    className="flex items-center gap-2 px-3 py-1 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-700/50 transition-all text-[8px] md:text-[9px] font-black uppercase tracking-widest disabled:opacity-20 active:scale-95"
                  >
                    <span className={isSuggesting ? 'animate-spin' : ''}>✨</span>
                    {isSuggesting ? 'Thinking...' : 'Neural Suggest'}
                  </button>
                </div>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => { setPrompt(e.target.value); setIsRefined(false); }}
                placeholder="Inject visual descriptions or use Neural Suggest..."
                className="w-full h-24 md:h-32 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs md:text-sm focus:outline-none focus:border-purple-500/50 transition-all resize-none font-mono leading-relaxed"
              />
              
              {/* Prompt History List */}
              {promptHistory.length > 0 && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[8px] uppercase tracking-[0.3em] text-zinc-600 font-black">Latent Recalls</span>
                    <div className="h-px flex-1 bg-zinc-800/50" />
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {promptHistory.map((h, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(h)}
                        className="flex-shrink-0 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-mono text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all max-w-[120px] truncate"
                      >
                        {h}
                      </button>
                    ))}
                    <button 
                      onClick={() => { setPromptHistory([]); localStorage.removeItem('dannyx_prompt_history'); }}
                      className="flex-shrink-0 px-3 py-1.5 border border-red-900/20 text-red-900/40 text-[8px] font-black uppercase tracking-widest hover:text-red-500 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {type === 'video' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-3">Target Duration</label>
                <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  <button onClick={() => setTargetLength(8)} className={`flex-1 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase ${targetLength === 8 ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Standard (8s)</button>
                  <button onClick={() => setTargetLength(15)} className={`flex-1 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase ${targetLength === 15 ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Extended (15s)</button>
                </div>
              </div>
              <div>
                <label className="block text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-3">Encoding Quality</label>
                <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  <button onClick={() => setEncodingQuality('720p')} className={`flex-1 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase ${encodingQuality === '720p' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>720p</button>
                  <button onClick={() => setEncodingQuality('1080p')} className={`flex-1 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase ${encodingQuality === '1080p' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>1080p</button>
                </div>
              </div>
            </div>
          )}

          {type === 'video' && (
            <div>
              <label className="block text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-3">Seed Reference</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group cursor-pointer relative aspect-video bg-zinc-950 border border-zinc-800 border-dashed rounded-2xl overflow-hidden flex items-center justify-center transition-all hover:border-zinc-500"
              >
                {uploadedImage ? (
                  <>
                    <img src={uploadedImage} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-opacity">Swap Stream</div>
                  </>
                ) : (
                  <span className="text-zinc-600 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-zinc-400">Upload Reference</span>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-4">
              Canvas Calibration
            </label>
            {type === 'image' ? (
              <div className="grid grid-cols-5 gap-2">
                {ratios.map(r => (
                  <button
                    key={r}
                    onClick={() => setAspectRatio(r)}
                    className={`py-2 md:py-3 text-[9px] md:text-[10px] border rounded-lg md:rounded-xl font-black transition-all ${aspectRatio === r ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-4">
                <button onClick={() => setOrientation('16:9')} className={`flex-1 py-3 md:py-4 text-[9px] md:text-[10px] border rounded-xl md:rounded-2xl font-black uppercase tracking-widest ${orientation === '16:9' ? 'bg-white text-black' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>Landscape</button>
                <button onClick={() => setOrientation('9:16')} className={`flex-1 py-3 md:py-4 text-[9px] md:text-[10px] border rounded-xl md:rounded-2xl font-black uppercase tracking-widest ${orientation === '9:16' ? 'bg-white text-black' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>Portrait</button>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isProcessing}
            className="w-full py-4 md:py-5 bg-white text-black font-black uppercase tracking-widest text-[10px] md:text-[11px] rounded-full hover:bg-zinc-200 transition-all disabled:opacity-50 shadow-xl shadow-white/5"
          >
            {isProcessing ? 'System Busy' : resultUrl ? 'Re-Synthesize' : `Execute ${type} Gen`}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden relative flex flex-col items-center justify-center min-h-[300px] md:min-h-[500px] shadow-2xl shadow-black">
          {isProcessing || isRefining ? (
            <div className="w-full px-6 md:px-8">
              <ProcessingHUD isActive={isProcessing || isRefining} baseStatus={isRefining ? "Refinement Protocol" : `${type.toUpperCase()} GEN`} />
            </div>
          ) : resultUrl ? (
            <div className="w-full h-full relative group flex flex-col">
              <div className="flex-1 relative flex items-center justify-center bg-black">
                {type === 'image' ? (
                  <img src={resultUrl} className="w-full h-full object-contain" />
                ) : (
                  <video src={resultUrl} controls autoPlay loop className="w-full h-full object-contain" />
                )}
                
                <div className="absolute top-4 right-6 pointer-events-none">
                  <div 
                    className="px-2 py-0.5 font-black text-[10px] md:text-sm tracking-tighter uppercase motion-blur-logo"
                    data-text="DANNYX.ONLINE"
                  >
                    DANNYX.ONLINE
                  </div>
                </div>
              </div>

              {auditResults && (
                <div className="absolute inset-0 bg-black/95 p-6 md:p-8 overflow-y-auto animate-in fade-in slide-in-from-top-4 z-50">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-500 rounded-full animate-pulse" />
                       <h3 className="text-xs md:text-sm font-black text-purple-400 uppercase tracking-widest">Neural Audit Report</h3>
                    </div>
                    <button onClick={() => setAuditResults(null)} className="text-zinc-500 hover:text-white uppercase text-[8px] md:text-[9px] font-black">Close Audit</button>
                  </div>
                  
                  <div className="prose prose-invert prose-xs font-mono text-zinc-400 whitespace-pre-wrap mb-10 leading-relaxed border-l border-zinc-800 pl-4 md:pl-6 text-[10px] md:text-xs">
                    {auditResults}
                  </div>

                  <div className="flex flex-col gap-3">
                     <button 
                      onClick={handleApplyRefinement}
                      className="w-full py-4 bg-purple-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-500 transition-all shadow-lg shadow-purple-900/20"
                     >
                       Apply Heuristic Refinement
                     </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-zinc-900 uppercase font-black text-4xl md:text-6xl transform -rotate-12 opacity-50 select-none pointer-events-none text-center px-6">Awaiting Output</div>
          )}
        </div>
        
        {resultUrl && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={resultUrl} download={`dannyx_studio_${Date.now()}.${type === 'image' ? 'png' : 'mp4'}`} className="flex-1 py-4 bg-zinc-100 text-black text-center rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all">Download Master</a>
              {type === 'video' && (
                <button 
                  onClick={handleAudit} 
                  disabled={isAuditing}
                  className="flex-1 py-4 border border-purple-500/50 text-purple-400 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:bg-purple-500/10 transition-all disabled:opacity-30"
                >
                  {isAuditing ? 'Auditing...' : 'Neural Audit'}
                </button>
              )}
            </div>
            <button onClick={() => { setResultUrl(null); setLastRawVideo(null); setAuditResults(null); setIsRefined(false); }} className="w-full py-4 border border-zinc-800 text-zinc-500 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:text-white hover:bg-zinc-800 transition-all">Purge Session</button>
          </div>
        )}
      </div>
    </div>
  );
};
