
import React, { useState, useRef } from 'react';
import { SynthesisService } from '../services/gemini';
import { ProcessingHUD } from './ProcessingHUD';

export const VisualStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [orientation, setOrientation] = useState<'16:9' | '9:16'>('16:9');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [lastRawVideo, setLastRawVideo] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResults, setAuditResults] = useState<string | null>(null);
  const [type, setType] = useState<'image' | 'video'>('image');
  
  // Refinement Parameters
  const [targetLength, setTargetLength] = useState(8); // 8s or 15s
  const [encodingQuality, setEncodingQuality] = useState<'720p' | '1080p'>('1080p');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const service = new SynthesisService();

  const ratios = ['1:1', '3:4', '4:3', '9:16', '16:9'];

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
    try {
      if (type === 'image') {
        const url = await service.generateSeedImage(prompt, aspectRatio);
        setResultUrl(url);
      } else {
        // Initial Generation
        const res = await service.synthesizeVideo(prompt, uploadedImage || undefined, orientation, encodingQuality);
        let finalUrl = res.url;
        let currentRaw = res.rawVideo;

        // Temporal Extension if requested length > 8s
        if (targetLength > 8) {
          const extension = await service.extendVideo(currentRaw, prompt);
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

  const handleAudit = async () => {
    if (!resultUrl || type !== 'video') return;
    setIsAuditing(true);
    try {
      const report = await service.auditVideoStability(resultUrl);
      setAuditResults(report);
    } catch (err: any) {
      alert(`Audit failed: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-700">
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-10 backdrop-blur-xl">
        <h2 className="text-xl font-bold mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <span className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
             Neural Parameters
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Refinery v2.1</span>
        </h2>

        <div className="space-y-6">
          <div className="flex bg-zinc-950 p-1 rounded-full border border-zinc-800">
            <button onClick={() => setType('image')} className={`flex-1 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${type === 'image' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Image Gen</button>
            <button onClick={() => setType('video')} className={`flex-1 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${type === 'video' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Video Gen</button>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-3">Atmospheric Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Inject visual descriptions..."
              className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all resize-none font-mono"
            />
          </div>

          {type === 'video' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-3">Target Duration</label>
                <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  <button onClick={() => setTargetLength(8)} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase ${targetLength === 8 ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Standard (8s)</button>
                  <button onClick={() => setTargetLength(15)} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase ${targetLength === 15 ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Extended (15s)</button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-3">Encoding Quality</label>
                <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  <button onClick={() => setEncodingQuality('720p')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase ${encodingQuality === '720p' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>720p</button>
                  <button onClick={() => setEncodingQuality('1080p')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase ${encodingQuality === '1080p' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>1080p</button>
                </div>
              </div>
            </div>
          )}

          {type === 'video' && (
            <div>
              <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-3">Seed Reference</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group cursor-pointer relative aspect-video bg-zinc-950 border border-zinc-800 border-dashed rounded-2xl overflow-hidden flex items-center justify-center transition-all hover:border-zinc-500"
              >
                {uploadedImage ? (
                  <>
                    <img src={uploadedImage} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest transition-opacity">Swap Stream</div>
                  </>
                ) : (
                  <span className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-zinc-400">Upload Reference</span>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-4">
              Canvas Calibration
            </label>
            {type === 'image' ? (
              <div className="grid grid-cols-5 gap-2">
                {ratios.map(r => (
                  <button
                    key={r}
                    onClick={() => setAspectRatio(r)}
                    className={`py-3 text-[10px] border rounded-xl font-black transition-all ${aspectRatio === r ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-4">
                <button onClick={() => setOrientation('16:9')} className={`flex-1 py-4 text-[10px] border rounded-2xl font-black uppercase tracking-widest ${orientation === '16:9' ? 'bg-white text-black' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>Landscape</button>
                <button onClick={() => setOrientation('9:16')} className={`flex-1 py-4 text-[10px] border rounded-2xl font-black uppercase tracking-widest ${orientation === '9:16' ? 'bg-white text-black' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>Portrait</button>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isProcessing}
            className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-full hover:bg-zinc-200 transition-all disabled:opacity-50 shadow-xl shadow-white/5"
          >
            {isProcessing ? 'System Busy' : resultUrl ? 'Re-Synthesize' : `Execute ${type} Gen`}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-[2.5rem] overflow-hidden relative flex flex-col items-center justify-center min-h-[500px] shadow-2xl shadow-black">
          {isProcessing ? (
            <div className="w-full px-8">
              <ProcessingHUD isActive={isProcessing} baseStatus={`${type.toUpperCase()} GEN`} />
            </div>
          ) : resultUrl ? (
            <div className="w-full h-full relative group flex flex-col">
              <div className="flex-1 relative">
                {type === 'image' ? (
                  <img src={resultUrl} className="w-full h-full object-contain" />
                ) : (
                  <video src={resultUrl} controls autoPlay loop className="w-full h-full object-contain" />
                )}
                
                <div className="absolute top-6 right-8 pointer-events-none">
                  <div 
                    className="px-3 py-1 font-black text-sm tracking-tighter uppercase motion-blur-logo"
                    data-text="DANNYX.ONLINE"
                  >
                    DANNYX.ONLINE
                  </div>
                </div>
              </div>

              {auditResults && (
                <div className="absolute inset-0 bg-black/90 p-8 overflow-y-auto animate-in fade-in slide-in-from-top-4 z-50">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black text-purple-400 uppercase tracking-widest">Neural Audit Report</h3>
                    <button onClick={() => setAuditResults(null)} className="text-zinc-500 hover:text-white uppercase text-[9px] font-black">Close Audit</button>
                  </div>
                  <div className="prose prose-invert prose-xs font-mono text-zinc-400 whitespace-pre-wrap">
                    {auditResults}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-zinc-900 uppercase font-black text-6xl transform -rotate-12 opacity-50 select-none pointer-events-none">Awaiting Output</div>
          )}
        </div>
        
        {resultUrl && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4">
            <div className="flex gap-4">
              <a href={resultUrl} download={`dannyx_studio_${Date.now()}.${type === 'image' ? 'png' : 'mp4'}`} className="flex-1 py-4 bg-zinc-100 text-black text-center rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all">Download Master</a>
              {type === 'video' && (
                <button 
                  onClick={handleAudit} 
                  disabled={isAuditing}
                  className="flex-1 py-4 border border-purple-500/50 text-purple-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-purple-500/10 transition-all disabled:opacity-30"
                >
                  {isAuditing ? 'Auditing...' : 'Neural Audit'}
                </button>
              )}
            </div>
            <button onClick={() => { setResultUrl(null); setLastRawVideo(null); setAuditResults(null); }} className="w-full py-4 border border-zinc-800 text-zinc-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:text-white hover:bg-zinc-800 transition-all">Purge Session</button>
          </div>
        )}
      </div>
    </div>
  );
};
