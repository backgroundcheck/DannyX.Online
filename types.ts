
export interface AudioAnalysis {
  bpm: number;
  energy: number;
  zcr: number;
  spectralCentroid: number;
  bassEnergy: number;
  midEnergy: number;
  highEnergy: number;
  mfccSummary: number[];
  dominantFrequency: string;
  moodDescription: string;
}

export interface SynthesisState {
  isAnalyzing: boolean;
  isGeneratingPrompt: boolean;
  isGeneratingSeed: boolean;
  isSynthesizingVideo: boolean;
  error: string | null;
  videoUrl: string | null;
  seedImageUrl: string | null;
  prompt: string | null;
  audioAnalysis: AudioAnalysis | null;
}

export type AppMode = 'synthesis' | 'visual-studio' | 'neural-chat' | 'combine' | 'analyzer' | 'about';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface GlobalWindow extends Window {
  aistudio: any;
}
