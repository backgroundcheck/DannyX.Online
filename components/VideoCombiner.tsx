
import React, { useState, useRef } from 'react';
import { SynthesisService } from '../services/gemini';
import { ProcessingHUD } from './ProcessingHUD';

interface VideoFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface UploadStatus {
  fileName: string;
  progress: number;
  status: string;
}

export const VideoCombiner: React.FC = () => {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [progressText, setProgressText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const service = new SynthesisService();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (videos.length + files.length > 10) {
      alert("Maximum 10 videos allowed.");
      return;
    }

    setIsUploading(true);
    const newStatuses: UploadStatus[] = files.map(f => ({
      fileName: f.name,
      progress: 0,
      status: 'Awaiting'
    }));
    setUploadStatuses(newStatuses);

    const processedVideos: VideoFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      setUploadStatuses(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'Initializing...', progress: 10 } : s
      ));

      await new Promise<void>((resolve) => {
        let p = 10;
        const int = setInterval(() => {
          p += Math.random() * 15;
          if (p >= 100) {
            p = 100;
            clearInterval(int);
            resolve();
          }
          setUploadStatuses(prev => prev.map((s, idx) => 
            idx === i ? { ...s, progress: p, status: p < 100 ? 'Streaming Data...' : 'Ingested' } : s
          ));
        }, 150);
      });

      const videoObj = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl: URL.createObjectURL(file)
      };
      processedVideos.push(videoObj);
    }

    setVideos(prev => [...prev, ...processedVideos]);
    setIsUploading(false);
    setUploadStatuses([]);
    setResultUrl(null);
    setIsConfirmed(false);
  };

  const removeVideo = (id: string) => {
    setVideos(prev => {
      const filtered = prev.filter(v => v.id !== id);
      const removed = prev.find(v => v.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return filtered;
    });
  };

  const handleCombine = async () => {
    if (videos.length < 2) {
      alert("Select at least 2 videos to combine.");
      return;
    }

    setIsProcessing(true);
    setResultUrl(null);
    setIsConfirmed(false);
    setProgressText('Multi-Stream Fusion');

    try {
      const descriptions = videos.map((v, i) => 
        `Segment ${i+1}: Source "${v.file.name}". Integrated aesthetics extraction.`
      );
      
      const fusionPrompt = await service.fuseVideos(descriptions);
      const seedImage = await service.generateSeedImage(fusionPrompt);
      const finalVideo = await service.synthesizeVideo(fusionPrompt, seedImage);
      // Fixed: finalVideo is {url, rawVideo, aspectRatio}, we need the url string.
      setResultUrl(finalVideo.url);
    } catch (err: any) {
      alert(`Synthesis Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAndDownload = () => {
    if (!resultUrl) return;
    setIsConfirmed(true);
    
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `DANNYX_FUSION_${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const overallUploadProgress = uploadStatuses.length > 0 
    ? Math.floor(uploadStatuses.reduce((acc, curr) => acc + curr.progress, 0) / uploadStatuses.length)
    : 0;

  return (
    <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {!resultUrl ? (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-10 backdrop-blur-xl">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                <span className="w-3 h-3 bg-purple-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(147,51,234,0.5)]" />
                Multi-Stream Fusion
              </h2>
              <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-[0.3em] font-bold">Neural Combination Protocol | Max 10 Inputs</p>
            </div>
            {!isProcessing && !isUploading && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-3 bg-zinc-800/50 text-zinc-300 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 hover:text-white transition-all border border-zinc-700/50 backdrop-blur-md"
              >
                Add Data Stream
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="video/*" 
              multiple 
              className="hidden" 
            />
          </div>

          {isUploading && (
            <div className="mb-10 space-y-6 animate-in fade-in zoom-in duration-500">
               <div className="bg-zinc-950/50 border border-zinc-800 p-6 rounded-3xl">
                  <div className="flex justify-between items-end mb-4">
                     <span className="text-[10px] text-purple-400 font-black uppercase tracking-[0.3em]">Total Ingestion Progress</span>
                     <span className="text-white font-mono text-xs">{overallUploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                     <div 
                        className="h-full bg-gradient-to-r from-purple-600 to-white transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                        style={{ width: `${overallUploadProgress}%` }}
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadStatuses.map((status, i) => (
                    <div key={i} className="bg-zinc-800/20 border border-zinc-800/50 p-4 rounded-2xl flex flex-col">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] text-zinc-400 font-mono uppercase truncate max-w-[70%]">{status.fileName}</span>
                          <span className="text-[9px] text-purple-300 font-bold uppercase tracking-widest">{status.status}</span>
                       </div>
                       <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 transition-all duration-300"
                            style={{ width: `${status.progress}%` }}
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {isProcessing ? (
            <div className="py-12">
              <ProcessingHUD isActive={isProcessing} baseStatus={progressText} />
            </div>
          ) : !isUploading && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 min-h-[200px]">
              {videos.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="col-span-full h-64 border-2 border-dashed border-zinc-800/50 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-zinc-600 hover:bg-zinc-800/10 transition-all group"
                >
                  <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-zinc-600 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </div>
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.4em]">Initialize Input Array</span>
                </div>
              ) : (
                <>
                  {videos.map((v) => (
                    <div key={v.id} className="relative aspect-[4/5] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 group shadow-lg">
                      <video src={v.previewUrl} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100" muted />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                      <button 
                        onClick={() => removeVideo(v.id)}
                        className="absolute top-3 right-3 w-8 h-8 bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 active:scale-95"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                      <div className="absolute bottom-3 left-3 right-3 flex flex-col">
                         <span className="text-[8px] text-zinc-400 font-mono uppercase tracking-tighter truncate">{v.file.name}</span>
                         <div className="h-0.5 bg-zinc-800 w-full mt-1 rounded-full overflow-hidden">
                           <div className="h-full bg-purple-500/50 w-full" />
                         </div>
                      </div>
                    </div>
                  ))}
                  {videos.length < 10 && (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-[4/5] border-2 border-dashed border-zinc-800/50 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-zinc-800/30 hover:border-zinc-700 transition-all group"
                    >
                      <span className="text-2xl text-zinc-700 group-hover:text-zinc-500 group-hover:scale-125 transition-all">+</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {!isProcessing && !isUploading && (
            <div className="mt-12 flex flex-col items-center">
              <button
                onClick={handleCombine}
                disabled={isProcessing || videos.length < 2}
                className="group relative px-16 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-full hover:bg-zinc-200 transition-all disabled:opacity-20 shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden"
              >
                <div className="relative z-10">Execute Fusion Synthesis</div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </button>
              {videos.length > 0 && (
                <p className="mt-4 text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Estimated Processing Time: 120s - 300s</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8 animate-in zoom-in-95 duration-1000">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-10 backdrop-blur-xl">
             <div className="flex justify-between items-end mb-8">
                <div>
                   <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Master Sequence Review</h2>
                   <p className="text-[10px] text-purple-400 font-bold uppercase tracking-[0.3em] mt-2">Neural Fusion Finalized | Metadata Encoded</p>
                </div>
                <div className="flex gap-2">
                   {videos.map((v, i) => (
                      <div key={v.id} className="w-8 h-8 rounded-md overflow-hidden border border-zinc-800 grayscale hover:grayscale-0 transition-all opacity-40 hover:opacity-100 cursor-help" title={v.file.name}>
                        <video src={v.previewUrl} className="w-full h-full object-cover" muted />
                      </div>
                   ))}
                </div>
             </div>

             <div className="relative group rounded-[2rem] overflow-hidden border-2 border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] bg-black">
                <video src={resultUrl} controls autoPlay loop className="w-full aspect-video" />
                
                <div className="absolute top-5 left-6 pointer-events-none opacity-60 scale-[0.6] origin-top-left transition-opacity group-hover:opacity-90">
                  <div 
                    className="px-3 py-1 font-black text-xs tracking-tighter uppercase motion-blur-logo bg-black/20 backdrop-blur-sm rounded-sm"
                    data-text="DANNYX.ONLINE"
                  >
                    DANNYX.ONLINE
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 pointer-events-none opacity-60 scale-[0.6] origin-bottom-right transition-opacity group-hover:opacity-90">
                  <span 
                    className="text-[10px] font-mono tracking-[0.4em] uppercase bg-black/50 px-3 py-1.5 backdrop-blur-xl rounded border border-white/10 motion-blur-logo"
                    data-text="DANNYX.ONLINE"
                  >
                    DANNYX.ONLINE
                  </span>
                </div>

                <div className="absolute top-5 right-6 flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/5 opacity-50">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[8px] text-white font-mono uppercase">Master 1080p</span>
                </div>
             </div>

             <div className="mt-12 flex flex-col items-center">
                <div className="flex gap-6 w-full max-md:max-w-md">
                   <button
                    onClick={handleConfirmAndDownload}
                    className={`flex-1 py-5 bg-green-500 text-white font-black uppercase tracking-widest text-[11px] rounded-full hover:bg-green-400 transition-all shadow-[0_20px_40px_rgba(34,197,94,0.15)] flex items-center justify-center gap-3 ${isConfirmed ? 'opacity-50 cursor-default' : 'hover:-translate-y-1'}`}
                   >
                     {isConfirmed ? "Transferring" : "Confirm & Retrieve"}
                   </button>
                   
                   <button 
                    onClick={() => { setVideos([]); setResultUrl(null); setIsConfirmed(false); }}
                    className="flex-1 py-5 border border-zinc-800 text-zinc-500 uppercase font-black tracking-widest text-[11px] hover:text-white hover:bg-zinc-800 transition-all rounded-full"
                   >
                    Purge & Reset
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
