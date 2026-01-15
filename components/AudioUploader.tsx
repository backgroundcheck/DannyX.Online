
import React, { useRef } from 'react';

interface Props {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const AudioUploader: React.FC<Props> = ({ onFileSelect, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/30 backdrop-blur-sm transition-all hover:border-zinc-500 group">
      <div className="mb-6 p-6 rounded-full bg-zinc-800/50 text-zinc-400 group-hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      </div>
      <h3 className="text-xl font-medium mb-2">Initialize Synthesis</h3>
      <p className="text-zinc-500 text-center max-w-xs mb-8">
        Upload audio to drive the visual field. All motion, texture, and atmosphere will emerge from this input.
      </p>
      <input 
        type="file" 
        accept="audio/*" 
        onChange={handleChange} 
        ref={inputRef} 
        className="hidden" 
        disabled={disabled}
      />
      <button 
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all disabled:opacity-50"
      >
        Select Audio File
      </button>
    </div>
  );
};
