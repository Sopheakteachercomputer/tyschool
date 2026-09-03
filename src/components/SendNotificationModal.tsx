import React, { useState, useMemo } from 'react';
import { User, UserRole, NotificationItem } from '../types';
import { 
  Bell, 
  Send, 
  X, 
  Users, 
  User as UserIcon, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Flame,
  LayoutGrid,
  Search,
  BookOpen,
  DollarSign,
  Calendar,
  ClipboardList,
  GraduationCap,
  MessageSquare,
  Building2
} from 'lucide-react';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  users: User[];
  onSendNotification: (notification: Partial<NotificationItem>) => void;
  replyTargetNotification?: NotificationItem | null;
}

interface NotificationPreset {
  id: string;
  name: string;
  category: 'ACADEMIC' | 'FINANCE' | 'ATTENDANCE' | 'LIBRARY' | 'ANNOUNCEMENT' | 'MESSAGE' | 'GENERAL';
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'URGENT';
  title: string;
  message: string;
  linkTab: string;
  icon: any;
}

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onSendNotification,
  replyTargetNotification
}) => {
  const [recipientType, setRecipientType] = useState<'USER' | 'ROLE' | 'ALL'>(() => {
    if (replyTargetNotification?.senderId) return 'USER';
    return 'USER';
  });

  const [selectedUserId, setSelectedUserId] = useState<string>(() => {
    if (replyTargetNotification?.senderId) {
      return replyTargetNotification.senderId;
    }
    return users[0]?.id || '';
  });

  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [title, setTitle] = useState(() => {
    if (replyTargetNotification) {
      return `ឆ្លើយតប៖ ${replyTargetNotification.title}`;
    }
    return '';
  });

  const [message, setMessage] = useState('');
  const [type, setType] = useState<'INFO' | 'WARNING' | 'SUCCESS' | 'URGENT'>('INFO');
  const [category, setCategory] = useState<'ACADEMIC' | 'FINANCE' | 'ATTENDANCE' | 'LIBRARY' | 'ANNOUNCEMENT' | 'MESSAGE' | 'GENERAL'>('MESSAGE');
  const [linkTab, setLinkTab] = useState<string>('dashboard');
  const [userSearch, setUserSearch] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const presets: NotificationPreset[] = [
    {
      id: 'fee_reminder',
      name: 'រំលឹកបង់ថ្លៃសិក្សា (Fee Reminder)',
      category: 'FINANCE',
      type: 'WARNING',
      title: 'ការរំលឹកបង់ថ្លៃសិក្សាប្រចាំឆមាស',
      message: 'សូមជម្រាបជូនដំណឹងដល់អាណាព្យាបាល និងសិស្សានុសិស្ស វិក្កយបត្រថ្លៃសិក្សាជិតដល់កាលបរិច្ឆេទកំណត់។ សូមទូទាត់តាមរយៈ KHQR ឬការិយាល័យគណនេយ្យ។',
      linkTab: 'fees_finance',
      icon: DollarSign
    },
    {
      id: 'homework_notice',
      name: 'រំលឹកកិច្ចការសាលា (Assignment Due)',
      category: 'ACADEMIC',
      type: 'INFO',
      title: 'រំលឹកកាលបរិច្ឆេទប្រគល់កិច្ចការស្វ័យសិក្សា',
      message: 'សូមសិស្សានុសិស្សទាំងអស់បញ្ជូនកិច្ចការស្រាវជ្រាវ និងលំហាត់អនុវត្តឱ្យបានទាន់ពេលវេលាកំណត់ ដើម្បីទទួលបានពិន្ទុពេញលេញ។',
      linkTab: 'assignments',
      icon: ClipboardList
    },
    {
      id: 'attendance_alert',
      name: 'ជូនដំណឹងវត្តមាន & យឺត (Attendance Notice)',
      category: 'ATTENDANCE',
      type: 'WARNING',
      title: 'ដំណឹងស្តីពីអវត្តមាន និងការមកយឺតរបស់សិស្ស',
      message: 'សូមជម្រាបជូនលោកអ្នកអាណាព្យាបាលជ្រាបអំពីវត្តមានរបស់កូនៗក្នុងម៉ោងសិក្សាថ្ងៃនេះ។ សូមទាក់ទងមកលោកគ្រូ-អ្នកគ្រូប្រចាំថ្នាក់ប្រសិនបើមានច្បាប់ឈប់សម្រាក។',
      linkTab: 'attendance',
      icon: Users
    },
    {
      id: 'exam_schedule',
      name: 'កាលវិភាគប្រឡង (Exam Schedule)',
      category: 'ACADEMIC',
      type: 'INFO',
      title: 'កាលវិភាគប្រឡងវាស់ស្ទង់សមត្ថភាពផ្លូវការ',
      message: 'កាលវិភាគប្រឡងត្រូវបានផ្សព្វផ្សាយ។ សូមសិស្សទាំងអស់ចូលមើលបន្ទប់ប្រឡង លេខតុ និងមុខវិជ្ជាប្រឡងក្នុងប្រព័ន្ធ។',
      linkTab: 'exams_grades',
      icon: GraduationCap
    },
    {
      id: 'urgent_meeting',
      name: 'ការប្រជុំបន្ទាន់ (Urgent Meeting)',
      category: 'ANNOUNCEMENT',
      type: 'URGENT',
      title: 'ការប្រជុំបន្ទាន់គណៈគ្រប់គ្រង & លោកគ្រូ-អ្នកគ្រូ',
      message: 'សូមអញ្ជើញលោកគ្រូ-អ្នកគ្រូ និងបុគ្គលិកអប់រំទាំងអស់ចូលរួមការប្រជុំបន្ទាន់នៅសាលប្រជុំកណ្តាល វេលាម៉ោង ៤:៣០ រសៀលថ្ងៃនេះ។',
      linkTab: 'announcements',
      icon: Flame
    },
    {
      id: 'office_visit',
      name: '🏢 អញ្ជើញមកការិយាល័យ (Come to Office)',
      category: 'GENERAL',
      type: 'INFO',
      title: 'ការអញ្ជើញមកកាន់ការិយាល័យរដ្ឋបាលសាលា (Office Notice)',
      message: 'សូមគោរពអញ្ជើញលោកអ្នកអាណាព្យាបាល/សិស្សានុសិស្ស មកកាន់ការិយាល័យរដ្ឋបាលសាលា ដើម្បីបំពេញបែបបទ ទទួលឯកសារផ្លូវការ ឬជួបពិភាក្សាផ្ទាល់ជាមួយគណៈគ្រប់គ្រង។ ម៉ោងធ្វើការ៖ ព្រឹក ០៧:៣០-១១:៣០ | រសៀល ០១:៣០-០៥:០០ (ថ្ងៃច័ន្ទ ដល់ ថ្ងៃសុក្រ)។',
      linkTab: 'dashboard',
      icon: Building2
    }
  ];

  const handleApplyPreset = (p: NotificationPreset) => {
    setSelectedPresetId(p.id);
    setTitle(p.title);
    setMessage(p.message);
    setType(p.type);
    setCategory(p.category);
    setLinkTab(p.linkTab);
  };

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => 
      u.nameKhmer.toLowerCase().includes(q) ||
      (u.nameEnglish && u.nameEnglish.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q))
    );
  }, [users, userSearch]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('សូមបញ្ចូលចំណងជើង និងអត្ថន័យនៃការជូនដំណឹង (Please enter title and message)');
      return;
    }

    const targetUser = users.find(u => u.id === selectedUserId);

    const newNotification: Partial<NotificationItem> = {
      title: title.trim(),
      message: message.trim(),
      type,
      category,
      linkTab: linkTab || 'dashboard',
      senderId: currentUser.id,
      senderName: currentUser.nameKhmer || currentUser.nameEnglish,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      createdAt: new Date().toISOString()
    };

    if (recipientType === 'USER' && targetUser) {
      newNotification.userId = targetUser.id;
      newNotification.recipientId = targetUser.id;
      newNotification.targetRole = targetUser.role;
    } else if (recipientType === 'ROLE') {
      newNotification.targetRole = selectedRole;
      newNotification.targetRoles = [selectedRole];
    } else {
      newNotification.targetRole = 'ALL';
    }

    onSendNotification(newNotification);
    onClose();
    setTitle('');
    setMessage('');
    setSelectedPresetId(null);
  };

  const navTabOptions = [
    { value: 'dashboard', labelKhmer: 'ផ្ទាំងដើម (Dashboard)' },
    { value: 'announcements', labelKhmer: 'សេចក្តីជូនដំណឹង (Announcements)' },
    { value: 'attendance', labelKhmer: 'វត្តមានសិស្ស (Attendance)' },
    { value: 'exams_grades', labelKhmer: 'ពិន្ទុ & ប្រឡង (Grades & Exams)' },
    { value: 'report_cards', labelKhmer: 'ព្រឹត្តិបត្រពិន្ទុ (Report Cards)' },
    { value: 'fees_finance', labelKhmer: 'ហិរញ្ញវត្ថុ & វិក្កយបត្រ (Finance)' },
    { value: 'assignments', labelKhmer: 'កិច្ចការសាលា (Assignments)' },
    { value: 'library', labelKhmer: 'បណ្ណាល័យ (Library)' },
    { value: 'timetable', labelKhmer: 'កាលវិភាគសិក្សា (Timetable)' },
    { value: 'events', labelKhmer: 'ព្រឹត្តិការណ៍ & កាលវិភាគ (Events)' }
  ];

  return (
    <div className="fixed inset-0 z-[99980] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/15 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-md">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white font-battambang text-sm flex items-center gap-2">
                <span>ផ្ញើការជូនដំណឹងផ្ទាល់ (Send User Notification)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-sans">
                  Live Dispatch
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">ផ្ញើសារ ឬដំណឹងជូនសិស្ស គ្រូ ឬមាតាបិតាភ្លាមៗ ជាមួយសំឡេង Alert</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Quick Presets Carousel */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-battambang flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>គំរូជូនដំណឹងរហ័ស (Quick Templates)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">ចុចដើម្បីបំពេញស្វ័យប្រវត្តិ</span>
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {presets.map(p => {
                const Icon = p.icon;
                const isSelected = selectedPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center space-x-1.5 shrink-0 border transition ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-3 h-3 text-amber-400" />
                    <span>{p.name.split(' (')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipient Target Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-battambang">
              ផ្ញើទៅកាន់ (Recipient Target)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRecipientType('USER')}
                className={`py-2 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                  recipientType === 'USER'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>អ្នកប្រើជាក់លាក់</span>
              </button>

              <button
                type="button"
                onClick={() => setRecipientType('ROLE')}
                className={`py-2 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                  recipientType === 'ROLE'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>តាមតួនាទី (Role)</span>
              </button>

              <button
                type="button"
                onClick={() => setRecipientType('ALL')}
                className={`py-2 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                  recipientType === 'ALL'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>ទាំងអស់ (Broadcast)</span>
              </button>
            </div>
          </div>

          {/* Specific User Search & Dropdown */}
          {recipientType === 'USER' && (
            <div className="space-y-2 p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 font-battambang">
                  ជ្រើសរើសគណនីអ្នកទទួល ({filteredUsers.length} នាក់)
                </label>
              </div>

              {/* Live search filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="ស្វែងរកឈ្មោះ ឬតួនាទី..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                {filteredUsers.map(u => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.nameKhmer} ({u.role}) - {u.email || u.username}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Role Dropdown */}
          {recipientType === 'ROLE' && (
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 font-battambang">
                ជ្រើសរើសតួនាទី (Select Target Role)
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="STUDENT" className="bg-slate-900 text-white">សិស្សទាំងអស់ (All Students)</option>
                <option value="TEACHER" className="bg-slate-900 text-white">លោកគ្រូ-អ្នកគ្រូទាំងអស់ (All Teachers)</option>
                <option value="PARENT" className="bg-slate-900 text-white">មាតាបិតា-អាណាព្យាបាល (All Parents)</option>
                <option value="ACCOUNTANT" className="bg-slate-900 text-white">គណនេយ្យករ (Accountants)</option>
                <option value="LIBRARIAN" className="bg-slate-900 text-white">បណ្ណារក្ស (Librarians)</option>
                <option value="DIRECTOR" className="bg-slate-900 text-white">នាយកសាលា (School Directors)</option>
                <option value="ADMIN" className="bg-slate-900 text-white">រដ្ឋបាល (Administrators)</option>
                <option value="SUPER_ADMIN" className="bg-slate-900 text-white">Super Admins</option>
              </select>
            </div>
          )}

          {/* Priority Type & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-battambang">
                កម្រិតអាទិភាព (Priority)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setType('INFO')}
                  className={`py-1.5 px-2 rounded-xl border text-[11px] font-semibold flex items-center justify-center space-x-1 transition ${
                    type === 'INFO'
                      ? 'bg-blue-600/30 text-blue-200 border-blue-400 shadow-xs'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Info className="w-3 h-3 text-blue-400" />
                  <span>ព័ត៌មាន (Info)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('SUCCESS')}
                  className={`py-1.5 px-2 rounded-xl border text-[11px] font-semibold flex items-center justify-center space-x-1 transition ${
                    type === 'SUCCESS'
                      ? 'bg-emerald-600/30 text-emerald-200 border-emerald-400 shadow-xs'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>ជោគជ័យ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('WARNING')}
                  className={`py-1.5 px-2 rounded-xl border text-[11px] font-semibold flex items-center justify-center space-x-1 transition ${
                    type === 'WARNING'
                      ? 'bg-amber-600/30 text-amber-200 border-amber-400 shadow-xs'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>ប្រុងប្រយ័ត្ន</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('URGENT')}
                  className={`py-1.5 px-2 rounded-xl border text-[11px] font-semibold flex items-center justify-center space-x-1 transition ${
                    type === 'URGENT'
                      ? 'bg-rose-600/30 text-rose-200 border-rose-400 shadow-xs'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Flame className="w-3 h-3 text-rose-400" />
                  <span>បន្ទាន់ (Urgent)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-battambang">
                ប្រភេទសារ (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="MESSAGE" className="bg-slate-900 text-white">សារផ្ទាល់ (Direct Message)</option>
                <option value="ACADEMIC" className="bg-slate-900 text-white">ការសិក្សា & ពិន្ទុ (Academic)</option>
                <option value="FINANCE" className="bg-slate-900 text-white">ហិរញ្ញវត្ថុ & វិក្កយបត្រ (Finance)</option>
                <option value="ATTENDANCE" className="bg-slate-900 text-white">វត្តមានសិស្ស (Attendance)</option>
                <option value="LIBRARY" className="bg-slate-900 text-white">បណ្ណាល័យ (Library)</option>
                <option value="ANNOUNCEMENT" className="bg-slate-900 text-white">សេចក្តីជូនដំណឹង (Announcement)</option>
                <option value="GENERAL" className="bg-slate-900 text-white">ទូទៅ (General)</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-battambang">
              ចំណងជើងការជូនដំណឹង (Notification Title) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ឧទាហរណ៍៖ រំលឹកកាលបរិច្ឆេទប្រគល់កិច្ចការ..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-500"
            />
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-battambang">
              ខ្លឹមសារលម្អិត (Notification Message) *
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="សរសេរខ្លឹមសារជូនដំណឹងនៅទីនេះ..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-500 resize-none font-battambang"
            />
          </div>

          {/* Target Navigation Link Tab */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-battambang">
              តំណភ្ជាប់ទំព័រពេលចុច (Jump To Tab)
            </label>
            <select
              value={linkTab}
              onChange={(e) => setLinkTab(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              {navTabOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                  {opt.labelKhmer}
                </option>
              ))}
            </select>
          </div>

          {/* Sender Identity Preview */}
          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                alt={currentUser.nameKhmer}
                className="w-7 h-7 rounded-lg object-cover border border-white/20"
              />
              <div>
                <p className="font-bold text-white font-battambang text-[11px]">
                  ផ្ញើចេញពី៖ {currentUser.nameKhmer} ({currentUser.role})
                </p>
                <p className="text-[10px] text-slate-400">នឹងបង្ហាញរូបតំណាងរបស់អ្នកទៅកាន់អ្នកទទួល</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold font-mono">
              VERIFIED
            </span>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition"
            >
              បោះបង់ (Cancel)
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold font-battambang flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ផ្ញើការជូនដំណឹងឥឡូវនេះ</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
