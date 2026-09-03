import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bot, 
  MessageSquare, 
  Send, 
  X, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Smile, 
  Paperclip, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Copy, 
  Check, 
  Users, 
  User as UserIcon, 
  Search, 
  Shield, 
  GraduationCap, 
  UserCheck,
  CheckCheck,
  Phone,
  Mail,
  ArrowLeft,
  Crown,
  ChevronRight,
  HelpCircle,
  FileText,
  CreditCard,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { User, ChatMessage, UserRole } from '../types';
import { storageService } from '../services/storageService';
import { generateBotReply } from '../services/aiSchoolBot';
import { GeminiAIService } from '../services/geminiAiService';

interface ChatMessengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  users: User[];
  language: 'km' | 'en';
  onUnreadChange?: () => void;
  initialRecipientId?: string; // Optional direct recipient to pre-select
  initialTab?: 'AI_BOT' | 'ALL_SCHOOL' | 'DIRECT';
}

// Gentle pleasant audio synthesizer for chat chimes
function playChatSound(type: 'send' | 'receive') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(920, now + 0.18);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch {
    // AudioContext blocked or not supported
  }
}

export const ChatMessengerModal: React.FC<ChatMessengerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  language,
  onUnreadChange,
  initialRecipientId,
  initialTab
}) => {
  // Navigation Tabs: 'AI_BOT' | 'ALL_SCHOOL' | 'DIRECT'
  const [activeTab, setActiveTab] = useState<'AI_BOT' | 'ALL_SCHOOL' | 'DIRECT'>('AI_BOT');
  
  // Selected user for Direct Message
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Mobile direct view state: 'LIST' or 'THREAD'
  const [mobileDirectView, setMobileDirectView] = useState<'LIST' | 'THREAD'>('THREAD');

  // Direct user filter
  const [contactRoleFilter, setContactRoleFilter] = useState<'ALL' | 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT' | 'STAFF'>('ALL');
  const [contactSearch, setContactSearch] = useState('');
  
  // Chat input
  const [inputText, setInputText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('sms_chat_sound') !== 'false';
  });
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);

  // All stored messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => storageService.getChatMessages());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const isCurrentUserAdmin = ['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN'].includes(currentUser.role) || currentUser.id === 'USR-001';
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.id === 'USR-001';

  // Close when clicking outside modal or pressing Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        const triggerBtn = document.getElementById('navbar-chatbot-btn');
        if (triggerBtn && triggerBtn.contains(event.target as Node)) {
          return;
        }
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Fallback and merged user list
  const effectiveUsers = useMemo(() => {
    const fromStorage = storageService.getUsers();
    if (!users || users.length === 0) return fromStorage;
    const merged = [...users];
    for (const su of fromStorage) {
      if (!merged.some(u => u.id === su.id)) {
        merged.push(su);
      }
    }
    return merged;
  }, [users]);

  // Sync initial tab and recipient if provided
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialRecipientId && initialRecipientId !== 'all-school' && initialRecipientId !== 'ai-bot') {
      const found = effectiveUsers.find(u => u.id === initialRecipientId);
      if (found) {
        setSelectedUser(found);
        setActiveTab('DIRECT');
        setMobileDirectView('THREAD');
      }
    }
  }, [initialRecipientId, effectiveUsers]);

  // Set default selected contact if in DIRECT tab and none selected
  useEffect(() => {
    if (activeTab === 'DIRECT' && !selectedUser) {
      const otherUsers = effectiveUsers.filter(u => u.id !== currentUser.id);
      if (otherUsers.length > 0) {
        // If current user is not admin, prioritize selecting the Super Admin / Admin / Director first!
        if (!isCurrentUserAdmin) {
          const adminUser = otherUsers.find(u => ['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN'].includes(u.role));
          setSelectedUser(adminUser || otherUsers[0]);
        } else {
          // If current user IS admin/super-admin, prioritize user with unread messages or recent messages
          const unreadSender = otherUsers.find(u => {
            const hasUnread = messages.some(m => !m.isRead && (m.recipientId === currentUser.id || m.recipientId === 'USR-001' || m.recipientId === 'admin') && m.senderId === u.id);
            return hasUnread;
          });
          setSelectedUser(unreadSender || otherUsers[0]);
        }
      }
    }
  }, [activeTab, selectedUser, effectiveUsers, currentUser, isCurrentUserAdmin, messages]);

  // Scroll to bottom when messages update
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
      // Mark active conversation read
      const recipientKey = activeTab === 'AI_BOT' 
        ? 'ai-bot' 
        : activeTab === 'ALL_SCHOOL' 
          ? 'all-school' 
          : selectedUser?.id;
      
      if (recipientKey) {
        storageService.markChatMessagesAsRead(recipientKey, currentUser.id, currentUser.role);
        setMessages(storageService.getChatMessages());
        onUnreadChange?.();
      }
    }
  }, [isOpen, activeTab, selectedUser, currentUser.id, currentUser.role]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isBotTyping, isAdminTyping]);

  // Toggle sound
  const handleToggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('sms_chat_sound', String(next));
      return next;
    });
  };

  // Filter messages based on active tab and selected user
  const currentThreadMessages = useMemo(() => {
    if (activeTab === 'AI_BOT') {
      return messages.filter(m => m.recipientId === 'ai-bot' || m.senderId === 'ai-bot');
    }
    if (activeTab === 'ALL_SCHOOL') {
      return messages.filter(m => m.recipientId === 'all-school');
    }
    if (activeTab === 'DIRECT' && selectedUser) {
      return messages.filter(m => {
        const isFromMeToSelected = m.senderId === currentUser.id && (
          m.recipientId === selectedUser.id || 
          (selectedUser.role === 'SUPER_ADMIN' && (m.recipientId === 'USR-001' || m.recipientId === 'admin' || m.recipientId === 'super-admin'))
        );
        const isFromSelectedToMe = m.senderId === selectedUser.id && (
          m.recipientId === currentUser.id ||
          (isCurrentUserAdmin && (m.recipientId === 'USR-001' || m.recipientId === 'admin' || m.recipientId === 'super-admin'))
        );
        return isFromMeToSelected || isFromSelectedToMe;
      });
    }
    return [];
  }, [messages, activeTab, selectedUser, currentUser.id, isCurrentUserAdmin]);

  // School Admins list
  const adminUsers = useMemo(() => {
    return effectiveUsers.filter(u => 
      u.id !== currentUser.id && 
      ['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN'].includes(u.role)
    );
  }, [effectiveUsers, currentUser.id]);

  // Calculate unread counts per user
  const unreadPerUser = useMemo(() => {
    const counts: Record<string, number> = {};
    messages.forEach(m => {
      if (!m.isRead && m.senderId !== currentUser.id) {
        const isForMe = 
          m.recipientId === currentUser.id ||
          (isCurrentUserAdmin && (m.recipientId === 'USR-001' || m.recipientId === 'admin' || m.recipientId === 'super-admin'));
        
        if (isForMe) {
          counts[m.senderId] = (counts[m.senderId] || 0) + 1;
        }
      }
    });
    return counts;
  }, [messages, currentUser.id, isCurrentUserAdmin]);

  // Get last message snippet for any contact
  const getLastMessageInfo = (userId: string) => {
    const thread = messages.filter(m => {
      const isFromMe = m.senderId === currentUser.id && (m.recipientId === userId || (userId === 'USR-001' && (m.recipientId === 'admin' || m.recipientId === 'super-admin')));
      const isFromUser = m.senderId === userId && (
        m.recipientId === currentUser.id || 
        (isCurrentUserAdmin && (m.recipientId === 'USR-001' || m.recipientId === 'admin' || m.recipientId === 'super-admin'))
      );
      return isFromMe || isFromUser;
    });
    if (thread.length === 0) return null;
    const last = thread[thread.length - 1];
    return {
      text: last.type === 'IMAGE' ? '📷 [រូបភាព]' : last.content,
      time: last.timestamp,
      isMine: last.senderId === currentUser.id,
      isRead: last.isRead
    };
  };

  // Filtered contacts list
  const filteredUsers = useMemo(() => {
    const q = contactSearch.trim().toLowerCase();
    const filtered = effectiveUsers.filter(u => {
      if (u.id === currentUser.id) return false;
      const matchesSearch = !q || (
        (u.nameKhmer && u.nameKhmer.toLowerCase().includes(q)) ||
        (u.nameEnglish && u.nameEnglish.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q))
      );

      if (!matchesSearch) return false;

      if (contactRoleFilter === 'ALL') return true;
      if (contactRoleFilter === 'ADMIN') return ['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN'].includes(u.role);
      if (contactRoleFilter === 'TEACHER') return u.role === 'TEACHER';
      if (contactRoleFilter === 'PARENT') return u.role === 'PARENT';
      if (contactRoleFilter === 'STUDENT') return u.role === 'STUDENT';
      if (contactRoleFilter === 'STAFF') return ['ACCOUNTANT', 'LIBRARIAN', 'STAFF'].includes(u.role) || !['ADMIN', 'SUPER_ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'].includes(u.role);

      return true;
    });

    // Sort contacts: 1. Unread count descending, 2. Has last message descending, 3. Role/Name
    return filtered.sort((a, b) => {
      const unreadA = unreadPerUser[a.id] || 0;
      const unreadB = unreadPerUser[b.id] || 0;
      if (unreadA !== unreadB) return unreadB - unreadA;

      const lastA = getLastMessageInfo(a.id);
      const lastB = getLastMessageInfo(b.id);
      if (lastA && !lastB) return -1;
      if (!lastA && lastB) return 1;

      return a.nameKhmer.localeCompare(b.nameKhmer, 'km');
    });
  }, [effectiveUsers, currentUser.id, contactSearch, contactRoleFilter, unreadPerUser, messages, isCurrentUserAdmin]);

  // Auto select active contact when filter changes or on initial selection
  useEffect(() => {
    if (activeTab === 'DIRECT' && filteredUsers.length > 0) {
      const isStillInList = selectedUser && filteredUsers.some(u => u.id === selectedUser.id);
      if (!isStillInList) {
        setSelectedUser(filteredUsers[0]);
      }
    }
  }, [activeTab, contactRoleFilter, filteredUsers]);

  // Handle Send Message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text && !selectedAttachment) return;

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', hour12: true });

    let recipientId = 'all-school';
    let recipientName = 'សាលារៀនទូទៅ';

    if (activeTab === 'AI_BOT') {
      recipientId = 'ai-bot';
      recipientName = 'ជំនួយការ AI';
    } else if (activeTab === 'DIRECT' && selectedUser) {
      recipientId = selectedUser.id;
      recipientName = selectedUser.nameKhmer;
    }

    const newMsg: ChatMessage = {
      id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      senderId: currentUser.id,
      senderName: currentUser.nameKhmer,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      recipientId,
      recipientName,
      content: text,
      timestamp: timeFormatted,
      isRead: true,
      type: selectedAttachment ? 'IMAGE' : 'TEXT',
      attachmentUrl: selectedAttachment || undefined
    };

    storageService.sendChatMessage(newMsg);
    setMessages(storageService.getChatMessages());
    setInputText('');
    setSelectedAttachment(null);
    setShowEmojiPicker(false);
    if (soundEnabled) playChatSound('send');

    // Auto-reply logic for AI Bot (Gemini Multi-turn AI with fallback)
    if (activeTab === 'AI_BOT') {
      setIsBotTyping(true);

      const runGeminiReply = async () => {
        try {
          // Gather existing conversation history
          const botThread = messages.filter(
            m => (m.senderId === 'ai-bot' && m.recipientId === 'ai-bot') || (m.senderId === currentUser.id && m.recipientId === 'ai-bot')
          );
          const historyPayload = botThread.slice(-8).map(m => ({
            role: m.senderId === currentUser.id ? ('user' as const) : ('model' as const),
            text: m.content
          }));
          historyPayload.push({ role: 'user' as const, text });

          const promptInstruction = `You are Tayack AI Assistant (ជំនួយការសាលារៀន), an intelligent school assistant for the Cambodian School Management System (សាលារៀនកម្ពុជា). Support the user (${currentUser.nameKhmer || currentUser.nameEnglish}) who is a ${currentUser.role}. Answer clearly and politely in Khmer and English.`;

          const aiRes = await GeminiAIService.sendChatMessage(historyPayload, promptInstruction, 'general');

          const botMsg: ChatMessage = {
            id: `MSG-BOT-${Date.now()}`,
            senderId: 'ai-bot',
            senderName: `Gemini AI (${aiRes.model || 'Flash'})`,
            senderRole: 'AI_BOT',
            senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
            recipientId: 'ai-bot',
            recipientName: currentUser.nameKhmer,
            content: aiRes.text,
            timestamp: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', hour12: true }),
            isRead: true,
            type: 'TEXT'
          };
          storageService.sendChatMessage(botMsg);
          setMessages(storageService.getChatMessages());
          setIsBotTyping(false);
          if (soundEnabled) playChatSound('receive');
          onUnreadChange?.();
        } catch (err) {
          // Fallback to local bot rule engine
          const botReply = generateBotReply(text, currentUser);
          const botMsg: ChatMessage = {
            id: `MSG-BOT-${Date.now()}`,
            senderId: 'ai-bot',
            senderName: 'Tayack AI Assistant (ជំនួយការសាលារៀន)',
            senderRole: 'AI_BOT',
            senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
            recipientId: 'ai-bot',
            recipientName: currentUser.nameKhmer,
            content: botReply.text,
            timestamp: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', hour12: true }),
            isRead: true,
            type: 'TEXT'
          };
          storageService.sendChatMessage(botMsg);
          setMessages(storageService.getChatMessages());
          setIsBotTyping(false);
          if (soundEnabled) playChatSound('receive');
          onUnreadChange?.();
        }
      };

      runGeminiReply();
    }

    // Auto-reply simulation for Direct Contacts (especially when non-admin messages Admin)
    if (activeTab === 'DIRECT' && selectedUser) {
      const contactName = selectedUser.nameKhmer;
      const contactRole = selectedUser.role;
      const contactId = selectedUser.id;
      const isTargetAdmin = ['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN'].includes(contactRole);

      if (isTargetAdmin) {
        setIsAdminTyping(true);
      }

      setTimeout(() => {
        let replyContent = language === 'km' 
          ? `ជម្រាបសួរ ${currentUser.nameKhmer}! ខ្ញុំបានទទួលសាររបស់អ្នករួចហើយ។ ខ្ញុំនឹងពិនិត្យនិងឆ្លើយតបជូនបន្ថែមក្នុងពេលឆាប់ៗនេះ។ សូមអរគុណ!`
          : `Hello ${currentUser.nameEnglish || currentUser.nameKhmer}! I have received your message and will get back to you shortly. Thank you!`;
        
        const lowerText = text.toLowerCase();
        if (isTargetAdmin) {
          if (lowerText.includes('office') || lowerText.includes('ការិយាល័យ') || lowerText.includes('រដ្ឋបាល') || lowerText.includes('come to the office')) {
            replyContent = language === 'km'
              ? `ជម្រាបសួរ ${currentUser.nameKhmer}! ការិយាល័យរដ្ឋបាលសាលាស្វាគមន៍ជានិច្ច។ ម៉ោងធ្វើការ៖ ព្រឹក ០៧:៣០-១១:៣០ | រសៀល ០១:៣០-០៥:០០ (ថ្ងៃច័ន្ទ ដល់ ថ្ងៃសុក្រ)។ សូមអញ្ជើញមកកាន់ជាន់ផ្ទាល់ដីនៃអគាររដ្ឋបាលសាលា!`
              : `Hello ${currentUser.nameEnglish || currentUser.nameKhmer}! You are warmly welcome to visit the School Administration Office. Working hours: Morning 07:30–11:30 AM | Afternoon 01:30–05:00 PM (Monday–Friday).`;
          } else if (lowerText.includes('ច្បាប់') || lowerText.includes('ឈប់') || lowerText.includes('leave')) {
            replyContent = language === 'km'
              ? `ជម្រាបសួរ ${currentUser.nameKhmer}! គណៈគ្រប់គ្រងសាលាបានកត់ត្រាសំណើសុំច្បាប់ឈប់សម្រាករួចរាល់ហើយ។ សូមជម្រាបជូនលោកគ្រូបន្ទុកថ្នាក់បន្ថែមផងណា។`
              : `Hello ${currentUser.nameEnglish || currentUser.nameKhmer}! The school administration has noted your leave request. Please notify your class teacher as well.`;
          } else if (lowerText.includes('បង់ប្រាក់') || lowerText.includes('khqr') || lowerText.includes('ថ្លៃសិក្សា') || lowerText.includes('លុយ') || lowerText.includes('tuition')) {
            replyContent = language === 'km'
              ? `ជម្រាបសួរ ${currentUser.nameKhmer}! គណៈគ្រប់គ្រងបានទទួលព័ត៌មានអំពីថ្លៃសិក្សា/ការបង់ប្រាក់ KHQR រួចរាល់ហើយ។ ប្រព័ន្ធនឹងផ្ទៀងផ្ទាត់ និងបញ្ជាក់បង្កាន់ដៃជូនភ្លាមៗ។`
              : `Hello ${currentUser.nameEnglish || currentUser.nameKhmer}! The administration has received your tuition / KHQR payment information and is verifying the receipt.`;
          } else if (lowerText.includes('ពិន្ទុ') || lowerText.includes('វត្តមាន') || lowerText.includes('តេស្ត') || lowerText.includes('score') || lowerText.includes('grade')) {
            replyContent = language === 'km'
              ? `ជម្រាបសួរ! គណៈគ្រប់គ្រងបានកត់សម្គាល់សំណើពិនិត្យពិន្ទុ/វត្តមានរបស់អ្នករួចរាល់ហើយ។ ការិយាល័យសិក្សានឹងធ្វើបច្ចុប្បន្នភាពទិន្នន័យជូន។`
              : `Hello! The administration has noted your score / attendance review request and will update the academic records.`;
          } else if (lowerText.includes('លិខិត') || lowerText.includes('បញ្ជាក់') || lowerText.includes('សញ្ញាបត្រ') || lowerText.includes('certificate')) {
            replyContent = language === 'km'
              ? `ជម្រាបសួរ! ចំពោះសំណើសុំលិខិតបញ្ជាក់ការសិក្សា លោកអ្នកអាចអញ្ជើញមកទទួលយកនៅការិយាល័យរដ្ឋបាលសាលា ឬទាញយកពីប្រព័ន្ធបាន។`
              : `Hello! For official study certificates and transcripts, you can pick them up at the administration office or download digital copies directly.`;
          } else if (lowerText.includes('បញ្ហា') || lowerText.includes('error') || lowerText.includes('ជំនួយ') || lowerText.includes('support')) {
            replyContent = language === 'km'
              ? `ជម្រាបសួរ! ផ្នែកបច្ចេកវិទ្យា (IT Admin) បានទទួលរបាយការណ៍បញ្ហាហើយ និងកំពុងដោះស្រាយជូនយ៉ាងយកចិត្តទុកដាក់។`
              : `Hello! Our IT Support team has received your report and is looking into it.`;
          } else {
            replyContent = language === 'km'
              ? `ជម្រាបសួរ ${currentUser.nameKhmer}! គណៈគ្រប់គ្រងសាលា (School Admin) បានទទួលសាររបស់អ្នករួចរាល់ហើយ។ សូមអរគុណសម្រាប់ការទាក់ទងមកកាន់សាលារៀន!`
              : `Hello ${currentUser.nameEnglish || currentUser.nameKhmer}! The School Administration has received your message. Thank you for reaching out to our school!`;
          }
        } else if (contactRole === 'TEACHER') {
          replyContent = language === 'km'
            ? `ជម្រាបសួរ! ខ្ញុំ (${contactName}) បានទទួលសារហើយ។ ចំពោះកិច្ចការ និងការសិក្សារបស់សិស្ស ខ្ញុំកំពុងតាមដានយ៉ាងយកចិត្តទុកដាក់បាទ/ចាស។`
            : `Hello! Teacher (${contactName}) has received your message and is monitoring the student's learning progress carefully.`;
        } else if (contactRole === 'PARENT') {
          replyContent = language === 'km'
            ? `ជម្រាបសួរលោកគ្រូ/អ្នកគ្រូ! ខ្ញុំបានទទួលដំណឹងហើយ សូមអរគុណសម្រាប់ការយកចិត្តទុកដាក់ចំពោះការរៀនសូត្ររបស់កូនខ្ញុំ។`
            : `Hello Teacher! I have received the notice. Thank you for your care and guidance for my child.`;
        } else if (contactRole === 'STUDENT') {
          replyContent = language === 'km'
            ? `ជម្រាបសួរលោកគ្រូ! ខ្ញុំបានទទួលការណែនាំហើយ ខ្ញុំនឹងខិតខំរៀនសូត្រ និងបំពេញកិច្ចការឱ្យបានទាន់ពេលវេលា។`
            : `Hello Teacher! I have received your instructions and will complete my assignments on time.`;
        }

        const replyMsg: ChatMessage = {
          id: `MSG-REPLY-${Date.now()}`,
          senderId: contactId,
          senderName: contactName,
          senderRole: contactRole,
          senderAvatar: selectedUser.avatar,
          recipientId: currentUser.id,
          recipientName: currentUser.nameKhmer,
          content: replyContent,
          timestamp: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', hour12: true }),
          isRead: false,
          type: 'TEXT'
        };

        storageService.sendChatMessage(replyMsg);
        setMessages(storageService.getChatMessages());
        setIsAdminTyping(false);
        if (soundEnabled) playChatSound('receive');
        onUnreadChange?.();
      }, 1200);
    }
  };

  // Copy message text
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Delete single message
  const handleDeleteMessage = (msgId: string) => {
    storageService.deleteChatMessage(msgId);
    setMessages(storageService.getChatMessages());
    onUnreadChange?.();
  };

  // Clear thread conversation
  const handleClearThread = () => {
    const threadName = activeTab === 'AI_BOT' 
      ? 'ជំនួយការ AI' 
      : activeTab === 'ALL_SCHOOL' 
        ? 'ការជជែកទូទាំងសាលា' 
        : selectedUser?.nameKhmer;
    
    if (window.confirm(`តើអ្នកពិតជាចង់សម្អាតសារក្នុង "${threadName}" មែនទេ? (Clear this conversation?)`)) {
      const recipientKey = activeTab === 'AI_BOT' 
        ? 'ai-bot' 
        : activeTab === 'ALL_SCHOOL' 
          ? 'all-school' 
          : selectedUser?.id;
      
      if (recipientKey) {
        storageService.clearChatConversation(recipientKey, currentUser.id);
        setMessages(storageService.getChatMessages());
        onUnreadChange?.();
      }
    }
  };

  // Helper for role badge colors
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'អគ្គអភិបាល (Super Admin)', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'ADMIN':
      case 'SCHOOL_ADMIN':
        return { label: 'អភិបាលសាលា (Admin)', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'DIRECTOR':
        return { label: 'នាយកសាលា (Director)', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'TEACHER':
        return { label: 'គ្រូបង្រៀន (Teacher)', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'PARENT':
        return { label: 'អាណាព្យាបាល (Parent)', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'STUDENT':
        return { label: 'សិស្ស (Student)', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'ACCOUNTANT':
        return { label: 'គណនេយ្យករ (Finance)', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'LIBRARIAN':
        return { label: 'បណ្ណារក្ស (Librarian)', bg: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
      case 'AI_BOT':
        return { label: 'AI Bot', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      default:
        return { label: 'បុគ្គលិក (Staff)', bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    }
  };

  // Bot quick suggestions
  const quickBotPrompts = useMemo(() => [
    { 
      label: language === 'km' ? '🏢 អញ្ជើញមកការិយាល័យ' : '🏢 Come to the office', 
      query: language === 'km' 
        ? 'ព័ត៌មានការិយាល័យរដ្ឋបាលសាលា ម៉ោងធ្វើការ និងការមកជួបផ្ទាល់ (Come to the office)' 
        : 'School administration office hours, location, and come to the office guidelines' 
    },
    { 
      label: language === 'km' ? '💬 ជជែកជាមួយអ្នកទាំងអស់' : '💬 Chat with All Users', 
      query: language === 'km' 
        ? 'របៀបជជែកជាមួយអ្នកប្រើទាំងអស់ (គ្រូ សិស្ស អាណាព្យាបាល Admin) និងការផ្ញើសារ' 
        : 'How to chat with all users across the school, teachers, parents, and direct messages?' 
    },
    { 
      label: language === 'km' ? '📅 កាលវិភាគសិក្សា' : '📅 Class Timetable', 
      query: language === 'km' ? 'កាលវិភាគសិក្សា និងម៉ោងរៀនប្រចាំថ្ងៃ' : 'Class daily timetable and schedule' 
    },
    { 
      label: language === 'km' ? '💰 ថ្លៃសិក្សា & KHQR' : '💰 Tuition & KHQR', 
      query: language === 'km' ? 'ព័ត៌មានថ្លៃសិក្សា និងការស្កេនបង់ប្រាក់ KHQR' : 'Tuition fees and Bakong KHQR payment' 
    },
    { 
      label: language === 'km' ? '👨‍🏫 បញ្ជីគ្រូបង្រៀន' : '👨‍🏫 Teacher Directory', 
      query: language === 'km' ? 'បញ្ជីឈ្មោះលោកគ្រូអ្នកគ្រូ និងលេខទូរស័ព្ទ' : 'Teacher list and phone contact directory' 
    },
    { 
      label: language === 'km' ? '🎓 ស្ថិតិសិស្ស & អ្នកប្រើ' : '🎓 Student & User Stats', 
      query: language === 'km' ? 'ស្ថិតិសិស្សានុសិស្ស និងគណនីអ្នកប្រើប្រាស់ក្នុងប្រព័ន្ធ' : 'Student and user community statistics' 
    },
    { 
      label: language === 'km' ? '📝 របៀបសុំច្បាប់' : '📝 How to Request Leave', 
      query: language === 'km' ? 'របៀបស្នើសុំច្បាប់ឈប់សម្រាកសិក្សា' : 'How to request a leave of absence' 
    },
    { 
      label: language === 'km' ? '🧹 វេនសម្អាតថ្នាក់' : '🧹 Cleaning Duty', 
      query: language === 'km' ? 'កាលវិភាគវេនសម្អាតបន្ទប់រៀន និងប្រព័ន្ធពិន្ទុ' : 'Classroom cleaning duty timetable and scoring' 
    },
    { 
      label: language === 'km' ? '📚 សៀវភៅបណ្ណាល័យ' : '📚 Library Books', 
      query: language === 'km' ? 'ព័ត៌មានបណ្ណាល័យសាលា និងការខ្ចីសៀវភៅ' : 'School library books and borrowing' 
    }
  ], [language]);

  // User to Admin Quick Topics (when user chats with Admin)
  const userToAdminTemplates = useMemo(() => [
    { 
      label: language === 'km' ? '🏢 សុំជួបនៅការិយាល័យ' : '🏢 Visit Office Meeting', 
      text: language === 'km'
        ? 'ជម្រាបសួរគណៈគ្រប់គ្រង! ខ្ញុំបាទ/នាងខ្ញុំចង់ស្នើសុំណាត់ជួបផ្ទាល់នៅការិយាល័យរដ្ឋបាលសាលា ដើម្បីបំពេញបែបបទ ឬពិភាក្សាការងារ/ការសិក្សា។'
        : 'Hello School Administration! I would like to request an appointment at the school administration office for consultation or paperwork.'
    },
    { 
      label: language === 'km' ? '📝 ស្នើសុំច្បាប់ឈប់' : '📝 Request Leave', 
      text: language === 'km'
        ? 'ជម្រាបសួរគណៈគ្រប់គ្រងសាលា! ខ្ញុំបាទ/នាងខ្ញុំចង់ស្នើសុំច្បាប់ឈប់សម្រាកសិក្សាមួយរយៈ ដោយសារមានធុរៈចាំបាច់។'
        : 'Hello School Administration! I would like to request a temporary leave of absence due to necessary family reasons.'
    },
    { 
      label: language === 'km' ? '💰 ថ្លៃសិក្សា & KHQR' : '💰 Tuition & KHQR', 
      text: language === 'km'
        ? 'ជម្រាបសួរ! ខ្ញុំចង់សាកសួរព័ត៌មានអំពីវិក្កយបត្រថ្លៃសិក្សា និងការស្កេនទូទាត់តាម Bakong KHQR បាទ/ចាស។'
        : 'Hello! I would like to ask about my tuition invoice and Bakong KHQR payment verification.'
    },
    { 
      label: language === 'km' ? '📄 លិខិតបញ្ជាក់ការសិក្សា' : '📄 Study Certificate', 
      text: language === 'km'
        ? 'ជម្រាបសួរគណៈគ្រប់គ្រង! ខ្ញុំចង់ស្នើសុំចេញលិខិតបញ្ជាក់ការសិក្សា និងព្រឹត្តិបត្រពិន្ទុជាផ្លូវការ។'
        : 'Hello Administration! I would like to request an official study certificate and transcript.'
    },
    { 
      label: language === 'km' ? '📊 សាកសួរពិន្ទុ & វត្តមាន' : '📊 Scores & Attendance', 
      text: language === 'km'
        ? 'ជម្រាបសួរ Admin! ខ្ញុំចង់សាកសួរអំពីទិន្នន័យពិន្ទុប្រឡង និងវត្តមានប្រចាំខែ។'
        : 'Hello Admin! I would like to ask about monthly exam scores and attendance records.'
    },
    { 
      label: language === 'km' ? '🛠️ រាយការណ៍បញ្ហាបច្ចេកទេស' : '🛠️ Technical Support', 
      text: language === 'km'
        ? 'ជម្រាបសួរផ្នែក IT! ខ្ញុំជួបបញ្ហាបច្ចេកទេសលើគណនី សូមមេត្តាជួយពិនិត្យជូនបាទ/ចាស។'
        : 'Hello IT Support! I am experiencing a technical issue with my account, please help check.'
    }
  ], [language]);

  // Admin Quick Replies (when Admin chats with Users)
  const adminQuickReplies = useMemo(() => [
    { 
      label: language === 'km' ? '🏢 អញ្ជើញមកការិយាល័យ' : '🏢 Come to the office', 
      text: language === 'km' 
        ? 'សូមគោរពអញ្ជើញមកកាន់ការិយាល័យរដ្ឋបាលសាលា (Administration Office) ដើម្បីបំពេញបែបបទ ទទួលឯកសារផ្លូវការ ឬពិភាក្សាផ្ទាល់។ ម៉ោងធ្វើការ៖ ព្រឹក ០៧:៣០-១១:៣០ | រសៀល ០១:៣០-០៥:០០ (ថ្ងៃច័ន្ទ ដល់ ថ្ងៃសុក្រ)។'
        : 'Please come to the school administration office to complete paperwork, receive official documents, or meet directly with the administration. Office hours: Morning 07:30–11:30 AM | Afternoon 01:30–05:00 PM (Monday to Friday).'
    },
    { 
      label: language === 'km' ? '✅ ទទួលដំណឹងរួចរាល់' : '✅ Received the notification.', 
      text: language === 'km' 
        ? 'បាទ/ចាស! គណៈគ្រប់គ្រងបានទទួលដំណឹង និងកំពុងពិនិត្យចាត់ចែងជូន។'
        : 'Thank you! The administration has received your notification and is reviewing it.'
    },
    { 
      label: language === 'km' ? '📈 បានកែសម្រួលរួចរាល់' : '📈 Edited already', 
      text: language === 'km' 
        ? 'ទិន្នន័យពិន្ទុ និងវត្តមានត្រូវបានធ្វើបច្ចុប្បន្នភាពជូនរួចរាល់ហើយបាទ/ចាស។'
        : 'Scores and attendance records have been updated successfully.'
    },
    { 
      label: language === 'km' ? '💳 បានផ្ទៀងផ្ទាត់ KHQR' : '💳 KHQR Verified', 
      text: language === 'km' 
        ? 'ការទូទាត់ប្រាក់តាម Bakong KHQR ត្រូវបានផ្ទៀងផ្ទាត់ជោគជ័យ។ សូមអរគុណ!'
        : 'Payment via Bakong KHQR has been verified successfully. Thank you!'
    },
    { 
      label: language === 'km' ? '🤝 អរគុណកិច្ចសហការ' : '🤝 Thank you for your cooperation.', 
      text: language === 'km' 
        ? 'សូមអរគុណចំពោះការផ្ដល់ព័ត៌មាន និងកិច្ចសហការល្អជាមួយសាលារៀនយើង!'
        : 'Thank you for providing the information and for your great cooperation with our school!'
    }
  ], [language]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const popularEmojis = ['👍', '❤️', '👏', '🙏', '😊', '🎉', '📚', '🎓', '💡', '🇰🇭'];

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        ref={modalRef}
        id="chat-messenger-modal"
        onClick={(e) => e.stopPropagation()}
        className={`bg-slate-900/95 border border-white/20 rounded-3xl shadow-2xl flex flex-col transition-all overflow-hidden ring-1 ring-white/10 my-auto ${
          isMaximized 
            ? 'w-full h-full max-w-[98vw] max-h-[96vh]' 
            : 'w-full max-w-4xl h-[680px] max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3.5rem)]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl flex items-center justify-between gap-3 relative shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-emerald-400/40">
                {activeTab === 'AI_BOT' ? (
                  <Bot className="w-5 h-5 text-white" />
                ) : activeTab === 'ALL_SCHOOL' ? (
                  <Users className="w-5 h-5 text-white" />
                ) : (
                  <MessageSquare className="w-5 h-5 text-white" />
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse shadow-sm" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold text-white font-battambang">
                  {activeTab === 'AI_BOT' 
                    ? 'ជំនួយការសាលារៀន AI (Tayack AI Bot)' 
                    : activeTab === 'ALL_SCHOOL' 
                      ? 'ការជជែកទូទាំងសាលា (School Community)' 
                      : selectedUser 
                        ? `ជជែកផ្ទាល់៖ ${selectedUser.nameKhmer}` 
                        : 'ជជែកផ្ទាល់ (Direct Messages)'
                  }
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  អនឡាញ (Active)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {activeTab === 'AI_BOT' 
                  ? 'ឆ្លើយសំណួរអំពីកាលវិភាគ ថ្លៃសិក្សា គ្រូ និងច្បាប់សាលា' 
                  : activeTab === 'ALL_SCHOOL' 
                    ? 'បណ្តាញទំនាក់ទំនងរួមសម្រាប់លោកគ្រូ អ្នកគ្រូ អាណាព្យាបាល និងសិស្ស' 
                    : selectedUser 
                      ? `${selectedUser.nameEnglish || ''} • ${getRoleBadge(selectedUser.role).label}` 
                      : 'ជជែកផ្ទាល់រវាងអ្នកប្រើប្រាស់ និងគណៈគ្រប់គ្រងសាលា (Admin)'
                }
              </p>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              type="button"
              onClick={handleToggleSound}
              className={`p-2 rounded-xl border transition ${
                soundEnabled 
                  ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
              title={soundEnabled ? 'បិទសំឡេង (Mute Sound)' : 'បើកសំឡេង (Unmute Sound)'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleClearThread}
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-rose-300 hover:bg-rose-500/15 hover:border-rose-500/30 transition"
              title="សម្អាតសារក្នុងបន្ទប់នេះ (Clear Conversation)"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition hidden sm:flex"
              title={isMaximized ? 'បង្រួមតូច (Restore)' : 'ពង្រីកពេញអេក្រង់ (Maximize)'}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40 transition"
              title="បិទ (Close - Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Mode Bar */}
        <div className="px-4 sm:px-6 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between gap-2 overflow-x-auto shrink-0 custom-scrollbar">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('AI_BOT');
              }}
              className={`flex items-center space-x-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'AI_BOT'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 border border-emerald-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="font-battambang">🤖 ជំនួយការ AI</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('ALL_SCHOOL');
              }}
              className={`flex items-center space-x-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'ALL_SCHOOL'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="font-battambang">👥 សាលារៀនរួម</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('DIRECT');
                setMobileDirectView('THREAD');
              }}
              className={`flex items-center space-x-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'DIRECT'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20 border border-cyan-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="font-battambang">💬 ជជែកផ្ទាល់</span>
              {(Object.values(unreadPerUser) as number[]).reduce((a: number, b: number) => a + b, 0) > 0 && (
                <span className="w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {(Object.values(unreadPerUser) as number[]).reduce((a: number, b: number) => a + b, 0)}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400 shrink-0">
            {/* Quick Chat With Admin Pill for regular users */}
            {!isCurrentUserAdmin && adminUsers.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(adminUsers[0]);
                  setActiveTab('DIRECT');
                  setMobileDirectView('THREAD');
                }}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-400/40 text-purple-200 hover:text-white text-[11px] font-bold flex items-center space-x-1.5 transition cursor-pointer hover:shadow-sm"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span className="font-battambang">ជជែកជាមួយ Admin</span>
              </button>
            )}

            <div className="hidden md:block">
              {language === 'km' ? 'គណនី៖' : 'Account:'}{' '}
              <span className="text-indigo-300 font-bold">{currentUser.nameKhmer}</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Left Drawer / Contact List (Only when in DIRECT mode) */}
          {activeTab === 'DIRECT' && (
            <div className={`w-full md:w-80 border-r border-white/10 bg-slate-950/50 flex flex-col shrink-0 min-h-0 ${
              mobileDirectView === 'THREAD' ? 'hidden md:flex' : 'flex'
            }`}>
              {/* Super Admin / Admin Inbox Header Banner */}
              {isCurrentUserAdmin && (
                <div className="px-3.5 py-2.5 bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border-b border-purple-500/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-white font-battambang leading-tight">
                        {isSuperAdmin ? '👑 ប្រអប់សារអភិបាលជាន់ខ្ពស់' : '🏫 ប្រអប់សាររដ្ឋបាលសាលា'}
                      </p>
                      <p className="text-[9px] text-purple-300">
                        ទទួល & ឆ្លើយតបសារផ្ទាល់ជាមួយអ្នកប្រើទាំងអស់
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 font-bold font-battambang">
                    {filteredUsers.length} នាក់
                  </span>
                </div>
              )}

              {/* Contact Search & Filter */}
              <div className="p-3 border-b border-white/10 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder={language === 'km' ? 'ស្វែងរកអ្នកប្រើប្រាស់...' : 'Search for users...'}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-battambang"
                  />
                  {contactSearch && (
                    <button 
                      onClick={() => setContactSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Role filter chips */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar text-[10px]">
                  {([
                    { key: 'ALL', labelKm: 'ទាំងអស់', labelEn: 'All' },
                    { key: 'ADMIN', labelKm: '🏫 គណៈគ្រប់គ្រង', labelEn: 'Governor' },
                    { key: 'TEACHER', labelKm: '👨‍🏫 គ្រូ', labelEn: 'Teacher' },
                    { key: 'PARENT', labelKm: '👨‍👩‍👧 អាណាព្យាបាល', labelEn: 'Guardian' },
                    { key: 'STUDENT', labelKm: '🎓 សិស្ស', labelEn: 'Student' },
                    { key: 'STAFF', labelKm: '💼 បុគ្គលិក', labelEn: 'Staff' },
                  ] as const).map(role => (
                    <button
                      key={role.key}
                      type="button"
                      onClick={() => setContactRoleFilter(role.key)}
                      className={`px-2 py-1 rounded-lg whitespace-nowrap transition cursor-pointer font-battambang ${
                        contactRoleFilter === role.key 
                          ? 'bg-cyan-600 text-white font-bold shadow-xs' 
                          : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {language === 'km' ? role.labelKm : role.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pinned School Admin Section (Especially for Non-Admin Users) */}
              {!isCurrentUserAdmin && adminUsers.length > 0 && !contactSearch && contactRoleFilter === 'ALL' && (
                <div className="p-2.5 bg-gradient-to-r from-purple-950/40 to-indigo-950/30 border-b border-purple-500/20">
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold text-purple-300 mb-2 px-1">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-battambang">គណៈគ្រប់គ្រង & អភិបាលសាលា</span>
                  </div>
                  <div className="space-y-1">
                    {adminUsers.map(admin => {
                      const isSelected = selectedUser?.id === admin.id;
                      const unread = unreadPerUser[admin.id] || 0;
                      const lastMsg = getLastMessageInfo(admin.id);

                      return (
                        <button
                          key={admin.id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(admin);
                            setMobileDirectView('THREAD');
                            storageService.markChatMessagesAsRead(admin.id, currentUser.id, currentUser.role);
                            setMessages(storageService.getChatMessages());
                            onUnreadChange?.();
                          }}
                          className={`w-full flex items-center space-x-2.5 p-2 rounded-xl transition text-left cursor-pointer border ${
                            isSelected
                              ? 'bg-purple-600/30 border-purple-400/50 text-white shadow-sm'
                              : 'bg-white/5 border-purple-500/20 text-slate-200 hover:bg-purple-600/20 hover:border-purple-400/30'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <img 
                              src={admin.avatar} 
                              alt={admin.nameKhmer} 
                              className="w-8 h-8 rounded-lg object-cover border border-purple-400/40"
                            />
                            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border border-slate-900 rounded-full" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-white font-battambang truncate">{admin.nameKhmer}</p>
                              {unread > 0 && (
                                <span className="w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0">
                                  {unread}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-purple-300 truncate">
                              {lastMsg ? lastMsg.text : `${admin.nameEnglish || 'School Admin'}`}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Users List */}
              <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {filteredUsers.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 font-battambang space-y-2.5">
                    <div className="w-10 h-10 mx-auto rounded-2xl bg-white/5 flex items-center justify-center text-slate-500">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-slate-300">
                      {language === 'km' ? 'រកមិនឃើញអ្នកប្រើប្រាស់ទេ' : 'User not found.'}
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto">
                      {language === 'km' 
                        ? 'មិនមានអ្នកប្រើប្រាស់នៅក្នុងជម្រើសនេះទេ' 
                        : 'No active accounts found under this role category.'}
                    </p>
                    {(contactSearch || contactRoleFilter !== 'ALL') && (
                      <button
                        type="button"
                        onClick={() => {
                          setContactSearch('');
                          setContactRoleFilter('ALL');
                        }}
                        className="mt-2 text-[11px] px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/30 rounded-xl cursor-pointer transition font-battambang"
                      >
                        {language === 'km' ? '🔄 បង្ហាញអ្នកប្រើទាំងអស់' : '🔄 Show All Users'}
                      </button>
                    )}
                  </div>
                ) : (
                  filteredUsers.map(u => {
                    const isSelected = selectedUser?.id === u.id;
                    const unread = unreadPerUser[u.id] || 0;
                    const roleInfo = getRoleBadge(u.role);
                    const lastMsg = getLastMessageInfo(u.id);

                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(u);
                          setMobileDirectView('THREAD');
                          storageService.markChatMessagesAsRead(u.id, currentUser.id, currentUser.role);
                          setMessages(storageService.getChatMessages());
                          onUnreadChange?.();
                        }}
                        className={`w-full flex items-center space-x-2.5 p-2 rounded-2xl transition text-left cursor-pointer border ${
                          isSelected
                            ? 'bg-cyan-600/25 border-cyan-500/40 text-white shadow-sm'
                            : 'border-transparent text-slate-300 hover:bg-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <img 
                            src={u.avatar} 
                            alt={u.nameKhmer} 
                            className="w-10 h-10 rounded-xl object-cover border border-white/20"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold font-battambang truncate text-white">{u.nameKhmer}</p>
                            {unread > 0 ? (
                              <span className="w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0">
                                {unread}
                              </span>
                            ) : lastMsg ? (
                              <span className="text-[9px] text-slate-500 shrink-0">{lastMsg.time}</span>
                            ) : null}
                          </div>
                          
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {lastMsg ? (
                              <span className={unread > 0 ? 'text-cyan-300 font-semibold' : 'text-slate-400'}>
                                {lastMsg.isMine ? 'អ្នក៖ ' : ''}{lastMsg.text}
                              </span>
                            ) : (
                              u.nameEnglish || u.email
                            )}
                          </p>

                          <div className="mt-1 flex items-center justify-between">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${roleInfo.bg}`}>
                              {roleInfo.label.split(' (')[0]}
                            </span>
                            {u.phone && (
                              <span className="text-[9px] text-slate-500 font-mono">{u.phone}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Chat Messages Stream & Input Area */}
          <div className={`flex-1 min-h-0 flex flex-col bg-slate-900/50 ${
            activeTab === 'DIRECT' && mobileDirectView === 'LIST' ? 'hidden md:flex' : 'flex'
          }`}>
            {/* Direct Contact Top Banner (If in direct mode) */}
            {activeTab === 'DIRECT' && selectedUser && (
              <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2.5">
                  {/* Back button for mobile */}
                  <button
                    type="button"
                    onClick={() => setMobileDirectView('LIST')}
                    className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white md:hidden"
                    title="ត្រឡប់ទៅបញ្ជី"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="relative">
                    <img 
                      src={selectedUser.avatar} 
                      alt={selectedUser.nameKhmer} 
                      className="w-9 h-9 rounded-xl object-cover border border-white/20"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs sm:text-sm font-bold text-white font-battambang">{selectedUser.nameKhmer}</p>
                      <span className={`text-[9px] px-2 py-0.2 rounded-full border font-semibold ${getRoleBadge(selectedUser.role).bg}`}>
                        {getRoleBadge(selectedUser.role).label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-400">
                      {selectedUser.phone && <span>☎️ {selectedUser.phone}</span>}
                      {selectedUser.email && <span className="hidden sm:inline">✉️ {selectedUser.email}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-400 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">កំពុងអនឡាញ (Online)</span>
                </div>
              </div>
            )}

            {/* Messages Scroll View */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4 custom-scrollbar">
              {/* Bot Welcome Card */}
              {activeTab === 'AI_BOT' && (
                <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-teal-950/20 to-slate-900 border border-emerald-500/20 shadow-lg mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white font-battambang">
                        Tayack AI School Assistant (ជំនួយការសាលារៀនឆ្លាតវៃ)
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        សូមស្វាគមន៍! ខ្ញុំអាចជួយផ្ដល់ព័ត៌មានទាក់ទងនឹងកាលវិភាគសិក្សា ថ្លៃសិក្សា & KHQR គ្រូបង្រៀន ច្បាប់សាលា និងកាលវិភាគវេនសម្អាត។
                      </p>
                    </div>
                  </div>

                  {/* Quick Prompts Chips */}
                  <div className="mt-3 pt-3 border-t border-emerald-500/20">
                    <p className="text-[10px] font-bold text-emerald-300 mb-1.5 uppercase tracking-wider">
                      សំណួររហ័ស (Quick Questions):
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                      {quickBotPrompts.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(p.query)}
                          className="text-[11px] px-2.5 py-1 rounded-xl bg-white/10 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/40 text-slate-200 hover:text-white transition font-battambang cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* School Channel Welcome Notice */}
              {activeTab === 'ALL_SCHOOL' && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-center mb-4">
                  <p className="text-xs font-bold text-indigo-300 font-battambang">
                    📢 បណ្តាញទំនាក់ទំនងទូទាំងសាលារៀន (School Public Broadcast)
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    គ្រប់សារដែលផ្ញើក្នុងបន្ទប់នេះ អាចមើលឃើញដោយលោកគ្រូ អ្នកគ្រូ សិស្ស និងអាណាព្យាបាលទាំងអស់។
                  </p>
                </div>
              )}

              {/* Direct Chat Welcome Notice */}
              {activeTab === 'DIRECT' && selectedUser && (
                <div className={`p-3 rounded-2xl border text-center mb-2 ${
                  ['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN'].includes(selectedUser.role)
                    ? 'bg-purple-950/30 border-purple-500/30 text-purple-200'
                    : 'bg-cyan-950/20 border-cyan-500/20 text-cyan-200'
                }`}>
                  <div className="flex items-center justify-center space-x-1.5 text-xs font-bold font-battambang">
                    {['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN'].includes(selectedUser.role) ? (
                      <>
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>ការសន្ទនាផ្ទាល់ជាមួយគណៈគ្រប់គ្រងសាលា (School Admin Direct Channel)</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                        <span>ការសន្ទនាផ្ទាល់ពីរនាក់ (Direct 1-on-1 Chat)</span>
                      </>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    សារទាំងអស់ត្រូវបានរក្សាទុកដោយសុវត្ថិភាព និងជាលក្ខណៈសម្ងាត់។
                  </p>
                </div>
              )}

              {/* Message Items List */}
              {currentThreadMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 space-y-2">
                  <MessageSquare className="w-8 h-8 opacity-40" />
                  <p className="text-xs">មិនទាន់មានសារនៅឡើយទេ។ ចាប់ផ្តើមផ្ញើសារដំបូងរបស់អ្នក!</p>
                </div>
              ) : (
                currentThreadMessages.map((msg) => {
                  const isMine = msg.senderId === currentUser.id;
                  const isBot = msg.senderId === 'ai-bot';
                  const roleInfo = getRoleBadge(msg.senderRole);

                  return (
                    <div 
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'} group`}
                    >
                      {/* Avatar */}
                      <div className="shrink-0 relative">
                        {isBot ? (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/30 border border-emerald-400/40">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <img 
                            src={msg.senderAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'} 
                            alt={msg.senderName} 
                            className="w-8 h-8 rounded-xl object-cover border border-white/20 shadow-sm" 
                          />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div className="max-w-[85%] sm:max-w-[75%] space-y-1">
                        {/* Sender info if not mine */}
                        {!isMine && (
                          <div className="flex items-center space-x-2 px-1">
                            <span className="text-[11px] font-bold text-slate-200 font-battambang">
                              {msg.senderName}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${roleInfo.bg}`}>
                              {roleInfo.label.split(' (')[0]}
                            </span>
                          </div>
                        )}

                        <div className={`relative p-3 rounded-2xl text-xs leading-relaxed break-words shadow-md transition-all ${
                          isMine 
                            ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-tr-xs' 
                            : isBot 
                              ? 'bg-slate-800/90 text-slate-100 border border-emerald-500/30 rounded-tl-xs shadow-emerald-500/5' 
                              : ['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'SCHOOL_ADMIN'].includes(msg.senderRole || '')
                                ? 'bg-slate-800/95 text-slate-100 border border-purple-500/30 rounded-tl-xs shadow-purple-500/5'
                                : 'bg-slate-800/90 text-slate-100 border border-white/10 rounded-tl-xs'
                        }`}>
                          {/* Image Attachment Preview */}
                          {msg.attachmentUrl && (
                            <div className="mb-2 rounded-xl overflow-hidden border border-white/20">
                              <img src={msg.attachmentUrl} alt="Attached" className="max-h-48 w-full object-cover" />
                            </div>
                          )}

                          {/* Message Content formatted */}
                          <div className="whitespace-pre-line font-battambang">
                            {msg.content}
                          </div>

                          {/* Message Footer: Time + Actions */}
                          <div className={`mt-1.5 flex items-center justify-between gap-3 text-[9px] ${
                            isMine ? 'text-indigo-200' : 'text-slate-400'
                          }`}>
                            <span>{msg.timestamp}</span>

                            <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleCopyMessage(msg.id, msg.content)}
                                className="p-0.5 rounded hover:text-white transition"
                                title="ចម្លងអត្ថបទ (Copy)"
                              >
                                {copiedMsgId === msg.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>

                              {(isMine || isCurrentUserAdmin) && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="p-0.5 rounded hover:text-rose-400 transition"
                                  title="លុបសារនេះ (Delete)"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Bot Typing Indicator */}
              {isBotTyping && (
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-slate-800 border border-emerald-500/30 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                    <span className="text-[10px] text-emerald-300 font-battambang ml-1.5">AI កំពុងគិត...</span>
                  </div>
                </div>
              )}

              {/* Admin Typing Indicator */}
              {isAdminTyping && (
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center">
                    <Crown className="w-4 h-4 text-purple-400 animate-pulse" />
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-slate-800 border border-purple-500/30 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                    <span className="text-[10px] text-purple-300 font-battambang ml-1.5">Admin កំពុងឆ្លើយតប...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Templates for Direct Chat */}
            {activeTab === 'DIRECT' && selectedUser && (
              <div className="px-3 sm:px-4 py-1.5 bg-slate-950/60 border-t border-white/5">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0 font-battambang">
                    {isCurrentUserAdmin ? (language === 'km' ? '⚡ ឆ្លើយរហ័ស៖' : '⚡ Quick Replies:') : (language === 'km' ? '💡 សំណើរហ័ស៖' : '💡 Quick Topics:')}
                  </span>
                  
                  {isCurrentUserAdmin ? (
                    adminQuickReplies.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(tmpl.text)}
                        className="px-2.5 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-[10px] text-purple-200 hover:text-white transition font-battambang shrink-0 cursor-pointer"
                      >
                        {tmpl.label}
                      </button>
                    ))
                  ) : (
                    userToAdminTemplates.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(tmpl.text)}
                        className="px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-[10px] text-cyan-200 hover:text-white transition font-battambang shrink-0 cursor-pointer"
                      >
                        {tmpl.label}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Attachment preview banner if selected */}
            {selectedAttachment && (
              <div className="px-4 py-2 bg-indigo-950/40 border-t border-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img src={selectedAttachment} alt="Preview" className="w-8 h-8 rounded object-cover border border-white/20" />
                  <span className="text-xs text-indigo-200">បានជ្រើសរើសរូបភាព (Image attached)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAttachment(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Popular Emoji Bar (Toggleable) */}
            {showEmojiPicker && (
              <div className="px-4 py-1.5 bg-slate-950/90 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[10px] text-slate-400 shrink-0">រហ័ស៖</span>
                {popularEmojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInputText(prev => prev + emoji)}
                    className="p-1 rounded-lg hover:bg-white/10 text-sm transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Chat Input Form */}
            <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-white/10 shrink-0">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-end space-x-2"
              >
                {/* Extra tool buttons */}
                <div className="flex items-center space-x-1 pb-1">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2 rounded-xl border transition ${
                      showEmojiPicker 
                        ? 'bg-indigo-600/30 border-indigo-400/40 text-indigo-300' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                    title="បន្ថែម Emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  <label className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer" title="ភ្ជាប់រូបភាព">
                    <Paperclip className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setSelectedAttachment(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Textarea Input */}
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={
                      activeTab === 'AI_BOT' 
                        ? (language === 'km' ? 'សួរសំណួរទៅកាន់ AI (កាលវិភាគ ថ្លៃសិក្សា គ្រូ ច្បាប់សាលា...)' : 'Ask AI anything about schedule, fees, teachers, rules...') 
                        : activeTab === 'ALL_SCHOOL' 
                          ? (language === 'km' ? 'សរសេរសារផ្ញើទៅកាន់សាលារៀនរួម...' : 'Type a public message to school channel...') 
                          : (language === 'km' ? `ផ្ញើសារផ្ទាល់ទៅកាន់ ${selectedUser?.nameKhmer || 'Admin'}...` : `Send a direct message to ${selectedUser?.nameEnglish || selectedUser?.nameKhmer || 'Admin'}...`)
                    }
                    rows={1}
                    className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-battambang resize-none max-h-32 custom-scrollbar"
                  />
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() && !selectedAttachment}
                  className={`p-2.5 rounded-2xl font-bold flex items-center justify-center transition shadow-md shrink-0 cursor-pointer ${
                    inputText.trim() || selectedAttachment
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white hover:brightness-110 shadow-cyan-500/25 scale-102'
                      : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                  }`}
                  title={language === 'km' ? 'ផ្ញើសារ (Enter to send)' : 'Send message (Enter to send)'}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 px-1">
                <span>{language === 'km' ? 'ចុច Enter ដើម្បីផ្ញើ, Shift+Enter សម្រាប់បន្ទាត់ថ្មី' : 'Press Enter to send, Shift+Enter for a new line.'}</span>
                <span>{language === 'km' ? '🔒 សុវត្ថិភាពទិន្នន័យ 100% ក្នុងប្រព័ន្ធសាលា' : '🔒 100% data security in the school system'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
