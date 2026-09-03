/**
 * Client-side Gemini AI Service
 * Proxies all requests to our server-side Express API to ensure security
 */

export interface ChatMessagePayload {
  role: 'user' | 'model';
  text: string;
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content?: string;
      }[];
    };
  };
}

export class GeminiAIService {
  /**
   * 1. Multi-turn AI Chatbot with role-based system instruction & model tier selection
   */
  static async sendChatMessage(
    messages: ChatMessagePayload[],
    systemInstruction?: string,
    modelTier: 'complex' | 'general' | 'fast' = 'general'
  ): Promise<{ text: string; model: string }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemInstruction, modelTier }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to send chat message.');
    }
    return { text: data.text, model: data.model };
  }

  /**
   * 2. Search Grounding using gemini-3.5-flash with googleSearch tool
   */
  static async searchGroundedQuery(prompt: string): Promise<{ text: string; sources: GroundingSource[] }> {
    const res = await fetch('/api/ai/search-grounding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to execute search grounding.');
    }
    return { text: data.text, sources: data.sources || [] };
  }

  /**
   * 3. Maps Grounding using gemini-3.5-flash with googleMaps tool
   */
  static async mapsGroundedQuery(
    prompt: string,
    location?: { latitude: number; longitude: number }
  ): Promise<{ text: string; groundingChunks: GroundingSource[] }> {
    const res = await fetch('/api/ai/maps-grounding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        latitude: location?.latitude,
        longitude: location?.longitude,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to execute maps grounding.');
    }
    return { text: data.text, groundingChunks: data.groundingChunks || [] };
  }

  /**
   * 4. Image Generation & Editing using gemini-3.1-flash-image-preview
   */
  static async generateOrEditImage(options: {
    prompt: string;
    base64Image?: string;
    mimeType?: string;
    aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  }): Promise<{ imageUrl: string | null; text: string }> {
    const res = await fetch('/api/ai/image-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to generate/edit image.');
    }
    return { imageUrl: data.imageUrl, text: data.text };
  }

  /**
   * 5. Audio Transcription using gemini-3.5-transcribe
   */
  static async transcribeAudio(
    base64Audio: string,
    mimeType: string = 'audio/webm',
    prompt?: string
  ): Promise<string> {
    const res = await fetch('/api/ai/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Audio, mimeType, prompt }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to transcribe audio.');
    }
    return data.text || '';
  }

  /**
   * 6. Music Generation using lyria-3-clip-preview (clip) or lyria-3-pro-preview (full track)
   */
  static async generateMusic(options: {
    prompt: string;
    isFullTrack?: boolean;
    base64Image?: string;
    mimeType?: string;
  }): Promise<{ audioUrl: string; lyrics: string; model: string }> {
    const res = await fetch('/api/ai/music-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to generate music.');
    }
    return { audioUrl: data.audioUrl, lyrics: data.lyrics, model: data.model };
  }

  /**
   * 7. Veo Video Generation (veo-3.1-fast-generate-preview)
   * Handles starting, polling, and downloading video
   */
  static async generateVideo(
    options: {
      prompt?: string;
      base64Image?: string;
      mimeType?: string;
      aspectRatio?: '16:9' | '9:16';
      resolution?: '720p' | '1080p';
    },
    onProgress?: (statusText: string) => void
  ): Promise<string> {
    onProgress?.('កំពុងផ្ញើសំណើទៅកាន់ Veo 3 Video Generator (Initiating Veo generation)...');

    // Step 1: Start Generation
    const startRes = await fetch('/api/ai/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
    const startData = await startRes.json();
    if (!startRes.ok || !startData.success) {
      throw new Error(startData.error || 'Failed to initiate Veo video generation.');
    }

    const { operationName } = startData;
    onProgress?.('Veo កំពុងគណនាចលនារូបភាព និងបង្កើតវីដេអូ (Rendering video frames, this takes 1-2 mins)...');

    // Step 2: Poll status until complete
    let isDone = false;
    let attempts = 0;
    const maxAttempts = 40; // up to ~3-4 minutes

    while (!isDone && attempts < maxAttempts) {
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 6000));
      onProgress?.(`Veo Rendering Video: ${attempts * 2.5}% (Analyzing lighting, physics & camera)...`);

      const statusRes = await fetch('/api/ai/video-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName }),
      });
      const statusData = await statusRes.json();
      if (!statusRes.ok || !statusData.success) {
        throw new Error(statusData.error || 'Error polling video generation status.');
      }

      if (statusData.done) {
        isDone = true;
      }
    }

    if (!isDone) {
      throw new Error('Video generation timed out. Please try again.');
    }

    onProgress?.('កំពុងទាញយកវីដេអូដែលបានបង្កើតរួច (Downloading finished MP4 video)...');

    // Step 3: Download finished video binary
    const downloadRes = await fetch('/api/ai/video-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operationName }),
    });

    if (!downloadRes.ok) {
      throw new Error('Failed to retrieve video file stream.');
    }

    const blob = await downloadRes.blob();
    return URL.createObjectURL(blob);
  }
}
