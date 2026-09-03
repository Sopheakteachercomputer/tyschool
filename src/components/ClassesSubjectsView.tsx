import React, { useState, useMemo, useEffect } from 'react';
import { 
  ClassRoom, 
  Subject, 
  Teacher, 
  Student, 
  TimetableSlot, 
  WeeklyQuizScore, 
  WeeklyReport, 
  SchoolProfile, 
  User, 
  Language 
} from '../types';
import { StorageService } from '../services/storageService';
import { isFemaleGender, isMaleGender, getGenderKhmer } from '../utils/formatters';
import { WeeklyQuizScoreListView } from './WeeklyQuizScoreListView';
import { 
  Building, 
  BookOpen, 
  Plus, 
  Users, 
  Clock, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2,
  Sparkles,
  Layers,
  Award,
  BookMarked,
  DoorOpen,
  Search,
  Filter,
  Calendar,
  Eye,
  Printer,
  GraduationCap,
  ChevronRight,
  Phone,
  UserCheck,
  Check,
  AlertTriangle,
  FileText,
  Monitor,
  Cpu,
  Database,
  Palette,
  Code2,
  Globe,
  FileSpreadsheet,
  Terminal,
  ExternalLink,
  Laptop,
  Keyboard,
  PenTool
} from 'lucide-react';

interface ClassesSubjectsViewProps {
  classes?: ClassRoom[];
  subjects?: Subject[];
  teachers?: Teacher[];
  students?: Student[];
  timetable?: TimetableSlot[];
  quizScores?: WeeklyQuizScore[];
  weeklyReports?: WeeklyReport[];
  school?: SchoolProfile;
  currentUser?: User | null;
  language?: Language;
  onSaveClass: (cls: ClassRoom) => void;
  onDeleteClass?: (id: string) => void;
  onSaveSubject: (subj: Subject) => void;
  onDeleteSubject?: (id: string) => void;
  onSaveTimetableSlot?: (slot: TimetableSlot) => void;
  onDeleteTimetableSlot?: (id: string) => void;
  onSaveQuizScores?: (scores: WeeklyQuizScore[]) => void;
  userRole?: string;
  searchTerm?: string;
  initialSubTab?: 'CLASSES' | 'SUBJECTS' | 'COMPUTER_SUITE' | 'TIMETABLE' | 'WEEKLY_QUIZ';
}

export const ClassesSubjectsView: React.FC<ClassesSubjectsViewProps> = ({
  classes = [],
  subjects = [],
  teachers = [],
  students = [],
  timetable: propTimetable,
  quizScores = [],
  weeklyReports = [],
  school,
  currentUser,
  language = 'km',
  onSaveClass,
  onDeleteClass,
  onSaveSubject,
  onDeleteSubject,
  onSaveTimetableSlot,
  onDeleteTimetableSlot,
  onSaveQuizScores,
  userRole = 'SUPER_ADMIN',
  searchTerm = '',
  initialSubTab
}) => {
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const [activeTab, setActiveTab] = useState<'CLASSES' | 'SUBJECTS' | 'COMPUTER_SUITE' | 'TIMETABLE' | 'WEEKLY_QUIZ'>(
    initialSubTab || 'CLASSES'
  );
  
  // Weekly Quiz Scores state
  const [localQuizScores, setLocalQuizScores] = useState<WeeklyQuizScore[]>(() => {
    if (quizScores && quizScores.length > 0) return quizScores;
    return StorageService.getWeeklyQuizScores();
  });

  useEffect(() => {
    if (quizScores && quizScores.length > 0) {
      setLocalQuizScores(quizScores);
    }
  }, [quizScores]);

  const [quizSelectedClass, setQuizSelectedClass] = useState<string>('ALL');

  const handleSaveQuizScores = (updatedScores: WeeklyQuizScore[]) => {
    setLocalQuizScores(updatedScores);
    StorageService.saveWeeklyQuizScoresBatch(updatedScores);
    if (onSaveQuizScores) {
      onSaveQuizScores(updatedScores);
    }
  };
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState(searchTerm);

  // Sync external search query
  useEffect(() => {
    if (searchTerm !== undefined) {
      setSearchQuery(searchTerm);
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const hasMatchingSubject = subjects.some(s => 
          (s.nameKhmer && s.nameKhmer.toLowerCase().includes(q)) || 
          (s.code && s.code.toLowerCase().includes(q)) || 
          (s.nameEnglish && s.nameEnglish.toLowerCase().includes(q))
        );
        const hasMatchingClass = classes.some(c => 
          (c.name && c.name.toLowerCase().includes(q)) || 
          (c.room && c.room.toLowerCase().includes(q))
        );
        if (hasMatchingSubject && !hasMatchingClass) {
          setActiveTab('SUBJECTS');
        }
      }
    }
  }, [searchTerm, subjects, classes]);
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [shiftFilter, setShiftFilter] = useState<string>('ALL');
  
  // Selected class for Roster modal & Timetable
  const [selectedClassForRoster, setSelectedClassForRoster] = useState<ClassRoom | null>(null);
  const [selectedTimetableClassId, setSelectedTimetableClassId] = useState<string>(classes[0]?.id || 'CLS-12A');

  // Modals state
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [syllabusSubject, setSyllabusSubject] = useState<Subject | null>(null);
  
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  // Safe delete dialog
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'CLASS' | 'SUBJECT' | 'TIMETABLE';
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: 'CLASS',
    id: '',
    title: ''
  });

  // In-app Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Timetable State
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(() => {
    return propTimetable && propTimetable.length > 0 ? propTimetable : StorageService.getTimetable();
  });

  useEffect(() => {
    if (propTimetable && propTimetable.length > 0) {
      setTimetableSlots(propTimetable);
    }
  }, [propTimetable]);

  // Class Form
  const [classForm, setClassForm] = useState<Partial<ClassRoom>>({
    name: 'ថ្នាក់ទី១២ C',
    grade: '12',
    academicYear: '2025-2026',
    room: 'បន្ទប់ A103',
    teacherId: teachers[0]?.id || '',
    teacherName: teachers[0]?.nameKhmer || '',
    capacity: 35,
    shift: 'MORNING',
    status: 'ACTIVE'
  });

  // Subject Form
  const [subjectForm, setSubjectForm] = useState<Partial<Subject>>({
    code: 'GEO-12',
    nameKhmer: 'ភូមិវិទ្យា',
    nameEnglish: 'Geography',
    grade: '12',
    credits: 2,
    totalHoursPerWeek: 2,
    description: ''
  });

  // Timetable Slot Form
  const [slotForm, setSlotForm] = useState<Partial<TimetableSlot>>({
    day: 'ចន្ទ',
    period: 1,
    timeRange: '07:00 - 07:50',
    classId: classes[0]?.id || '',
    subjectId: subjects[0]?.id || '',
    subjectNameKhmer: subjects[0]?.nameKhmer || '',
    teacherId: teachers[0]?.id || '',
    teacherName: teachers[0]?.nameKhmer || '',
    room: 'បន្ទប់ A101'
  });

  // Filtered Classes
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const matchesSearch = 
        cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cls.teacherName && cls.teacherName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesGrade = gradeFilter === 'ALL' || cls.grade === gradeFilter;
      const matchesShift = shiftFilter === 'ALL' || cls.shift === shiftFilter;

      return matchesSearch && matchesGrade && matchesShift;
    });
  }, [classes, searchQuery, gradeFilter, shiftFilter]);

  // Filtered Subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter(sub => {
      const matchesSearch = 
        sub.nameKhmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.nameEnglish && sub.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGrade = gradeFilter === 'ALL' || sub.grade === gradeFilter;

      return matchesSearch && matchesGrade;
    });
  }, [subjects, searchQuery, gradeFilter]);

  // Class Handlers
  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassForm({
      name: `ថ្នាក់ទី១២ ${String.fromCharCode(65 + classes.length)}`,
      grade: '12',
      academicYear: '2025-2026',
      room: `បន្ទប់ A10${classes.length + 1}`,
      teacherId: teachers[0]?.id || '',
      teacherName: teachers[0]?.nameKhmer || '',
      capacity: 35,
      shift: 'MORNING',
      status: 'ACTIVE'
    });
    setClassModalOpen(true);
  };

  const handleOpenEditClass = (cls: ClassRoom) => {
    setEditingClass(cls);
    setClassForm({
      name: cls.name,
      grade: cls.grade,
      academicYear: cls.academicYear || '2025-2026',
      room: cls.room,
      teacherId: cls.teacherId,
      teacherName: cls.teacherName,
      capacity: cls.capacity,
      shift: cls.shift || 'MORNING',
      status: cls.status || 'ACTIVE'
    });
    setClassModalOpen(true);
  };

  const handleSaveClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name?.trim()) {
      showToast('⚠️ សូមបញ្ចូលឈ្មោះថ្នាក់រៀន');
      return;
    }
    const t = teachers.find(tch => tch.id === classForm.teacherId);

    if (editingClass) {
      const updated: ClassRoom = {
        ...editingClass,
        name: classForm.name.trim(),
        grade: classForm.grade || '12',
        academicYear: classForm.academicYear || '2025-2026',
        room: classForm.room || 'បន្ទប់ A101',
        teacherId: classForm.teacherId || '',
        teacherName: t?.nameKhmer || classForm.teacherName || '',
        capacity: Number(classForm.capacity) || 35,
        shift: classForm.shift || 'MORNING',
        status: classForm.status || 'ACTIVE'
      };
      onSaveClass(updated);
      showToast(`✅ បានកែប្រែថ្នាក់ "${updated.name}" ដោយជោគជ័យ`);
    } else {
      const newCls: ClassRoom = {
        id: `CLS-${Date.now()}`,
        name: classForm.name.trim(),
        grade: classForm.grade || '12',
        academicYear: classForm.academicYear || '2025-2026',
        room: classForm.room || 'បន្ទប់ B101',
        teacherId: classForm.teacherId || '',
        teacherName: t?.nameKhmer || classForm.teacherName || '',
        capacity: Number(classForm.capacity) || 35,
        shift: classForm.shift || 'MORNING',
        status: 'ACTIVE'
      };
      onSaveClass(newCls);
      showToast(`✅ បានបង្កើតថ្នាក់រៀន "${newCls.name}" ដោយជោគជ័យ`);
    }
    setClassModalOpen(false);
  };

  // Subject Handlers
  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjectForm({
      code: `SUB-${String(subjects.length + 1).padStart(2, '0')}`,
      nameKhmer: '',
      nameEnglish: '',
      grade: '12',
      credits: 2,
      totalHoursPerWeek: 2,
      description: ''
    });
    setSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (subj: Subject) => {
    setEditingSubject(subj);
    setSubjectForm({
      code: subj.code,
      nameKhmer: subj.nameKhmer,
      nameEnglish: subj.nameEnglish || '',
      grade: subj.grade || '12',
      credits: subj.credits || 2,
      totalHoursPerWeek: subj.totalHoursPerWeek || 2,
      description: subj.description || ''
    });
    setSubjectModalOpen(true);
  };

  const handleSaveSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.nameKhmer?.trim() || !subjectForm.code?.trim()) {
      showToast('⚠️ សូមបញ្ចូលកូដ និងឈ្មោះមុខវិជ្ជា');
      return;
    }

    if (editingSubject) {
      const updated: Subject = {
        ...editingSubject,
        code: subjectForm.code.trim().toUpperCase(),
        nameKhmer: subjectForm.nameKhmer.trim(),
        nameEnglish: subjectForm.nameEnglish || '',
        grade: subjectForm.grade || '12',
        credits: Number(subjectForm.credits) || 2,
        totalHoursPerWeek: Number(subjectForm.totalHoursPerWeek) || 2,
        description: subjectForm.description || ''
      };
      onSaveSubject(updated);
      showToast(`✅ បានកែប្រែមុខវិជ្ជា "${updated.nameKhmer}"`);
    } else {
      const newSubj: Subject = {
        id: `SUB-${Date.now()}`,
        code: subjectForm.code.trim().toUpperCase(),
        nameKhmer: subjectForm.nameKhmer.trim(),
        nameEnglish: subjectForm.nameEnglish || '',
        grade: subjectForm.grade || '12',
        credits: Number(subjectForm.credits) || 2,
        totalHoursPerWeek: Number(subjectForm.totalHoursPerWeek) || 2,
        description: subjectForm.description || ''
      };
      onSaveSubject(newSubj);
      showToast(`✅ បានបន្ថែមមុខវិជ្ជា "${newSubj.nameKhmer}"`);
    }
    setSubjectModalOpen(false);
  };

  // Safe delete executor
  const handleConfirmDelete = () => {
    if (deleteConfirm.type === 'CLASS') {
      if (onDeleteClass) {
        onDeleteClass(deleteConfirm.id);
        showToast(`🗑️ បានលុបថ្នាក់រៀន "${deleteConfirm.title}"`);
      }
    } else if (deleteConfirm.type === 'SUBJECT') {
      if (onDeleteSubject) {
        onDeleteSubject(deleteConfirm.id);
        showToast(`🗑️ បានលុបមុខវិជ្ជា "${deleteConfirm.title}"`);
      }
    } else if (deleteConfirm.type === 'TIMETABLE') {
      if (onDeleteTimetableSlot) {
        onDeleteTimetableSlot(deleteConfirm.id);
      } else {
        StorageService.deleteTimetableSlot(deleteConfirm.id);
      }
      setTimetableSlots(StorageService.getTimetable());
      showToast(`🗑️ បានលុបម៉ោងសិក្សា "${deleteConfirm.title}"`);
    }
    setDeleteConfirm({ isOpen: false, type: 'CLASS', id: '', title: '' });
  };

  // Timetable Handlers
  const handleOpenAddSlot = () => {
    setEditingSlot(null);
    const targetCls = classes.find(c => c.id === selectedTimetableClassId) || classes[0];
    setSlotForm({
      day: 'ចន្ទ',
      period: 1,
      timeRange: '07:00 - 07:50',
      classId: targetCls?.id || '',
      subjectId: subjects[0]?.id || '',
      subjectNameKhmer: subjects[0]?.nameKhmer || '',
      teacherId: teachers[0]?.id || '',
      teacherName: teachers[0]?.nameKhmer || '',
      room: targetCls?.room || 'បន្ទប់ A101'
    });
    setSlotModalOpen(true);
  };

  const handleOpenEditSlot = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setSlotForm({
      day: slot.day,
      period: slot.period,
      timeRange: slot.timeRange,
      classId: slot.classId,
      subjectId: slot.subjectId,
      subjectNameKhmer: slot.subjectNameKhmer,
      teacherId: slot.teacherId,
      teacherName: slot.teacherName,
      room: slot.room
    });
    setSlotModalOpen(true);
  };

  const handleSaveSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSub = subjects.find(s => s.id === slotForm.subjectId);
    const targetTch = teachers.find(t => t.id === slotForm.teacherId);
    const targetCls = classes.find(c => c.id === (slotForm.classId || selectedTimetableClassId));

    const newSlot: TimetableSlot = {
      id: editingSlot ? editingSlot.id : `TT-${Date.now()}`,
      day: slotForm.day as any,
      period: Number(slotForm.period) || 1,
      timeRange: slotForm.timeRange || '07:00 - 07:50',
      classId: targetCls?.id || selectedTimetableClassId,
      className: targetCls?.name || 'ថ្នាក់រៀន',
      subjectId: targetSub?.id || '',
      subjectNameKhmer: targetSub?.nameKhmer || slotForm.subjectNameKhmer || '',
      teacherId: targetTch?.id || '',
      teacherName: targetTch?.nameKhmer || slotForm.teacherName || '',
      room: slotForm.room || targetCls?.room || 'A101'
    };

    StorageService.saveTimetableSlot(newSlot);
    if (onSaveTimetableSlot) {
      onSaveTimetableSlot(newSlot);
    }
    setTimetableSlots(StorageService.getTimetable());
    showToast(`✅ បានកត់ត្រាកាលវិភាគ "${newSlot.subjectNameKhmer}" សម្រាប់ថ្ងៃ ${newSlot.day}`);
    setSlotModalOpen(false);
  };

  // Grade options
  const gradeOptions = [
    { value: 'ALL', label: 'ទាំងអស់ (All)' },
    { value: '12', label: 'ថ្នាក់ទី ១២' },
    { value: '11', label: 'ថ្នាក់ទី ១១' },
    { value: '10', label: 'ថ្នាក់ទី ១០' },
    { value: '9', label: 'ថ្នាក់ទី ៩' },
    { value: '8', label: 'ថ្នាក់ទី ៨' },
    { value: '7', label: 'ថ្នាក់ទី ៧' },
    { value: 'Computer', label: 'កុំព្យូទ័រ & កូដ' }
  ];

  const daysOfWeek = ['ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'] as const;
  const periods = [
    { num: 1, time: '07:00 - 07:50' },
    { num: 2, time: '07:55 - 08:45' },
    { num: 3, time: '09:00 - 09:50' },
    { num: 4, time: '09:55 - 10:45' },
    { num: 5, time: '10:50 - 11:40' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900/95 border border-indigo-500/40 text-white px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center space-x-3 text-xs font-battambang animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Stats Overview */}
      <div className="bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-battambang">
                ថ្នាក់រៀន មុខវិជ្ជា & កាលវិភាគ (Curriculum & Classes)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-battambang">
                គ្រប់គ្រងរចនាសម្ព័ន្ធថ្នាក់រៀន បន្ទប់សិក្សា កម្មវិធីសិក្សា MoEYS និងកាលវិភាគបង្រៀន
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-battambang block">ថ្នាក់រៀនសរុប</span>
            <span className="text-lg font-black text-white font-mono">{classes.length}</span>
          </div>
          <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-battambang block">មុខវិជ្ជាសិក្សា</span>
            <span className="text-lg font-black text-teal-400 font-mono">{subjects.length}</span>
          </div>
          <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-battambang block">សិស្សចុះឈ្មោះ</span>
            <span className="text-lg font-black text-indigo-400 font-mono">{students.length} នាក់</span>
          </div>
          <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-battambang block">លោកគ្រូ/អ្នកគ្រូ</span>
            <span className="text-lg font-black text-amber-400 font-mono">{teachers.length} នាក់</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation and Controls */}
      <div className="bg-slate-900/60 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Tab Buttons */}
        <div className="flex items-center space-x-1.5 p-1.5 bg-slate-950/60 rounded-2xl border border-white/5 font-battambang text-xs overflow-x-auto">
          <button
            onClick={() => { setActiveTab('CLASSES'); setSearchQuery(''); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'CLASSES'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>ថ្នាក់រៀនទាំងអស់ ({classes.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('SUBJECTS'); setSearchQuery(''); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'SUBJECTS'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>មុខវិជ្ជាទូទៅ ({subjects.filter(s => s.grade !== 'Computer').length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('COMPUTER_SUITE'); setSearchQuery(''); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'COMPUTER_SUITE'
                ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Monitor className="w-4 h-4 text-cyan-400" />
            <span>ថ្នាក់ & មុខវិជ្ជាកុំព្យូទ័រ (7 Suite & Labs)</span>
          </button>

          <button
            onClick={() => { setActiveTab('TIMETABLE'); setSearchQuery(''); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'TIMETABLE'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>កាលវិភាគប្រចាំសប្តាហ៍</span>
          </button>

          <button
            onClick={() => { setActiveTab('WEEKLY_QUIZ'); setSearchQuery(''); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'WEEKLY_QUIZ'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>ពិន្ទុតេស្តប្រចាំសប្តាហ៍ (Typing • Writing • Practice)</span>
            {localQuizScores.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/40 text-[10px] font-mono text-amber-300">
                {localQuizScores.length}
              </span>
            )}
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-2">
          {activeTab === 'WEEKLY_QUIZ' && (
            <button
              onClick={() => {
                setQuizSelectedClass('ALL');
                setActiveTab('WEEKLY_QUIZ');
              }}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-amber-500/20 font-battambang whitespace-nowrap"
            >
              <Award className="w-4 h-4" />
              <span>បញ្ចូល / គ្រប់គ្រងពិន្ទុតេស្ត</span>
            </button>
          )}

          {activeTab === 'CLASSES' && (
            <button
              onClick={handleOpenAddClass}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-500/20 font-battambang whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ បង្កើតថ្នាក់រៀនថ្មី</span>
            </button>
          )}

          {activeTab === 'SUBJECTS' && (
            <button
              onClick={handleOpenAddSubject}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20 font-battambang whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ បន្ថែមមុខវិជ្ជាថ្មី</span>
            </button>
          )}

          {activeTab === 'COMPUTER_SUITE' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setEditingSubject(null);
                  setSubjectForm({
                    code: 'COMP-2026',
                    nameKhmer: 'មុខវិជ្ជាកុំព្យូទ័រថ្មី',
                    nameEnglish: 'New Computer Course',
                    grade: 'Computer',
                    credits: 3,
                    totalHoursPerWeek: 4,
                    description: 'ជំនាញអនុវត្តជាក់ស្តែងក្នុងបន្ទប់កុំព្យូទ័រ Lab'
                  });
                  setSubjectModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-500/20 font-battambang whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>+ បន្ថែមមុខវិជ្ជាកុំព្យូទ័រ</span>
              </button>
              <button
                onClick={() => {
                  setEditingClass(null);
                  setClassForm({
                    name: 'ថ្នាក់កុំព្យូទ័រ C (Computer Lab 3)',
                    grade: 'Computer',
                    academicYear: '2025-2026',
                    room: 'បន្ទប់កុំព្យូទ័រ Lab 3 (អគារបច្ចេកវិទ្យា)',
                    teacherId: teachers.find(t => t.id === 'TCH-006')?.id || teachers[0]?.id || '',
                    teacherName: teachers.find(t => t.id === 'TCH-006')?.nameKhmer || 'អ្នកគ្រូ លី គឹមសួរ',
                    capacity: 30,
                    shift: 'MORNING',
                    status: 'ACTIVE'
                  });
                  setClassModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition font-battambang whitespace-nowrap"
              >
                <Laptop className="w-4 h-4 text-cyan-400" />
                <span>+ បង្កើតថ្នាក់ Lab ថ្មី</span>
              </button>
            </div>
          )}

          {activeTab === 'TIMETABLE' && (
            <button
              onClick={handleOpenAddSlot}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-orange-500/20 font-battambang whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ បន្ថែមម៉ោងកាលវិភាគ</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      {(activeTab === 'CLASSES' || activeTab === 'SUBJECTS') && (
        <div className="bg-slate-900/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-battambang">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'CLASSES' ? 'ស្វែងរកឈ្មោះថ្នាក់, បន្ទប់, គ្រូបន្ទុក...' : 'ស្វែងរកឈ្មោះមុខវិជ្ជា ឬ កូដមុខវិជ្ជា...'}
              className="w-full pl-9 pr-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-white placeholder-slate-500 outline-none focus:border-indigo-400 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Grade Filter */}
            <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto">
              <span className="text-[10px] text-slate-400 px-2 flex items-center gap-1">
                <Filter className="w-3 h-3" /> កម្រិត:
              </span>
              <select
                value={gradeFilter}
                onChange={e => setGradeFilter(e.target.value)}
                className="bg-transparent text-white text-xs outline-none cursor-pointer pr-2"
              >
                {gradeOptions.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Shift Filter (Classes only) */}
            {activeTab === 'CLASSES' && (
              <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 px-2">វេន:</span>
                <select
                  value={shiftFilter}
                  onChange={e => setShiftFilter(e.target.value)}
                  className="bg-transparent text-white text-xs outline-none cursor-pointer pr-2"
                >
                  <option value="ALL" className="bg-slate-900 text-white">ទាំងអស់ (All Shifts)</option>
                  <option value="MORNING" className="bg-slate-900 text-white">☀️ វេនព្រឹក</option>
                  <option value="AFTERNOON" className="bg-slate-900 text-white">⛅ វេនរសៀល</option>
                  <option value="FULL_DAY" className="bg-slate-900 text-white">🌕 ពេញមួយថ្ងៃ</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: CLASSES DIRECTORY */}
      {/* ========================================================= */}
      {activeTab === 'CLASSES' && (
        <div className="space-y-4">
          {filteredClasses.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-white/10">
              <Building className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-white font-bold font-battambang">មិនមានថ្នាក់រៀនស្របតាមលក្ខខណ្ឌស្វែងរកឡើយ</h3>
              <p className="text-xs text-slate-400 mt-1 font-battambang">សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬចុចបង្កើតថ្នាក់រៀនថ្មី</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredClasses.map(cls => {
                const classStudents = students.filter(s => s.classId === cls.id);
                const teacher = teachers.find(t => t.id === cls.teacherId);
                const capacity = cls.capacity || 35;
                const occupancyPercent = Math.min(100, Math.round((classStudents.length / capacity) * 100));
                
                const femaleCount = classStudents.filter(s => isFemaleGender(s.gender)).length;
                const maleCount = classStudents.filter(s => isMaleGender(s.gender)).length;

                return (
                  <div
                    key={cls.id}
                    className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg p-5 flex flex-col justify-between hover:border-indigo-500/40 transition group hover:shadow-indigo-500/5"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-bold text-indigo-300 font-mono">
                          កម្រិតទី {cls.grade}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-battambang">
                          {cls.shift === 'MORNING' ? '☀️ វេនព្រឹក' : cls.shift === 'AFTERNOON' ? '⛅ វេនរសៀល' : '🌕 ពេញមួយថ្ងៃ'}
                        </span>
                      </div>

                      {/* Class Title */}
                      <h3 className="font-bold text-white text-lg font-battambang leading-snug group-hover:text-indigo-300 transition">
                        {cls.name}
                      </h3>

                      {/* Meta Information */}
                      <div className="mt-3.5 space-y-2.5 text-xs font-battambang text-slate-300">
                        <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-xl">
                          <DoorOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span className="font-medium text-white truncate">{cls.room}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400 font-mono text-[11px]">ចំណុះ {capacity} នាក់</span>
                        </div>

                        <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-xl">
                          {teacher?.photo ? (
                            <img src={teacher.photo} alt={teacher.nameKhmer} className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <Users className="w-4 h-4 text-teal-400 shrink-0" />
                          )}
                          <span className="text-slate-300 truncate">
                            គ្រូបន្ទុក: <strong className="text-white">{cls.teacherName || teacher?.nameKhmer || 'មិនទាន់ចាត់តាំង'}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Occupancy Progress Bar */}
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between text-[11px] font-battambang mb-1.5">
                          <span className="text-slate-400">ចំនួនសិស្សក្នុងថ្នាក់:</span>
                          <span className="font-bold text-white font-mono">
                            {classStudents.length} / {capacity} ({occupancyPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              occupancyPercent >= 90
                                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                                : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                            }`}
                            style={{ width: `${occupancyPercent}%` }}
                          />
                        </div>

                        {/* Gender Breakdown */}
                        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-battambang">
                          <span>ស្រី: <strong className="text-rose-300 font-mono">{femaleCount}</strong> នាក់</span>
                          <span>ប្រុស: <strong className="text-sky-300 font-mono">{maleCount}</strong> នាក់</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedClassForRoster(cls)}
                        className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-bold font-battambang transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>បញ្ជីសិស្ស ({classStudents.length})</span>
                      </button>

                      <button
                        onClick={() => {
                          setQuizSelectedClass(cls.name);
                          setActiveTab('WEEKLY_QUIZ');
                        }}
                        className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/25 transition"
                        title="ពិន្ទុតេស្តប្រចាំសប្តាហ៍ (Weekly Quiz: Typing, Practice, Writing)"
                      >
                        <Award className="w-4 h-4 text-amber-400" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTimetableClassId(cls.id);
                          setActiveTab('TIMETABLE');
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition"
                        title="កាលវិភាគថ្នាក់"
                      >
                        <Calendar className="w-4 h-4 text-amber-400" />
                      </button>

                      <button
                        onClick={() => handleOpenEditClass(cls)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition"
                        title="កែប្រែថ្នាក់រៀន"
                      >
                        <Edit3 className="w-4 h-4 text-indigo-300" />
                      </button>

                      <button
                        onClick={() => {
                          setDeleteConfirm({
                            isOpen: true,
                            type: 'CLASS',
                            id: cls.id,
                            title: cls.name
                          });
                        }}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition"
                        title="លុបថ្នាក់"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SUBJECTS CURRICULUM */}
      {/* ========================================================= */}
      {activeTab === 'SUBJECTS' && (
        <div className="space-y-4">
          {/* Weekly Quiz Skills Assessment Banner in Subjects */}
          <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-amber-500/20 rounded-3xl p-5 mb-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  ការវាយតម្លៃពិន្ទុតេស្តប្រចាំសប្តាហ៍ (Weekly Quiz Assessment)
                </span>
                <span className="text-xs text-slate-400 font-mono">Friday Quiz Session</span>
              </div>
              <h3 className="text-white font-bold text-base font-battambang flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>ពិន្ទុតេស្តជំនាញទាំង ៣ (Typing • Writing • Practice) ក្នុងមុខវិជ្ជា & ថ្នាក់រៀន</span>
              </h3>
              <p className="text-xs text-slate-300 font-battambang max-w-3xl">
                មុខវិជ្ជាវាយអត្ថបទកុំព្យូទ័រ (Typing), តែងសេចក្តី & ទ្រឹស្តីសរសេរ (Writing) និងការអនុវត្តជាក់ស្តែងក្នុងបន្ទប់ Lab (Hands-on Practice) ត្រូវបានវាយតម្លៃជារៀងរាល់ថ្ងៃសុក្រ ដោយគណនាពិន្ទុសរុប មធ្យមភាគ និងចំណាត់ថ្នាក់សិស្សដោយស្វ័យប្រវត្តិ។
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setActiveTab('WEEKLY_QUIZ')}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-amber-500/20 font-battambang whitespace-nowrap"
              >
                <Award className="w-4 h-4" />
                <span>បើកពិន្ទុតេស្តប្រចាំសប្តាហ៍</span>
              </button>
            </div>
          </div>

          {filteredSubjects.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-white/10">
              <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-white font-bold font-battambang">មិនមានមុខវិជ្ជាស្របតាមលក្ខខណ្ឌស្វែងរកឡើយ</h3>
              <p className="text-xs text-slate-400 mt-1 font-battambang">សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬបន្ថែមមុខវិជ្ជាថ្មី</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSubjects.map(sub => {
                // Find teachers who specialize in this subject
                const specializedTeachers = teachers.filter(t => 
                  (t.subjectSpecialty && t.subjectSpecialty.toLowerCase().includes(sub.nameKhmer.toLowerCase())) ||
                  (t.assignedSubjectIds && t.assignedSubjectIds.includes(sub.id))
                );

                return (
                  <div
                    key={sub.id}
                    className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg p-5 flex flex-col justify-between hover:border-teal-500/40 transition group hover:shadow-teal-500/5"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[11px] font-mono font-bold text-teal-300">
                          {sub.code}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-[10px] font-mono">
                          កម្រិតទី {sub.grade || '12'}
                        </span>
                      </div>

                      {/* Subject Names */}
                      <h3 className="font-bold text-white text-lg font-battambang leading-snug group-hover:text-teal-300 transition">
                        {sub.nameKhmer}
                      </h3>
                      {sub.nameEnglish && (
                        <p className="text-xs text-slate-400 italic mt-0.5 font-sans">{sub.nameEnglish}</p>
                      )}

                      {/* Credits and Hours */}
                      <div className="flex items-center space-x-2.5 mt-3 text-xs font-battambang text-slate-300">
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 font-mono text-amber-300">
                          ⚡ {sub.credits || 2} ក្រេឌីត
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 font-mono text-emerald-300">
                          ⏱️ {sub.totalHoursPerWeek || 2} ម៉ោង/សប្តាហ៍
                        </span>
                      </div>

                      {/* Description */}
                      {sub.description && (
                        <p className="text-xs text-slate-300 font-battambang mt-3 leading-relaxed line-clamp-3 bg-white/5 p-2.5 rounded-xl border border-white/5">
                          {sub.description}
                        </p>
                      )}

                      {/* Specialized Teachers */}
                      {specializedTeachers.length > 0 && (
                        <div className="mt-3 text-[11px] font-battambang text-slate-400">
                          <span>គ្រូបង្រៀនជំនាញ: </span>
                          <span className="text-slate-200">
                            {specializedTeachers.map(t => t.nameKhmer).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-battambang">
                      <span className="text-[10px] text-slate-400">MoEYS Curriculum Standard</span>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEditSubject(sub)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition"
                          title="កែប្រែមុខវិជ្ជា"
                        >
                          <Edit3 className="w-4 h-4 text-teal-300" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setDeleteConfirm({
                              isOpen: true,
                              type: 'SUBJECT',
                              id: sub.id,
                              title: sub.nameKhmer
                            });
                          }}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition"
                          title="លុបមុខវិជ្ជា"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: COMPUTER SUITE (7 CURRICULUM SUBJECTS & LABS) */}
      {/* ========================================================= */}
      {activeTab === 'COMPUTER_SUITE' && (
        <div className="space-y-6">
          {/* Showcase Hero Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-indigo-950/80 p-6 md:p-8 rounded-3xl border border-cyan-500/30 shadow-2xl backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600/10 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold font-mono">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>ICT & COMPUTER SCIENCE CURRICULUM 2026</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white font-battambang tracking-wide">
                  កម្មវិធីសិក្សាកុំព្យូទ័រ & បច្ចេកវិទ្យាឌីជីថល (7 Computer Subjects Suite)
                </h2>
                <p className="text-xs md:text-sm text-slate-300 font-battambang leading-relaxed">
                  បំពាក់បំប៉នជំនាញកុំព្យូទ័ររដ្ឋបាល ការរចនាក្រាហ្វិក មូលដ្ឋានទិន្នន័យ ការសរសេរកូដ និងបញ្ញាសិប្បនិម្មិត AI ដោយអនុវត្តផ្ទាល់លើកុំព្យូទ័រទំនើបក្នុងបន្ទប់ពិសោធន៍ Computer Labs។
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-battambang">
                  <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-white">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>គ្រូបន្ទុកឯកទេស: <strong>អ្នកគ្រូ លី គឹមសួរ</strong> (ព័ត៌មានវិទ្យា & IT)</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-white">
                    <DoorOpen className="w-4 h-4 text-indigo-400" />
                    <span>ទីតាំង: <strong>បន្ទប់កុំព្យូទ័រ Lab 1 & Lab 2</strong></span>
                  </div>
                </div>
              </div>

              {/* Lab Stats Pill Card */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 shrink-0">
                <div className="p-4 bg-slate-950/70 border border-cyan-500/30 rounded-2xl text-center shadow-lg">
                  <span className="text-[10px] text-cyan-300/80 font-battambang block">មុខវិជ្ជាកុំព្យូទ័រ</span>
                  <span className="text-3xl font-black text-cyan-400 font-mono">7</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-battambang">មុខវិជ្ជាឯកទេស</span>
                </div>
                <div className="p-4 bg-slate-950/70 border border-indigo-500/30 rounded-2xl text-center shadow-lg">
                  <span className="text-[10px] text-indigo-300/80 font-battambang block">បន្ទប់ពិសោធន៍</span>
                  <span className="text-3xl font-black text-indigo-400 font-mono">2</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-battambang">Lab 1 & Lab 2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Computer Classes & Labs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2 font-battambang">
                <Laptop className="w-5 h-5 text-cyan-400" />
                <span>ថ្នាក់កុំព្យូទ័រ & បន្ទប់ពិសោធន៍ (Computer Classes & Labs)</span>
              </h3>
              <span className="text-xs text-slate-400 font-battambang">
                សរុប {classes.filter(c => c.grade === 'Computer').length} ថ្នាក់
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {classes.filter(c => c.grade === 'Computer').map(cls => {
                const classStudents = students.filter(s => s.classId === cls.id);
                const capacity = cls.capacity || 30;
                const occupancyPercent = Math.min(100, Math.round((classStudents.length / capacity) * 100));

                return (
                  <div
                    key={cls.id}
                    className="bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-blue-950/40 rounded-3xl border border-cyan-500/30 shadow-xl p-5 flex flex-col justify-between hover:border-cyan-400/60 transition group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-xs font-bold text-cyan-300 font-mono">
                          {cls.id}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold font-battambang">
                          {cls.shift === 'MORNING' ? '☀️ វេនព្រឹក (07:30 - 11:00)' : cls.shift === 'AFTERNOON' ? '⛅ វេនរសៀល (13:30 - 17:00)' : '🌕 ពេញមួយថ្ងៃ'}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-lg font-battambang group-hover:text-cyan-300 transition">
                        {cls.name}
                      </h4>

                      <div className="mt-3.5 space-y-2 text-xs font-battambang text-slate-300">
                        <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-xl">
                          <DoorOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="font-medium text-white">{cls.room}</span>
                        </div>

                        <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-xl">
                          <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span className="text-slate-300">
                            គ្រូបន្ទុក: <strong className="text-white">{cls.teacherName || 'អ្នកគ្រូ លី គឹមសួរ'}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between text-[11px] font-battambang mb-1.5">
                          <span className="text-slate-400">ចំនួនកុំព្យូទ័រ & កៅអីសិស្ស:</span>
                          <span className="font-bold text-cyan-300 font-mono">
                            {classStudents.length} / {capacity} នាក់ ({occupancyPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${occupancyPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedClassForRoster(cls)}
                        className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-battambang transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>បញ្ជីរាយនាមសិស្ស ({classStudents.length})</span>
                      </button>

                      <button
                        onClick={() => {
                          setQuizSelectedClass(cls.name);
                          setActiveTab('WEEKLY_QUIZ');
                        }}
                        className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition"
                        title="ពិន្ទុតេស្តប្រចាំសប្តាហ៍ (Weekly Quiz: Typing, Practice, Writing)"
                      >
                        <Award className="w-4 h-4 text-amber-400" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTimetableClassId(cls.id);
                          setActiveTab('TIMETABLE');
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 border border-white/10 transition"
                        title="កាលវិភាគកុំព្យូទ័រ"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditClass(cls)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
                        title="កែប្រែថ្នាក់"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: 7 Computer Curriculum Subjects Showcase */}
          <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2 font-battambang">
                  <Monitor className="w-5 h-5 text-cyan-400" />
                  <span>បញ្ជីមុខវិជ្ជាកុំព្យូទ័រទាំង ៧ (7 Computer Curriculum Suite)</span>
                </h3>
                <p className="text-xs text-slate-400 font-battambang">
                  កម្មវិធីសិក្សាអនុវត្តជាក់ស្តែងស្របតាមតម្រូវការទីផ្សារការងារឌីជីថល និងសហគ្រិនភាព
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.filter(s => s.grade === 'Computer').map((sub, index) => {
                // Determine icon and color accents
                let IconComponent = Monitor;
                let badgeGradient = 'from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30';
                let tagList = ['Lab Practice', 'Hands-on', 'Certificate'];

                if (sub.code.includes('OFFICE')) {
                  IconComponent = FileSpreadsheet;
                  badgeGradient = 'from-blue-500/20 to-sky-500/20 text-sky-300 border-sky-500/30';
                  tagList = ['Ms Word', 'Ms Excel', 'PowerPoint', 'Office Admin'];
                } else if (sub.code.includes('ACCESS')) {
                  IconComponent = Database;
                  badgeGradient = 'from-rose-500/20 to-red-500/20 text-rose-300 border-rose-500/30';
                  tagList = ['Tables', 'SQL Queries', 'Forms', 'Reports DB'];
                } else if (sub.code.includes('ADV-EXCEL')) {
                  IconComponent = FileSpreadsheet;
                  badgeGradient = 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30';
                  tagList = ['XLOOKUP', 'Pivot Table', 'Power Query', 'Dashboards'];
                } else if (sub.code.includes('CORELDRAW')) {
                  IconComponent = Palette;
                  badgeGradient = 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30';
                  tagList = ['Vector Art', 'Logo Design', 'Print Banners', 'Typography'];
                } else if (sub.code.includes('PHOTOSHOP')) {
                  IconComponent = Layers;
                  badgeGradient = 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30';
                  tagList = ['Retouching', 'Masking', 'Generative AI', 'Marketing'];
                } else if (sub.code.includes('CODING')) {
                  IconComponent = Code2;
                  badgeGradient = 'from-purple-500/20 to-fuchsia-500/20 text-purple-300 border-purple-500/30';
                  tagList = ['Scratch 3.0', 'Micro:bit', 'Robotics', 'Algorithms'];
                } else if (sub.code.includes('INTERNET')) {
                  IconComponent = Globe;
                  badgeGradient = 'from-teal-500/20 to-emerald-500/20 text-teal-300 border-teal-500/30';
                  tagList = ['Cyber Security', 'Google Workspace', 'Canva AI', 'Digital Media'];
                }

                return (
                  <div
                    key={sub.id}
                    className="bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-cyan-500/40 p-5 flex flex-col justify-between transition group shadow-xl hover:shadow-cyan-500/5"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-1 rounded-xl bg-gradient-to-r ${badgeGradient} border text-xs font-mono font-bold flex items-center space-x-1.5`}>
                          <IconComponent className="w-3.5 h-3.5" />
                          <span>{sub.code}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-[10px] font-mono">
                          កុំព្យូទ័រ & IT
                        </span>
                      </div>

                      {/* Subject Name */}
                      <h4 className="font-bold text-white text-base font-battambang group-hover:text-cyan-300 transition">
                        {sub.nameKhmer}
                      </h4>
                      {sub.nameEnglish && (
                        <p className="text-[11px] text-slate-400 italic mt-0.5 font-sans">
                          {sub.nameEnglish}
                        </p>
                      )}

                      {/* Description */}
                      <p className="text-xs text-slate-300 font-battambang mt-3 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/5">
                        {sub.description}
                      </p>

                      {/* Module tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {tagList.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-lg bg-slate-950/80 border border-white/10 text-[10px] font-mono text-slate-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Credits and Hours */}
                      <div className="flex items-center space-x-2 mt-3.5 text-xs font-battambang">
                        <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/5 text-amber-300 font-mono text-[11px]">
                          ⚡ {sub.credits || 3} ក្រេឌីត
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/5 text-cyan-300 font-mono text-[11px]">
                          ⏱️ {sub.totalHoursPerWeek || 4} ម៉ោង/សប្តាហ៍
                        </span>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-battambang">
                      <span className="text-[10px] text-slate-400">គ្រូបង្រៀន: អ្នកគ្រូ លី គឹមសួរ</span>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEditSubject(sub)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/5 transition"
                          title="កែប្រែមុខវិជ្ជា"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirm({
                              isOpen: true,
                              type: 'SUBJECT',
                              id: sub.id,
                              title: sub.nameKhmer
                            });
                          }}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition"
                          title="លុបមុខវិជ្ជា"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: TIMETABLE SCHEDULE */}
      {/* ========================================================= */}
      {activeTab === 'TIMETABLE' && (
        <div className="space-y-5">
          {/* Class selector bar */}
          <div className="bg-slate-900/60 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-battambang text-xs">
            <div className="flex items-center space-x-3">
              <span className="text-slate-400 font-medium">ជ្រើសរើសថ្នាក់រៀន:</span>
              <select
                value={selectedTimetableClassId}
                onChange={e => setSelectedTimetableClassId(e.target.value)}
                className="px-3.5 py-2 bg-slate-950/80 rounded-xl border border-indigo-500/40 text-white font-bold outline-none focus:border-indigo-400"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.room})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold font-battambang transition"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-400" />
                <span>បោះពុម្ពកាលវិភាគ</span>
              </button>
              <span className="text-slate-400 text-[11px] hidden sm:inline">កាលវិភាគបង្រៀនប្រចាំសប្តាហ៍ (ចន្ទ ដល់ សៅរ៍)</span>
            </div>
          </div>

          {/* Timetable Grid */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl overflow-hidden font-battambang">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-white/10">
                    <th className="py-3 px-4 w-28 text-center font-bold">ម៉ោងសិក្សា</th>
                    {daysOfWeek.map(day => (
                      <th key={day} className="py-3 px-4 text-center font-bold text-white border-l border-white/5">
                        ថ្ងៃ {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {periods.map(period => (
                    <tr key={period.num} className="hover:bg-white/[0.02] transition">
                      {/* Period Time Column */}
                      <td className="py-3.5 px-3 bg-slate-950/40 text-center font-mono text-[11px] text-slate-400 border-r border-white/10">
                        <div className="font-bold text-indigo-300">ម៉ោងទី {period.num}</div>
                        <div className="text-[10px] text-slate-500">{period.time}</div>
                      </td>

                      {/* Day Columns */}
                      {daysOfWeek.map(day => {
                        const slot = timetableSlots.find(s => 
                          s.classId === selectedTimetableClassId && 
                          s.day === day && 
                          s.period === period.num
                        );

                        return (
                          <td key={day} className="p-2.5 border-l border-white/5 align-top min-w-[140px]">
                            {slot ? (
                              <div className="group/slot relative bg-gradient-to-br from-indigo-950/70 via-slate-900/80 to-slate-800/70 p-2.5 rounded-2xl border border-indigo-500/25 shadow-sm hover:border-indigo-400/60 transition space-y-1">
                                <div className="flex items-start justify-between gap-1">
                                  <div className="font-bold text-white text-xs truncate flex-1">
                                    {slot.subjectNameKhmer}
                                  </div>
                                  <div className="flex items-center space-x-1 opacity-0 group-hover/slot:opacity-100 transition shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditSlot(slot);
                                      }}
                                      className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-amber-300 hover:text-white transition"
                                      title="កែប្រែម៉ោងនេះ"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirm({
                                          isOpen: true,
                                          type: 'TIMETABLE',
                                          id: slot.id,
                                          title: `${slot.subjectNameKhmer} (ថ្ងៃ${slot.day} ម៉ោងទី${slot.period})`
                                        });
                                      }}
                                      className="p-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition"
                                      title="លុបម៉ោងនេះ"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                <div className="text-[11px] text-slate-300 flex items-center space-x-1 truncate">
                                  <Users className="w-3 h-3 text-teal-400 shrink-0" />
                                  <span className="truncate">{slot.teacherName || 'គ្រូមិនស្គាល់'}</span>
                                </div>
                                <div className="text-[10px] text-indigo-300 font-mono flex items-center justify-between pt-1 border-t border-white/5">
                                  <span>{slot.room || 'បន្ទប់'}</span>
                                  <span className="text-[9px] text-slate-400 font-bold">P{period.num}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full min-h-[64px] rounded-2xl border border-dashed border-white/5 flex items-center justify-center p-2 text-slate-600 hover:text-slate-400 hover:border-white/15 transition cursor-pointer"
                                onClick={() => {
                                  const targetCls = classes.find(c => c.id === selectedTimetableClassId);
                                  setSlotForm({
                                    day,
                                    period: period.num,
                                    timeRange: period.time,
                                    classId: selectedTimetableClassId,
                                    subjectId: subjects[0]?.id || '',
                                    subjectNameKhmer: subjects[0]?.nameKhmer || '',
                                    teacherId: teachers[0]?.id || '',
                                    teacherName: teachers[0]?.nameKhmer || '',
                                    room: targetCls?.room || 'A101'
                                  });
                                  setSlotModalOpen(true);
                                }}
                              >
                                <span className="text-[10px]">+ ចុចបន្ថែម</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: WEEKLY QUIZ SCORES (TYPING, WRITING, PRACTICE) */}
      {/* ========================================================= */}
      {activeTab === 'WEEKLY_QUIZ' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Weekly Quiz Sub-Header Card */}
          <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-cyan-500/15 border border-amber-500/30 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  តេស្តប្រចាំសប្តាហ៍ (Weekly Evaluation)
                </span>
                <span className="text-xs text-slate-400 font-mono">Friday Quiz Session</span>
              </div>
              <h2 className="text-xl font-bold text-white font-battambang flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>ពិន្ទុតេស្តប្រចាំសប្តាហ៍ (Weekly Quiz Score: Typing, Practice, Writing)</span>
              </h2>
              <p className="text-xs text-slate-300 font-battambang">
                ការគ្រប់គ្រង និងកត់ត្រាពិន្ទុតេស្តប្រចាំថ្ងៃសុក្រសម្រាប់សិស្សតាមថ្នាក់រៀននីមួយៗ លើមុខវិជ្ជា/ជំនាញស្នូលទាំង ៣៖ វាយអត្ថបទ (Typing), អនុវត្តកូដ/កុំព្យូទ័រ (Practice), និងសំណេរទ្រឹស្តី (Writing)។
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setActiveTab('CLASSES')}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold font-battambang transition"
              >
                <Building className="w-3.5 h-3.5" />
                <span>ត្រឡប់ទៅថ្នាក់រៀន</span>
              </button>
              <button
                onClick={() => setActiveTab('SUBJECTS')}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-bold font-battambang transition"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>មុខវិជ្ជា</span>
              </button>
            </div>
          </div>

          {/* Integrated Weekly Quiz Score List View */}
          <WeeklyQuizScoreListView
            quizScores={localQuizScores}
            students={students}
            classes={classes}
            weeklyReports={weeklyReports}
            school={school}
            currentUser={currentUser}
            userRole={userRole}
            language={language}
            initialSelectedClass={quizSelectedClass !== 'ALL' ? quizSelectedClass : undefined}
            onSaveScores={handleSaveQuizScores}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT CLASS */}
      {/* ========================================================= */}
      {classModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-battambang text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Building className="w-5 h-5 text-indigo-400" />
                <span>{editingClass ? 'កែប្រែព័ត៌មានថ្នាក់រៀន' : 'បង្កើតថ្នាក់រៀនថ្មី'}</span>
              </h3>
              <button onClick={() => setClassModalOpen(false)} className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClassSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">ឈ្មោះថ្នាក់រៀន (Class Name)*</label>
                <input
                  type="text"
                  required
                  value={classForm.name}
                  onChange={e => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="ឧ. ថ្នាក់ទី១២ A"
                  className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">កម្រិតថ្នាក់ (Grade)*</label>
                  <select
                    value={classForm.grade}
                    onChange={e => setClassForm({ ...classForm, grade: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                  >
                    <option value="7">ថ្នាក់ទី ៧</option>
                    <option value="8">ថ្នាក់ទី ៨</option>
                    <option value="9">ថ្នាក់ទី ៩</option>
                    <option value="10">ថ្នាក់ទី ១០</option>
                    <option value="11">ថ្នាក់ទី ១១</option>
                    <option value="12">ថ្នាក់ទី ១២</option>
                    <option value="Computer">កុំព្យូទ័រ & កូដ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">បន្ទប់សិក្សា (Room)</label>
                  <input
                    type="text"
                    value={classForm.room}
                    onChange={e => setClassForm({ ...classForm, room: e.target.value })}
                    placeholder="ឧ. បន្ទប់ A101"
                    className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">គ្រូបន្ទុកថ្នាក់ (Homeroom Teacher)</label>
                <select
                  value={classForm.teacherId}
                  onChange={e => setClassForm({ ...classForm, teacherId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                >
                  <option value="">មិនទាន់ចាត់តាំង</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nameKhmer} ({t.subjectSpecialty || t.position})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ចំណុះសិស្សអតិបរមា</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={classForm.capacity}
                    onChange={e => setClassForm({ ...classForm, capacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">វេនសិក្សា (Shift)</label>
                  <select
                    value={classForm.shift}
                    onChange={e => setClassForm({ ...classForm, shift: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-indigo-400"
                  >
                    <option value="MORNING">☀️ វេនព្រឹក</option>
                    <option value="AFTERNOON">⛅ វេនរសៀល</option>
                    <option value="FULL_DAY">🌕 ពេញមួយថ្ងៃ</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setClassModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20"
                >
                  រក្សាទុកថ្នាក់រៀន
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ADD / EDIT SUBJECT */}
      {/* ========================================================= */}
      {subjectModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-battambang text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-teal-400" />
                <span>{editingSubject ? 'កែប្រែមុខវិជ្ជា' : 'បន្ថែមមុខវិជ្ជាថ្មី'}</span>
              </h3>
              <button onClick={() => setSubjectModalOpen(false)} className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubjectSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">កូដមុខវិជ្ជា (Code)*</label>
                  <input
                    type="text"
                    required
                    value={subjectForm.code}
                    onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    placeholder="ឧ. MATH-12"
                    className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-teal-300 font-mono font-bold outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">កម្រិតថ្នាក់</label>
                  <select
                    value={subjectForm.grade}
                    onChange={e => setSubjectForm({ ...subjectForm, grade: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-teal-400"
                  >
                    <option value="7">ថ្នាក់ទី ៧</option>
                    <option value="8">ថ្នាក់ទី ៨</option>
                    <option value="9">ថ្នាក់ទី ៩</option>
                    <option value="10">ថ្នាក់ទី ១០</option>
                    <option value="11">ថ្នាក់ទី ១១</option>
                    <option value="12">ថ្នាក់ទី ១២</option>
                    <option value="Computer">កុំព្យូទ័រ & កូដ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ឈ្មោះមុខវិជ្ជា (ខ្មែរ)*</label>
                <input
                  type="text"
                  required
                  value={subjectForm.nameKhmer}
                  onChange={e => setSubjectForm({ ...subjectForm, nameKhmer: e.target.value })}
                  placeholder="ឧ. គណិតវិទ្យា ឬ រូបវិទ្យា"
                  className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ឈ្មោះជាភាសាអង់គ្លេស</label>
                <input
                  type="text"
                  value={subjectForm.nameEnglish}
                  onChange={e => setSubjectForm({ ...subjectForm, nameEnglish: e.target.value })}
                  placeholder="e.g. Mathematics"
                  className="w-full px-3.5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-slate-200 outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ក្រេឌីត (Credits)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={subjectForm.credits}
                    onChange={e => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ម៉ោង/សប្តាហ៍</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={subjectForm.totalHoursPerWeek}
                    onChange={e => setSubjectForm({ ...subjectForm, totalHoursPerWeek: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-white font-mono outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ការពិពណ៌នាកម្មវិធីសិក្សា</label>
                <textarea
                  rows={2}
                  value={subjectForm.description}
                  onChange={e => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  placeholder="ការពិពណ៌នាសង្ខេបអំពីកម្មវិធីសិក្សា..."
                  className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-200 outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSubjectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20"
                >
                  រក្សាទុកមុខវិជ្ជា
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: CLASS STUDENT ROSTER DETAIL */}
      {/* ========================================================= */}
      {selectedClassForRoster && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 font-battambang text-xs text-slate-200 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    បញ្ជីរាយនាមសិស្ស - {selectedClassForRoster.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedClassForRoster.room} • គ្រូបន្ទុក: {selectedClassForRoster.teacherName}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedClassForRoster(null)} 
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Class Students Roster List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {(() => {
                const roster = students.filter(s => s.classId === selectedClassForRoster.id);
                if (roster.length === 0) {
                  return (
                    <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/5">
                      <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400">មិនទាន់មានសិស្សចុះឈ្មោះក្នុងថ្នាក់នេះនៅឡើយទេ</p>
                    </div>
                  );
                }

                return (
                  <div className="divide-y divide-white/5 bg-slate-950/40 rounded-2xl border border-white/5 overflow-hidden">
                    {roster.map((student, idx) => (
                      <div key={student.id} className="p-3 flex items-center justify-between hover:bg-white/[0.02] transition">
                        <div className="flex items-center space-x-3">
                          <span className="w-6 text-center font-mono text-slate-500 text-[11px] font-bold">
                            {idx + 1}
                          </span>
                          <img
                            src={student.photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.studentCode}`}
                            alt={student.nameKhmer}
                            className="w-9 h-9 rounded-full object-cover border border-white/10"
                          />
                          <div>
                            <p className="font-bold text-white text-xs">{student.nameKhmer}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {student.studentCode} • {getGenderKhmer(student.gender)} • កើត: {student.dob}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                            {student.status || 'ACTIVE'}
                          </span>
                          {student.phone && (
                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-end space-x-1">
                              <Phone className="w-2.5 h-2.5" />
                              <span>{student.phone}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">
                សរុបសិស្ស: {students.filter(s => s.classId === selectedClassForRoster.id).length} នាក់
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (selectedClassForRoster) {
                      setQuizSelectedClass(selectedClassForRoster.name);
                    }
                    setSelectedClassForRoster(null);
                    setActiveTab('WEEKLY_QUIZ');
                  }}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold transition"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>ពិន្ទុតេស្ត Typing • Writing • Practice</span>
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>បោះពុម្ពបញ្ជី</span>
                </button>
                <button
                  onClick={() => setSelectedClassForRoster(null)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-md"
                >
                  បិទ
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ADD TIMETABLE SLOT */}
      {/* ========================================================= */}
      {slotModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-battambang text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <span>បន្ថែមម៉ោងសិក្សាលើកាលវិភាគ</span>
              </h3>
              <button onClick={() => setSlotModalOpen(false)} className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlotSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ថ្ងៃសិក្សា (Day)*</label>
                  <select
                    value={slotForm.day}
                    onChange={e => setSlotForm({ ...slotForm, day: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-amber-400"
                  >
                    {daysOfWeek.map(d => (
                      <option key={d} value={d}>ថ្ងៃ {d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ម៉ោងទី (Period)*</label>
                  <select
                    value={slotForm.period}
                    onChange={e => {
                      const pNum = Number(e.target.value);
                      const matched = periods.find(p => p.num === pNum);
                      setSlotForm({ 
                        ...slotForm, 
                        period: pNum,
                        timeRange: matched?.time || '07:00 - 07:50'
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-amber-400"
                  >
                    {periods.map(p => (
                      <option key={p.num} value={p.num}>ម៉ោងទី {p.num} ({p.time})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">មុខវិជ្ជា (Subject)*</label>
                <select
                  value={slotForm.subjectId}
                  onChange={e => {
                    const sub = subjects.find(s => s.id === e.target.value);
                    setSlotForm({
                      ...slotForm,
                      subjectId: e.target.value,
                      subjectNameKhmer: sub?.nameKhmer || ''
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-amber-400"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.nameKhmer} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">គ្រូបង្រៀន (Teacher)</label>
                <select
                  value={slotForm.teacherId}
                  onChange={e => {
                    const t = teachers.find(tch => tch.id === e.target.value);
                    setSlotForm({
                      ...slotForm,
                      teacherId: e.target.value,
                      teacherName: t?.nameKhmer || ''
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-white outline-none focus:border-amber-400"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.nameKhmer} ({t.subjectSpecialty || t.position})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">បន្ទប់សិក្សា (Room)</label>
                <input
                  type="text"
                  value={slotForm.room}
                  onChange={e => setSlotForm({ ...slotForm, room: e.target.value })}
                  placeholder="ឧ. បន្ទប់ A101"
                  className="w-full px-3.5 py-2 bg-white/5 rounded-xl border border-white/10 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSlotModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 text-white rounded-xl font-bold shadow-md shadow-orange-500/20"
                >
                  រក្សាទុកកាលវិភាគ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: SAFE IN-APP DELETE CONFIRMATION */}
      {/* ========================================================= */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 font-battambang text-xs text-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                តើអ្នកពិតជាចង់លុបមែនទេ?
              </h3>
              <p className="text-slate-400 mt-1">
                អ្នកកំពុងស្នើសុំលុប {deleteConfirm.type === 'CLASS' ? 'ថ្នាក់រៀន' : deleteConfirm.type === 'SUBJECT' ? 'មុខវិជ្ជា' : 'ម៉ោងកាលវិភាគ'}{' '}
                <strong className="text-white">"{deleteConfirm.title}"</strong>
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: false, type: 'CLASS', id: '', title: '' })}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold flex-1"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-600/30 flex-1"
              >
                យល់ព្រមលុប
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
