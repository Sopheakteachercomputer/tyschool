import React from 'react';
import { NotificationItem, User } from '../types';
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  ArrowRight, 
  Clock, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Flame,
  ExternalLink,
  Shield,
  Tag,
  User as UserIcon
} from 'lucide-react';

interface NotificationDetailModalProps {
  notification: NotificationItem | null;
  currentUser?: User;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onDelete?: (id: string) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenReply?: (notification: NotificationItem) => void;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  notification,
  currentUser,
  onClose,
  onMarkAsRead,
  onDelete,
  onNavigateTab,
  onOpenReply
}) => {
  if (!notification) return null;

  const tabLabels: Record<string, string> = {
    dashboard: 'ផ្ទាំងគ្រប់គ្រង (Dashboard)',
    students: 'គ្រប់គ្រងសិស្ស (Students)',
    teachers: 'គ្រប់គ្រងគ្រូ (Teachers)',
    parents: 'អាណាព្យាបាល (Parents)',
    classes_subjects: 'ថ្នាក់រៀន & មុខវិជ្ជា (Classes & Subjects)',
    attendance: 'វត្តមានសិស្ស (Attendance)',
    timetable: 'កាលវិភាគ (Timetable)',
    exams_grades: 'ការប្រឡង & ពិន្ទុ (Exams & Grades)',
    grades: 'ពិន្ទុសិស្ស (Grades)',
    exams: 'ការប្រឡង (Exams)',
    report_cards: 'ព្រឹត្តិបត្រពិន្ទុ (Report Cards)',
    assignments: 'កិច្ចការសិស្ស (Assignments)',
    fees_finance: 'ហិរញ្ញវត្ថុ & វិក្កយបត្រ (Finance & Fees)',
    library: 'បណ្ណាល័យ (Library)',
    announcements: 'សេចក្តីជូនដំណឹង (Announcements)',
    events: 'ព្រឹត្តិការណ៍ & ប្រតិទិន (Events & Calendar)',
    certificates: 'វិញ្ញាបនបត្រ & លិខិត (Certificates)',
    weekly_report: 'របាយការណ៍បង្រៀន (Weekly Report)',
    my_projects: 'គម្រោងកូដ (My Projects)',
    my_notes: 'កំណត់ចំណាំ (My Notes)',
    my_progress: 'វឌ្ឍនភាព (My Progress)',
    profile: 'គណនីផ្ទាល់ខ្លួន (My Profile)'
  };

  const categoryLabels: Record<string, { label: string; color: string }> = {
    ACADEMIC: { label: 'ការសិក្សា & ពិន្ទុ (Academic)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    FINANCE: { label: 'ហិរញ្ញវត្ថុ (Finance)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    ATTENDANCE: { label: 'វត្តមានសិស្ស (Attendance)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    LIBRARY: { label: 'បណ្ណាល័យ (Library)', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    ANNOUNCEMENT: { label: 'សេចក្តីជូនដំណឹង (Announcement)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    SYSTEM: { label: 'ប្រព័ន្ធស្វ័យប្រវត្តិ (System)', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
    MESSAGE: { label: 'សារផ្ទាល់ (Direct Message)', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    GENERAL: { label: 'ទូទៅ (General)', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' }
  };

  const categoryInfo = notification.category ? categoryLabels[notification.category] || categoryLabels.GENERAL : categoryLabels.GENERAL;

  return (
    <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-white/15 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl border ${
              notification.type === 'URGENT' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 shadow-md shadow-rose-500/20' :
              notification.type === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-md shadow-amber-500/20' :
              notification.type === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-md shadow-emerald-500/20' :
              'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 shadow-md shadow-indigo-500/20'
            }`}>
              {notification.type === 'URGENT' ? <Flame className="w-5 h-5" /> :
               notification.type === 'WARNING' ? <AlertTriangle className="w-5 h-5" /> :
               notification.type === 'SUCCESS' ? <CheckCircle2 className="w-5 h-5" /> :
               <Bell className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryInfo.color}`}>
                  {categoryInfo.label}
                </span>
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{notification.timestamp}</span>
                </span>
              </div>
              <h3 className="font-bold text-white font-battambang text-sm mt-0.5 line-clamp-1">
                {notification.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Sender Profile Box */}
          {notification.senderName && (
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {notification.senderAvatar ? (
                  <img
                    src={notification.senderAvatar}
                    alt={notification.senderName}
                    className="w-10 h-10 rounded-xl object-cover border border-white/20 shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-white font-battambang flex items-center gap-1.5">
                    <span>{notification.senderName}</span>
                    {notification.senderRole && (
                      <span className="text-[10px] font-sans px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-semibold">
                        {notification.senderRole}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    អ្នកផ្ញើការជូនដំណឹង (Notification Sender)
                  </p>
                </div>
              </div>

              {onOpenReply && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenReply(notification);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-bold font-battambang flex items-center space-x-1.5 transition"
                >
                  <Send className="w-3 h-3" />
                  <span>ឆ្លើយតប</span>
                </button>
              )}
            </div>
          )}

          {/* Full Message Details */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              ខ្លឹមសារការជូនដំណឹង (Message)
            </h4>
            <p className="text-sm text-slate-100 font-battambang leading-relaxed whitespace-pre-line">
              {notification.message}
            </p>
          </div>

          {/* Target Navigation Tab Card */}
          {notification.linkTab && onNavigateTab && (
            <div 
              onClick={() => {
                onMarkAsRead(notification.id);
                onNavigateTab(notification.linkTab!);
                onClose();
              }}
              className="p-3.5 rounded-2xl bg-linear-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 hover:border-indigo-400 hover:brightness-110 cursor-pointer flex items-center justify-between transition group shadow-md"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30 group-hover:scale-105 transition">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">ចុចដើម្បីទៅកាន់ទំព័រពាក់ព័ន្ធ (Quick Jump)</p>
                  <p className="text-xs font-bold text-white font-battambang mt-0.5">
                    {tabLabels[notification.linkTab] || notification.linkTab}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition" />
            </div>
          )}

          {/* Extra Meta Info */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-500 block text-[10px]">ស្ថានភាពអាន:</span>
              <span className={`font-semibold font-battambang ${notification.isRead ? 'text-emerald-400' : 'text-amber-400'}`}>
                {notification.isRead ? '✓ បានអានរួចរាល់' : '● មិនទាន់អាន'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-500 block text-[10px]">កម្រិតអាទិភាព:</span>
              <span className="font-semibold uppercase font-mono text-slate-200">
                {notification.type}
              </span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-slate-800/30">
          <div className="flex items-center space-x-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(notification.id);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 transition"
                title="លុបការជូនដំណឹងនេះ"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>លុបចោល</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {!notification.isRead && (
              <button
                type="button"
                onClick={() => {
                  onMarkAsRead(notification.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center space-x-1.5 transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>សម្គាល់ថាបានអាន</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition"
            >
              បិទ
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
