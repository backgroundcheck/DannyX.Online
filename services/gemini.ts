
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AudioAnalysis } from "../types";

export class SynthesisService {
  /**
   * Generates a visual prompt based on technical audio analysis.
   */
  async generateVisualPrompt(analysis: AudioAnalysis): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const techSpecs = `
      - Audio Dynamics: Energy=${analysis.energy}, ZCR=${analysis.zcr}
      - Spectral Balance: Bass=${analysis.bassEnergy}, Mids=${analysis.midEnergy}, Highs=${analysis.highEnergy}
      - Timbral Character: Centroid=${analysis.spectralCentroid}Hz
      - Rhythm: ${analysis.bpm} BPM
      - Perceived Mood: ${analysis.moodDescription}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are an audiovisual synthesis expert. Generate a high-end, abstract visual prompt for a generative video model based on the following technical audio analysis:
      ${techSpecs}
      
      Requirements for the prompt:
      - Describe complex fluid-dynamic behaviors corresponding to the spectral centroid.
      - High centroid = sharp particulate, low centroid = viscous swells.
      - Style: Cinematic macro photography, unstable organic matter. No text, no human figures.
      Return only the prompt string.`,
    });
    return response.text.trim();
  }

  /**
   * Generates a seed image for video synthesis.
   */
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

  /**
   * Synthesizes video from text and optional image using high-quality Veo.
   */
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

  /**
   * Uses Gemini to re-engineer a prompt based on specific failure reports.
   */
  async refineSynthesisPrompt(originalPrompt: string, auditReport: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are a Generative Prompt Engineer. I have an original prompt and a technical audit of why the generated video failed. 
      Your task is to rewrite the prompt to specifically address the stability issues, temporal artifacts, and motion coherence problems mentioned.
      
      Original Prompt: "${originalPrompt}"
      Audit Report: "${auditReport}"
      
      Requirements for the new prompt:
      - Integrate "Negative Prompting" keywords into the description (e.g., describing what should stay still or remain sharp).
      - Use more precise motion verbs to guide the model's temporal consistency.
      - Keep the cinematic, macro style.
      - Return only the refined prompt text.`,
    });
    return response.text.trim();
  }

  /**
   * Extends an existing video to add more duration.
   */
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

  /**
   * Audits video stability and coherence using Gemini 3 Pro.
   */
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
          { text: "Analyze this generated video for stability issues, temporal artifacts, and motion coherence. Provide a technical stability score out of 100 and suggestions for re-rendering." }
        ]
      }
    });

    return auditResponse.text;
  }

  /**
   * Combines multiple video inputs into a single synthesized prompt.
   */
  async fuseVideos(videoPrompts: string[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are a neural visual synthesis engine. I will give you descriptions of ${videoPrompts.length} video segments. 
      Your task is to generate a single, high-fidelity generative video prompt that intelligently merges the aesthetics, textures, and movement dynamics of all segments into one cohesive, 8-second cinematic landscape.
      
      Input Segment Descriptions:
      ${videoPrompts.join('\n\n')}
      
      Output: A single, detailed, cinematic prompt for Veo. No conversational text.`,
    });
    return response.text.trim();
  }

  /**
   * Starts a new fast-response chat session with Gemini 2.5 Flash Lite.
   */
  createFastChat(): Chat {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.chats.create({
      model: 'gemini-2.5-flash-lite',
      config: {
        systemInstruction: "You are the DannyX Fast Neural Interface. Optimized for low-latency responses. Be concise, technical, and efficient."
      }
    });
  }

  /**
   * Performs deep analysis on Image or Video files using Gemini 3 Pro.
   */
  async analyzeMedia(file: File, prompt: string = "Analyze this media for key visual information, conceptual themes, and technical metadata. Provide a structured breakdown."): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const reader = new FileReader();
    
    const base64Data = await new Promise<string>((resolve) => {
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: file.type } },
          { text: prompt }
        ]
      }
    });

    return response.text;
  }
}
