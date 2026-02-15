/**
 * Represents the result of audio analysis performed on an uploaded audio file.
 * Contains temporal, spectral, and perceptual features extracted from the audio signal.
 */
export interface AudioAnalysis {
  /** Estimated tempo in beats per minute (BPM), typically 50-220 */
  bpm: number;
  
  /** Root Mean Square (RMS) energy level, indicating overall loudness (0.0 - 1.0+) */
  energy: number;
  
  /** Zero-Crossing Rate - frequency of signal sign changes, correlates with noisiness */
  zcr: number;
  
  /** Spectral Centroid in Hz - weighted mean frequency, indicates "brightness" of sound */
  spectralCentroid: number;
  
  /** Energy in bass frequency range (20-250 Hz) */
  bassEnergy: number;
  
  /** Energy in mid frequency range (250-2500 Hz) */
  midEnergy: number;
  
  /** Energy in high frequency range (2500-10000 Hz) */
  highEnergy: number;
  
  /** Simplified Mel-Frequency Cepstral Coefficients - log-scaled energy distribution */
  mfccSummary: number[];
  
  /** Description of dominant frequency range (e.g., "Deep Bass", "Midrange", "Brilliant Highs") */
  dominantFrequency: string;
  
  /** Estimated mood classification based on audio features (e.g., "Ethereal, oceanic, and minimal") */
  moodDescription: string;
}

/**
 * Represents the current state of the synthesis pipeline.
 * Tracks progress through audio analysis, prompt generation, seed creation, and video synthesis.
 */
export interface SynthesisState {
  /** Whether audio analysis is currently in progress */
  isAnalyzing: boolean;
  
  /** Whether the system is generating a visual prompt from audio analysis */
  isGeneratingPrompt: boolean;
  
  /** Whether a seed image is being generated */
  isGeneratingSeed: boolean;
  
  /** Whether video synthesis with Veo is in progress */
  isSynthesizingVideo: boolean;
  
  /** Error message if any step fails, null otherwise */
  error: string | null;
  
  /** Object URL of the generated video, null if not yet generated */
  videoUrl: string | null;
  
  /** Data URL of the seed image, null if not yet generated */
  seedImageUrl: string | null;
  
  /** Generated Veo prompt text, null if not yet generated */
  prompt: string | null;
  
  /** Results of audio analysis, null if not yet analyzed */
  audioAnalysis: AudioAnalysis | null;
}

/**
 * Application operational modes.
 * - synthesis: Main audio-to-video synthesis dashboard
 * - visual-studio: Manual text-to-image/video workspace
 * - combine: Multi-stream video fusion interface
 * - analyzer: Media perception and analysis tool
 * - about: Information and feature documentation
 */
export type AppMode = 'synthesis' | 'visual-studio' | 'combine' | 'analyzer' | 'about';

/**
 * Represents a single message in the chat interface.
 */
export interface ChatMessage {
  /** The role of the message sender - either user or AI model */
  role: 'user' | 'model';
  
  /** The text content of the message */
  text: string;
}

/**
 * Extended Window interface for AI Studio integration.
 * Provides access to AI Studio-specific APIs when running in that environment.
 */
export interface GlobalWindow extends Window {
  /** AI Studio API object for key management and studio integration */
  aistudio: any;
}
