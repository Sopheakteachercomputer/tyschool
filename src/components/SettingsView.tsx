import React, { useState, useMemo, useEffect } from 'react';
import { SchoolProfile, User, UserRole, Student, Teacher, Parent, ClassRoom, Subject, GradeRecord, AttendanceRecord, FeeInvoice, PaymentRecord, Book, BookBorrow, Announcement, SchoolEvent, CertificateRecord, AuditLog, WeeklyReport, WeeklyQuizScore } from '../types';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Building, 
  DollarSign, 
  Users, 
  UserPlus, 
  Shield, 
  KeyRound, 
  Copy, 
  Check, 
  Crown, 
  Edit, 
  Trash2, 
  Search, 
  Lock, 
  UserCheck, 
  Sparkles, 
  Phone, 
  Mail, 
  UserCog, 
  X, 
  AlertCircle, 
  Award, 
  Image as ImageIcon, 
  Palette,
  Database,
  HardDrive,
  FileSpreadsheet,
  Layers,
  BookOpen,
  GraduationCap,
  Calendar,
  Clock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldAlert,
  Cpu,
  CheckCheck,
  Globe,
  Sliders,
  Flame,
  Send,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  MailCheck,
  MailWarning,
  ToggleLeft,
  ToggleRight,
  Info,
  Link2,
  Unlink
} from 'lucide-react';
import { CertificateBackgroundModal, CERTIFICATE_PRESETS } from './CertificateBackgroundModal';
import { storageService } from '../services/storageService';
import { roleLabels } from './Navbar';
import { FirebaseAuthService, auth, type FirebaseAuthErrorDetail } from '../services/firebase';
import type { User as FirebaseUser } from 'firebase/auth';

interface SettingsViewProps {
  school: SchoolProfile;
  currentUser?: User;
  onSaveSchool: (profile: SchoolProfile) => void;
  onResetData: () => void;
  users?: User[];
  onOpenSignUpModal?: () => void;
  onSelectUser?: (user: User) => void;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
  onRemoveAllUsers?: (keepSuperAdmin: boolean) => void;
  onClearLogs?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  school,
  currentUser,
  onSaveSchool,
  onResetData,
  users = [],
  onOpenSignUpModal,
  onSelectUser,
  onEditUser,
  onDeleteUser,
  onRemoveAllUsers,
  onClearLogs
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'SYSTEM' | 'ACCOUNTS' | 'DATABASE' | 'SECURITY'>('SYSTEM');
  const [form, setForm] = useState<SchoolProfile>({ ...school });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const [isRemoveAllModalOpen, setIsRemoveAllModalOpen] = useState(false);
  const [keepSuperAdminOption, setKeepSuperAdminOption] = useState(true);
  const [isClearLogsModalOpen, setIsClearLogsModalOpen] = useState(false);
  const [isResetDataModalOpen, setIsResetDataModalOpen] = useState(false);
  const [logsClearedSuccess, setLogsClearedSuccess] = useState(false);
  const [cacheClearedSuccess, setCacheClearedSuccess] = useState(false);
  const [isCertBgModalOpen, setIsCertBgModalOpen] = useState(false);

  // Firebase Live Auth & Email Verification State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(() => FirebaseAuthService.getCurrentFirebaseUser());
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isReloadingAuth, setIsReloadingAuth] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    messageKhmer: string;
    messageEnglish: string;
  } | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Security Policy Toggles (UI state placeholders)
  const [requireEmailVerificationPolicy, setRequireEmailVerificationPolicy] = useState(false);
  const [autoSendVerificationOnSignup, setAutoSendVerificationOnSignup] = useState(true);

  // Sync Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = FirebaseAuthService.onAuthChanged((u) => {
      setFirebaseUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleSendEmailVerification = async () => {
    if (cooldownSeconds > 0) return;
    setIsSendingVerification(true);
    setVerificationFeedback(null);

    const res = await FirebaseAuthService.sendVerificationEmail(firebaseUser);
    setIsSendingVerification(false);

    if (res.success) {
      setVerificationFeedback({
        type: 'success',
        messageKhmer: `លិខិតផ្ទៀងផ្ទាត់ត្រូវបានផ្ញើទៅកាន់ ${firebaseUser?.email || currentUser?.email || 'អ៊ីមែលរបស់អ្នក'} រួចរាល់! សូមពិនិត្យមើលប្រអប់សំបុត្រ (Inbox/Spam)។`,
        messageEnglish: `Verification email dispatched to ${firebaseUser?.email || currentUser?.email || 'your email'}. Please check your inbox or spam folder.`
      });
      setCooldownSeconds(60);
    } else {
      setVerificationFeedback({
        type: 'error',
        messageKhmer: res.errorDetail?.khmer || res.error || 'មិនអាចផ្ញើអ៊ីមែលផ្ទៀងផ្ទាត់បានទេ',
        messageEnglish: res.errorDetail?.english || 'Failed to send verification email. Please try again.'
      });
    }
  };

  const handleReloadVerificationStatus = async () => {
    setIsReloadingAuth(true);
    const reloaded = await FirebaseAuthService.reloadUser(firebaseUser);
    setFirebaseUser(reloaded);
    setIsReloadingAuth(false);

    if (reloaded?.emailVerified) {
      setVerificationFeedback({
        type: 'success',
        messageKhmer: 'អបអរសាទរ! គណនីអ៊ីមែលរបស់អ្នកត្រូវបានផ្ទៀងផ្ទាត់ដោយជោគជ័យ (Verified)!',
        messageEnglish: 'Your email address has been successfully verified.'
      });
    } else {
      setVerificationFeedback({
        type: 'info',
        messageKhmer: 'ស្ថានភាពបច្ចុប្បន្ន៖ អ៊ីមែលមិនទាន់ត្រូវបានផ្ទៀងផ្ទាត់នៅឡើយទេ។ សូមចុចលើតំណភ្ជាប់ក្នុងអ៊ីមែលរបស់អ្នក។',
        messageEnglish: 'Current status: Email is not verified yet. Please check your inbox and click the verification link.'
      });
    }
  };

  // Provider Linking State & Handlers
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [isUnlinkingGoogle, setIsUnlinkingGoogle] = useState(false);
  const [linkFeedback, setLinkFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    messageKhmer: string;
    messageEnglish: string;
  } | null>(null);

  // Checks for linked providers
  const isGoogleLinked = useMemo(() => {
    return FirebaseAuthService.isProviderLinked('google.com', firebaseUser);
  }, [firebaseUser]);

  const isPasswordLinked = useMemo(() => {
    return FirebaseAuthService.isProviderLinked('password', firebaseUser);
  }, [firebaseUser]);

  const totalLinkedProviders = useMemo(() => {
    return firebaseUser?.providerData?.length || 0;
  }, [firebaseUser]);

  const handleLinkGoogleAccount = async () => {
    setIsLinkingGoogle(true);
    setLinkFeedback(null);
    const res = await FirebaseAuthService.linkGoogleAccount(firebaseUser);
    setIsLinkingGoogle(false);

    if (res.success && res.user) {
      setFirebaseUser(res.user);
      setLinkFeedback({
        type: 'success',
        messageKhmer: 'គណនី Google ត្រូវបានភ្ជាប់ជាមួយគណនីរបស់អ្នកដោយជោគជ័យ (Google Account Linked)! ឥឡូវនេះអ្នកអាចចូលដោយប្រើ Google Sign-In ឬពាក្យសម្ងាត់បាន។',
        messageEnglish: 'Google Account successfully linked to your current profile! You can now sign in using Google.'
      });
    } else {
      setLinkFeedback({
        type: 'error',
        messageKhmer: res.errorDetail?.khmer || res.error || 'មិនអាចភ្ជាប់គណនី Google បានទេ',
        messageEnglish: res.errorDetail?.english || 'Failed to link Google account. Please try again.'
      });
    }
  };

  const handleUnlinkGoogleAccount = async () => {
    if (!window.confirm('តើអ្នកពិតជាចង់ផ្តាច់ការភ្ជាប់គណនី Google មែនទេ? (Are you sure you want to unlink your Google account?)')) return;
    setIsUnlinkingGoogle(true);
    setLinkFeedback(null);
    const res = await FirebaseAuthService.unlinkGoogleAccount(firebaseUser);
    setIsUnlinkingGoogle(false);

    if (res.success && res.user) {
      setFirebaseUser(res.user);
      setLinkFeedback({
        type: 'info',
        messageKhmer: 'បានផ្តាច់ការភ្ជាប់គណនី Google រួចរាល់ដោយជោគជ័យ។',
        messageEnglish: 'Google Account has been unlinked successfully.'
      });
    } else {
      setLinkFeedback({
        type: 'error',
        messageKhmer: res.errorDetail?.khmer || res.error || 'មិនអាចផ្តាច់ការភ្ជាប់គណនី Google បានទេ',
        messageEnglish: res.errorDetail?.english || 'Failed to unlink Google account.'
      });
    }
  };

  // Determine provider info
  const primaryProviderId = useMemo(() => {
    if (!firebaseUser) return 'system_local';
    const providers = firebaseUser.providerData;
    if (providers && providers.length > 0) {
      return providers[0].providerId;
    }
    return 'password';
  }, [firebaseUser]);

  const isEmailVerified = Boolean(firebaseUser ? firebaseUser.emailVerified : false);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Retrieve live counts from storage service
  const systemDataCounts = useMemo(() => {
    const students = storageService.getStudents();
    const teachers = storageService.getTeachers();
    const parents = storageService.getParents();
    const classes = storageService.getClasses();
    const subjects = storageService.getSubjects();
    const attendance = storageService.getAttendance();
    const grades = storageService.getGrades();
    const exams = storageService.getExams();
    const quizScores = storageService.getWeeklyQuizScores();
    const cleaningGroups = storageService.getCleaningGroups();
    const cleaningRecords = storageService.getCleaningRecords();
    const invoices = storageService.getInvoices();
    const payments = storageService.getPayments();
    const books = storageService.getBooks();
    const borrows = storageService.getBorrows();
    const weeklyReports = storageService.getWeeklyReports();
    const announcements = storageService.getAnnouncements();
    const events = storageService.getEvents();
    const certificates = storageService.getCertificates();
    const auditLogs = storageService.getAuditLogs();

    return {
      studentsCount: students.length,
      teachersCount: teachers.length,
      parentsCount: parents.length,
      classesCount: classes.length,
      subjectsCount: subjects.length,
      attendanceCount: attendance.length,
      gradesCount: grades.length,
      examsCount: exams.length,
      quizScoresCount: quizScores.length,
      cleaningGroupsCount: cleaningGroups.length,
      cleaningRecordsCount: cleaningRecords.length,
      invoicesCount: invoices.length,
      paymentsCount: payments.length,
      booksCount: books.length,
      borrowsCount: borrows.length,
      weeklyReportsCount: weeklyReports.length,
      announcementsCount: announcements.length,
      eventsCount: events.length,
      certificatesCount: certificates.length,
      auditLogsCount: auditLogs.length,
      totalRecords: students.length + teachers.length + parents.length + classes.length + subjects.length + attendance.length + grades.length + exams.length + quizScores.length + invoices.length + payments.length + books.length + borrows.length + weeklyReports.length + announcements.length + events.length + certificates.length + auditLogs.length
    };
  }, [logsClearedSuccess, users.length]);

  // Estimate local storage usage in KB
  const storageUsageKb = useMemo(() => {
    try {
      let totalLength = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalLength += (localStorage[key].length + key.length) * 2;
        }
      }
      return Math.round(totalLength / 1024);
    } catch {
      return 128;
    }
  }, [logsClearedSuccess, cacheClearedSuccess]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចកែប្រែព័ត៌មានសាលាបាន!');
      return;
    }
    onSaveSchool(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportDatabase = () => {
    const rawData = storageService.exportFullBackup();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(rawData);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cambodia_school_full_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCollectionCSV = (collectionName: string) => {
    let data: any[] = [];
    let filename = '';

    if (collectionName === 'students') {
      data = storageService.getStudents();
      filename = 'students_list.json';
    } else if (collectionName === 'teachers') {
      data = storageService.getTeachers();
      filename = 'teachers_list.json';
    } else if (collectionName === 'users') {
      data = users;
      filename = 'all_users_accounts.json';
    } else if (collectionName === 'invoices') {
      data = storageService.getInvoices();
      filename = 'invoices_finance.json';
    } else if (collectionName === 'quiz_scores') {
      data = storageService.getWeeklyQuizScores();
      filename = 'weekly_quiz_scores.json';
    } else if (collectionName === 'attendance') {
      data = storageService.getAttendance();
      filename = 'attendance_records.json';
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចបញ្ចូល Backup Database បាន!');
      return;
    }
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        const content = event.target?.result as string;
        const success = storageService.importBackup(content);
        if (success) {
          alert('ទិន្នន័យត្រូវបានបញ្ចូលដោយជោគជ័យ! ប្រព័ន្ធនឹងដំណើរការឡើងវិញ។');
          window.location.reload();
        } else {
          alert('ឯកសារបម្រុងទុកមិនត្រឹមត្រូវ សូមពិនិត្យឡើងវិញ។');
        }
      };
    }
  };

  const handleClearCache = () => {
    try {
      sessionStorage.clear();
      setCacheClearedSuccess(true);
      setTimeout(() => setCacheClearedSuccess(false), 3000);
    } catch {
      // ignore
    }
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      (u.nameKhmer && u.nameKhmer.toLowerCase().includes(q)) ||
      (u.nameEnglish && u.nameEnglish.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q));

    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'ALL' || (u.status || 'ACTIVE') === userStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Role Statistics for Accounts
  const accountStats = useMemo(() => {
    const total = users.length;
    const superAdmins = users.filter(u => u.role === 'SUPER_ADMIN').length;
    const admins = users.filter(u => u.role === 'ADMIN' || u.role === 'SCHOOL_ADMIN' || u.role === 'DIRECTOR').length;
    const teachers = users.filter(u => u.role === 'TEACHER').length;
    const students = users.filter(u => u.role === 'STUDENT').length;
    const parents = users.filter(u => u.role === 'PARENT').length;
    const staff = users.filter(u => u.role === 'ACCOUNTANT' || u.role === 'LIBRARIAN' || u.role === 'STAFF').length;
    const suspended = users.filter(u => u.status === 'SUSPENDED').length;

    return { total, superAdmins, admins, teachers, students, parents, staff, suspended };
  }, [users]);

  return (
    <div className="space-y-6">

      {/* Main Header & Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400/40 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 shrink-0">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white font-battambang tracking-tight">
                ការកំណត់ប្រព័ន្ធ គណនី & ទិន្នន័យទាំងអស់
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
                System Control
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-battambang">
              គ្រប់គ្រងព័ត៌មានគ្រឹះស្ថានសិក្សា គណនីអ្នកប្រើប្រាស់ និងការបម្រុងទុកទិន្នន័យប្រព័ន្ធទាំងមូល
            </p>
          </div>
        </div>

        {/* Global Quick Action */}
        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold font-battambang animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>បានរក្សាទុកដោយជោគជ័យ!</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleExportDatabase}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/30 text-indigo-200 hover:text-white rounded-xl text-xs font-bold transition font-battambang shadow-sm"
            title="ទាញយក Backup Database ទាំងអស់"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Backup Database</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-1.5 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 font-battambang text-xs">
        <button
          type="button"
          id="tab-settings-system"
          onClick={() => setActiveSubTab('SYSTEM')}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold transition cursor-pointer ${
            activeSubTab === 'SYSTEM'
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Building className="w-4 h-4 shrink-0" />
          <span>១. ប្រព័ន្ធ & សាលារៀន</span>
        </button>

        <button
          type="button"
          id="tab-settings-accounts"
          onClick={() => setActiveSubTab('ACCOUNTS')}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold transition cursor-pointer ${
            activeSubTab === 'ACCOUNTS'
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>២. គណនីទាំងអស់ ({users.length})</span>
        </button>

        <button
          type="button"
          id="tab-settings-database"
          onClick={() => setActiveSubTab('DATABASE')}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold transition cursor-pointer ${
            activeSubTab === 'DATABASE'
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Database className="w-4 h-4 shrink-0" />
          <span>៣. ទិន្នន័យទាំងអស់ & Backup</span>
        </button>

        <button
          type="button"
          id="tab-settings-security"
          onClick={() => setActiveSubTab('SECURITY')}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold transition cursor-pointer ${
            activeSubTab === 'SECURITY'
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>៤. សុវត្ថិភាព & សវនកម្ម</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: SYSTEM & SCHOOL IDENTITY SETTINGS */}
      {/* ======================================================== */}
      {activeSubTab === 'SYSTEM' && (
        <div className="space-y-6">

          {/* School Information Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white font-battambang flex items-center space-x-2.5">
                  <Building className="w-5 h-5 text-indigo-400" />
                  <span>ព័ត៌មានគ្រឹះស្ថានសិក្សា & អត្តសញ្ញាណ (School Identity)</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">ID: {form.schoolCode || 'MOEYS-101'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-battambang">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">ឈ្មោះសាលា (ភាសាខ្មែរ)*</label>
                  <input
                    type="text"
                    required
                    value={form.nameKhmer}
                    onChange={e => setForm({ ...form, nameKhmer: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-white font-bold text-sm outline-none focus:border-indigo-400"
                    placeholder="វិទ្យាល័យ ហ៊ុន សែន ភ្នំពេញ"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">School Name (English)*</label>
                  <input
                    type="text"
                    required
                    value={form.nameEnglish}
                    onChange={e => setForm({ ...form, nameEnglish: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-white font-semibold text-sm outline-none focus:border-indigo-400"
                    placeholder="Hun Sen Phnom Penh High School"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">លេខកូដសាលា (MoEYS Code)</label>
                  <input
                    type="text"
                    value={form.schoolCode}
                    onChange={e => setForm({ ...form, schoolCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-slate-200 font-mono text-xs outline-none focus:border-indigo-400"
                    placeholder="KH-PP-0021"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">ឈ្មោះនាយកសាលា (Director Name)*</label>
                  <input
                    type="text"
                    required
                    value={form.directorName}
                    onChange={e => setForm({ ...form, directorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-white font-bold text-sm outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">ឆ្នាំសិក្សាបច្ចុប្បន្ន (Academic Year)</label>
                  <input
                    type="text"
                    value={form.academicYear}
                    onChange={e => setForm({ ...form, academicYear: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-white font-bold text-xs outline-none focus:border-indigo-400"
                    placeholder="2025-2026"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">អត្រាប្តូរប្រាក់ ($1.00 USD to KHR)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.exchangeRate}
                      onChange={e => setForm({ ...form, exchangeRate: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-emerald-300 font-mono font-bold text-sm outline-none focus:border-indigo-400"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">KHR</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1.5">អាសយដ្ឋានសាលា (School Address)</label>
                  <input
                    type="text"
                    value={form.addressKhmer}
                    onChange={e => setForm({ ...form, addressKhmer: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-slate-200 text-xs outline-none focus:border-indigo-400"
                    placeholder="មហាវិថីព្រះនរោត្តម សង្កាត់ជ័យជំនះ ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">លេខទូរស័ព្ទទំនាក់ទំនង (Phone)</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-slate-200 font-mono text-xs outline-none focus:border-indigo-400"
                    placeholder="023 218 889 / 012 345 678"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-slate-300 font-medium mb-1.5">អ៊ីមែលផ្លូវការ (Official Email)</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-slate-200 font-mono text-xs outline-none focus:border-indigo-400"
                    placeholder="contact@school-kh.edu.kh"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <p className="text-xs text-slate-400 font-battambang">
                  * ព័ត៌មានទាំងនេះនឹងត្រូវប្រើប្រាស់លើប័ណ្ណសរសើរ លិខិតបញ្ជាក់ និងរបាយការណ៍សាលាទាំងអស់
                </p>
                {isSuperAdmin ? (
                  <button
                    type="submit"
                    id="btn-save-school-settings"
                    className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-500/25 font-battambang cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>រក្សាទុកព័ត៌មានសាលា</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-400 font-battambang">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>របៀបមើល (សិទ្ធិកែប្រែ៖ Super Admin ប៉ុណ្ណោះ)</span>
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Certificate & Letter Background Customizer */}
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-amber-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-battambang flex items-center gap-2">
                    <span>Background វិញ្ញាបនបត្រ & លិខិត (Certificate Background)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-sans font-bold">
                      Royal Gold Standard
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-battambang">
                    កំណត់រូបភាពផ្ទៃខាងក្រោយ បន្ទាត់ស៊ុមមាសរាជ និងកម្រិតពន្លឺនៃប័ណ្ណសរសើរផ្លូវការ
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-settings-manage-cert-bg"
                onClick={() => setIsCertBgModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold font-battambang transition shadow-md shadow-amber-600/20 self-start sm:self-auto cursor-pointer"
              >
                <Palette className="w-4 h-4" />
                <span>កំណត់ ឬផ្ទុកឡើង Background</span>
              </button>
            </div>

            {/* Current Background Preview */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-24 h-16 rounded-xl border border-amber-500/40 overflow-hidden bg-slate-950 shrink-0 relative shadow-md">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url("${school.certificateBackgroundUrl || CERTIFICATE_PRESETS[0].url}")`,
                      opacity: school.certificateBgOpacity !== undefined ? school.certificateBgOpacity : 0.95
                    }}
                  />
                </div>
                <div>
                  <p className="font-bold text-slate-200 font-battambang">
                    ម៉ូតបច្ចុប្បន្ន: <span className="text-amber-300">{school.certificateTheme === 'CUSTOM' ? 'រូបភាពផ្ទាល់ខ្លួន (Custom Uploaded)' : 'ក្បាច់មាសរាជប្រណិត (Royal Gold)'}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ទម្រង់ស៊ុម: <span className="font-mono text-slate-300">{school.certificateBorderStyle || 'ORNATE_GOLD'}</span> | កម្រិតពន្លឺ: <span className="font-mono text-slate-300">{Math.round((school.certificateBgOpacity !== undefined ? school.certificateBgOpacity : 0.95) * 100)}%</span>
                  </p>
                </div>
              </div>
              <span className="text-[11px] px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 font-battambang self-start sm:self-auto">
                ✓ សកម្មសម្រាប់បោះពុម្ពប័ណ្ណសរសើរ
              </span>
            </div>
          </div>

          {/* System Preferences Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white font-battambang flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>ការកំណត់ទូទៅនៃប្រព័ន្ធ (System Preferences)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-battambang">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1.5">
                <p className="text-slate-400">តំបន់ម៉ោងប្រព័ន្ធ (Timezone)</p>
                <p className="font-bold text-white text-sm font-mono">Asia/Phnom_Penh (UTC+07:00)</p>
                <p className="text-[11px] text-emerald-400">● ម៉ោងកម្ពុជាត្រឹមត្រូវ</p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1.5">
                <p className="text-slate-400">ភាសាលំនាំដើម (Default Language)</p>
                <p className="font-bold text-white text-sm">ភាសាខ្មែរ (Khmer) / English</p>
                <p className="text-[11px] text-slate-400">គាំទ្រពុម្ពអក្សរ Kantumruy Pro</p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1.5">
                <p className="text-slate-400">ការរក្សាទុកទិន្នន័យ (Persistence)</p>
                <p className="font-bold text-white text-sm font-mono">Local Storage + Memory Vault</p>
                <p className="text-[11px] text-indigo-300">ទំហំប្រើប្រាស់: ~{storageUsageKb} KB</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ALL USER ACCOUNTS MANAGEMENT */}
      {/* ======================================================== */}
      {activeSubTab === 'ACCOUNTS' && (
        <div className="space-y-6">

          {/* Super Admin Sample Credentials Spotlight Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-rose-950/60 via-purple-950/50 to-indigo-950/60 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-rose-500/30 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 border border-rose-400/50 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 shrink-0">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-battambang">គណនី Super Admin សំខាន់សម្រាប់គ្រប់គ្រងប្រព័ន្ធ</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-500/40 text-[10px] font-mono font-bold">
                      FULL ACCESS
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-battambang mt-0.5">
                    Username: <span className="font-mono text-amber-300 font-bold">admin</span> &nbsp;|&nbsp;
                    Password: <span className="font-mono text-emerald-300 font-bold">admin123</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleCopy('admin', 'admin-user')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-white transition"
                >
                  {copiedKey === 'admin-user' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'admin-user' ? 'បានចម្លង!' : 'ចម្លង Username'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy('admin123', 'admin-pass')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-white transition"
                >
                  {copiedKey === 'admin-pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'admin-pass' ? 'បានចម្លង!' : 'ចម្លង Pass'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Account Overview Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-white/10 text-center">
              <p className="text-[11px] text-slate-400 font-battambang">គណនីសរុប</p>
              <p className="text-xl font-bold text-white font-mono mt-1">{accountStats.total}</p>
            </div>
            <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-rose-500/20 text-center">
              <p className="text-[11px] text-rose-300 font-battambang">Super Admin</p>
              <p className="text-xl font-bold text-rose-400 font-mono mt-1">{accountStats.superAdmins}</p>
            </div>
            <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-indigo-500/20 text-center">
              <p className="text-[11px] text-indigo-300 font-battambang">Admin/Director</p>
              <p className="text-xl font-bold text-indigo-400 font-mono mt-1">{accountStats.admins}</p>
            </div>
            <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-blue-500/20 text-center">
              <p className="text-[11px] text-blue-300 font-battambang">គ្រូបង្រៀន</p>
              <p className="text-xl font-bold text-blue-400 font-mono mt-1">{accountStats.teachers}</p>
            </div>
            <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-emerald-500/20 text-center">
              <p className="text-[11px] text-emerald-300 font-battambang">សិស្ស</p>
              <p className="text-xl font-bold text-emerald-400 font-mono mt-1">{accountStats.students}</p>
            </div>
            <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-amber-500/20 text-center">
              <p className="text-[11px] text-amber-300 font-battambang">អាណាព្យាបាល</p>
              <p className="text-xl font-bold text-amber-400 font-mono mt-1">{accountStats.parents}</p>
            </div>
            <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-teal-500/20 text-center">
              <p className="text-[11px] text-teal-300 font-battambang">បុគ្គលិក/បណ្ណារក្ស</p>
              <p className="text-xl font-bold text-teal-400 font-mono mt-1">{accountStats.staff}</p>
            </div>
          </div>

          {/* User Accounts Management Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white font-battambang flex items-center space-x-2">
                  <UserCog className="w-5 h-5 text-indigo-400" />
                  <span>បញ្ជីគណនីអ្នកប្រើប្រាស់ក្នុងប្រព័ន្ធ (All User Accounts & Profiles)</span>
                </h3>
                <p className="text-xs text-slate-400 font-battambang mt-0.5">
                  គ្រប់គ្រងឈ្មោះគណនី ពាក្យសម្ងាត់ តួនាទី និងការចូលប្រើប្រាស់
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Export Accounts JSON */}
                <button
                  type="button"
                  onClick={() => handleExportCollectionCSV('users')}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white rounded-xl text-xs font-bold font-battambang transition shadow-sm"
                  title="ទាញយកបញ្ជីគណនីជា JSON"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>ទាញយកបញ្ជីគណនី</span>
                </button>

                {/* Create Account Button */}
                {onOpenSignUpModal && (
                  <button
                    type="button"
                    id="btn-settings-create-user"
                    onClick={onOpenSignUpModal}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold font-battambang transition shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ បង្កើតគណនីថ្មី</span>
                  </button>
                )}

                {/* Bulk Remove All Users */}
                {isSuperAdmin && onRemoveAllUsers && (
                  <button
                    type="button"
                    id="btn-settings-remove-all-users"
                    onClick={() => setIsRemoveAllModalOpen(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white rounded-xl text-xs font-bold font-battambang transition border border-rose-500/30 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>លុបគណនីទាំងអស់</span>
                  </button>
                )}
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="relative sm:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="ស្វែងរកតាមឈ្មោះ, Username, Email, ឬតួនាទី... (Search Users)"
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 text-xs text-white placeholder-slate-400 rounded-xl border border-white/10 focus:border-indigo-400 outline-none"
                />
              </div>

              <div>
                <select
                  value={userRoleFilter}
                  onChange={e => setUserRoleFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950/80 text-xs text-white rounded-xl border border-white/10 focus:border-indigo-400 outline-none font-battambang"
                >
                  <option value="ALL">គ្រប់តួនាទីទាំងអស់ (All Roles)</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">School Admin</option>
                  <option value="DIRECTOR">Director</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="LIBRARIAN">Librarian</option>
                  <option value="STUDENT">Student</option>
                  <option value="PARENT">Parent</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>

              <div>
                <select
                  value={userStatusFilter}
                  onChange={e => setUserStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950/80 text-xs text-white rounded-xl border border-white/10 focus:border-indigo-400 outline-none font-battambang"
                >
                  <option value="ALL">គ្រប់ស្ថានភាពទាំងអស់ (All Status)</option>
                  <option value="ACTIVE">សកម្ម (Active)</option>
                  <option value="INACTIVE">អសកម្ម (Inactive)</option>
                  <option value="SUSPENDED">ផ្អាក (Suspended)</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-white/5 text-slate-400 font-semibold uppercase tracking-wider text-[10px] font-battambang">
                  <tr>
                    <th className="p-3.5">អ្នកប្រើប្រាស់ (User Profile)</th>
                    <th className="p-3.5">តួនាទី (Role)</th>
                    <th className="p-3.5">គណនីចូល (Username / Password)</th>
                    <th className="p-3.5">ទំនាក់ទំនង (Email/Phone)</th>
                    <th className="p-3.5">ស្ថានភាព</th>
                    <th className="p-3.5 text-right">សកម្មភាពគ្រប់គ្រង</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-battambang">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        មិនមានគណនីត្រូវនឹងការស្វែងរកឡើយ (No matching accounts found)
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => {
                      const roleMeta = roleLabels[u.role] || roleLabels.ADMIN;
                      const isUserSelf = currentUser?.id === u.id;
                      const isPasswordShown = visiblePasswords[u.id];

                      return (
                        <tr key={u.id} className="hover:bg-white/5 transition">
                          
                          {/* User Profile */}
                          <td className="p-3.5">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={u.avatar} 
                                alt={u.nameKhmer} 
                                className="w-9 h-9 rounded-xl object-cover border border-white/20 shrink-0" 
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-white text-xs">{u.nameKhmer}</p>
                                  {isUserSelf && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                      គណនីអ្នក
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400">{u.nameEnglish}</p>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${roleMeta.bgBadge} ${roleMeta.color}`}>
                              {u.role}
                            </span>
                          </td>

                          {/* Username & Password */}
                          <td className="p-3.5 font-mono text-[11px]">
                            <div className="space-y-0.5">
                              <div className="text-slate-200 flex items-center gap-1.5">
                                <span>User:</span>
                                <strong className="text-indigo-300 font-bold">@{u.username || u.role.toLowerCase()}</strong>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(u.username || u.role.toLowerCase(), `u-${u.id}`)}
                                  className="text-slate-400 hover:text-white"
                                  title="ចម្លង Username"
                                >
                                  {copiedKey === `u-${u.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                              <div className="text-slate-400 text-[10px] flex items-center gap-1.5">
                                <span>Pass:</span>
                                <span className="text-amber-300 font-semibold font-mono">
                                  {isPasswordShown ? (u.password || 'password123') : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(u.id)}
                                  className="text-slate-400 hover:text-white"
                                  title={isPasswordShown ? 'លាក់ពាក្យសម្ងាត់' : 'បង្ហាញពាក្យសម្ងាត់'}
                                >
                                  {isPasswordShown ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="p-3.5 text-[11px] text-slate-300">
                            <p className="font-mono text-slate-400 truncate max-w-[140px]">{u.email}</p>
                            {u.phone && <p className="font-mono text-slate-500 text-[10px]">{u.phone}</p>}
                          </td>

                          {/* Status */}
                          <td className="p-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              u.status === 'SUSPENDED' 
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                                : u.status === 'INACTIVE'
                                ? 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}>
                              {u.status === 'SUSPENDED' ? 'ផ្អាក' : u.status === 'INACTIVE' ? 'អសកម្ម' : 'សកម្ម'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              
                              {/* Edit User button */}
                              {onEditUser && (isSuperAdmin || isUserSelf) && (
                                <button
                                  type="button"
                                  onClick={() => onEditUser(u)}
                                  className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:text-white transition cursor-pointer"
                                  title="កែប្រែព័ត៌មានគណនី (Edit Profile)"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Switch / Login User button */}
                              {onSelectUser && (
                                <button
                                  type="button"
                                  onClick={() => onSelectUser(u)}
                                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white font-semibold transition text-[11px] cursor-pointer"
                                >
                                  ចូលប្រើ →
                                </button>
                              )}

                              {/* Delete User */}
                              {isSuperAdmin && !isUserSelf && onDeleteUser && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`តើលោកអ្នកពិតជាចង់លុបគណនី "${u.nameKhmer}" (${u.username}) មែនទេ?`)) {
                                      onDeleteUser(u.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-white transition cursor-pointer"
                                  title="លុបគណនី"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ALL DATA & DATABASE MANAGEMENT */}
      {/* ======================================================== */}
      {activeSubTab === 'DATABASE' && (
        <div className="space-y-6">

          {/* Database Summary Metric Grid */}
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md shrink-0">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-battambang">
                    ទិន្នន័យទាំងអស់ក្នុងប្រព័ន្ធ (Complete System Data Inventory)
                  </h3>
                  <p className="text-xs text-slate-400 font-battambang">
                    ចំនួនទិន្នន័យសរុប: <span className="font-mono text-indigo-300 font-bold">{systemDataCounts.totalRecords} កំណត់ត្រា</span> | ទំហំ Storage: <span className="font-mono text-emerald-300 font-bold">~{storageUsageKb} KB</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold font-battambang transition cursor-pointer"
                  title="សម្អាត Session & Local Cache"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>សម្អាត Cache ({cacheClearedSuccess ? 'ជោគជ័យ!' : 'Optimize'})</span>
                </button>
              </div>
            </div>

            {/* Individual Collection Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs font-battambang">
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-slate-300 font-medium">សិស្ស (Students)</p>
                    <p className="text-xs text-slate-400">បញ្ជីសិស្សទាំងអស់</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-white">{systemDataCounts.studentsCount}</span>
                  <button
                    type="button"
                    onClick={() => handleExportCollectionCSV('students')}
                    className="block text-[10px] text-emerald-400 hover:underline mt-0.5 font-mono"
                  >
                    JSON ↓
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Users className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-slate-300 font-medium">គ្រូបង្រៀន (Teachers)</p>
                    <p className="text-xs text-slate-400">សាស្ត្រាចារ្យ & គ្រូ</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-white">{systemDataCounts.teachersCount}</span>
                  <button
                    type="button"
                    onClick={() => handleExportCollectionCSV('teachers')}
                    className="block text-[10px] text-blue-400 hover:underline mt-0.5 font-mono"
                  >
                    JSON ↓
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Building className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <p className="text-slate-300 font-medium">ថ្នាក់រៀន (Classes)</p>
                    <p className="text-xs text-slate-400">បន្ទប់ & កម្រិតសិក្សា</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-white">{systemDataCounts.classesCount}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">ថ្នាក់</span>
                </div>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-slate-300 font-medium">មុខវិជ្ជា (Subjects)</p>
                    <p className="text-xs text-slate-400">មុខវិជ្ជាសិក្សា</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-white">{systemDataCounts.subjectsCount}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">មុខ</span>
                </div>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <p className="text-slate-300 font-medium">វត្តមាន (Attendance)</p>
                    <p className="text-xs text-slate-400">កំណត់ត្រាវត្តមាន</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-white">{systemDataCounts.attendanceCount}</span>
                  <button
                    type="button"
                    onClick={() => handleExportCollectionCSV('attendance')}
                    className="block text-[10px] text-cyan-400 hover:underline mt-0.5 font-mono"
                  >
                    JSON ↓
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-slate-300 font-medium">ពិន្ទុ & ប្រឡង</p>
                    <p className="text-xs text-slate-400">Grades & Exams</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-white">{systemDataCounts.gradesCount}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">កំណត់ត្រា</span>
                </div>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <p className="text-slate-300 font-medium">Quiz ប្រចាំសប្តាហ៍</p>
                    <p className="text-xs text-slate-400">Weekly Quiz Scores</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-white">{systemDataCounts.quizScoresCount}</span>
                  <button
                    type="button"
                    onClick={() => handleExportCollectionCSV('quiz_scores')}
                    className="block text-[10px] text-rose-400 hover:underline mt-0.5 font-mono"
                  >
                    JSON ↓
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-slate-300 font-medium">វិក្កយបត្រ (Invoices)</p>
                    <p className="text-xs text-slate-400">ចំណូល & ថ្លៃសិក្សា</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-white">{systemDataCounts.invoicesCount}</span>
                  <button
                    type="button"
                    onClick={() => handleExportCollectionCSV('invoices')}
                    className="block text-[10px] text-emerald-400 hover:underline mt-0.5 font-mono"
                  >
                    JSON ↓
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Backup & Restore Action Center */}
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white font-battambang flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-indigo-400" />
              <span>ការបម្រុងទុក & ស្តារទិន្នន័យ (Backup & Disaster Recovery)</span>
            </h3>
            <p className="text-xs text-slate-400 font-battambang leading-relaxed">
              ទិន្នន័យទាំងអស់ (សិស្ស គ្រូ ថ្នាក់ ពិន្ទុ វត្តមាន វិក្កយបត្រ និងគណនី) ត្រូវបានរក្សាទុកសុវត្ថិភាព។ សូមទាញយកឯកសារ Backup រៀងរាល់ចុងសប្តាហ៍ ដើម្បីងាយស្រួលស្តារទិន្នន័យឡើងវិញនៅពេលផ្លាស់ប្តូរឧបករណ៍។
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              
              {/* Export Full Backup Card */}
              <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2.5 text-indigo-300 font-bold font-battambang">
                    <Download className="w-5 h-5" />
                    <span>ទាញយកទិន្នន័យបម្រុងទុក (Export Full Backup)</span>
                  </div>
                  <p className="text-xs text-slate-300 font-battambang mt-1">
                    ទាញយកកញ្ចប់ទិន្នន័យទាំងអស់ជាឯកសារ JSON ដែលមានរចនាសម្ព័ន្ធពេញលេញ។
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-settings-export-database"
                  onClick={handleExportDatabase}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition font-battambang shadow-md shadow-indigo-500/25 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>ទាញយក Backup JSON ឥឡូវនេះ</span>
                </button>
              </div>

              {/* Import Full Backup Card */}
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2.5 text-emerald-300 font-bold font-battambang">
                    <Upload className="w-5 h-5" />
                    <span>បញ្ចូលទិន្នន័យពីឯកសារ (Restore / Import Backup)</span>
                  </div>
                  <p className="text-xs text-slate-300 font-battambang mt-1">
                    បញ្ចូលឯកសារ JSON Backup ពីមុនដើម្បីស្តារទិន្នន័យសាលាទាំងមូលឡើងវិញភ្លាមៗ។
                  </p>
                </div>

                {isSuperAdmin ? (
                  <label className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition font-battambang shadow-md shadow-emerald-500/25 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>ជ្រើសរើសឯកសារ JSON ដើម្បីស្តារ</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportDatabase}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="text-center py-2 text-xs text-slate-400 font-battambang">
                    (សិទ្ធិបញ្ចូលទិន្នន័យ៖ Super Admin ប៉ុណ្ណោះ)
                  </div>
                )}
              </div>

            </div>

            {/* Danger Zone & Reset Controls */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <p className="text-xs font-bold text-rose-300 font-battambang flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>តំបន់គ្រោះថ្នាក់ & កំណត់ឡើងវិញ (Danger Zone & Reset Tools)</span>
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {/* Clear Audit Logs */}
                {onClearLogs && isSuperAdmin && (
                  <button
                    type="button"
                    id="btn-settings-clear-logs"
                    onClick={() => setIsClearLogsModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-xl text-xs font-semibold transition border border-rose-500/40 font-battambang shadow-sm cursor-pointer"
                    title="សម្អាតកំណត់ត្រាសវនកម្មទាំងអស់"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>សម្អាត Logs (Clear Logs)</span>
                  </button>
                )}

                {/* Reset Demo Data */}
                {isSuperAdmin && (
                  <button
                    type="button"
                    id="btn-reset-demo-data"
                    onClick={() => setIsResetDataModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-semibold transition border border-rose-500/30 font-battambang shadow-sm cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>កំណត់ទិន្នន័យគំរូឡើងវិញ (Reset Demo Data)</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: SECURITY & SYSTEM AUDIT OVERVIEW */}
      {/* ======================================================== */}
      {activeSubTab === 'SECURITY' && (
        <div className="space-y-6">

          {/* Authentication Provider & Email Verification Section */}
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-battambang flex items-center gap-2">
                    <span>ប្រព័ន្ធផ្ទៀងផ្ទាត់ & អត្តសញ្ញាណអ្នកប្រើប្រាស់</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                      Auth & Verification
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-battambang">
                    គ្រប់គ្រង Authentication Provider និងការផ្ទៀងផ្ទាត់អ៊ីមែល Firebase សម្រាប់គណនីបច្ចុប្បន្ន
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                {isEmailVerified ? (
                  <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-battambang">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>អ៊ីមែលបានផ្ទៀងផ្ទាត់ (Verified)</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-battambang">
                    <MailWarning className="w-4 h-4" />
                    <span>មិនទាន់ផ្ទៀងផ្ទាត់ (Unverified)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Provider and Account Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Card 1: Current Auth Provider */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 font-battambang text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Authentication Provider បច្ចុប្បន្ន:</span>
                  <div className="flex items-center space-x-2">
                    {primaryProviderId === 'google.com' ? (
                      <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 font-mono font-bold text-xs">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                          <path fill="#EA4335" d="M12 5c1.56 0 2.96.54 4.07 1.43l3.05-3.05C17.27 1.63 14.8 1 12 1 7.48 1 3.63 3.6 1.76 7.37l3.66 2.84C6.31 7.22 8.91 5 12 5z"/>
                          <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.66 2.84c2.14-1.98 3.76-4.9 3.76-8.66z"/>
                          <path fill="#FBBC05" d="M5.42 14.79c-.23-.69-.36-1.43-.36-2.2 0-.77.13-1.51.36-2.2L1.76 7.55C.64 9.77 0 12.27 0 15s.64 5.23 1.76 7.45l3.66-2.84z"/>
                          <path fill="#34A853" d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.66-2.84c-1.07.72-2.45 1.16-4.27 1.16-3.09 0-5.69-2.22-6.58-5.21L1.76 16c1.87 3.77 5.72 6.37 10.24 6.37z"/>
                        </svg>
                        <span>Google Sign-In</span>
                      </span>
                    ) : primaryProviderId === 'password' ? (
                      <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono font-bold text-xs">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Email & Password</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold text-xs">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Local / Demo Session</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">អ៊ីមែលគណនី:</span>
                    <span className="text-white font-mono font-bold truncate max-w-[200px]">
                      {firebaseUser?.email || currentUser?.email || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Firebase UID:</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-300 font-mono text-[11px] truncate max-w-[150px]">
                        {firebaseUser?.uid || currentUser?.id || 'demo-session-uid'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(firebaseUser?.uid || currentUser?.id || '', 'firebase_uid')}
                        className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                        title="Copy UID"
                      >
                        {copiedKey === 'firebase_uid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">ឈ្មោះបង្ហាញ (Display Name):</span>
                    <span className="text-slate-200 font-medium">
                      {firebaseUser?.displayName || currentUser?.nameEnglish || currentUser?.nameKhmer || 'Default User'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">ការតភ្ជាប់ Provider:</span>
                    <span className="text-slate-300 font-mono text-[11px]">
                      {firebaseUser?.providerData && firebaseUser.providerData.length > 0 
                        ? firebaseUser.providerData.map(p => p.providerId).join(', ')
                        : 'system_local'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">ស្ថានភាព Persistence:</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] font-bold">
                      browserLocalPersistence (Active)
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Email Verification Actions */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 font-battambang text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-white flex items-center space-x-1.5">
                      <MailCheck className="w-4 h-4 text-indigo-400" />
                      <span>ការផ្ទៀងផ្ទាត់អ៊ីមែល (Email Verification)</span>
                    </h4>
                    {isEmailVerified ? (
                      <span className="text-emerald-400 text-[11px] font-bold">✓ Verified</span>
                    ) : (
                      <span className="text-amber-400 text-[11px] font-bold">⚠️ Action Required</span>
                    )}
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {isEmailVerified 
                      ? 'អាសយដ្ឋានអ៊ីមែលរបស់អ្នកត្រូវបានផ្ទៀងផ្ទាត់ពេញលេញក្នុងប្រព័ន្ធ Firebase Authentication ហើយ។'
                      : 'ការផ្ទៀងផ្ទាត់អ៊ីមែលជួយការពារគណនីរបស់អ្នកពីការលួចបន្លំ និងអនុញ្ញាតឱ្យស្តារពាក្យសម្ងាត់បានងាយស្រួល។'}
                  </p>
                </div>

                {/* Feedback Banner */}
                {verificationFeedback && (
                  <div className={`p-3 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                    verificationFeedback.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : verificationFeedback.type === 'error'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                      : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200'
                  }`}>
                    <div className="flex items-start space-x-2">
                      {verificationFeedback.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : verificationFeedback.type === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-bold">{verificationFeedback.messageKhmer}</p>
                        <p className="text-[11px] opacity-80 mt-0.5">{verificationFeedback.messageEnglish}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions: Send Email Verification & Refresh Status */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    id="btn-send-email-verification"
                    onClick={handleSendEmailVerification}
                    disabled={isSendingVerification || isEmailVerified || cooldownSeconds > 0}
                    className={`flex-1 flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl font-bold transition shadow-sm cursor-pointer ${
                      isEmailVerified 
                        ? 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                        : cooldownSeconds > 0
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-indigo-500/25 border border-indigo-400/40'
                    }`}
                  >
                    {isSendingVerification ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>
                      {isEmailVerified
                        ? 'អ៊ីមែលផ្ទៀងផ្ទាត់រួចរាល់'
                        : cooldownSeconds > 0
                        ? `រង់ចាំម្តងទៀត (${cooldownSeconds}s)`
                        : 'ផ្ញើអ៊ីមែលផ្ទៀងផ្ទាត់ (Verify)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    id="btn-reload-email-verification"
                    onClick={handleReloadVerificationStatus}
                    disabled={isReloadingAuth}
                    className="flex items-center space-x-1.5 px-3 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl font-semibold border border-white/10 transition cursor-pointer"
                    title="ពិនិត្យស្ថានភាពឡើងវិញ (Reload Status)"
                  >
                    <RefreshCw className={`w-4 h-4 ${isReloadingAuth ? 'animate-spin text-indigo-400' : ''}`} />
                    <span className="hidden sm:inline">Reload Status</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Linked Providers Management Section */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 font-battambang text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center space-x-2">
                  <Link2 className="w-4 h-4 text-indigo-400" />
                  <h4 className="font-bold text-white text-sm">
                    ការតភ្ជាប់ Provider ចូលប្រព័ន្ធបន្ថែម (Linked Authentication Providers)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {totalLinkedProviders > 0 ? `${totalLinkedProviders} Provider(s) Linked` : 'Local Session'}
                </span>
              </div>

              <p className="text-slate-300 text-[11px] leading-relaxed">
                ការភ្ជាប់គណនី Google អនុញ្ញាតឱ្យអ្នកចូលប្រើប្រាស់ប្រព័ន្ធបានភ្លាមៗដោយចុចតែម្តង (One-Click Google Sign-In) ដោយនៅតែរក្សាទិន្នន័យ តួនាទី និងសិទ្ធិគ្រប់គ្រងរបស់អ្នកដដែល។
              </p>

              {/* Provider Linking Feedback Banner */}
              {linkFeedback && (
                <div className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                  linkFeedback.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : linkFeedback.type === 'error'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                    : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200'
                }`}>
                  <div className="flex items-start space-x-2.5">
                    {linkFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : linkFeedback.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">{linkFeedback.messageKhmer}</p>
                      <p className="text-[11px] opacity-85 mt-0.5">{linkFeedback.messageEnglish}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Provider Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                
                {/* Google Provider Card */}
                <div className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                  isGoogleLinked 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#EA4335" d="M12 5c1.56 0 2.96.54 4.07 1.43l3.05-3.05C17.27 1.63 14.8 1 12 1 7.48 1 3.63 3.6 1.76 7.37l3.66 2.84C6.31 7.22 8.91 5 12 5z"/>
                          <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.66 2.84c2.14-1.98 3.76-4.9 3.76-8.66z"/>
                          <path fill="#FBBC05" d="M5.42 14.79c-.23-.69-.36-1.43-.36-2.2 0-.77.13-1.51.36-2.2L1.76 7.55C.64 9.77 0 12.27 0 15s.64 5.23 1.76 7.45l3.66-2.84z"/>
                          <path fill="#34A853" d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.66-2.84c-1.07.72-2.45 1.16-4.27 1.16-3.09 0-5.69-2.22-6.58-5.21L1.76 16c1.87 3.77 5.72 6.37 10.24 6.37z"/>
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">Google Account</h5>
                        <p className="text-[11px] text-slate-400">Google Workspace / Gmail OAuth</p>
                      </div>
                    </div>

                    {isGoogleLinked ? (
                      <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        <Check className="w-3 h-3" />
                        <span>បានភ្ជាប់រួច</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg bg-white/10 text-slate-400 text-[10px]">
                        មិនទាន់ភ្ជាប់
                      </span>
                    )}
                  </div>

                  {/* Action button */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                    {isGoogleLinked ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-slate-400 text-[11px] font-mono truncate max-w-[180px]">
                          {firebaseUser?.email || 'Connected'}
                        </span>
                        {totalLinkedProviders > 1 && (
                          <button
                            type="button"
                            id="btn-unlink-google-account"
                            onClick={handleUnlinkGoogleAccount}
                            disabled={isUnlinkingGoogle}
                            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition text-[11px] font-bold cursor-pointer"
                            title="ផ្តាច់ការភ្ជាប់ Google (Unlink Google)"
                          >
                            <Unlink className="w-3 h-3" />
                            <span>{isUnlinkingGoogle ? 'កំពុងផ្តាច់...' : 'ផ្តាច់ការភ្ជាប់'}</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        id="btn-link-google-account"
                        onClick={handleLinkGoogleAccount}
                        disabled={isLinkingGoogle || !firebaseUser}
                        className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl font-bold transition shadow-sm cursor-pointer ${
                          !firebaseUser
                            ? 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                            : isLinkingGoogle
                            ? 'bg-indigo-600/50 text-white cursor-wait'
                            : 'bg-white text-slate-900 hover:bg-slate-100 shadow-md hover:shadow-lg active:scale-[0.98]'
                        }`}
                      >
                        {isLinkingGoogle ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                            <span>កំពុងតភ្ជាប់ជាមួយ Google...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path fill="#EA4335" d="M12 5c1.56 0 2.96.54 4.07 1.43l3.05-3.05C17.27 1.63 14.8 1 12 1 7.48 1 3.63 3.6 1.76 7.37l3.66 2.84C6.31 7.22 8.91 5 12 5z"/>
                              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.66 2.84c2.14-1.98 3.76-4.9 3.76-8.66z"/>
                              <path fill="#FBBC05" d="M5.42 14.79c-.23-.69-.36-1.43-.36-2.2 0-.77.13-1.51.36-2.2L1.76 7.55C.64 9.77 0 12.27 0 15s.64 5.23 1.76 7.45l3.66-2.84z"/>
                              <path fill="#34A853" d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.66-2.84c-1.07.72-2.45 1.16-4.27 1.16-3.09 0-5.69-2.22-6.58-5.21L1.76 16c1.87 3.77 5.72 6.37 10.24 6.37z"/>
                            </svg>
                            <span>ភ្ជាប់គណនី Google (Link Google Account)</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Password / Email Provider Card */}
                <div className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                  isPasswordLinked 
                    ? 'bg-indigo-500/10 border-indigo-500/30' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">Email & Password</h5>
                        <p className="text-[11px] text-slate-400">ប្រព័ន្ធពាក្យសម្ងាត់ស្តង់ដារ</p>
                      </div>
                    </div>

                    {isPasswordLinked ? (
                      <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                        <Check className="w-3 h-3" />
                        <span>បានកំណត់</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg bg-white/10 text-slate-400 text-[10px]">
                        ស្រេចចិត្ត
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-slate-400 text-[11px] font-mono truncate max-w-[200px]">
                      {firebaseUser?.email || currentUser?.email || 'N/A'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-battambang">
                      {isPasswordLinked ? 'Password Protected' : 'OAuth Only'}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Security Policy Placeholder Toggles */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3 font-battambang text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="font-bold text-slate-200 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  <span>គោលការណ៍សុវត្ថិភាពការចូលប្រើប្រាស់ (Authentication Policy Toggles)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Security Preferences</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Toggle 1: Auto-dispatch verification email */}
                <div 
                  onClick={() => setAutoSendVerificationOnSignup(!autoSendVerificationOnSignup)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 cursor-pointer transition"
                >
                  <div className="space-y-0.5 pr-2">
                    <p className="font-bold text-slate-200">ផ្ញើអ៊ីមែលផ្ទៀងផ្ទាត់ស្វ័យប្រវត្តិ</p>
                    <p className="text-[11px] text-slate-400">Auto-send verification email on new account signup</p>
                  </div>
                  <button 
                    type="button"
                    className={`shrink-0 transition-colors ${autoSendVerificationOnSignup ? 'text-indigo-400' : 'text-slate-600'}`}
                  >
                    {autoSendVerificationOnSignup ? (
                      <ToggleRight className="w-7 h-7" />
                    ) : (
                      <ToggleLeft className="w-7 h-7" />
                    )}
                  </button>
                </div>

                {/* Toggle 2: Require verified email for login */}
                <div 
                  onClick={() => setRequireEmailVerificationPolicy(!requireEmailVerificationPolicy)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 cursor-pointer transition"
                >
                  <div className="space-y-0.5 pr-2">
                    <p className="font-bold text-slate-200">តម្រូវឱ្យផ្ទៀងផ្ទាត់អ៊ីមែលជាកាតព្វកិច្ច</p>
                    <p className="text-[11px] text-slate-400">Enforce verified email check before granting full access</p>
                  </div>
                  <button 
                    type="button"
                    className={`shrink-0 transition-colors ${requireEmailVerificationPolicy ? 'text-indigo-400' : 'text-slate-600'}`}
                  >
                    {requireEmailVerificationPolicy ? (
                      <ToggleRight className="w-7 h-7" />
                    ) : (
                      <ToggleLeft className="w-7 h-7" />
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* System Health Overview Grid */}
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white font-battambang flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
              <span>ស្ថានភាពសុវត្ថិភាព & ព័ត៌មានប្រព័ន្ធ (Security & System Health)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-battambang">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <p className="text-slate-400 flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>ការផ្ទៀងផ្ទាត់ (Authentication)</span>
                </p>
                <p className="font-bold text-white text-sm">Role-Based Access Control (RBAC)</p>
                <p className="text-[11px] text-emerald-300">✓ សកម្មពេញលេញគ្រប់ Module</p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <p className="text-slate-400 flex items-center space-x-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>ទំហំផ្ទុក Storage (Memory Gauge)</span>
                </p>
                <p className="font-bold text-white text-sm font-mono">{storageUsageKb} KB / 5120 KB</p>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(2, (storageUsageKb / 5120) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <p className="text-slate-400 flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>កំណត់ត្រាសវនកម្ម (Audit Logs)</span>
                </p>
                <p className="font-bold text-white text-sm font-mono">{systemDataCounts.auditLogsCount} កំណត់ត្រាសកម្មភាព</p>
                <p className="text-[11px] text-slate-400">ត្រួតពិនិត្យការចូលប្រើប្រាស់ និងការផ្លាស់ប្តូរ</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2 text-xs font-battambang">
              <p className="font-bold text-slate-200">🛡️ គោលការណ៍សុវត្ថិភាពទិន្នន័យ (Data Privacy Compliance):</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                <li>ទិន្នន័យផ្ទាល់ខ្លួនរបស់សិស្ស គ្រូ និងអាណាព្យាបាល ត្រូវបានការពារដោយសុវត្ថិភាពខ្ពស់។</li>
                <li>រាល់ការចូលប្រើប្រាស់ ការកែប្រែទិន្នន័យ និងការលុបទិន្នន័យ ត្រូវបានកត់ត្រាក្នុង Audit Trail។</li>
                <li>Super Admin មានសិទ្ធិខ្ពស់បំផុតក្នុងការគ្រប់គ្រងគណនី និងទិន្នន័យបម្រុងទុក។</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Remove All Users Confirmation Modal */}
      {isRemoveAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl shadow-rose-950/50 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-battambang flex items-center gap-2">
                    <span>លុបគណនីអ្នកប្រើប្រាស់ទាំងអស់</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 font-sans font-semibold">
                      {users.length} គណនី
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">Remove All User Accounts Confirmation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRemoveAllModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Message */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-start space-x-3 text-xs text-rose-200 leading-relaxed font-battambang">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-300">ការព្រមានសំខាន់ (Irreversible Action):</p>
                <p className="mt-1">
                  តើលោកអ្នកពិតជាចង់លុបទិន្នន័យគណនីអ្នកប្រើប្រាស់ទាំងអស់មែនដែរឬទេ? សកម្មភាពនេះនឹងលុបគណនីគ្រូ សិស្ស និងបុគ្គលិកចេញពីបញ្ជីទិន្នន័យប្រព័ន្ធ។
                </p>
              </div>
            </div>

            {/* Selection Options */}
            <div className="space-y-3 font-battambang text-xs">
              <label
                onClick={() => setKeepSuperAdminOption(true)}
                className={`flex items-start space-x-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                  keepSuperAdminOption
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="keepAdminOption"
                  checked={keepSuperAdminOption}
                  onChange={() => setKeepSuperAdminOption(true)}
                  className="mt-1 accent-indigo-500 cursor-pointer"
                />
                <div>
                  <p className="font-bold text-indigo-200">🛡️ រក្សាទុកគណនី Super Admin (ជម្រើសសុវត្ថិភាពខ្ពស់ - Recommended)</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    លុបតែគណនីសិស្ស គ្រូ និងបុគ្គលិកដទៃទៀត ដោយរក្សាទុកគណនី Super Admin ដើម្បីអាចគ្រប់គ្រងប្រព័ន្ធបន្តបាន។
                  </p>
                </div>
              </label>

              <label
                onClick={() => setKeepSuperAdminOption(false)}
                className={`flex items-start space-x-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                  !keepSuperAdminOption
                    ? 'bg-rose-500/20 border-rose-500/50 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="keepAdminOption"
                  checked={!keepSuperAdminOption}
                  onChange={() => setKeepSuperAdminOption(false)}
                  className="mt-1 accent-rose-500 cursor-pointer"
                />
                <div>
                  <p className="font-bold text-rose-300">⚠️ លុបគណនីទាំងអស់គ្មានសល់ (Wipe All User Accounts Completely)</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    លុបគណនីអ្នកប្រើប្រាស់ទាំងអស់ ១០០% ចេញពីទិន្នន័យ (រាប់បញ្ចូលទាំងគណនីបច្ចុប្បន្ន)។
                  </p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10 font-battambang">
              <button
                type="button"
                onClick={() => setIsRemoveAllModalOpen(false)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                id="btn-confirm-remove-all-users"
                onClick={() => {
                  if (onRemoveAllUsers) {
                    onRemoveAllUsers(keepSuperAdminOption);
                  }
                  setIsRemoveAllModalOpen(false);
                }}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/30 border border-rose-400/40 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>បញ្ជាក់ការលុបទាំងអស់ ({keepSuperAdminOption ? 'Keep Admin' : 'Wipe All'})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Logs Confirmation Modal */}
      {isClearLogsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl shadow-rose-950/50 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-battambang">
                    សម្អាតកំណត់ត្រាសវនកម្ម (Audit Logs)
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">Clear System Audit Logs</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClearLogsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Message */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-start space-x-3 text-xs text-rose-200 leading-relaxed font-battambang">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-300">តើលោកអ្នកពិតជាចង់សម្អាតកំណត់ត្រាសវនកម្មទាំងអស់មែនទេ?</p>
                <p className="mt-1 text-slate-300">
                  កំណត់ត្រាសកម្មភាពទាំងអស់ (Audit Logs) នឹងត្រូវបានសម្អាតចេញពីមូលដ្ឋានទិន្នន័យ។
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-white/10 font-battambang">
              <button
                type="button"
                onClick={() => setIsClearLogsModalOpen(false)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                id="btn-confirm-settings-clear-logs"
                onClick={() => {
                  if (onClearLogs) {
                    onClearLogs();
                  }
                  setIsClearLogsModalOpen(false);
                  setLogsClearedSuccess(true);
                  setTimeout(() => setLogsClearedSuccess(false), 3500);
                }}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/30 border border-rose-400/40 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>បញ្ជាក់ការសម្អាត Logs</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Demo Data Modal */}
      {isResetDataModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl shadow-rose-950/50 space-y-5">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-battambang">
                    កំណត់ទិន្នន័យគំរូឡើងវិញ (Reset Data)
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">Restore Factory Demo Data</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetDataModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-start space-x-3 text-xs text-rose-200 leading-relaxed font-battambang">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-300">តើអ្នកពិតជាចង់កំណត់ទិន្នន័យគំរូដើមឡើងវិញ?</p>
                <p className="mt-1 text-slate-300">
                  ទិន្នន័យដែលបានបញ្ចូលថ្មីនឹងត្រូវបានជំនួសដោយទិន្នន័យគំរូដំបូងបង្អស់។
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-white/10 font-battambang">
              <button
                type="button"
                onClick={() => setIsResetDataModalOpen(false)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                id="btn-confirm-reset-demo-data"
                onClick={() => {
                  onResetData();
                  setIsResetDataModalOpen(false);
                }}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/30 border border-rose-400/40 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>បញ្ជាក់ការកំណត់ឡើងវិញ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Background Customizer Modal */}
      {isCertBgModalOpen && (
        <CertificateBackgroundModal
          isOpen={isCertBgModalOpen}
          school={school}
          onClose={() => setIsCertBgModalOpen(false)}
          onSaveBackground={(bgData) => {
            onSaveSchool({
              ...school,
              certificateBackgroundUrl: bgData.backgroundUrl,
              certificateBgOpacity: bgData.bgOpacity,
              certificateBorderStyle: bgData.borderStyle,
              certificateTheme: bgData.theme,
              certificateCustomLayout: bgData.customLayout
            });
            setIsCertBgModalOpen(false);
          }}
        />
      )}

      {/* Success Toast */}
      {logsClearedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-5 py-3.5 bg-slate-900 border border-emerald-500/40 text-white rounded-2xl shadow-2xl shadow-emerald-950/60 backdrop-blur-xl animate-in slide-in-from-bottom-5 font-battambang">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-300">បានសម្អាតជោគជ័យ!</p>
            <p className="text-[11px] text-slate-300">កំណត់ត្រាសវនកម្មទាំងអស់ត្រូវបានសម្អាតរួចរាល់</p>
          </div>
        </div>
      )}

    </div>
  );
};
