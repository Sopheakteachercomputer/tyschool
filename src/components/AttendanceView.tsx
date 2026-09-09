import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AttendanceRecord, ClassRoom, Student, AttendanceStatus } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Save, 
  Calendar, 
  CheckCheck, 
  Users, 
  AlertCircle, 
  Lock, 
  Search, 
  UserX, 
  UserCheck, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  X,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Activity
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { isFemaleGender, getGenderKhmer, getStudentDefaultAvatar } from '../utils/formatters';
import { playAttendanceSound } from '../utils/notificationSound';

interface AttendanceViewProps {
  students?: Student[];
  classes?: ClassRoom[];
  attendanceRecords?: AttendanceRecord[];
  onSaveAttendanceBatch?: (records: AttendanceRecord[]) => void;
  onSaveAttendance?: (records: AttendanceRecord[]) => void;
  userRole?: string;
  searchTerm?: string;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students = [],
  classes = [],
  attendanceRecords = [],
  onSaveAttendanceBatch,
  onSaveAttendance,
  userRole = 'SUPER_ADMIN',
  searchTerm = ''
}) => {
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const canManageAttendance = isSuperAdmin || userRole === 'ADMIN' || userRole === 'DIRECTOR' || userRole === 'TEACHER' || userRole === 'STAFF';
  const saveHandler = onSaveAttendanceBatch || onSaveAttendance || (() => {});
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTimeStudy, setSelectedTimeStudy] = useState<string>('ALL');
  const [localSearch, setLocalSearch] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Auto-Save state
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  });
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound Alert Preference (Persisted in localStorage, default: ON)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('attendance_sound_alert');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    localStorage.setItem('attendance_sound_alert', String(nextState));
    if (nextState) {
      playAttendanceSound('PRESENT');
    }
  };

  // Toggle to hide or show dropped out students in the active table (Default: true / HIDE)
  const [hideDroppedOut, setHideDroppedOut] = useState<boolean>(true);
  // Modal to manage/restore dropped out students
  const [isDroppedOutModalOpen, setIsDroppedOutModalOpen] = useState<boolean>(false);

  // Take full list of students (merge props with storage to guarantee complete list)
  const [allStudents, setAllStudents] = useState<Student[]>(() => {
    const fromProps = students && students.length > 0 ? students : [];
    const fromStorage = storageService.getStudents() || [];
    const map = new Map<string, Student>();
    fromStorage.forEach(s => map.set(s.id, s));
    fromProps.forEach(s => map.set(s.id, s));
    return Array.from(map.values());
  });

  // Keep allStudents synchronized when props change
  useEffect(() => {
    const fromProps = students && students.length > 0 ? students : [];
    const fromStorage = storageService.getStudents() || [];
    const map = new Map<string, Student>();
    fromStorage.forEach(s => map.set(s.id, s));
    fromProps.forEach(s => map.set(s.id, s));
    setAllStudents(Array.from(map.values()));
  }, [students]);

  // Local state for attendance edits
  const [currentAttendance, setCurrentAttendance] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>(() => {
    const map: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    const fromProps = students && students.length > 0 ? students : [];
    const fromStorage = storageService.getStudents() || [];
    const merged = new Map<string, Student>();
    fromStorage.forEach(s => merged.set(s.id, s));
    fromProps.forEach(s => merged.set(s.id, s));
    const today = new Date().toISOString().split('T')[0];
    merged.forEach(st => {
      const existing = attendanceRecords.find(r => r.studentId === st.id && r.date === today);
      const isDropped = st.status === 'DROPPED_OUT';
      map[st.id] = {
        status: existing?.status || (isDropped ? 'DROPPED_OUT' : 'PRESENT'),
        remarks: existing?.remarks || (existing as any)?.reason || (isDropped ? 'បោះបង់ការសិក្សា' : '')
      };
    });
    return map;
  });

  // Re-sync currentAttendance whenever selectedDate, attendanceRecords, or allStudents change
  useEffect(() => {
    setCurrentAttendance(prev => {
      const nextMap = { ...prev };
      allStudents.forEach(st => {
        const existing = attendanceRecords.find(r => r.studentId === st.id && r.date === selectedDate);
        const isDropped = st.status === 'DROPPED_OUT';
        if (existing) {
          nextMap[st.id] = {
            status: existing.status,
            remarks: existing.remarks || (existing as any)?.reason || ''
          };
        } else if (!nextMap[st.id]) {
          nextMap[st.id] = {
            status: isDropped ? 'DROPPED_OUT' : 'PRESENT',
            remarks: isDropped ? 'បោះបង់ការសិក្សា' : ''
          };
        }
      });
      return nextMap;
    });
  }, [selectedDate, attendanceRecords, allStudents]);

  // Available Time Study options from all students
  const availableTimeStudyOptions = useMemo(() => {
    const times = new Set<string>();
    allStudents.forEach(s => {
      const t = (s.time_study || s.timeStudy || '').trim();
      if (t) times.add(t);
    });
    return Array.from(times).sort();
  }, [allStudents]);

  // Dropped out students list
  const droppedOutStudents = useMemo(() => {
    return allStudents.filter(s => {
      const isDroppedInStudent = s.status === 'DROPPED_OUT';
      const isDroppedInAttendance = currentAttendance[s.id]?.status === 'DROPPED_OUT';
      return isDroppedInStudent || isDroppedInAttendance;
    });
  }, [allStudents, currentAttendance]);

  // Filter students based on Shift / Time Study, search query, and Dropped Out filter
  const filteredStudents = useMemo(() => {
    const effectiveSearch = (localSearch || searchTerm || '').trim().toLowerCase();
    return allStudents.filter(s => {
      const isDropped = s.status === 'DROPPED_OUT' || currentAttendance[s.id]?.status === 'DROPPED_OUT';
      
      // If hideDroppedOut is enabled, hide all dropped out students from the daily attendance list
      if (hideDroppedOut && isDropped) {
        return false;
      }

      // Shift filter
      const sTime = (s.time_study || s.timeStudy || '').trim();
      const matchesTime = selectedTimeStudy === 'ALL' || sTime === selectedTimeStudy;
      if (!matchesTime) return false;

      // Search query filter
      if (!effectiveSearch) return true;
      const sClass = s.className || classes.find(c => c.id === s.classId)?.name || '';
      return (
        s.nameKhmer.toLowerCase().includes(effectiveSearch) ||
        s.nameEnglish.toLowerCase().includes(effectiveSearch) ||
        s.studentCode.toLowerCase().includes(effectiveSearch) ||
        sClass.toLowerCase().includes(effectiveSearch)
      );
    });
  }, [allStudents, selectedTimeStudy, localSearch, searchTerm, classes, hideDroppedOut, currentAttendance]);

  // Ultra-Fast Live Status Counts computed in real-time
  const presentCount = useMemo(() => filteredStudents.filter(s => currentAttendance[s.id]?.status === 'PRESENT').length, [filteredStudents, currentAttendance]);
  const lateCount = useMemo(() => filteredStudents.filter(s => currentAttendance[s.id]?.status === 'LATE').length, [filteredStudents, currentAttendance]);
  const permCount = useMemo(() => filteredStudents.filter(s => currentAttendance[s.id]?.status === 'PERMISSION').length, [filteredStudents, currentAttendance]);
  const absentCount = useMemo(() => filteredStudents.filter(s => currentAttendance[s.id]?.status === 'ABSENT').length, [filteredStudents, currentAttendance]);
  const droppedCount = droppedOutStudents.length;

  const totalActive = filteredStudents.length;
  const attendanceRate = totalActive > 0 
    ? (((presentCount + permCount + lateCount) / totalActive) * 100).toFixed(1)
    : '100.0';

  // Core Auto-Save Engine
  const performAutoSave = useCallback((targetAttendanceMap: Record<string, { status: AttendanceStatus; remarks: string }>) => {
    if (!canManageAttendance) return;

    try {
      setIsAutoSaving(true);
      const recordsToSave: AttendanceRecord[] = allStudents.map(s => {
        const state = targetAttendanceMap[s.id] || { 
          status: s.status === 'DROPPED_OUT' ? 'DROPPED_OUT' : 'PRESENT', 
          remarks: '' 
        };
        const studentClass = s.className || classes.find(c => c.id === s.classId)?.name || 'PC01';
        return {
          id: `ATT-${s.id}-${selectedDate}`,
          studentId: s.id,
          studentNameKhmer: s.nameKhmer,
          studentCode: s.studentCode,
          classId: s.classId || 'PC01',
          className: studentClass,
          date: selectedDate,
          status: state.status,
          remarks: state.remarks,
          reason: state.remarks,
          recordedBy: 'គ្រូបន្ទុកថ្នាក់'
        };
      });

      // Persist to storage and invoke parent save handler
      storageService.saveAttendanceBulk(recordsToSave);
      saveHandler(recordsToSave);

      const nowTime = new Date().toLocaleTimeString('km-KH', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true 
      });
      setLastAutoSavedTime(nowTime);

      setTimeout(() => {
        setIsAutoSaving(false);
      }, 600);
    } catch (err) {
      console.error('Auto-save attendance error:', err);
      setIsAutoSaving(false);
    }
  }, [canManageAttendance, allStudents, classes, selectedDate, saveHandler]);

  // Explicitly take / refresh all students from Students directory
  const handleTakeAllStudents = () => {
    if (soundEnabled) playAttendanceSound('BATCH');
    const freshStudents = storageService.getStudents() || [];
    const fromProps = students && students.length > 0 ? students : [];
    const map = new Map<string, Student>();
    freshStudents.forEach(s => map.set(s.id, s));
    fromProps.forEach(s => map.set(s.id, s));
    const merged = Array.from(map.values());
    setAllStudents(merged);

    const nextMap: Record<string, { status: AttendanceStatus; remarks: string }> = { ...currentAttendance };
    merged.forEach(st => {
      const existing = attendanceRecords.find(r => r.studentId === st.id && r.date === selectedDate);
      const isDropped = st.status === 'DROPPED_OUT';
      if (existing) {
        nextMap[st.id] = {
          status: existing.status,
          remarks: existing.remarks || (existing as any)?.reason || ''
        };
      } else if (!nextMap[st.id]) {
        nextMap[st.id] = {
          status: isDropped ? 'DROPPED_OUT' : 'PRESENT',
          remarks: isDropped ? 'បោះបង់ការសិក្សា' : ''
        };
      }
    });
    setCurrentAttendance(nextMap);
    performAutoSave(nextMap);

    setSyncFeedback(`បានទាញយកសិស្សទាំងអស់ (${merged.length} នាក់) ពីបញ្ជីសិស្ស និងកត់ត្រាស្វ័យប្រវត្តរួចរាល់!`);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (!canManageAttendance) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែគណៈគ្រប់គ្រង ឬលោកគ្រូ-អ្នកគ្រូប៉ុណ្ណោះដែលអាចកែប្រែវត្តមានបាន!');
      return;
    }

    // Play instant audio alert feedback
    if (soundEnabled) {
      playAttendanceSound(status);
    }

    const targetStudent = allStudents.find(s => s.id === studentId);

    // If marking as DROPPED_OUT:
    if (status === 'DROPPED_OUT') {
      const nextMap = {
        ...currentAttendance,
        [studentId]: {
          status: 'DROPPED_OUT' as AttendanceStatus,
          remarks: currentAttendance[studentId]?.remarks || 'បោះបង់ការសិក្សា (Dropped out)'
        }
      };
      setCurrentAttendance(nextMap);

      if (targetStudent) {
        const updatedStudent: Student = {
          ...targetStudent,
          status: 'DROPPED_OUT'
        };
        storageService.saveStudent(updatedStudent);
        setAllStudents(prev => prev.map(s => s.id === studentId ? updatedStudent : s));
        window.dispatchEvent(new CustomEvent('students-updated', { detail: { studentId, status: 'DROPPED_OUT' } }));
      }

      performAutoSave(nextMap);
      setSyncFeedback(`បានកំណត់ "${targetStudent?.nameKhmer || 'សិស្ស'}" ថាបោះបង់ការសិក្សា និងបានកត់ត្រាស្វ័យប្រវត្តិ!`);
      setTimeout(() => setSyncFeedback(null), 3500);
      return;
    }

    // Normal attendance change (PRESENT, ABSENT, LATE, PERMISSION)
    if (targetStudent && targetStudent.status === 'DROPPED_OUT') {
      const restoredStudent: Student = {
        ...targetStudent,
        status: 'ACTIVE'
      };
      storageService.saveStudent(restoredStudent);
      setAllStudents(prev => prev.map(s => s.id === studentId ? restoredStudent : s));
      window.dispatchEvent(new CustomEvent('students-updated', { detail: { studentId, status: 'ACTIVE' } }));
    }

    const nextMap = {
      ...currentAttendance,
      [studentId]: {
        ...currentAttendance[studentId],
        status
      }
    };
    // Optimistically update instant UI
    setCurrentAttendance(nextMap);
    // Instant Auto Save
    performAutoSave(nextMap);
  };

  // Restore dropped out student back to ACTIVE (Return to school)
  const handleRestoreStudent = (studentId: string) => {
    if (!canManageAttendance) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែគណៈគ្រប់គ្រង ឬលោកគ្រូ-អ្នកគ្រូប៉ុណ្ណោះដែលអាចស្តារសិស្សបាន!');
      return;
    }

    if (soundEnabled) {
      playAttendanceSound('RESTORE');
    }

    const targetStudent = allStudents.find(s => s.id === studentId);
    if (!targetStudent) return;

    const restoredStudent: Student = {
      ...targetStudent,
      status: 'ACTIVE'
    };

    // 1. Save restored student to persistent storage
    storageService.saveStudent(restoredStudent);

    // 2. Update allStudents state
    const updatedStudents = allStudents.map(s => s.id === studentId ? restoredStudent : s);
    setAllStudents(updatedStudents);

    // 3. Mark attendance status as PRESENT
    const nextMap = {
      ...currentAttendance,
      [studentId]: {
        status: 'PRESENT' as AttendanceStatus,
        remarks: ''
      }
    };
    setCurrentAttendance(nextMap);

    // 4. Save attendance record explicitly
    const studentClass = restoredStudent.className || classes.find(c => c.id === restoredStudent.classId)?.name || 'PC01';
    const restoredRecord: AttendanceRecord = {
      id: `ATT-${restoredStudent.id}-${selectedDate}`,
      studentId: restoredStudent.id,
      studentNameKhmer: restoredStudent.nameKhmer,
      studentCode: restoredStudent.studentCode,
      classId: restoredStudent.classId || 'PC01',
      className: studentClass,
      date: selectedDate,
      status: 'PRESENT',
      remarks: '',
      reason: '',
      recordedBy: 'គណៈគ្រប់គ្រងសាលា'
    };
    storageService.saveAttendanceBulk([restoredRecord]);

    performAutoSave(nextMap);

    // 5. Global sync event broadcast
    window.dispatchEvent(new CustomEvent('students-updated', { detail: { studentId, status: 'ACTIVE' } }));
    window.dispatchEvent(new CustomEvent('attendance-updated'));

    setSyncFeedback(`បានស្តារ "${targetStudent.nameKhmer}" ចូលរៀនវិញ (Return to School) និងកត់ត្រាស្វ័យប្រវត្តជោគជ័យ!`);
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  // Restore all dropped out students at once
  const handleRestoreAllStudents = () => {
    if (!canManageAttendance) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែគណៈគ្រប់គ្រង ឬលោកគ្រូ-អ្នកគ្រូប៉ុណ្ណោះដែលអាចស្តារសិស្សបាន!');
      return;
    }

    if (droppedOutStudents.length === 0) return;

    if (soundEnabled) {
      playAttendanceSound('RESTORE');
    }

    const restoredMap = { ...currentAttendance };
    const recordsToSave: AttendanceRecord[] = [];

    const updatedStudents = allStudents.map(s => {
      const isDropped = s.status === 'DROPPED_OUT' || currentAttendance[s.id]?.status === 'DROPPED_OUT';
      if (isDropped) {
        const restored: Student = { ...s, status: 'ACTIVE' };
        storageService.saveStudent(restored);
        restoredMap[s.id] = { status: 'PRESENT', remarks: '' };

        const sClass = s.className || classes.find(c => c.id === s.classId)?.name || 'PC01';
        recordsToSave.push({
          id: `ATT-${s.id}-${selectedDate}`,
          studentId: s.id,
          studentNameKhmer: s.nameKhmer,
          studentCode: s.studentCode,
          classId: s.classId || 'PC01',
          className: sClass,
          date: selectedDate,
          status: 'PRESENT',
          remarks: '',
          reason: '',
          recordedBy: 'គណៈគ្រប់គ្រងសាលា'
        });

        return restored;
      }
      return s;
    });

    setAllStudents(updatedStudents);
    setCurrentAttendance(restoredMap);
    storageService.saveAttendanceBulk(recordsToSave);
    performAutoSave(restoredMap);

    window.dispatchEvent(new CustomEvent('students-updated'));
    window.dispatchEvent(new CustomEvent('attendance-updated'));

    setSyncFeedback(`បានស្តារសិស្សទាំងអស់ (${recordsToSave.length} នាក់) ចូលរៀនវិញជោគជ័យ!`);
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  // Debounced auto-save for remarks text input
  const handleRemarksChange = (studentId: string, remarks: string) => {
    if (!canManageAttendance) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែគណៈគ្រប់គ្រង ឬលោកគ្រូ-អ្នកគ្រូប៉ុណ្ណោះដែលអាចកែប្រែវត្តមានបាន!');
      return;
    }
    const nextMap = {
      ...currentAttendance,
      [studentId]: {
        ...currentAttendance[studentId],
        remarks
      }
    };
    setCurrentAttendance(nextMap);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      performAutoSave(nextMap);
    }, 450);
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    if (!canManageAttendance) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែគណៈគ្រប់គ្រង ឬលោកគ្រូ-អ្នកគ្រូប៉ុណ្ណោះដែលអាចកែប្រែវត្តមានបាន!');
      return;
    }
    if (soundEnabled) {
      playAttendanceSound('BATCH');
    }

    const updated: Record<string, { status: AttendanceStatus; remarks: string }> = { ...currentAttendance };
    filteredStudents.forEach(s => {
      updated[s.id] = {
        status,
        remarks: currentAttendance[s.id]?.remarks || ''
      };
    });
    setCurrentAttendance(updated);
    performAutoSave(updated);
  };

  // Manual save backup button
  const handleSave = () => {
    if (!canManageAttendance) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែគណៈគ្រប់គ្រង ឬលោកគ្រូ-អ្នកគ្រូប៉ុណ្ណោះដែលអាចរក្សាទុកវត្តមានសិស្សបាន!');
      return;
    }
    if (soundEnabled) {
      playAttendanceSound('BATCH');
    }
    performAutoSave(currentAttendance);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-battambang flex items-center gap-2.5 flex-wrap">
            <span>កត់ត្រាវត្តមានសិស្សប្រចាំថ្ងៃ (Daily Attendance Tracking)</span>
            {/* Auto Save Live Status Badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all duration-300 ${
              isAutoSaving 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md shadow-amber-500/20 scale-102' 
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isAutoSaving ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAutoSaving ? 'កំពុងកត់ត្រា...' : `Auto-Saved (${lastAutoSavedTime})`}</span>
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
            <span>ស្រង់វត្តមានសិស្ស កត់ត្រាមូលហេតុច្បាប់ និងរក្សាទុកស្វ័យប្រវត្តភ្លាមៗ (Instant Auto-Save)</span>
            <span className="text-slate-600">•</span>
            <span className="text-indigo-300 font-medium">អត្រាវត្តមាន: {attendanceRate}%</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sound Alert Toggle Button */}
          <button
            type="button"
            onClick={toggleSound}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-2xl border text-xs font-bold transition shadow-sm font-battambang cursor-pointer ${
              soundEnabled
                ? 'bg-indigo-600/30 hover:bg-indigo-600/40 border-indigo-400/40 text-indigo-200'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400'
            }`}
            title={soundEnabled ? "សំឡេង Alert ពេលចុចវត្តមាន (Sound Enabled - Click to Mute)" : "បានបិទសំឡេង (Sound Muted - Click to Enable)"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>{soundEnabled ? 'សំឡេង: បើក (Alert ON)' : 'សំឡេង: បិទ (Muted)'}</span>
          </button>

          {/* Take All Students button */}
          <button
            id="btn-take-all-students-attendance"
            onClick={handleTakeAllStudents}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition shadow-sm active:scale-95 font-battambang cursor-pointer"
            title="ទាញយកសិស្សទាំងអស់ពីបញ្ជីសិស្ស (Take all students from Students directory)"
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>ទាញយកសិស្សទាំងអស់ ({allStudents.length})</span>
          </button>

          {/* Dropped Out Students Quick Button / Modal Trigger */}
          <button
            id="btn-view-dropped-out-students"
            onClick={() => {
              if (soundEnabled) playAttendanceSound('PERMISSION');
              setIsDroppedOutModalOpen(true);
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl border text-xs font-bold transition backdrop-blur-md font-battambang cursor-pointer ${
              droppedCount > 0
                ? 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/40 text-rose-300 shadow-sm'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
            }`}
            title="មើល ឬស្តារសិស្សដែលបានបោះបង់ការសិក្សា (View / Restore Dropped Out Students)"
          >
            <UserX className="w-4 h-4 text-rose-400" />
            <span>សិស្សបោះបង់ ({droppedCount})</span>
          </button>

          {syncFeedback && (
            <span className="inline-flex items-center space-x-1 px-3 py-2 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-2xl border border-amber-500/30 backdrop-blur-md animate-pulse">
              <CheckCheck className="w-4 h-4" />
              <span>{syncFeedback}</span>
            </span>
          )}

          {savedSuccess && (
            <span className="inline-flex items-center space-x-1 px-3 py-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-2xl border border-emerald-500/30 backdrop-blur-md">
              <CheckCheck className="w-4 h-4" />
              <span>បានរក្សាទុកជោគជ័យ!</span>
            </span>
          )}

          {canManageAttendance ? (
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl text-xs font-semibold transition shadow-lg shadow-indigo-500/20 border border-indigo-400/40 backdrop-blur-md font-battambang cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>រក្សាទុកវត្តមាន</span>
            </button>
          ) : (
            <button
              disabled
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800/80 text-slate-400 rounded-2xl text-xs font-semibold border border-white/5 cursor-not-allowed opacity-60 backdrop-blur-md font-battambang"
              title="សិទ្ធិមើលវត្តមាន (View Only)"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              <span>មើលវត្តមាន</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Time Study, Date, Search, Hide Dropped Out Switch, Batch Actions */}
      <div className="glass-panel p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Date Picker */}
          <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-2xl border border-white/10">
            <Calendar className="w-4 h-4 text-indigo-300" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => {
                setSelectedDate(e.target.value);
                setSavedSuccess(false);
              }}
              className="bg-transparent text-xs text-white font-medium outline-none cursor-pointer"
            />
          </div>

          {/* Time Study / Shift Filter */}
          <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-2xl border border-amber-500/30">
            <Clock className="w-4 h-4 text-amber-400" />
            <select
              value={selectedTimeStudy}
              onChange={e => setSelectedTimeStudy(e.target.value)}
              className="bg-transparent text-xs text-amber-300 font-medium outline-none font-battambang cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">🕒 គ្រប់ម៉ោងសិក្សា (All Shifts)</option>
              {availableTimeStudyOptions.map(t => (
                <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>
              ))}
            </select>
          </div>

          {/* Search by student name or code */}
          <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-2xl border border-white/10">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="ស្វែងរកឈ្មោះ ឬអត្តលេខ..."
              className="bg-transparent text-xs text-white placeholder-slate-400 outline-none w-32 sm:w-44 font-battambang"
            />
            {localSearch && (
              <button 
                onClick={() => setLocalSearch('')}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                title="សំអាត"
              >
                ✕
              </button>
            )}
          </div>

          {/* Hide Dropped Out Students Toggle */}
          <button
            type="button"
            onClick={() => {
              if (soundEnabled) playAttendanceSound('PERMISSION');
              setHideDroppedOut(prev => !prev);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl text-xs font-medium transition border font-battambang cursor-pointer ${
              hideDroppedOut
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                : 'bg-slate-800/80 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
            title={hideDroppedOut ? "កំពុងលាក់សិស្សបោះបង់ការសិក្សាពីបញ្ជីវត្តមាន (ចុចដើម្បីបង្ហាញទាំងអស់)" : "កំពុងបង្ហាញសិស្សទាំងអស់រួមទាំងសិស្សបោះបង់ (ចុចដើម្បីលាក់សិស្សបោះបង់)"}
          >
            {hideDroppedOut ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
            <span>{hideDroppedOut ? 'លាក់សិស្សបោះបង់ (Hide Dropped Out)' : 'បង្ហាញសិស្សបោះបង់'}</span>
          </button>

        </div>

        {/* Quick Batch Buttons */}
        {canManageAttendance ? (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-battambang hidden md:inline">កំណត់រហ័ស:</span>
            <button
              onClick={() => handleMarkAll('PRESENT')}
              className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl text-xs font-semibold transition font-battambang backdrop-blur-md cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>វត្តមានទាំងអស់ ({totalActive})</span>
            </button>
            <button
              onClick={() => handleMarkAll('ABSENT')}
              className="px-3 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 rounded-xl text-xs font-semibold transition font-battambang backdrop-blur-md cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>អវត្តមានទាំងអស់</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>សិទ្ធិមើលវត្តមានប៉ុណ្ណោះ</span>
          </div>
        )}
      </div>

      {/* Summary KPI Strip with Ultra-Fast Live Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="glass-card rounded-2xl p-4 text-center border-white/10 bg-slate-900/60 transition-transform duration-200 hover:scale-102">
          <span className="text-[11px] text-slate-400 font-battambang block">សិស្សសកម្ម (Active)</span>
          <span className="text-2xl font-extrabold text-white font-mono">{filteredStudents.length} <span className="text-xs text-slate-400 font-battambang">នាក់</span></span>
        </div>

        <div className="glass-card rounded-2xl p-4 text-center border-emerald-500/30 bg-emerald-950/25 transition-transform duration-200 hover:scale-102">
          <span className="text-[11px] text-emerald-400 font-battambang block flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>មករៀន (Present)</span>
          </span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono inline-block">
            {presentCount}
          </span>
          <span className="text-[10px] text-emerald-400/80 font-mono block mt-0.5">
            {totalActive > 0 ? ((presentCount / totalActive) * 100).toFixed(0) : 0}%
          </span>
        </div>

        <div className="glass-card rounded-2xl p-4 text-center border-amber-500/30 bg-amber-950/25 transition-transform duration-200 hover:scale-102">
          <span className="text-[11px] text-amber-400 font-battambang block flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>មកយឺត (Late)</span>
          </span>
          <span className="text-2xl font-extrabold text-amber-300 font-mono inline-block">
            {lateCount}
          </span>
          <span className="text-[10px] text-amber-400/80 font-mono block mt-0.5">
            {totalActive > 0 ? ((lateCount / totalActive) * 100).toFixed(0) : 0}%
          </span>
        </div>

        <div className="glass-card rounded-2xl p-4 text-center border-blue-500/30 bg-blue-950/25 transition-transform duration-200 hover:scale-102">
          <span className="text-[11px] text-blue-400 font-battambang block flex items-center justify-center gap-1">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>ច្បាប់ (Permission)</span>
          </span>
          <span className="text-2xl font-extrabold text-blue-300 font-mono inline-block">
            {permCount}
          </span>
          <span className="text-[10px] text-blue-400/80 font-mono block mt-0.5">
            {totalActive > 0 ? ((permCount / totalActive) * 100).toFixed(0) : 0}%
          </span>
        </div>

        <div className="glass-card rounded-2xl p-4 text-center border-rose-500/30 bg-rose-950/25 transition-transform duration-200 hover:scale-102">
          <span className="text-[11px] text-rose-400 font-battambang block flex items-center justify-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>អវត្តមាន (Absent)</span>
          </span>
          <span className="text-2xl font-extrabold text-rose-400 font-mono inline-block">
            {absentCount}
          </span>
          <span className="text-[10px] text-rose-400/80 font-mono block mt-0.5">
            {totalActive > 0 ? ((absentCount / totalActive) * 100).toFixed(0) : 0}%
          </span>
        </div>

        <div 
          onClick={() => {
            if (soundEnabled) playAttendanceSound('DROPPED_OUT');
            setIsDroppedOutModalOpen(true);
          }}
          className="glass-card rounded-2xl p-4 text-center border-rose-500/40 bg-gradient-to-b from-rose-950/40 to-slate-900/60 cursor-pointer hover:border-rose-400/60 transition group"
          title="ចុចដើម្បីមើល ឬស្តារសិស្សបោះបង់ការសិក្សា"
        >
          <span className="text-[11px] text-rose-300 font-battambang block flex items-center justify-center gap-1">
            <UserX className="w-3.5 h-3.5 text-rose-400" />
            <span>បោះបង់ (Dropped)</span>
          </span>
          <span className="text-2xl font-extrabold text-rose-400 font-mono group-hover:scale-105 transition-transform inline-block">
            {droppedCount}
          </span>
          <span className="text-[10px] text-rose-400/80 font-battambang block mt-0.5">
            ចុចដើម្បីស្តារ
          </span>
        </div>
      </div>

      {/* Attendance Table in Glass Panel */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-slate-300 font-battambang">
                <th className="py-3.5 px-3 font-semibold text-center w-12">ល.រ</th>
                <th className="py-3.5 px-4 font-semibold min-w-[140px]">រូបថត & អត្តលេខ</th>
                <th className="py-3.5 px-4 font-semibold min-w-[170px]">គោត្តនាម-នាម</th>
                <th className="py-3.5 px-3 font-semibold text-center w-16">ភេទ</th>
                <th className="py-3.5 px-4 font-semibold text-center min-w-[440px]">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span>ស្ថានភាពវត្តមាន (Status)</span>
                    <div className="inline-flex items-center gap-1 text-[10px] bg-slate-950/60 px-2 py-0.5 rounded-full border border-white/10 font-mono">
                      <span className="text-emerald-400 font-bold" title="មករៀន">✓{presentCount}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-blue-400 font-bold" title="ច្បាប់">📄{permCount}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-amber-400 font-bold" title="យឺត">🕒{lateCount}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-rose-400 font-bold" title="អវត្តមាន">✗{absentCount}</span>
                    </div>
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold min-w-[200px]">មូលហេតុ / ចំណាំ (Remarks)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-8 h-8 text-slate-500" />
                      <p className="font-battambang">មិនមានសិស្សក្នុងបញ្ជីវត្តមានសម្រាប់លក្ខខណ្ឌនេះទេ</p>
                      {droppedCount > 0 && hideDroppedOut && (
                        <p className="text-xs text-rose-300/80 font-battambang">
                          (មានសិស្សចំនួន {droppedCount} នាក់ត្រូវបានកំណត់ថាបោះបង់ការសិក្សា និងបានលាក់ដោយស្វ័យប្រវត្តិ)
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={handleTakeAllStudents}
                          className="text-xs text-amber-400 underline font-battambang hover:text-amber-300 cursor-pointer"
                        >
                          ទាញយកសិស្សទាំងអស់ ({allStudents.length}) ពីបញ្ជីសិស្ស
                        </button>
                        {droppedCount > 0 && (
                          <button
                            onClick={() => setIsDroppedOutModalOpen(true)}
                            className="text-xs text-rose-400 underline font-battambang hover:text-rose-300 cursor-pointer"
                          >
                            មើលសិស្សបោះបង់ការសិក្សា ({droppedCount} នាក់)
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => {
                  const currentStatus = currentAttendance[st.id]?.status || 'PRESENT';
                  const currentRemarks = currentAttendance[st.id]?.remarks || '';
                  const isDropped = st.status === 'DROPPED_OUT' || currentStatus === 'DROPPED_OUT';

                  return (
                    <tr key={st.id} className={`hover:bg-white/5 transition-colors ${isDropped ? 'bg-rose-950/10' : ''}`}>
                      <td className="py-3 px-3 font-mono text-slate-400 font-bold text-center">{idx + 1}</td>
                      
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <img 
                            src={getStudentDefaultAvatar(st)} 
                            alt={st.nameKhmer}
                            className="w-8 h-8 rounded-xl object-cover border border-white/20 bg-slate-800"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const fallback = getStudentDefaultAvatar({ gender: st.gender });
                              if (target.src !== fallback) {
                                target.src = fallback;
                              }
                            }}
                          />
                          <div>
                            <span className="font-mono font-bold text-indigo-300 block">{st.studentCode}</span>
                            {st.time_study && (
                              <span className="text-[10px] text-amber-300/80 font-mono block">{st.time_study}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-white font-battambang text-sm leading-tight">{st.nameKhmer}</p>
                          {isDropped && (
                            <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-bold rounded-md font-battambang">
                              បោះបង់
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">{st.nameEnglish}</p>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isFemaleGender(st.gender) ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {getGenderKhmer(st.gender)}
                        </span>
                      </td>

                      {/* Status Toggle Radio-like Buttons with Glass Glow and Instant Click Feedback */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-1.5 flex-wrap gap-y-1">
                          
                          {/* Present */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'PRESENT')}
                            className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-1 border text-[11px] cursor-pointer active:scale-95 select-none ${
                              currentStatus === 'PRESENT'
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30 scale-102 font-extrabold'
                                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-emerald-500/20 hover:text-emerald-300'
                            }`}
                            title="មករៀន (Present) - Auto-Saves on click"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="font-battambang">មករៀន</span>
                          </button>

                          {/* Permission */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'PERMISSION')}
                            className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-1 border text-[11px] cursor-pointer active:scale-95 select-none ${
                              currentStatus === 'PERMISSION'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-400 shadow-md shadow-blue-500/30 scale-102 font-extrabold'
                                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-blue-500/20 hover:text-blue-300'
                            }`}
                            title="ច្បាប់ (Permission) - Auto-Saves on click"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="font-battambang">ច្បាប់</span>
                          </button>

                          {/* Late */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'LATE')}
                            className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-1 border text-[11px] cursor-pointer active:scale-95 select-none ${
                              currentStatus === 'LATE'
                                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white border-amber-400 shadow-md shadow-amber-500/30 scale-102 font-extrabold'
                                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-amber-500/20 hover:text-amber-300'
                            }`}
                            title="មកយឺត (Late) - Auto-Saves on click"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span className="font-battambang">យឺត</span>
                          </button>

                          {/* Absent */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'ABSENT')}
                            className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-1 border text-[11px] cursor-pointer active:scale-95 select-none ${
                              currentStatus === 'ABSENT'
                                ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30 scale-102 font-extrabold'
                                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-rose-500/20 hover:text-rose-300'
                            }`}
                            title="អវត្តមាន (Absent) - Auto-Saves on click"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span className="font-battambang">អវត្តមាន</span>
                          </button>

                          {/* Dropped Out Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'DROPPED_OUT')}
                            className={`px-2.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-1 border text-[11px] cursor-pointer active:scale-95 select-none ${
                              isDropped
                                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-400 shadow-md shadow-rose-500/30 font-extrabold'
                                : 'bg-rose-500/10 text-rose-300/80 border-rose-500/30 hover:bg-rose-500/30 hover:text-rose-200'
                            }`}
                            title="បោះបង់ការសិក្សា (Dropped Out) - កំណត់ និងលាក់ចេញពីបញ្ជីវត្តមានដោយស្វ័យប្រវត្ត"
                          >
                            <UserX className="w-3.5 h-3.5 text-rose-300" />
                            <span className="font-battambang">បោះបង់</span>
                          </button>

                        </div>
                      </td>

                      {/* Remarks Field with Auto-Save and Quick Preset Suggestions */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <input
                            type="text"
                            list="attendance-remark-presets"
                            value={currentRemarks}
                            onChange={e => handleRemarksChange(st.id, e.target.value)}
                            placeholder="មូលហេតុ (ឧ. 🏢 មកការិយាល័យ, ឈឺក្បាល)..."
                            className="w-full px-3 py-1.5 bg-white/5 hover:bg-white/10 focus:bg-white/10 text-xs text-slate-200 placeholder-slate-500 rounded-xl border border-white/10 focus:border-indigo-400 outline-none font-battambang transition-colors"
                          />
                          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[9px]">
                            {[
                              { label: '🏢 មកការិយាល័យ', val: '🏢 មកការិយាល័យ (In Office)' },
                              { label: '🤒 ឈឺ/គ្រុន', val: '🤒 មានជំងឺ/ឈឺ' },
                              { label: '🚗 គ្រួសារធុរៈ', val: '🚗 គ្រួសារមានធុរៈចាំបាច់' },
                              { label: '🌧️ ភ្លៀងខ្លាំង', val: '🌧️ ភ្លៀងខ្លាំងមកមិនទាន់' },
                              { label: '📄 មានច្បាប់', val: '📄 មានច្បាប់អនុញ្ញាតត្រឹមត្រូវ' }
                            ].map((preset, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => handleRemarksChange(st.id, preset.val)}
                                className={`px-1.5 py-0.5 rounded-md border font-battambang whitespace-nowrap transition cursor-pointer ${
                                  currentRemarks === preset.val
                                    ? 'bg-indigo-500/30 text-indigo-200 border-indigo-400/40 font-bold'
                                    : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
                                }`}
                                title={`កំណត់មូលហេតុ: ${preset.val}`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary Info and Auto Save Timestamp */}
        <div className="p-4 bg-slate-950/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span>បង្ហាញសិស្សសរុប: <strong className="text-white">{filteredStudents.length}</strong> នាក់ • ម៉ោងសិក្សា: <strong className="text-amber-300">{selectedTimeStudy === 'ALL' ? 'គ្រប់ម៉ោងសិក្សា' : selectedTimeStudy}</strong> • កាលបរិច្ឆេទ: <strong className="text-indigo-300">{selectedDate}</strong></span>
            {droppedCount > 0 && (
              <span className="text-rose-400 font-semibold font-battambang">
                (សិស្សបោះបង់: {droppedCount} នាក់)
              </span>
            )}
            <span className="text-emerald-400/90 font-mono text-[11px] bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>Auto-Saved: {lastAutoSavedTime}</span>
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] flex-wrap gap-y-1">
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              <span className="text-emerald-300">មករៀន: {presentCount}</span>
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
              <span className="text-blue-300">ច្បាប់: {permCount}</span>
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
              <span className="text-amber-300">យឺត: {lateCount}</span>
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
              <span className="text-rose-300">អវត្តមាន: {absentCount}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Dropped Out Students Modal */}
      {isDroppedOutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 border border-rose-500/30 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-rose-500/20 border border-rose-500/30 rounded-2xl text-rose-300">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-battambang">បញ្ជីសិស្សបោះបង់ការសិក្សា (Dropped Out Students)</h3>
                  <p className="text-xs text-slate-400 font-battambang">
                    សិស្សក្នុងបញ្ជីនេះត្រូវបានលាក់ពីបញ្ជីវត្តមានប្រចាំថ្ងៃ។ ចុច "ស្តារចូលរៀនវិញ (Return to school)" ដើម្បីបញ្ចូលសិស្សមកបញ្ជីវត្តមានសកម្មវិញ។
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDroppedOutModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action toolbar inside modal if multiple students dropped out */}
            {droppedOutStudents.length > 1 && canManageAttendance && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <span className="text-emerald-300 font-battambang font-medium">
                  មានសិស្សបោះបង់សរុប {droppedOutStudents.length} នាក់
                </span>
                <button
                  onClick={handleRestoreAllStudents}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 rounded-xl text-xs font-bold transition active:scale-95 font-battambang cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-300" />
                  <span>ស្តារសិស្សទាំងអស់ចូលរៀនវិញ ({droppedOutStudents.length})</span>
                </button>
              </div>
            )}

            {/* Students List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {droppedOutStudents.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <UserCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="font-battambang text-sm text-slate-300">មិនមានសិស្សបោះបង់ការសិក្សាឡើយ!</p>
                  <p className="text-xs text-slate-500 mt-0.5">សិស្សទាំងអស់កំពុងស្ថិតក្នុងបញ្ជីវត្តមានសកម្ម</p>
                </div>
              ) : (
                droppedOutStudents.map((st, idx) => (
                  <div
                    key={st.id}
                    className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs text-slate-500 font-bold w-5">{idx + 1}</span>
                      <img
                        src={getStudentDefaultAvatar(st)}
                        alt={st.nameKhmer}
                        className="w-10 h-10 rounded-2xl object-cover border border-white/20 bg-slate-800"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallback = getStudentDefaultAvatar({ gender: st.gender });
                          if (target.src !== fallback) {
                            target.src = fallback;
                          }
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white font-battambang text-sm">{st.nameKhmer}</h4>
                          <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold rounded-full font-battambang">
                            បោះបង់ការសិក្សា
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="font-mono text-indigo-300">{st.studentCode}</span>
                          <span>•</span>
                          <span>{st.className || 'PC01'}</span>
                          {st.time_study && (
                            <>
                              <span>•</span>
                              <span className="text-amber-300/80">{st.time_study}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Restore / Return to school Button */}
                    {canManageAttendance ? (
                      <button
                        onClick={() => handleRestoreStudent(st.id)}
                        className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 rounded-2xl text-xs font-bold transition active:scale-95 font-battambang shadow-sm cursor-pointer whitespace-nowrap"
                        title="ស្តារសិស្សចូលរៀនវិញ (Return to school & Restore to Active Attendance)"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ស្តារចូលរៀនវិញ (Return to school)</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-battambang">សិទ្ធិសម្រាប់គណៈគ្រប់គ្រង</span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>សរុបសិស្សបោះបង់: <strong className="text-rose-300 font-mono">{droppedOutStudents.length}</strong> នាក់</span>
              <button
                onClick={() => setIsDroppedOutModalOpen(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-semibold transition font-battambang cursor-pointer"
              >
                បិទផ្ទាំង (Close)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

