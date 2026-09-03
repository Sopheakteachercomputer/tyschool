import React, { useState, useMemo } from 'react';
import { NotificationItem, User, UserRole, Language, NavTab } from '../types';
import { 
  Bell, 
  Search, 
  Filter, 
  CheckCheck, 
  Trash2, 
  Send, 
  RefreshCw, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ArrowRight, 
  CornerDownRight, 
  Sparkles, 
  Clock, 
  Inbox, 
  Mail, 
  ExternalLink,
  BookOpen,
  DollarSign,
  CheckSquare,
  Award,
  Layers,
  Check
} from 'lucide-react';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  currentUser: User;
  language: Language;
  onSelectNotification: (notif: NotificationItem) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onDeleteNotification: (id: string) => void;
  onOpenSendNotification: () => void;
  onOpenReply: (notif: NotificationItem) => void;
  onNavigateTab: (tab: NavTab) => void;
  onRestoreSamples?: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications = [],
  currentUser,
  language,
  onSelectNotification,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onDeleteNotification,
  onOpenSendNotification,
  onOpenReply,
  onNavigateTab,
  onRestoreSamples
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'UNREAD' | 'DIRECT' | 'ACADEMIC' | 'ATTENDANCE' | 'FINANCE' | 'LIBRARY' | 'SYSTEM'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'URGENT' | 'WARNING' | 'INFO' | 'SUCCESS'>('ALL');

  // Metrics
  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const directCount = notifications.filter(n => 
    n.userId === currentUser.id || 
    n.recipientId === currentUser.id || 
    n.targetRole === currentUser.role || 
    (n.targetRoles && n.targetRoles.includes(currentUser.role as any))
  ).length;
  const urgentCount = notifications.filter(n => n.type === 'URGENT' || n.type === 'WARNING').length;

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title?.toLowerCase().includes(q);
        const matchMsg = n.message?.toLowerCase().includes(q);
        const matchSender = n.senderName?.toLowerCase().includes(q);
        const matchCategory = n.category?.toLowerCase().includes(q);
        if (!matchTitle && !matchMsg && !matchSender && !matchCategory) return false;
      }

      // Priority filter
      if (priorityFilter !== 'ALL' && n.type !== priorityFilter) {
        return false;
      }

      // Category / Tab filter
      if (categoryFilter === 'UNREAD') return !n.isRead;
      if (categoryFilter === 'DIRECT') {
        return (
          n.userId === currentUser.id ||
          n.recipientId === currentUser.id ||
          n.targetRole === currentUser.role ||
          (n.targetRoles && n.targetRoles.includes(currentUser.role as any))
        );
      }
      if (categoryFilter === 'ACADEMIC') return n.category === 'ACADEMIC';
      if (categoryFilter === 'ATTENDANCE') return n.category === 'ATTENDANCE';
      if (categoryFilter === 'FINANCE') return n.category === 'FINANCE';
      if (categoryFilter === 'LIBRARY') return n.category === 'LIBRARY';
      if (categoryFilter === 'SYSTEM') return n.category === 'SYSTEM';

      return true;
    });
  }, [notifications, searchQuery, categoryFilter, priorityFilter, currentUser]);

  const getPriorityBadge = (type: string) => {
    switch (type) {
      case 'URGENT':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Flame className="w-3 h-3 text-rose-400" />
            <span>{language === 'km' ? 'បន្ទាន់' : 'Urgent'}</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>{language === 'km' ? 'ការព្រមាន' : 'Warning'}</span>
          </span>
        );
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{language === 'km' ? 'ជោគជ័យ' : 'Success'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Info className="w-3 h-3 text-blue-400" />
            <span>{language === 'km' ? 'ព័ត៌មាន' : 'Notice'}</span>
          </span>
        );
    }
  };

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'ATTENDANCE':
        return <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md font-medium">{language === 'km' ? 'វត្តមាន' : 'Attendance'}</span>;
      case 'FINANCE':
        return <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-medium">{language === 'km' ? 'ហិរញ្ញវត្ថុ' : 'Finance'}</span>;
      case 'ACADEMIC':
        return <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-md font-medium">{language === 'km' ? 'ការសិក្សា' : 'Academic'}</span>;
      case 'LIBRARY':
        return <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-md font-medium">{language === 'km' ? 'បណ្ណាល័យ' : 'Library'}</span>;
      case 'SYSTEM':
        return <span className="text-[10px] bg-slate-500/20 text-slate-300 border border-slate-500/30 px-2 py-0.5 rounded-md font-medium">{language === 'km' ? 'ប្រព័ន្ធ' : 'System'}</span>;
      default:
        return <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-medium">{language === 'km' ? 'ទូទៅ' : 'General'}</span>;
    }
  };

  return (
    <div id="notifications-view" className="space-y-6 pb-12">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 bg-indigo-600/20 border border-indigo-500/40 rounded-2xl text-indigo-300 shadow-md">
                <Bell className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-wide font-battambang">
                  {language === 'km' ? 'មជ្ឈមណ្ឌលការជូនដំណឹង & សារផ្ទាល់' : 'Notifications & Direct Alerts Center'}
                </h1>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  {language === 'km' 
                    ? 'ទទួល និងតាមដានរាល់ដំណឹងបន្ទាន់ វត្តមាន ការប្រឡង ហិរញ្ញវត្ថុ និងសារផ្ទាល់ពីសាលា' 
                    : 'Track real-time alerts, attendance notifications, exam schedules, tuition fees, and direct messages'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-compose-notification"
              onClick={onOpenSendNotification}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'km' ? '+ ផ្ញើដំណឹងថ្មី' : '+ Send Alert'}</span>
            </button>

            {unreadCount > 0 && (
              <button
                id="btn-mark-all-read"
                onClick={onMarkAllAsRead}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-semibold border border-white/10 flex items-center space-x-1.5 transition"
                title="សម្គាល់ថាបានអានទាំងអស់"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'km' ? 'អានទាំងអស់' : 'Mark All Read'}</span>
              </button>
            )}

            {onRestoreSamples && (
              <button
                id="btn-restore-samples"
                onClick={onRestoreSamples}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 text-xs font-semibold border border-indigo-500/20 flex items-center space-x-1.5 transition"
                title="ផ្ទុកការជូនដំណឹងគំរូឡើងវិញ"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'ផ្ទុកគំរូឡើងវិញ' : 'Restore Samples'}</span>
              </button>
            )}

            {totalCount > 0 && (
              <button
                id="btn-clear-all-notifications"
                onClick={() => {
                  if (confirm(language === 'km' ? 'តើអ្នកពិតជាចង់សម្អាតការជូនដំណឹងទាំងអស់មែនទេ?' : 'Are you sure you want to clear all notifications?')) {
                    onClearAll();
                  }
                }}
                className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition"
                title={language === 'km' ? 'សម្អាតទាំងអស់' : 'Clear All'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">{language === 'km' ? 'សរុបទាំងអស់' : 'Total Alerts'}</span>
              <Inbox className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">{totalCount}</div>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-3 backdrop-blur-md">
            <div className="flex items-center justify-between text-indigo-300 mb-1">
              <span className="text-[11px] font-medium">{language === 'km' ? 'មិនទាន់អាន' : 'Unread'}</span>
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            </div>
            <div className="text-xl font-black text-white font-mono flex items-center space-x-2">
              <span>{unreadCount}</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-sans">
                  {language === 'km' ? 'ថ្មី' : 'New'}
                </span>
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">{language === 'km' ? 'ផ្ញើមកខ្ញុំ' : 'Direct to Me'}</span>
              <Mail className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">{directCount}</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium">{language === 'km' ? 'បន្ទាន់ & ការព្រមាន' : 'Urgent / Warnings'}</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-black text-rose-300 font-mono">{urgentCount}</div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filtering Tabs */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'km' ? 'ស្វែងរកការជូនដំណឹងតាមចំណងជើង ខ្លឹមសារ ឬឈ្មោះអ្នកផ្ញើ...' : 'Search by title, message content, or sender...'}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition font-battambang"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Priority Quick Filter */}
          <div className="flex items-center space-x-1.5 shrink-0 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] text-slate-400 mr-1 flex items-center">
              <Filter className="w-3 h-3 mr-1" />
              {language === 'km' ? 'កម្រិត៖' : 'Priority:'}
            </span>
            {(['ALL', 'URGENT', 'WARNING', 'INFO', 'SUCCESS'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition shrink-0 ${
                  priorityFilter === p
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {p === 'ALL' ? (language === 'km' ? 'ទាំងអស់' : 'All') :
                 p === 'URGENT' ? (language === 'km' ? 'បន្ទាន់' : 'Urgent') :
                 p === 'WARNING' ? (language === 'km' ? 'ការព្រមាន' : 'Warning') :
                 p === 'SUCCESS' ? (language === 'km' ? 'ជោគជ័យ' : 'Success') :
                 (language === 'km' ? 'ព័ត៌មាន' : 'Info')}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 pt-2 border-t border-white/5 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              categoryFilter === 'ALL'
                ? 'bg-white/15 text-white shadow-xs border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {language === 'km' ? 'ទាំងអស់' : 'All'} ({notifications.length})
          </button>

          <button
            onClick={() => setCategoryFilter('UNREAD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shrink-0 ${
              categoryFilter === 'UNREAD'
                ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-400/40 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{language === 'km' ? 'មិនទាន់អាន' : 'Unread'}</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCategoryFilter('DIRECT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              categoryFilter === 'DIRECT'
                ? 'bg-white/15 text-white shadow-xs border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {language === 'km' ? 'ផ្ញើមកខ្ញុំ' : 'Direct'} ({directCount})
          </button>

          <button
            onClick={() => setCategoryFilter('ACADEMIC')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              categoryFilter === 'ACADEMIC'
                ? 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {language === 'km' ? 'ការសិក្សា' : 'Academic'}
          </button>

          <button
            onClick={() => setCategoryFilter('ATTENDANCE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              categoryFilter === 'ATTENDANCE'
                ? 'bg-purple-500/20 text-purple-200 border border-purple-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {language === 'km' ? 'វត្តមាន' : 'Attendance'}
          </button>

          <button
            onClick={() => setCategoryFilter('FINANCE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              categoryFilter === 'FINANCE'
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {language === 'km' ? 'ហិរញ្ញវត្ថុ' : 'Finance'}
          </button>

          <button
            onClick={() => setCategoryFilter('LIBRARY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              categoryFilter === 'LIBRARY'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {language === 'km' ? 'បណ្ណាល័យ' : 'Library'}
          </button>

          <button
            onClick={() => setCategoryFilter('SYSTEM')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              categoryFilter === 'SYSTEM'
                ? 'bg-slate-500/20 text-slate-200 border border-slate-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {language === 'km' ? 'ប្រព័ន្ធ' : 'System'}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-xl">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="text-base font-bold text-white font-battambang">
              {language === 'km' ? 'មិនមានការជូនដំណឹងដែលត្រូវបង្ហាញទេ' : 'No notifications found'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              {searchQuery || categoryFilter !== 'ALL' || priorityFilter !== 'ALL'
                ? (language === 'km' ? 'មិនមានការជូនដំណឹងស្របតាមការស្វែងរករបស់អ្នកទេ។ សូមសាកល្បងផ្លាស់ប្តូរតម្រង។' : 'No notifications matched your filters. Try adjusting your search query.')
                : (language === 'km' ? 'ប្រអប់ទទួលការជូនដំណឹងរបស់អ្នកគឺទទេស្អាត។ អ្នកអាចផ្ញើការជូនដំណឹងថ្មី ឬផ្ទុកគំរូឡើងវិញបាន។' : 'Your notifications inbox is clean. You can send a new alert or restore sample notifications.')}
            </p>

            <div className="flex items-center justify-center space-x-3 mt-6">
              {onRestoreSamples && (
                <button
                  onClick={onRestoreSamples}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'ផ្ទុកការជូនដំណឹងគំរូឡើងវិញ' : 'Restore Sample Alerts'}</span>
                </button>
              )}
              <button
                onClick={onOpenSendNotification}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/10 flex items-center space-x-2 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'km' ? '+ ផ្ញើដំណឹងថ្មី' : '+ Send Notification'}</span>
              </button>
            </div>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isUnread = !n.isRead;
            return (
              <div
                key={n.id}
                id={`notification-card-${n.id}`}
                className={`relative group bg-slate-900/80 border rounded-2xl p-4 transition-all duration-200 backdrop-blur-xl shadow-lg hover:shadow-indigo-500/10 ${
                  isUnread 
                    ? 'border-indigo-500/50 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 ring-1 ring-indigo-500/30' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Left vertical status stripe */}
                <div className={`absolute top-3 bottom-3 left-0 w-1 rounded-r-full ${
                  n.type === 'URGENT' ? 'bg-rose-500' :
                  n.type === 'WARNING' ? 'bg-amber-500' :
                  n.type === 'SUCCESS' ? 'bg-emerald-500' :
                  isUnread ? 'bg-indigo-500' : 'bg-slate-600/40'
                }`} />

                <div className="flex items-start gap-3.5 pl-2">
                  {/* Sender Avatar or Category Icon */}
                  <div className="shrink-0 mt-0.5">
                    {n.senderAvatar ? (
                      <img
                        src={n.senderAvatar}
                        alt={n.senderName || 'Sender'}
                        className="w-11 h-11 rounded-2xl object-cover border border-white/20 shadow-md"
                      />
                    ) : (
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-md ${
                        n.type === 'URGENT' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                        n.type === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        n.type === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      }`}>
                        {n.type === 'URGENT' ? <Flame className="w-5 h-5" /> :
                         n.type === 'WARNING' ? <AlertTriangle className="w-5 h-5" /> :
                         n.type === 'SUCCESS' ? <CheckCircle2 className="w-5 h-5" /> :
                         <Bell className="w-5 h-5" />}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {getPriorityBadge(n.type)}
                        {getCategoryBadge(n.category)}
                        {n.senderName && (
                          <span className="text-[11px] text-slate-300 font-medium">
                            {language === 'km' ? 'ពី៖' : 'From:'} <strong className="text-white">{n.senderName}</strong>
                            {n.senderRole && <span className="text-slate-400 ml-1 font-mono text-[10px]">({n.senderRole})</span>}
                          </span>
                        )}
                      </div>

                      {/* Timestamp & Unread Dot */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{n.timestamp || 'មុននេះ'}</span>
                        </span>
                        {isUnread && (
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500 animate-pulse" title="មិនទាន់អាន" />
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => onSelectNotification(n)}
                      className={`text-sm font-bold mt-1 font-battambang cursor-pointer hover:text-indigo-300 transition ${
                        isUnread ? 'text-white' : 'text-slate-200'
                      }`}
                    >
                      {n.title}
                    </h3>

                    {/* Message Body */}
                    <p className="text-xs text-slate-300 font-battambang mt-1 leading-relaxed whitespace-pre-wrap">
                      {n.message}
                    </p>

                    {/* Target Audience chip if present */}
                    {(n.targetRoles || n.targetRole) && (
                      <div className="mt-2 text-[10px] text-slate-400 flex items-center space-x-1.5">
                        <span className="text-slate-500">{language === 'km' ? 'ទស្សនិកជនគោលដៅ៖' : 'Target:'}</span>
                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-slate-300 font-mono">
                          {n.targetRole === 'ALL' ? (language === 'km' ? 'សាលាទាំងមូល (All)' : 'All School') : (n.targetRoles?.join(', ') || n.targetRole)}
                        </span>
                      </div>
                    )}

                    {/* Action Toolbar */}
                    <div className="mt-3.5 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        {/* View Full Modal */}
                        <button
                          onClick={() => onSelectNotification(n)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold border border-indigo-500/20 flex items-center space-x-1 transition"
                        >
                          <span>{language === 'km' ? 'មើលលម្អិត' : 'View Detail'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        {/* Reply Button */}
                        <button
                          onClick={() => onOpenReply(n)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-semibold border border-white/10 flex items-center space-x-1 transition"
                        >
                          <CornerDownRight className="w-3 h-3 text-indigo-400" />
                          <span>{language === 'km' ? 'ឆ្លើយតប' : 'Reply'}</span>
                        </button>

                        {/* Jump to linked Tab if available */}
                        {n.linkTab && (
                          <button
                            onClick={() => onNavigateTab(n.linkTab as NavTab)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-semibold border border-white/10 flex items-center space-x-1 transition"
                          >
                            <ExternalLink className="w-3 h-3 text-emerald-400" />
                            <span>{language === 'km' ? `ទៅកាន់ ${n.linkTab}` : `Open ${n.linkTab}`}</span>
                          </button>
                        )}
                      </div>

                      {/* Right actions: Toggle Read & Delete */}
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => onMarkAsRead(n.id)}
                          className={`p-1.5 rounded-lg text-[11px] transition ${
                            isUnread 
                              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' 
                              : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200'
                          }`}
                          title={isUnread ? (language === 'km' ? 'សម្គាល់ថាបានអាន' : 'Mark as read') : (language === 'km' ? 'បានអានរួច' : 'Already read')}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteNotification(n.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition"
                          title={language === 'km' ? 'លុបការជូនដំណឹង' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
