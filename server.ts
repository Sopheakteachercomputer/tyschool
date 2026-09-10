import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";

dotenv.config();

const PORT = 3000;

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required in environment variables.");
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

interface GeminiErrorDetails {
  isQuota: boolean;
  statusCode: number;
  userMessage: string;
  code?: number;
  statusText?: string;
  helpUrl: string;
}

/**
 * Parses and formats Gemini API errors to prevent raw JSON strings from leaking to the UI.
 * Handles 429 RESOURCE_EXHAUSTED / Quota limits with clean bilingual explanations.
 */
function parseGeminiApiError(err: any): GeminiErrorDetails {
  const rawMsg = err?.message || String(err || "");
  let isQuota = false;
  let code = err?.status || err?.code || 500;
  let statusText = "ERROR";
  let helpUrl = "https://ai.google.dev/gemini-api/docs/rate-limits";

  // Check if raw message contains JSON error payload from the SDK
  try {
    const s = rawMsg.indexOf("{");
    const e = rawMsg.lastIndexOf("}");
    if (s !== -1 && e > s) {
      const parsed = JSON.parse(rawMsg.slice(s, e + 1));
      if (parsed?.error) {
        code = parsed.error.code || code;
        statusText = parsed.error.status || statusText;
        if (Array.isArray(parsed.error.details)) {
          for (const d of parsed.error.details) {
            if (Array.isArray(d.links) && d.links[0]?.url) {
              helpUrl = d.links[0].url;
            }
          }
        }
      }
    }
  } catch {
    // Non-JSON string
  }

  if (
    code === 429 ||
    statusText === "RESOURCE_EXHAUSTED" ||
    rawMsg.includes("429") ||
    rawMsg.includes("RESOURCE_EXHAUSTED") ||
    rawMsg.toLowerCase().includes("quota") ||
    rawMsg.toLowerCase().includes("rate-limit") ||
    rawMsg.toLowerCase().includes("rate limit")
  ) {
    isQuota = true;
    code = 429;
    statusText = "RESOURCE_EXHAUSTED";
  }

  let userMessage = "";
  if (isQuota) {
    userMessage =
      "កូតា Gemini API ត្រូវបានប្រើអស់ជាបណ្តោះអាសន្ន (Gemini API Quota Exceeded - HTTP 429)។ គណនី Free-Tier អាចមានកម្រិតកំណត់ 15 សំណើ/នាទី។ សូមរង់ចាំ 1-2 នាទីរួចសាកល្បងម្តងទៀត ឬពិនិត្យកម្រិតកូតានៅ https://ai.dev/rate-limit។ (Gemini API quota exceeded. Please wait 1-2 minutes or check rate limits at https://ai.dev/rate-limit).";
  } else {
    // Strip JSON wrapping if present
    const cleaned = rawMsg.replace(/^{.*"message":"([^"]+)".*}$/s, "$1");
    userMessage = cleaned || "Gemini API error.";
  }

  return {
    isQuota,
    statusCode: isQuota ? 429 : (typeof code === "number" ? code : 500),
    userMessage,
    code,
    statusText,
    helpUrl,
  };
}

/**
 * Intelligent educational school assistant response when Gemini Cloud is temporarily rate-limited
 */
function getSmartOfflineSchoolResponse(prompt: string): string {
  const p = (prompt || "").toLowerCase();

  if (p.includes("សួស្តី") || p.includes("hello") || p.includes("hi") || p.includes("ជំរាបសួរ")) {
    return "សួស្តី! ខ្ញុំជាជំនួយការសាលារៀន (School Assistant)។ ខ្ញុំអាចជួយលោកអ្នកអំពីការគ្រប់គ្រងព័ត៌មានសិស្ស វត្តមាន ការបញ្ចូលពិន្ទុ កាលវិភាគបង្រៀន និងកាលវិភាគប្រឡងក្នុងប្រព័ន្ធសាលាបាន។ តើខ្ញុំអាចជួយអ្វីលោកអ្នកថ្ងៃនេះ?";
  }
  if (p.includes("វត្តមាន") || p.includes("attendance") || p.includes("អវត្តមាន")) {
    return "អំពីការគ្រប់គ្រងវត្តមាន (Attendance Management):\n- លោកអ្នកអាចចូលទៅកាន់ម៉ឺនុយ **'វត្តមានសិស្ស (Attendance)'** ដើម្បីកត់ត្រាវត្តមានតាមថ្នាក់រៀននីមួយៗ\n- ប្រព័ន្ធគាំទ្រវត្តមាន (មានវត្តមាន, ច្បាប់, អវត្តមានឥតច្បាប់) និងគណនាភាគរយស្វ័យប្រវត្តិនៃការសិក្សា\n- របាយការណ៍ប្រចាំខែ និងប្រចាំឆមាសអាចទាញយកជាទម្រង់ Excel ឬ PDF បានភ្លាមៗ។";
  }
  if (p.includes("ពិន្ទុ") || p.includes("grade") || p.includes("score") || p.includes("ចំណាត់ថ្នាក់") || p.includes("rank")) {
    return "អំពីការគ្រប់គ្រងពិន្ទុ និងចំណាត់ថ្នាក់ (Grades & Ranking):\n- ចូលទៅកាន់ម៉ឺនុយ **'គ្រប់គ្រងពិន្ទុ (Grades & Exams)'**\n- ជ្រើសរើសថ្នាក់រៀន និងមុខវិជ្ជា រួចបញ្ចូលពិន្ទុប្រចាំខែ ឬប្រឡងឆមាស\n- ប្រព័ន្ធនឹងគណនាមធ្យមភាគនិទ្ទេស (A, B, C, D, E, F) និងចំណាត់ថ្នាក់លេខ 1 ដល់ចុងក្រោយដោយស្វ័យប្រវត្តិតាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា។";
  }
  if (p.includes("កាលវិភាគ") || p.includes("schedule") || p.includes("timetable") || p.includes("calendar") || p.includes("ឈប់សម្រាក")) {
    return "អំពីកាលវិភាគសិក្សា & ឈប់សម្រាក (Academic Calendar):\n- ចូលទៅកាន់ផ្ទាំង **'ប្រតិទិនសិក្សា (Academic Calendar)'** លើ Dashboard ឬ Navbar\n- មានកាលបរិច្ឆេទថ្ងៃឈប់សម្រាកបុណ្យជាតិកម្ពុជា (ភ្ជុំបិណ្ឌ, អុំទូក, ចូលឆ្នាំខ្មែរ) និងកាលវិភាគប្រឡងឆមាសទី១ និងទី២\n- អាច Export ជា Google Calendar/iCal (.ics) ឬបោះពុម្ពបានភ្លាមៗ។";
  }
  if (p.includes("បង់ប្រាក់") || p.includes("tuition") || p.includes("fee") || p.includes("khqr") || p.includes("invoice")) {
    return "អំពីថ្លៃសិក្សា និងការទូទាត់ (Tuition & KHQR Payments):\n- ចូលទៅកាន់ម៉ឺនុយ **'ហិរញ្ញវត្ថុ & ថ្លៃសិក្សា (Finance & Tuition)'**\n- អាចបង្កើតវិក្កយបត្រ (Invoice) និងបង្កើត Bakong KHQR Code ស្វ័យប្រវត្តិតាមស្តង់ដារធនាគារជាតិនៃកម្ពុជា ដើម្បីឱ្យមាតាបិតាស្កេនបង់ប្រាក់យ៉ាងងាយស្រួល។";
  }
  return `សូមស្វាគមន៍មកកាន់ជំនួយការប្រព័ន្ធគ្រប់គ្រងសាលារៀនកម្ពុជា!\n\nសំណួររបស់អ្នកអំពី៖ "${prompt.slice(0, 100)}..."\n\nព័ត៌មានជំនួយរហ័ស៖\n- **គ្រប់គ្រងសិស្ស**: ចូលទៅផ្ទាំង "បញ្ជីសិស្ស (Students)" ដើម្បីបន្ថែម ឬកែប្រែទិន្នន័យសិស្ស\n- **កាលវិភាគ & ប្រឡង**: ចូលទៅផ្ទាំង "ប្រតិទិនសិក្សា (Calendar)"\n- **ពិន្ទុ & របាយការណ៍**: ចូលទៅផ្ទាំង "គ្រប់គ្រងពិន្ទុ (Grades)" ឬ "មជ្ឈមណ្ឌលរបាយការណ៍ (Reports)"\n\n*(ចំណាំ៖ កូតា Gemini API លើ Cloud កំពុងប្រើអស់ជាបណ្តោះអាសន្ន ដូច្នេះប្រព័ន្ធបានផ្តល់ចម្លើយបម្រុងពីរចនាសម្ព័ន្ធទិន្នន័យសាលា)*`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Comprehensive health check endpoints for Cloud Run, Kubernetes, and uptime probes
  const sendHealthResponse = (_req: express.Request, res: express.Response) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "Cambodian School Management System API",
    });
  };

  app.get("/health", sendHealthResponse);
  app.get("/healthz", sendHealthResponse);
  app.get("/_health", sendHealthResponse);
  app.get("/ping", sendHealthResponse);

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Multi-turn AI Chatbot with role-based personas and model fallback cascades
  // Models: gemini-3.1-pro-preview (complex tasks), gemini-3.8-flash (general tasks), gemini-3.1-flash-lite (fast/fallback)
  app.post("/api/ai/chat", async (req, res) => {
    const { messages, systemInstruction, modelTier = "general" } = req.body;

    // Build fallback list of models depending on tier
    let candidateModels: string[] = [];
    if (modelTier === "complex") {
      candidateModels = ["gemini-3.1-pro-preview", "gemini-3.8-flash", "gemini-3.1-flash-lite"];
    } else if (modelTier === "fast") {
      candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash"];
    } else {
      candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
    }

    // Format conversation history
    const contents = (messages || []).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text || m.content || "" }],
    }));

    const defaultInstruction =
      systemInstruction ||
      "You are an intelligent educational AI assistant for Cambodian School Management System (សាលារៀនកម្ពុជា). Support Khmer and English fluently.";

    const lastUserPrompt =
      (messages || []).slice().reverse().find((m: any) => m.role === "user")?.text || "";

    let lastError: any = null;

    // Try candidate models sequentially
    for (const modelName of candidateModels) {
      try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: defaultInstruction,
          },
        });

        return res.json({
          success: true,
          text: response.text || "",
          model: modelName,
          isQuotaExceeded: false,
        });
      } catch (err: any) {
        lastError = err;
        const parsed = parseGeminiApiError(err);
        console.warn(`[Chat API] Model "${modelName}" failed (Status: ${parsed.statusCode}, Quota: ${parsed.isQuota}):`, parsed.userMessage);
        // If not a quota/rate-limit error (e.g. malformed body, invalid auth), break and report immediately
        if (!parsed.isQuota && parsed.statusCode !== 503 && parsed.statusCode !== 504) {
          break;
        }
      }
    }

    // If all candidate models failed or quota was exhausted:
    const parsedErr = parseGeminiApiError(lastError);
    if (parsedErr.isQuota) {
      // Graceful offline fallback: Provide smart local school response so user workflow is uninterrupted
      const fallbackText = getSmartOfflineSchoolResponse(lastUserPrompt);
      return res.status(200).json({
        success: true,
        text: `⚠️ [កូតា Gemini API ត្រូវបានប្រើអស់ជាបណ្តោះអាសន្ន - បានប្តូរទៅកាន់ប្រព័ន្ធជំនួយការសាលាស្វ័យប្រវត្តិ]\n\n${fallbackText}`,
        model: "System-Offline-Assistant",
        isQuotaExceeded: true,
        quotaNotice: parsedErr.userMessage,
        helpUrl: parsedErr.helpUrl,
      });
    }

    console.error("Chat API Exhausted Error:", lastError);
    return res.status(parsedErr.statusCode).json({
      success: false,
      error: parsedErr.userMessage,
      isQuotaExceeded: parsedErr.isQuota,
      helpUrl: parsedErr.helpUrl,
    });
  });

  // 2. Search Grounding with Quota Fallback
  app.post("/api/ai/search-grounding", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: "Prompt is required." });
    }

    try {
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return res.json({
        success: true,
        text: response.text || "",
        sources: chunks,
      });
    } catch (err: any) {
      const parsed = parseGeminiApiError(err);
      console.error("Search Grounding Error:", parsed.userMessage);

      // Attempt fallback to fast lite model without search tool if quota on flash is exhausted
      if (parsed.isQuota) {
        try {
          const ai = getGenAI();
          const fallbackRes = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
          });
          return res.json({
            success: true,
            text: `[⚠️ Google Search Grounding Quota Exceeded - Fallback to Flash Lite]\n\n${fallbackRes.text || ""}`,
            sources: [],
            isQuotaExceeded: true,
          });
        } catch {
          // Fall through to error
        }
      }

      return res.status(parsed.statusCode).json({
        success: false,
        isQuotaExceeded: parsed.isQuota,
        error: parsed.userMessage,
        helpUrl: parsed.helpUrl,
      });
    }
  });

  // 3. Maps Grounding (gemini-3.8-flash with googleMaps tool)
  app.post("/api/ai/maps-grounding", async (req, res) => {
    try {
      const { prompt, latitude, longitude } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, error: "Prompt is required." });
      }
      const ai = getGenAI();

      const config: any = {
        tools: [{ googleMaps: {} }],
      };

      if (typeof latitude === "number" && typeof longitude === "number") {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude,
              longitude,
            },
          },
        };
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config,
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return res.json({
        success: true,
        text: response.text || "",
        groundingChunks: chunks,
      });
    } catch (err: any) {
      const parsed = parseGeminiApiError(err);
      console.error("Maps Grounding Error:", parsed.userMessage);
      return res.status(parsed.statusCode).json({
        success: false,
        isQuotaExceeded: parsed.isQuota,
        error: parsed.userMessage,
        helpUrl: parsed.helpUrl,
      });
    }
  });

  // 4. Image Generation & Editing (gemini-3.1-flash-image with gemini-3.1-flash-lite-image fallback)
  app.post("/api/ai/image-generate", async (req, res) => {
    try {
      const { prompt, base64Image, mimeType = "image/png", aspectRatio = "1:1" } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, error: "Prompt is required." });
      }
      const ai = getGenAI();

      const parts: any[] = [];
      if (base64Image) {
        const cleanBase64 = base64Image.includes("base64,")
          ? base64Image.split("base64,")[1]
          : base64Image;
        parts.push({
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || "image/png",
          },
        });
      }
      parts.push({ text: prompt });

      // Try primary model first, fallback to lite model if quota exhausted
      let response: any = null;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-image",
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
            },
          },
        });
      } catch (primaryErr: any) {
        const primaryParsed = parseGeminiApiError(primaryErr);
        if (primaryParsed.isQuota) {
          console.warn("[Image Gen] gemini-3.1-flash-image hit quota, attempting gemini-3.1-flash-lite-image...");
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite-image",
            contents: { parts },
            config: {
              imageConfig: {
                aspectRatio: aspectRatio as any,
              },
            },
          });
        } else {
          throw primaryErr;
        }
      }

      let generatedImageUrl: string | null = null;
      let responseText = "";

      const candidateParts = response.candidates?.[0]?.content?.parts || [];
      for (const part of candidateParts) {
        if (part.inlineData) {
          generatedImageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
        } else if (part.text) {
          responseText += part.text;
        }
      }

      if (!generatedImageUrl && !responseText) {
        throw new Error("No image or text returned by the model.");
      }

      return res.json({
        success: true,
        imageUrl: generatedImageUrl,
        text: responseText,
      });
    } catch (err: any) {
      const parsed = parseGeminiApiError(err);
      console.error("Image Generation Error:", parsed.userMessage);
      return res.status(parsed.statusCode).json({
        success: false,
        isQuotaExceeded: parsed.isQuota,
        error: parsed.userMessage,
        helpUrl: parsed.helpUrl,
      });
    }
  });

  // 5. Audio Transcription (gemini-3.5-transcribe with gemini-3.8-flash fallback)
  app.post("/api/ai/transcribe", async (req, res) => {
    try {
      const { base64Audio, mimeType = "audio/webm", prompt = "Please transcribe this spoken audio accurately. Output the exact transcribed text." } = req.body;
      if (!base64Audio) {
        return res.status(400).json({ success: false, error: "Audio data is required." });
      }
      const ai = getGenAI();

      const cleanAudio = base64Audio.includes("base64,")
        ? base64Audio.split("base64,")[1]
        : base64Audio;

      const audioPart = {
        inlineData: {
          mimeType,
          data: cleanAudio,
        },
      };

      let response: any = null;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-transcribe",
          contents: {
            parts: [audioPart, { text: prompt }],
          },
        });
      } catch (transcribeErr: any) {
        const parsed = parseGeminiApiError(transcribeErr);
        if (parsed.isQuota) {
          console.warn("[Transcribe] gemini-3.5-transcribe hit quota, attempting gemini-3.8-flash fallback...");
          response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: {
              parts: [audioPart, { text: prompt }],
            },
          });
        } else {
          throw transcribeErr;
        }
      }

      return res.json({
        success: true,
        text: response.text || "",
      });
    } catch (err: any) {
      const parsed = parseGeminiApiError(err);
      console.error("Audio Transcription Error:", parsed.userMessage);
      return res.status(parsed.statusCode).json({
        success: false,
        isQuotaExceeded: parsed.isQuota,
        error: parsed.userMessage,
        helpUrl: parsed.helpUrl,
      });
    }
  });

  // 6. Music Generation (lyria-3-clip-preview / lyria-3-pro-preview)
  app.post("/api/ai/music-generate", async (req, res) => {
    try {
      const { prompt, isFullTrack = false, base64Image, mimeType = "image/jpeg" } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, error: "Prompt is required." });
      }
      const ai = getGenAI();
      const model = isFullTrack ? "lyria-3-pro-preview" : "lyria-3-clip-preview";

      let contents: any = prompt;
      if (base64Image) {
        const cleanBase64 = base64Image.includes("base64,")
          ? base64Image.split("base64,")[1]
          : base64Image;
        contents = {
          parts: [
            { text: prompt },
            { inlineData: { data: cleanBase64, mimeType } },
          ],
        };
      }

      const responseStream = await ai.models.generateContentStream({
        model,
        contents,
        config: {
          responseModalities: [Modality.AUDIO],
        },
      });

      let audioBase64 = "";
      let lyrics = "";
      let audioMimeType = "audio/wav";

      for await (const chunk of responseStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              audioMimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
          if (part.text && !lyrics) {
            lyrics = part.text;
          }
        }
      }

      if (!audioBase64) {
        throw new Error("No audio chunks returned from the music model.");
      }

      const audioDataUrl = `data:${audioMimeType};base64,${audioBase64}`;
      return res.json({
        success: true,
        audioUrl: audioDataUrl,
        lyrics,
        model,
      });
    } catch (err: any) {
      const parsed = parseGeminiApiError(err);
      console.error("Music Generation Error:", parsed.userMessage);
      return res.status(parsed.statusCode).json({
        success: false,
        isQuotaExceeded: parsed.isQuota,
        error: parsed.userMessage,
        helpUrl: parsed.helpUrl,
      });
    }
  });

  // 7. Video Generation (Veo 3: veo-3.1-generate-preview)
  // Step A: Start Generation
  app.post("/api/ai/generate-video", async (req, res) => {
    try {
      const { prompt, base64Image, mimeType = "image/png", aspectRatio = "16:9", resolution = "720p" } = req.body;
      const ai = getGenAI();

      const videoPayload: any = {
        model: "veo-3.1-generate-preview",
        config: {
          numberOfVideos: 1,
          resolution: resolution === "1080p" ? "1080p" : "720p",
          aspectRatio: aspectRatio === "9:16" ? "9:16" : "16:9",
        },
      };

      if (prompt) {
        videoPayload.prompt = prompt;
      }

      if (base64Image) {
        const cleanBase64 = base64Image.includes("base64,")
          ? base64Image.split("base64,")[1]
          : base64Image;
        videoPayload.image = {
          imageBytes: cleanBase64,
          mimeType,
        };
      }

      const operation = await ai.models.generateVideos(videoPayload);
      return res.json({
        success: true,
        operationName: operation.name,
      });
    } catch (err: any) {
      const parsed = parseGeminiApiError(err);
      console.error("Video Generation Start Error:", parsed.userMessage);
      return res.status(parsed.statusCode).json({
        success: false,
        isQuotaExceeded: parsed.isQuota,
        error: parsed.userMessage,
        helpUrl: parsed.helpUrl,
      });
    }
  });

  // Step B: Check Video Status
  app.post("/api/ai/video-status", async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        return res.status(400).json({ success: false, error: "operationName is required." });
      }
      const ai = getGenAI();

      const op: any = { name: operationName };
      const updated = await ai.operations.getVideosOperation({ operation: op });

      return res.json({
        success: true,
        done: !!updated.done,
        error: updated.error || null,
      });
    } catch (err: any) {
      const parsed = parseGeminiApiError(err);
      console.error("Video Status Error:", parsed.userMessage);
      return res.status(parsed.statusCode).json({
        success: false,
        isQuotaExceeded: parsed.isQuota,
        error: parsed.userMessage,
        helpUrl: parsed.helpUrl,
      });
    }
  });

  // Step C: Download Completed Video
  app.post("/api/ai/video-download", async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        return res.status(400).json({ success: false, error: "operationName is required." });
      }
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ success: false, error: "Missing API key." });
      }

      const ai = getGenAI();
      const op: any = { name: operationName };
      const updated = await ai.operations.getVideosOperation({ operation: op });

      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) {
        return res.status(404).json({ success: false, error: "No video URI found for operation." });
      }

      const videoRes = await fetch(uri, {
        headers: { "x-goog-api-key": apiKey },
      });

      if (!videoRes.ok) {
        throw new Error(`Failed to fetch video from storage: ${videoRes.statusText}`);
      }

      res.setHeader("Content-Type", "video/mp4");
      const arrayBuffer = await videoRes.arrayBuffer();
      return res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      const parsed = parseGeminiApiError(err);
      console.error("Video Download Error:", parsed.userMessage);
      return res.status(parsed.statusCode).json({
        success: false,
        isQuotaExceeded: parsed.isQuota,
        error: parsed.userMessage,
        helpUrl: parsed.helpUrl,
      });
    }
  });

  // Explicit JSON 404 handler for any unhandled /api/* routes
  // Prevents API routes from falling through to Vite or index.html SPA fallback
  app.all("/api/*", (req, res) => {
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.originalUrl || req.path}`,
    });
  });

  // Global API error handler ensuring JSON responses
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith("/api/")) {
      console.error("API Uncaught Error:", err);
      return res.status(err.status || 500).json({
        success: false,
        error: err?.message || "Internal server error in API",
      });
    }
    next(err);
  });

  // Determine whether to serve Vite dev middleware or static production build
  // Production detection:
  // 1. Running compiled bundle (dist/server.cjs)
  // 2. Explicit NODE_ENV === "production"
  // 3. npm start lifecycle (npm_lifecycle_event === "start")
  // 4. Built dist/index.html exists and NOT running explicit dev server (DEV_MODE !== "true")
  const isRunningFromDist =
    typeof __filename !== "undefined" &&
    (__filename.endsWith(".cjs") || __filename.includes("dist"));
  const isExplicitDev = process.env.DEV_MODE === "true";

  // Resolve built client directory (dist/)
  const distDirCandidates = [
    path.join(process.cwd(), "dist"),
    typeof __dirname !== "undefined" ? path.resolve(__dirname, ".") : "",
    typeof __dirname !== "undefined" ? path.resolve(__dirname, "..", "dist") : "",
  ].filter(Boolean);

  let distPath = path.join(process.cwd(), "dist");
  let hasBuiltDist = false;
  for (const cand of distDirCandidates) {
    if (fs.existsSync(path.join(cand, "index.html"))) {
      distPath = cand;
      hasBuiltDist = true;
      break;
    }
  }

  const isProduction =
    isRunningFromDist ||
    process.env.NODE_ENV === "production" ||
    process.env.npm_lifecycle_event === "start" ||
    (!isExplicitDev && hasBuiltDist);

  if (!isProduction) {
    console.log("[Development] Initializing Vite middleware for dynamic development...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== "true" },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log(`[Production] Serving static files from: ${distPath}`);
    app.use(express.static(distPath, { maxAge: "1d", index: "index.html" }));
    app.use("/tyschool", express.static(distPath, { maxAge: "1d", index: "index.html" }));
    app.get("*", (_req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Application index.html not found. Please build the client using 'npm run build'.");
      }
    });
  }

  // Create HTTP Server & WebSocket Server for Gemini Live API Voice Conversations
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: "/api/ai/live" });

  wss.on("error", (err: any) => {
    console.error("Gemini Live WebSocket Server Error:", err);
  });

  wss.on("connection", async (clientWs: WebSocket) => {
    console.log("Client connected to Gemini Live Voice WebSocket.");
    let liveSession: any = null;

    try {
      const ai = getGenAI();
      liveSession = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Zephyr" },
            },
          },
          systemInstruction:
            "You are an encouraging, polite voice assistant for students and teachers at Cambodian School Management System. You speak both Khmer and English naturally and succinctly.",
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            try {
              const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audio && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ audio }));
              }
              if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ interrupted: true }));
              }
            } catch (msgErr) {
              console.error("Error sending live message to client:", msgErr);
            }
          },
          onclose: () => {
            console.log("Gemini Live Session closed.");
          },
          onerror: (e: any) => {
            console.error("Gemini Live Error:", e);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ error: e?.message || "Live API session error" }));
            }
          },
        },
      });

      clientWs.on("message", (data: any) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio && liveSession) {
            liveSession.sendRealtimeInput({
              audio: {
                data: parsed.audio,
                mimeType: "audio/pcm;rate=16000",
              },
            });
          }
          if (parsed.text && liveSession) {
            liveSession.sendRealtimeInput({
              text: parsed.text,
            });
          }
        } catch (inputErr) {
          console.error("Error processing client audio chunk:", inputErr);
        }
      });

      clientWs.on("close", () => {
        if (liveSession) {
          try {
            liveSession.close();
          } catch {}
        }
      });
    } catch (err: any) {
      console.error("Failed to establish Gemini Live connection:", err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            error: err?.message || "Failed to initialize Gemini Live API session.",
          })
        );
        clientWs.close();
      }
    }
  });

  server.on("error", (err: any) => {
    console.error("HTTP Server Error:", err);
  });

  const shutdown = () => {
    console.log("Shutting down server gracefully...");
    server.close(() => {
      process.exit(0);
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
  process.on("unhandledRejection", (reason, promise) => {
    console.warn("Server unhandledRejection:", reason);
  });
  process.on("uncaughtException", (err) => {
    console.error("Server uncaughtException:", err);
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Express + Vite Full-Stack Server running at http://0.0.0.0:${PORT} (Production: ${isProduction})`);
  });
}

startServer().catch((err) => {
  console.error("Fatal Server Startup Error:", err);
});
