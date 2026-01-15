
import React, { useState, useRef } from 'react';
import { SynthesisService } from '../services/gemini';
import { ProcessingHUD } from './ProcessingHUD';

export const NeuralAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const service = new SynthesisService();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setAnalysis(null);
    }
  };

  const executeAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setStatus(`SCANNING ${file.type.toUpperCase()}...`);
    try {
      const result = await service.analyzeMedia(file);
      setAnalysis(result);
    } catch (err: any) {
      alert(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 px-4">
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-purple-500/10 rounded-xl md:rounded-2xl border border-purple-500/20">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter">Media Perception</h2>
              <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Deep Understanding Engine</p>
            </div>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative aspect-video rounded-2xl md:rounded-3xl border-2 border-dashed transition-all cursor-pointer group flex items-center justify-center overflow-hidden
              ${preview ? 'border-zinc-700 bg-black' : 'border-zinc-800 hover:border-purple-500/50 bg-zinc-950/50'}`}
          >
            {preview ? (
              <>
                {file?.type.startsWith('video') ? (
                  <video src={preview} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <img src={preview} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white">Replace Media</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 text-zinc-600 group-hover:text-zinc-400">
                <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em]">Initialize Input</span>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />
          </div>

          <div className="mt-10">
            <button
              onClick={executeAnalysis}
              disabled={!file || isAnalyzing}
              className="w-full py-4 md:py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] rounded-full hover:bg-zinc-200 transition-all disabled:opacity-20 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              {isAnalyzing ? 'Processing Visual Latents...' : 'Run Neural Analysis'}
            </button>
            <p className="mt-4 text-center text-[8px] md:text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Powered by Gemini 3 Pro Multi-Modal Perception</p>
          </div>
        </div>

        {isAnalyzing && (
          <div className="px-4">
            <ProcessingHUD isActive={isAnalyzing} baseStatus={status} />
          </div>
        )}
      </div>

      <div className="flex flex-col min-h-[400px] md:min-h-[500px]">
        <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-scan z-10 opacity-40" />
          
          <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar">
            {!analysis ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-800 text-center opacity-40">
                <div className="w-px h-16 md:h-20 bg-gradient-to-b from-transparent via-zinc-800 to-transparent mb-6" />
                <span className="text-[8px] md:text-[10px] uppercase tracking-[0.6em] font-black">Awaiting Semantic Data</span>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-700">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-8">
                  <span className="text-[9px] md:text-[10px] font-black text-purple-400 uppercase tracking-[0.5em]">Neural Readout v3.0</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 bg-green-500 rounded-full animate-ping" style={{ animationDelay: `${i * 0.2}s` }} />)}
                  </div>
                </div>
                <div className="prose prose-invert prose-xs md:prose-sm max-w-none text-zinc-400 font-mono leading-relaxed text-[11px] md:text-sm">
                  {analysis.split('\n').map((line, i) => (
                    <p key={i} className="mb-4">
                      {line.startsWith('-') || line.startsWith('*') ? (
                        <span className="text-zinc-200">{line}</span>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #18181b;
          border-radius: 10px;
        }
      `}} />
    </div>
  );
};
