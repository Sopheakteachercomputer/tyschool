import React, { useState, useMemo, useRef } from 'react';
import { 
  WeeklyQuizScore, 
  Student, 
  ClassRoom, 
  SchoolProfile, 
  User, 
  UserRole, 
  Language,
  WeeklyReport
} from '../types';
import { 
  Award, 
  Keyboard, 
  Code, 
  PenTool, 
  Plus, 
  Download, 
  Printer, 
  Save, 
  Trash2, 
  Sparkles, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Building, 
  ArrowUpDown,
  X,
  RefreshCw,
  FileSpreadsheet,
  HelpCircle,
  Clock,
  Medal,
  ChevronDown
} from 'lucide-react';
import { calculateKhmerGrade, exportToCSV, isFemaleGender, getGenderKhmer } from '../utils/formatters';
import { storageService } from '../services/storageService';

interface WeeklyQuizScoreListViewProps {
  quizScores: WeeklyQuizScore[];
  students: Student[];
  classes: ClassRoom[];
  weeklyReports?: WeeklyReport[];
  school?: SchoolProfile;
  currentUser?: User | null;
  userRole?: UserRole | string;
  language?: Language;
  onSaveScores: (scores: WeeklyQuizScore[]) => void;
  onDeleteScore?: (id: string) => void;
  initialSelectedClass?: string;
  initialSelectedFriday?: string;
}

export const WeeklyQuizScoreListView: React.FC<WeeklyQuizScoreListViewProps> = ({
  quizScores = [],
  students = [],
  classes = [],
  weeklyReports = [],
  school,
  currentUser,
  userRole = 'TEACHER',
  language = 'km',
  onSaveScores,
  onDeleteScore,
  initialSelectedClass,
  initialSelectedFriday
}) => {
  const activeSchool = school || storageService.getSchoolProfile();
  // Local list of scores for editing
  const [localScores, setLocalScores] = useState<WeeklyQuizScore[]>(quizScores);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Complete student list from props and storage
  const allStudents = useMemo(() => {
    const fromProps = students && students.length > 0 ? students : [];
    const fromStorage = storageService.getStudents() || [];
    const map = new Map<string, Student>();
    fromStorage.forEach(s => map.set(s.id, s));
    fromProps.forEach(s => map.set(s.id, s));
    return Array.from(map.values());
  }, [students]);

  // Quick lookup map for student shift/timeStudy and class
  const studentMetaMap = useMemo(() => {
    const map = new Map<string, { shift: string; className: string; student: Student }>();
    allStudents.forEach(s => {
      const shift = (s.time_study || s.timeStudy || '07:30 - 11:00').trim();
      const className = (s.className || 'PC01').trim();
      map.set(s.id, { shift, className, student: s });
      if (s.studentCode) {
        map.set(s.studentCode, { shift, className, student: s });
      }
    });
    return map;
  }, [allStudents]);

  // Filtering and Selection states
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (initialSelectedClass) return initialSelectedClass;
    return 'ALL';
  });

  // Extract distinct time_study / shift options from students and scores
  const availableTimeStudyOptions = useMemo(() => {
    const times = new Set<string>();
    allStudents.forEach(s => {
      const t = (s.time_study || s.timeStudy || '').trim();
      if (t) times.add(t);
    });
    localScores.forEach(s => {
      const t = (s.timeSlot || s.timeStudy || s.time_study || '').trim();
      if (t) times.add(t);
    });
    if (times.size === 0) {
      times.add('07:30 - 11:00');
      times.add('13:30 - 17:00');
    }
    return Array.from(times).sort();
  }, [allStudents, localScores]);

  // Selected shift / time study state
  const [selectedTimeStudy, setSelectedTimeStudy] = useState<string>('ALL');

  // Extract all Friday dates from reports or scores
  const availableFridays = useMemo(() => {
    const dates = new Set<string>();
    // From weekly reports
    weeklyReports.forEach(r => {
      if (r.dailyAttendance?.fri?.date) {
        dates.add(r.dailyAttendance.fri.date);
      }
    });
    // From quiz scores
    localScores.forEach(s => {
      if (s.fridayDate) dates.add(s.fridayDate);
    });
    // Default fridays if empty
    if (dates.size === 0) {
      dates.add('2026-08-14');
      dates.add('2026-08-21');
      dates.add('2026-08-28');
    }
    return Array.from(dates);
  }, [weeklyReports, localScores]);

  const [selectedFriday, setSelectedFriday] = useState<string>(() => {
    if (initialSelectedFriday) return initialSelectedFriday;
    return availableFridays[0] || '2026-08-14';
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'rank' | 'totalScore' | 'typingScore' | 'practiceScore' | 'writingScore' | 'name'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [scoreMaxScale, setScoreMaxScale] = useState<number>(10); // 10 or 100

  // Modal States
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);

  // Sync external quizScores when updated
  React.useEffect(() => {
    setLocalScores(quizScores);
  }, [quizScores]);

  // Keep localScores synced if initial props change
  React.useEffect(() => {
    if (initialSelectedClass) setSelectedClass(initialSelectedClass);
    if (initialSelectedFriday) setSelectedFriday(initialSelectedFriday);
  }, [initialSelectedClass, initialSelectedFriday]);

  // Available classes list (include PC01, PC02, PC03, PC04, allStudents classes, and school classes)
  const availableClassesList = useMemo(() => {
    const map = new Map<string, string>();
    // Coding Lab Classes
    map.set('PC01', 'PC01 (Scratch & Microbit)');
    map.set('PC02', 'PC02 (Web & Python)');
    map.set('PC03', 'PC03 (Ms Office 2024)');
    map.set('PC04', 'PC04 (CorelDRAW & Graphic)');

    // School Classes
    classes.forEach(c => {
      map.set(c.name, c.name);
      if (c.id && !map.has(c.id)) {
        map.set(c.id, `${c.name} [${c.id}]`);
      }
    });

    // From students
    allStudents.forEach(s => {
      if (s.className && !map.has(s.className)) {
        map.set(s.className, s.className);
      }
    });

    // Any other classes present in local scores
    localScores.forEach(s => {
      if (s.className && !map.has(s.className)) {
        map.set(s.className, s.className);
      }
    });

    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [classes, allStudents, localScores]);

  // Calculate scores for selected Friday, Class, and Shift
  const filteredScores = useMemo(() => {
    let result = localScores.filter(s => {
      const matchClass = selectedClass === 'ALL' || 
        s.className === selectedClass ||
        classes.some(c => (c.name === selectedClass || c.id === selectedClass) && (c.name === s.className || c.id === s.className));
      const matchFriday = selectedFriday === 'ALL' || s.fridayDate === selectedFriday;

      // Shift / Time Study matching
      const studentMeta = studentMetaMap.get(s.studentId || '') || studentMetaMap.get(s.studentCode || '');
      const scoreShift = (s.time_study || s.timeStudy || s.timeSlot || studentMeta?.shift || '').trim();
      const matchShift = selectedTimeStudy === 'ALL' || scoreShift === selectedTimeStudy.trim();

      return matchClass && matchFriday && matchShift;
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.studentNameKhmer.toLowerCase().includes(q) ||
        s.studentNameEnglish.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q)
      );
    }

    if (gradeFilter !== 'ALL') {
      result = result.filter(s => s.letterGrade === gradeFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comp = 0;
      if (sortField === 'rank') comp = (a.rank || 999) - (b.rank || 999);
      else if (sortField === 'totalScore') comp = b.totalScore - a.totalScore;
      else if (sortField === 'typingScore') comp = b.typingScore - a.typingScore;
      else if (sortField === 'practiceScore') comp = b.practiceScore - a.practiceScore;
      else if (sortField === 'writingScore') comp = b.writingScore - a.writingScore;
      else if (sortField === 'name') comp = a.studentNameKhmer.localeCompare(b.studentNameKhmer);

      return sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [localScores, selectedClass, selectedFriday, selectedTimeStudy, searchQuery, gradeFilter, sortField, sortOrder, classes, studentMetaMap]);

  // KPI Statistics
  const stats = useMemo(() => {
    const totalStudents = filteredScores.length;
    if (totalStudents === 0) {
      return {
        totalStudents: 0,
        avgTyping: 0,
        avgPractice: 0,
        avgWriting: 0,
        avgTotal: 0,
        avgPercentage: 0,
        passCount: 0,
        passRate: 0,
        topStudent: null as WeeklyQuizScore | null
      };
    }

    const sumTyping = filteredScores.reduce((acc, s) => acc + (s.typingScore || 0), 0);
    const sumPractice = filteredScores.reduce((acc, s) => acc + (s.practiceScore || 0), 0);
    const sumWriting = filteredScores.reduce((acc, s) => acc + (s.writingScore || 0), 0);
    const sumTotal = filteredScores.reduce((acc, s) => acc + (s.totalScore || 0), 0);
    const sumPct = filteredScores.reduce((acc, s) => acc + (s.percentage || 0), 0);

    const passCount = filteredScores.filter(s => s.percentage >= 50).length;
    const sortedByTotal = [...filteredScores].sort((a, b) => b.totalScore - a.totalScore);

    return {
      totalStudents,
      avgTyping: Number((sumTyping / totalStudents).toFixed(1)),
      avgPractice: Number((sumPractice / totalStudents).toFixed(1)),
      avgWriting: Number((sumWriting / totalStudents).toFixed(1)),
      avgTotal: Number((sumTotal / totalStudents).toFixed(1)),
      avgPercentage: Math.round(sumPct / totalStudents),
      passCount,
      passRate: Math.round((passCount / totalStudents) * 100),
      topStudent: sortedByTotal[0] || null
    };
  }, [filteredScores]);

  // Helper to calculate Grade & Rank
  const recalculateRanksAndGrades = (items: WeeklyQuizScore[]): WeeklyQuizScore[] => {
    // Sort descending by total score to calculate ranking
    const sorted = [...items].sort((a, b) => b.totalScore - a.totalScore);
    return sorted.map((item, index) => {
      const rank = index + 1;
      const pct = Math.min(100, Math.max(0, Math.round((item.totalScore / (item.maxScorePerSubject * 3)) * 100)));
      const gradeCalc = calculateKhmerGrade(pct);
      return {
        ...item,
        rank,
        percentage: pct,
        averageScore: Number((item.totalScore / 3).toFixed(2)),
        letterGrade: gradeCalc.letter,
        gradeKhmer: gradeCalc.khmer
      };
    });
  };

  // Update a single score item inline
  const handleScoreChange = (
    id: string, 
    field: 'typingScore' | 'practiceScore' | 'writingScore' | 'remarks', 
    val: string | number
  ) => {
    setLocalScores(prev => {
      const updated = prev.map(s => {
        if (s.id !== id) return s;
        let typing = s.typingScore;
        let practice = s.practiceScore;
        let writing = s.writingScore;
        let remarks = s.remarks;

        if (field === 'typingScore') typing = Math.max(0, Math.min(s.maxScorePerSubject, Number(val) || 0));
        if (field === 'practiceScore') practice = Math.max(0, Math.min(s.maxScorePerSubject, Number(val) || 0));
        if (field === 'writingScore') writing = Math.max(0, Math.min(s.maxScorePerSubject, Number(val) || 0));
        if (field === 'remarks') remarks = String(val);

        const total = Number((typing + practice + writing).toFixed(1));
        const avg = Number((total / 3).toFixed(2));
        const pct = Math.min(100, Math.max(0, Math.round((total / (s.maxScorePerSubject * 3)) * 100)));
        const gradeCalc = calculateKhmerGrade(pct);

        return {
          ...s,
          typingScore: typing,
          practiceScore: practice,
          writingScore: writing,
          remarks,
          totalScore: total,
          averageScore: avg,
          percentage: pct,
          letterGrade: gradeCalc.letter,
          gradeKhmer: gradeCalc.khmer
        };
      });

      // Recalculate ranks for the group
      const matchingGroup = updated.filter(item => item.className === selectedClass && item.fridayDate === selectedFriday);
      const otherGroup = updated.filter(item => !(item.className === selectedClass && item.fridayDate === selectedFriday));
      const reRanked = recalculateRanksAndGrades(matchingGroup);

      setHasUnsavedChanges(true);
      return [...otherGroup, ...reRanked];
    });
  };

  // Save changes
  const handleSaveAll = () => {
    onSaveScores(localScores);
    setHasUnsavedChanges(false);
    setSaveSuccessMsg('បានរក្សាទុកពិន្ទុ Quiz ប្រចាំសប្តាហ៍ដោយជោគជ័យ!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Delete a score row
  const handleDeleteRow = (id: string) => {
    if (window.confirm(language === 'km' ? 'តើអ្នកពិតជាចង់លុបពិន្ទុសិស្សនេះមែនទេ?' : 'Are you sure you want to delete this score record?')) {
      const updated = localScores.filter(s => s.id !== id);
      setLocalScores(updated);
      onSaveScores(updated);
      if (onDeleteScore) onDeleteScore(id);
    }
  };

  // Take all students from Students and populate / synchronize their Friday quiz scores
  const handleTakeAllStudents = (silent = false) => {
    if (allStudents.length === 0) return;

    const targetFriday = selectedFriday === 'ALL' ? (availableFridays[0] || '2026-08-14') : selectedFriday;
    const is100 = scoreMaxScale === 100;
    const baseMult = is100 ? 10 : 1;

    const baseScores = [
      [9.5, 9.0, 9.0],
      [9.0, 9.5, 8.5],
      [8.5, 8.5, 9.0],
      [8.0, 9.0, 8.0],
      [8.5, 8.0, 8.0],
      [7.5, 8.0, 7.5],
      [8.0, 7.5, 7.0],
      [7.0, 7.5, 7.0],
      [9.0, 8.5, 8.5],
      [8.5, 8.0, 7.5],
      [7.5, 7.0, 6.5],
      [8.0, 7.5, 7.5]
    ];

    const comments = [
      'វាយអត្ថបទបានលឿន និងសរសេរកូដអនុវត្តបានល្អណាស់',
      'ការអនុវត្តប្លុកបញ្ជាយល់បានលឿន ឆ្លើយសំណួរបានត្រឹមត្រូវ',
      'មានភាពរហ័សរហួន និងយកចិត្តទុកដាក់ខ្ពស់',
      'លទ្ធផលល្អប្រសើរ គួរពង្រឹងល្បឿន Typing បន្ថែម',
      'អនុវត្តបានពេញលេញ យល់ដឹងពីទ្រឹស្តីច្បាស់លាស់',
      'សរសេរកូដបានល្អ និងឆ្លើយត្រូវគ្រប់សំណួរ',
      'មានការយល់ដឹងខ្ពស់ក្នុងការបំពេញការងារ'
    ];

    // Build map of existing scores for targetFriday
    const existingScoreMap = new Map<string, WeeklyQuizScore>();
    localScores
      .filter(s => s.fridayDate === targetFriday)
      .forEach(s => {
        if (s.studentId) existingScoreMap.set(s.studentId, s);
        if (s.studentCode) existingScoreMap.set(s.studentCode, s);
      });

    const otherScores = localScores.filter(s => s.fridayDate !== targetFriday);

    // Merge or create a score for every single student in allStudents
    const synchronizedScores: WeeklyQuizScore[] = allStudents.map((stu, idx) => {
      const existing = existingScoreMap.get(stu.id) || existingScoreMap.get(stu.studentCode || '');
      const studentShift = (stu.time_study || stu.timeStudy || '07:30 - 11:00').trim();
      const studentClass = stu.className || (selectedClass !== 'ALL' ? selectedClass : 'PC01');

      if (existing) {
        return {
          ...existing,
          className: existing.className || studentClass,
          timeSlot: existing.timeSlot || studentShift,
          timeStudy: existing.timeStudy || studentShift,
          time_study: existing.time_study || studentShift,
          studentNameKhmer: stu.nameKhmer || existing.studentNameKhmer,
          studentNameEnglish: stu.nameEnglish || existing.studentNameEnglish,
          studentCode: stu.studentCode || existing.studentCode,
          gender: (stu.gender as 'MALE' | 'FEMALE') || existing.gender
        };
      }

      const triple = baseScores[idx % baseScores.length];
      const typing = Number((triple[0] * baseMult).toFixed(1));
      const practice = Number((triple[1] * baseMult).toFixed(1));
      const writing = Number((triple[2] * baseMult).toFixed(1));
      const total = Number((typing + practice + writing).toFixed(1));
      const avg = Number((total / 3).toFixed(2));
      const pct = Math.round((total / (scoreMaxScale * 3)) * 100);
      const gradeCalc = calculateKhmerGrade(pct);

      return {
        id: `WQS-ALL-${stu.id}-${targetFriday}`,
        studentId: stu.id,
        studentCode: stu.studentCode || `STU-${String(idx + 1).padStart(4, '0')}`,
        studentNameKhmer: stu.nameKhmer,
        studentNameEnglish: stu.nameEnglish,
        gender: (stu.gender as 'MALE' | 'FEMALE') || (idx % 2 === 0 ? 'MALE' : 'FEMALE'),
        className: studentClass,
        timeSlot: studentShift,
        timeStudy: studentShift,
        time_study: studentShift,
        weekNumber: 3,
        weekTitle: `Weekly Quiz - ${studentClass}`,
        fridayDate: targetFriday,
        typingScore: typing,
        practiceScore: practice,
        writingScore: writing,
        maxScorePerSubject: scoreMaxScale,
        totalScore: total,
        averageScore: avg,
        percentage: pct,
        letterGrade: gradeCalc.letter,
        gradeKhmer: gradeCalc.khmer,
        rank: idx + 1,
        remarks: comments[idx % comments.length],
        teacherName: currentUser?.nameKhmer || 'Rin Sopheak',
        recordedDate: targetFriday
      };
    });

    const reRanked = recalculateRanksAndGrades(synchronizedScores);
    const finalScores = [...otherScores, ...reRanked];

    setLocalScores(finalScores);
    onSaveScores(finalScores);
    if (!silent) {
      setSaveSuccessMsg(`បានទាញយកសិស្សទាំងអស់ (${allStudents.length} នាក់) ពីបញ្ជីសិស្ស (Students) ចូលក្នុងពិន្ទុ Quiz ប្រចាំសប្តាហ៍ដោយជោគជ័យ!`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
  };

  // Auto-take all students from Students if not yet populated for selected Friday
  React.useEffect(() => {
    if (allStudents.length === 0) return;
    const targetFriday = selectedFriday === 'ALL' ? (availableFridays[0] || '2026-08-14') : selectedFriday;
    
    const existingStudentIds = new Set<string>();
    localScores
      .filter(s => s.fridayDate === targetFriday)
      .forEach(s => {
        if (s.studentId) existingStudentIds.add(s.studentId);
        if (s.studentCode) existingStudentIds.add(s.studentCode);
      });

    const missingStudents = allStudents.filter(
      s => !existingStudentIds.has(s.id) && !existingStudentIds.has(s.studentCode || '')
    );

    // If there are missing students from the full student directory, sync them
    if (missingStudents.length > 0) {
      handleTakeAllStudents(true);
    }
  }, [allStudents.length, selectedFriday]);

  // Auto-populate / generate realistic Friday quiz scores for the class
  const handleAutoPopulateClass = () => {
    // Determine students to populate: prioritize students belonging to this class
    const classObj = classes.find(c => c.id === selectedClass || c.name === selectedClass);
    const classStudents = students.filter(s => 
      s.className === selectedClass || 
      (classObj && s.classId === classObj.id) ||
      (selectedClass.startsWith('PC') && s.className?.includes(selectedClass))
    );
    const fallbackStudents = [
      { id: 'STU-001', studentCode: 'STU-2026-0001', nameKhmer: 'ហេង ពិសិដ្ឋ', nameEnglish: 'Heng Piseth', gender: 'MALE' },
      { id: 'STU-002', studentCode: 'STU-2026-0002', nameKhmer: 'ស៊ន កុសល', nameEnglish: 'Sorn Kosal', gender: 'MALE' },
      { id: 'STU-003', studentCode: 'STU-2026-0003', nameKhmer: 'ម៉ៅ សុខា', nameEnglish: 'Mao Sokha', gender: 'MALE' },
      { id: 'STU-004', studentCode: 'STU-2026-0004', nameKhmer: 'សួស ស្រីណែត', nameEnglish: 'Sous Sreynet', gender: 'FEMALE' },
      { id: 'STU-005', studentCode: 'STU-2026-0005', nameKhmer: 'គង់ ចិន្តា', nameEnglish: 'Kong Chenda', gender: 'FEMALE' },
      { id: 'STU-006', studentCode: 'STU-2026-0006', nameKhmer: 'ជា វិបុល', nameEnglish: 'Chea Vibul', gender: 'MALE' },
      { id: 'STU-007', studentCode: 'STU-2026-0007', nameKhmer: 'ពេជ្រ រចនា', nameEnglish: 'Pich Rachana', gender: 'FEMALE' },
      { id: 'STU-008', studentCode: 'STU-2026-0008', nameKhmer: 'ឡុង វ៉ាន់ដា', nameEnglish: 'Long Vanda', gender: 'MALE' },
      { id: 'STU-009', studentCode: 'STU-2026-0009', nameKhmer: 'ឈុន ស្រីមុំ', nameEnglish: 'Chhun Sreymom', gender: 'FEMALE' },
      { id: 'STU-010', studentCode: 'STU-2026-0010', nameKhmer: 'សេង ពិសី', nameEnglish: 'Seng Pisey', gender: 'FEMALE' },
    ];
    const pool = classStudents.length > 0 ? classStudents : (students.length > 0 ? students : fallbackStudents);

    const newEntries: WeeklyQuizScore[] = pool.slice(0, 12).map((stu, idx) => {
      // Generate realistic scores between 6.5 and 10.0 (or 65-100)
      const is100 = scoreMaxScale === 100;
      const baseMult = is100 ? 10 : 1;
      const baseScores = [
        [9.5, 9.0, 9.0],
        [9.0, 9.5, 8.5],
        [8.5, 8.5, 9.0],
        [8.0, 9.0, 8.0],
        [8.5, 8.0, 8.0],
        [7.5, 8.0, 7.5],
        [8.0, 7.5, 7.0],
        [7.0, 7.5, 7.0],
        [9.0, 8.5, 8.5],
        [8.5, 8.0, 7.5],
        [7.5, 7.0, 6.5],
        [8.0, 7.5, 7.5]
      ];

      const triple = baseScores[idx % baseScores.length];
      const typing = Number((triple[0] * baseMult).toFixed(1));
      const practice = Number((triple[1] * baseMult).toFixed(1));
      const writing = Number((triple[2] * baseMult).toFixed(1));
      const total = Number((typing + practice + writing).toFixed(1));
      const avg = Number((total / 3).toFixed(2));
      const pct = Math.round((total / (scoreMaxScale * 3)) * 100);
      const gradeCalc = calculateKhmerGrade(pct);

      const comments = [
        'វាយអត្ថបទបានលឿន និងសរសេរកូដអនុវត្តបានល្អណាស់',
        'ការអនុវត្តប្លុកបញ្ជាយល់បានលឿន ឆ្លើយសំណួរបានត្រឹមត្រូវ',
        'មានភាពរហ័សរហួន និងយកចិត្តទុកដាក់ខ្ពស់',
        'លទ្ធផលល្អប្រសើរ គួរពង្រឹងល្បឿន Typing បន្ថែម',
        'អនុវត្តបានពេញលេញ យល់ដឹងពីទ្រឹស្តីច្បាស់លាស់',
        'សរសេរកូដបានល្អ និងឆ្លើយត្រូវគ្រប់សំណួរ'
      ];

      const studentMeta = studentMetaMap.get(stu.id) || studentMetaMap.get(stu.studentCode || '');
      const studentShift = stu.time_study || stu.timeStudy || studentMeta?.shift || '07:30 - 11:00';

      return {
        id: `WQS-${Date.now().toString().slice(-4)}-${idx + 1}`,
        studentId: stu.id,
        studentCode: stu.studentCode || `STU-2026-${String(idx + 1).padStart(4, '0')}`,
        studentNameKhmer: stu.nameKhmer,
        studentNameEnglish: stu.nameEnglish,
        gender: (stu.gender as 'MALE' | 'FEMALE') || (idx % 2 === 0 ? 'MALE' : 'FEMALE'),
        className: selectedClass !== 'ALL' ? selectedClass : (stu.className || 'PC01'),
        timeSlot: studentShift,
        timeStudy: studentShift,
        time_study: studentShift,
        weekNumber: 3,
        weekTitle: `Weekly Quiz Plan - ${selectedClass}`,
        fridayDate: selectedFriday === 'ALL' ? (availableFridays[0] || '2026-08-14') : selectedFriday,
        typingScore: typing,
        practiceScore: practice,
        writingScore: writing,
        maxScorePerSubject: scoreMaxScale,
        totalScore: total,
        averageScore: avg,
        percentage: pct,
        letterGrade: gradeCalc.letter,
        gradeKhmer: gradeCalc.khmer,
        rank: idx + 1,
        remarks: comments[idx % comments.length],
        teacherName: currentUser?.nameKhmer || 'Rin Sopheak',
        recordedDate: selectedFriday === 'ALL' ? (availableFridays[0] || '2026-08-14') : selectedFriday
      };
    });

    // Remove existing for this Friday and class, then add new
    const filteredOut = localScores.filter(s => !(s.className === selectedClass && s.fridayDate === selectedFriday));
    const reRanked = recalculateRanksAndGrades(newEntries);
    const combined = [...filteredOut, ...reRanked];

    setLocalScores(combined);
    onSaveScores(combined);
    setSaveSuccessMsg(`បានបញ្ចូលទិន្នន័យសិស្ស ${newEntries.length} នាក់ក្នុងថ្នាក់ ${selectedClass} ដោយស្វ័យប្រវត្តិ!`);
    setShowBatchModal(false);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'ចំណាត់ថ្នាក់ (Rank)',
      'អត្តលេខ (Student ID)',
      'ឈ្មោះខ្មែរ (Khmer Name)',
      'ឈ្មោះអង់គ្លេស (English Name)',
      'ភេទ (Gender)',
      'ថ្នាក់ (Class)',
      'ម៉ោងសិក្សា (Shift)',
      'កាលបរិច្ឆេទថ្ងៃសុក្រ (Friday Date)',
      'ពិន្ទុ Typing (Typing Score)',
      'ពិន្ទុ Practice (Practice Score)',
      'ពិន្ទុ Writing (Writing Score)',
      'ពិន្ទុសរុប (Total Score)',
      'មធ្យមភាគ (Average)',
      'ភាគរយ (Percentage %)',
      'និទ្ទេស (Grade)',
      'ការកត់សម្គាល់ (Remarks)'
    ];

    const rows = filteredScores.map(s => {
      const studentMeta = studentMetaMap.get(s.studentId || '') || studentMetaMap.get(s.studentCode || '');
      const shift = s.time_study || s.timeStudy || s.timeSlot || studentMeta?.shift || '';
      return [
        String(s.rank || ''),
        s.studentCode,
        s.studentNameKhmer,
        s.studentNameEnglish,
        isFemaleGender(s.gender) ? 'ស្រី (F)' : 'ប្រុស (M)',
        s.className,
        shift,
        s.fridayDate,
        String(s.typingScore),
        String(s.practiceScore),
        String(s.writingScore),
        String(s.totalScore),
        String(s.averageScore),
        `${s.percentage}%`,
        s.letterGrade,
        s.remarks || ''
      ];
    });

    exportToCSV(
      `Weekly_Quiz_Scores_${selectedClass}_Friday_${selectedFriday.replace(/\//g, '-')}`,
      headers,
      rows
    );
  };

  // Print Score Sheet
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Printable School Header (Only appears when printed) */}
      <div className="hidden print:block text-black p-4 border-b-2 border-black mb-6">
        <div className="text-center space-y-1">
          <p className="font-moul text-lg font-bold">ព្រះរាជាណាចក្រកម្ពុជា</p>
          <p className="font-moul text-base">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
          <div className="w-24 h-0.5 bg-black mx-auto my-1"></div>
          <h2 className="font-bold text-xl uppercase tracking-wider pt-2">{activeSchool.nameKhmer}</h2>
          <h3 className="font-semibold text-sm text-gray-700">{activeSchool.nameEnglish}</h3>
          <div className="pt-2 text-base font-bold underline">
            បញ្ជីពិន្ទុប្រឡង Quiz ប្រចាំសប្តាហ៍ (រៀងរាល់ថ្ងៃសុក្រ)
          </div>
          <p className="text-xs text-gray-700">
            ថ្នាក់ (Class): <strong>{selectedClass === 'ALL' ? 'គ្រប់ថ្នាក់ (All Classes)' : selectedClass}</strong> • ម៉ោងសិក្សា (Shift): <strong>{selectedTimeStudy === 'ALL' ? 'គ្រប់ម៉ោងសិក្សា (All Shifts)' : selectedTimeStudy}</strong> • កាលបរិច្ឆេទថ្ងៃសុក្រ (Friday Date): <strong>{selectedFriday === 'ALL' ? 'គ្រប់កាលបរិច្ឆេទ' : selectedFriday}</strong> • មុខវិជ្ជា/ជំនាញ: <strong>Typing, Practice, Writing</strong>
          </p>
        </div>
      </div>

      {/* Main Screen Header & Action Bar */}
      <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden no-print">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === 'km' ? 'ប្រឡងរៀងរាល់ថ្ងៃសុក្រ' : 'Evaluated Every Friday'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{language === 'km' ? 'បញ្ជីពិន្ទុ Quiz ប្រចាំសប្តាហ៍' : 'Weekly Quiz Score List'}</span>
              <span className="text-xs font-normal px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-slate-300">
                Friday Evaluation
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-cyan-400" />
              <span><strong>Typing:</strong> ការវាយអត្ថបទកុំព្យូទ័រ</span>
              <span className="text-slate-600">•</span>
              <Code className="w-4 h-4 text-emerald-400" />
              <span><strong>Practice:</strong> ការអនុវត្តជាក់ស្តែង</span>
              <span className="text-slate-600">•</span>
              <PenTool className="w-4 h-4 text-amber-400" />
              <span><strong>Writing:</strong> សំណេរ/ទ្រឹស្តី</span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Take All Students button */}
            <button
              id="btn-take-all-students"
              onClick={() => handleTakeAllStudents(false)}
              className="px-3.5 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-lg active:scale-95"
              title={language === 'km' ? 'ទាញយកសិស្សទាំងអស់ពីបញ្ជីសិស្ស (Students)' : 'Take all students from Students'}
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>{language === 'km' ? `ទាញយកសិស្សទាំងអស់ (${allStudents.length})` : `Take All Students (${allStudents.length})`}</span>
            </button>

            <button
              onClick={() => setShowBatchModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-lg active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{language === 'km' ? 'បំពេញគំរូថ្នាក់' : 'Auto-Populate'}</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-lg shadow-indigo-600/30 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'km' ? 'បន្ថែមសិស្ស' : 'Add Student'}</span>
            </button>

            {hasUnsavedChanges && (
              <button
                onClick={handleSaveAll}
                className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-lg shadow-emerald-600/40 animate-pulse active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{language === 'km' ? 'រក្សាទុកពិន្ទុ' : 'Save Changes'}</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all"
              title="Export CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all"
              title="Print Score Sheet"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">{language === 'km' ? 'បោះពុម្ព' : 'Print'}</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* KPI Cards (Overview Statistics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 no-print">
        {/* Total Students */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{language === 'km' ? 'សិស្សប្រឡង' : 'Tested'}</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats.totalStudents}</div>
            <div className="text-[10px] text-slate-400">
              {selectedClass === 'ALL' ? 'គ្រប់ថ្នាក់' : selectedClass} • {selectedTimeStudy === 'ALL' ? 'គ្រប់ម៉ោង' : selectedTimeStudy}
            </div>
          </div>
        </div>

        {/* Avg Typing */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <span className="text-xs font-medium">{language === 'km' ? 'មធ្យម Typing' : 'Avg Typing'}</span>
            <Keyboard className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-black text-cyan-300">
              {stats.avgTyping} <span className="text-xs text-cyan-400/80">/{scoreMaxScale}</span>
            </div>
            <div className="text-[10px] text-cyan-400/80">ការវាយអត្ថបទ</div>
          </div>
        </div>

        {/* Avg Practice */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-medium">{language === 'km' ? 'មធ្យម Practice' : 'Avg Practice'}</span>
            <Code className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-300">
              {stats.avgPractice} <span className="text-xs text-emerald-400/80">/{scoreMaxScale}</span>
            </div>
            <div className="text-[10px] text-emerald-400/80">ការអនុវត្តផ្ទាល់</div>
          </div>
        </div>

        {/* Avg Writing */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-medium">{language === 'km' ? 'មធ្យម Writing' : 'Avg Writing'}</span>
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-300">
              {stats.avgWriting} <span className="text-xs text-amber-400/80">/{scoreMaxScale}</span>
            </div>
            <div className="text-[10px] text-amber-400/80">សំណេរ & ទ្រឹស្តី</div>
          </div>
        </div>

        {/* Overall Percentage */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <span className="text-xs font-medium">{language === 'km' ? 'មធ្យមរួម' : 'Overall %'}</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-black text-purple-300">
              {stats.avgPercentage}%
            </div>
            <div className="text-[10px] text-purple-400/80">
              {stats.avgTotal} / {scoreMaxScale * 3} pts
            </div>
          </div>
        </div>

        {/* Pass Rate & Top Student */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-medium">{language === 'km' ? 'អត្រាជាប់' : 'Pass Rate'}</span>
            <Medal className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-300">
              {stats.passRate}%
            </div>
            <div className="text-[10px] text-slate-300 truncate" title={stats.topStudent ? stats.topStudent.studentNameKhmer : ''}>
              {stats.topStudent ? `🥇 ${stats.topStudent.studentNameKhmer}` : 'ជាប់ 100%'}
            </div>
          </div>
        </div>
      </div>

      {/* Control & Filter Strip */}
      <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl no-print">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Select */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold">{language === 'km' ? 'ថ្នាក់:' : 'Class:'}</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-800 border border-white/15 text-white text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="ALL">-- គ្រប់ថ្នាក់ (All Classes) --</option>
              {availableClassesList.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Shift / Time Study Filter (🕒 គ្រប់ម៉ោងសិក្សា (All Shifts)) */}
          <div className="flex items-center gap-2 bg-slate-800/90 border border-amber-500/30 rounded-xl px-3 py-1.5 shadow-sm">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              id="select-quiz-time-study"
              value={selectedTimeStudy}
              onChange={(e) => setSelectedTimeStudy(e.target.value)}
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

          {/* Friday Date Select */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold">{language === 'km' ? 'ថ្ងៃសុក្រ (Friday):' : 'Friday:'}</span>
            <select
              value={selectedFriday}
              onChange={(e) => setSelectedFriday(e.target.value)}
              className="bg-slate-800 border border-white/15 text-white text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="ALL">-- គ្រប់កាលបរិច្ឆេទ (All Fridays) --</option>
              {availableFridays.map(fri => (
                <option key={fri} value={fri}>📅 ថ្ងៃសុក្រ {fri}</option>
              ))}
            </select>
          </div>

          {/* Scale toggle (Max 10 vs Max 100) */}
          <div className="flex items-center space-x-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Scale:</span>
            <button
              onClick={() => setScoreMaxScale(10)}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                scoreMaxScale === 10 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              /10 (សរុប 30)
            </button>
            <button
              onClick={() => setScoreMaxScale(100)}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                scoreMaxScale === 100 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              /100 (សរុប 300)
            </button>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'km' ? 'ស្វែងរកសិស្ស...' : 'Search student...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border border-white/15 text-white text-xs rounded-xl pl-8 pr-3 py-2 w-40 sm:w-48 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-500"
            />
          </div>

          {/* Grade filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="bg-slate-800 border border-white/15 text-white text-xs rounded-xl px-2.5 py-2 outline-none"
          >
            <option value="ALL">និទ្ទេសទាំងអស់</option>
            <option value="A">Grade A (ល្អប្រសើរ)</option>
            <option value="B">Grade B (ល្អណាស់)</option>
            <option value="C">Grade C (ល្អ)</option>
            <option value="D">Grade D (មធ្យម)</option>
            <option value="E">Grade E (ខ្សោយ)</option>
            <option value="F">Grade F (ធ្លាក់)</option>
          </select>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scores Table Container */}
      <div className="bg-slate-900/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-950/80 border-b border-white/10 text-slate-400 font-semibold">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-3 w-28">អត្តលេខ</th>
                <th className="py-3 px-4 min-w-[180px]">ឈ្មោះសិស្ស</th>
                <th className="py-3 px-3 w-16 text-center">ភេទ</th>
                <th className="py-3 px-3 text-center bg-cyan-950/30 border-l border-r border-cyan-500/20 text-cyan-300 font-bold min-w-[110px]">
                  <div className="flex items-center justify-center space-x-1">
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>Typing (/{scoreMaxScale})</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center bg-emerald-950/30 border-r border-emerald-500/20 text-emerald-300 font-bold min-w-[110px]">
                  <div className="flex items-center justify-center space-x-1">
                    <Code className="w-3.5 h-3.5" />
                    <span>Practice (/{scoreMaxScale})</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center bg-amber-950/30 border-r border-amber-500/20 text-amber-300 font-bold min-w-[110px]">
                  <div className="flex items-center justify-center space-x-1">
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Writing (/{scoreMaxScale})</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center bg-purple-950/40 text-purple-300 font-bold w-24">
                  សរុប (Total)
                </th>
                <th className="py-3 px-3 text-center w-20">មធ្យម %</th>
                <th className="py-3 px-3 text-center w-24">និទ្ទេស</th>
                <th className="py-3 px-3 text-center w-16">ចំណាត់ថ្នាក់</th>
                <th className="py-3 px-4 min-w-[160px]">ការកត់សម្គាល់ / មតិគ្រូ</th>
                <th className="py-3 px-3 text-center w-14 no-print">សកម្មភាព</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-white/5">
              {filteredScores.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium">
                        {language === 'km' 
                          ? `មិនទាន់មានទិន្នន័យពិន្ទុ Quiz សម្រាប់ថ្នាក់ ${selectedClass} នៅថ្ងៃសុក្រ ${selectedFriday} ទេ` 
                          : `No quiz score data found for class ${selectedClass} on Friday ${selectedFriday}`}
                      </p>
                      <button
                        onClick={handleAutoPopulateClass}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{language === 'km' ? 'បំពេញទិន្នន័យសិស្សស្វ័យប្រវត្តិ' : 'Auto-Populate Class Scores'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredScores.map((score, index) => {
                  const isTop3 = (score.rank || index + 1) <= 3;
                  const studentMeta = studentMetaMap.get(score.studentId || '') || studentMetaMap.get(score.studentCode || '');
                  return (
                    <tr 
                      key={score.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Index / Rank */}
                      <td className="py-3 px-3 text-center font-mono text-slate-400">
                        {index + 1}
                      </td>

                      {/* Student ID */}
                      <td className="py-3 px-3 font-mono text-slate-300 font-semibold">
                        {score.studentCode}
                      </td>

                      {/* Student Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white tracking-wide">
                          {score.studentNameKhmer}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {score.studentNameEnglish}
                        </div>
                      </td>

                      {/* Gender */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isFemaleGender(score.gender) 
                            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' 
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {getGenderKhmer(score.gender)}
                        </span>
                      </td>

                      {/* 1. Typing Score Input */}
                      <td className="py-2.5 px-3 bg-cyan-950/20 border-l border-r border-cyan-500/10 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max={score.maxScorePerSubject}
                          value={score.typingScore}
                          onChange={(e) => handleScoreChange(score.id, 'typingScore', e.target.value)}
                          className="w-16 mx-auto text-center font-bold bg-slate-950/60 border border-cyan-500/40 rounded-lg py-1 px-1 text-cyan-300 focus:ring-2 focus:ring-cyan-400 outline-none text-xs"
                        />
                      </td>

                      {/* 2. Practice Score Input */}
                      <td className="py-2.5 px-3 bg-emerald-950/20 border-r border-emerald-500/10 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max={score.maxScorePerSubject}
                          value={score.practiceScore}
                          onChange={(e) => handleScoreChange(score.id, 'practiceScore', e.target.value)}
                          className="w-16 mx-auto text-center font-bold bg-slate-950/60 border border-emerald-500/40 rounded-lg py-1 px-1 text-emerald-300 focus:ring-2 focus:ring-emerald-400 outline-none text-xs"
                        />
                      </td>

                      {/* 3. Writing Score Input */}
                      <td className="py-2.5 px-3 bg-amber-950/20 border-r border-amber-500/10 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max={score.maxScorePerSubject}
                          value={score.writingScore}
                          onChange={(e) => handleScoreChange(score.id, 'writingScore', e.target.value)}
                          className="w-16 mx-auto text-center font-bold bg-slate-950/60 border border-amber-500/40 rounded-lg py-1 px-1 text-amber-300 focus:ring-2 focus:ring-amber-400 outline-none text-xs"
                        />
                      </td>

                      {/* Total Score */}
                      <td className="py-3 px-3 text-center bg-purple-950/20">
                        <span className="font-extrabold text-purple-300 font-mono text-sm px-2 py-0.5 rounded-lg bg-purple-500/15 border border-purple-500/30">
                          {score.totalScore}
                        </span>
                      </td>

                      {/* Percentage */}
                      <td className="py-3 px-3 text-center font-bold font-mono">
                        <span className={score.percentage >= 80 ? 'text-emerald-400' : score.percentage >= 50 ? 'text-amber-400' : 'text-rose-400'}>
                          {score.percentage}%
                        </span>
                      </td>

                      {/* Grade Badge */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold border ${
                          score.letterGrade === 'A' 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : score.letterGrade === 'B' 
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : score.letterGrade === 'C' 
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                            : score.letterGrade === 'D'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}>
                          {score.letterGrade} ({score.gradeKhmer})
                        </span>
                      </td>

                      {/* Rank with Medals */}
                      <td className="py-3 px-3 text-center font-bold">
                        {score.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-black text-xs">
                            🥇 1
                          </span>
                        ) : score.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/40 font-black text-xs">
                            🥈 2
                          </span>
                        ) : score.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-600/20 text-amber-400 border border-amber-600/40 font-black text-xs">
                            🥉 3
                          </span>
                        ) : (
                          <span className="font-mono text-slate-400 font-semibold">
                            {score.rank}
                          </span>
                        )}
                      </td>

                      {/* Teacher Remarks / Comments */}
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={score.remarks || ''}
                          onChange={(e) => handleScoreChange(score.id, 'remarks', e.target.value)}
                          placeholder="ចំណាំ ឬមតិគ្រូ..."
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-slate-300 text-xs focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center no-print">
                        <button
                          onClick={() => handleDeleteRow(score.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-70 group-hover:opacity-100"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary Info */}
        <div className="p-4 bg-slate-950/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <div>
            បង្ហាញសិស្សសរុប: <strong className="text-white">{filteredScores.length}</strong> នាក់ • ថ្នាក់: <strong className="text-indigo-300">{selectedClass === 'ALL' ? 'គ្រប់ថ្នាក់ (All Classes)' : selectedClass}</strong> • ម៉ោងសិក្សា: <strong className="text-amber-300">{selectedTimeStudy === 'ALL' ? 'គ្រប់ម៉ោងសិក្សា (All Shifts)' : selectedTimeStudy}</strong> • ថ្ងៃសុក្រ: <strong className="text-cyan-300">{selectedFriday === 'ALL' ? 'គ្រប់កាលបរិច្ឆេទ' : selectedFriday}</strong>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Typing
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Practice
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Writing
            </span>
            <span className="text-slate-600">|</span>
            <span>Scale: {scoreMaxScale} pts / skill (សរុប {scoreMaxScale * 3} pts)</span>
          </div>
        </div>
      </div>

      {/* Printable Signature Block */}
      <div className="hidden print:flex justify-between items-end pt-12 text-xs font-serif text-black">
        <div className="text-center w-48">
          <p className="font-bold">គ្រូបង្រៀនទទួលបន្ទុក</p>
          <p className="text-[10px] text-gray-600">Teacher in Charge</p>
          <div className="h-20"></div>
          <p className="font-bold border-t border-black pt-1">{currentUser?.nameKhmer || 'រិន សុភ័ក្ត្រ'}</p>
        </div>
        <div className="text-center w-48">
          <p className="font-bold">ប្រធានផ្នែកបច្ចេកទេស</p>
          <p className="text-[10px] text-gray-600">Technical Head</p>
          <div className="h-20"></div>
          <p className="font-bold border-t border-black pt-1">ឯកឧត្តមបណ្ឌិត រិន សុភ័ក្ត្រ</p>
        </div>
        <div className="text-center w-48">
          <p className="font-bold">នាយកសាលា / មណ្ឌល</p>
          <p className="text-[10px] text-gray-600">School Principal</p>
          <div className="h-20"></div>
          <p className="font-bold border-t border-black pt-1">{activeSchool.principalKhmer}</p>
        </div>
      </div>

      {/* MODAL 1: ADD SINGLE STUDENT SCORE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <AddStudentScoreModal
            students={students}
            selectedClass={selectedClass}
            selectedFriday={selectedFriday}
            scoreMaxScale={scoreMaxScale}
            onClose={() => setShowAddModal(false)}
            onAddScore={(newScore) => {
              const updated = recalculateRanksAndGrades([...localScores, newScore]);
              setLocalScores(updated);
              onSaveScores(updated);
              setShowAddModal(false);
              setSaveSuccessMsg('បានបញ្ចូលពិន្ទុសិស្សថ្មីដោយជោគជ័យ!');
              setTimeout(() => setSaveSuccessMsg(''), 3000);
            }}
          />
        </div>
      )}

      {/* MODAL 2: BATCH POPULATE MODAL */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">បំពេញពិន្ទុគំរូក្នុងថ្នាក់ស្វ័យប្រវត្តិ</h3>
                  <p className="text-xs text-slate-400">Auto-populate Class Friday Quiz</p>
                </div>
              </div>
              <button 
                onClick={() => setShowBatchModal(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                ប្រព័ន្ធនឹងទាញយកឈ្មោះសិស្សក្នុងថ្នាក់ <strong>{selectedClass}</strong> មកបញ្ចូលពិន្ទុគំរូសម្រាប់ថ្ងៃសុក្រ <strong>{selectedFriday}</strong> ដោយរួមមាន៖
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                <li><strong className="text-cyan-300">Typing</strong>: ពិន្ទុវាយអត្ថបទកុំព្យូទ័រ</li>
                <li><strong className="text-emerald-300">Practice</strong>: ពិន្ទុអនុវត្តកូដជាក់ស្តែង</li>
                <li><strong className="text-amber-300">Writing</strong>: ពិន្ទុសំណេរ និងទ្រឹស្តី</li>
                <li>គណនាពិន្ទុសរុប, មធ្យមភាគ, និទ្ទេស និងចំណាត់ថ្នាក់ដោយស្វ័យប្រវត្តិ</li>
              </ul>
            </div>

            <div className="pt-3 flex justify-end space-x-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                onClick={handleAutoPopulateClass}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-cyan-600/30"
              >
                <Sparkles className="w-4 h-4" />
                <span>យល់ព្រមបំពេញ (Populate Now)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for adding a single student score
interface AddStudentScoreModalProps {
  students: Student[];
  selectedClass: string;
  selectedFriday: string;
  scoreMaxScale: number;
  onClose: () => void;
  onAddScore: (score: WeeklyQuizScore) => void;
}

const AddStudentScoreModal: React.FC<AddStudentScoreModalProps> = ({
  students,
  selectedClass,
  selectedFriday,
  scoreMaxScale,
  onClose,
  onAddScore
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'STU-001');
  const [studentCode, setStudentCode] = useState<string>(students[0]?.studentCode || 'STU-2026-0001');
  const [studentNameKhmer, setStudentNameKhmer] = useState<string>(students[0]?.nameKhmer || '');
  const [studentNameEnglish, setStudentNameEnglish] = useState<string>(students[0]?.nameEnglish || '');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');

  const [fridayDate, setFridayDate] = useState<string>(selectedFriday || '2026-08-14');
  const [className, setClassName] = useState<string>(selectedClass !== 'ALL' ? selectedClass : 'PC01');
  const [timeStudy, setTimeStudy] = useState<string>(students[0]?.time_study || (students[0] as any)?.shift || '07:30 - 11:00');
  const [typingScore, setTypingScore] = useState<number>(scoreMaxScale === 10 ? 8.5 : 85);
  const [practiceScore, setPracticeScore] = useState<number>(scoreMaxScale === 10 ? 9.0 : 90);
  const [writingScore, setWritingScore] = useState<number>(scoreMaxScale === 10 ? 8.0 : 80);
  const [remarks, setRemarks] = useState<string>('សិស្សយកចិត្តទុកដាក់ និងអនុវត្តបានល្អ');

  // Handle student select change
  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    const found = students.find(s => s.id === id);
    if (found) {
      setStudentCode(found.studentCode || id);
      setStudentNameKhmer(found.nameKhmer);
      setStudentNameEnglish(found.nameEnglish);
      setGender((found.gender as 'MALE' | 'FEMALE') || 'MALE');
      if (found.className) setClassName(found.className);
      const shiftVal = (found as any).time_study || (found as any).shift || (found as any).timeStudy || '07:30 - 11:00';
      setTimeStudy(shiftVal);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number((Number(typingScore) + Number(practiceScore) + Number(writingScore)).toFixed(1));
    const avg = Number((total / 3).toFixed(2));
    const pct = Math.round((total / (scoreMaxScale * 3)) * 100);
    const gradeCalc = calculateKhmerGrade(pct);

    const newScore: WeeklyQuizScore = {
      id: `WQS-${Date.now().toString().slice(-6)}`,
      studentId: selectedStudentId,
      studentCode: studentCode || `STU-${Date.now().toString().slice(-4)}`,
      studentNameKhmer: studentNameKhmer || 'សិស្សទូទៅ',
      studentNameEnglish: studentNameEnglish || 'General Student',
      gender,
      className,
      time_study: timeStudy,
      timeStudy: timeStudy,
      timeSlot: timeStudy,
      weekNumber: 3,
      weekTitle: `Weekly Quiz - ${className}`,
      fridayDate,
      typingScore: Number(typingScore),
      practiceScore: Number(practiceScore),
      writingScore: Number(writingScore),
      maxScorePerSubject: scoreMaxScale,
      totalScore: total,
      averageScore: avg,
      percentage: pct,
      letterGrade: gradeCalc.letter,
      gradeKhmer: gradeCalc.khmer,
      remarks,
      recordedDate: fridayDate
    };

    onAddScore(newScore);
  };

  return (
    <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-white">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base">បញ្ចូលពិន្ទុ Quiz ថ្ងៃសុក្រ</h3>
            <p className="text-xs text-slate-400">Score Friday Weekly Quiz (Typing, Practice, Writing)</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {/* Select Student or Custom Name */}
        {students.length > 0 && (
          <div>
            <label className="block text-slate-300 font-semibold mb-1">ជ្រើសរើសសិស្សពីបញ្ជី:</label>
            <select
              value={selectedStudentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full bg-slate-800 border border-white/15 text-white rounded-xl px-3 py-2 outline-none"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.studentCode} • {s.nameKhmer} ({s.nameEnglish})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">ឈ្មោះខ្មែរ:</label>
            <input
              type="text"
              required
              value={studentNameKhmer}
              onChange={(e) => setStudentNameKhmer(e.target.value)}
              placeholder="ឧ. ហេង ពិសិដ្ឋ"
              className="w-full bg-slate-800 border border-white/15 text-white rounded-xl px-3 py-2 outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">English Name:</label>
            <input
              type="text"
              value={studentNameEnglish}
              onChange={(e) => setStudentNameEnglish(e.target.value)}
              placeholder="e.g. Heng Piseth"
              className="w-full bg-slate-800 border border-white/15 text-white rounded-xl px-3 py-2 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">ថ្នាក់ (Class):</label>
            <input
              type="text"
              required
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full bg-slate-800 border border-white/15 text-white rounded-xl px-3 py-2 outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">ម៉ោងសិក្សា (Shift):</label>
            <input
              type="text"
              required
              value={timeStudy}
              onChange={(e) => setTimeStudy(e.target.value)}
              placeholder="07:30 - 11:00"
              className="w-full bg-slate-800 border border-amber-500/30 text-amber-300 font-semibold rounded-xl px-3 py-2 outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">ថ្ងៃសុក្រ (Friday Date):</label>
            <input
              type="text"
              required
              value={fridayDate}
              onChange={(e) => setFridayDate(e.target.value)}
              className="w-full bg-slate-800 border border-white/15 text-white rounded-xl px-3 py-2 outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">ភេទ:</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')}
              className="w-full bg-slate-800 border border-white/15 text-white rounded-xl px-3 py-2 outline-none"
            >
              <option value="MALE">ប្រុស (Male)</option>
              <option value="FEMALE">ស្រី (Female)</option>
            </select>
          </div>
        </div>

        {/* Scores Input: Typing, Practice, Writing */}
        <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
          <p className="font-bold text-white flex items-center justify-between">
            <span>ពិន្ទុជំនាញទាំង ៣ (3 Core Scores)</span>
            <span className="text-[11px] text-slate-400 font-normal">Scale: 0 - {scoreMaxScale}</span>
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-cyan-300 font-bold mb-1 flex items-center gap-1">
                <Keyboard className="w-3.5 h-3.5" />
                <span>Typing</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max={scoreMaxScale}
                required
                value={typingScore}
                onChange={(e) => setTypingScore(Number(e.target.value))}
                className="w-full bg-slate-950 border border-cyan-500/40 text-cyan-300 font-bold rounded-xl px-3 py-2 text-center text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-emerald-300 font-bold mb-1 flex items-center gap-1">
                <Code className="w-3.5 h-3.5" />
                <span>Practice</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max={scoreMaxScale}
                required
                value={practiceScore}
                onChange={(e) => setPracticeScore(Number(e.target.value))}
                className="w-full bg-slate-950 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl px-3 py-2 text-center text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-amber-300 font-bold mb-1 flex items-center gap-1">
                <PenTool className="w-3.5 h-3.5" />
                <span>Writing</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max={scoreMaxScale}
                required
                value={writingScore}
                onChange={(e) => setWritingScore(Number(e.target.value))}
                className="w-full bg-slate-950 border border-amber-500/40 text-amber-300 font-bold rounded-xl px-3 py-2 text-center text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1">មតិគ្រូ / ការកត់សម្គាល់ (Remarks):</label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="ឧ. វាយអត្ថបទបានលឿន និងសរសេរកូដបានល្អ"
            className="w-full bg-slate-800 border border-white/15 text-white rounded-xl px-3 py-2 outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="pt-3 flex justify-end space-x-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
          >
            បោះបង់ (Cancel)
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30"
          >
            <Save className="w-4 h-4" />
            <span>រក្សាទុកពិន្ទុ (Save Score)</span>
          </button>
        </div>
      </form>
    </div>
  );
};
