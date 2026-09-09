import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Bot, 
  Music, 
  Video, 
  Image as ImageIcon, 
  Mic, 
  Search, 
  MapPin, 
  Send, 
  RefreshCw, 
  Play, 
  Square, 
  Download, 
  Upload, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Info, 
  AlertCircle, 
  Layers, 
  Cpu, 
  FileText,
  ExternalLink,
  ChevronRight,
  Radio
} from 'lucide-react';
import { User, Language } from '../types';
import { GeminiAIService, GroundingSource } from '../services/geminiAiService';

interface GeminiAiStudioViewProps {
  currentUser: User;
  language: Language;
}

type AIToolTab = 'CHATBOT' | 'MUSIC' | 'IMAGE' | 'VIDEO' | 'VOICE_LIVE' | 'SEARCH' | 'MAPS' | 'TRANSCRIBE';

interface ChatHistoryItem {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  model?: string;
}

export const GeminiAiStudioView: React.FC<GeminiAiStudioViewProps> = ({ currentUser, language }) => {
  const [activeTab, setActiveTab] = useState<AIToolTab>('CHATBOT');

  // ================= 1. AI Chatbot State =================
  const [chatMessages, setChatMessages] = useState<ChatHistoryItem[]>([
    {
      id: 'init-1',
      role: 'model',
      text: language === 'km' 
        ? 'សួស្តី! ខ្ញុំជាជំនួយការ AI សាលារៀនកម្ពុជា (Gemini Multimodal AI)។ តើខ្ញុំអាចជួយអ្វីដល់លោកអ្នកបានថ្ងៃនេះ?'
        : 'Hello! I am your Cambodian School Management AI Assistant. How may I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'gemini-3.5-flash'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatModelTier, setChatModelTier] = useState<'complex' | 'general' | 'fast'>('general');
  const [chatRolePersona, setChatRolePersona] = useState<string>('school_advisor');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // ================= 2. Music (Lyria) State =================
  const [musicPrompt, setMusicPrompt] = useState('An inspiring and uplifting orchestral school graduation anthem with traditional Cambodian Khmer flute and drums');
  const [isMusicFullTrack, setIsMusicFullTrack] = useState(false);
  const [musicImage, setMusicImage] = useState<string | null>(null);
  const [isMusicGenerating, setIsMusicGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generatedLyrics, setGeneratedLyrics] = useState<string>('');
  const [usedMusicModel, setUsedMusicModel] = useState<string>('');
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);

  // ================= 3. Image Generation / Editing State =================
  const [imagePrompt, setImagePrompt] = useState('A futuristic high-tech Cambodian classroom in Phnom Penh with students learning coding on hologram screens, ultra-detailed 8k');
  const [imageAspectRatio, setImageAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [sourceImageForEdit, setSourceImageForEdit] = useState<string | null>(null);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedImageCaption, setGeneratedImageCaption] = useState<string>('');

  // ================= 4. Veo Video Generation State =================
  const [videoPrompt, setVideoPrompt] = useState('Animate the school courtyard with students celebrating graduation, gentle cinematic drone camera pan');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoSourceImage, setVideoSourceImage] = useState<string | null>(null);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoStatusMessage, setVideoStatusMessage] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // ================= 5. Voice Conversation (Live API) State =================
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLiveRecording, setIsLiveRecording] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string>('Ready to connect to Gemini Live (Zephyr Voice)');
  const liveWsRef = useRef<WebSocket | null>(null);
  const liveAudioCtxRef = useRef<AudioContext | null>(null);
  const liveInputMediaStreamRef = useRef<MediaStream | null>(null);
  const nextLiveStartTimeRef = useRef<number>(0);

  // ================= 6. Search Grounding State =================
  const [searchPrompt, setSearchPrompt] = useState('Latest updates on Ministry of Education Youth and Sport Cambodia (MoEYS) national curriculum 2026');
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchResultText, setSearchResultText] = useState('');
  const [searchSources, setSearchSources] = useState<GroundingSource[]>([]);

  // ================= 7. Maps Grounding State =================
  const [mapsPrompt, setMapsPrompt] = useState('Top educational technology universities and libraries in Phnom Penh and Siem Reap');
  const [isMapsLoading, setIsMapsLoading] = useState(false);
  const [mapsResultText, setMapsResultText] = useState('');
  const [mapsSources, setMapsSources] = useState<GroundingSource[]>([]);

  // ================= 8. Audio Transcription State =================
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Feedback/Error message banner
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  // Handle Multi-turn Chat Submit
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setErrorMessage(null);

    const userMsg: ChatHistoryItem = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setIsChatLoading(true);

    try {
      let roleInstruction = "You are a versatile AI school assistant.";
      if (chatRolePersona === 'school_advisor') {
        roleInstruction = "You are an experienced School Academic Advisor and Principal for Cambodian School Management System. Help with education planning, curriculum, study schedules, KHQR tuition, and student counseling.";
      } else if (chatRolePersona === 'stem_tutor') {
        roleInstruction = "You are a master STEM, Coding, and Mathematics tutor for Cambodian students. Explain concepts step by step with clear examples in JavaScript, Python, and Math.";
      } else if (chatRolePersona === 'khmer_culture') {
        roleInstruction = "You are an expert in Khmer language, literature, history, and culture. Support teachers and students in accurate Khmer grammar, spelling, and historical context.";
      }

      const res = await GeminiAIService.sendChatMessage(
        newHistory.map(m => ({ role: m.role, text: m.text })),
        roleInstruction,
        chatModelTier
      );

      setChatMessages(prev => [
        ...prev,
        {
          id: `mod-${Date.now()}`,
          role: 'model',
          text: res.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: res.model
        }
      ]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to receive AI response.');
    } finally {
      setIsChatLoading(false);
    }
  };

  // Music Generator Submit
  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim() || isMusicGenerating) return;
    setIsMusicGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await GeminiAIService.generateMusic({
        prompt: musicPrompt,
        isFullTrack: isMusicFullTrack,
        base64Image: musicImage || undefined,
      });

      setGeneratedAudioUrl(res.audioUrl);
      setGeneratedLyrics(res.lyrics);
      setUsedMusicModel(res.model);
      setSuccessMessage(`Music generated successfully via ${res.model}!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Music generation failed.');
    } finally {
      setIsMusicGenerating(false);
    }
  };

  // Image Generator Submit
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isImageGenerating) return;
    setIsImageGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await GeminiAIService.generateOrEditImage({
        prompt: imagePrompt,
        base64Image: sourceImageForEdit || undefined,
        aspectRatio: imageAspectRatio,
      });

      if (res.imageUrl) {
        setGeneratedImageUrl(res.imageUrl);
      }
      setGeneratedImageCaption(res.text);
      setSuccessMessage('Image generated / edited successfully with gemini-3.1-flash-image-preview!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Image generation failed.');
    } finally {
      setIsImageGenerating(false);
    }
  };

  // Veo Video Generator Submit
  const handleGenerateVideo = async () => {
    if (isVideoGenerating) return;
    setIsVideoGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setVideoStatusMessage('Initializing Veo 3 Video Model...');

    try {
      const videoBlobUrl = await GeminiAIService.generateVideo(
        {
          prompt: videoPrompt || undefined,
          base64Image: videoSourceImage || undefined,
          aspectRatio: videoAspectRatio,
        },
        (status) => setVideoStatusMessage(status)
      );

      setGeneratedVideoUrl(videoBlobUrl);
      setSuccessMessage('Veo 3 video generation complete!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Veo video generation failed.');
    } finally {
      setIsVideoGenerating(false);
      setVideoStatusMessage('');
    }
  };

  // Search Grounding Submit
  const handleSearchGrounding = async () => {
    if (!searchPrompt.trim() || isSearchLoading) return;
    setIsSearchLoading(true);
    setErrorMessage(null);

    try {
      const res = await GeminiAIService.searchGroundedQuery(searchPrompt);
      setSearchResultText(res.text);
      setSearchSources(res.sources);
    } catch (err: any) {
      setErrorMessage(err.message || 'Search grounding failed.');
    } finally {
      setIsSearchLoading(false);
    }
  };

  // Maps Grounding Submit
  const handleMapsGrounding = async () => {
    if (!mapsPrompt.trim() || isMapsLoading) return;
    setIsMapsLoading(true);
    setErrorMessage(null);

    try {
      // Default to Phnom Penh Cambodia coordinates if geolocation not active
      let coords = { latitude: 11.5564, longitude: 104.9282 };
      if (navigator.geolocation) {
        try {
          const pos: any = await new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 });
          });
          coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } catch {}
      }

      const res = await GeminiAIService.mapsGroundedQuery(mapsPrompt, coords);
      setMapsResultText(res.text);
      setMapsSources(res.groundingChunks);
    } catch (err: any) {
      setErrorMessage(err.message || 'Maps grounding failed.');
    } finally {
      setIsMapsLoading(false);
    }
  };

  // Start Audio Recording for Transcription
  const handleStartAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecordingAudio(true);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage('Microphone access denied or not available.');
    }
  };

  const handleStopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  const handleTranscribeRecordedAudio = async () => {
    if (!recordedAudioBlob || isTranscribing) return;
    setIsTranscribing(true);
    setErrorMessage(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(recordedAudioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        try {
          const text = await GeminiAIService.transcribeAudio(base64Audio, 'audio/webm');
          setTranscribedText(text);
          setSuccessMessage('Audio successfully transcribed via gemini-3.5-transcribe!');
        } catch (subErr: any) {
          setErrorMessage(subErr.message || 'Transcription failed.');
        } finally {
          setIsTranscribing(false);
        }
      };
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read audio data.');
      setIsTranscribing(false);
    }
  };

  // Live API Voice Conversation Connect/Disconnect
  const handleToggleLiveSession = async () => {
    if (isLiveConnected) {
      // Disconnect
      if (liveWsRef.current) {
        liveWsRef.current.close();
        liveWsRef.current = null;
      }
      if (liveInputMediaStreamRef.current) {
        liveInputMediaStreamRef.current.getTracks().forEach(t => t.stop());
        liveInputMediaStreamRef.current = null;
      }
      if (liveAudioCtxRef.current) {
        liveAudioCtxRef.current.close();
        liveAudioCtxRef.current = null;
      }
      setIsLiveConnected(false);
      setIsLiveRecording(false);
      setLiveStatus('Live conversation session ended.');
      return;
    }

    try {
      setLiveStatus('Connecting to Gemini Live API WebSocket...');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ai/live`;
      const ws = new WebSocket(wsUrl);
      liveWsRef.current = ws;

      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      liveAudioCtxRef.current = outputCtx;
      nextLiveStartTimeRef.current = outputCtx.currentTime;

      ws.onopen = async () => {
        setIsLiveConnected(true);
        setLiveStatus('Connected! Requesting microphone access...');

        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          liveInputMediaStreamRef.current = micStream;
          const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
          const source = inputCtx.createMediaStreamSource(micStream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);

          source.connect(processor);
          processor.connect(inputCtx.destination);

          processor.onaudioprocess = (e) => {
            if (ws.readyState === WebSocket.OPEN) {
              const inputData = e.inputBuffer.getChannelData(0);
              // Convert Float32Array to 16-bit PCM Little Endian
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
              }
              const binary = String.fromCharCode(...new Uint8Array(pcm16.buffer));
              const base64 = btoa(binary);
              ws.send(JSON.stringify({ audio: base64 }));
            }
          };

          setIsLiveRecording(true);
          setLiveStatus('🎙️ Live Real-Time Voice Conversation Active (Speak into your mic)');
        } catch (micErr: any) {
          setErrorMessage('Microphone access denied for Live API.');
          setLiveStatus('Mic access error. Check browser permissions.');
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            setErrorMessage(data.error);
            setLiveStatus(`Error: ${data.error}`);
            return;
          }
          if (data.interrupted) {
            nextLiveStartTimeRef.current = outputCtx.currentTime;
          }
          if (data.audio) {
            // Play 24kHz PCM chunk
            const binary = atob(data.audio);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            const pcm16 = new Int16Array(bytes.buffer);
            const float32 = new Float32Array(pcm16.length);
            for (let i = 0; i < pcm16.length; i++) {
              float32[i] = pcm16[i] / 32768.0;
            }

            const audioBuffer = outputCtx.createBuffer(1, float32.length, 24000);
            audioBuffer.getChannelData(0).set(float32);

            const bufferSource = outputCtx.createBufferSource();
            bufferSource.buffer = audioBuffer;
            bufferSource.connect(outputCtx.destination);

            const startTime = Math.max(nextLiveStartTimeRef.current, outputCtx.currentTime);
            bufferSource.start(startTime);
            nextLiveStartTimeRef.current = startTime + audioBuffer.duration;
          }
        } catch (e) {
          console.error('Error handling live audio response:', e);
        }
      };

      ws.onclose = () => {
        setIsLiveConnected(false);
        setIsLiveRecording(false);
        setLiveStatus('Live WebSocket connection closed.');
      };

      ws.onerror = (e) => {
        console.error('Live WebSocket error:', e);
        setErrorMessage('WebSocket connection error.');
      };
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to start live session.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-purple-950/40 border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Google Gemini Multimodal AI Studio Suite</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight font-battambang">
              មជ្ឈមណ្ឌលបញ្ញាសិប្បនិម្មិត Gemini AI (Multimodal AI Hub)
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-battambang max-w-3xl leading-relaxed">
              ប្រព័ន្ធ AI ជំនាន់ថ្មីរួមបញ្ចូលគ្នានូវ <strong>Gemini 3.5 & 3.1 Pro Chatbot</strong>, <strong>Lyria Music Generation</strong>, <strong>Veo Video Generator</strong>, <strong>Image Creation</strong>, <strong>Live API Voice Conversations</strong>, និង <strong>Search & Maps Grounding</strong>។
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Online & Connected</span>
            </span>
          </div>
        </div>

        {/* Global Alert Notification */}
        {errorMessage && (
          <div
            id="ai-studio-error-banner"
            className={`mt-4 p-4 rounded-2xl border text-xs animate-in fade-in ${
              errorMessage.includes('429') ||
              errorMessage.includes('Quota') ||
              errorMessage.includes('កូតា') ||
              errorMessage.includes('RESOURCE_EXHAUSTED')
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-100'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <AlertCircle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    errorMessage.includes('429') ||
                    errorMessage.includes('Quota') ||
                    errorMessage.includes('កូតា') ||
                    errorMessage.includes('RESOURCE_EXHAUSTED')
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                />
                <div>
                  <p className="font-bold text-sm">
                    {errorMessage.includes('429') ||
                    errorMessage.includes('Quota') ||
                    errorMessage.includes('កូតា') ||
                    errorMessage.includes('RESOURCE_EXHAUSTED')
                      ? 'កូតា Gemini API ត្រូវបានប្រើអស់ជាបណ្តោះអាសន្ន (Quota Limit - HTTP 429)'
                      : 'មានបញ្ហាក្នុងការដំណើរការ (Action Failed)'}
                  </p>
                  <p className="mt-1 leading-relaxed text-slate-300">{errorMessage}</p>

                  {(errorMessage.includes('429') ||
                    errorMessage.includes('Quota') ||
                    errorMessage.includes('កូតា') ||
                    errorMessage.includes('RESOURCE_EXHAUSTED')) && (
                    <div className="mt-3 pt-3 border-t border-amber-500/20 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setChatModelTier('fast');
                          setErrorMessage(null);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold border border-amber-500/30 transition text-[11px]"
                      >
                        ⚡ ប្តូរទៅ gemini-3.1-flash-lite (សន្សំកូតា)
                      </button>
                      <a
                        href="https://ai.google.dev/gemini-api/docs/rate-limits"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-medium transition text-[11px] inline-flex items-center space-x-1"
                      >
                        <span>ពិនិត្យកម្រិតកូតា (Rate Limits) ↗</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-slate-400 hover:text-white p-1 ml-3"
                title="បិទ (Close)"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200 p-1">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Main Tool Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
        {[
          { id: 'CHATBOT', labelKhmer: 'Gemini Chatbot', labelEnglish: 'Multi-turn Chat', icon: Bot },
          { id: 'MUSIC', labelKhmer: 'បង្កើតតន្ត្រី (Lyria 3)', labelEnglish: 'Music Generation', icon: Music },
          { id: 'IMAGE', labelKhmer: 'បង្កើត & កែរូបភាព (Image)', labelEnglish: 'Create & Edit Image', icon: ImageIcon },
          { id: 'VIDEO', labelKhmer: 'បង្កើតវីដេអូ (Veo 3)', labelEnglish: 'Veo Video Generator', icon: Video },
          { id: 'VOICE_LIVE', labelKhmer: 'សន្ទនាជាសំឡេង (Live API)', labelEnglish: 'Voice Conversations', icon: Radio },
          { id: 'SEARCH', labelKhmer: 'Google Search Data', labelEnglish: 'Search Grounding', icon: Search },
          { id: 'MAPS', labelKhmer: 'Google Maps Data', labelEnglish: 'Maps Grounding', icon: MapPin },
          { id: 'TRANSCRIBE', labelKhmer: 'បំលែងសំឡេងជាអក្សរ', labelEnglish: 'Audio Transcription', icon: Mic },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AIToolTab)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.labelKhmer}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: MULTI-TURN AI CHATBOT ================= */}
      {activeTab === 'CHATBOT' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Sidebar */}
          <div className="lg:col-span-1 p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4 font-battambang text-xs">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>ការកំណត់ Chatbot Role & Model</span>
            </h3>

            <div>
              <label className="text-slate-400 block mb-1 font-bold">តួនាទី AI Persona (Role):</label>
              <select
                value={chatRolePersona}
                onChange={(e) => setChatRolePersona(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="school_advisor">🏫 ទីប្រឹក្សាអប់រំ & សាលារៀន (Academic Advisor)</option>
                <option value="stem_tutor">💻 គ្រូបង្រៀន STEM & Coding (Math & Coding Tutor)</option>
                <option value="khmer_culture">🇰🇭 គ្រូភាសាខ្មែរ & ប្រវត្តិសាស្ត្រ (Khmer Language & Culture)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-bold">កម្រិតម៉ូឌែល (Model Tier):</label>
              <div className="space-y-2">
                {[
                  { id: 'general', name: 'gemini-3.8-flash', desc: 'សមតុល្យល្បឿន និងឆ្លាតវៃខ្ពស់ (General Tasks)' },
                  { id: 'complex', name: 'gemini-3.1-pro-preview', desc: 'ការគិតស៊ីជម្រៅ & កូដស្មុគស្មាញ (Complex Tasks)' },
                  { id: 'fast', name: 'gemini-3.1-flash-lite', desc: 'ឆ្លើយតបរហ័សទាន់ចិត្ត & សន្សំកូតា (Fast & Rate-limit friendly)' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setChatModelTier(tier.id as any)}
                    className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer ${
                      chatModelTier === tier.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-white/5 border-white/5 text-slate-300 hover:border-white/15'
                    }`}
                  >
                    <p className="font-bold font-mono text-[11px] text-indigo-300">{tier.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{tier.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setChatMessages([
                  {
                    id: `reset-${Date.now()}`,
                    role: 'model',
                    text: 'ការសន្ទនាត្រូវបានចាប់ផ្តើមឡើងវិញ! តើខ្ញុំអាចជួយអ្វីដល់លោកអ្នកបាន?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  }
                ]);
              }}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-bold transition flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ជម្រះប្រវត្តិជជែក (Clear Chat)</span>
            </button>
          </div>

          {/* Chat Thread */}
          <div className="lg:col-span-3 p-5 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col h-[580px]">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
              {chatMessages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-br-xs shadow-md'
                          : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1 border-b border-white/10 pb-1 text-[10px] opacity-75">
                        <span className="font-bold font-battambang">{isUser ? 'អ្នក (You)' : 'Gemini AI'}</span>
                        <span className="font-mono">{msg.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-wrap font-battambang">{msg.text}</p>
                      {msg.model && (
                        <div className="mt-2 text-[10px] font-mono text-indigo-300/80 text-right">
                          model: {msg.model}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-indigo-300 flex items-center space-x-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Gemini កំពុងវិភាគ និងឆ្លើយតប...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChatMessage} className="mt-4 pt-3 border-t border-white/10 flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="សួរសំណួរទៅកាន់ Gemini AI (Ask a question in Khmer or English)..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-battambang"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition shadow-md cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 2: MUSIC GENERATION (LYRIA) ================= */}
      {activeTab === 'MUSIC' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-battambang">
          {/* Controls */}
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Music className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">បង្កើតតន្ត្រី និងបទចម្រៀង (Lyria 3 AI Music)</h3>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              បង្កើតបទភ្លេង ឬចម្រៀងពេញលេញតាមការបញ្ជារបស់អ្នក ដោយប្រើប្រាស់ម៉ូឌែល <code>lyria-3-clip-preview</code> (ឃ្លីប 30s) ឬ <code>lyria-3-pro-preview</code> (បទពេញលេញ)។
            </p>

            <div>
              <label className="text-slate-300 block mb-1 text-xs font-bold">ការពិពណ៌នាអំពីបទភ្លេង (Music Prompt):</label>
              <textarea
                value={musicPrompt}
                onChange={(e) => setMusicPrompt(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-3 text-white text-xs focus:ring-2 focus:ring-indigo-500"
                placeholder="ឧ. បទភ្លេងបែបវប្បធម៌ខ្មែរ រួមបញ្ចូលឧបករណ៍ភ្លេងបុរាណ ទ្រអ៊ូ រនាតឯក សម្រាប់ពិធីបុណ្យចូលឆ្នាំថ្មី..."
              />
            </div>

            <div className="flex items-center space-x-4 pt-1">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMusicFullTrack}
                  onChange={(e) => setIsMusicFullTrack(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>បទចម្រៀងពេញលេញ (Full Track with lyria-3-pro-preview)</span>
              </label>
            </div>

            {/* Optional image input for music */}
            <div>
              <label className="text-slate-400 block mb-1 text-xs font-bold">ភ្ជាប់រូបភាពជាគំនិតបទភ្លេង (Optional Image Inspiration):</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setMusicImage(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-white/10 file:text-white file:text-xs hover:file:bg-white/20"
              />
            </div>

            <button
              onClick={handleGenerateMusic}
              disabled={isMusicGenerating || !musicPrompt.trim()}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isMusicGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Lyria 3 កំពុងនិពន្ធបទភ្លេង (Generating audio stream)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ចាប់ផ្តើមបង្កើតតន្ត្រី (Generate Music Track)</span>
                </>
              )}
            </button>
          </div>

          {/* Player & Lyrics Preview */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="font-bold text-white text-sm border-b border-white/10 pb-2">លទ្ធផលបទតន្ត្រី (Generated Audio Player)</h4>
              
              {generatedAudioUrl ? (
                <div className="mt-4 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300">Play Audio</span>
                    <span className="text-[10px] font-mono text-slate-400">{usedMusicModel}</span>
                  </div>
                  <audio
                    ref={musicAudioRef}
                    controls
                    src={generatedAudioUrl}
                    className="w-full rounded-xl"
                  />
                  {generatedLyrics && (
                    <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300">
                      <p className="font-bold text-indigo-400 mb-1">ទំនុកច្រៀង / Lyrics:</p>
                      <p className="whitespace-pre-wrap">{generatedLyrics}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-8 text-center p-8 rounded-2xl bg-white/5 border border-dashed border-white/10 text-slate-400 text-xs space-y-2">
                  <Music className="w-8 h-8 mx-auto text-slate-500" />
                  <p>មិនទាន់មានបទភ្លេងត្រូវបានបង្កើតនៅឡើយទេ។ សូមចុចប៊ូតុង "បង្កើតតន្ត្រី" ខាងឆ្វេង។</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: IMAGE CREATION & EDITING ================= */}
      {activeTab === 'IMAGE' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-battambang">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400">
              <ImageIcon className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">បង្កើត & កែរូបភាព (gemini-3.1-flash-image-preview)</h3>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              បង្កើតរូបភាពថ្មី ឬកែប្រែរូបភាពចាស់ដោយការបញ្ជាអត្ថបទ (Prompt Text & Image Editing) ជាមួយ Aspect Ratio ស្របតាមតម្រូវការ។
            </p>

            <div>
              <label className="text-slate-300 block mb-1 text-xs font-bold">បញ្ជាបង្កើតរូបភាព (Image Prompt):</label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-3 text-white text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 text-xs">ទំហំខ្នាត (Aspect Ratio):</label>
                <select
                  value={imageAspectRatio}
                  onChange={(e) => setImageAspectRatio(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="1:1">1:1 (Square)</option>
                  <option value="16:9">16:9 (Landscape HD)</option>
                  <option value="9:16">9:16 (Portrait / Story)</option>
                  <option value="4:3">4:3 (Standard)</option>
                  <option value="3:4">3:4 (Vertical Standard)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-xs">រូបភាពដើមសម្រាប់កែ (Edit Image):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setSourceImageForEdit(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isImageGenerating || !imagePrompt.trim()}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isImageGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini Image Model កំពុងដំណើរការ...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>បង្កើតរូបភាពឥឡូវនេះ (Generate Image)</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Image Preview */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-center items-center">
            {generatedImageUrl ? (
              <div className="space-y-3 text-center">
                <img
                  src={generatedImageUrl}
                  alt="Generated AI artwork"
                  referrerPolicy="no-referrer"
                  className="max-h-[380px] w-auto rounded-2xl shadow-2xl border border-white/10 mx-auto object-cover"
                />
                {generatedImageCaption && (
                  <p className="text-xs text-slate-300">{generatedImageCaption}</p>
                )}
                <a
                  href={generatedImageUrl}
                  download="gemini-generated-image.png"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ទាញយករូបភាព (Download)</span>
                </a>
              </div>
            ) : (
              <div className="text-center p-8 rounded-2xl bg-white/5 border border-dashed border-white/10 text-slate-400 text-xs space-y-2">
                <ImageIcon className="w-8 h-8 mx-auto text-slate-500" />
                <p>រូបភាពដែលបានបង្កើតនឹងបង្ហាញនៅទីនេះ។</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: VEO VIDEO GENERATOR ================= */}
      {activeTab === 'VIDEO' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-battambang">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Video className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">បង្កើតវីដេអូ Veo 3 (veo-3.1-fast-generate-preview)</h3>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              បង្កើតវីដេអូពីអត្ថបទ (Text-to-Video) ឬបញ្ចូលរូបថតដើម្បីបង្កើតចលនាវីដេអូ (Image-to-Video) ដោយស្វ័យប្រវត្តក្នុងកម្រិត 16:9 ឬ 9:16។
            </p>

            <div>
              <label className="text-slate-300 block mb-1 text-xs font-bold">ការបញ្ជាវីដេអូ (Video Prompt):</label>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-3 text-white text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 text-xs">ទំហំវីដេអូ (Aspect Ratio):</label>
                <select
                  value={videoAspectRatio}
                  onChange={(e) => setVideoAspectRatio(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="16:9">16:9 (Landscape Video)</option>
                  <option value="9:16">9:16 (Portrait / Reels)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-xs">បញ្ចូលរូបថតដើម្បីបម្លែងជាវីដេអូ (Photo):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setVideoSourceImage(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateVideo}
              disabled={isVideoGenerating}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isVideoGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Veo 3 កំពុងដំណើរការបង្កើតវីដេអូ...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>បង្កើតវីដេអូ Veo 3 (Generate Video)</span>
                </>
              )}
            </button>

            {isVideoGenerating && videoStatusMessage && (
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{videoStatusMessage}</span>
              </div>
            )}
          </div>

          {/* Video Player */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col justify-center items-center">
            {generatedVideoUrl ? (
              <div className="space-y-3 text-center w-full">
                <video
                  controls
                  autoPlay
                  loop
                  src={generatedVideoUrl}
                  className="w-full max-h-[380px] rounded-2xl shadow-2xl border border-white/10 object-contain"
                />
                <a
                  href={generatedVideoUrl}
                  download="veo-generated-video.mp4"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ទាញយកវីដេអូ MP4 (Download Video)</span>
                </a>
              </div>
            ) : (
              <div className="text-center p-8 rounded-2xl bg-white/5 border border-dashed border-white/10 text-slate-400 text-xs space-y-2">
                <Video className="w-8 h-8 mx-auto text-slate-500" />
                <p>វីដេអូដែលបានបង្កើតនឹងបង្ហាញនៅទីនេះ។</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 5: VOICE CONVERSATIONS (LIVE API) ================= */}
      {activeTab === 'VOICE_LIVE' && (
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 font-battambang text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-xl">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">សន្ទនាជាសំឡេងផ្ទាល់ (Gemini 3.1 Flash Live API)</h3>
            <p className="text-slate-300 text-xs leading-relaxed max-w-lg mx-auto">
              ជជែកឆ្លើយឆ្លងជាសំឡេងទាន់ចិត្ត (Real-time Full-Duplex Audio) ជាមួយ Gemini Live API ដោយប្រើប្រាស់សំឡេង Zephyr Voice និងបច្ចេកវិទ្យា 16kHz/24kHz PCM Audio Stream។
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-xs space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isLiveConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
              <span className="font-bold text-slate-200">ស្ថានភាព (Status): {liveStatus}</span>
            </div>
          </div>

          <button
            onClick={handleToggleLiveSession}
            className={`px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition shadow-xl cursor-pointer ${
              isLiveConnected
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isLiveConnected ? '⏹️ បញ្ចប់ការសន្ទនា (End Live Session)' : '🎙️ ចាប់ផ្តើមជជែកជាសំឡេង (Start Voice Conversation)'}
          </button>
        </div>
      )}

      {/* ================= TAB 6: SEARCH GROUNDING ================= */}
      {activeTab === 'SEARCH' && (
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-5 font-battambang">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Search className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">ស្វែងរកព័ត៌មានជាក់ស្តែង (Google Search Grounding)</h3>
          </div>
          <p className="text-slate-300 text-xs">
            ដំណើរការដោយ <code>gemini-3.5-flash</code> រួមជាមួយឧបករណ៍ <code>googleSearch</code> ដើម្បីទាញយកទិន្នន័យស្រាវជ្រាវ និងព័ត៌មានថ្មីៗបំផុតពីអុីនធឺណិត។
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={searchPrompt}
              onChange={(e) => setSearchPrompt(e.target.value)}
              placeholder="បញ្ចូលសំណួរស្រាវជ្រាវ (Search Query)..."
              className="flex-1 w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSearchGrounding}
              disabled={isSearchLoading || !searchPrompt.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-md shrink-0 cursor-pointer"
            >
              {isSearchLoading ? 'កំពុងស្វែងរក...' : 'ស្វែងរក (Search)'}
            </button>
          </div>

          {searchResultText && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
              <h4 className="font-bold text-indigo-300 text-xs">ចម្លើយពី Google Search Grounding:</h4>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{searchResultText}</p>

              {searchSources.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400">ប្រភពឯកសារយោង (Sources & Citations):</span>
                  <div className="flex flex-wrap gap-2">
                    {searchSources.map((source: any, idx) => {
                      const web = source.web;
                      if (!web) return null;
                      return (
                        <a
                          key={idx}
                          href={web.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-300 border border-white/10 text-[11px] transition"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate max-w-xs">{web.title || web.uri}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 7: MAPS GROUNDING ================= */}
      {activeTab === 'MAPS' && (
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-5 font-battambang">
          <div className="flex items-center space-x-2 text-indigo-400">
            <MapPin className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">ស្វែងរកទីតាំង និងផែនទី (Google Maps Grounding)</h3>
          </div>
          <p className="text-slate-300 text-xs">
            ដំណើរការដោយ <code>gemini-3.5-flash</code> រួមជាមួយឧបករណ៍ <code>googleMaps</code> សម្រាប់ស្វែងរកទីកន្លែង សាលារៀន សាកលវិទ្យាល័យ និងផ្លូវធ្វើដំណើរ។
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={mapsPrompt}
              onChange={(e) => setMapsPrompt(e.target.value)}
              placeholder="បញ្ចូលទីតាំង ឬសាលារៀនដែលចង់ស្វែងរក..."
              className="flex-1 w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleMapsGrounding}
              disabled={isMapsLoading || !mapsPrompt.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-md shrink-0 cursor-pointer"
            >
              {isMapsLoading ? 'កំពុងស្វែងរក...' : 'ស្វែងរកទីតាំង (Search Maps)'}
            </button>
          </div>

          {mapsResultText && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
              <h4 className="font-bold text-indigo-300 text-xs">លទ្ធផលទីតាំងពី Google Maps Grounding:</h4>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{mapsResultText}</p>

              {mapsSources.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400">តំណភ្ជាប់ទីតាំង Google Maps (Places):</span>
                  <div className="flex flex-wrap gap-2">
                    {mapsSources.map((chunk: any, idx) => {
                      const maps = chunk.maps;
                      if (!maps) return null;
                      return (
                        <a
                          key={idx}
                          href={maps.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] transition"
                        >
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>{maps.title || 'View on Google Maps'}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 8: AUDIO TRANSCRIPTION ================= */}
      {activeTab === 'TRANSCRIBE' && (
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-5 font-battambang max-w-3xl mx-auto">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Mic className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">បំលែងសំឡេងជាអក្សរ (gemini-3.5-transcribe)</h3>
          </div>
          <p className="text-slate-300 text-xs">
            កត់ត្រាសំឡេងផ្ទាល់តាមរយៈមេក្រូហ្វូន (Microphone) និងបម្លែងទៅជាអត្ថបទ (Audio-to-Text Transcription) ដោយស្វ័យប្រវត្ត។
          </p>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 text-center space-y-4">
            <button
              onClick={isRecordingAudio ? handleStopAudioRecording : handleStartAudioRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition shadow-2xl cursor-pointer ${
                isRecordingAudio
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <Mic className="w-8 h-8" />
            </button>
            <p className="text-xs text-slate-300 font-bold">
              {isRecordingAudio ? '🎙️ កំពុងថតសំឡេង... (ចុចម្តងទៀតដើម្បីបញ្ចប់)' : 'ចុចលើរូបមេក្រូហ្វូនដើម្បីចាប់ផ្តើមថត'}
            </p>

            {recordedAudioBlob && (
              <div className="pt-2 space-y-3">
                <p className="text-xs text-emerald-400 font-bold">✓ ទទួលបានឯកសារសំឡេងរួចរាល់</p>
                <button
                  onClick={handleTranscribeRecordedAudio}
                  disabled={isTranscribing}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md cursor-pointer"
                >
                  {isTranscribing ? 'កំពុងបំលែងជាអក្សរ...' : 'បំលែងសំឡេងនេះជាអក្សរ (Transcribe Now)'}
                </button>
              </div>
            )}
          </div>

          {transcribedText && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
              <h4 className="font-bold text-indigo-300 text-xs">អត្ថបទដែលបានបំលែងរួច (Transcribed Text):</h4>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed p-4 rounded-xl bg-black/40 border border-white/5 whitespace-pre-wrap">
                {transcribedText}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
