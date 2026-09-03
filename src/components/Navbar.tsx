import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, SchoolProfile, Language, UserRole, NotificationItem } from '../types';
import { StorageService } from '../services/storageService';
import { FirebaseAuthService } from '../services/firebase';
import { getTranslation } from '../utils/i18n';
import { 
  Bell, 
  Search, 
  Globe, 
  Shield, 
  GraduationCap, 
  UserCheck, 
  User as UserIcon, 
  Briefcase, 
  Calculator, 
  BookOpen, 
  ChevronDown, 
  Calendar,
  CheckCheck,
  Building2,
  Sparkles,
  UserPlus,
  KeyRound,
  Copy,
  Check,
  Users,
  LogIn,
  Crown,
  X,
  ArrowRight,
  Code2,
  FileText,
  Menu,
  PanelLeft,
  Zap,
  Pin,
  Radio,
  Activity,
  Clock,
  Wifi,
  Flame,
  Languages,
  Trash2,
  Send,
  CheckCircle2,
  AlertTriangle,
  Info,
  Volume2,
  Bot,
  MessageSquare,
  Settings,
  Database,
  Maximize,
  Minimize
} from 'lucide-react';
import { playNotificationChime } from '../utils/notificationSound';
import { ChatMessengerModal } from './ChatMessengerModal';

interface NavbarProps {
  currentUser: User;
  users?: User[];
  school: SchoolProfile;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onRoleChange: (role: UserRole) => void;
  onSelectUser?: (user: User) => void;
  onEditUser?: (user: User) => void;
  onOpenSignUpModal?: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onClearAllNotifications?: () => void;
  onDeleteNotification?: (id: string) => void;
  onSelectNotification?: (notification: NotificationItem) => void;
  onOpenSendNotification?: () => void;
  onNavigateTab?: (tab: string) => void;
  activeTab?: string;
  onLogout?: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  autoHideSidebar?: boolean;
  onToggleAutoHide?: () => void;
  onToggleMobileMenu?: () => void;
}

export const roleLabels: Record<UserRole, { khmer: string; english: string; icon: any; color: string; bgBadge: string }> = {
  SUPER_ADMIN: { khmer: 'អភិបាលជាន់ខ្ពស់ (Super Admin)', english: 'Super Admin', icon: Shield, color: 'text-rose-200 border-rose-500/30', bgBadge: 'bg-rose-500/20' },
  ADMIN: { khmer: 'រដ្ឋបាលទូទៅ (Admin)', english: 'Administrator', icon: Shield, color: 'text-indigo-200 border-indigo-500/30', bgBadge: 'bg-indigo-500/20' },
  DIRECTOR: { khmer: 'នាយកសាលា (Director)', english: 'School Director', icon: Briefcase, color: 'text-purple-200 border-purple-500/30', bgBadge: 'bg-purple-500/20' },
  SCHOOL_ADMIN: { khmer: 'រដ្ឋបាលសាលា (School Admin)', english: 'School Admin', icon: Shield, color: 'text-indigo-200 border-indigo-500/30', bgBadge: 'bg-indigo-500/20' },
  TEACHER: { khmer: 'គ្រូបង្រៀន (Teacher)', english: 'Teacher', icon: GraduationCap, color: 'text-blue-200 border-blue-500/30', bgBadge: 'bg-blue-500/20' },
  STUDENT: { khmer: 'សិស្ស (Student)', english: 'Student', icon: UserIcon, color: 'text-emerald-200 border-emerald-500/30', bgBadge: 'bg-emerald-500/20' },
  PARENT: { khmer: 'អាណាព្យាបាល (Parent)', english: 'Parent', icon: UserCheck, color: 'text-amber-200 border-amber-500/30', bgBadge: 'bg-amber-500/20' },
  ACCOUNTANT: { khmer: 'គណនេយ្យករ/បេឡា (Accountant)', english: 'Accountant', icon: Calculator, color: 'text-teal-200 border-teal-500/30', bgBadge: 'bg-teal-500/20' },
  LIBRARIAN: { khmer: 'បណ្ណារក្ស (Librarian)', english: 'Librarian', icon: BookOpen, color: 'text-cyan-200 border-cyan-500/30', bgBadge: 'bg-cyan-500/20' },
  STAFF: { khmer: 'បុគ្គលិក (Staff)', english: 'Staff', icon: UserIcon, color: 'text-slate-200 border-slate-500/30', bgBadge: 'bg-slate-500/20' }
};

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  users = [],
  school,
  language,
  onLanguageChange,
  onRoleChange,
  onSelectUser,
  onEditUser,
  onOpenSignUpModal,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onClearAllNotifications,
  onDeleteNotification,
  onSelectNotification,
  onOpenSendNotification,
  onNavigateTab,
  activeTab,
  onLogout,
  searchTerm,
  onSearchChange,
  onToggleSidebar,
  isSidebarCollapsed = false,
  autoHideSidebar = false,
  onToggleAutoHide,
  onToggleMobileMenu
}) => {
  const t = getTranslation(language);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'UNREAD' | 'DIRECT' | 'ACADEMIC' | 'FINANCE' | 'ATTENDANCE'>('ALL');
  const [activeSwitcherTab, setActiveSwitcherTab] = useState<'ROLES' | 'SAMPLES' | 'ALL_USERS'>('ROLES');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Real-time Live Clock State (ticks every 1 second)
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  // Interactive School Chat Bot & Messenger State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(() => StorageService.getUnreadChatCount(currentUser.id));
  const [chatInitialUser, setChatInitialUser] = useState<string | undefined>(undefined);
  const [chatInitialTab, setChatInitialTab] = useState<'AI_BOT' | 'ALL_SCHOOL' | 'DIRECT' | undefined>(undefined);

  // Firebase Authentication Status State
  const [firebaseUser, setFirebaseUser] = useState<any>(() => FirebaseAuthService.getCurrentFirebaseUser());

  useEffect(() => {
    const unsubscribe = FirebaseAuthService.onAuthChanged((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  const isFirebaseAuth = Boolean(
    firebaseUser && 
    (
      !currentUser?.email || 
      !firebaseUser.email || 
      firebaseUser.email.toLowerCase() === currentUser.email.toLowerCase()
    )
  );

  // Fullscreen State & Listener
  const [isFullscreen, setIsFullscreen] = useState(() => {
    return typeof document !== 'undefined' ? !!document.fullscreenElement : false;
  });

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle request:', err);
    }
  };

  // Global listener to open chat from any component or portal
  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent<{ recipientId?: string; tab?: 'AI_BOT' | 'ALL_SCHOOL' | 'DIRECT' }>;
      if (customEvent.detail) {
        if (customEvent.detail.recipientId) {
          setChatInitialUser(customEvent.detail.recipientId);
        }
        if (customEvent.detail.tab) {
          setChatInitialTab(customEvent.detail.tab);
        }
      }
      setIsChatOpen(true);
    };

    window.addEventListener('open-chat-modal', handleOpenChat);
    return () => window.removeEventListener('open-chat-modal', handleOpenChat);
  }, []);

  useEffect(() => {
    const checkChat = () => {
      setUnreadChatCount(StorageService.getUnreadChatCount(currentUser.id, currentUser.role));
    };
    checkChat();
    const interval = setInterval(checkChat, 4000);
    return () => clearInterval(interval);
  }, [currentUser.id, currentUser.role]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Live Clock
  const formattedLiveTime = useMemo(() => {
    return currentTime.toLocaleTimeString(language === 'km' ? 'km-KH' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }, [currentTime, language]);

  const formattedLiveDate = useMemo(() => {
    return currentTime.toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }, [currentTime, language]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const currentRoleInfo = roleLabels[currentUser.role] || roleLabels.SUPER_ADMIN;
  const RoleIcon = currentRoleInfo.icon;

  const superAdminUser = users.find(u => u.role === 'SUPER_ADMIN') || {
    id: 'USR-001',
    username: 'superadmin',
    password: 'SuperAdmin@2026',
    email: 'superadmin@tayaek.edu.kh',
    role: 'SUPER_ADMIN' as UserRole,
    nameKhmer: 'ឯកឧត្តមបណ្ឌិត ស៊ន វណ្ណារ៉ា',
    nameEnglish: 'H.E. Dr. Sorn Vannara (Super Admin)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    phone: '012 889 900'
  };

  const handleCopyCredentials = (text: string, key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSelectSpecificUser = (user: User) => {
    if (onSelectUser) {
      onSelectUser(user);
    } else {
      onRoleChange(user.role);
    }
    setShowRoleMenu(false);
  };

  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchCategoryFilter, setSearchCategoryFilter] = useState<'ALL' | 'STUDENTS' | 'TEACHERS' | 'CLASSES' | 'SUBJECTS' | 'INVOICES' | 'CLEANING' | 'LIBRARY' | 'PARENTS' | 'PROJECTS'>('ALL');
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setShowNotifMenu(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(target)) {
        setShowRoleMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Keyboard Shortcut for Live Quick Search (Ctrl+K, '/', and Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchResults(true);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchResults(true);
      } else if (e.key === 'Escape') {
        setShowSearchResults(false);
        setShowNotifMenu(false);
        setShowRoleMenu(false);
        setShowUserMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live Smart Cross-Entity Search Computation
  const searchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return null;

    const students = StorageService.getStudents().filter(s => 
      (s.nameKhmer && s.nameKhmer.toLowerCase().includes(q)) || 
      (s.nameEnglish && s.nameEnglish.toLowerCase().includes(q)) ||
      (s.studentCode && s.studentCode.toLowerCase().includes(q)) ||
      (s.className && s.className.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      (s.grade && `ថ្នាក់ទី ${s.grade}`.toLowerCase().includes(q))
    ).slice(0, 6);

    const teachers = StorageService.getTeachers().filter(t =>
      (t.nameKhmer && t.nameKhmer.toLowerCase().includes(q)) ||
      (t.nameEnglish && t.nameEnglish.toLowerCase().includes(q)) ||
      (t.specialization && t.specialization.toLowerCase().includes(q)) ||
      (t.teacherCode && t.teacherCode.toLowerCase().includes(q)) ||
      (t.position && t.position.toLowerCase().includes(q)) ||
      (t.phone && t.phone.toLowerCase().includes(q))
    ).slice(0, 5);

    const classes = StorageService.getClasses().filter(c =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.room && c.room.toLowerCase().includes(q)) ||
      (c.grade && `ថ្នាក់ទី ${c.grade}`.toLowerCase().includes(q)) ||
      (c.teacherName && c.teacherName.toLowerCase().includes(q))
    ).slice(0, 5);

    const subjects = StorageService.getSubjects().filter(sub =>
      (sub.nameKhmer && sub.nameKhmer.toLowerCase().includes(q)) ||
      (sub.nameEnglish && sub.nameEnglish.toLowerCase().includes(q)) ||
      (sub.code && sub.code.toLowerCase().includes(q)) ||
      (sub.grade && `ថ្នាក់ទី ${sub.grade}`.toLowerCase().includes(q))
    ).slice(0, 5);

    const invoices = StorageService.getInvoices().filter(inv =>
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(q)) ||
      (inv.studentNameKhmer && inv.studentNameKhmer.toLowerCase().includes(q)) ||
      (inv.titleKhmer && inv.titleKhmer.toLowerCase().includes(q)) ||
      (inv.status && inv.status.toLowerCase().includes(q))
    ).slice(0, 5);

    const cleaningGroups = StorageService.getCleaningGroups().filter(cg =>
      (cg.groupNameKhmer && cg.groupNameKhmer.toLowerCase().includes(q)) ||
      (cg.groupNameEnglish && cg.groupNameEnglish.toLowerCase().includes(q)) ||
      (cg.groupLeaderName && cg.groupLeaderName.toLowerCase().includes(q)) ||
      (cg.className && cg.className.toLowerCase().includes(q)) ||
      (cg.dayOfWeek && cg.dayOfWeek.toLowerCase().includes(q))
    ).slice(0, 4);

    const books = StorageService.getBooks().filter(b =>
      (b.titleKhmer && b.titleKhmer.toLowerCase().includes(q)) ||
      (b.titleEnglish && b.titleEnglish.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q)) ||
      (b.isbn && b.isbn.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q))
    ).slice(0, 4);

    const parents = StorageService.getParents().filter(p =>
      (p.nameKhmer && p.nameKhmer.toLowerCase().includes(q)) ||
      (p.nameEnglish && p.nameEnglish.toLowerCase().includes(q)) ||
      (p.phone && p.phone.toLowerCase().includes(q)) ||
      (p.occupation && p.occupation.toLowerCase().includes(q))
    ).slice(0, 4);

    const projects = StorageService.getProjects(currentUser.id).filter(p =>
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    ).slice(0, 4);

    const totalMatches = students.length + teachers.length + classes.length + subjects.length + invoices.length + cleaningGroups.length + books.length + parents.length + projects.length;

    return {
      students,
      teachers,
      classes,
      subjects,
      invoices,
      cleaningGroups,
      books,
      parents,
      projects,
      totalMatches
    };
  }, [searchTerm, currentUser.id]);

  const handleJumpToItem = (tab: string, itemQuery?: string) => {
    if (itemQuery !== undefined) {
      onSearchChange(itemQuery);
    }
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
    setShowSearchResults(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!searchResults || searchResults.totalMatches === 0) {
        if (searchTerm.trim()) {
          if (onNavigateTab) onNavigateTab('students');
          setShowSearchResults(false);
        }
        return;
      }
      if (searchResults.students.length > 0) {
        handleJumpToItem('students', searchResults.students[0].nameKhmer);
      } else if (searchResults.teachers.length > 0) {
        handleJumpToItem('teachers', searchResults.teachers[0].nameKhmer);
      } else if (searchResults.classes.length > 0) {
        handleJumpToItem('classes', searchResults.classes[0].name);
      } else if (searchResults.subjects.length > 0) {
        handleJumpToItem('classes', searchResults.subjects[0].nameKhmer);
      } else if (searchResults.invoices.length > 0) {
        handleJumpToItem('fees_finance', searchResults.invoices[0].invoiceNumber);
      } else if (searchResults.cleaningGroups.length > 0) {
        handleJumpToItem('cleaning_groups', searchResults.cleaningGroups[0].groupNameKhmer);
      } else if (searchResults.books.length > 0) {
        handleJumpToItem('library', searchResults.books[0].titleKhmer);
      } else if (searchResults.parents.length > 0) {
        handleJumpToItem('parents', searchResults.parents[0].nameKhmer);
      } else if (searchResults.projects.length > 0) {
        handleJumpToItem('my_projects', searchResults.projects[0].title);
      }
    } else if (e.key === 'Escape') {
      setShowSearchResults(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/75 backdrop-blur-2xl border-b border-white/10 shadow-2xl px-3 sm:px-6 py-2.5 transition-all no-print relative">
      {/* Live Ambient Glow Aura & Light Beam (contained in background without clipping dropdowns) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-4/5 h-20 bg-gradient-to-r from-indigo-600/20 via-purple-500/25 via-pink-500/20 to-cyan-500/20 blur-3xl animate-live-glow" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-indigo-400 via-purple-400 via-pink-400 via-cyan-400 to-transparent animate-live-beam blur-[0.5px]" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 sm:gap-3 relative z-10">
        
        {/* Left: Hamburger, Sidebar Controls, Brand & Academic Year Info */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Menu Toggle Button */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition shadow-sm hover:border-indigo-500/30"
              title="បើក/បិទ មឺនុយ (Menu)"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Desktop Sidebar Quick Collapse Toggle */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="hidden lg:flex p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition shadow-sm hover:border-indigo-500/30 group"
              title={isSidebarCollapsed ? 'ពង្រីកផ្ទាំងចំហៀង (Expand Sidebar)' : 'បង្រួមផ្ទាំងចំហៀង (Collapse Sidebar)'}
            >
              <PanelLeft className="w-4 h-4 text-slate-300 group-hover:text-indigo-300 transition" />
            </button>
          )}

          {/* Desktop Auto-Hide Mode Toggle */}
          {onToggleAutoHide && (
            <button
              onClick={onToggleAutoHide}
              className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-battambang transition backdrop-blur-md ${
                autoHideSidebar 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20' 
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-white/10 hover:border-white/20'
              }`}
              title={autoHideSidebar ? 'បិទ Auto-Hide (ខ្ទាស់ជាប់)' : 'បើក Auto-Hide (លាក់ស្វ័យប្រវត្តិ)'}
            >
              {autoHideSidebar ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="text-[11px] font-semibold">Auto-Hide: បើក</span>
                </>
              ) : (
                <>
                  <Pin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px]">Auto-Hide: បិទ</span>
                </>
              )}
            </button>
          )}

          {/* School Brand Logo & Name */}
          <div className="flex items-center space-x-2.5">
            <div className="relative group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-white/20 bg-white/10 shadow-lg shadow-indigo-500/20 flex items-center justify-center p-0.5 group-hover:border-indigo-400/50 transition">
                <img 
                  src={school.logo} 
                  alt={school.nameKhmer} 
                  className="w-full h-full rounded-lg object-cover" 
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-live-pulse-ring" title="ប្រព័ន្ធដំណើរការផ្ទាល់" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm sm:text-base font-bold text-white font-battambang leading-none tracking-tight flex items-center gap-1.5">
                <span>{school.nameKhmer}</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-1">
                {school.nameEnglish}
              </p>
            </div>
          </div>

          {/* Live Real-time Clock & Academic Year Badge */}
          <div className="hidden 2xl:flex items-center space-x-2.5 bg-white/5 px-3 py-1 rounded-xl border border-white/10 text-xs font-medium text-slate-300 backdrop-blur-md shadow-sm hover:border-indigo-500/30 transition">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>ឆ្នាំសិក្សា {school.academicYear}</span>
            <span className="text-white/20">•</span>
            <span className="text-indigo-300 font-semibold">{school.currentSemester || 'ឆមាសទី១'}</span>
          </div>

          {/* Dedicated Live Clock & Live Pulse Pill */}
          <div className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-purple-500/10 px-3 py-1 rounded-xl border border-emerald-500/25 text-xs text-slate-200 backdrop-blur-md shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase font-mono">LIVE</span>
            <span className="text-white/20">•</span>
            <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-slate-200">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>{formattedLiveTime}</span>
            </div>
          </div>

        </div>

        {/* Center: Global Glass Live Search Bar */}
        <div className="flex-1 max-w-md mx-2 relative" ref={searchContainerRef}>
          <div className={`relative transition-all duration-200 rounded-xl ${isSearchFocused || showSearchResults ? 'ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/20 border-indigo-400/60' : ''}`}>
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition ${isSearchFocused || showSearchResults ? 'text-indigo-400 scale-110' : 'text-slate-400'}`} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onFocus={() => {
                setIsSearchFocused(true);
                setShowSearchResults(true);
              }}
              onBlur={() => {
                setIsSearchFocused(false);
              }}
              onChange={e => {
                onSearchChange(e.target.value);
                setShowSearchResults(true);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder={t.searchPlaceholder || 'ស្វែងរកសិស្ស គ្រូ ថ្នាក់ មុខវិជ្ជា វិក្កយបត្រ វេនសម្អាត...'}
              className="w-full pl-9 pr-14 py-1.5 bg-white/5 hover:bg-white/10 focus:bg-slate-900/80 text-xs sm:text-sm text-slate-100 placeholder-slate-400 rounded-xl border border-white/10 focus:border-indigo-400 outline-none transition backdrop-blur-md font-battambang"
            />
            {/* Live Search Shortcut Key Badge */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              {searchTerm ? (
                <button
                  onClick={() => {
                    onSearchChange('');
                    setShowSearchResults(false);
                  }}
                  className="p-0.5 text-slate-400 hover:text-white rounded-full transition"
                  title="សម្អាតការស្វែងរក"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded-md">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>

          {/* Quick-Jump Floating Dropdown Results */}
          {showSearchResults && (
            <div 
              onMouseDown={e => e.preventDefault()}
              className="absolute left-0 right-0 top-full mt-2 bg-slate-900/98 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-50 max-h-[480px] overflow-y-auto p-3 space-y-3 animate-in fade-in zoom-in-95"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 font-battambang">
                  <Search className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {searchResults 
                      ? `លទ្ធផលស្វែងរក (${searchResults.totalMatches} ត្រូវគ្នា)` 
                      : 'ស្វែងរកទិន្នន័យសាលារៀន (Quick Search)'}
                  </span>
                </span>
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* When no search query yet: Quick Suggestions */}
              {!searchTerm.trim() && (
                <div className="space-y-3 py-1">
                  <p className="text-[11px] font-medium text-slate-400 font-battambang">
                    ចុចជ្រើសរើសផ្នែកដែលចង់ស្វែងរក ឬបើកមើល៖
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <button
                      onClick={() => handleJumpToItem('students')}
                      className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-left transition flex items-center gap-2 text-indigo-300"
                    >
                      <Users className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <span className="font-medium font-battambang">សិស្សទាំងអស់</span>
                    </button>
                    <button
                      onClick={() => handleJumpToItem('teachers')}
                      className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-left transition flex items-center gap-2 text-blue-300"
                    >
                      <GraduationCap className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="font-medium font-battambang">លោកគ្រូ-អ្នកគ្រូ</span>
                    </button>
                    <button
                      onClick={() => handleJumpToItem('classes')}
                      className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-left transition flex items-center gap-2 text-purple-300"
                    >
                      <Building2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="font-medium font-battambang">ថ្នាក់ & មុខវិជ្ជា</span>
                    </button>
                    <button
                      onClick={() => handleJumpToItem('fees_finance')}
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-left transition flex items-center gap-2 text-emerald-300"
                    >
                      <Calculator className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="font-medium font-battambang">វិក្កយបត្រ & បង់ប្រាក់</span>
                    </button>
                    <button
                      onClick={() => handleJumpToItem('cleaning_groups')}
                      className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-left transition flex items-center gap-2 text-cyan-300"
                    >
                      <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="font-medium font-battambang">វេនសម្អាតថ្នាក់</span>
                    </button>
                    <button
                      onClick={() => handleJumpToItem('library')}
                      className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-left transition flex items-center gap-2 text-amber-300"
                    >
                      <BookOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="font-medium font-battambang">បណ្ណាល័យសៀវភៅ</span>
                    </button>
                    <button
                      onClick={() => handleJumpToItem('settings')}
                      className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-left transition flex items-center gap-2 text-indigo-300"
                    >
                      <Settings className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <span className="font-medium font-battambang">ការកំណត់ & ទិន្នន័យ</span>
                    </button>
                  </div>
                </div>
              )}

              {/* When search query is entered and results exist */}
              {searchTerm.trim() && searchResults && (
                <>
                  {/* Category Filter Badges */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
                    <button
                      onClick={() => setSearchCategoryFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${searchCategoryFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                    >
                      ទាំងអស់ ({searchResults.totalMatches})
                    </button>
                    {searchResults.students.length > 0 && (
                      <button
                        onClick={() => setSearchCategoryFilter('STUDENTS')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${searchCategoryFilter === 'STUDENTS' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                      >
                        សិស្ស ({searchResults.students.length})
                      </button>
                    )}
                    {searchResults.teachers.length > 0 && (
                      <button
                        onClick={() => setSearchCategoryFilter('TEACHERS')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${searchCategoryFilter === 'TEACHERS' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                      >
                        គ្រូ ({searchResults.teachers.length})
                      </button>
                    )}
                    {searchResults.classes.length > 0 && (
                      <button
                        onClick={() => setSearchCategoryFilter('CLASSES')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${searchCategoryFilter === 'CLASSES' ? 'bg-purple-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                      >
                        ថ្នាក់ ({searchResults.classes.length})
                      </button>
                    )}
                    {searchResults.subjects.length > 0 && (
                      <button
                        onClick={() => setSearchCategoryFilter('SUBJECTS')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${searchCategoryFilter === 'SUBJECTS' ? 'bg-pink-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                      >
                        មុខវិជ្ជា ({searchResults.subjects.length})
                      </button>
                    )}
                    {searchResults.invoices.length > 0 && (
                      <button
                        onClick={() => setSearchCategoryFilter('INVOICES')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${searchCategoryFilter === 'INVOICES' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                      >
                        វិក្កយបត្រ ({searchResults.invoices.length})
                      </button>
                    )}
                    {searchResults.cleaningGroups.length > 0 && (
                      <button
                        onClick={() => setSearchCategoryFilter('CLEANING')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${searchCategoryFilter === 'CLEANING' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                      >
                        វេនសម្អាត ({searchResults.cleaningGroups.length})
                      </button>
                    )}
                    {searchResults.books.length > 0 && (
                      <button
                        onClick={() => setSearchCategoryFilter('LIBRARY')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${searchCategoryFilter === 'LIBRARY' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                      >
                        សៀវភៅ ({searchResults.books.length})
                      </button>
                    )}
                  </div>

                  {searchResults.totalMatches === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                      <p>រកមិនឃើញទិន្នន័យត្រូវគ្នានឹង "{searchTerm}" ឡើយ</p>
                      <p className="text-[10px] text-slate-500">សូមសាកល្បងវាយឈ្មោះសិស្ស, ឈ្មោះគ្រូ, ឈ្មោះថ្នាក់, មុខវិជ្ជា ឬលេខកូដផ្សេងទៀត</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Students Section */}
                      {(searchCategoryFilter === 'ALL' || searchCategoryFilter === 'STUDENTS') && searchResults.students.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>សិស្ស (Students)</span>
                          </p>
                          <div className="space-y-1">
                            {searchResults.students.map(st => (
                              <div
                                key={st.id}
                                onClick={() => handleJumpToItem('students', st.nameKhmer)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-indigo-600/20 border border-white/5 hover:border-indigo-500/30 flex items-center justify-between text-xs cursor-pointer transition group"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                                    {st.nameKhmer.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-white group-hover:text-indigo-200 transition">
                                      {st.nameKhmer} <span className="text-[10px] font-normal text-indigo-300">({st.studentCode})</span>
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      {st.className || `ថ្នាក់ទី ${st.grade}`} {st.nameEnglish ? `• ${st.nameEnglish}` : ''} {st.phone ? `• ${st.phone}` : ''}
                                    </p>
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Teachers Section */}
                      {(searchCategoryFilter === 'ALL' || searchCategoryFilter === 'TEACHERS') && searchResults.teachers.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>លោកគ្រូ-អ្នកគ្រូ (Teachers)</span>
                          </p>
                          <div className="space-y-1">
                            {searchResults.teachers.map(tc => (
                              <div
                                key={tc.id}
                                onClick={() => handleJumpToItem('teachers', tc.nameKhmer)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/30 flex items-center justify-between text-xs cursor-pointer transition group"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-[10px]">
                                    {tc.nameKhmer.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-white group-hover:text-blue-200 transition">
                                      {tc.nameKhmer} {tc.teacherCode ? <span className="text-[10px] font-normal text-blue-300">({tc.teacherCode})</span> : ''}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      {tc.specialization || tc.position || 'គ្រូបង្រៀន'} {tc.phone ? `• ${tc.phone}` : ''}
                                    </p>
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-300 group-hover:translate-x-0.5 transition" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Classes Section */}
                      {(searchCategoryFilter === 'ALL' || searchCategoryFilter === 'CLASSES') && searchResults.classes.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>ថ្នាក់រៀន (Classes)</span>
                          </p>
                          <div className="space-y-1">
                            {searchResults.classes.map(cl => (
                              <div
                                key={cl.id}
                                onClick={() => handleJumpToItem('classes', cl.name)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-purple-600/20 border border-white/5 hover:border-purple-500/30 flex items-center justify-between text-xs cursor-pointer transition group"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[10px]">
                                    <Building2 className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-white group-hover:text-purple-200 transition">{cl.name}</p>
                                    <p className="text-[10px] text-slate-400">
                                      {cl.room ? `បន្ទប់: ${cl.room}` : ''} {cl.teacherName ? `• បន្ទុកថ្នាក់: ${cl.teacherName}` : ''}
                                    </p>
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-300 group-hover:translate-x-0.5 transition" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Subjects Section */}
                      {(searchCategoryFilter === 'ALL' || searchCategoryFilter === 'SUBJECTS') && searchResults.subjects.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-pink-400 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>មុខវិជ្ជាសិក្សា (Subjects)</span>
                          </p>
                          <div className="space-y-1">
                            {searchResults.subjects.map(sub => (
                              <div
                                key={sub.id}
                                onClick={() => handleJumpToItem('classes', sub.nameKhmer)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-pink-600/20 border border-white/5 hover:border-pink-500/30 flex items-center justify-between text-xs cursor-pointer transition group"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-300 flex items-center justify-center font-bold text-[10px]">
                                    {sub.code ? sub.code.split('-')[0] : 'SUB'}
                                  </div>
                                  <div>
                                    <p className="font-bold text-white group-hover:text-pink-200 transition">
                                      {sub.nameKhmer} <span className="text-[10px] font-normal text-pink-300">({sub.code})</span>
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      {sub.nameEnglish ? `${sub.nameEnglish} • ` : ''}ថ្នាក់ទី {sub.grade} {sub.credits ? `• ${sub.credits} ក្រេឌីត` : ''}
                                    </p>
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-300 group-hover:translate-x-0.5 transition" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Invoices & Finance Section */}
                      {(searchCategoryFilter === 'ALL' || searchCategoryFilter === 'INVOICES') && searchResults.invoices.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <Calculator className="w-3.5 h-3.5" />
                            <span>វិក្កយបត្រ & ហិរញ្ញវត្ថុ (Invoices)</span>
                          </p>
                          <div className="space-y-1">
                            {searchResults.invoices.map(inv => (
                              <div
                                key={inv.id}
                                onClick={() => handleJumpToItem('fees_finance', inv.invoiceNumber)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-emerald-600/20 border border-white/5 hover:border-emerald-500/30 flex items-center justify-between text-xs cursor-pointer transition group"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                                    $
                                  </div>
                                  <div>
                                    <p className="font-bold text-white group-hover:text-emerald-200 transition">
                                      {inv.invoiceNumber} - {inv.studentNameKhmer}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      ${(inv.amountUSD || 0).toFixed(2)} • {inv.status === 'PAID' ? 'បានបង់រួច' : inv.status === 'PENDING' ? 'រង់ចាំបង់' : inv.status}
                                    </p>
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cleaning Duty Groups Section */}
                      {(searchCategoryFilter === 'ALL' || searchCategoryFilter === 'CLEANING') && searchResults.cleaningGroups.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>ក្រុមវេនសម្អាត (Cleaning Duty)</span>
                          </p>
                          <div className="space-y-1">
                            {searchResults.cleaningGroups.map(cg => (
                              <div
                                key={cg.id}
                                onClick={() => handleJumpToItem('cleaning_groups', cg.groupNameKhmer)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-cyan-600/20 border border-white/5 hover:border-cyan-500/30 flex items-center justify-between text-xs cursor-pointer transition group"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px]">
                                    <Sparkles className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-white group-hover:text-cyan-200 transition">
                                      {cg.groupNameKhmer}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      {cg.className} • ប្រធានក្រុម: {cg.groupLeaderName || 'មិនទាន់កំណត់'} ({cg.studentIds?.length || 0} សមាជិក)
                                    </p>
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Books & Library Section */}
                      {(searchCategoryFilter === 'ALL' || searchCategoryFilter === 'LIBRARY') && searchResults.books.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>បណ្ណាល័យ & សៀវភៅ (Library)</span>
                          </p>
                          <div className="space-y-1">
                            {searchResults.books.map(bk => (
                              <div
                                key={bk.id}
                                onClick={() => handleJumpToItem('library', bk.titleKhmer)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-amber-600/20 border border-white/5 hover:border-amber-500/30 flex items-center justify-between text-xs cursor-pointer transition group"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                                    <BookOpen className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-white group-hover:text-amber-200 transition">{bk.titleKhmer}</p>
                                    <p className="text-[10px] text-slate-400">
                                      {bk.author ? `អ្នកនិពន្ធ: ${bk.author} • ` : ''}{bk.category || 'សៀវភៅទូទៅ'}
                                    </p>
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Parents Section */}
                      {(searchCategoryFilter === 'ALL' || searchCategoryFilter === 'PARENTS') && searchResults.parents.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-teal-400 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>អាណាព្យាបាល (Parents)</span>
                          </p>
                          <div className="space-y-1">
                            {searchResults.parents.map(pr => (
                              <div
                                key={pr.id}
                                onClick={() => handleJumpToItem('parents', pr.nameKhmer)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-teal-600/20 border border-white/5 hover:border-teal-500/30 flex items-center justify-between text-xs cursor-pointer transition group"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-[10px]">
                                    {pr.nameKhmer.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-white group-hover:text-teal-200 transition">{pr.nameKhmer}</p>
                                    <p className="text-[10px] text-slate-400">
                                      {pr.phone ? `ទូរស័ព្ទ: ${pr.phone} • ` : ''}{pr.occupation || 'អាណាព្យាបាល'}
                                    </p>
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-300 group-hover:translate-x-0.5 transition" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects Section */}
                      {(searchCategoryFilter === 'ALL' || searchCategoryFilter === 'PROJECTS') && searchResults.projects.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-violet-400 flex items-center gap-1">
                            <Code2 className="w-3.5 h-3.5" />
                            <span>គម្រោងកូដផ្ទាល់ខ្លួន (My Code Projects)</span>
                          </p>
                          <div className="space-y-1">
                            {searchResults.projects.map(pj => (
                              <div
                                key={pj.id}
                                onClick={() => handleJumpToItem('my_projects', pj.title)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-violet-600/20 border border-white/5 hover:border-violet-500/30 flex items-center justify-between text-xs cursor-pointer transition group"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold text-[10px]">
                                    <Code2 className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-white group-hover:text-violet-200 transition">{pj.title}</p>
                                    <p className="text-[10px] text-slate-400">{pj.language.toUpperCase()} • {pj.description || 'No description'}</p>
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-300 group-hover:translate-x-0.5 transition" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Actions: Language, Notifications, Chat, User */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          
          {/* Role & Account Switcher Modal (Accessible from Profile Menu) */}
          {showRoleMenu && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-150">
              <div 
                ref={roleMenuRef} 
                className="w-full max-w-lg bg-slate-900/98 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 py-3 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
              >
                {/* Header with Title & Sign Up Action */}
                <div className="px-4 pb-3 border-b border-white/10 flex items-center justify-between shrink-0">
                  <div>
                    <p className="text-xs font-bold text-white font-battambang flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                      <span>ប្តូរតួនាទី & គណនី (Role Switcher)</span>
                    </p>
                    <p className="text-[10px] text-slate-400">ជ្រើសរើសតួនាទី ឬគណនីគំរូដើម្បីប្រើប្រាស់</p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {onEditUser && (
                      <button
                        onClick={() => {
                          setShowRoleMenu(false);
                          onEditUser(currentUser);
                        }}
                        className="px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-white text-[11px] font-semibold border border-white/10 transition"
                        title="កែប្រែព័ត៌មានផ្ទាល់ខ្លួន"
                      >
                        កែ Profile ខ្ញុំ
                      </button>
                    )}
                    {onOpenSignUpModal && (
                      <button
                        onClick={() => {
                          setShowRoleMenu(false);
                          onOpenSignUpModal();
                        }}
                        className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-[11px] font-bold shadow-md shadow-indigo-500/20 flex items-center space-x-1 transition"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>+ ចុះឈ្មោះ</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowRoleMenu(false)}
                      className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
                      title="បិទ (Close)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* SUPER ADMIN SPOTLIGHT CARD */}
                <div className="p-3 mx-3 my-2.5 rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900/90 to-amber-950/60 border border-rose-500/40 shadow-lg shadow-rose-950/30">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
                        <Crown className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white font-battambang">Super Admin Sample Login</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-200 border border-rose-500/40 font-semibold">
                            Full Access
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 font-battambang">{superAdminUser.nameKhmer}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sample Credentials Box */}
                  <div className="grid grid-cols-2 gap-1.5 bg-black/40 p-2 rounded-xl border border-white/10 text-[10px] mb-2 font-mono">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>User: <strong className="text-rose-300">{superAdminUser.username || 'superadmin'}</strong></span>
                      <button 
                        onClick={(e) => handleCopyCredentials(superAdminUser.username || 'superadmin', 'sa-user', e)}
                        title="Copy Username"
                        className="hover:text-white"
                      >
                        {copiedKey === 'sa-user' ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-slate-300 border-l border-white/10 pl-2">
                      <span>Pass: <strong className="text-amber-300">{superAdminUser.password || 'SuperAdmin@2026'}</strong></span>
                      <button 
                        onClick={(e) => handleCopyCredentials(superAdminUser.password || 'SuperAdmin@2026', 'sa-pass', e)}
                        title="Copy Password"
                        className="hover:text-white"
                      >
                        {copiedKey === 'sa-pass' ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectSpecificUser(superAdminUser)}
                    className="w-full py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white text-xs font-bold shadow-md flex items-center justify-center space-x-1.5 transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>ចូលប្រើជា Super Admin ភ្លាមៗ (Quick Login)</span>
                  </button>
                </div>

                {/* Sub Tabs: Roles vs Sample Accounts vs All Users */}
                <div className="px-3 pb-1">
                  <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-[11px] font-semibold text-center">
                    <button
                      onClick={() => setActiveSwitcherTab('ROLES')}
                      className={`py-1 rounded-lg transition ${
                        activeSwitcherTab === 'ROLES' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      តួនាទី (Roles)
                    </button>
                    <button
                      onClick={() => setActiveSwitcherTab('SAMPLES')}
                      className={`py-1 rounded-lg transition ${
                        activeSwitcherTab === 'SAMPLES' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      គណនីគំរូ (Samples)
                    </button>
                    <button
                      onClick={() => setActiveSwitcherTab('ALL_USERS')}
                      className={`py-1 rounded-lg transition ${
                        activeSwitcherTab === 'ALL_USERS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      អ្នកប្រើ ({users.length})
                    </button>
                  </div>
                </div>

                {/* TAB 1: Role List */}
                {activeSwitcherTab === 'ROLES' && (
                  <div className="max-h-64 overflow-y-auto py-1 custom-scrollbar">
                    {(Object.keys(roleLabels) as UserRole[]).map(roleKey => {
                      const info = roleLabels[roleKey];
                      const Icon = info.icon;
                      const isSelected = currentUser.role === roleKey;
                      return (
                        <button
                          key={roleKey}
                          onClick={() => {
                            onRoleChange(roleKey);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 flex items-center space-x-2.5 text-xs transition ${
                            isSelected ? 'bg-white/10 text-white font-semibold border-l-2 border-indigo-400' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg border ${info.bgBadge} ${info.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-battambang leading-tight text-white">{info.khmer}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{info.english}</p>
                          </div>
                          {isSelected && <span className="text-indigo-400 font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* TAB 2: Sample Accounts with Credentials */}
                {activeSwitcherTab === 'SAMPLES' && (
                  <div className="max-h-64 overflow-y-auto py-1 divide-y divide-white/5 custom-scrollbar">
                    {users.slice(0, 8).map(u => {
                      const roleInfo = roleLabels[u.role] || roleLabels.SUPER_ADMIN;
                      const isCurrent = currentUser.id === u.id || (currentUser.role === u.role && currentUser.email === u.email);
                      return (
                        <div 
                          key={u.id}
                          onClick={() => handleSelectSpecificUser(u)}
                          className={`p-2.5 hover:bg-white/10 transition cursor-pointer flex items-center justify-between ${
                            isCurrent ? 'bg-indigo-500/10 border-l-2 border-indigo-400' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <img src={u.avatar} alt={u.nameKhmer} className="w-8 h-8 rounded-xl object-cover border border-white/20" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-white font-battambang leading-tight">{u.nameKhmer}</p>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded-full border ${roleInfo.bgBadge} ${roleInfo.color}`}>
                                  {u.role}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono">
                                @{u.username || u.role.toLowerCase()} | Pass: <span className="text-indigo-300">{u.password || 'password123'}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={(e) => handleCopyCredentials(`${u.username || 'user'} / ${u.password || 'password123'}`, `u-${u.id}`, e)}
                              title="Copy Login Info"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                            >
                              {copiedKey === `u-${u.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                            <span className="text-[11px] font-bold text-indigo-400">ចូល →</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* TAB 3: All Registered Users & Signup Trigger */}
                {activeSwitcherTab === 'ALL_USERS' && (
                  <div className="max-h-64 overflow-y-auto py-1 divide-y divide-white/5 custom-scrollbar">
                    {users.map(u => {
                      const isCurrent = currentUser.id === u.id;
                      return (
                        <div 
                          key={u.id}
                          onClick={() => handleSelectSpecificUser(u)}
                          className={`p-2.5 hover:bg-white/10 transition cursor-pointer flex items-center justify-between ${
                            isCurrent ? 'bg-indigo-500/10 border-l-2 border-indigo-400' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <img src={u.avatar} alt={u.nameKhmer} className="w-7 h-7 rounded-xl object-cover border border-white/20" />
                            <div>
                              <p className="text-xs font-bold text-white font-battambang leading-tight">{u.nameKhmer}</p>
                              <p className="text-[10px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-white/10 text-indigo-300 font-semibold">
                              {u.role}
                            </span>
                            {onEditUser && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowRoleMenu(false);
                                  onEditUser(u);
                                }}
                                className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
                                title="កែប្រែគណនី"
                              >
                                <KeyRound className="w-3 h-3 text-indigo-400" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Bottom Sign Up Button */}
                {onOpenSignUpModal && (
                  <div className="pt-2 px-3 border-t border-white/10">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onOpenSignUpModal();
                      }}
                      className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-indigo-300 hover:text-white flex items-center justify-center space-x-2 transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ ចុះឈ្មោះគណនីថ្មី (Create / Sign Up Account)</span>
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Firebase Authentication vs Local Demo Mode Status Indicator */}
          <div 
            id="navbar-auth-status-indicator"
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl border text-[11px] font-semibold backdrop-blur-md transition-all shadow-sm select-none cursor-default ${
              isFirebaseAuth
                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200 shadow-emerald-500/10 hover:bg-emerald-500/20'
                : 'bg-amber-500/15 border-amber-400/40 text-amber-200 shadow-amber-500/10 hover:bg-amber-500/20'
            }`}
            title={
              isFirebaseAuth 
                ? (language === 'km' 
                    ? `បានភ្ជាប់ Firebase Auth: ${firebaseUser?.email || currentUser.email}`
                    : `Firebase Authenticated: ${firebaseUser?.email || currentUser.email}`)
                : (language === 'km'
                    ? 'ដំណើរការក្នុងរបៀបសាកល្បង Local Demo Mode'
                    : 'Operating in Local Demo Mode')
            }
          >
            {isFirebaseAuth ? (
              <>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-mono text-[11px] hidden sm:inline text-emerald-300">Firebase</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <Database className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="font-mono text-[11px] hidden sm:inline text-amber-200">
                  {language === 'km' ? 'Demo Mode' : 'Local Demo'}
                </span>
              </>
            )}
          </div>

          {/* Enhanced High-Contrast Language Toggle Button */}
          <div 
            className="flex items-center p-1 rounded-2xl border border-white/20 bg-slate-900/90 shadow-md backdrop-blur-md transition-all gap-1"
            role="group"
            aria-label={t.switchLanguage}
          >
            <button
              onClick={() => onLanguageChange('km')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all select-none cursor-pointer ${
                language === 'km'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/40 border border-indigo-400/50 scale-102 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="ប្តូរទៅភាសាខ្មែរ (Switch to Khmer)"
            >
              <span className="text-sm leading-none shrink-0">🇰🇭</span>
              <span className="font-battambang text-[12px]">ខ្មែរ</span>
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all select-none cursor-pointer ${
                language === 'en'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/40 border border-indigo-400/50 scale-102 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Switch to English (ប្តូរទៅភាសាអង់គ្លេស)"
            >
              <span className="text-sm leading-none shrink-0">🇬🇧</span>
              <span className="font-mono text-[12px]">EN</span>
            </button>
          </div>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl border border-white/15 bg-white/5 text-slate-300 hover:text-white hover:bg-white/15 hover:border-white/30 transition shadow-sm backdrop-blur-md cursor-pointer"
            title={isFullscreen ? (language === 'km' ? 'ចេញពីពេញអេក្រង់ (Exit Fullscreen)' : 'Exit Fullscreen') : (language === 'km' ? 'ពេញអេក្រង់ (Fullscreen)' : 'Toggle Fullscreen')}
          >
            {isFullscreen ? <Minimize className="w-4 h-4 text-amber-300" /> : <Maximize className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Notifications Dropdown with Live Radar Wave */}
          <div className="relative" ref={notifMenuRef}>
            <button
              id="navbar-notification-btn"
              type="button"
              onClick={() => { 
                setShowNotifMenu(prev => !prev); 
                setShowRoleMenu(false); 
                setShowUserMenu(false);
              }}
              className={`relative p-2 rounded-xl border transition backdrop-blur-md cursor-pointer ${
                unreadCount > 0 
                  ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20 shadow-sm shadow-indigo-500/20' 
                  : 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20'
              }`}
              title="ការជូនដំណឹង (Notifications)"
            >
              <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-indigo-300 animate-pulse' : ''}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-indigo-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/50 animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div 
                id="navbar-notification-popup"
                className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-slate-900/98 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 py-3 z-[100] animate-in fade-in zoom-in-95 duration-150 overflow-hidden ring-1 ring-white/10"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-2.5 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white font-battambang">ការជូនដំណឹង (Notifications)</span>
                    {unreadCount > 0 && (
                      <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                        {unreadCount} ថ្មី
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1.5">
                    {/* Audio Chime Test */}
                    <button
                      onClick={() => playNotificationChime('SUCCESS')}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-indigo-300 transition"
                      title="ស្តាប់សំឡេង Alert (Test Sound)"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    {onOpenSendNotification && (
                      <button
                        onClick={() => {
                          setShowNotifMenu(false);
                          onOpenSendNotification();
                        }}
                        className="text-[10px] font-bold text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 px-2 py-1 rounded-xl flex items-center space-x-1 transition"
                        title="ផ្ញើការជូនដំណឹងទៅកាន់អ្នកដទៃ"
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>+ ផ្ញើ</span>
                      </button>
                    )}

                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-[10px] text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2 py-1 rounded-xl font-medium flex items-center space-x-1 transition"
                        title="សម្គាល់ថាបានអានទាំងអស់"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>អានទាំងអស់</span>
                      </button>
                    )}

                    {onClearAllNotifications && notifications.length > 0 && (
                      <button
                        onClick={() => {
                          if (window.confirm('តើអ្នកចង់សម្អាតការជូនដំណឹងទាំងអស់មែនទេ? (Clear all notifications?)')) {
                            onClearAllNotifications();
                          }
                        }}
                        className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition"
                        title="សម្អាតទាំងអស់ (Clear All)"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Tabs Carousel */}
                <div className="flex items-center space-x-1 px-3 pt-2 pb-2 border-b border-white/5 overflow-x-auto custom-scrollbar">
                  <button
                    onClick={() => setNotifFilter('ALL')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition shrink-0 ${
                      notifFilter === 'ALL'
                        ? 'bg-white/15 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    ទាំងអស់ ({notifications.length})
                  </button>

                  <button
                    onClick={() => setNotifFilter('UNREAD')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition flex items-center space-x-1 shrink-0 ${
                      notifFilter === 'UNREAD'
                        ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-400/30 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <span>មិនទាន់អាន</span>
                    {unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setNotifFilter('DIRECT')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition shrink-0 ${
                      notifFilter === 'DIRECT'
                        ? 'bg-white/15 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    ផ្ញើមកខ្ញុំ (Direct)
                  </button>

                  <button
                    onClick={() => setNotifFilter('ACADEMIC')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition shrink-0 ${
                      notifFilter === 'ACADEMIC'
                        ? 'bg-blue-500/20 text-blue-200 border border-blue-400/30 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    ការសិក្សា
                  </button>

                  <button
                    onClick={() => setNotifFilter('FINANCE')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition shrink-0 ${
                      notifFilter === 'FINANCE'
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    ហិរញ្ញវត្ថុ
                  </button>

                  <button
                    onClick={() => setNotifFilter('ATTENDANCE')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition shrink-0 ${
                      notifFilter === 'ATTENDANCE'
                        ? 'bg-purple-500/20 text-purple-200 border border-purple-400/30 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    វត្តមាន
                  </button>
                </div>

                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
                  {(() => {
                    const filteredList = notifications.filter(n => {
                      if (notifFilter === 'UNREAD') return !n.isRead;
                      if (notifFilter === 'DIRECT') {
                        return (
                          n.userId === currentUser.id ||
                          n.recipientId === currentUser.id ||
                          n.targetRole === currentUser.role ||
                          (n.targetRoles && n.targetRoles.includes(currentUser.role as any))
                        );
                      }
                      if (notifFilter === 'ACADEMIC') return n.category === 'ACADEMIC';
                      if (notifFilter === 'FINANCE') return n.category === 'FINANCE';
                      if (notifFilter === 'ATTENDANCE') return n.category === 'ATTENDANCE';
                      return true;
                    });

                    if (filteredList.length === 0) {
                      return (
                        <div className="text-center py-8 px-4">
                          <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                          <p className="text-xs text-slate-400">មិនមានការជូនដំណឹងនៅក្នុងប្រអប់នេះទេ</p>
                        </div>
                      );
                    }

                    return filteredList.map(n => {
                      const isUnread = !n.isRead;
                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            onMarkNotificationRead(n.id);
                            if (onSelectNotification) {
                              onSelectNotification(n);
                              setShowNotifMenu(false);
                            } else if (n.linkTab && onNavigateTab) {
                              onNavigateTab(n.linkTab);
                              setShowNotifMenu(false);
                            }
                          }}
                          className={`p-3 text-xs transition cursor-pointer flex items-start space-x-2.5 ${
                            isUnread 
                              ? 'bg-indigo-500/10 hover:bg-indigo-500/20 border-l-2 border-indigo-400' 
                              : 'bg-transparent opacity-75 hover:opacity-100 hover:bg-white/5'
                          }`}
                        >
                          {/* Priority / Type Icon or Sender Avatar */}
                          <div className="shrink-0 mt-0.5">
                            {n.senderAvatar ? (
                              <img 
                                src={n.senderAvatar} 
                                alt={n.senderName || 'Sender'} 
                                className="w-8 h-8 rounded-xl object-cover border border-white/20 shadow-xs" 
                              />
                            ) : (
                              <div className={`p-2 rounded-xl border ${
                                n.type === 'URGENT' 
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                                  : n.type === 'WARNING' 
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                                  : n.type === 'SUCCESS' 
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              }`}>
                                {n.type === 'URGENT' ? <Flame className="w-3.5 h-3.5" /> :
                                 n.type === 'WARNING' ? <AlertTriangle className="w-3.5 h-3.5" /> :
                                 n.type === 'SUCCESS' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                                 <Info className="w-3.5 h-3.5" />}
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className={`font-bold text-white font-battambang leading-tight truncate ${isUnread ? 'text-indigo-200' : ''}`}>
                                {n.title}
                              </h4>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">{n.timestamp}</span>
                            </div>

                            <p className="text-slate-300 mt-1 text-[11px] leading-relaxed line-clamp-2">
                              {n.message}
                            </p>

                            {/* Footer info: Sender & Link */}
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center space-x-1.5 truncate max-w-[200px]">
                                {n.senderName && (
                                  <span className="text-[9px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded-md border border-white/5 truncate">
                                    {n.senderName}
                                  </span>
                                )}
                                {n.category && (
                                  <span className="text-[9px] text-indigo-300/80 bg-indigo-500/10 px-1.5 py-0.5 rounded-md border border-indigo-500/20">
                                    {n.category}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                {!n.isRead && (
                                  <button
                                    onClick={() => onMarkNotificationRead(n.id)}
                                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-emerald-400 transition"
                                    title="សម្គាល់ថាបានអាន"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                )}
                                {onDeleteNotification && (
                                  <button
                                    onClick={() => onDeleteNotification(n.id)}
                                    className="p-1 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
                                    title="លុបការជូនដំណឹង"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Footer Link to Notifications Tab */}
                {onNavigateTab && (
                  <div className="pt-2 px-3 border-t border-white/10 text-center">
                    <button
                      onClick={() => {
                        setShowNotifMenu(false);
                        onNavigateTab('notifications');
                      }}
                      className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-indigo-300 hover:text-white flex items-center justify-center space-x-1.5 transition font-battambang"
                    >
                      <span>{language === 'km' ? 'បើកមជ្ឈមណ្ឌលការជូនដំណឹងពេញលេញ' : 'Open Full Notifications Center'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chat Bot & All-User Messenger Button (Next to Notifications) */}
          <div className="relative">
            <button
              id="navbar-chatbot-btn"
              type="button"
              onClick={() => {
                setChatInitialUser(undefined);
                setIsChatOpen(true);
                setShowNotifMenu(false);
                setShowRoleMenu(false);
                setShowUserMenu(false);
              }}
              className={`relative p-2 rounded-xl border transition backdrop-blur-md cursor-pointer flex items-center justify-center ${
                unreadChatCount > 0
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25 shadow-sm shadow-emerald-500/20'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-emerald-500/30'
              }`}
              title="ជំនួយការ AI & ជជែកជាមួយអ្នកទាំងអស់ (School AI Bot & Chat with All Users)"
            >
              <div className="relative">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              </div>
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-bounce">
                  {unreadChatCount}
                </span>
              )}
            </button>
          </div>

          {/* Settings & System Data Navigation Button */}
          <div className="relative">
            <button
              id="navbar-settings-btn"
              type="button"
              onClick={() => {
                setShowNotifMenu(false);
                setShowRoleMenu(false);
                setShowUserMenu(false);
                onNavigateTab && onNavigateTab('settings');
              }}
              className={`relative p-2 rounded-xl border transition backdrop-blur-md cursor-pointer flex items-center justify-center group ${
                activeTab === 'settings'
                  ? 'border-indigo-500/50 bg-indigo-500/25 text-white shadow-md shadow-indigo-500/30'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-indigo-500/30'
              }`}
              title="ការកំណត់ប្រព័ន្ធ & គ្រប់គ្រងទិន្នន័យទាំងអស់ (System Settings, All Accounts & All Data)"
            >
              <Settings className={`w-4 h-4 text-indigo-400 group-hover:rotate-45 transition-transform duration-300 ${activeTab === 'settings' ? 'rotate-45 text-white' : ''}`} />
            </button>
          </div>

          {/* User Profile Avatar with Live Online Beacon & Actions */}
          <div className="flex items-center space-x-2 pl-2 border-l border-white/10 relative" ref={userMenuRef}>
            <button
              id="navbar-profile-btn"
              type="button"
              onClick={() => {
                setShowUserMenu(prev => !prev);
                setShowNotifMenu(false);
                setShowRoleMenu(false);
              }}
              className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-white/10 hover:border-white/10 transition text-left group cursor-pointer"
              title="មើលព័ត៌មានគណនី (Account Menu & Profile)"
            >
              <div className="relative shrink-0">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.nameKhmer} 
                  className="w-8 h-8 rounded-xl object-cover border border-white/20 shadow-md group-hover:border-indigo-400/50 transition" 
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full shadow-sm shadow-emerald-400/80 animate-pulse" title="អនឡាញ (Online)" />
              </div>
              <div className="hidden xl:block text-left max-w-[140px]">
                <p className="text-xs font-bold text-white font-battambang leading-tight group-hover:text-indigo-300 transition truncate">{currentUser.nameKhmer}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform ${showUserMenu ? 'rotate-180 text-indigo-300' : ''}`} />
            </button>

            {/* User Profile Dropdown Popup */}
            {showUserMenu && (
              <div 
                id="navbar-profile-popup"
                className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-slate-900/98 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-3 z-[100] animate-in fade-in zoom-in-95 duration-150 ring-1 ring-white/10"
              >
                {/* User card header */}
                <div className="flex items-center space-x-3 p-2.5 bg-white/5 rounded-2xl border border-white/10 mb-2">
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.nameKhmer} 
                    className="w-12 h-12 rounded-2xl object-cover border border-white/20 shadow-md shrink-0" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white font-battambang truncate">{currentUser.nameKhmer}</p>
                    <p className="text-[11px] text-indigo-300 truncate">{currentUser.nameEnglish || currentUser.username}</p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${currentRoleInfo.bgBadge} ${currentRoleInfo.color}`}>
                        {currentRoleInfo.khmer.split(' (')[0]}
                      </span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        isFirebaseAuth 
                          ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300' 
                          : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                      }`}>
                        {isFirebaseAuth ? (
                          <>
                            <Flame className="w-2.5 h-2.5 text-amber-400" />
                            <span>Firebase Auth</span>
                          </>
                        ) : (
                          <>
                            <Database className="w-2.5 h-2.5 text-amber-400" />
                            <span>Local Demo</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick actions list */}
                <div className="space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigateTab && onNavigateTab('profile');
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition font-battambang text-left cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>មើលប្រវត្តិរូបផ្ទាល់ខ្លួន (View Full Profile)</span>
                  </button>

                  {onEditUser && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onEditUser(currentUser);
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition font-battambang text-left cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>កែប្រែព័ត៌មានគណនី (Edit Profile)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigateTab && onNavigateTab('notifications');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition font-battambang text-left cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Bell className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>ការជូនដំណឹង (Notifications)</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      setIsChatOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition font-battambang text-left cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>ជំនួយការ AI & ការជជែក (Chat & AI Bot)</span>
                    </div>
                    {unreadChatCount > 0 && (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadChatCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowRoleMenu(true);
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition font-battambang text-left cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>ប្តូរតួនាទី / គណនី (Switch Role & Account)</span>
                  </button>

                  <button
                    type="button"
                    id="navbar-profile-settings-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigateTab && onNavigateTab('settings');
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition font-battambang text-left cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>ការកំណត់ប្រព័ន្ធ & ទិន្នន័យ (Settings & All Data)</span>
                  </button>

                  {onLogout && (
                    <div className="pt-1 mt-1 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          if (window.confirm('តើអ្នកពិតជាចង់ចាកចេញពីប្រព័ន្ធមែនទេ? (Are you sure you want to log out?)')) {
                            onLogout();
                          }
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-rose-300 hover:text-white hover:bg-rose-500/20 transition font-battambang text-left cursor-pointer"
                      >
                        <LogIn className="w-4 h-4 rotate-180 text-rose-400 shrink-0" />
                        <span>ចាកចេញពីប្រព័ន្ធ (Log Out)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {onLogout && (
              <button
                onClick={() => {
                  if (window.confirm('តើអ្នកពិតជាចង់ចាកចេញពីប្រព័ន្ធមែនទេ? (Are you sure you want to log out?)')) {
                    onLogout();
                  }
                }}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition backdrop-blur-md shadow-sm"
                title="ចាកចេញ (Log Out)"
              >
                <LogIn className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>

        </div>

      </div>

      </header>

      {/* Interactive Chat & School AI Bot Modal */}
      <ChatMessengerModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={currentUser}
        users={users || []}
        language={language}
        initialRecipientId={chatInitialUser}
        initialTab={chatInitialTab}
        onUnreadChange={() => {
          setUnreadChatCount(StorageService.getUnreadChatCount(currentUser.id, currentUser.role));
        }}
      />
    </>
  );
};
