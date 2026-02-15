
import { AudioAnalysis } from '../types';

/**
 * Advanced Audio Processor
 * 
 * Analyzes audio files using Web Audio API to extract comprehensive spectral and temporal features.
 * This module performs multi-dimensional audio analysis including:
 * - Temporal features (RMS energy, Zero-Crossing Rate)
 * - Frequency band analysis (Bass, Mid, High energy distribution)
 * - Spectral characteristics (Centroid, MFCC)
 * - Rhythmic features (BPM estimation)
 * - Perceptual classification (Mood, dominant frequency range)
 * 
 * The extracted features are used to drive visual synthesis parameters,
 * creating audio-reactive video generation with causal relationships between
 * sound characteristics and visual output.
 * 
 * @module audioProcessor
 */

/**
 * Analyzes an audio file and extracts comprehensive audio features.
 * 
 * This function performs the following analysis steps:
 * 1. Decodes audio file into raw PCM data
 * 2. Calculates temporal features (energy, zero-crossing rate)
 * 3. Analyzes frequency distribution across bass/mid/high bands using biquad filters
 * 4. Estimates spectral centroid (brightness)
 * 5. Computes simplified MFCC summary
 * 6. Estimates BPM through peak detection
 * 7. Classifies dominant frequency range and mood
 * 
 * @param {File} file - Audio file to analyze (MP3, WAV, etc.)
 * @returns {Promise<AudioAnalysis>} Comprehensive audio analysis results
 * @throws {Error} If audio decoding fails or file is invalid
 * 
 * @example
 * const audioFile = new File([audioBlob], "track.mp3", { type: "audio/mp3" });
 * const analysis = await analyzeAudioFile(audioFile);
 * console.log(`BPM: ${analysis.bpm}, Energy: ${analysis.energy}`);
 */
export const analyzeAudioFile = async (file: File): Promise<AudioAnalysis> => {
  const arrayBuffer = await file.arrayBuffer();
  
  // Standard Audio Context for initial decode
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const channelData = audioBuffer.getChannelData(0); // Use first channel (mono or left channel)
  const sampleRate = audioBuffer.sampleRate;

  // ========================================
  // 1. Temporal Features: Energy (RMS) and Zero Crossing Rate (ZCR)
  // ========================================
  // RMS Energy: Root Mean Square calculation for overall loudness
  // ZCR: Frequency of signal crossing zero amplitude - higher for noisy/percussive sounds
  let sumSquares = 0;
  let zcrCount = 0;
  for (let i = 0; i < channelData.length; i++) {
    sumSquares += channelData[i] * channelData[i];
    // Count zero crossings (sign changes)
    if (i > 0 && ((channelData[i] >= 0 && channelData[i - 1] < 0) || (channelData[i] < 0 && channelData[i - 1] >= 0))) {
      zcrCount++;
    }
  }
  const energy = Math.sqrt(sumSquares / channelData.length);
  const zcr = zcrCount / channelData.length;

  // ========================================
  // 2. Frequency Band Analysis (Filter Bank)
  // ========================================
  // Uses OfflineAudioContext to render and measure specific frequency ranges
  // This allows us to separate bass, mid, and treble energy independently
  
  /**
   * Measures energy in a specific frequency band using biquad filters.
   * 
   * @param {number} lowFreq - Lower frequency bound in Hz
   * @param {number} highFreq - Upper frequency bound in Hz
   * @param {BiquadFilterType} type - Filter type (lowpass, bandpass, highpass)
   * @returns {Promise<number>} RMS energy in the specified band
   */
  const getBandEnergy = async (lowFreq: number, highFreq: number, type: BiquadFilterType): Promise<number> => {
    const offlineCtx = new OfflineAudioContext(1, audioBuffer.length, sampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;

    // Create and configure biquad filter for frequency isolation
    const filter = offlineCtx.createBiquadFilter();
    filter.type = type;
    // Calculate center frequency for bandpass, or cutoff for lowpass/highpass
    filter.frequency.value = type === 'bandpass' ? Math.sqrt(lowFreq * highFreq) : (type === 'lowpass' ? highFreq : lowFreq);
    // Q factor controls filter bandwidth for bandpass
    if (type === 'bandpass') filter.Q.value = filter.frequency.value / (highFreq - lowFreq);

    source.connect(filter);
    filter.connect(offlineCtx.destination);
    source.start();

    // Render the filtered audio offline
    const renderedBuffer = await offlineCtx.startRendering();
    const data = renderedBuffer.getChannelData(0);
    
    // Calculate RMS energy of filtered signal
    let bandSum = 0;
    for (let i = 0; i < data.length; i++) bandSum += data[i] * data[i];
    return Math.sqrt(bandSum / data.length);
  };

  // Extract energy from three frequency bands
  const bassEnergy = await getBandEnergy(20, 250, 'lowpass');      // Low frequencies (sub-bass to bass)
  const midEnergy = await getBandEnergy(250, 2500, 'bandpass');    // Mid frequencies (vocals, most instruments)
  const highEnergy = await getBandEnergy(2500, 10000, 'highpass'); // High frequencies (cymbals, sibilance)

  // ========================================
  // 3. Spectral Centroid Estimation
  // ========================================
  // Weighted average frequency - indicates "brightness" or "sharpness" of sound
  // Lower centroid = darker, warmer sound; Higher centroid = brighter, sharper sound
  const spectralCentroid = (bassEnergy * 135 + midEnergy * 1375 + highEnergy * 6250) / (bassEnergy + midEnergy + highEnergy + 0.001);

  // ========================================
  // 4. Simplified MFCC Summary
  // ========================================
  // Mel-Frequency Cepstral Coefficients - perceptually-scaled frequency representation
  // Log-scaled energy from Mel-spaced bands (approximation)
  const mfccSummary = [
    Math.log10(bassEnergy + 0.0001),
    Math.log10(midEnergy + 0.0001),
    Math.log10(highEnergy + 0.0001)
  ];

  // ========================================
  // 5. BPM Estimation (Peak Counting)
  // ========================================
  // Detects transient peaks in the audio signal to estimate tempo
  const threshold = 0.8 * energy; // Adaptive threshold based on signal energy
  let peaks = 0;
  for (let i = 0; i < channelData.length; i++) {
    if (Math.abs(channelData[i]) > threshold) {
      peaks++;
      i += Math.floor(sampleRate * 0.3); // Skip 300ms to avoid double-counting the same peak
    }
  }
  // Convert peak frequency to BPM, clamp to reasonable range (50-220 BPM)
  const bpm = Math.min(220, Math.max(50, (peaks / audioBuffer.duration) * 60));

  // ========================================
  // 6. Dominant Range & Mood Classification
  // ========================================
  // Determine which frequency band dominates
  let dominantFrequency = "Midrange";
  if (bassEnergy > midEnergy && bassEnergy > highEnergy) dominantFrequency = "Deep Bass";
  else if (highEnergy > midEnergy) dominantFrequency = "Brilliant Highs";

  // Classify mood based on multiple audio features
  let mood = "Neutral";
  if (energy > 0.25 && zcr > 0.1) mood = "Harsh, aggressive, and industrial";
  else if (energy < 0.08 && zcr < 0.05) mood = "Ethereal, oceanic, and minimal";
  else if (bpm > 130) mood = "Urgent, driving, and kinetic";
  else mood = "Fluid, atmospheric, and organic";

  return {
    bpm: Math.round(bpm),
    energy: parseFloat(energy.toFixed(4)),
    zcr: parseFloat(zcr.toFixed(4)),
    spectralCentroid: Math.round(spectralCentroid),
    bassEnergy: parseFloat(bassEnergy.toFixed(4)),
    midEnergy: parseFloat(midEnergy.toFixed(4)),
    highEnergy: parseFloat(highEnergy.toFixed(4)),
    mfccSummary,
    dominantFrequency,
    moodDescription: mood
    // Fix: Removed 'roughness' property as it is not part of the AudioAnalysis interface.
  };
};
