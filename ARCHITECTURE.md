# DannyX.Online Architecture Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Application Architecture](#application-architecture)
4. [Data Flow](#data-flow)
5. [Component Hierarchy](#component-hierarchy)
6. [Service Layer](#service-layer)
7. [Audio Analysis Pipeline](#audio-analysis-pipeline)
8. [Video Synthesis Pipeline](#video-synthesis-pipeline)
9. [State Management](#state-management)
10. [API Integration](#api-integration)
11. [Performance Considerations](#performance-considerations)
12. [Security](#security)

---

## System Overview

DannyX.Online is a React-based single-page application (SPA) that transforms audio files into immersive video content using Google's Gemini and Veo AI models. The application operates entirely client-side, with direct API communication to Google's AI services.

### High-Level Architecture

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│        React Application (SPA)          │
│  ┌───────────────────────────────────┐  │
│  │   UI Components Layer             │  │
│  │   (Dashboard, Studio, etc.)       │  │
│  └───────────┬───────────────────────┘  │
│              ↓                           │
│  ┌───────────────────────────────────┐  │
│  │   Service Layer                   │  │
│  │   - Audio Processor               │  │
│  │   - Synthesis Service             │  │
│  └───────────┬───────────────────────┘  │
│              ↓                           │
│  ┌───────────────────────────────────┐  │
│  │   Web APIs                        │  │
│  │   - Web Audio API                 │  │
│  │   - FileReader API                │  │
│  └───────────────────────────────────┘  │
└─────────────┬───────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────┐
│   Google AI Services                    │
│   - Gemini 3 Pro                        │
│   - Gemini 3 Pro Image                  │
│   - Veo 3.1                             │
│   - Gemini 2.5 Flash Lite               │
└─────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

- **React 19.2**: Component-based UI framework
- **TypeScript 5.8**: Type-safe JavaScript
- **Vite 6.2**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS (inline)

### Browser APIs

- **Web Audio API**: Audio decoding and analysis
- **OfflineAudioContext**: Frequency band analysis
- **FileReader API**: File upload handling
- **Blob API**: Video download functionality

### AI Services

- **Google GenAI SDK (@google/genai 1.36.0)**
  - Gemini 3 Pro: Text generation and analysis
  - Gemini 3 Pro Image: Seed image generation
  - Veo 3.1: Video synthesis
  - Gemini 2.5 Flash Lite: Fast chat responses

---

## Application Architecture

### Architectural Patterns

1. **Component-Based Architecture**: React components for UI modularity
2. **Service-Oriented Architecture**: Separation of business logic into services
3. **Unidirectional Data Flow**: Props down, events up
4. **Async/Await Pattern**: Promise-based asynchronous operations
5. **Event-Driven**: User interactions trigger state changes

### Directory Structure

```
DannyX.Online/
├── components/               # React UI Components
│   ├── AboutSection.tsx     # Feature documentation
│   ├── AudioUploader.tsx    # File upload interface
│   ├── ChatInterface.tsx    # Neural command chat
│   ├── NeuralAnalyzer.tsx   # Media analysis tool
│   ├── ProcessingHUD.tsx    # Status display
│   ├── SynthesisDashboard.tsx # Main synthesis UI
│   ├── VideoCombiner.tsx    # Multi-stream fusion
│   └── VisualStudio.tsx     # Manual generation workspace
│
├── services/                 # Business Logic
│   ├── audioProcessor.ts    # Audio analysis engine
│   └── gemini.ts            # AI service integration
│
├── App.tsx                  # Root component & routing
├── types.ts                 # TypeScript definitions
├── index.tsx                # Application entry point
├── index.html               # HTML template
├── vite.config.ts           # Build configuration
└── tsconfig.json            # TypeScript configuration
```

---

## Data Flow

### Synthesis Pipeline Flow

```
1. User uploads audio file
         ↓
2. AudioProcessor analyzes file
   - Extract temporal features (BPM, energy, ZCR)
   - Analyze frequency bands (bass/mid/high)
   - Calculate spectral centroid
   - Estimate mood
         ↓
3. SynthesisService generates prompt
   - Transform audio data to visual description
   - Apply intensity/absurdity parameters
         ↓
4. Generate seed image (optional)
   - Create initial visual frame
         ↓
5. Synthesize video with Veo 3.1
   - Submit prompt + seed to API
   - Poll for completion (10s intervals)
   - Download and display result
```

### State Management Flow

```
App.tsx (Root State)
    ↓
    ├── mode: AppMode
    ├── isChatOpen: boolean
    ├── hasApiKey: boolean
    ├── audioFile: File | null
    └── state: SynthesisState
            ↓
            ├── isAnalyzing
            ├── isGeneratingPrompt
            ├── isGeneratingSeed
            ├── isSynthesizingVideo
            ├── error
            ├── videoUrl
            ├── seedImageUrl
            ├── prompt
            └── audioAnalysis
```

---

## Component Hierarchy

```
App (Root)
├── Header
│   ├── Logo/Title
│   └── Navigation
│       ├── Dashboard Button
│       ├── Fusion Button
│       ├── Perception Button
│       ├── Studio Button
│       ├── About Button
│       ├── Neural Command Button
│       └── API Status Indicator
│
├── Main Content (conditional based on mode)
│   ├── [synthesis] SynthesisDashboard
│   │   ├── ProcessingHUD
│   │   ├── AudioUploader
│   │   └── Video Display + Controls
│   │
│   ├── [visual-studio] VisualStudio
│   │   └── Manual generation controls
│   │
│   ├── [combine] VideoCombiner
│   │   └── Multi-file upload & fusion
│   │
│   ├── [analyzer] NeuralAnalyzer
│   │   └── Media upload & analysis
│   │
│   └── [about] AboutSection
│       └── Feature documentation
│
├── ChatInterface (overlay)
│   └── Message history + input
│
└── Footer
    └── Branding & version info
```

---

## Service Layer

### AudioProcessor Service

**Purpose**: Extract technical audio features using Web Audio API

**Key Methods**:
- `analyzeAudioFile(file: File): Promise<AudioAnalysis>`

**Process**:
1. Decode audio to PCM samples
2. Calculate temporal features (RMS energy, ZCR)
3. Apply biquad filters for frequency band isolation
4. Measure energy in bass/mid/high ranges
5. Estimate spectral centroid (weighted frequency)
6. Compute simplified MFCC
7. Detect peaks for BPM estimation
8. Classify mood based on features

**Output**: `AudioAnalysis` object with 10+ metrics

---

### SynthesisService

**Purpose**: Orchestrate AI model interactions for video generation

**Key Methods**:

1. **`generateExpressPrompt()`**
   - Input: AudioAnalysis + intensity + absurdity
   - Output: Veo-optimized prompt
   - Model: Gemini 3 Pro

2. **`generateSeedImage()`**
   - Input: Prompt + aspect ratio
   - Output: Base64 image data
   - Model: Gemini 3 Pro Image

3. **`synthesizeVideo()`**
   - Input: Prompt + seed + orientation + resolution
   - Output: Video blob URL
   - Model: Veo 3.1
   - Duration: 2-5 minutes (async with polling)

4. **`extendVideo()`**
   - Input: Previous video + continuation prompt
   - Output: Extended video (8s → 15s)
   - Model: Veo 3.1

5. **`auditVideoStability()`**
   - Input: Video URL
   - Output: Stability report
   - Model: Gemini 3 Pro

6. **`fuseVideos()`**
   - Input: Array of video prompts
   - Output: Unified master prompt
   - Model: Gemini 3 Pro

7. **`createFastChat()`**
   - Output: Chat instance
   - Model: Gemini 2.5 Flash Lite

8. **`analyzeMedia()`**
   - Input: Image/video file + custom prompt
   - Output: Analysis text
   - Model: Gemini 3 Pro

---

## Audio Analysis Pipeline

### Technical Implementation

```typescript
// 1. Decode Audio
const audioCtx = new AudioContext();
const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
const channelData = audioBuffer.getChannelData(0); // Mono or left channel

// 2. Temporal Features
// RMS Energy
const energy = Math.sqrt(sumSquares / channelData.length);

// Zero-Crossing Rate
const zcr = zcrCount / channelData.length;

// 3. Frequency Band Analysis
// Use OfflineAudioContext + BiquadFilter
const bassEnergy = await getBandEnergy(20, 250, 'lowpass');
const midEnergy = await getBandEnergy(250, 2500, 'bandpass');
const highEnergy = await getBandEnergy(2500, 10000, 'highpass');

// 4. Spectral Centroid (Brightness)
const spectralCentroid = 
  (bassEnergy * 135 + midEnergy * 1375 + highEnergy * 6250) /
  (bassEnergy + midEnergy + highEnergy + 0.001);

// 5. BPM Estimation (Peak Detection)
// Adaptive threshold based on signal energy
// Skip 300ms after each peak to avoid double-counting
const bpm = (peaks / audioBuffer.duration) * 60;

// 6. Mood Classification
// Multi-dimensional rules based on energy, ZCR, BPM
```

### Frequency Band Rationale

- **Bass (20-250 Hz)**: Sub-bass and bass fundamentals
- **Mid (250-2500 Hz)**: Vocals, most instrument fundamentals
- **High (2500-10000 Hz)**: Harmonics, sibilance, cymbals

---

## Video Synthesis Pipeline

### Veo 3.1 Integration

```typescript
// 1. Generate Prompt
const prompt = await synthesisService.generateExpressPrompt(
  audioAnalysis, 
  intensity, 
  absurdity
);

// 2. Create Seed Image (Optional)
const seedImage = await synthesisService.generateSeedImage(
  prompt, 
  aspectRatio
);

// 3. Submit to Veo 3.1
let operation = await ai.models.generateVideos({
  model: 'veo-3.1-generate-preview',
  prompt: prompt,
  image: { imageBytes: base64Data, mimeType: 'image/png' },
  config: {
    numberOfVideos: 1,
    resolution: '1080p',
    aspectRatio: '16:9'
  }
});

// 4. Poll for Completion (10s intervals)
while (!operation.done) {
  await new Promise(resolve => setTimeout(resolve, 10000));
  operation = await ai.operations.getVideosOperation({ operation });
}

// 5. Download Video
const downloadLink = operation.response.generatedVideos[0].video.uri;
const response = await fetch(`${downloadLink}&key=${API_KEY}`);
const blob = await response.blob();
const videoUrl = URL.createObjectURL(blob);
```

### Temporal Extension

Veo 3.1 supports extending 8-second clips to ~15 seconds:

```typescript
const extended = await synthesisService.extendVideo(
  previousVideoRaw,
  "Continue with increasing turbulence"
);
```

---

## State Management

### Global State (App.tsx)

DannyX uses React's built-in `useState` for state management. No external state library is used.

```typescript
// Application Mode
const [mode, setMode] = useState<AppMode>('synthesis');

// Chat Interface
const [isChatOpen, setIsChatOpen] = useState(false);

// API Authentication
const [hasApiKey, setHasApiKey] = useState(false);

// Uploaded Audio
const [audioFile, setAudioFile] = useState<File | null>(null);

// Synthesis Pipeline State
const [state, setState] = useState<SynthesisState>({
  isAnalyzing: false,
  isGeneratingPrompt: false,
  isGeneratingSeed: false,
  isSynthesizingVideo: false,
  error: null,
  videoUrl: null,
  seedImageUrl: null,
  prompt: null,
  audioAnalysis: null,
});
```

### State Updates

State updates are immutable using the spread operator:

```typescript
setState(prev => ({ 
  ...prev, 
  isAnalyzing: true, 
  error: null 
}));
```

---

## API Integration

### Authentication

API key is provided through AI Studio environment:

```typescript
const hasKey = await window.aistudio.hasSelectedApiKey();
```

Or via environment variable for local development:

```typescript
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
```

### Model Endpoints

| Model | Purpose | Response Time |
|-------|---------|---------------|
| `gemini-3-pro-preview` | Prompt generation, analysis | 2-5 seconds |
| `gemini-3-pro-image-preview` | Seed image creation | 5-10 seconds |
| `veo-3.1-generate-preview` | Video synthesis | 2-5 minutes |
| `gemini-2.5-flash-lite` | Fast chat responses | <1 second |

### Error Handling

```typescript
try {
  const result = await synthesisService.synthesizeVideo(prompt);
} catch (err: any) {
  if (err.message?.includes("Requested entity was not found.")) {
    // API key issue - prompt user to select key
    setHasApiKey(false);
    handleSelectKey();
  } else {
    // Other errors
    setState(prev => ({ ...prev, error: err.message }));
  }
}
```

---

## Performance Considerations

### Audio Processing

- **Optimization**: OfflineAudioContext runs audio analysis faster than real-time
- **Memory**: Large files decoded entirely into memory
- **Limitation**: Browser-dependent (typically 2-4 minute max file size)

### Video Generation

- **Async Operations**: Long-running Veo operations don't block UI
- **Polling Interval**: 10 seconds (balances responsiveness vs API calls)
- **Memory**: Videos loaded as Blobs, URL created for playback

### Bundle Size

- **React/ReactDOM**: ~130 KB
- **@google/genai**: ~50 KB
- **Total**: ~200 KB (minified + gzipped)

---

## Security

### API Key Protection

- API keys never exposed in client-side code
- Managed through AI Studio environment or env variables
- Keys not committed to version control (`.env.local` in `.gitignore`)

### CORS & CSP

- API requests to `generativelanguage.googleapis.com`
- Requires proper CORS headers from Google services
- Content Security Policy should allow:
  - `connect-src: https://generativelanguage.googleapis.com`
  - `media-src: blob:` for video playback

### Input Validation

- File type validation on upload (audio files only for synthesis)
- Size limits enforced by browser and API
- Sanitization of user prompts before API submission

---

## Future Considerations

### Potential Enhancements

1. **State Persistence**: Save synthesis history to localStorage
2. **Caching**: Cache analysis results for re-uploaded files
3. **Batch Processing**: Queue multiple files for processing
4. **Export Formats**: Support additional video/audio formats
5. **Real-time Preview**: Live audio waveform visualization during upload
6. **Custom Models**: Allow users to select alternative Gemini models
7. **WebWorkers**: Move audio analysis to background thread

### Scalability

For enterprise deployment, consider:
- Server-side API key management
- Rate limiting and quota management
- User authentication and session management
- Database for synthesis history
- CDN for static assets

---

## Conclusion

DannyX.Online demonstrates a sophisticated client-side architecture that leverages cutting-edge AI models while maintaining responsive UX. The modular design allows for easy extension and integration of new features as Google's AI capabilities evolve.

For questions or contributions, please refer to the main [README.md](./README.md) or contact the development team.
