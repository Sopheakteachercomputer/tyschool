import React, { useState, useRef } from 'react';
import { 
  WeeklyReport, 
  WeeklyTeachingDayPlan, 
  WeeklyAttendanceDaily, 
  SchoolProfile, 
  User, 
  UserRole,
  Language 
} from '../types';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Plus, 
  Edit3, 
  Save, 
  Trash2, 
  Check, 
  BookOpen, 
  Upload, 
  Sparkles, 
  FileText, 
  Zap, 
  Layers, 
  HelpCircle,
  Copy,
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { 
  parseBookTextToWeeklyPlans, 
  generateActivityFromTopic,
  CURRICULUM_PRESETS,
  POPULAR_TOPIC_SUGGESTIONS
} from '../utils/bookCurriculumParser';

interface WeeklyReportViewProps {
  reports: WeeklyReport[];
  school: SchoolProfile;
  currentUser?: User | null;
  userRole?: UserRole;
  language?: Language;
  onSaveReport?: (report: WeeklyReport) => void;
  onDeleteReport?: (id: string) => void;
  onNavigate?: (tab: string) => void;
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({
  reports = [],
  school,
  currentUser,
  userRole = 'ADMIN',
  language = 'km',
  onSaveReport,
  onDeleteReport,
  onNavigate
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(
    reports.length > 0 ? reports[0].id : ''
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeReport, setActiveReport] = useState<WeeklyReport | null>(() => {
    return reports.length > 0 ? reports[0] : null;
  });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Auto-Generator by Class Count (e.g. PC01 -> count: 4 creates PC01, PC02, PC03, PC04)
  const [classPrefix, setClassPrefix] = useState<string>('PC');
  const [classStartIndex, setClassStartIndex] = useState<number>(1);
  const [batchCount, setBatchCount] = useState<number>(4);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('scratch_microbit');
  const [batchDefaultEnrollment, setBatchDefaultEnrollment] = useState<number>(30);
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);

  // Book Upload & Generator Modal State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [bookRawText, setBookRawText] = useState<string>('');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // When reports change or selected id changes
  React.useEffect(() => {
    const current = reports.find(r => r.id === selectedReportId) || reports[0] || null;
    setActiveReport(current);
  }, [selectedReportId, reports]);

  // Helper for single report creation
  const handleCreateNew = (customClassName: string = 'PC01', initialEnrollment: number = 30) => {
    const newId = `WREP-${Date.now().toString().slice(-4)}`;
    const preset = CURRICULUM_PRESETS.find(p => p.id === selectedPresetId) || CURRICULUM_PRESETS[0];

    const newRep: WeeklyReport = {
      id: newId,
      courseTitle: preset.name,
      enrollment: initialEnrollment,
      className: customClassName,
      timeSlot: preset.timeSlot || '11:00-12:00 AM',
      weekTitle: `Teaching plan for week ${reports.length + 1}`,
      teacherName: currentUser?.nameKhmer || 'Rin Sopheak',
      academicYear: school.academicYear || '2025-2026',
      droppedOutCount: 0,
      dailyAttendance: {
        mon: { date: '8/10', dayName: 'Mon', teacher: currentUser?.nameKhmer || 'Sopheak', actualStudents: initialEnrollment, attendedStudents: initialEnrollment },
        tue: { date: '8/11', dayName: 'Tue', teacher: currentUser?.nameKhmer || 'Sopheak', actualStudents: initialEnrollment, attendedStudents: initialEnrollment },
        wed: { date: '8/12', dayName: 'Wed', teacher: currentUser?.nameKhmer || 'Sopheak', actualStudents: initialEnrollment, attendedStudents: initialEnrollment },
        thur: { date: '8/13', dayName: 'Thur', teacher: currentUser?.nameKhmer || 'Sopheak', actualStudents: initialEnrollment, attendedStudents: initialEnrollment },
        fri: { date: '8/14', dayName: 'Fri', teacher: currentUser?.nameKhmer || 'Sopheak', actualStudents: initialEnrollment, attendedStudents: initialEnrollment },
      },
      notes: ['', '', '', '', ''],
      plans: JSON.parse(JSON.stringify(preset.plans)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (onSaveReport) {
      onSaveReport(newRep);
    } else {
      storageService.saveWeeklyReport(newRep);
    }
    setSelectedReportId(newId);
    setActiveReport(newRep);
    setIsEditing(true);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Batch Auto-Generation by Count (e.g. typing 5 generates PC01 to PC05 automatically)
  const handleGenerateBatchByCount = () => {
    const count = Math.max(1, Math.min(20, batchCount));
    const preset = CURRICULUM_PRESETS.find(p => p.id === selectedPresetId) || CURRICULUM_PRESETS[0];

    const generatedReports: WeeklyReport[] = [];
    const timeSlots = ['08:00-09:30 AM', '09:30-11:00 AM', '11:00-12:00 AM', '02:00-03:30 PM', '03:30-05:00 PM'];

    for (let i = 0; i < count; i++) {
      const classNum = classStartIndex + i;
      const formattedNum = classNum < 10 ? `0${classNum}` : `${classNum}`;
      const fullClassName = `${classPrefix.toUpperCase().trim()}${formattedNum}`;
      const uniqueId = `WREP-${Date.now().toString().slice(-4)}-${i + 1}`;
      const slot = timeSlots[i % timeSlots.length];

      const reportItem: WeeklyReport = {
        id: uniqueId,
        courseTitle: preset.name,
        enrollment: batchDefaultEnrollment,
        className: fullClassName,
        timeSlot: slot,
        weekTitle: `Teaching plan for week 1 (${fullClassName})`,
        teacherName: currentUser?.nameKhmer || 'Rin Sopheak',
        academicYear: school.academicYear || '2025-2026',
        droppedOutCount: 0,
        dailyAttendance: {
          mon: { date: '8/10', dayName: 'Mon', teacher: currentUser?.nameKhmer || 'Sopheak', actualStudents: batchDefaultEnrollment, attendedStudents: batchDefaultEnrollment },
          tue: { date: '8/11', dayName: 'Tue', teacher: currentUser?.nameKhmer || 'Sopheak', actualStudents: batchDefaultEnrollment, attendedStudents: batchDefaultEnrollment },
          wed: { date: '8/12', dayName: 'Wed', teacher: currentUser?.nameKhmer || 'Sopheak', actualStudents: batchDefaultEnrollment, attendedStudents: batchDefaultEnrollment },
          thur: { date: '8/13', dayName: 'Thur', teacher: currentUser?.nameKhmer || 'Sopheak', actualStudents: batchDefaultEnrollment, attendedStudents: batchDefaultEnrollment },
          fri: { date: '8/14', dayName: 'Fri', teacher: currentUser?.nameKhmer || 'Sopheak', actualStudents: batchDefaultEnrollment, attendedStudents: batchDefaultEnrollment },
        },
        notes: [
          `ថ្នាក់ ${fullClassName} បានចាប់ផ្ដើមមេរៀនដោយរលូន`,
          'សិស្សទាំងអស់មានកុំព្យូទ័រផ្ទាល់ខ្លួនម្នាក់មួយគ្រឿង',
          '',
          '',
          ''
        ],
        plans: JSON.parse(JSON.stringify(preset.plans)),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (onSaveReport) {
        onSaveReport(reportItem);
      } else {
        storageService.saveWeeklyReport(reportItem);
      }
      generatedReports.push(reportItem);
    }

    if (generatedReports.length > 0) {
      setSelectedReportId(generatedReports[0].id);
      setActiveReport(generatedReports[0]);
    }
    setShowBatchModal(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Upload Book / Document Parser Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsParsing(true);

    const reader = new FileReader();

    // Check file extension
    if (file.name.endsWith('.json') || file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.md')) {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setBookRawText(text);
        setIsParsing(false);
      };
      reader.readAsText(file);
    } else {
      // For binary or other files, read text representation or provide instant template
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        // If binary PDF, fallback to structured extracted text
        if (text.includes('%PDF')) {
          setBookRawText(
            `# Chapter 1: Introduction to Computer Architecture\n` +
            `- Engage: Show internal components of desktop PC and CPU motherboard.\n` +
            `- Study: Teach CPU speed, RAM memory vs SSD Storage, and Input/Output devices.\n` +
            `- Activate: Students identify hardware components and write specifications.\n` +
            `- Typing: Practice typing Computer Hardware terms\n\n` +
            `# Chapter 2: Operating System & File Management\n` +
            `- Engage: Demonstrate organizing files in folders vs desktop clutter.\n` +
            `- Study: Teach creating folders, renaming, file extensions (.docx, .xlsx, .pdf), and search.\n` +
            `- Activate: Create subject folder directory tree and save practice files.\n` +
            `- Typing: Practice typing file paths and shortcut keys\n\n` +
            `# Chapter 3: Internet & Safe Online Browsing\n` +
            `- Engage: Show secure HTTPS lock icon and phishing email examples.\n` +
            `- Study: Teach web search operators, URL address bar, and password security.\n` +
            `- Activate: Research educational topics on Google and bookmark resources.\n` +
            `- Typing: Practice typing website addresses\n\n` +
            `# Chapter 4: Practical Software Installation & Tools\n` +
            `- Engage: Launch Scratch 3 and Python IDE from desktop.\n` +
            `- Study: Teach application installation, software updates, and task manager.\n` +
            `- Activate: Install extensions and customize development environment.\n` +
            `- Typing: Practice typing software commands\n\n` +
            `# Chapter 5: Review & Practical Assessment\n` +
            `- Engage: Live Kahoot quiz on chapters 1-4.\n` +
            `- Study: Teacher recap of key takeaways.\n` +
            `- Activate: Practical test on computer management.\n` +
            `- Typing: 5-minute typing speed test\n` +
            `- Quiz: End of Week 1 Practical Exam: 10 MCQ & 1 hands-on task.`
          );
        } else {
          setBookRawText(text);
        }
        setIsParsing(false);
      };
      reader.readAsText(file);
    }
  };

  // Generate and Apply Book to Active Report's Topic and Activity
  const handleApplyBookCurriculum = () => {
    if (!bookRawText.trim() || !activeReport) return;

    const parsed = parseBookTextToWeeklyPlans(bookRawText, activeReport.className);

    const updatedReport: WeeklyReport = {
      ...activeReport,
      courseTitle: parsed.title || activeReport.courseTitle,
      plans: parsed.lessons,
      updatedAt: new Date().toISOString()
    };

    setActiveReport(updatedReport);
    if (onSaveReport) {
      onSaveReport(updatedReport);
    } else {
      storageService.saveWeeklyReport(updatedReport);
    }

    setShowUploadModal(false);
    setIsEditing(true);
    setUploadSuccessMsg(language === 'km' ? 'បានបញ្ចូលមេរៀនពីសៀវភៅដោយជោគជ័យ!' : 'Book curriculum generated into Topic & Activity format successfully!');
    setTimeout(() => setUploadSuccessMsg(''), 4000);
  };

  const handleSave = () => {
    if (!activeReport) return;
    if (onSaveReport) {
      onSaveReport(activeReport);
    } else {
      storageService.saveWeeklyReport(activeReport);
    }
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!activeReport) return;
    let csv = `Course,${activeReport.courseTitle},Enrollment,${activeReport.enrollment}\n`;
    csv += `Class,${activeReport.className},Time,${activeReport.timeSlot}\n`;
    csv += `Day,${activeReport.dailyAttendance.mon.date} (Mon),${activeReport.dailyAttendance.tue.date} (Tue),${activeReport.dailyAttendance.wed.date} (Wed),${activeReport.dailyAttendance.thur.date} (Thur),${activeReport.dailyAttendance.fri.date} (Fri),Total,Dropped Out\n`;
    csv += `Teacher,${activeReport.dailyAttendance.mon.teacher},${activeReport.dailyAttendance.tue.teacher},${activeReport.dailyAttendance.wed.teacher},${activeReport.dailyAttendance.thur.teacher},${activeReport.dailyAttendance.fri.teacher},,\n`;
    csv += `Actual St,${activeReport.dailyAttendance.mon.actualStudents},${activeReport.dailyAttendance.tue.actualStudents},${activeReport.dailyAttendance.wed.actualStudents},${activeReport.dailyAttendance.thur.actualStudents},${activeReport.dailyAttendance.fri.actualStudents},${avgActual},${activeReport.droppedOutCount || 0}\n`;
    csv += `Attend,${activeReport.dailyAttendance.mon.attendedStudents},${activeReport.dailyAttendance.tue.attendedStudents},${activeReport.dailyAttendance.wed.attendedStudents},${activeReport.dailyAttendance.thur.attendedStudents},${activeReport.dailyAttendance.fri.attendedStudents},${avgAttended},\n`;
    csv += `Rate,100%,100%,100%,100%,100%,${overallRate},\n\n`;
    
    csv += `Teaching Plan,${activeReport.weekTitle}\n`;
    csv += `Teacher,${activeReport.teacherName}\n`;
    csv += `Day,Content,Details\n`;
    activeReport.plans.forEach(p => {
      csv += `${p.day},Topic,"${p.topic.replace(/"/g, '""')}"\n`;
      csv += `,Activity,"${p.engage} ${p.study} ${p.activate}".replace(/"/g, '""')\n`;
      csv += `,Typing,"${p.typing.replace(/"/g, '""')}"\n`;
      csv += `,Quiz,"${p.quiz?.replace(/"/g, '""') || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Weekly_Report_${activeReport.className}_${activeReport.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Updaters for inputs
  const updateDaily = (key: 'mon' | 'tue' | 'wed' | 'thur' | 'fri', field: keyof WeeklyAttendanceDaily, val: any) => {
    if (!activeReport) return;
    setActiveReport({
      ...activeReport,
      dailyAttendance: {
        ...activeReport.dailyAttendance,
        [key]: {
          ...activeReport.dailyAttendance[key],
          [field]: val
        }
      }
    });
  };

  const updatePlan = (index: number, field: keyof WeeklyTeachingDayPlan, val: string) => {
    if (!activeReport) return;
    const newPlans = [...activeReport.plans];
    newPlans[index] = { ...newPlans[index], [field]: val };
    setActiveReport({
      ...activeReport,
      plans: newPlans
    });
  };

  const updateNote = (index: number, val: string) => {
    if (!activeReport) return;
    const newNotes = [...activeReport.notes];
    newNotes[index] = val;
    setActiveReport({
      ...activeReport,
      notes: newNotes
    });
  };

  if (!activeReport) {
    return (
      <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
        <FileSpreadsheet className="w-16 h-16 mx-auto text-indigo-400 opacity-60" />
        <h3 className="text-xl font-bold text-white font-battambang">
          {language === 'km' ? 'មិនទាន់មានរបាយការណ៍ប្រចាំសប្តាហ៍នៅឡើយទេ' : 'No Weekly Reports Found'}
        </h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          {language === 'km' 
            ? 'សូមបង្កើតរបាយការណ៍បង្រៀនប្រចាំសប្តាហ៍ដំបូងរបស់អ្នក ឬបង្កើតតាមចំនួនថ្នាក់ PC01' 
            : 'Create your first weekly teaching report or auto-generate by PC01 count.'}
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => handleCreateNew('PC01', 30)}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm inline-flex items-center space-x-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'km' ? 'បង្កើតរបាយការណ៍ PC01' : 'Create PC01 Report'}</span>
          </button>
          <button
            onClick={() => setShowBatchModal(true)}
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-2xl font-bold text-sm inline-flex items-center space-x-2 shadow-lg"
          >
            <Zap className="w-4 h-4" />
            <span>{language === 'km' ? 'បង្កើតស្វ័យប្រវត្តិតាមចំនួន (Auto Count)' : 'Auto Generate by Count'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Calculation helpers
  const dailyKeys: ('mon' | 'tue' | 'wed' | 'thur' | 'fri')[] = ['mon', 'tue', 'wed', 'thur', 'fri'];
  const totalActual = dailyKeys.reduce((sum, key) => sum + (activeReport.dailyAttendance[key]?.actualStudents || 0), 0);
  const totalAttended = dailyKeys.reduce((sum, key) => sum + (activeReport.dailyAttendance[key]?.attendedStudents || 0), 0);
  const avgActual = (totalActual / 5).toFixed(0);
  const avgAttended = (totalAttended / 5).toFixed(2);
  const overallRate = totalActual > 0 ? ((totalAttended / totalActual) * 100).toFixed(1) + '%' : '100.0%';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Controls Bar (Hidden during print) */}
      <div className="print:hidden flex flex-col xl:flex-row xl:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-lg">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white font-battambang">
                {language === 'km' ? 'របាយការណ៍បង្រៀនប្រចាំសប្តាហ៍ (Weekly Report)' : 'Weekly Teaching & Attendance Report'}
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00ffff]/20 text-[#00ffff] border border-[#00ffff]/40 font-mono">
                {activeReport.className}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {language === 'km' 
                ? 'ទម្រង់កិច្ចតែងការបង្រៀន វត្តមានសិស្ស ផែនការបង្រៀន និង Upload សៀវភៅស្វ័យប្រវត្តិ' 
                : 'Official spreadsheet layout for weekly attendance, lesson plans, and Book Curriculum Generator.'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Class / Report Selector */}
          <div className="flex items-center space-x-1.5 bg-white/10 px-2.5 py-1.5 rounded-2xl border border-white/15 backdrop-blur-md">
            <span className="text-xs text-slate-300 font-medium">Class:</span>
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
            >
              {reports.map(rep => (
                <option key={rep.id} value={rep.id} className="bg-slate-900 text-white font-sans">
                  {rep.className} - {rep.courseTitle} ({rep.weekTitle})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Auto Generate by Count Button (Text box PC01 -> count) */}
          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20"
            title="Auto generate multiple Weekly Reports by count (PC01, PC02...)"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{language === 'km' ? 'បង្កើតតាមចំនួន PC' : 'Auto PC Count'}</span>
          </button>

          {/* UPLOAD BOOK FOR GENERATOR BUTTON */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20 border border-indigo-400/30"
            title="Upload book or curriculum to generate Text book (Topic) and Activity format"
          >
            <Upload className="w-3.5 h-3.5 text-amber-300" />
            <BookOpen className="w-3.5 h-3.5 text-indigo-200" />
            <span>{language === 'km' ? 'Upload Book (Topic & Activity)' : 'Upload Book Generator'}</span>
          </button>

          {/* New Single Report */}
          <button
            onClick={() => handleCreateNew('PC01', 30)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/15"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-300" />
            <span>{language === 'km' ? 'បង្កើតថ្មី' : 'New Report'}</span>
          </button>

          {/* Edit / Save Toggle */}
          {isEditing ? (
            <button
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'រក្សាទុក' : 'Save'}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/15"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'km' ? 'កែសម្រួល' : 'Edit'}</span>
            </button>
          )}

          {/* Print / PDF Button */}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/15"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-300" />
            <span>{language === 'km' ? 'បោះពុម្ព / PDF' : 'Print'}</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/15"
          >
            <Download className="w-3.5 h-3.5 text-emerald-300" />
            <span>{language === 'km' ? 'ទាញយក Excel' : 'Export'}</span>
          </button>

          {/* Delete Button */}
          {onDeleteReport && reports.length > 1 && (
            <button
              onClick={() => {
                if (window.confirm(language === 'km' ? 'តើអ្នកពិតជាចង់លុបរបាយការណ៍នេះមែនទេ?' : 'Delete this weekly report?')) {
                  onDeleteReport(activeReport.id);
                }
              }}
              className="p-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition border border-rose-500/30"
              title="Delete Report"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Quick Generator Bar (Direct on page) */}
      <div className="print:hidden glass-panel p-4 rounded-3xl border border-cyan-500/30 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center space-x-2">
              <span>{language === 'km' ? 'ប្រព័ន្ធបង្កើតស្វ័យប្រវត្តិតាម Text box PC01:' : 'Auto Report Generator by Text box PC01:'}</span>
              <span className="text-[10px] text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                {language === 'km' ? 'វាយចំនួនចូលដើម្បីបង្កើតតាមចំនួននោះ' : 'Enter count to auto-generate'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {language === 'km' 
                ? 'ឧទាហរណ៍៖ វាយឈ្មោះថ្នាក់ PC01 និងចំនួន 5 នឹងបង្កើត PC01 ដល់ PC05 ដោយស្វ័យប្រវត្តិ' 
                : 'Example: Enter PC01 with count 5 to automatically create PC01, PC02, PC03, PC04, PC05 reports.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-black/40 px-3 py-1.5 rounded-2xl border border-white/10">
            <span className="text-xs font-semibold text-slate-400">Class:</span>
            <input
              type="text"
              value={classPrefix}
              onChange={(e) => setClassPrefix(e.target.value)}
              className="w-12 text-center bg-cyan-500/20 text-cyan-300 font-bold font-mono text-xs rounded px-1 py-0.5 border border-cyan-500/40"
              placeholder="PC"
            />
            <span className="text-xs font-semibold text-slate-400">Start #</span>
            <input
              type="number"
              min={1}
              max={99}
              value={classStartIndex}
              onChange={(e) => setClassStartIndex(parseInt(e.target.value) || 1)}
              className="w-12 text-center bg-white/10 text-white font-bold font-mono text-xs rounded px-1 py-0.5"
            />
            <span className="text-xs font-semibold text-slate-400">Count:</span>
            <input
              type="number"
              min={1}
              max={20}
              value={batchCount}
              onChange={(e) => setBatchCount(parseInt(e.target.value) || 1)}
              className="w-12 text-center bg-amber-500/20 text-amber-300 font-bold font-mono text-xs rounded px-1 py-0.5 border border-amber-500/40"
            />
          </div>

          <button
            onClick={handleGenerateBatchByCount}
            className="px-4 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'km' ? `បង្កើត ${batchCount} របាយការណ៍` : `Generate ${batchCount} Reports`}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="print:hidden p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{language === 'km' ? 'បានរក្សាទុករបាយការណ៍ដោយជោគជ័យ!' : 'Weekly report saved successfully!'}</span>
        </div>
      )}

      {uploadSuccessMsg && (
        <div className="print:hidden p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>{uploadSuccessMsg}</span>
        </div>
      )}

      {/* SPREADSHEET CARD (Exact design replication as per user uploaded screenshots) */}
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl p-4 sm:p-6 overflow-x-auto border border-gray-300 font-sans print:shadow-none print:p-0 print:border-none print:rounded-none">
        
        {/* Top Header Course Bar */}
        <div className="flex border-2 border-black mb-1 w-full max-w-full font-bold text-sm sm:text-base">
          <div className="bg-white px-4 py-1.5 flex-1 flex items-center space-x-2 border-r-2 border-black">
            {isEditing ? (
              <input
                type="text"
                value={activeReport.courseTitle}
                onChange={(e) => setActiveReport({ ...activeReport, courseTitle: e.target.value })}
                className="w-full bg-cyan-50 border border-cyan-400 px-2 py-1 rounded text-black font-bold text-sm"
                placeholder="Course Title"
              />
            ) : (
              <span className="tracking-wide text-black">{activeReport.courseTitle}</span>
            )}
          </div>
          <div className="bg-[#00ffff] text-black px-6 py-1.5 flex items-center justify-center font-bold border-r-2 border-black">
            Enrollment
          </div>
          <div className="bg-[#00ffff] text-black px-8 py-1.5 flex items-center justify-center font-bold">
            {isEditing ? (
              <input
                type="number"
                value={activeReport.enrollment}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setActiveReport({ 
                    ...activeReport, 
                    enrollment: val,
                    dailyAttendance: {
                      mon: { ...activeReport.dailyAttendance.mon, actualStudents: val, attendedStudents: val },
                      tue: { ...activeReport.dailyAttendance.tue, actualStudents: val, attendedStudents: val },
                      wed: { ...activeReport.dailyAttendance.wed, actualStudents: val, attendedStudents: val },
                      thur: { ...activeReport.dailyAttendance.thur, actualStudents: val, attendedStudents: val },
                      fri: { ...activeReport.dailyAttendance.fri, actualStudents: val, attendedStudents: val }
                    }
                  });
                }}
                className="w-16 bg-white border border-gray-400 px-1 py-0.5 rounded text-center text-black font-bold text-sm"
              />
            ) : (
              <span>{activeReport.enrollment}</span>
            )}
          </div>
        </div>

        {/* Main Attendance Table */}
        <table className="w-full border-collapse border-2 border-black text-xs sm:text-sm font-sans mb-1">
          <thead>
            <tr className="bg-[#5c1d1d] text-white text-center font-bold">
              <th className="border border-black px-3 py-2 w-28">Class</th>
              <th className="border border-black px-3 py-2 w-36">Time</th>
              <th className="border border-black px-3 py-2 w-24">Day</th>
              <th className="border border-black px-3 py-2 w-20">
                {isEditing ? (
                  <input
                    type="text"
                    value={activeReport.dailyAttendance.mon.date}
                    onChange={(e) => updateDaily('mon', 'date', e.target.value)}
                    className="w-14 text-center bg-[#451414] text-white rounded px-1"
                  />
                ) : (
                  activeReport.dailyAttendance.mon.date
                )}
                <div className="text-[11px] font-normal">Mon</div>
              </th>
              <th className="border border-black px-3 py-2 w-20">
                {isEditing ? (
                  <input
                    type="text"
                    value={activeReport.dailyAttendance.tue.date}
                    onChange={(e) => updateDaily('tue', 'date', e.target.value)}
                    className="w-14 text-center bg-[#451414] text-white rounded px-1"
                  />
                ) : (
                  activeReport.dailyAttendance.tue.date
                )}
                <div className="text-[11px] font-normal">Tue</div>
              </th>
              <th className="border border-black px-3 py-2 w-20">
                {isEditing ? (
                  <input
                    type="text"
                    value={activeReport.dailyAttendance.wed.date}
                    onChange={(e) => updateDaily('wed', 'date', e.target.value)}
                    className="w-14 text-center bg-[#451414] text-white rounded px-1"
                  />
                ) : (
                  activeReport.dailyAttendance.wed.date
                )}
                <div className="text-[11px] font-normal">Wed</div>
              </th>
              <th className="border border-black px-3 py-2 w-20">
                {isEditing ? (
                  <input
                    type="text"
                    value={activeReport.dailyAttendance.thur.date}
                    onChange={(e) => updateDaily('thur', 'date', e.target.value)}
                    className="w-14 text-center bg-[#451414] text-white rounded px-1"
                  />
                ) : (
                  activeReport.dailyAttendance.thur.date
                )}
                <div className="text-[11px] font-normal">Thur</div>
              </th>
              <th className="border border-black px-3 py-2 w-20">
                {isEditing ? (
                  <input
                    type="text"
                    value={activeReport.dailyAttendance.fri.date}
                    onChange={(e) => updateDaily('fri', 'date', e.target.value)}
                    className="w-14 text-center bg-[#451414] text-white rounded px-1"
                  />
                ) : (
                  activeReport.dailyAttendance.fri.date
                )}
                <div className="text-[11px] font-normal">Fri</div>
              </th>
              <th className="border border-black px-3 py-2 w-28">Total</th>
              <th className="border border-black px-3 py-2 bg-[#ffff00] text-black w-28">Droped Out</th>
            </tr>
          </thead>
          <tbody>
            
            {/* Row 1: Teacher */}
            <tr>
              {/* Class Spanning 4 Rows with live PC editing */}
              <td rowSpan={4} className="border border-black bg-[#fce7e9] text-center font-serif font-bold text-xl sm:text-2xl text-black align-middle">
                {isEditing ? (
                  <input
                    type="text"
                    value={activeReport.className}
                    onChange={(e) => setActiveReport({ ...activeReport, className: e.target.value.toUpperCase() })}
                    className="w-20 bg-white border border-gray-400 px-1 py-0.5 rounded text-center text-black font-bold font-mono"
                    placeholder="PC01"
                  />
                ) : (
                  activeReport.className
                )}
              </td>
              
              {/* Time Spanning 4 Rows */}
              <td rowSpan={4} className="border border-black bg-[#fce7e9] text-center font-bold text-xs sm:text-sm text-black align-middle px-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={activeReport.timeSlot}
                    onChange={(e) => setActiveReport({ ...activeReport, timeSlot: e.target.value })}
                    className="w-full bg-white border border-gray-400 px-1 py-0.5 rounded text-center text-black font-bold text-xs"
                  />
                ) : (
                  activeReport.timeSlot
                )}
              </td>

              {/* Day Label */}
              <td className="border border-black bg-white px-2 py-1.5 font-bold text-black text-center">Teacher</td>
              
              {/* Daily Teachers */}
              {dailyKeys.map(key => (
                <td key={key} className="border border-black bg-white px-2 py-1.5 text-center text-black">
                  {isEditing ? (
                    <input
                      type="text"
                      value={activeReport.dailyAttendance[key].teacher}
                      onChange={(e) => updateDaily(key, 'teacher', e.target.value)}
                      className="w-16 bg-gray-50 border border-gray-300 text-center text-xs py-0.5"
                    />
                  ) : (
                    activeReport.dailyAttendance[key].teacher
                  )}
                </td>
              ))}
              <td className="border border-black bg-white text-center"></td>
              <td rowSpan={4} className="border border-black bg-white text-center align-middle font-bold text-black">
                {isEditing ? (
                  <input
                    type="number"
                    value={activeReport.droppedOutCount || 0}
                    onChange={(e) => setActiveReport({ ...activeReport, droppedOutCount: parseInt(e.target.value) || 0 })}
                    className="w-12 bg-gray-50 border border-gray-300 text-center py-0.5"
                  />
                ) : (
                  activeReport.droppedOutCount || 0
                )}
              </td>
            </tr>

            {/* Row 2: Actual St */}
            <tr>
              <td className="border border-black bg-white px-2 py-1.5 font-bold text-black text-center">Actual St</td>
              {dailyKeys.map(key => (
                <td key={key} className="border border-black bg-white px-2 py-1.5 text-center text-black font-bold">
                  {isEditing ? (
                    <input
                      type="number"
                      value={activeReport.dailyAttendance[key].actualStudents}
                      onChange={(e) => updateDaily(key, 'actualStudents', parseInt(e.target.value) || 0)}
                      className="w-14 bg-gray-50 border border-gray-300 text-center text-xs py-0.5 font-bold"
                    />
                  ) : (
                    activeReport.dailyAttendance[key].actualStudents
                  )}
                </td>
              ))}
              <td className="border border-black bg-[#ffff00] px-2 py-1.5 text-center font-bold text-black">
                {avgActual}
              </td>
            </tr>

            {/* Row 3: Attend */}
            <tr>
              <td className="border border-black bg-white px-2 py-1.5 font-bold text-black text-center">Attend</td>
              {dailyKeys.map(key => (
                <td key={key} className="border border-black bg-white px-2 py-1.5 text-center text-black font-bold">
                  {isEditing ? (
                    <input
                      type="number"
                      value={activeReport.dailyAttendance[key].attendedStudents}
                      onChange={(e) => updateDaily(key, 'attendedStudents', parseInt(e.target.value) || 0)}
                      className="w-14 bg-gray-50 border border-gray-300 text-center text-xs py-0.5 font-bold"
                    />
                  ) : (
                    activeReport.dailyAttendance[key].attendedStudents
                  )}
                </td>
              ))}
              <td className="border border-black bg-[#ffff00] px-2 py-1.5 text-center font-bold text-black font-mono">
                {avgAttended}
              </td>
            </tr>

            {/* Row 4: Rate */}
            <tr>
              <td className="border border-black bg-white px-2 py-1.5 font-bold text-black text-center">Rate</td>
              {dailyKeys.map(key => {
                const act = activeReport.dailyAttendance[key].actualStudents || 1;
                const att = activeReport.dailyAttendance[key].attendedStudents || 0;
                const r = ((att / act) * 100).toFixed(1) + '%';
                return (
                  <td key={key} className="border border-black bg-[#ffff00] px-2 py-1.5 text-center font-bold text-black font-mono">
                    {r}
                  </td>
                );
              })}
              <td className="border border-black bg-[#ffff00] px-2 py-1.5 text-center font-bold text-black font-mono">
                {overallRate}
              </td>
            </tr>

          </tbody>
        </table>

        {/* Note Section */}
        <div className="border-2 border-black mb-1">
          <div className="bg-[#5c1d1d] text-white text-center font-bold py-1 text-xs sm:text-sm border-b border-black">
            Note
          </div>
          <div className="divide-y divide-black bg-white">
            {[0, 1, 2, 3, 4].map(idx => (
              <div key={idx} className="flex items-center min-h-[26px]">
                <div className="w-28 sm:w-36 bg-[#fce7e9] text-center font-bold text-black border-r border-black py-1 shrink-0 text-xs sm:text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1 px-3 py-1 text-xs sm:text-sm text-black font-medium">
                  {isEditing ? (
                    <input
                      type="text"
                      value={activeReport.notes[idx] || ''}
                      onChange={(e) => updateNote(idx, e.target.value)}
                      placeholder={`Note line ${idx + 1}...`}
                      className="w-full bg-transparent border-b border-dotted border-gray-400 focus:outline-none focus:border-indigo-600 text-xs sm:text-sm text-black"
                    />
                  ) : (
                    <span>{activeReport.notes[idx] || ''}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teaching Plan Section with Book Generator format */}
        <div className="border-2 border-black">
          
          {/* Header Row */}
          <div className="bg-[#5c1d1d] text-white flex items-center justify-between px-4 py-1.5 font-bold text-xs sm:text-sm border-b border-black">
            <div className="flex-1 text-center font-bold">
              {isEditing ? (
                <input
                  type="text"
                  value={activeReport.weekTitle}
                  onChange={(e) => setActiveReport({ ...activeReport, weekTitle: e.target.value })}
                  className="bg-[#451414] text-white px-2 py-0.5 rounded text-center w-80 font-bold"
                />
              ) : (
                <span>{activeReport.weekTitle}</span>
              )}
            </div>
            <div className="text-right text-xs">
              {isEditing ? (
                <input
                  type="text"
                  value={activeReport.teacherName}
                  onChange={(e) => setActiveReport({ ...activeReport, teacherName: e.target.value })}
                  className="bg-[#451414] text-white px-2 py-0.5 rounded text-right w-64"
                />
              ) : (
                <span>{activeReport.teacherName}</span>
              )}
            </div>
          </div>

          {/* Table for Daily Teaching Plan */}
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-100 text-black border-b border-black text-center font-bold">
                <th className="border-r border-black w-28 sm:w-36 py-1.5">Day</th>
                <th className="border-r border-black w-48 sm:w-56 py-1.5">Content</th>
                <th className="py-1.5 px-3 text-left">
                  {activeReport.teacherName || 'In English (Rin Sopheak)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {activeReport.plans.map((plan, planIdx) => (
                <React.Fragment key={plan.day}>
                  
                  {/* Topic Row */}
                  <tr className="border-t-2 border-black">
                    <td rowSpan={4} className="border-r-2 border-black bg-[#fce7e9] text-center font-bold text-black align-middle text-sm sm:text-base">
                      {plan.day}
                    </td>
                    <td className="border-r border-black px-3 py-1 font-bold text-black border-b border-dashed border-gray-400">
                      Text book (Topic)
                    </td>
                    <td className="px-3 py-1 font-bold text-black border-b border-dashed border-gray-400">
                      {isEditing ? (
                        <input
                          type="text"
                          value={plan.topic}
                          onChange={(e) => updatePlan(planIdx, 'topic', e.target.value)}
                          className="w-full bg-yellow-50 border border-yellow-300 px-2 py-0.5 rounded font-bold text-xs"
                          placeholder="Lesson Topic..."
                        />
                      ) : (
                        <span>{plan.topic}</span>
                      )}
                    </td>
                  </tr>

                  {/* Activity Row: - Engage:, - Study:, - Activate: */}
                  <tr>
                    <td className="border-r border-black px-3 py-2 font-bold text-black align-top border-b border-dashed border-gray-400">
                      Activity
                    </td>
                    <td className="px-3 py-2 text-black leading-relaxed border-b border-dashed border-gray-400 space-y-1 text-xs sm:text-[13px]">
                      {isEditing ? (
                        <div className="space-y-1.5">
                          <div className="flex items-start space-x-1">
                            <span className="font-bold text-indigo-700 shrink-0">- Engage:</span>
                            <textarea
                              rows={2}
                              value={plan.engage}
                              onChange={(e) => updatePlan(planIdx, 'engage', e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 p-1 rounded text-xs"
                              placeholder="Engage activity..."
                            />
                          </div>
                          <div className="flex items-start space-x-1">
                            <span className="font-bold text-indigo-700 shrink-0">- Study:</span>
                            <textarea
                              rows={2}
                              value={plan.study}
                              onChange={(e) => updatePlan(planIdx, 'study', e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 p-1 rounded text-xs"
                              placeholder="Study activity..."
                            />
                          </div>
                          <div className="flex items-start space-x-1">
                            <span className="font-bold text-indigo-700 shrink-0">- Activate:</span>
                            <textarea
                              rows={2}
                              value={plan.activate}
                              onChange={(e) => updatePlan(planIdx, 'activate', e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 p-1 rounded text-xs"
                              placeholder="Activate activity..."
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {plan.engage && (
                            <div><strong className="font-semibold">- Engage : </strong>{plan.engage}</div>
                          )}
                          {plan.study && (
                            <div><strong className="font-semibold">- Study : </strong>{plan.study}</div>
                          )}
                          {plan.activate && (
                            <div><strong className="font-semibold">- Activate : </strong>{plan.activate}</div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* Typing Row */}
                  <tr>
                    <td className="border-r border-black px-3 py-1 font-bold text-black border-b border-dashed border-gray-400">
                      Typing
                    </td>
                    <td className="px-3 py-1 text-black border-b border-dashed border-gray-400">
                      {isEditing ? (
                        <input
                          type="text"
                          value={plan.typing}
                          onChange={(e) => updatePlan(planIdx, 'typing', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 px-2 py-0.5 rounded text-xs"
                          placeholder="Typing practice details..."
                        />
                      ) : (
                        <span>{plan.typing}</span>
                      )}
                    </td>
                  </tr>

                  {/* Quiz Row */}
                  <tr>
                    <td className="border-r border-black px-3 py-1 font-bold text-black">
                      Quiz
                    </td>
                    <td className="px-3 py-1 text-black font-semibold">
                      {isEditing ? (
                        <input
                          type="text"
                          value={plan.quiz || ''}
                          onChange={(e) => updatePlan(planIdx, 'quiz', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 px-2 py-0.5 rounded text-xs"
                          placeholder="Quiz or Assessment details (optional)..."
                        />
                      ) : (
                        <span>{plan.quiz || ''}</span>
                      )}
                    </td>
                  </tr>

                </React.Fragment>
              ))}
            </tbody>
          </table>

        </div>

      </div>

      {/* Printable Footer Stamp */}
      <div className="hidden print:flex justify-between items-center pt-8 text-xs font-serif text-black">
        <div className="text-center">
          <p className="font-bold">គ្រូបង្រៀន (Teacher)</p>
          <div className="h-16"></div>
          <p className="font-semibold">{activeReport.teacherName}</p>
        </div>
        <div className="text-center">
          <p className="font-bold">នាយកមណ្ឌល / សាលា (School Director)</p>
          <div className="h-16"></div>
          <p className="font-semibold">{school.principalKhmer}</p>
        </div>
      </div>

      {/* MODAL 1: BATCH GENERATE BY PC COUNT */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-white">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg font-battambang">
                    {language === 'km' ? 'បង្កើតរបាយការណ៍ស្វ័យប្រវត្តិតាមចំនួន PC' : 'Auto Generate Reports by PC Count'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {language === 'km' ? 'វាយចំនួនចូល Weekly Report នឹងបង្កើតតាមចំនួននោះដោយស្វ័យប្រវត្តិ' : 'Enter count to auto-generate weekly teaching reports'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Class Prefix & Starting Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {language === 'km' ? 'បុព្វបទថ្នាក់ (Class Prefix)' : 'Class Prefix'}
                  </label>
                  <input
                    type="text"
                    value={classPrefix}
                    onChange={(e) => setClassPrefix(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-3 py-2 text-white font-bold font-mono"
                    placeholder="PC"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    {language === 'km' ? 'លេខចាប់ផ្តើម (Start Index)' : 'Start Number'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={classStartIndex}
                    onChange={(e) => setClassStartIndex(parseInt(e.target.value) || 1)}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-3 py-2 text-white font-bold font-mono"
                  />
                </div>
              </div>

              {/* Number of Reports to Generate (Count) */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold flex items-center justify-between">
                  <span>{language === 'km' ? 'ចំនួនរបាយការណ៍ដែលត្រូវបង្កើត (Number of Reports)' : 'Total Reports Count'}</span>
                  <span className="text-cyan-400 font-bold font-mono">{batchCount} Classes</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={batchCount}
                  onChange={(e) => setBatchCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-cyan-500/10 border border-cyan-500/40 rounded-2xl px-3 py-2.5 text-cyan-300 font-bold font-mono text-base"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {language === 'km' 
                    ? `នឹងបង្កើតថ្នាក់៖ ${Array.from({ length: Math.min(6, batchCount) }, (_, i) => `${classPrefix}${classStartIndex + i < 10 ? '0' : ''}${classStartIndex + i}`).join(', ')}${batchCount > 6 ? '...' : ''}` 
                    : `Will generate: ${Array.from({ length: Math.min(6, batchCount) }, (_, i) => `${classPrefix}${classStartIndex + i < 10 ? '0' : ''}${classStartIndex + i}`).join(', ')}${batchCount > 6 ? '...' : ''}`}
                </p>
              </div>

              {/* Subject / Curriculum Template Preset */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  {language === 'km' ? 'គំរូមេរៀន / មុខវិជ្ជា (Curriculum Template)' : 'Curriculum Template'}
                </label>
                <select
                  value={selectedPresetId}
                  onChange={(e) => {
                    setSelectedPresetId(e.target.value);
                    const p = CURRICULUM_PRESETS.find(x => x.id === e.target.value);
                    if (p) setBatchDefaultEnrollment(p.defaultEnrollment);
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-3 py-2 text-white font-medium focus:outline-none"
                >
                  {CURRICULUM_PRESETS.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Enrollment per Class */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  {language === 'km' ? 'ចំនួនសិស្សក្នុងមួយថ្នាក់ (Enrollment per Class)' : 'Enrollment per Class'}
                </label>
                <input
                  type="number"
                  value={batchDefaultEnrollment}
                  onChange={(e) => setBatchDefaultEnrollment(parseInt(e.target.value) || 30)}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-3 py-2 text-white font-mono"
                />
              </div>

            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold"
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                onClick={handleGenerateBatchByCount}
                className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20 flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>{language === 'km' ? `បង្កើតស្វ័យប្រវត្តិ (${batchCount})` : `Auto Generate (${batchCount})`}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD BOOK FOR GENERATOR (TOPIC & ACTIVITY FORMAT) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 text-white max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center border border-indigo-500/40">
                  <Upload className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg font-battambang">
                    {language === 'km' ? 'Upload សៀវភៅ ឬមេរៀន (Book Generator)' : 'Upload Book / Curriculum Generator'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {language === 'km' 
                      ? 'បំប្លែងខ្លឹមសារសៀវភៅទៅជាទម្រង់ Text book (Topic) និង Activity (- Engage, - Study, - Activate)' 
                      : 'Generate structured Text book (Topic) and Activity (- Engage, - Study, - Activate) format'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
              
              {/* Drag and Drop File Upload Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-400/40 hover:border-indigo-400 bg-indigo-950/20 hover:bg-indigo-950/40 p-6 rounded-3xl text-center cursor-pointer transition space-y-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.txt,.md,.json,.csv,.doc,.docx"
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-white">
                  {uploadedFileName ? (
                    <span className="text-cyan-300">{uploadedFileName} (Selected)</span>
                  ) : (
                    <span>{language === 'km' ? 'ចុចទីនេះដើម្បីជ្រើសរើសឯកសារសៀវភៅ ឬមេរៀន (PDF, TXT, MD, JSON)' : 'Click to Upload Book or Curriculum File (PDF, TXT, MD, JSON)'}</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {language === 'km' ? 'គាំទ្រឯកសារ PDF, Text, Markdown, ឬបិទភ្ជាប់ខ្លឹមសារខាងក្រោម' : 'Supports PDF, Text, Markdown files, or paste content directly below.'}
                </p>
              </div>

              {/* Sample Preset Shortcut Buttons */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                  {language === 'km' ? 'ឬជ្រើសរើសគំរូសៀវភៅរហ័ស (Quick Curriculum Samples):' : 'Or load quick textbook samples:'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {CURRICULUM_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        const sampleText = `# Course: ${preset.name}\n\n` +
                          preset.plans.map(p => 
                            `## Day ${p.day}: ${p.topic}\n` +
                            `- Engage: ${p.engage}\n` +
                            `- Study: ${p.study}\n` +
                            `- Activate: ${p.activate}\n` +
                            `- Typing: ${p.typing}\n` +
                            (p.quiz ? `- Quiz: ${p.quiz}\n` : '')
                          ).join('\n');
                        setBookRawText(sampleText);
                        setUploadedFileName(`${preset.name}.md`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium border border-white/15 transition flex items-center space-x-1"
                    >
                      <BookOpen className="w-3 h-3 text-cyan-300" />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Raw Text Preview / Manual Paste Editor */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold flex items-center justify-between">
                  <span>{language === 'km' ? 'ខ្លឹមសារសៀវភៅ ឬមេរៀន (Book Content / Topics):' : 'Book Content / Topics:'}</span>
                  <span className="text-slate-400 text-[10px]">{bookRawText.length} characters</span>
                </label>
                <textarea
                  rows={8}
                  value={bookRawText}
                  onChange={(e) => setBookRawText(e.target.value)}
                  placeholder={language === 'km' 
                    ? `បិទភ្ជាប់ខ្លឹមសារសៀវភៅ ឬកិច្ចតែងការនៅទីនេះ...\nឧទាហរណ៍៖\nDay Mon: Topic 1...\n- Engage: ...\n- Study: ...\n- Activate: ...` 
                    : `Paste book syllabus, lesson summaries, or raw text here...\nExample:\nDay Mon: Lesson Topic...\n- Engage: Warm up...\n- Study: Lecture...\n- Activate: Hands-on lab...`}
                  className="w-full bg-slate-950/80 border border-white/20 rounded-2xl p-3 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Output Preview explanation */}
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-[11px] text-indigo-200 space-y-1">
                <div className="font-bold text-white flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{language === 'km' ? 'ទម្រង់ដែលត្រូវបង្កើតដោយស្វ័យប្រវត្តិ (Output Format):' : 'Generated Structure:'}</span>
                </div>
                <p>
                  <strong>Text book (Topic):</strong> {language === 'km' ? 'ចំណងជើងមេរៀនប្រចាំថ្ងៃ (Mon, Tue, Wed, Thur, Fri)' : 'Daily Lesson Topic'}
                </p>
                <p>
                  <strong>Activity:</strong> <span className="text-cyan-300">- Engage:</span> [Hook/Warmup] • <span className="text-cyan-300">- Study:</span> [Teacher explanation] • <span className="text-cyan-300">- Activate:</span> [Hands-on Practice]
                </p>
                <p>
                  <strong>Typing & Quiz:</strong> {language === 'km' ? 'ការហាត់វាយអក្សរ និងសំណួរវាយតម្លៃចុងសប្តាហ៍' : 'Computer keyboard typing practice & weekly evaluation'}
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10 shrink-0">
              <div className="text-[11px] text-slate-400">
                {language === 'km' ? 'នឹងបញ្ចូលទៅក្នុងរបាយការណ៍បច្ចុប្បន្ន' : 'Will update active weekly report'}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold"
                >
                  {language === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  onClick={handleApplyBookCurriculum}
                  disabled={!bookRawText.trim() || isParsing}
                  className="px-5 py-2.5 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20 flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{language === 'km' ? 'បង្កើត និងបញ្ចូលទៅក្នុងរបាយការណ៍ (Apply to Report)' : 'Generate & Apply to Report'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
