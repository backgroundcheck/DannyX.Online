# API Documentation

This document provides detailed information about the APIs and services used in DannyX.Online.

## Table of Contents

1. [Google AI Services](#google-ai-services)
2. [Service Methods](#service-methods)
3. [Audio Analysis API](#audio-analysis-api)
4. [Type Definitions](#type-definitions)
5. [Error Handling](#error-handling)
6. [Rate Limits & Quotas](#rate-limits--quotas)
7. [Best Practices](#best-practices)

---

## Google AI Services

DannyX.Online uses the Google GenAI SDK to interact with multiple AI models.

### Required Models

| Model | Identifier | Purpose | Access |
|-------|-----------|---------|--------|
| Gemini 3 Pro | `gemini-3-pro-preview` | Text generation, prompt engineering, analysis | Paid API |
| Gemini 3 Pro Image | `gemini-3-pro-image-preview` | Seed image generation | Paid API |
| Veo 3.1 | `veo-3.1-generate-preview` | Video synthesis | Paid API |
| Gemini 2.5 Flash Lite | `gemini-2.5-flash-lite` | Fast chat responses | Standard API |

### Authentication

**Environment Setup:**
```bash
# .env.local
GEMINI_API_KEY=your_api_key_here
```

**Code Usage:**
```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
```

**AI Studio Integration:**
```typescript
const hasKey = await window.aistudio.hasSelectedApiKey();
if (!hasKey) {
  await window.aistudio.openSelectKey();
}
```

---

## Service Methods

### SynthesisService Class

#### Constructor

```typescript
const service = new SynthesisService();
```

No parameters required. Service is stateless.

---

### generateExpressPrompt()

Generates a Veo-optimized prompt from audio analysis data.

**Signature:**
```typescript
async generateExpressPrompt(
  analysis: AudioAnalysis, 
  intensity: number, 
  absurdity: number
): Promise<string>
```

**Parameters:**
- `analysis` (AudioAnalysis): Audio analysis results from `analyzeAudioFile()`
- `intensity` (number): Visual intensity multiplier, 0-100
- `absurdity` (number): Surrealism/abstraction level, 0-100

**Returns:**
- `Promise<string>`: Generated prompt text optimized for Veo 3.1

**Example:**
```typescript
const service = new SynthesisService();
const prompt = await service.generateExpressPrompt(
  audioAnalysis, 
  75,  // 75% intensity
  50   // 50% absurdity
);
console.log(prompt);
// "Organic fluid textures pulsating at 128 BPM..."
```

**API Model:** `gemini-3-pro-preview`

**System Instruction:** Uses comprehensive system role defining audio-visual causality principles

---

### generateSeedImage()

Creates an initial visual frame for video synthesis.

**Signature:**
```typescript
async generateSeedImage(
  prompt: string, 
  aspectRatio: string = "16:9"
): Promise<string>
```

**Parameters:**
- `prompt` (string): Text description for image generation
- `aspectRatio` (string, optional): Aspect ratio, default `"16:9"`. Also supports `"9:16"`, `"1:1"`, etc.

**Returns:**
- `Promise<string>`: Data URL of generated image (base64 PNG)

**Example:**
```typescript
const imageUrl = await service.generateSeedImage(
  "Organic purple and blue fluid forms with deep shadows",
  "16:9"
);
// Returns: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
```

**API Model:** `gemini-3-pro-image-preview`

**Configuration:**
```typescript
{
  imageConfig: {
    aspectRatio: "16:9",
    imageSize: "1K" // 1024px on longest side
  }
}
```

---

### synthesizeVideo()

Generates video using Veo 3.1 model.

**Signature:**
```typescript
async synthesizeVideo(
  prompt: string, 
  imageBase64?: string, 
  orientation: '16:9' | '9:16' = '16:9', 
  resolution: '720p' | '1080p' = '1080p'
): Promise<{url: string, rawVideo: any, aspectRatio: string}>
```

**Parameters:**
- `prompt` (string): Text description for video generation
- `imageBase64` (string, optional): Base64-encoded seed image (with or without data URI prefix)
- `orientation` ('16:9' | '9:16', optional): Video aspect ratio, default `'16:9'`
- `resolution` ('720p' | '1080p', optional): Video resolution, default `'1080p'`

**Returns:**
- `Promise<object>`: Object containing:
  - `url` (string): Blob URL for video playback
  - `rawVideo` (any): Raw video metadata from API
  - `aspectRatio` (string): Confirmed aspect ratio

**Example:**
```typescript
const result = await service.synthesizeVideo(
  "Flowing organic textures in deep blue...",
  seedImageBase64,
  '16:9',
  '1080p'
);

// Play video
videoElement.src = result.url;

// For extension later
const rawVideo = result.rawVideo;
```

**API Model:** `veo-3.1-generate-preview`

**Configuration:**
```typescript
{
  numberOfVideos: 1,
  resolution: '1080p',
  aspectRatio: '16:9'
}
```

**Process:**
1. Submit generation request to Veo API
2. Receive operation ID
3. Poll every 10 seconds for completion
4. Download video when ready
5. Create blob URL for playback

**Duration:** Typically 2-5 minutes

---

### extendVideo()

Extends an existing 8-second video to ~15 seconds.

**Signature:**
```typescript
async extendVideo(
  previousVideo: any, 
  prompt: string
): Promise<{url: string, rawVideo: any}>
```

**Parameters:**
- `previousVideo` (any): Raw video object from previous `synthesizeVideo()` call
- `prompt` (string): Continuation prompt describing desired motion evolution

**Returns:**
- `Promise<object>`: Object containing:
  - `url` (string): Blob URL for extended video
  - `rawVideo` (any): Raw video metadata

**Example:**
```typescript
const extended = await service.extendVideo(
  previousVideoRaw,
  "Continue the organic flow with increasing turbulence and deeper colors"
);
```

**API Model:** `veo-3.1-generate-preview`

**Note:** Extension maintains visual consistency with original clip

---

### auditVideoStability()

Analyzes video for temporal artifacts and quality issues.

**Signature:**
```typescript
async auditVideoStability(videoUrl: string): Promise<string>
```

**Parameters:**
- `videoUrl` (string): URL of video to audit (blob URL or HTTP URL)

**Returns:**
- `Promise<string>`: Detailed stability audit report

**Example:**
```typescript
const audit = await service.auditVideoStability(videoUrl);
console.log(audit);
// "Analysis: Video shows excellent temporal stability. 
//  No scene cuts detected. Motion is fluid throughout..."
```

**API Model:** `gemini-3-pro-preview`

**Analysis Focus:**
- Flickering detection
- Scene cuts (forbidden in synthesis)
- Motion coherence
- Temporal artifacts
- Lighting consistency

---

### refineSynthesisPrompt()

Improves a prompt based on stability audit feedback.

**Signature:**
```typescript
async refineSynthesisPrompt(
  originalPrompt: string, 
  auditReport: string
): Promise<string>
```

**Parameters:**
- `originalPrompt` (string): Original Veo prompt
- `auditReport` (string): Stability audit analysis from `auditVideoStability()`

**Returns:**
- `Promise<string>`: Refined prompt with stability improvements

**Example:**
```typescript
const refinedPrompt = await service.refineSynthesisPrompt(
  originalPrompt,
  "Detected temporal instability at 3-4s mark with rapid scaling"
);
```

**API Model:** `gemini-3-pro-preview`

---

### fuseVideos()

Merges multiple video prompts into a unified synthesis.

**Signature:**
```typescript
async fuseVideos(videoPrompts: string[]): Promise<string>
```

**Parameters:**
- `videoPrompts` (string[]): Array of individual video prompt descriptions

**Returns:**
- `Promise<string>`: Unified master synthesis prompt

**Example:**
```typescript
const masterPrompt = await service.fuseVideos([
  "Deep blue organic flows with soft undulations",
  "Purple crystalline structures emerging from darkness",
  "Turbulent golden waves with high energy"
]);
```

**API Model:** `gemini-3-pro-preview`

**Use Case:** Multi-stream video fusion (VideoCombiner component)

---

### createFastChat()

Creates a low-latency chat interface.

**Signature:**
```typescript
createFastChat(): Chat
```

**Returns:**
- `Chat`: Configured chat instance

**Example:**
```typescript
const chat = service.createFastChat();

const response = await chat.sendMessage(
  "Explain the BPM analysis in detail"
);
console.log(response.text);
```

**API Model:** `gemini-2.5-flash-lite`

**System Instruction:** Inherits synthesis engine system role + terminal interface persona

---

### analyzeMedia()

Analyzes uploaded images or videos.

**Signature:**
```typescript
async analyzeMedia(
  file: File, 
  prompt: string = "Extract visual dynamics."
): Promise<string>
```

**Parameters:**
- `file` (File): Image or video file to analyze
- `prompt` (string, optional): Custom analysis instruction

**Returns:**
- `Promise<string>`: Detailed analysis report

**Example:**
```typescript
const analysis = await service.analyzeMedia(
  videoFile,
  "Describe the color palette, motion patterns, and overall aesthetic"
);
```

**API Model:** `gemini-3-pro-preview`

**Supported Formats:**
- Images: JPEG, PNG, WebP, GIF
- Videos: MP4, WebM, MOV

---

## Audio Analysis API

### analyzeAudioFile()

Standalone function that performs comprehensive audio analysis.

**Signature:**
```typescript
async analyzeAudioFile(file: File): Promise<AudioAnalysis>
```

**Parameters:**
- `file` (File): Audio file (MP3, WAV, OGG, etc.)

**Returns:**
- `Promise<AudioAnalysis>`: Comprehensive analysis object

**Example:**
```typescript
import { analyzeAudioFile } from './services/audioProcessor';

const audioFile = new File([blob], "track.mp3", { type: "audio/mp3" });
const analysis = await analyzeAudioFile(audioFile);

console.log({
  bpm: analysis.bpm,
  energy: analysis.energy,
  mood: analysis.moodDescription
});
```

**Analysis Process:**

1. **Audio Decoding**
   - Uses Web Audio API's `AudioContext.decodeAudioData()`
   - Converts to PCM samples

2. **Temporal Features**
   - RMS Energy: `sqrt(sum(samples^2) / length)`
   - Zero-Crossing Rate: Sign changes per sample

3. **Frequency Analysis**
   - Bass Energy (20-250 Hz): Lowpass filter
   - Mid Energy (250-2500 Hz): Bandpass filter  
   - High Energy (2500-10000 Hz): Highpass filter
   - Uses `OfflineAudioContext` with `BiquadFilter`

4. **Spectral Centroid**
   - Weighted average frequency
   - Formula: `(bass*135 + mid*1375 + high*6250) / (bass + mid + high)`

5. **MFCC Approximation**
   - Log-scaled energy: `[log10(bass), log10(mid), log10(high)]`

6. **BPM Estimation**
   - Peak detection with adaptive threshold
   - Frequency to BPM conversion
   - Range: 50-220 BPM

7. **Classification**
   - Dominant frequency range (bass/mid/high)
   - Mood categorization (4 classes)

**Performance:**
- Typical processing time: 0.5-2 seconds
- Memory: ~2MB per minute of audio
- Browser support: Chrome 25+, Firefox 25+, Safari 14+

---

## Type Definitions

### AudioAnalysis

```typescript
interface AudioAnalysis {
  bpm: number;                    // Beats per minute (50-220)
  energy: number;                 // RMS energy (0.0-1.0+)
  zcr: number;                    // Zero-crossing rate
  spectralCentroid: number;       // Weighted frequency (Hz)
  bassEnergy: number;             // Bass band energy
  midEnergy: number;              // Mid band energy
  highEnergy: number;             // High band energy
  mfccSummary: number[];          // Log-scaled energy distribution
  dominantFrequency: string;      // "Deep Bass" | "Midrange" | "Brilliant Highs"
  moodDescription: string;        // Mood classification
}
```

### SynthesisState

```typescript
interface SynthesisState {
  isAnalyzing: boolean;           // Audio analysis in progress
  isGeneratingPrompt: boolean;    // Prompt generation in progress
  isGeneratingSeed: boolean;      // Seed image generation in progress
  isSynthesizingVideo: boolean;   // Video synthesis in progress
  error: string | null;           // Error message if any step fails
  videoUrl: string | null;        // Blob URL of generated video
  seedImageUrl: string | null;    // Data URL of seed image
  prompt: string | null;          // Generated Veo prompt
  audioAnalysis: AudioAnalysis | null; // Analysis results
}
```

### AppMode

```typescript
type AppMode = 
  | 'synthesis'      // Main audio-to-video synthesis
  | 'visual-studio'  // Manual generation workspace
  | 'combine'        // Multi-stream fusion
  | 'analyzer'       // Media perception tool
  | 'about';         // Feature documentation
```

### ChatMessage

```typescript
interface ChatMessage {
  role: 'user' | 'model';  // Message sender
  text: string;            // Message content
}
```

---

## Error Handling

### Common Errors

#### 1. API Key Not Found

```typescript
Error: "Requested entity was not found."
```

**Cause:** Invalid API key or insufficient permissions

**Solution:**
```typescript
if (err.message?.includes("Requested entity was not found.")) {
  setHasApiKey(false);
  await window.aistudio.openSelectKey();
}
```

#### 2. Audio Decoding Failed

```typescript
Error: "DOMException: Unable to decode audio data"
```

**Cause:** Corrupted file or unsupported format

**Solution:** Validate file format before processing

#### 3. Video Generation Timeout

```typescript
Error: "Video synthesis failed."
```

**Cause:** API timeout or service unavailable

**Solution:** Implement retry logic with exponential backoff

#### 4. Quota Exceeded

```typescript
Error: "Quota exceeded for quota metric..."
```

**Cause:** API rate limit reached

**Solution:** Implement request throttling and user feedback

---

### Error Handling Pattern

```typescript
try {
  const result = await service.synthesizeVideo(prompt);
  setState(prev => ({ ...prev, videoUrl: result.url }));
} catch (err: any) {
  console.error("Synthesis error:", err);
  
  // Specific error handling
  if (err.message?.includes("not found")) {
    handleAuthError();
  } else if (err.message?.includes("quota")) {
    showQuotaExceededMessage();
  } else {
    // Generic error
    setState(prev => ({ 
      ...prev, 
      error: `Synthesis failed: ${err.message}` 
    }));
  }
}
```

---

## Rate Limits & Quotas

### Default Quotas (As of 2026)

| Model | Requests/Day | Requests/Minute |
|-------|-------------|-----------------|
| Gemini 3 Pro | 50,000 | 1,000 |
| Gemini 3 Pro Image | 1,000 | 10 |
| Veo 3.1 | 100 | 2 |
| Gemini 2.5 Flash Lite | 100,000 | 2,000 |

**Note:** Actual quotas depend on your Google Cloud project tier

### Best Practices

1. **Implement Retry Logic**
   ```typescript
   async function retryWithBackoff(fn: Function, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (err) {
         if (i === maxRetries - 1) throw err;
         await new Promise(r => setTimeout(r, 2 ** i * 1000));
       }
     }
   }
   ```

2. **Cache Results**
   - Store audio analysis results
   - Reuse prompts for similar inputs
   - Cache seed images

3. **User Feedback**
   - Show progress indicators
   - Display estimated wait times
   - Provide clear error messages

4. **Optimize Requests**
   - Batch operations when possible
   - Use appropriate model for task
   - Minimize redundant API calls

---

## Best Practices

### 1. Audio Analysis

- **File Size**: Keep files under 5 minutes for optimal performance
- **Format**: Use MP3 or WAV for best compatibility
- **Quality**: Higher bitrate provides more accurate analysis

### 2. Prompt Engineering

- **Specificity**: Be detailed about visual elements
- **Continuity**: Emphasize smooth transitions
- **Stability**: Include stability constraints in prompts

### 3. Video Synthesis

- **Seed Images**: Use seed images for better control
- **Aspect Ratio**: Match video orientation to use case
- **Resolution**: Use 1080p for final output, 720p for testing

### 4. Error Recovery

- **Graceful Degradation**: Provide fallback options
- **User Guidance**: Explain errors in plain language
- **Retry Options**: Allow users to retry failed operations

### 5. Performance

- **Lazy Loading**: Load components on demand
- **Debouncing**: Debounce user inputs for API calls
- **Cleanup**: Revoke blob URLs when no longer needed

---

## SDK Reference

For complete SDK documentation, see:
- [Google GenAI SDK Documentation](https://ai.google.dev/api)
- [Veo API Reference](https://ai.google.dev/gemini-api/docs/veo)
- [Gemini API Reference](https://ai.google.dev/api/rest)

---

## Support

For API-specific issues:
- Check [Google AI Studio](https://aistudio.google.com/)
- Review [API Status Page](https://status.cloud.google.com/)
- Contact Google Cloud Support

For application issues:
- See [README.md](./README.md)
- Review [ARCHITECTURE.md](./ARCHITECTURE.md)
- Open an issue in the repository
