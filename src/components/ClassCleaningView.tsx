import React, { useState, useMemo, useEffect } from 'react';
import { 
  Student, 
  ClassRoom, 
  CleaningDutyGroup, 
  CleaningDutyRecord, 
  CleaningDutyDay, 
  CleaningDutyStatus,
  SchoolProfile
} from '../types';
import { StorageService } from '../services/storageService';
import { getGenderKhmer } from '../utils/formatters';
import { AddStudentToCleaningModal } from './AddStudentToCleaningModal';
import { 
  Sparkles, 
  Calendar, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  Trophy, 
  Plus, 
  Trash2, 
  Edit3, 
  Printer, 
  Shuffle, 
  CheckCheck, 
  Search, 
  AlertCircle, 
  ShieldCheck, 
  Crown, 
  Volume2, 
  VolumeX, 
  Check, 
  X,
  FileSpreadsheet,
  ArrowUpRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface ClassCleaningViewProps {
  students: Student[];
  classes: ClassRoom[];
  school?: SchoolProfile;
  currentUser?: any;
  userRole?: string;
  onSendNotification?: (notif: any) => void;
  searchTerm?: string;
}

const DAY_CONFIG: {
  id: CleaningDutyDay;
  khmerName: string;
  khmerShort: string;
  enName: string;
  accentColor: string;
  bgLight: string;
  borderLight: string;
}[] = [
  { id: 'MONDAY', khmerName: 'ថ្ងៃច័ន្ទ', khmerShort: 'ច័ន្ទ', enName: 'Monday', accentColor: 'text-emerald-400', bgLight: 'bg-emerald-500/10', borderLight: 'border-emerald-500/30' },
  { id: 'TUESDAY', khmerName: 'ថ្ងៃអង្គារ', khmerShort: 'អង្គារ', enName: 'Tuesday', accentColor: 'text-indigo-400', bgLight: 'bg-indigo-500/10', borderLight: 'border-indigo-500/30' },
  { id: 'WEDNESDAY', khmerName: 'ថ្ងៃពុធ', khmerShort: 'ពុធ', enName: 'Wednesday', accentColor: 'text-cyan-400', bgLight: 'bg-cyan-500/10', borderLight: 'border-cyan-500/30' },
  { id: 'THURSDAY', khmerName: 'ថ្ងៃព្រហស្បតិ៍', khmerShort: 'ព្រហស្បតិ៍', enName: 'Thursday', accentColor: 'text-amber-400', bgLight: 'bg-amber-500/10', borderLight: 'border-amber-500/30' },
  { id: 'FRIDAY', khmerName: 'ថ្ងៃសុក្រ', khmerShort: 'សុក្រ', enName: 'Friday', accentColor: 'text-purple-400', bgLight: 'bg-purple-500/10', borderLight: 'border-purple-500/30' }
];

// Map JS day number (0=Sun, 1=Mon, ..., 5=Fri, 6=Sat) to CleaningDutyDay
const mapJsDayToCleaningDay = (dateStr: string): CleaningDutyDay => {
  const d = new Date(dateStr);
  const dayIndex = d.getDay();
  switch (dayIndex) {
    case 1: return 'MONDAY';
    case 2: return 'TUESDAY';
    case 3: return 'WEDNESDAY';
    case 4: return 'THURSDAY';
    case 5: return 'FRIDAY';
    default: return 'MONDAY';
  }
};

// Web Audio synthesizer for score feedback sound effects
const playScoreSound = (type: 'positive' | 'negative' | 'neutral') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'positive') {
      // Pleasant high double chime (+20 points)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'negative') {
      // Low warning buzz (-20 points)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(164.81, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      // Soft click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch {
    // Ignore audio context autoplay errors
  }
};

export const ClassCleaningView: React.FC<ClassCleaningViewProps> = ({
  students = [],
  classes = [],
  school,
  currentUser,
  userRole = 'SUPER_ADMIN',
  onSendNotification,
  searchTerm = ''
}) => {
  // Navigation & View State
  const [activeViewTab, setActiveViewTab] = useState<'DAILY_INSPECTION' | 'WEEKLY_SCHEDULE' | 'LEADERBOARD'>('DAILY_INSPECTION');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'CLS-12A');
  const [selectedTimeStudy, setSelectedTimeStudy] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Extract distinct time_study options from student data
  const availableTimeStudyOptions = useMemo(() => {
    const times = new Set<string>();
    students.forEach(s => {
      const t = (s.time_study || s.timeStudy || '').trim();
      if (t) times.add(t);
    });
    return Array.from(times).sort();
  }, [students]);

  // Local storage state synced hooks
  const [cleaningGroups, setCleaningGroups] = useState<CleaningDutyGroup[]>(() => StorageService.getCleaningGroups());
  const [cleaningRecords, setCleaningRecords] = useState<CleaningDutyRecord[]>(() => StorageService.getCleaningRecords());

  // Handle incoming search query
  useEffect(() => {
    if (searchTerm && searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      // If matches any cleaning group in a specific class
      const matchingGroup = cleaningGroups.find(g => 
        (g.groupNameKhmer && g.groupNameKhmer.toLowerCase().includes(q)) ||
        (g.groupNameEnglish && g.groupNameEnglish.toLowerCase().includes(q)) ||
        (g.groupLeaderName && g.groupLeaderName.toLowerCase().includes(q))
      );
      if (matchingGroup) {
        setSelectedClassId(matchingGroup.classId);
        setActiveViewTab('WEEKLY_SCHEDULE');
      } else {
        const matchingClass = classes.find(c => 
          (c.name && c.name.toLowerCase().includes(q)) || 
          (c.id && c.id.toLowerCase().includes(q))
        );
        if (matchingClass) {
          setSelectedClassId(matchingClass.id);
        }
      }
    }
  }, [searchTerm, cleaningGroups, classes]);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addModalDay, setAddModalDay] = useState<CleaningDutyDay>('MONDAY');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [printPreviewOpen, setPrintPreviewOpen] = useState<boolean>(false);

  // In-App Confirmation Modal State (Reliable across all browser contexts / iframes)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    warningText?: string;
    confirmLabel: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: 'យល់ព្រម',
    isDestructive: false,
    onConfirm: () => {}
  });

  const closeConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  // Search in Leaderboard
  const [leaderboardSearch, setLeaderboardSearch] = useState<string>('');

  // Current selected class object
  const currentClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Current day of the week based on selectedDate
  const currentDayOfWeek = useMemo(() => {
    return mapJsDayToCleaningDay(selectedDate);
  }, [selectedDate]);

  // All Cleaning groups (5 Days)
  const classGroups = useMemo(() => {
    return cleaningGroups;
  }, [cleaningGroups]);

  // Active Day Group for Daily Inspection
  const activeDayGroup = useMemo(() => {
    return classGroups.find(g => g.dayOfWeek === currentDayOfWeek);
  }, [classGroups, currentDayOfWeek]);

  // Current scheduled students for selected day from all students in Student Management
  const assignedStudentsForSelectedDay = useMemo(() => {
    const dayGroups = cleaningGroups.filter(g => g.dayOfWeek === currentDayOfWeek);
    const assignedIds = Array.from(new Set(dayGroups.flatMap(g => g.studentIds)));
    return assignedIds
      .map(id => students.find(s => s.id === id))
      .filter((s): s is Student => Boolean(s))
      .filter(s => {
        if (selectedTimeStudy === 'ALL') return true;
        const sTime = (s.time_study || s.timeStudy || '').trim();
        return sTime === selectedTimeStudy;
      });
  }, [cleaningGroups, currentDayOfWeek, students, selectedTimeStudy]);

  // Current records for selected date
  const todayRecords = useMemo(() => {
    return cleaningRecords.filter(r => r.date === selectedDate);
  }, [cleaningRecords, selectedDate]);

  // Map of studentId -> today's record status and notes
  const [pendingEvaluations, setPendingEvaluations] = useState<Record<string, { status: CleaningDutyStatus; notes: string }>>({});

  // Reset or initialize pendingEvaluations when date changes
  React.useEffect(() => {
    const newMap: Record<string, { status: CleaningDutyStatus; notes: string }> = {};
    
    // Fill from existing records first
    todayRecords.forEach(r => {
      newMap[r.studentId] = {
        status: r.status,
        notes: r.notes || ''
      };
    });

    // Fill defaults for assigned students who don't have records yet
    assignedStudentsForSelectedDay.forEach(st => {
      if (!newMap[st.id]) {
        newMap[st.id] = {
          status: 'PENDING',
          notes: ''
        };
      }
    });

    setPendingEvaluations(newMap);
    setSaveSuccessMsg(null);
  }, [selectedDate, todayRecords, assignedStudentsForSelectedDay]);

  // Handle Score / Status Click
  const handleSetStatus = (studentId: string, status: CleaningDutyStatus) => {
    setPendingEvaluations(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));

    if (soundEnabled) {
      if (status === 'CLEANED') playScoreSound('positive');
      else if (status === 'NOT_CLEANED') playScoreSound('negative');
      else playScoreSound('neutral');
    }
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setPendingEvaluations(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  // Bulk status update for all assigned students today
  const handleBulkSetStatus = (status: CleaningDutyStatus) => {
    const updated = { ...pendingEvaluations };
    assignedStudentsForSelectedDay.forEach(st => {
      updated[st.id] = {
        status,
        notes: status === 'CLEANED' ? 'បានបំពេញវេនស្អាតល្អ' : status === 'NOT_CLEANED' ? 'មិនបាននៅសម្អាតថ្នាក់' : ''
      };
    });
    setPendingEvaluations(updated);

    if (soundEnabled) {
      if (status === 'CLEANED') playScoreSound('positive');
      else if (status === 'NOT_CLEANED') playScoreSound('negative');
    }
  };

  // Save Daily Records & Score Updates (+20 / -20)
  const handleSaveDailyInspection = () => {
    const recordsToSave: Partial<CleaningDutyRecord>[] = [];
    const inspectorName = currentUser?.nameKhmer || 'លោកគ្រូ/អ្នកគ្រូបន្ទុកថ្នាក់';

    (Object.entries(pendingEvaluations) as [string, { status: CleaningDutyStatus; notes: string }][]).forEach(([stId, evalData]) => {
      const student = students.find(s => s.id === stId);
      if (!student) return;

      const calculatedScore = evalData.status === 'CLEANED' ? 20 : evalData.status === 'NOT_CLEANED' ? -20 : 0;

      recordsToSave.push({
        date: selectedDate,
        dayOfWeek: currentDayOfWeek,
        classId: student.classId || 'ALL',
        className: student.className || 'ថ្នាក់រៀន',
        groupId: activeDayGroup?.id,
        groupName: activeDayGroup?.groupNameKhmer || `ក្រុមវេន${currentDayOfWeek}`,
        studentId: student.id,
        studentCode: student.studentCode,
        studentNameKhmer: student.nameKhmer,
        studentGender: student.gender,
        studentPhoto: student.photo,
        status: evalData.status,
        scoreChange: calculatedScore,
        inspectorName,
        notes: evalData.notes || (evalData.status === 'CLEANED' ? 'បានសម្អាតតាមវេន' : evalData.status === 'NOT_CLEANED' ? 'អវត្តមានវេនសម្អាត' : '')
      });
    });

    if (recordsToSave.length === 0) return;

    StorageService.bulkSaveCleaningRecords(recordsToSave);
    const updatedList = StorageService.getCleaningRecords();
    setCleaningRecords(updatedList);

    setSaveSuccessMsg(`បានកត់ត្រា និងគណនាពិន្ទុសម្រាប់សិស្សចំនួន ${recordsToSave.length} នាក់បានជោគជ័យ!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);

    // If notification service exists, trigger notification
    if (onSendNotification) {
      const cleanedCount = recordsToSave.filter(r => r.status === 'CLEANED').length;
      const missedCount = recordsToSave.filter(r => r.status === 'NOT_CLEANED').length;
      onSendNotification({
        title: 'របាយការណ៍វេនសម្អាតថ្នាក់',
        message: `បានកត់ត្រាវេនសម្អាត ${DAY_CONFIG.find(d => d.id === currentDayOfWeek)?.khmerName}: បានសម្អាត ${cleanedCount} នាក់ (+20 ពិន្ទុ), មិនបានសម្អាត ${missedCount} នាក់ (-20 ពិន្ទុ)`,
        type: 'ACADEMIC',
        priority: 'NORMAL',
        targetRoles: ['TEACHER', 'ADMIN', 'STUDENT', 'PARENT']
      });
    }
  };

  // Add Students to a Day Group
  const handleAddStudentsToGroup = (_classId: string, dayOfWeek: CleaningDutyDay, studentIds: string[]) => {
    studentIds.forEach(id => {
      StorageService.addStudentToDayGroup('ALL', dayOfWeek, id);
    });
    setCleaningGroups(StorageService.getCleaningGroups());
    setSaveSuccessMsg(`បានបញ្ចូលសិស្សចំនួន ${studentIds.length} នាក់ទៅក្នុងក្រុមវេន ${dayOfWeek} ដោយជោគជ័យ!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Remove Student from Day Group
  const handleRemoveStudentFromGroup = (groupId: string, studentId: string, studentName?: string) => {
    StorageService.removeStudentFromGroup(groupId, studentId);
    setCleaningGroups(StorageService.getCleaningGroups());
    if (studentName) {
      setSaveSuccessMsg(`បានដកសិស្ស ${studentName} ចេញពីក្រុមវេនរួចរាល់!`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  // Delete / Clear a specific Day Group
  const handleDeleteGroup = (group: CleaningDutyGroup) => {
    const dayObj = DAY_CONFIG.find(d => d.id === group.dayOfWeek);
    const dayName = dayObj?.khmerName || group.dayOfWeek;
    
    setConfirmDialog({
      isOpen: true,
      title: `លុបក្រុមវេន ${dayName}`,
      description: `តើអ្នកពិតជាចង់លុបក្រុមវេនសម្អាតប្រចាំ ${dayName} នេះមែនទេ?`,
      warningText: 'សិស្សទាំងអស់ដែលបានចាត់តាំងក្នុងក្រុមនេះ នឹងត្រូវដកចេញពីកាលវិភាគ។',
      confirmLabel: 'លុបក្រុម',
      isDestructive: true,
      onConfirm: () => {
        StorageService.deleteCleaningGroup(group.id);
        StorageService.deleteCleaningGroupByDay('ALL', group.dayOfWeek);
        setCleaningGroups(StorageService.getCleaningGroups());
        setSaveSuccessMsg(`បានលុបក្រុមវេន ${dayName} ដោយជោគជ័យ!`);
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    });
  };

  // Clear all students from a specific day
  const handleClearDayStudents = (group: CleaningDutyGroup) => {
    const dayObj = DAY_CONFIG.find(d => d.id === group.dayOfWeek);
    const dayName = dayObj?.khmerName || group.dayOfWeek;
    
    setConfirmDialog({
      isOpen: true,
      title: `ជម្រះសិស្សក្នុងក្រុម ${dayName}`,
      description: `តើអ្នកពិតជាចង់ជម្រះសិស្សទាំងអស់ចេញពីក្រុមវេន ${dayName} មែនទេ?`,
      warningText: 'សិស្សទាំងអស់ក្នុងថ្ងៃនេះនឹងត្រូវសម្អាតចេញពីបញ្ជី។',
      confirmLabel: 'ជម្រះទាំងអស់',
      isDestructive: true,
      onConfirm: () => {
        StorageService.clearGroupStudents(group.id);
        setCleaningGroups(StorageService.getCleaningGroups());
        setSaveSuccessMsg(`បានជម្រះសិស្សចេញពីក្រុមវេន ${dayName} ជោគជ័យ!`);
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    });
  };

  // Delete / Reset All Groups
  const handleDeleteAllClassGroups = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'លុបក្រុមវេនសម្អាតទាំងអស់',
      description: 'តើអ្នកពិតជាចង់លុបក្រុមវេនសម្អាតទាំងអស់ (ពីថ្ងៃច័ន្ទ ដល់ថ្ងៃសុក្រ) មែនទេ?',
      warningText: 'ទិន្នន័យចាត់តាំងវេនសិស្សទាំងអស់ នឹងត្រូវបានលុបចេញទាំងស្រុង។',
      confirmLabel: 'លុបទាំងអស់',
      isDestructive: true,
      onConfirm: () => {
        StorageService.deleteAllClassCleaningGroups();
        setCleaningGroups(StorageService.getCleaningGroups());
        setSaveSuccessMsg('បានលុបក្រុមវេនសម្អាតទាំងអស់រួចរាល់!');
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    });
  };

  // Auto-distribute all students into 5 Monday-to-Friday Groups
  const handleAutoDistribute = () => {
    let targetStudents = students;
    if (selectedTimeStudy !== 'ALL') {
      targetStudents = targetStudents.filter(s => (s.time_study || s.timeStudy || '').trim() === selectedTimeStudy);
    }
    if (targetStudents.length === 0) {
      setConfirmDialog({
        isOpen: true,
        title: 'ពុំមានទិន្នន័យសិស្ស',
        description: 'មិនទាន់មានសិស្សនៅឡើយទេ ឬមិនត្រូវគ្នានឹងម៉ោងសិក្សាដែលបានជ្រើសរើស!',
        confirmLabel: 'យល់ព្រម',
        isDestructive: false,
        onConfirm: () => {}
      });
      return;
    }
    const shiftText = selectedTimeStudy !== 'ALL' ? ` (វេន ${selectedTimeStudy})` : '';

    setConfirmDialog({
      isOpen: true,
      title: 'បែងចែកសិស្សស្វ័យប្រវត្តិ',
      description: `តើអ្នកពិតជាចង់បែងចែកសិស្សទាំងអស់ចំនួន ${targetStudents.length} នាក់${shiftText} ស្វ័យប្រវត្តជា ៥ ក្រុមពីថ្ងៃច័ន្ទ ដល់ថ្ងៃសុក្រមែនទេ?`,
      warningText: 'ការចាត់តាំងពីមុននឹងត្រូវបានជំនួសដោយការបែងចែកថ្មីនេះ។',
      confirmLabel: 'បែងចែកឥឡូវនេះ',
      isDestructive: false,
      onConfirm: () => {
        StorageService.autoAssignAllStudentsToDailyGroups(targetStudents.map(s => s.id));
        setCleaningGroups(StorageService.getCleaningGroups());
        setSaveSuccessMsg(`បានបែងចែកសិស្ស ${targetStudents.length} នាក់ជា ៥ ក្រុមវេនជោគជ័យ!`);
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    });
  };

  // Set Group Leader
  const handleSetGroupLeader = (groupId: string, student: Student) => {
    StorageService.saveCleaningGroup({
      id: groupId,
      groupLeaderId: student.id,
      groupLeaderName: student.nameKhmer
    });
    setCleaningGroups(StorageService.getCleaningGroups());
  };

  // Calculate Leaderboard stats from all students in Student Management
  const leaderboardData = useMemo(() => {
    const data = StorageService.getAllStudentsCleaningScores();
    return data.filter(st => {
      const matchesSearch = !leaderboardSearch.trim() || 
        st.studentNameKhmer.toLowerCase().includes(leaderboardSearch.toLowerCase()) ||
        st.studentNameEnglish.toLowerCase().includes(leaderboardSearch.toLowerCase()) ||
        st.studentCode.toLowerCase().includes(leaderboardSearch.toLowerCase());
      
      const sTime = (st.time_study || '').trim();
      const matchesTime = selectedTimeStudy === 'ALL' || sTime === selectedTimeStudy;

      return matchesSearch && matchesTime;
    });
  }, [cleaningRecords, leaderboardSearch, selectedTimeStudy]);

  // Overall student cleaning statistics
  const classStats = useMemo(() => {
    const activeStudents = students.filter(s => {
      const sTime = (s.time_study || s.timeStudy || '').trim();
      const matchesTime = selectedTimeStudy === 'ALL' || sTime === selectedTimeStudy;
      return matchesTime;
    });
    const activeStudentIds = new Set(activeStudents.map(s => s.id));

    const records = cleaningRecords.filter(r => activeStudentIds.has(r.studentId));
    const cleaned = records.filter(r => r.status === 'CLEANED').length;
    const missed = records.filter(r => r.status === 'NOT_CLEANED').length;
    const totalPoints = records.reduce((acc, curr) => acc + curr.scoreChange, 0);
    const totalEvents = cleaned + missed;
    const cleanRate = totalEvents > 0 ? Math.round((cleaned / totalEvents) * 100) : 100;

    const assignedIds = new Set(
      cleaningGroups.flatMap(g => g.studentIds).filter(id => activeStudentIds.has(id))
    );

    return {
      cleaned,
      missed,
      totalPoints,
      cleanRate,
      totalStudentsInClass: activeStudents.length,
      assignedStudentsCount: assignedIds.size
    };
  }, [cleaningRecords, students, cleaningGroups, selectedTimeStudy]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-kantumruy">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                ក្រុមវេនសម្អាតថ្នាក់ & ពិន្ទុអនាម័យ
                <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  +20 / -20 Scoring System
                </span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                រៀបចំក្រុមវេនសម្អាតពីថ្ងៃច័ន្ទ ដល់ថ្ងៃសុក្រ ត្រួតពិនិត្យ និងដាក់ពិន្ទុអនាម័យសិស្សស្វ័យប្រវត្តិ
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Study (Shift) Filter */}
          <div className="flex items-center gap-2 bg-slate-800/90 border border-amber-500/30 rounded-xl px-3 py-2 shadow-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <select
              id="select-cleaning-time-study"
              value={selectedTimeStudy}
              onChange={e => setSelectedTimeStudy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-amber-300 focus:outline-none cursor-pointer font-battambang"
            >
              <option value="ALL" className="bg-slate-900 text-white">🕒 គ្រប់ម៉ោងសិក្សា (All Shifts)</option>
              {availableTimeStudyOptions.map(t => (
                <option key={t} value={t} className="bg-slate-900 text-white">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'សំឡេងបើក (Sound On)' : 'សំឡេងបិទ (Sound Muted)'}
            className={`p-2.5 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Auto Distribute Mon-Fri */}
          <button
            id="btn-auto-distribute-cleaning"
            onClick={handleAutoDistribute}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="បែងចែកសិស្សស្វ័យប្រវត្តជា ៥ ក្រុមពីថ្ងៃច័ន្ទ ដល់ថ្ងៃសុក្រ"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">ស្វ័យប្រវត្តិចែក</span> ៥ ក្រុម
          </button>

          {/* Add Students Button */}
          <button
            id="btn-open-add-cleaning-modal"
            onClick={() => {
              setAddModalDay(currentDayOfWeek);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ បន្ថែមសិស្សចូលក្រុម</span>
          </button>

          {/* Print Roster */}
          <button
            onClick={() => window.print()}
            className="p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 rounded-xl transition-colors"
            title="បោះពុម្ពតារាងវេនសម្អាត"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl text-sm flex items-center justify-between shadow-lg shadow-emerald-950/40 animate-slideDown">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Summary Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>សិស្សមានវេនសម្អាត</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {classStats.assignedStudentsCount} <span className="text-xs font-normal text-slate-400">/ {classStats.totalStudentsInClass} នាក់</span>
          </div>
          <div className="text-[11px] text-indigo-400 mt-1">
            {classStats.assignedStudentsCount === classStats.totalStudentsInClass ? '✓ បានចាត់តាំងគ្រប់គ្នា' : `${classStats.totalStudentsInClass - classStats.assignedStudentsCount} នាក់មិនទាន់មានវេន`}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>បានសម្អាត (+20)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {classStats.cleaned} <span className="text-xs font-normal text-slate-400">លើក</span>
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +{classStats.cleaned * 20} ពិន្ទុសរុប
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>មិនបានសម្អាត (-20)</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">
            {classStats.missed} <span className="text-xs font-normal text-slate-400">លើក</span>
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            -{classStats.missed * 20} ពិន្ទុកាត់ចេញ
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>អត្រាអនាម័យថ្នាក់</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {classStats.cleanRate}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full" style={{ width: `${classStats.cleanRate}%` }} />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          id="tab-btn-daily-inspection"
          onClick={() => setActiveViewTab('DAILY_INSPECTION')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
            activeViewTab === 'DAILY_INSPECTION'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-850 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>ត្រួតពិនិត្យប្រចាំថ្ងៃ & ដាក់ពិន្ទុ (+20 / -20)</span>
        </button>

        <button
          id="tab-btn-weekly-schedule"
          onClick={() => setActiveViewTab('WEEKLY_SCHEDULE')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
            activeViewTab === 'WEEKLY_SCHEDULE'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-850 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>កាលវិភាគវេន ច័ន្ទ-សុក្រ (5 Days Board)</span>
        </button>

        <button
          id="tab-btn-leaderboard"
          onClick={() => setActiveViewTab('LEADERBOARD')}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
            activeViewTab === 'LEADERBOARD'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-850 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>តារាងពិន្ទុ & ចំណាត់ថ្នាក់ (Leaderboard)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAILY INSPECTION & SCORING (+20 / -20) */}
      {/* ========================================================================= */}
      {activeViewTab === 'DAILY_INSPECTION' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Inspection Date & Day Banner */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase">ថ្ងៃត្រួតពិនិត្យ (Inspection Date):</span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {DAY_CONFIG.find(d => d.id === currentDayOfWeek)?.khmerName} ({currentDayOfWeek})
                  </span>
                </div>
                <div className="text-lg font-bold text-white mt-0.5">
                  {activeDayGroup?.groupNameKhmer || `ក្រុមវេនថ្ងៃ${DAY_CONFIG.find(d => d.id === currentDayOfWeek)?.khmerShort}`}
                  {activeDayGroup?.groupLeaderName && (
                    <span className="text-xs font-normal text-amber-400 ml-2">
                      👑 ប្រធានក្រុម: {activeDayGroup.groupLeaderName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <input
                id="input-inspection-date"
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />

              <button
                onClick={() => {
                  setAddModalDay(currentDayOfWeek);
                  setIsAddModalOpen(true);
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>+ បន្ថែមសិស្ស</span>
              </button>

              {activeDayGroup && (
                <button
                  id="btn-delete-active-day-group"
                  onClick={() => handleDeleteGroup(activeDayGroup)}
                  className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-600/40 text-rose-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="លុបក្រុមវេនប្រចាំថ្ងៃនេះ"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>លុបក្រុម</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Bulk Action Bar & Scoring Rule Legend */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold mr-1">សកម្មភាពលឿន:</span>
              <button
                onClick={() => handleBulkSetStatus('CLEANED')}
                className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-600/40 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                សម្គាល់បានសម្អាតទាំងអស់ (+20 គ្រប់គ្នា)
              </button>

              <button
                onClick={() => handleBulkSetStatus('NOT_CLEANED')}
                className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-600/40 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                សម្គាល់មិនបានសម្អាតទាំងអស់ (-20)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-save-cleaning-records-inspection"
                onClick={handleSaveDailyInspection}
                disabled={assignedStudentsForSelectedDay.length === 0}
                className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  assignedStudentsForSelectedDay.length > 0
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>💾 រក្សាទុក & គណនាពិន្ទុ</span>
              </button>
            </div>
          </div>

          {/* Student Duty Scoring Cards List */}
          {assignedStudentsForSelectedDay.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 border-dashed rounded-2xl p-12 text-center">
              <Sparkles className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-white">មិនទាន់មានសិស្សក្នុងក្រុមវេន {DAY_CONFIG.find(d => d.id === currentDayOfWeek)?.khmerName} ទេ</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                សូមចុចប៊ូតុង "បន្ថែមសិស្សចូលក្រុម" ឬ "ស្វ័យប្រវត្តិចែក ៥ ក្រុម" ដើម្បីចាត់តាំងវេនសម្អាតពីថ្ងៃច័ន្ទ ដល់ថ្ងៃសុក្រ។
              </p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={() => {
                    setAddModalDay(currentDayOfWeek);
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  + បន្ថែមសិស្សថ្ងៃនេះ
                </button>
                <button
                  onClick={handleAutoDistribute}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Shuffle className="w-4 h-4 text-amber-400" />
                  ចែក ៥ ក្រុមស្វ័យប្រវត្តិ
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedStudentsForSelectedDay.map(student => {
                const evalData = pendingEvaluations[student.id] || { status: 'PENDING', notes: '' };
                const isLeader = activeDayGroup?.groupLeaderId === student.id;

                return (
                  <div
                    key={student.id}
                    className={`bg-slate-900/90 border rounded-2xl p-4 transition-all duration-200 ${
                      evalData.status === 'CLEANED'
                        ? 'border-emerald-500/50 bg-emerald-950/10 shadow-lg shadow-emerald-950/20'
                        : evalData.status === 'NOT_CLEANED'
                        ? 'border-rose-500/50 bg-rose-950/10 shadow-lg shadow-rose-950/20'
                        : evalData.status === 'EXCUSED'
                        ? 'border-amber-500/40 bg-amber-950/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Student Info Bar */}
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={student.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={student.nameKhmer}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                          />
                          {isLeader && (
                            <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 p-1 rounded-full text-[10px] shadow">
                              <Crown className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-base flex items-center gap-2">
                            {student.nameKhmer}
                            {isLeader && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-semibold">
                                ប្រធានក្រុម
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                            <span>{student.nameEnglish}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-500">{student.studentCode}</span>
                            <span>•</span>
                            <span>{getGenderKhmer(student.gender)}</span>
                            {student.className && (
                              <>
                                <span>•</span>
                                <span className="inline-flex items-center text-[10px] text-indigo-300 font-battambang bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">
                                  {student.className}
                                </span>
                              </>
                            )}
                            {(student.time_study || student.timeStudy) && (
                              <>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-battambang bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>{student.time_study || student.timeStudy}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Real-time score indicator */}
                      <div className="text-right">
                        {evalData.status === 'CLEANED' ? (
                          <div className="inline-flex flex-col items-end">
                            <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 text-xs font-black rounded-lg shadow-md shadow-emerald-500/30 animate-scaleUp">
                              +20 ពិន្ទុ
                            </span>
                            <span className="text-[10px] text-emerald-400 font-semibold mt-0.5">បានសម្អាត</span>
                          </div>
                        ) : evalData.status === 'NOT_CLEANED' ? (
                          <div className="inline-flex flex-col items-end">
                            <span className="px-2.5 py-1 bg-rose-600 text-white text-xs font-black rounded-lg shadow-md shadow-rose-600/30 animate-scaleUp">
                              -20 ពិន្ទុ
                            </span>
                            <span className="text-[10px] text-rose-400 font-semibold mt-0.5">មិនបានសម្អាត</span>
                          </div>
                        ) : evalData.status === 'EXCUSED' ? (
                          <div className="inline-flex flex-col items-end">
                            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-lg">
                              0 ពិន្ទុ
                            </span>
                            <span className="text-[10px] text-amber-400 font-semibold mt-0.5">មានច្បាប់</span>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-end">
                            <span className="px-2.5 py-1 bg-slate-800 text-slate-400 text-xs font-medium rounded-lg border border-slate-700">
                              រង់ចាំ
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {/* Cleaned: +20 */}
                      <button
                        type="button"
                        id={`btn-cleaned-${student.id}`}
                        onClick={() => handleSetStatus(student.id, 'CLEANED')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          evalData.status === 'CLEANED'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/40 border border-emerald-400'
                            : 'bg-slate-800 hover:bg-emerald-950/40 border border-slate-700 text-slate-300 hover:text-emerald-400'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>បានសម្អាត (+20)</span>
                      </button>

                      {/* Not Cleaned: -20 */}
                      <button
                        type="button"
                        id={`btn-not-cleaned-${student.id}`}
                        onClick={() => handleSetStatus(student.id, 'NOT_CLEANED')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          evalData.status === 'NOT_CLEANED'
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40 border border-rose-400'
                            : 'bg-slate-800 hover:bg-rose-950/40 border border-slate-700 text-slate-300 hover:text-rose-400'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>មិនបានសម្អាត (-20)</span>
                      </button>

                      {/* Excused: 0 */}
                      <button
                        type="button"
                        id={`btn-excused-${student.id}`}
                        onClick={() => handleSetStatus(student.id, 'EXCUSED')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                          evalData.status === 'EXCUSED'
                            ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 border border-amber-400'
                            : 'bg-slate-800 hover:bg-amber-950/30 border border-slate-700 text-slate-300 hover:text-amber-300'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>មានច្បាប់ (0)</span>
                      </button>
                    </div>

                    {/* Inspector Remarks Input */}
                    <div className="flex items-center gap-2 bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <input
                        type="text"
                        value={evalData.notes}
                        onChange={e => handleNotesChange(student.id, e.target.value)}
                        placeholder="មតិយោបល់គ្រូ (ឧ. សម្អាតបានស្អាតល្អ, អវត្តមាន...)"
                        className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Group Task Checklist */}
          {activeDayGroup && activeDayGroup.tasks && activeDayGroup.tasks.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                ភារកិច្ចសម្អាតប្រចាំវេន (Cleaning Duty Checklist)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {activeDayGroup.tasks.map((task, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WEEKLY SCHEDULE 5-DAY BOARD (MONDAY TO FRIDAY) */}
      {/* ========================================================================= */}
      {activeViewTab === 'WEEKLY_SCHEDULE' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Top Board Info & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                កាលវិភាគវេនសម្អាតពីថ្ងៃច័ន្ទ ដល់ថ្ងៃសុក្រ (Monday to Friday Roster)
              </h3>
              <p className="text-xs text-slate-400">
                សិស្សទាំងអស់ក្នុងប្រព័ន្ធ (<strong className="text-indigo-300">{students.length} នាក់</strong>) • ចាត់តាំងសិស្សតាមថ្ងៃវេននីមួយៗពីថ្ងៃច័ន្ទ ដល់ថ្ងៃសុក្រ
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAutoDistribute}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="បែងចែកសិស្សស្វ័យប្រវត្តិជា ៥ ក្រុម"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                ស្វ័យប្រវត្តិចែក ៥ ក្រុម
              </button>

              {classGroups.length > 0 && (
                <button
                  id="btn-delete-all-cleaning-groups"
                  onClick={handleDeleteAllClassGroups}
                  className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-600/40 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="លុបក្រុមវេនទាំងអស់"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>លុបក្រុមវេនទាំងអស់</span>
                </button>
              )}
            </div>
          </div>

          {/* 5-Column Day Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            {DAY_CONFIG.map(day => {
              const group = classGroups.find(g => g.dayOfWeek === day.id);
              const allGroupStudents = (group?.studentIds || [])
                .map(id => students.find(s => s.id === id))
                .filter((s): s is Student => Boolean(s));

              const groupStudents = allGroupStudents.filter(s => {
                if (selectedTimeStudy === 'ALL') return true;
                const sTime = (s.time_study || s.timeStudy || '').trim();
                return sTime === selectedTimeStudy;
              });

              const isToday = currentDayOfWeek === day.id;

              return (
                <div
                  key={day.id}
                  className={`bg-slate-900/90 border rounded-2xl flex flex-col transition-all ${
                    isToday
                      ? 'border-indigo-500 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Column Header */}
                  <div className="p-3.5 border-b border-slate-800 bg-slate-850/90 rounded-t-2xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${day.bgLight} ${day.accentColor} ${day.borderLight}`}>
                        {day.khmerName}
                      </span>
                      <div className="flex items-center gap-1">
                        {isToday && (
                          <span className="text-[10px] bg-indigo-500 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                            ថ្ងៃនេះ
                          </span>
                        )}
                        {group && (
                          <button
                            onClick={() => handleDeleteGroup(group)}
                            title={`លុបក្រុមវេន ${day.khmerName}`}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-xs font-medium text-slate-300 flex items-center justify-between mt-1">
                      <span>{day.enName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono">({groupStudents.length} នាក់)</span>
                        {groupStudents.length > 0 && group && (
                          <button
                            onClick={() => handleClearDayStudents(group)}
                            title="ជម្រះសិស្សទាំងអស់ក្នុងក្រុមនេះ"
                            className="text-[10px] text-rose-400/80 hover:text-rose-300 hover:underline"
                          >
                            ជម្រះ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Students in this day */}
                  <div className="p-3 space-y-2 flex-1 min-h-[220px]">
                    {groupStudents.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                        <Users className="w-7 h-7 text-slate-600 mb-2" />
                        <span className="text-xs">គ្មានសិស្ស</span>
                      </div>
                    ) : (
                      groupStudents.map(student => {
                        const isLeader = group?.groupLeaderId === student.id;
                        return (
                          <div
                            key={student.id}
                            className="bg-slate-800/80 border border-slate-700/70 hover:border-slate-600 rounded-xl p-2.5 flex items-center justify-between gap-2 group transition-all"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={student.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                alt={student.nameKhmer}
                                className="w-7 h-7 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                                  {student.nameKhmer}
                                  {isLeader && <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono flex flex-wrap items-center gap-1 truncate">
                                  <span>{student.studentCode}</span>
                                  {student.className && (
                                    <span className="text-[9px] text-indigo-300 font-battambang bg-indigo-500/20 px-1 py-0.5 rounded">
                                      {student.className}
                                    </span>
                                  )}
                                  {(student.time_study || student.timeStudy) && (
                                    <span className="text-[9px] text-amber-300 font-battambang bg-amber-500/20 px-1 py-0.5 rounded">
                                      {student.time_study || student.timeStudy}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                              {!isLeader && group && (
                                <button
                                  onClick={() => handleSetGroupLeader(group.id, student)}
                                  title="តែងតាំងជាប្រធានក្រុម"
                                  className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                                >
                                  <Crown className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {group && (
                                <button
                                  onClick={() => handleRemoveStudentFromGroup(group.id, student.id, student.nameKhmer)}
                                  title="លុបចេញពីវេនថ្ងៃនេះ"
                                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add Student to Column Button */}
                  <div className="p-3 border-t border-slate-800 bg-slate-850/50 rounded-b-2xl">
                    <button
                      id={`btn-add-to-day-${day.id.toLowerCase()}`}
                      onClick={() => {
                        setAddModalDay(day.id);
                        setIsAddModalOpen(true);
                      }}
                      className="w-full py-2 bg-slate-800 hover:bg-indigo-600/20 border border-slate-700/80 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ បន្ថែមសិស្ស</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CLEANLINESS LEADERBOARD & SCORE RANKINGS */}
      {/* ========================================================================= */}
      {activeViewTab === 'LEADERBOARD' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                តារាងពិន្ទុ & ចំណាត់ថ្នាក់អនាម័យ (Cleanliness Ranking)
              </h3>
              <p className="text-xs text-slate-400">
                គណនាដោយផ្អែកលើ: បានសម្អាត (+20 ពិន្ទុ) | មិនបានសម្អាត (-20 ពិន្ទុ)
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={leaderboardSearch}
                onChange={e => setLeaderboardSearch(e.target.value)}
                placeholder="ស្វែងរកតាមឈ្មោះ ឬកូដ..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-kantumruy">
                <thead className="bg-slate-850 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 text-center w-16">ចំណាត់ថ្នាក់</th>
                    <th className="py-3.5 px-4">សិស្ស</th>
                    <th className="py-3.5 px-4 text-center">បានសម្អាត (+20)</th>
                    <th className="py-3.5 px-4 text-center">មិនបានសម្អាត (-20)</th>
                    <th className="py-3.5 px-4 text-center">អត្រាអនាម័យ</th>
                    <th className="py-3.5 px-4 text-right">ពិន្ទុសរុប</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {leaderboardData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                        មិនទាន់មានទិន្នន័យពិន្ទុនៅឡើយទេ
                      </td>
                    </tr>
                  ) : (
                    leaderboardData.map((row, index) => {
                      const isTop1 = index === 0;
                      const isTop2 = index === 1;
                      const isTop3 = index === 2;

                      return (
                        <tr key={row.studentId} className="hover:bg-slate-850/60 transition-colors">
                          {/* Rank */}
                          <td className="py-3.5 px-4 text-center">
                            {isTop1 ? (
                              <span className="w-7 h-7 mx-auto rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg shadow-amber-500/30">
                                🥇 1
                              </span>
                            ) : isTop2 ? (
                              <span className="w-7 h-7 mx-auto rounded-full bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center">
                                🥈 2
                              </span>
                            ) : isTop3 ? (
                              <span className="w-7 h-7 mx-auto rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center">
                                🥉 3
                              </span>
                            ) : (
                              <span className="text-xs font-mono font-bold text-slate-500">
                                #{index + 1}
                              </span>
                            )}
                          </td>

                          {/* Student Info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={row.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                alt={row.studentNameKhmer}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                              />
                              <div>
                                <div className="font-bold text-white flex items-center gap-2">
                                  {row.studentNameKhmer}
                                  <span className="text-xs font-normal text-slate-400">({row.studentNameEnglish})</span>
                                </div>
                                <div className="text-xs text-slate-500 font-mono flex flex-wrap items-center gap-1.5 mt-0.5">
                                  <span>{row.studentCode}</span>
                                  {row.className && (
                                    <span className="text-[9px] text-indigo-300 font-battambang bg-indigo-500/20 px-1 py-0.2 rounded border border-indigo-500/30">
                                      {row.className}
                                    </span>
                                  )}
                                  {row.time_study && (
                                    <span className="text-[9px] text-amber-300 font-battambang bg-amber-500/20 px-1 py-0.2 rounded border border-amber-500/30">
                                      {row.time_study}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Cleaned count */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {row.cleanedCount} ដង
                            </span>
                          </td>

                          {/* Missed count */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              row.missedCount > 0
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'text-slate-500'
                            }`}>
                              {row.missedCount} ដង
                            </span>
                          </td>

                          {/* Rate Bar */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    row.rate >= 80 ? 'bg-emerald-400' : row.rate >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${row.rate}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-slate-300 font-mono">{row.rate}%</span>
                            </div>
                          </td>

                          {/* Total Score */}
                          <td className="py-3.5 px-4 text-right">
                            <span className={`text-base font-black px-3 py-1 rounded-xl font-mono ${
                              row.totalScore > 0
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : row.totalScore < 0
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {row.totalScore > 0 ? `+${row.totalScore}` : row.totalScore} pts
                            </span>
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

      {/* Modal: Add Students to Cleaning Group */}
      <AddStudentToCleaningModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        classes={classes}
        students={students}
        currentClassId={selectedClassId}
        selectedDay={addModalDay}
        initialTimeStudy={selectedTimeStudy}
        existingGroups={cleaningGroups}
        onAddStudents={handleAddStudentsToGroup}
      />

      {/* In-App Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div 
            id="modal-cleaning-confirm-action"
            className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-md w-full shadow-2xl shadow-slate-950/90 relative animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl flex-shrink-0 ${
                confirmDialog.isDestructive 
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                {confirmDialog.isDestructive ? (
                  <Trash2 className="w-6 h-6" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white font-battambang">
                  {confirmDialog.title}
                </h3>
                <p className="text-sm text-slate-300 font-battambang mt-1.5 leading-relaxed">
                  {confirmDialog.description}
                </p>

                {confirmDialog.warningText && (
                  <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 font-battambang flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{confirmDialog.warningText}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                id="btn-confirm-cancel"
                onClick={closeConfirmDialog}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-all font-battambang"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                id="btn-confirm-proceed"
                onClick={() => {
                  const onConfirmFn = confirmDialog.onConfirm;
                  closeConfirmDialog();
                  onConfirmFn();
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg transition-all font-battambang ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                }`}
              >
                {confirmDialog.isDestructive && <Trash2 className="w-4 h-4" />}
                <span>{confirmDialog.confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
