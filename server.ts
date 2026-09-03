import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { createServer as createViteServer } from "vite";

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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Multi-turn AI Chatbot with role-based personas and model tiers
  // Models: gemini-3.1-pro-preview (complex tasks), gemini-3.5-flash (general tasks), gemini-3.1-flash-lite (fast)
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, systemInstruction, modelTier = "general" } = req.body;
      const ai = getGenAI();

      let selectedModel = "gemini-3.5-flash";
      if (modelTier === "complex") {
        selectedModel = "gemini-3.1-pro-preview";
      } else if (modelTier === "fast") {
        selectedModel = "gemini-3.1-flash-lite";
      }

      // Format conversation history
      const contents = (messages || []).map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text || m.content || "" }],
      }));

      const defaultInstruction =
        systemInstruction ||
        "You are an intelligent educational AI assistant for Cambodian School Management System (សាលារៀនកម្ពុជា). Support Khmer and English fluently.";

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction: defaultInstruction,
        },
      });

      res.json({
        success: true,
        text: response.text || "",
        model: selectedModel,
      });
    } catch (err: any) {
      console.error("Chat API Error:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Failed to generate chat response.",
      });
    }
  });

  // 2. Search Grounding (gemini-3.5-flash with googleSearch tool)
  app.post("/api/ai/search-grounding", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
      }
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      res.json({
        success: true,
        text: response.text || "",
        sources: chunks,
      });
    } catch (err: any) {
      console.error("Search Grounding Error:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Failed to perform search grounded generation.",
      });
    }
  });

  // 3. Maps Grounding (gemini-3.5-flash with googleMaps tool)
  app.post("/api/ai/maps-grounding", async (req, res) => {
    try {
      const { prompt, latitude, longitude } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
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
        model: "gemini-3.5-flash",
        contents: prompt,
        config,
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      res.json({
        success: true,
        text: response.text || "",
        groundingChunks: chunks,
      });
    } catch (err: any) {
      console.error("Maps Grounding Error:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Failed to perform maps grounded generation.",
      });
    }
  });

  // 4. Image Generation & Editing (gemini-3.1-flash-image-preview / gemini-3.1-flash-image)
  app.post("/api/ai/image-generate", async (req, res) => {
    try {
      const { prompt, base64Image, mimeType = "image/png", aspectRatio = "1:1" } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
      }
      const ai = getGenAI();

      const parts: any[] = [];
      if (base64Image) {
        // Strip data prefix if provided
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

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image-preview",
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });

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

      res.json({
        success: true,
        imageUrl: generatedImageUrl,
        text: responseText,
      });
    } catch (err: any) {
      console.error("Image Generation Error:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Failed to generate/edit image.",
      });
    }
  });

  // 5. Audio Transcription (gemini-3.5-transcribe)
  app.post("/api/ai/transcribe", async (req, res) => {
    try {
      const { base64Audio, mimeType = "audio/webm", prompt = "Please transcribe this spoken audio accurately. Output the exact transcribed text." } = req.body;
      if (!base64Audio) {
        return res.status(400).json({ error: "Audio data is required." });
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

      const response = await ai.models.generateContent({
        model: "gemini-3.5-transcribe",
        contents: {
          parts: [audioPart, { text: prompt }],
        },
      });

      res.json({
        success: true,
        text: response.text || "",
      });
    } catch (err: any) {
      console.error("Audio Transcription Error:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Failed to transcribe audio.",
      });
    }
  });

  // 6. Music Generation (lyria-3-clip-preview for clips up to 30s, lyria-3-pro-preview for full tracks)
  app.post("/api/ai/music-generate", async (req, res) => {
    try {
      const { prompt, isFullTrack = false, base64Image, mimeType = "image/jpeg" } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
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
      res.json({
        success: true,
        audioUrl: audioDataUrl,
        lyrics,
        model,
      });
    } catch (err: any) {
      console.error("Music Generation Error:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Failed to generate music track.",
      });
    }
  });

  // 7. Video Generation (Veo 3: veo-3.1-fast-generate-preview)
  // Step A: Start Generation
  app.post("/api/ai/generate-video", async (req, res) => {
    try {
      const { prompt, base64Image, mimeType = "image/png", aspectRatio = "16:9", resolution = "720p" } = req.body;
      const ai = getGenAI();

      const videoPayload: any = {
        model: "veo-3.1-fast-generate-preview",
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
      res.json({
        success: true,
        operationName: operation.name,
      });
    } catch (err: any) {
      console.error("Video Generation Start Error:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Failed to start Veo video generation.",
      });
    }
  });

  // Step B: Check Video Status
  app.post("/api/ai/video-status", async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        return res.status(400).json({ error: "operationName is required." });
      }
      const ai = getGenAI();

      const op: any = { name: operationName };
      const updated = await ai.operations.getVideosOperation({ operation: op });

      res.json({
        success: true,
        done: !!updated.done,
        error: updated.error || null,
      });
    } catch (err: any) {
      console.error("Video Status Error:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Failed to check video status.",
      });
    }
  });

  // Step C: Download Completed Video
  app.post("/api/ai/video-download", async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        return res.status(400).json({ error: "operationName is required." });
      }
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Missing API key." });
      }

      const ai = getGenAI();
      const op: any = { name: operationName };
      const updated = await ai.operations.getVideosOperation({ operation: op });

      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) {
        return res.status(404).json({ error: "No video URI found for operation." });
      }

      const videoRes = await fetch(uri, {
        headers: { "x-goog-api-key": apiKey },
      });

      if (!videoRes.ok) {
        throw new Error(`Failed to fetch video from storage: ${videoRes.statusText}`);
      }

      res.setHeader("Content-Type", "video/mp4");
      const arrayBuffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error("Video Download Error:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Failed to download video.",
      });
    }
  });

  // Vite middleware in dev mode / Static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Create HTTP Server & WebSocket Server for Gemini Live API Voice Conversations
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: "/api/ai/live" });

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

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Express + Vite Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal Server Startup Error:", err);
});
