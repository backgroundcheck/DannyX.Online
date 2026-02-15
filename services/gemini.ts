
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AudioAnalysis } from "../types";

/**
 * SynthesisService - Core orchestration layer for audiovisual synthesis
 * 
 * This service integrates Google's Gemini 3 and Veo 3.1 models to transform
 * audio analysis data into immersive video content. It manages the complete
 * synthesis pipeline from prompt generation through video creation, extension,
 * and quality auditing.
 * 
 * Key Responsibilities:
 * - Generate Veo-optimized prompts from audio analysis
 * - Create seed images for video initialization
 * - Orchestrate video synthesis with temporal stability
 * - Extend video duration with coherent transitions
 * - Audit generated videos for quality and stability
 * - Provide fast chat interface for user interaction
 * - Analyze media files for semantic and technical information
 * 
 * @class SynthesisService
 */
export class SynthesisService {
  /**
   * System role definition for the synthesis engine.
   * 
   * This comprehensive prompt defines the core behavior, constraints, and
   * aesthetic principles for video generation. It ensures:
   * - Audio-visual causality (sound drives all visual changes)
   * - Organic, non-geometric visual style
   * - Temporal stability and coherence
   * - Immersive, continuously-generated feel
   * - Proper branding and waveform integration
   * 
   * @private
   */
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

  /**
   * Generates a master synthesis prompt for Veo 3.1 based on audio analysis.
   * 
   * Transforms technical audio features into a comprehensive visual description
   * optimized for Veo's video generation capabilities. The prompt incorporates
   * BPM, energy levels, mood, and user-specified intensity/absurdity parameters.
   * 
   * @param {AudioAnalysis} analysis - Audio analysis results from audioProcessor
   * @param {number} intensity - Visual intensity multiplier (0-100)
   * @param {number} absurdity - Surrealism/abstraction level (0-100)
   * @returns {Promise<string>} Generated prompt text for Veo 3.1
   * @throws {Error} If API call fails or response is invalid
   * 
   * @example
   * const service = new SynthesisService();
   * const prompt = await service.generateExpressPrompt(audioAnalysis, 75, 50);
   */
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

  /**
   * Generates a seed image using Gemini 3 Pro Image model.
   * 
   * Creates an initial visual frame that serves as the starting point for
   * video synthesis. The seed image establishes the visual aesthetic and
   * composition that will be animated by Veo.
   * 
   * @param {string} prompt - Text description for image generation
   * @param {string} aspectRatio - Aspect ratio (default: "16:9", also supports "9:16")
   * @returns {Promise<string>} Data URL of generated image (base64 encoded PNG)
   * @throws {Error} If image generation fails or response contains no image data
   * 
   * @example
   * const imageUrl = await service.generateSeedImage(
   *   "Organic fluid textures in deep blue and purple", 
   *   "16:9"
   * );
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
   * Synthesizes video using Veo 3.1 model.
   * 
   * Generates video from text prompt, optionally using a seed image for
   * initial frame guidance. The process is asynchronous and may take 2-5 minutes.
   * This method polls the operation status every 10 seconds until completion.
   * 
   * @param {string} prompt - Text description for video generation
   * @param {string} [imageBase64] - Optional base64-encoded seed image
   * @param {'16:9' | '9:16'} orientation - Video aspect ratio (default: '16:9')
   * @param {'720p' | '1080p'} resolution - Video resolution (default: '1080p')
   * @returns {Promise<{url: string, rawVideo: any, aspectRatio: string}>} 
   *          Object containing video blob URL, raw video metadata, and aspect ratio
   * @throws {Error} If video synthesis fails or times out
   * 
   * @example
   * const result = await service.synthesizeVideo(
   *   prompt, 
   *   seedImageBase64, 
   *   '16:9', 
   *   '1080p'
   * );
   * videoElement.src = result.url;
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
   * Refines a synthesis prompt based on stability audit feedback.
   * 
   * Takes an original prompt and audit report, then generates an improved
   * prompt that addresses identified stability issues (flickering, cuts, etc.).
   * 
   * @param {string} originalPrompt - The original Veo prompt
   * @param {string} auditReport - Stability audit analysis text
   * @returns {Promise<string>} Refined prompt with stability improvements
   * @throws {Error} If API call fails
   * 
   * @example
   * const refinedPrompt = await service.refineSynthesisPrompt(
   *   originalPrompt,
   *   "Detected temporal instability at 3-4s mark"
   * );
   */
  async refineSynthesisPrompt(originalPrompt: string, auditReport: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Refine this prompt to enhance temporal stability based on audit report: ${auditReport}. Original: ${originalPrompt}`,
    });
    return response.text.trim();
  }

  /**
   * Extends an existing video using Veo's temporal extension API.
   * 
   * Takes an 8-second video clip and extends it to approximately 15 seconds
   * with coherent motion continuation. The extension maintains visual consistency
   * and narrative flow from the original clip.
   * 
   * @param {any} previousVideo - Raw video object from previous synthesis
   * @param {string} prompt - Continuation prompt describing desired motion/evolution
   * @returns {Promise<{url: string, rawVideo: any}>} Extended video with blob URL
   * @throws {Error} If extension fails or operation times out
   * 
   * @example
   * const extended = await service.extendVideo(
   *   previousVideoRaw,
   *   "Continue the organic flow with increasing turbulence"
   * );
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
   * Performs stability audit on a generated video using Gemini 3 Pro.
   * 
   * Analyzes video for temporal artifacts, scene cuts (which are forbidden),
   * motion coherence, and overall quality. Returns detailed assessment that
   * can be used to refine future generations.
   * 
   * @param {string} videoUrl - URL of video to audit (blob or HTTP URL)
   * @returns {Promise<string>} Detailed stability audit report
   * @throws {Error} If video fetch fails or analysis cannot be performed
   * 
   * @example
   * const audit = await service.auditVideoStability(videoUrl);
   * console.log("Stability report:", audit);
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
          { text: "Perform stability audit. Focus on flickering, scene cuts (which are forbidden), and motion coherence." }
        ]
      }
    });

    return auditResponse.text;
  }

  /**
   * Fuses multiple video prompts into a unified master prompt.
   * 
   * Analyzes multiple visual descriptions and synthesizes them into a single
   * cohesive prompt that captures the combined aesthetic, maintaining organic
   * flow and avoiding jarring transitions.
   * 
   * @param {string[]} videoPrompts - Array of individual video prompt descriptions
   * @returns {Promise<string>} Unified master synthesis prompt
   * @throws {Error} If fusion generation fails
   * 
   * @example
   * const masterPrompt = await service.fuseVideos([
   *   "Deep blue organic flows",
   *   "Purple crystalline structures",
   *   "Turbulent golden waves"
   * ]);
   */
  async fuseVideos(videoPrompts: string[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Fuse these visual segments into a singular continuous organic master prompt: ${videoPrompts.join('\n\n')}`,
    });
    return response.text.trim();
  }

  /**
   * Creates a fast chat interface using Gemini 2.5 Flash Lite.
   * 
   * Initializes a low-latency chat session for technical queries and engine
   * commands. The chat inherits the system role and acts as a terminal interface
   * to the synthesis engine.
   * 
   * @returns {Chat} Configured chat instance
   * 
   * @example
   * const chat = service.createFastChat();
   * const response = await chat.sendMessage("Explain the BPM analysis");
   */
  createFastChat(): Chat {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.chats.create({
      model: 'gemini-2.5-flash-lite',
      config: {
        systemInstruction: this.systemRole + "\nYou are the DannyX Neural Command. Act as a terminal to the synthesis engine."
      }
    });
  }

  /**
   * Analyzes uploaded media files (images or videos) using Gemini 3 Pro.
   * 
   * Extracts semantic information, technical details, and visual dynamics
   * from uploaded media. Supports custom analysis prompts for specific queries.
   * 
   * @param {File} file - Media file to analyze (image or video)
   * @param {string} prompt - Analysis instruction (default: "Extract visual dynamics.")
   * @returns {Promise<string>} Detailed analysis report
   * @throws {Error} If file reading or analysis fails
   * 
   * @example
   * const analysis = await service.analyzeMedia(
   *   videoFile,
   *   "Describe the color palette and motion patterns"
   * );
   */
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
