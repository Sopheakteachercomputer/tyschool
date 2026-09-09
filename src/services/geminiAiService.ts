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

/**
 * Safely executes a POST request and parses JSON response.
 * Prevents "Unexpected token '<', <html> is not valid JSON" errors when
 * an endpoint returns HTML (e.g. 404/500/502/SPA fallback).
 */
async function postJson<T = any>(url: string, payload: any, actionDescription: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (networkErr: any) {
    throw new Error(`បណ្តាញមានបញ្ហា (Network Error): ${networkErr?.message || 'Cannot reach API backend'}`);
  }

  const rawText = await res.text();
  const trimmed = rawText.trim();

  // If the response is HTML (starts with < or contains <!DOCTYPE / <html>)
  if (trimmed.startsWith('<') || trimmed.toLowerCase().startsWith('<!doctype html') || trimmed.toLowerCase().startsWith('<html')) {
    console.error(`[GeminiAIService] Server returned HTML for ${url} (HTTP ${res.status}):`, rawText.slice(0, 300));
    if (res.status === 404) {
      throw new Error(`សេវា AI មិនទាន់ដំណើរការ (API route ${url} not found, HTTP 404)។ សូមប្រាកដថាម៉ាស៊ីនបម្រើ Express Server កំពុងដំណើរការ។`);
    }
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error(`ម៉ាស៊ីនបម្រើកំពុងរវល់ ឬលើសពេលកំណត់ (Server Gateway Error ${res.status})។ សូមសាកល្បងម្តងទៀតបន្តិចទៀត។`);
    }
    throw new Error(`ម៉ាស៊ីនបម្រើបានឆ្លើយតបជាទម្រង់ HTML (HTTP ${res.status}) ជំនួស JSON សម្រាប់ ${actionDescription}។`);
  }

  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch (parseErr: any) {
    console.error(`[GeminiAIService] JSON parse failure for ${url}:`, parseErr, rawText.slice(0, 200));
    throw new Error(`ការឆ្លើយតបពីម៉ាស៊ីនបម្រើខូចទម្រង់ (Invalid JSON response): ${parseErr?.message || 'Parse error'}`);
  }

  if (!res.ok || (data && data.success === false)) {
    let errMessage = data?.error || `Failed to execute ${actionDescription} (HTTP ${res.status}).`;

    // Unpack serialized JSON error objects if present in string
    if (typeof errMessage === 'string') {
      try {
        const s = errMessage.indexOf('{');
        const e = errMessage.lastIndexOf('}');
        if (s !== -1 && e > s) {
          const parsed = JSON.parse(errMessage.slice(s, e + 1));
          if (parsed?.error?.message) {
            errMessage = parsed.error.message;
          }
        }
      } catch {
        // Not a JSON string
      }

      // Check for rate limit / quota signals
      if (
        res.status === 429 ||
        data?.isQuotaExceeded ||
        errMessage.includes('429') ||
        errMessage.includes('RESOURCE_EXHAUSTED') ||
        errMessage.toLowerCase().includes('quota') ||
        errMessage.toLowerCase().includes('rate-limit') ||
        errMessage.toLowerCase().includes('rate limit')
      ) {
        errMessage = `កូតា Gemini API ត្រូវបានប្រើអស់ជាបណ្តោះអាសន្ន (Gemini API Quota Exceeded - HTTP 429)។ គណនី Free-Tier អាចមានកម្រិតកំណត់ 15 សំណើ/នាទី។ សូមរង់ចាំ 1-2 នាទីរួចសាកល្បងម្តងទៀត ឬពិនិត្យកម្រិតកូតានៅ https://ai.dev/rate-limit ។`;
      }
    }

    throw new Error(errMessage);
  }

  return data as T;
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
    const data = await postJson<{ success: boolean; text: string; model: string }>(
      '/api/ai/chat',
      { messages, systemInstruction, modelTier },
      'AI Chat generation'
    );
    return { text: data.text || '', model: data.model || 'Gemini Flash' };
  }

  /**
   * 2. Search Grounding using gemini-3.8-flash with googleSearch tool
   */
  static async searchGroundedQuery(prompt: string): Promise<{ text: string; sources: GroundingSource[] }> {
    const data = await postJson<{ success: boolean; text: string; sources: GroundingSource[] }>(
      '/api/ai/search-grounding',
      { prompt },
      'Google Search Grounding'
    );
    return { text: data.text || '', sources: data.sources || [] };
  }

  /**
   * 3. Maps Grounding using gemini-3.8-flash with googleMaps tool
   */
  static async mapsGroundedQuery(
    prompt: string,
    location?: { latitude: number; longitude: number }
  ): Promise<{ text: string; groundingChunks: GroundingSource[] }> {
    const data = await postJson<{ success: boolean; text: string; groundingChunks: GroundingSource[] }>(
      '/api/ai/maps-grounding',
      {
        prompt,
        latitude: location?.latitude,
        longitude: location?.longitude,
      },
      'Google Maps Grounding'
    );
    return { text: data.text || '', groundingChunks: data.groundingChunks || [] };
  }

  /**
   * 4. Image Generation & Editing using gemini-3.1-flash-image
   */
  static async generateOrEditImage(options: {
    prompt: string;
    base64Image?: string;
    mimeType?: string;
    aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  }): Promise<{ imageUrl: string | null; text: string }> {
    const data = await postJson<{ success: boolean; imageUrl: string | null; text: string }>(
      '/api/ai/image-generate',
      options,
      'Image Generation'
    );
    return { imageUrl: data.imageUrl || null, text: data.text || '' };
  }

  /**
   * 5. Audio Transcription using gemini-3.5-transcribe
   */
  static async transcribeAudio(
    base64Audio: string,
    mimeType: string = 'audio/webm',
    prompt?: string
  ): Promise<string> {
    const data = await postJson<{ success: boolean; text: string }>(
      '/api/ai/transcribe',
      { base64Audio, mimeType, prompt },
      'Audio Transcription'
    );
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
    const data = await postJson<{ success: boolean; audioUrl: string; lyrics: string; model: string }>(
      '/api/ai/music-generate',
      options,
      'Music Generation'
    );
    return { audioUrl: data.audioUrl || '', lyrics: data.lyrics || '', model: data.model || 'Lyria' };
  }

  /**
   * 7. Veo Video Generation (veo-3.1-generate-preview)
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
    onProgress?.('កំពុងផ្ញើសំណើទៅកាន់ Veo Video Generator (Initiating Veo generation)...');

    // Step 1: Start Generation
    const startData = await postJson<{ success: boolean; operationName: string }>(
      '/api/ai/generate-video',
      options,
      'Veo Video Initiation'
    );

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

      const statusData = await postJson<{ success: boolean; done: boolean }>(
        '/api/ai/video-status',
        { operationName },
        'Veo Video Status Polling'
      );

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
      const errText = await downloadRes.text();
      throw new Error(errText.startsWith('<') ? `Failed to download video stream (HTTP ${downloadRes.status})` : errText);
    }

    const blob = await downloadRes.blob();
    return URL.createObjectURL(blob);
  }
}
