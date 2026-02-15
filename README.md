<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# DannyX.Online - Audiovisual Synthesis Engine

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)

**DannyX.Online** is a high-end, integrated neural workspace designed for advanced audiovisual synthesis. It transforms uploaded audio files into immersive, organic visual landscapes using Google's cutting-edge **Gemini 3** and **Veo 3.1** models.

View your app in AI Studio: https://ai.studio/apps/drive/11W7v4htC-Faam_pdtYzzIucl0tw_WGym

---

## 🎯 Overview

DannyX serves as a bridge between technical audio data and immersive generative media. The application analyzes audio files to extract technical metadata (BPM, energy, spectral characteristics, and mood), which is then used to autonomously engineer visual prompts and generate corresponding videos with seamless audio-visual causality.

### Key Features

- **🎵 Audio-Reactive Synthesis Engine**: Analyzes uploaded audio files to extract technical metadata (BPM, Energy, Spectral Centroid, and Mood) which drives visual generation
- **🎨 High-Fidelity Visual Studio**: Dedicated workspace for manual control over Text-to-Image and Text-to-Video generation
- **⏱️ Temporal Extension Protocol**: Extends 8-second video clips into 15-second cinematic sequences using the Veo extension API
- **🔍 Neural Stability Audit**: Deep-frame analysis for temporal artifacts and motion coherence scoring
- **🎬 Multi-Stream Fusion**: Merges aesthetics, textures, and dynamics of up to 10 separate video inputs into a single synthesis
- **📊 Media Perception (Neural Analyzer)**: Multi-modal scanning tool for semantic and technical analysis of images/videos
- **💬 Fast Neural Interface**: Low-latency chat interface powered by Gemini 2.5 Flash Lite for technical queries
- **🌊 Dynamic Fluid Waveform**: Real-time visual overlay reacting to energy and frequency data

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager
- **Gemini API Key** (with access to paid Gemini 3 and Veo 3.1 models)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/backgroundcheck/DannyX.Online.git
   cd DannyX.Online
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   **Important:** Ensure you are using a **paid API project** with access to Veo 3.1 and Gemini 3 Pro models.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Build for Production

```bash
npm run build
```

The optimized production build will be output to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## 📖 Usage Guide

### Application Modes

DannyX.Online features four primary operational modes:

#### 1. **Dashboard (Synthesis Mode)**

The main synthesis interface for audio-to-video generation:

1. **Upload Audio**: Select an audio file (MP3, WAV, etc.)
2. **Automatic Analysis**: The engine extracts:
   - BPM (Beats Per Minute)
   - Energy levels
   - Zero-Crossing Rate (noisiness indicator)
   - Spectral Centroid (brightness)
   - Frequency band distribution
   - Estimated mood
3. **Neural Prompting**: Generates Veo-optimized prompts based on audio analysis
4. **Seed Generation**: Creates initial visual seed image
5. **Video Synthesis**: Generates immersive video matching audio characteristics
6. **Download**: Export your synthesized video

#### 2. **Visual Studio**

Manual control workspace for advanced users:
- Direct Text-to-Image generation with Gemini 3 Pro Image
- Direct Text-to-Video generation with Veo 3.1
- Support for multiple aspect ratios (16:9, 9:16)
- Resolution control (720p, 1080p)
- Seed image upload capability

#### 3. **Fusion (Video Combiner)**

Advanced multi-stream synthesis:
- Upload up to 10 video files
- Analyzes visual dynamics of each input
- Fuses aesthetics and motion patterns
- Generates unified master synthesis

#### 4. **Perception (Neural Analyzer)**

Media intelligence scanner:
- Upload images or videos
- Extracts semantic information
- Technical breakdown of visual composition
- Motion analysis for video files

### Neural Command Interface

Access the chat interface by clicking the "Neural Command" button:
- Ask technical questions about the synthesis process
- Query audio analysis results
- Request explanations of visual generation parameters
- Powered by Gemini 2.5 Flash Lite for instant responses

---

## 🏗️ Architecture

### Technology Stack

- **Frontend Framework**: React 19.2
- **Build Tool**: Vite 6.2
- **Language**: TypeScript 5.8
- **AI Models**: 
  - Google Gemini 3 Pro (text generation, image analysis)
  - Google Gemini 3 Pro Image (seed image generation)
  - Google Veo 3.1 (video synthesis)
  - Gemini 2.5 Flash Lite (chat interface)

### Project Structure

```
DannyX.Online/
├── components/          # React UI components
│   ├── AboutSection.tsx
│   ├── AudioUploader.tsx
│   ├── ChatInterface.tsx
│   ├── NeuralAnalyzer.tsx
│   ├── ProcessingHUD.tsx
│   ├── SynthesisDashboard.tsx
│   ├── VideoCombiner.tsx
│   └── VisualStudio.tsx
├── services/            # Core business logic
│   ├── audioProcessor.ts  # Audio analysis engine
│   └── gemini.ts          # Gemini/Veo API integration
├── App.tsx              # Main application component
├── types.ts             # TypeScript type definitions
├── index.tsx            # Application entry point
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Project dependencies
└── README.md            # This file
```

### Audio Processing Pipeline

The `audioProcessor.ts` service performs advanced analysis:

1. **Temporal Features**: Calculates RMS energy and Zero-Crossing Rate
2. **Frequency Band Analysis**: Uses OfflineAudioContext with biquad filters to measure bass, mid, and high frequency energy
3. **Spectral Centroid**: Weighted average indicating "brightness" of sound
4. **MFCC Summary**: Log-scaled energy from Mel-spaced bands
5. **BPM Estimation**: Peak counting with adaptive threshold
6. **Mood Classification**: Multi-dimensional analysis based on energy, ZCR, and BPM

### Visual Synthesis Pipeline

The `gemini.ts` service orchestrates the synthesis:

1. **Prompt Generation**: Transforms audio analysis into Veo-optimized visual descriptions
2. **Seed Image Creation**: Generates initial frame using Gemini 3 Pro Image
3. **Video Synthesis**: Submits to Veo 3.1 with audio-derived parameters
4. **Extension**: Optional temporal extension for longer sequences
5. **Stability Audit**: Post-generation quality assessment

---

## 🔧 API Configuration

### Required Models

Ensure your Gemini API key has access to:

- `gemini-3-pro-preview` - Text generation and analysis
- `gemini-3-pro-image-preview` - Seed image generation  
- `veo-3.1-generate-preview` - Video synthesis
- `gemini-2.5-flash-lite` - Fast chat responses

### API Key Setup

The application checks for API key availability through the AI Studio framework:

```typescript
const hasKey = await window.aistudio.hasSelectedApiKey();
```

If no key is detected, users are prompted to configure one through the "Select API Key" dialog.

---

## 🎨 Design Philosophy

DannyX.Online features a **cinematic, terminal-inspired aesthetic** with:

- High-fidelity HUDs and data visualization
- Motion-blurred chromatic branding
- Audio-reactive visual elements
- Dark theme with strategic accent colors
- Responsive design for desktop and mobile

The interface emphasizes its identity as a "Neural Laboratory" with technical precision and futuristic styling.

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Authorization Required" message appears
- **Solution**: Ensure your Gemini API key is properly configured and has access to required models (Gemini 3, Veo 3.1)

**Issue**: "Requested entity was not found" error
- **Solution**: Verify you're using a paid API project with Veo 3.1 access enabled

**Issue**: Video synthesis takes too long
- **Solution**: Veo 3.1 video generation typically takes 2-5 minutes. The application polls every 10 seconds for completion.

**Issue**: Audio analysis shows unexpected values
- **Solution**: Ensure audio file is valid (MP3, WAV, etc.) and not corrupted. Very short files (<1 second) may produce unreliable analysis.

**Issue**: Build fails with TypeScript errors
- **Solution**: Ensure you're using Node.js v18+ and run `npm install` to update dependencies

### Browser Compatibility

DannyX.Online requires modern browser features:
- Web Audio API
- OfflineAudioContext
- FileReader API
- ES6+ JavaScript support

**Recommended browsers:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

## 📄 License

This project is privately owned. All rights reserved.

---

## 🙏 Acknowledgments

- **Google AI Studio** for Gemini and Veo model access
- **Vite** for blazing-fast build tooling
- **React** for component architecture

---

## 📧 Support

For issues, questions, or feature requests, please contact the development team or open an issue in the repository.

---

<div align="center">
  <strong>DANNYX.OS // KERNEL V3.2.1-STABLE // MULTISCREEN ENCODED</strong><br>
  <em>Integrated Neural Workspace</em>
</div>
