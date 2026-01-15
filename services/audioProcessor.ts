
import { AudioAnalysis } from '../types';

/**
 * Advanced Audio Processor
 * Extracts spectral and temporal features from an audio file.
 */
export const analyzeAudioFile = async (file: File): Promise<AudioAnalysis> => {
  const arrayBuffer = await file.arrayBuffer();
  
  // Standard Audio Context for initial decode
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;

  // 1. Temporal Features: Energy (RMS) and Zero Crossing Rate (ZCR)
  let sumSquares = 0;
  let zcrCount = 0;
  for (let i = 0; i < channelData.length; i++) {
    sumSquares += channelData[i] * channelData[i];
    if (i > 0 && ((channelData[i] >= 0 && channelData[i - 1] < 0) || (channelData[i] < 0 && channelData[i - 1] >= 0))) {
      zcrCount++;
    }
  }
  const energy = Math.sqrt(sumSquares / channelData.length);
  const zcr = zcrCount / channelData.length;

  // 2. Frequency Band Analysis (Filter Bank)
  // We use OfflineAudioContext to render and measure specific frequency ranges
  const getBandEnergy = async (lowFreq: number, highFreq: number, type: BiquadFilterType): Promise<number> => {
    const offlineCtx = new OfflineAudioContext(1, audioBuffer.length, sampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;

    const filter = offlineCtx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = type === 'bandpass' ? Math.sqrt(lowFreq * highFreq) : (type === 'lowpass' ? highFreq : lowFreq);
    if (type === 'bandpass') filter.Q.value = filter.frequency.value / (highFreq - lowFreq);

    source.connect(filter);
    filter.connect(offlineCtx.destination);
    source.start();

    const renderedBuffer = await offlineCtx.startRendering();
    const data = renderedBuffer.getChannelData(0);
    let bandSum = 0;
    for (let i = 0; i < data.length; i++) bandSum += data[i] * data[i];
    return Math.sqrt(bandSum / data.length);
  };

  const bassEnergy = await getBandEnergy(20, 250, 'lowpass');
  const midEnergy = await getBandEnergy(250, 2500, 'bandpass');
  const highEnergy = await getBandEnergy(2500, 10000, 'highpass');

  // 3. Spectral Centroid Estimation
  // A weighted average based on band energy
  const spectralCentroid = (bassEnergy * 135 + midEnergy * 1375 + highEnergy * 6250) / (bassEnergy + midEnergy + highEnergy + 0.001);

  // 4. Simplified MFCC Summary
  // Log-scaled energy from Mel-spaced bands (approx)
  const mfccSummary = [
    Math.log10(bassEnergy + 0.0001),
    Math.log10(midEnergy + 0.0001),
    Math.log10(highEnergy + 0.0001)
  ];

  // 5. BPM Estimation (Peak counting)
  const threshold = 0.8 * energy;
  let peaks = 0;
  for (let i = 0; i < channelData.length; i++) {
    if (Math.abs(channelData[i]) > threshold) {
      peaks++;
      i += Math.floor(sampleRate * 0.3); // Skip 300ms to avoid double counting same peak
    }
  }
  const bpm = Math.min(220, Math.max(50, (peaks / audioBuffer.duration) * 60));

  // 6. Dominant Range & Mood
  let dominantFrequency = "Midrange";
  if (bassEnergy > midEnergy && bassEnergy > highEnergy) dominantFrequency = "Deep Bass";
  else if (highEnergy > midEnergy) dominantFrequency = "Brilliant Highs";

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
