import React from 'react';
import { 
  Student, 
  Teacher, 
  ClassRoom, 
  AttendanceRecord, 
  FeeInvoice, 
  PaymentRecord, 
  ExpenseRecord, 
  Announcement, 
  SchoolEvent, 
  AuditLog, 
  SchoolProfile, 
  Language,
  UserRole,
  WeeklyReport,
  NotificationItem
} from '../types';
import { 
  Users, 
  GraduationCap, 
  Building, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  Clock, 
  Award, 
  ArrowUpRight, 
  ChevronRight, 
  ShieldCheck, 
  PlusCircle, 
  FileCheck2, 
  Receipt,
  Sparkles,
  Zap,
  Activity,
  FileSpreadsheet,
  BookOpen,
  Bell,
  Flame,
  AlertTriangle,
  Send,
  ArrowRight,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { formatBothCurrencies, formatCurrency, isFemaleGender, isMaleGender } from '../utils/formatters';
import { getTranslation } from '../utils/i18n';
import { AnalyticsOverviewWidget } from './AnalyticsOverviewWidget';
import { GradeRecord, Subject, Exam } from '../types';

interface DashboardViewProps {
  students: Student[];
  teachers: Teacher[];
  classes: ClassRoom[];
  attendance: AttendanceRecord[];
  invoices: FeeInvoice[];
  payments?: PaymentRecord[];
  expenses?: ExpenseRecord[];
  grades?: GradeRecord[];
  subjects?: Subject[];
  exams?: Exam[];
  announcements: Announcement[];
  events: SchoolEvent[];
  notifications?: NotificationItem[];
  onSelectNotification?: (notification: NotificationItem) => void;
  onOpenSendNotification?: () => void;
  onRestoreSamples?: () => void;
  auditLogs?: AuditLog[];
  weeklyReports?: WeeklyReport[];
  school: SchoolProfile;
  language?: Language;
  userRole?: UserRole;
  onNavigate: (tab: string) => void;
  onOpenReportCardModal?: (student: Student) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students = [],
  teachers = [],
  classes = [],
  attendance = [],
  invoices = [],
  payments = [],
  expenses = [],
  grades = [],
  subjects = [],
  exams = [],
  announcements = [],
  events = [],
  notifications = [],
  onSelectNotification,
  onOpenSendNotification,
  onRestoreSamples,
  auditLogs = [],
  weeklyReports = [],
  school,
  language = 'km',
  userRole,
  onNavigate,
  onOpenReportCardModal
}) => {
  const t = getTranslation(language);

  // Calculations
  const totalStudents = students.length;
  const maleStudents = students.filter(s => isMaleGender(s.gender)).length;
  const femaleStudents = students.filter(s => isFemaleGender(s.gender)).length;
  const malePercent = totalStudents > 0 ? Math.round((maleStudents / totalStudents) * 100) : 50;
  const femalePercent = totalStudents > 0 ? Math.round((femaleStudents / totalStudents) * 100) : 50;

  const totalTeachers = teachers.length;
  const totalClasses = classes.length;

  // Latest weekly report
  const latestWeeklyReport = weeklyReports && weeklyReports.length > 0 ? weeklyReports[0] : null;

  // Attendance stats
  const todayAttendance = attendance.filter(a => a.date === '2026-08-18' || a.date === new Date().toISOString().split('T')[0]);
  const totalRecorded = todayAttendance.length;
  const presentCount = todayAttendance.filter(a => a.status === 'PRESENT').length;
  const lateCount = todayAttendance.filter(a => a.status === 'LATE').length;
  const permCount = todayAttendance.filter(a => a.status === 'PERMISSION').length;
  const absentCount = todayAttendance.filter(a => a.status === 'ABSENT').length;
  const attendanceRate = totalRecorded > 0 ? Math.round(((presentCount + lateCount + permCount) / totalRecorded) * 100) : 96;

  // Financial stats
  const totalInvoicedUSD = invoices.reduce((sum, i) => sum + (i.amountUSD - i.discountUSD), 0);
  const totalCollectedUSD = invoices.reduce((sum, i) => sum + i.paidUSD, 0);
  const totalRemainingUSD = invoices.reduce((sum, i) => sum + i.remainingUSD, 0);
  const totalExpensesUSD = expenses.reduce((sum, e) => sum + e.amountUSD, 0);
  const collectionRate = totalInvoicedUSD > 0 ? Math.round((totalCollectedUSD / totalInvoicedUSD) * 100) : 0;

  const schoolDisplayName = language === 'km' ? school.nameKhmer : (school.nameEnglish || school.nameKhmer);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Frosted Glass Hero Banner */}
      <div className="rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white/15 shadow-2xl bg-linear-to-r from-indigo-950/70 via-purple-950/50 to-slate-950/70 backdrop-blur-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-white/10 text-indigo-200 px-3.5 py-1 rounded-full text-xs font-semibold border border-white/15 backdrop-blur-md font-battambang">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{schoolDisplayName}</span>
              <span className="text-white/30">•</span>
              <span>{t.academicYear} {school.academicYear}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-battambang text-white tracking-tight">
              {t.dashboardTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-light max-w-2xl leading-relaxed">
              {t.dashboardSubtitle}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('weekly_report')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600/80 hover:bg-cyan-500 text-white text-xs font-semibold rounded-2xl transition border border-cyan-400/40 shadow-lg shadow-cyan-500/20 backdrop-blur-md font-battambang"
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-200" />
              <span>{language === 'km' ? 'របាយការណ៍សប្តាហ៍' : 'Weekly Report'}</span>
            </button>
            <button
              onClick={() => onNavigate('students')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-semibold rounded-2xl transition border border-indigo-400/40 shadow-lg shadow-indigo-500/20 backdrop-blur-md font-battambang"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.registerStudentBtn}</span>
            </button>
            <button
              onClick={() => onNavigate('attendance')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-2xl transition border border-white/15 backdrop-blur-md font-battambang"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>{t.takeAttendanceBtn}</span>
            </button>
            <button
              onClick={() => onNavigate('fees_finance')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-linear-to-r from-amber-500/80 to-amber-600/80 hover:brightness-110 text-slate-950 text-xs font-bold rounded-2xl transition border border-amber-400/40 shadow-lg shadow-amber-500/20 backdrop-blur-md font-battambang"
            >
              <Receipt className="w-4 h-4" />
              <span>{t.createInvoiceBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Front-and-Center Live Notifications & Alerts Banner */}
      <div className="rounded-3xl p-4 sm:p-5 bg-slate-900/90 border border-indigo-500/30 shadow-xl backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shadow-md">
              <Bell className="w-4.5 h-4.5 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white font-battambang text-sm">
                  {language === 'km' ? 'ការជូនដំណឹងផ្ទាល់ (Live Notifications)' : 'Live Notifications Feed'}
                </h3>
                {notifications && notifications.filter(n => !n.isRead).length > 0 ? (
                  <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {notifications.filter(n => !n.isRead).length} {language === 'km' ? 'ថ្មី' : 'New'}
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {language === 'km' ? 'រួចរាល់' : 'All Caught Up'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {language === 'km' ? 'សារ និងការជូនដំណឹងបន្ទាន់ចុងក្រោយក្នុងប្រព័ន្ធ' : 'Latest direct messages and urgent alerts in the system'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-chat-modal', { detail: { tab: 'DIRECT' } }))}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 hover:text-white text-xs font-semibold border border-cyan-400/40 transition shadow-sm font-battambang"
            >
              <MessageSquare className="w-3 h-3 text-cyan-300" />
              <span>{language === 'km' ? '💬 ជជែកផ្ទាល់' : 'Direct Chat'}</span>
            </button>
            {onOpenSendNotification && (
              <button
                onClick={onOpenSendNotification}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-semibold border border-indigo-400/30 transition shadow-sm font-battambang"
              >
                <Send className="w-3 h-3" />
                <span>{language === 'km' ? '+ ផ្ញើដំណឹង' : 'Send Alert'}</span>
              </button>
            )}
            {onRestoreSamples && (
              <button
                onClick={onRestoreSamples}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/20 transition font-battambang"
                title="ផ្ទុកការជូនដំណឹងគំរូឡើងវិញ"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">{language === 'km' ? 'ផ្ទុកគំរូ' : 'Restore'}</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('notifications')}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition font-battambang"
            >
              {language === 'km' ? 'មើលទាំងអស់' : 'View All'}
            </button>
          </div>
        </div>

        {notifications && notifications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {notifications.slice(0, 3).map(notif => {
              const isUrgent = notif.type === 'URGENT';
              const isWarning = notif.type === 'WARNING';
              return (
                <div
                  key={notif.id}
                  onClick={() => onSelectNotification && onSelectNotification(notif)}
                  className={`p-3 rounded-2xl border transition cursor-pointer group flex items-start space-x-3 ${
                    !notif.isRead
                      ? 'bg-indigo-950/40 border-indigo-500/40 hover:border-indigo-400 hover:bg-indigo-950/60 shadow-md shadow-indigo-950/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {notif.senderAvatar ? (
                      <img src={notif.senderAvatar} alt={notif.senderName || 'Avatar'} className="w-9 h-9 rounded-xl object-cover border border-white/20" />
                    ) : (
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border text-xs font-bold ${
                        isUrgent ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                        isWarning ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      }`}>
                        {isUrgent ? <Flame className="w-4 h-4" /> :
                         isWarning ? <AlertTriangle className="w-4 h-4" /> :
                         <Bell className="w-4 h-4" />}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-indigo-300 truncate">
                        {notif.senderName ? `ពី៖ ${notif.senderName}` : 'ការជូនដំណឹង'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono shrink-0">{notif.timestamp || 'ថ្មីៗ'}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white font-battambang mt-0.5 line-clamp-1 group-hover:text-indigo-200 transition">
                      {notif.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 font-battambang line-clamp-1 mt-0.5">
                      {notif.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-xs text-slate-400 font-battambang">
              {language === 'km' ? 'មិនទាន់មានការជូនដំណឹងថ្មីនៅក្នុងប្រអប់នេះទេ។' : 'No notifications in your feed currently.'}
            </p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              {onRestoreSamples && (
                <button
                  onClick={onRestoreSamples}
                  className="text-xs text-indigo-300 hover:text-indigo-200 font-semibold underline"
                >
                  {language === 'km' ? 'ផ្ទុកការជូនដំណឹងគំរូឡើងវិញ' : 'Restore Sample Alerts'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Students Card */}
        <div className="glass-card-interactive rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 font-battambang tracking-wider uppercase">{t.totalStudents}</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{totalStudents}</span>
            <span className="text-xs font-semibold text-slate-400 font-battambang">{language === 'km' ? 'នាក់' : 'students'}</span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>{t.male}: <strong className="text-slate-200">{maleStudents}</strong></span>
            <span>{t.female}: <strong className="text-slate-200">{femaleStudents}</strong></span>
            <span className="text-indigo-300 font-medium">{classes.length} {language === 'km' ? 'ថ្នាក់' : 'classes'}</span>
          </div>
        </div>

        {/* Teachers & Staff Card */}
        <div className="glass-card-interactive rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 font-battambang tracking-wider uppercase">{t.totalTeachers}</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center shadow-lg shadow-purple-500/10">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{totalTeachers}</span>
            <span className="text-xs font-semibold text-slate-400 font-battambang">{language === 'km' ? 'នាក់' : 'teachers'}</span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>{language === 'km' ? 'ពេញម៉ោង' : 'Full-time'}: <strong className="text-slate-200">{totalTeachers}</strong></span>
            <span>{language === 'km' ? 'មុខវិជ្ជា' : 'Subjects'}: <strong className="text-slate-200">10</strong></span>
            <span className="text-purple-300 font-medium">{language === 'km' ? 'សកម្ម ១០០%' : '100% Active'}</span>
          </div>
        </div>

        {/* Today Attendance Card */}
        <div className="glass-card-interactive rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 font-battambang tracking-wider uppercase">{t.todayAttendance}</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">{attendanceRate}%</span>
            <span className="text-xs font-semibold text-slate-400 font-battambang">{t.attendanceRate}</span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-emerald-400">{t.present}: <strong>{presentCount}</strong></span>
            <span className="text-amber-300">{t.late}: <strong>{lateCount}</strong></span>
            <span className="text-indigo-300">{t.permission}: <strong>{permCount}</strong></span>
            <span className="text-rose-400">{t.absent}: <strong>{absentCount}</strong></span>
          </div>
        </div>

        {/* Financial Collection Card */}
        <div className="glass-card-interactive rounded-3xl p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 font-battambang tracking-wider uppercase">{t.tuitionRevenue}</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-300 font-mono">${totalCollectedUSD.toLocaleString()}</span>
            <span className="text-[10px] font-semibold text-slate-400 font-mono">
              ({(totalCollectedUSD * school.exchangeRate).toLocaleString('km-KH')} ៛)
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>{t.remainingFees}: <strong className="text-rose-400 font-mono">${totalRemainingUSD.toLocaleString()}</strong></span>
            <span className="text-emerald-400 font-medium">{t.collectionRate}: {collectionRate}%</span>
          </div>
        </div>

      </div>

      {/* Analytics Overview Widget (Recharts Attendance Trends & Average Grade Distributions) */}
      <AnalyticsOverviewWidget 
        attendance={attendance}
        students={students}
        classes={classes}
        grades={grades}
        subjects={subjects}
        exams={exams}
        language={language}
        onNavigateToGrades={() => onNavigate('grades')}
        onNavigateToAttendance={() => onNavigate('attendance')}
      />

      {/* Featured Weekly Teaching Report Widget (Excel/Spreadsheet Format) */}
      {latestWeeklyReport && (
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden border border-cyan-500/30 bg-linear-to-br from-slate-900/90 via-cyan-950/20 to-slate-950/90 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-white font-battambang text-sm sm:text-base">
                    {language === 'km' ? 'របាយការណ៍បង្រៀន និងវត្តមានប្រចាំសប្តាហ៍' : 'Weekly Teaching & Attendance Report'}
                  </h3>
                  <span className="bg-[#00ffff]/20 text-[#00ffff] border border-[#00ffff]/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono">
                    {latestWeeklyReport.className}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {latestWeeklyReport.weekTitle} • {latestWeeklyReport.courseTitle}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('weekly_report')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'បើកទម្រង់ពេញលេញ (Open Full Sheet)' : 'Open Full Spreadsheet'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Spreadsheet Snapshot Preview */}
          <div className="bg-white text-slate-900 rounded-2xl p-4 overflow-x-auto shadow-inner border border-gray-300">
            <div className="flex border border-black text-xs font-bold mb-1">
              <div className="px-3 py-1 flex-1 bg-white border-r border-black font-semibold text-black">
                {latestWeeklyReport.courseTitle}
              </div>
              <div className="bg-[#00ffff] px-4 py-1 border-r border-black text-black">Enrollment</div>
              <div className="bg-[#00ffff] px-6 py-1 text-black font-mono">{latestWeeklyReport.enrollment}</div>
            </div>

            {/* Attendance Mini Table */}
            <table className="w-full border-collapse border border-black text-[11px] font-sans text-center">
              <thead>
                <tr className="bg-[#5c1d1d] text-white font-bold">
                  <th className="border border-black px-2 py-1">Class</th>
                  <th className="border border-black px-2 py-1">Time</th>
                  <th className="border border-black px-2 py-1">Day</th>
                  <th className="border border-black px-2 py-1">8/10 (Mon)</th>
                  <th className="border border-black px-2 py-1">8/11 (Tue)</th>
                  <th className="border border-black px-2 py-1">8/12 (Wed)</th>
                  <th className="border border-black px-2 py-1">8/13 (Thur)</th>
                  <th className="border border-black px-2 py-1">8/14 (Fri)</th>
                  <th className="border border-black px-2 py-1">Total</th>
                  <th className="border border-black px-2 py-1 bg-[#ffff00] text-black">Droped Out</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan={4} className="border border-black bg-[#fce7e9] font-serif font-bold text-sm text-black">
                    {latestWeeklyReport.className}
                  </td>
                  <td rowSpan={4} className="border border-black bg-[#fce7e9] text-black font-bold px-1">
                    {latestWeeklyReport.timeSlot}
                  </td>
                  <td className="border border-black bg-white font-bold text-black py-0.5">Teacher</td>
                  <td className="border border-black bg-white text-black">{latestWeeklyReport.dailyAttendance.mon.teacher}</td>
                  <td className="border border-black bg-white text-black">{latestWeeklyReport.dailyAttendance.tue.teacher}</td>
                  <td className="border border-black bg-white text-black">{latestWeeklyReport.dailyAttendance.wed.teacher}</td>
                  <td className="border border-black bg-white text-black">{latestWeeklyReport.dailyAttendance.thur.teacher}</td>
                  <td className="border border-black bg-white text-black">{latestWeeklyReport.dailyAttendance.fri.teacher}</td>
                  <td className="border border-black bg-white"></td>
                  <td rowSpan={4} className="border border-black bg-white font-bold text-black align-middle">
                    {latestWeeklyReport.droppedOutCount || 0}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black bg-white font-bold text-black py-0.5">Actual St</td>
                  <td className="border border-black bg-white text-black">{latestWeeklyReport.dailyAttendance.mon.actualStudents}</td>
                  <td className="border border-black bg-white text-black">{latestWeeklyReport.dailyAttendance.tue.actualStudents}</td>
                  <td className="border border-black bg-white text-black">{latestWeeklyReport.dailyAttendance.wed.actualStudents}</td>
                  <td className="border border-black bg-white text-black">{latestWeeklyReport.dailyAttendance.thur.actualStudents}</td>
                  <td className="border border-black bg-white text-black">{latestWeeklyReport.dailyAttendance.fri.actualStudents}</td>
                  <td className="border border-black bg-[#ffff00] font-bold text-black">30</td>
                </tr>
                <tr>
                  <td className="border border-black bg-white font-bold text-black py-0.5">Attend</td>
                  <td className="border border-black bg-white text-black">{latestWeeklyReport.dailyAttendance.mon.attendedStudents}</td>
                  <td className="border border-black bg-white text-black">{latestWeeklyReport.dailyAttendance.tue.attendedStudents}</td>
                  <td className="border border-black bg-white text-black">{latestWeeklyReport.dailyAttendance.wed.attendedStudents}</td>
                  <td className="border border-black bg-white text-black">{latestWeeklyReport.dailyAttendance.thur.attendedStudents}</td>
                  <td className="border border-black bg-white text-black">{latestWeeklyReport.dailyAttendance.fri.attendedStudents}</td>
                  <td className="border border-black bg-[#ffff00] font-bold text-black font-mono">30.00</td>
                </tr>
                <tr>
                  <td className="border border-black bg-white font-bold text-black py-0.5">Rate</td>
                  <td className="border border-black bg-[#ffff00] font-bold text-black">100.0%</td>
                  <td className="border border-black bg-[#ffff00] font-bold text-black">100.0%</td>
                  <td className="border border-black bg-[#ffff00] font-bold text-black">100.0%</td>
                  <td className="border border-black bg-[#ffff00] font-bold text-black">100.0%</td>
                  <td className="border border-black bg-[#ffff00] font-bold text-black">100.0%</td>
                  <td className="border border-black bg-[#ffff00] font-bold text-black font-mono">100.0%</td>
                </tr>
              </tbody>
            </table>

            {/* Quick Topic Highlights */}
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-5 gap-1.5 text-[10px]">
              {latestWeeklyReport.plans.map(p => (
                <div key={p.day} className="p-2 rounded bg-slate-50 border border-gray-200">
                  <div className="font-bold text-[#5c1d1d] uppercase">{p.day}</div>
                  <div className="font-medium text-slate-800 line-clamp-2 mt-0.5">{p.topic}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visual Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Attendance Quick Bars */}
        <div className="glass-panel rounded-3xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-white font-battambang text-sm sm:text-base">
                {language === 'km' ? 'ស្ថិតិវត្តមានសង្ខេបប្រចាំសប្តាហ៍ (Weekly Overview)' : 'Weekly Attendance Overview'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'km' ? 'អត្រាវត្តមានសិស្សតាមថ្ងៃក្នុងសប្តាហ៍' : 'Student attendance rates across school days'}
              </p>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md">
              {language === 'km' ? 'មធ្យម ៩៦.៥%' : 'Average 96.5%'}
            </span>
          </div>

          <div className="space-y-3.5 pt-2">
            {[
              { day: language === 'km' ? 'ចន្ទ (Monday)' : 'Monday', percent: 98, present: 34, absent: 1 },
              { day: language === 'km' ? 'អង្គារ (Tuesday)' : 'Tuesday', percent: 97, present: 34, absent: 1 },
              { day: language === 'km' ? 'ពុធ (Wednesday)' : 'Wednesday', percent: 95, present: 33, absent: 2 },
              { day: language === 'km' ? 'ព្រហស្បតិ៍ (Thursday)' : 'Thursday', percent: 97, present: 34, absent: 1 },
              { day: language === 'km' ? 'សុក្រ (Friday)' : 'Friday', percent: 94, present: 33, absent: 2 },
              { day: language === 'km' ? 'សៅរ៍ (Saturday)' : 'Saturday', percent: 98, present: 34, absent: 1 }
            ].map(item => (
              <div key={item.day} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300 font-battambang">{item.day}</span>
                  <div className="space-x-2 font-mono">
                    <span className="text-slate-400">{item.present} {language === 'km' ? 'នាក់' : 'students'}</span>
                    <span className="font-bold text-indigo-300">{item.percent}%</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden flex p-0.5 border border-white/5">
                  <div 
                    className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 shadow-sm shadow-indigo-500/50" 
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enrollment by Grade & Gender Breakdown */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white font-battambang text-sm sm:text-base mb-1">
              {language === 'km' ? 'សមាមាត្រសិស្សតាមថ្នាក់ (Grade Distribution)' : 'Grade Distribution'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              {language === 'km' ? 'ការបែងចែកសិស្សតាមកម្រិតថ្នាក់' : 'Student distribution by academic level'}
            </p>

            <div className="space-y-4">
              {[
                { grade: language === 'km' ? 'ថ្នាក់ទី១២ (Grade 12)' : 'Grade 12', count: 4, percent: 45, color: 'from-indigo-500 to-indigo-400' },
                { grade: language === 'km' ? 'ថ្នាក់ទី១១ (Grade 11)' : 'Grade 11', count: 2, percent: 25, color: 'from-purple-500 to-purple-400' },
                { grade: language === 'km' ? 'ថ្នាក់ទី១០ (Grade 10)' : 'Grade 10', count: 2, percent: 20, color: 'from-teal-500 to-teal-400' },
                { grade: language === 'km' ? 'ថ្នាក់កុំព្យូទ័រ (Computer)' : 'Computer Class', count: 1, percent: 10, color: 'from-amber-500 to-amber-400' }
              ].map(g => (
                <div key={g.grade} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300 font-battambang">{g.grade}</span>
                    <span className="font-bold text-slate-200 font-mono">{g.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div className={`h-full bg-linear-to-r ${g.color} rounded-full`} style={{ width: `${g.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-battambang">{language === 'km' ? 'សមាមាត្រយេនឌ័រ:' : 'Gender Ratio:'}</span>
              <span className="font-semibold text-white font-mono">
                {t.male} {malePercent}% / {t.female} {femalePercent}%
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Announcements, Events & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pinned Announcements */}
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white font-battambang text-sm sm:text-base">
              {language === 'km' ? 'សេចក្តីជូនដំណឹង (Announcements)' : 'Announcements'}
            </h3>
            <button 
              onClick={() => onNavigate('announcements')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
            >
              <span>{language === 'km' ? 'ទាំងអស់' : 'View All'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {announcements.slice(0, 3).map(ann => (
              <div key={ann.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-start justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    ann.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  }`}>
                    {ann.priority === 'URGENT' ? (language === 'km' ? 'បន្ទាន់' : 'Urgent') : (language === 'km' ? 'ដំណឹង' : 'Notice')}
                  </span>
                  <span className="text-[10px] text-slate-400">{ann.createdAt}</span>
                </div>
                <h4 className="font-bold text-white font-battambang text-xs mt-2 leading-snug line-clamp-2">
                  {language === 'km' ? ann.titleKhmer : (ann.titleEnglish || ann.titleKhmer)}
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {language === 'km' ? ann.contentKhmer : (ann.contentEnglish || ann.contentKhmer)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white font-battambang text-sm sm:text-base">
              {language === 'km' ? 'ព្រឹត្តិការណ៍ & ការប្រឡង (Events)' : 'Events & Calendar'}
            </h3>
            <button 
              onClick={() => onNavigate('announcements')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
            >
              <span>{language === 'km' ? 'ប្រតិទិន' : 'Calendar'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {events.slice(0, 4).map(ev => (
              <div key={ev.id} className="flex items-start space-x-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className={`p-2 rounded-xl text-xs font-bold text-center shrink-0 w-12 border ${
                  ev.type === 'HOLIDAY' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 
                  ev.type === 'EXAM' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}>
                  <Calendar className="w-4 h-4 mx-auto mb-0.5" />
                  <span className="text-[9px] block uppercase font-mono">{ev.startDate.split('-')[1]}/{ev.startDate.split('-')[2]}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white font-battambang text-xs leading-snug">
                    {language === 'km' ? ev.titleKhmer : (ev.titleEnglish || ev.titleKhmer)}
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">{ev.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activity */}
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white font-battambang text-sm sm:text-base">
              {language === 'km' ? 'សកម្មភាពថ្មីៗ (Recent Activity)' : 'Recent Activity Logs'}
            </h3>
            <button 
              onClick={() => onNavigate('audit_logs')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
            >
              <span>{language === 'km' ? 'កំណត់ហេតុ' : 'Logs'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 4).map(log => (
              <div key={log.id} className="text-xs border-l-2 border-indigo-400 pl-3 py-1 space-y-1 bg-white/5 p-2 rounded-r-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-300 font-battambang">{log.action}</span>
                  <span className="text-[10px] text-slate-400">{log.timestamp.split(' ')[1] || log.timestamp}</span>
                </div>
                <p className="text-slate-200 text-[11px] line-clamp-1">{log.details}</p>
                <p className="text-[10px] text-slate-400">{log.userName}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
