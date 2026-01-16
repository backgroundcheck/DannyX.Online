
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AudioAnalysis } from "../types";

export class SynthesisService {
  private systemRole = `
    SYSTEM ROLE
    You are an audiovisual synthesis engine generating a single immersive video.

    INPUT
    - One uploaded audio track (this audio defines the full duration).
    - Optional user settings: aspect ratio, intensity, absurdity.

    OUTPUT REQUIREMENT
    Generate one continuous immersive video.
    Duration: exactly match the uploaded audio length.
    Aspect ratio: user-selected (default 16:9).
    Resolution: 1080p.
    Framerate: stable 24–30fps.
    No cuts. No resets. No scene breaks.

    CORE DIRECTIVE
    This video must be generated directly from the uploaded audio.
    Audio is the structural driver of all visual behavior.
    The visuals must feel alive, unstable, and continuously transforming.

    This is not a sequence of images.
    This is not a geometric composition.
    This is a living visual field shaped by sound.

    AUDIO → VISUAL CAUSALITY
    - Rhythm creates tension and release.
    - Loudness causes expansion, compression, distortion.
    - Bass bends space and mass.
    - Mid frequencies agitate texture and flow.
    - High frequencies introduce fine fragmentation and shimmer.
    - Silence suspends motion and creates visual pressure.

    Every visual change must have an audible cause.

    VISUAL BEHAVIOR
    - No points, lines, grids, or clean geometry.
    - No symmetry or balanced composition.
    - No recognizable objects, people, symbols, or text.

    Generate:
    - Organic textures
    - Liquid and fog-like flows
    - Swarms, smears, interference fields
    - Grain, turbulence, drift
    - Slightly absurd but coherent motion

    Motion must be cyclical but imperfect.
    Visual states may echo earlier moments but must never repeat exactly.

    TEMPORAL STRUCTURE
    Internally build the video from seamless 5–7 second loopable segments,
    but present the result as one continuous experience.
    No hard cuts. Transitions must feel like morphing continuation.

    SPACE & PERSPECTIVE
    - No traditional camera moves.
    - Viewer is embedded inside the visual field.
    - Space may warp, breathe, stretch, or collapse with sound.
    - Perspective is unstable but coherent.

    IMMERSION
    Prioritize immersion over clarity or beauty.
    Allow moments of:
    - Hypnosis
    - Unease
    - Absurd calm
    - Sudden restraint after intensity

    LIVE-GENERATED FEEL
    The video must feel continuously generated, not pre-rendered.
    No visible looping seams.
    No sudden lighting jumps.
    No temporal collapse or object loss.

    STABILITY CONSTRAINTS (MANDATORY)
    - Prevent morphing, melting, or disappearing structures.
    - Maintain lighting continuity.
    - Avoid rapid scaling or aggressive motion.
    - No flicker, strobe, jitter, or camera shake.

    WAVEFORM OVERLAY (MANDATORY)
    Integrate an audio-reactive waveform directly into the visual field.
    The waveform must:
    - Be fluid and organic
    - React to frequency bands
    - Feel embedded, not like a UI overlay
    - Never dominate or distract

    BRANDING (MANDATORY)
    Overlay throughout the entire video:
    - Top-right: “DANNYX.ONLINE” logo, small, unobtrusive
    - Bottom-right: “DannyX.online” watermark, semi-transparent
  `;

  async generateExpressPrompt(analysis: AudioAnalysis, intensity: number, absurdity: number): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a master synthesis prompt for Veo 3.1 based on these neural inputs:
      Audio: BPM=${analysis.bpm}, Energy=${analysis.energy}, Mood=${analysis.moodDescription}.
      Dynamics: Intensity=${intensity}%, Absurdity=${absurdity}%.
      
      Maintain your core directive: Audio-causality, no geometry, continuous organic flow.`,
      config: {
        systemInstruction: this.systemRole
      }
    });
    return response.text.trim();
  }

  async generateSeedImage(prompt: string, aspectRatio: string = "16:9"): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: { aspectRatio: aspectRatio as any, imageSize: "1K" }
      }
    });

    if (!response.candidates?.[0]?.content?.parts) throw new Error("Image generation failed.");
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image data in response.");
  }

  async synthesizeVideo(prompt: string, imageBase64?: string, orientation: '16:9' | '9:16' = '16:9', resolution: '720p' | '1080p' = '1080p'): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const config: any = {
      model: 'veo-3.1-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: resolution,
        aspectRatio: orientation
      }
    };

    if (imageBase64) {
      const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      config.image = {
        imageBytes: base64Data,
        mimeType: 'image/png',
      };
    }

    let operation = await ai.models.generateVideos(config);

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video synthesis failed.");
    
    const finalResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await finalResponse.blob();
    return {
      url: URL.createObjectURL(blob),
      rawVideo: operation.response?.generatedVideos?.[0]?.video,
      aspectRatio: orientation
    };
  }

  async refineSynthesisPrompt(originalPrompt: string, auditReport: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Refine this prompt to enhance temporal stability based on audit report: ${auditReport}. Original: ${originalPrompt}`,
    });
    return response.text.trim();
  }

  async extendVideo(previousVideo: any, prompt: string): Promise<any> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: prompt,
      video: previousVideo,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9',
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const finalResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await finalResponse.blob();
    return {
      url: URL.createObjectURL(blob),
      rawVideo: operation.response?.generatedVideos?.[0]?.video
    };
  }

  async auditVideoStability(videoUrl: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await fetch(videoUrl);
    const blob = await response.blob();
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(blob);
    });

    const auditResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'video/mp4' } },
          { text: "Perform stability audit. Focus on flickering, scene cuts (which are forbidden), and motion coherence." }
        ]
      }
    });

    return auditResponse.text;
  }

  async fuseVideos(videoPrompts: string[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Fuse these visual segments into a singular continuous organic master prompt: ${videoPrompts.join('\n\n')}`,
    });
    return response.text.trim();
  }

  createFastChat(): Chat {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.chats.create({
      model: 'gemini-2.5-flash-lite',
      config: {
        systemInstruction: this.systemRole + "\nYou are the DannyX Neural Command. Act as a terminal to the synthesis engine."
      }
    });
  }

  async analyzeMedia(file: File, prompt: string = "Extract visual dynamics."): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const reader = new FileReader();
    const base64Data = await new Promise<string>((resolve) => {
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [{ inlineData: { data: base64Data, mimeType: file.type } }, { text: prompt }]
      }
    });
    return response.text;
  }
}
