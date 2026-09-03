import React, { useState, useRef, useMemo } from 'react';
import { Student, ClassRoom, Parent, SchoolProfile, StudentStatus, User, UserRole, AttendanceRecord } from '../types';
import { storageService } from '../services/storageService';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Eye, 
  Edit3, 
  Trash2, 
  CreditCard, 
  FileText, 
  UserCheck, 
  Phone, 
  MapPin, 
  Calendar,
  X,
  Check,
  GraduationCap,
  Sparkles,
  FileSpreadsheet,
  Layers,
  Clock,
  Coins,
  Bookmark,
  QrCode,
  Users,
  Lock,
  RotateCcw,
  ShieldCheck,
  KeyRound,
  Camera,
  Image as ImageIcon,
  Loader2,
  Link as LinkIcon,
  AlertCircle
} from 'lucide-react';
import { exportToCSV, isFemaleGender, isMaleGender, getGenderKhmer } from '../utils/formatters';
import { StudentExcelImportModal } from './StudentExcelImportModal';
import { PaymentQrModal } from './PaymentQrModal';
import { StudentPhotoUploadModal } from './StudentPhotoUploadModal';

const STUDENT_PHOTO_PRESETS = [
  { id: 'p1', label: 'ស្រី ១', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { id: 'p2', label: 'ស្រី ២', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  { id: 'p3', label: 'ស្រី ៣', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
  { id: 'p4', label: 'ប្រុស ១', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80' },
  { id: 'p5', label: 'ប្រុស ២', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { id: 'p6', label: 'ប្រុស ៣', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' }
];

interface StudentsViewProps {
  students: Student[];
  classes: ClassRoom[];
  parents?: Parent[];
  school: SchoolProfile;
  onSaveStudent: (student: Student) => void;
  onSaveStudentsBatch?: (students: Student[], mode: 'APPEND' | 'REPLACE') => void;
  onDeleteStudent: (id: string) => void;
  onRemoveAllStudents?: () => void;
  onSaveSchool?: (school: SchoolProfile) => void;
  onViewIdCard?: (student: Student) => void;
  onViewReportCard?: (student: Student) => void;
  onOpenStudentModal?: (student: Student) => void;
  onOpenReportCard?: (student: Student) => void;
  searchTerm?: string;
  userRole?: UserRole | string;
  users?: User[];
}

const CAMBODIA_PROVINCES = [
  'រាជធានីភ្នំពេញ',
  'ខេត្តកណ្តាល',
  'ខេត្តកំពង់ចាម',
  'ខេត្តកំពង់ធំ',
  'ខេត្តកំពង់ឆ្នាំង',
  'ខេត្តកំពង់ស្ពឺ',
  'ខេត្តកំពត',
  'ខេត្តកែប',
  'ខេត្តកោះកុង',
  'ខេត្តក្រចេះ',
  'ខេត្តតាកែវ',
  'ខេត្តត្បូងឃ្មុំ',
  'ខេត្តបន្ទាយមានជ័យ',
  'ខេត្តបាត់ដំបង',
  'ខេត្តប៉ៃលិន',
  'ខេត្តពោធិ៍សាត់',
  'ខេត្តព្រៃវែង',
  'ខេត្តព្រះវិហារ',
  'ខេត្តព្រះសីហនុ',
  'ខេត្តមណ្ឌលគិរី',
  'ខេត្តរតនគិរី',
  'ខេត្តសៀមរាប',
  'ខេត្តស្ទឹងត្រែង',
  'ខេត្តស្វាយរៀង',
  'ខេត្តឧត្តរមានជ័យ'
];

export const StudentsView: React.FC<StudentsViewProps> = ({
  students = [],
  classes = [],
  parents = [],
  school,
  onSaveStudent,
  onSaveStudentsBatch,
  onDeleteStudent,
  onRemoveAllStudents,
  onSaveSchool,
  onViewIdCard,
  onViewReportCard,
  onOpenStudentModal,
  onOpenReportCard,
  searchTerm: globalSearch = '',
  userRole,
  users = []
}) => {
  const isSuperAdmin = !userRole || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'SCHOOL_ADMIN' || userRole === 'DIRECTOR';
  const [localSearch, setLocalSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [sortByNo, setSortByNo] = useState<'NO_ASC' | 'NO_DESC' | 'NAME_ASC' | 'NAME_DESC' | 'CODE_ASC' | 'NEWEST'>('NO_ASC');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedTimeStudy, setSelectedTimeStudy] = useState('ALL');
  const [userFilter, setUserFilter] = useState<'ALL' | 'HAS_ACCOUNT' | 'NO_ACCOUNT' | 'HAS_PARENT' | 'NO_PARENT'>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);
  const [isRemoveAllStudentsModalOpen, setIsRemoveAllStudentsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [profileModalStudent, setProfileModalStudent] = useState<Student | null>(null);

  // Student Payment KHQR Modal State (Auto-synced to all students)
  const [isPaymentQrModalOpen, setIsPaymentQrModalOpen] = useState(false);
  const [selectedStudentForQr, setSelectedStudentForQr] = useState<Student | null>(null);
  const [paymentQrInitialMode, setPaymentQrInitialMode] = useState<'VIEW' | 'CHANGE'>('VIEW');

  // Student Photo Upload Modal State
  const [isPhotoUploadModalOpen, setIsPhotoUploadModalOpen] = useState(false);
  const [selectedStudentForPhoto, setSelectedStudentForPhoto] = useState<Student | null>(null);

  // Student Form Photo Picker Ref & States
  const formFileInputRef = useRef<HTMLInputElement>(null);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [showPhotoUrlInput, setShowPhotoUrlInput] = useState(false);
  const [photoUrlInputValue, setPhotoUrlInputValue] = useState('');
  const [isPhotoDragging, setIsPhotoDragging] = useState(false);

  // Extract distinct time_study options from student data
  const availableTimeStudyOptions = React.useMemo(() => {
    const times = new Set<string>();
    students.forEach(s => {
      const t = (s.time_study || s.timeStudy || '').trim();
      if (t) times.add(t);
    });
    return Array.from(times).sort();
  }, [students]);

  // Helper to check if a student has a user account
  const getStudentUserAccount = (student: Student) => {
    return users.find(u => 
      u.linkedEntityId === student.id || 
      (student.email && u.email && u.email.toLowerCase() === student.email.toLowerCase()) ||
      (u.username && u.username.toLowerCase() === student.studentCode.toLowerCase())
    );
  };

  const handleResetToAllUsers = () => {
    setSelectedGrade('ALL');
    setSelectedClass('ALL');
    setSelectedGender('ALL');
    setSelectedStatus('ALL');
    setSelectedTimeStudy('ALL');
    setUserFilter('ALL');
    setLocalSearch('');
  };

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    nameKhmer: '',
    nameEnglish: '',
    gender: 'MALE',
    dob: '2008-01-01',
    pob: 'រាជធានីភ្នំពេញ',
    nationality: 'ខ្មែរ (Cambodian)',
    address: '',
    province: 'រាជធានីភ្នំពេញ',
    phone: '',
    email: '',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    grade: '12',
    classId: classes[0]?.id || 'CLS-12A',
    className: classes[0]?.name || 'ថ្នាក់ទី១២ A',
    academicYear: school.academicYear,
    status: 'ACTIVE',
    enrollmentDate: '2025-09-01',
    emergencyContact: '',
    parentNameKhmer: '',
    parentPhone: '',
    age: 18,
    rlc: '',
    contributions: '',
    remark: '',
    orther: '',
    books: '',
    time_study: '',
    semester: 'ឆមាសទី១',
    payment_by: ''
  });

  // Class Selection states for Grade 1-12 and Other
  const [isOtherClass, setIsOtherClass] = useState<boolean>(false);
  const [customClassName, setCustomClassName] = useState<string>('');

  const getSelectedClassValue = () => {
    if (isOtherClass || formData.classId === 'CLS-OTHER') return 'OTHER';
    if (formData.grade && Number(formData.grade) >= 1 && Number(formData.grade) <= 12) {
      return String(formData.grade);
    }
    const gradeMap: Record<string, string> = {
      'CLS-01': '1', 'CLS-02': '2', 'CLS-03': '3', 'CLS-04': '4',
      'CLS-05': '5', 'CLS-06': '6', 'CLS-07': '7', 'CLS-08': '8',
      'CLS-09': '9', 'CLS-10A': '10', 'CLS-11A': '11', 'CLS-12A': '12'
    };
    if (formData.classId && gradeMap[formData.classId]) {
      return gradeMap[formData.classId];
    }
    if (formData.classId && classes.some(c => c.id === formData.classId)) {
      return formData.classId;
    }
    return '12';
  };

  const handleClassSelectChange = (val: string) => {
    if (val === 'OTHER') {
      setIsOtherClass(true);
      setFormData(prev => ({
        ...prev,
        classId: 'CLS-OTHER',
        className: customClassName || 'ផ្សេងៗ (Other)',
        grade: 'Other'
      }));
      return;
    }

    setIsOtherClass(false);
    const gradeNum = parseInt(val, 10);
    if (!isNaN(gradeNum) && gradeNum >= 1 && gradeNum <= 12) {
      const gradeStr = String(gradeNum);
      const matched = classes.find(c => c.grade === gradeStr);
      const fallbackId = gradeNum < 10 
        ? `CLS-0${gradeNum}` 
        : gradeNum === 10 
          ? 'CLS-10A' 
          : gradeNum === 11 
            ? 'CLS-11A' 
            : 'CLS-12A';
      const fallbackName = `ថ្នាក់ទី${gradeNum}`;

      setFormData(prev => ({
        ...prev,
        grade: gradeStr,
        classId: matched ? matched.id : fallbackId,
        className: matched ? matched.name : fallbackName
      }));
    } else {
      const matchedCls = classes.find(c => c.id === val);
      if (matchedCls) {
        setFormData(prev => ({
          ...prev,
          classId: matchedCls.id,
          className: matchedCls.name,
          grade: matchedCls.grade
        }));
      }
    }
  };

  const handleFormPhotoFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoUploadError('សូមជ្រើសរើសឯកសាររូបភាព (JPG, PNG, WebP) - Please select an image file');
      return;
    }
    setIsPhotoProcessing(true);
    setPhotoUploadError(null);

    const reader = new FileReader();
    reader.onerror = () => {
      setPhotoUploadError('មានបញ្ហាក្នុងការអានឯកសាររូបភាព (Error reading file)');
      setIsPhotoProcessing(false);
    };

    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        setIsPhotoProcessing(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 450;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
            setFormData(prev => ({ ...prev, photo: optimizedDataUrl }));
          } else {
            setFormData(prev => ({ ...prev, photo: rawDataUrl }));
          }
        } catch (err) {
          setFormData(prev => ({ ...prev, photo: rawDataUrl }));
        } finally {
          setIsPhotoProcessing(false);
        }
      };

      img.onerror = () => {
        setFormData(prev => ({ ...prev, photo: rawDataUrl }));
        setIsPhotoProcessing(false);
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  };

  const handleReturnToSchool = (student: Student) => {
    const updatedStudent: Student = {
      ...student,
      status: 'ACTIVE'
    };
    onSaveStudent(updatedStudent);
    storageService.saveStudent(updatedStudent);

    // Also register today's attendance as PRESENT
    const today = new Date().toISOString().split('T')[0];
    const sClass = student.className || classes.find(c => c.id === student.classId)?.name || 'PC01';
    const record: AttendanceRecord = {
      id: `ATT-${student.id}-${today}`,
      studentId: student.id,
      studentNameKhmer: student.nameKhmer,
      studentCode: student.studentCode,
      classId: student.classId || 'PC01',
      className: sClass,
      date: today,
      status: 'PRESENT',
      remarks: '',
      reason: '',
      recordedBy: 'គណៈគ្រប់គ្រងសាលា'
    };
    storageService.saveAttendanceBulk([record]);

    window.dispatchEvent(new CustomEvent('students-updated', { detail: { studentId: student.id, status: 'ACTIVE' } }));
    window.dispatchEvent(new CustomEvent('attendance-updated'));
  };

  const search = globalSearch || localSearch;

  // Helper to extract student No number
  const getStudentNo = (student: Student, fallbackIndex = 0): number => {
    const rawNo = (student as any).no ?? (student as any).No ?? (student as any)['ល.រ'] ?? (student as any).order;
    if (rawNo !== undefined && rawNo !== null && rawNo !== '') {
      const parsed = Number(rawNo);
      if (!isNaN(parsed)) return parsed;
      const digits = String(rawNo).match(/\d+/);
      if (digits) return parseInt(digits[0], 10);
    }
    // Try extract number from studentCode (e.g. STU-2026-0001 -> 1, STU-001 -> 1)
    if (student.studentCode) {
      const match = student.studentCode.match(/(\d+)$/);
      if (match) return parseInt(match[1], 10);
    }
    return fallbackIndex + 1;
  };

  // Helper to display student No
  const getStudentDisplayNo = (student: Student, fallbackIndex = 0): string => {
    const rawNo = (student as any).no ?? (student as any).No ?? (student as any)['ល.រ'];
    if (rawNo !== undefined && rawNo !== null && rawNo !== '') {
      return String(rawNo);
    }
    return String(getStudentNo(student, fallbackIndex));
  };

  // Helper to normalize any date format (Date object, timestamp, DD/MM/YYYY, ISO, Khmer digits) to YYYY-MM-DD
  const normalizeToISODate = (val: any): string => {
    if (!val && val !== 0) return '';
    if (val instanceof Date || Object.prototype.toString.call(val) === '[object Date]') {
      if (!isNaN(val.getTime())) {
        const year = val.getFullYear();
        const month = String(val.getMonth() + 1).padStart(2, '0');
        const day = String(val.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    if (typeof val === 'number') {
      const date = new Date(Math.round((val - (25567 + 2)) * 86400 * 1000));
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    let str = String(val).trim();
    if (!str) return '';

    // Convert Khmer numerals to standard Arabic digits
    const khmerNumerals: Record<string, string> = {
      '០': '0', '១': '1', '២': '2', '៣': '3', '៤': '4',
      '៥': '5', '៦': '6', '៧': '7', '៨': '8', '៩': '9'
    };
    str = str.replace(/[០-៩]/g, d => khmerNumerals[d] || d);

    // If pure 5-digit number string resembling Excel serial
    if (/^\d{5}$/.test(str)) {
      const num = Number(str);
      if (num > 20000 && num < 60000) {
        const date = new Date(Math.round((num - (25567 + 2)) * 86400 * 1000));
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
      }
    }

    // YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
    const isoPrefixMatch = str.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/);
    if (isoPrefixMatch) {
      const year = isoPrefixMatch[1];
      const month = isoPrefixMatch[2].padStart(2, '0');
      const day = isoPrefixMatch[3].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
    const dmyMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      let year = dmyMatch[3];
      if (year.length === 2) {
        year = Number(year) > 40 ? `19${year}` : `20${year}`;
      }
      return `${year}-${month}-${day}`;
    }

    const parsedDate = new Date(str);
    if (!isNaN(parsedDate.getTime())) {
      const year = parsedDate.getFullYear();
      if (year >= 1950 && year <= 2050) {
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }

    return str;
  };

  // Helper to reliably extract student date of birth from date_of_birth or dob
  const getStudentDob = (student?: Partial<Student> | null): string => {
    if (!student) return '';
    const raw = (student as any).date_of_birth || student.dob || (student as any).dateOfBirth || (student as any)['ថ្ងៃខែឆ្នាំកំណើត'] || '';
    return normalizeToISODate(raw) || String(raw || '');
  };

  // Filtered Students
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.nameKhmer.toLowerCase().includes(search.toLowerCase()) ||
      s.nameEnglish.toLowerCase().includes(search.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(search.toLowerCase()) ||
      (s.no !== undefined && String(s.no).toLowerCase().includes(search.toLowerCase())) ||
      (s.phone && s.phone.includes(search)) ||
      (s.rlc && s.rlc.toLowerCase().includes(search.toLowerCase()));

    const matchesGrade = 
      selectedGrade === 'ALL' || 
      s.grade === selectedGrade ||
      (selectedGrade === 'OTHER' && (s.grade === 'Other' || s.grade === 'ផ្សេងៗ' || !['1','2','3','4','5','6','7','8','9','10','11','12'].includes(String(s.grade))));
    const matchesClass = selectedClass === 'ALL' || s.classId === selectedClass;
    const matchesGender = selectedGender === 'ALL' || 
      (selectedGender === 'MALE' && isMaleGender(s.gender)) ||
      (selectedGender === 'FEMALE' && isFemaleGender(s.gender)) ||
      s.gender === selectedGender;
    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;
    const studentTime = (s.time_study || s.timeStudy || '').trim();
    const matchesTimeStudy = selectedTimeStudy === 'ALL' || studentTime === selectedTimeStudy;

    let matchesUserFilter = true;
    if (userFilter === 'HAS_ACCOUNT') {
      const account = getStudentUserAccount(s);
      matchesUserFilter = Boolean(account || (s.email && s.email.length > 3));
    } else if (userFilter === 'NO_ACCOUNT') {
      const account = getStudentUserAccount(s);
      matchesUserFilter = !account && (!s.email || s.email.length <= 3);
    } else if (userFilter === 'HAS_PARENT') {
      matchesUserFilter = Boolean(s.parentNameKhmer || s.parentPhone || s.parentId);
    } else if (userFilter === 'NO_PARENT') {
      matchesUserFilter = !s.parentNameKhmer && !s.parentPhone && !s.parentId;
    }

    return matchesSearch && matchesGrade && matchesClass && matchesGender && matchesStatus && matchesTimeStudy && matchesUserFilter;
  });

  // Sorted students based on sort criteria (Defaults to Sort by No field name 1 -> 9)
  const sortedStudents = useMemo(() => {
    const list = [...filteredStudents];
    if (sortByNo === 'NO_ASC') {
      list.sort((a, b) => getStudentNo(a) - getStudentNo(b));
    } else if (sortByNo === 'NO_DESC') {
      list.sort((a, b) => getStudentNo(b) - getStudentNo(a));
    } else if (sortByNo === 'NAME_ASC') {
      list.sort((a, b) => (a.nameKhmer || a.nameEnglish || '').localeCompare(b.nameKhmer || b.nameEnglish || '', 'km'));
    } else if (sortByNo === 'NAME_DESC') {
      list.sort((a, b) => (b.nameKhmer || b.nameEnglish || '').localeCompare(a.nameKhmer || a.nameEnglish || '', 'km'));
    } else if (sortByNo === 'CODE_ASC') {
      list.sort((a, b) => (a.studentCode || '').localeCompare(b.studentCode || ''));
    } else if (sortByNo === 'NEWEST') {
      list.sort((a, b) => (b.enrollmentDate || b.id).localeCompare(a.enrollmentDate || a.id));
    }
    return list;
  }, [filteredStudents, sortByNo]);

  const handleOpenAddModal = () => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែ/បន្ថែមត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចចុះឈ្មោះសិស្សថ្មីបាន!');
      return;
    }
    setEditingStudent(null);
    setIsOtherClass(false);
    setCustomClassName('');
    const nextIndex = students.length + 1;
    const code = `STU-2026-${String(nextIndex).padStart(5, '0')}`;
    setFormData({
      studentCode: code,
      no: nextIndex,
      nameKhmer: '',
      nameEnglish: '',
      gender: 'MALE',
      dob: '2008-01-01',
      date_of_birth: '2008-01-01',
      pob: 'រាជធានីភ្នំពេញ',
      nationality: 'ខ្មែរ (Cambodian)',
      address: '',
      province: 'រាជធានីភ្នំពេញ',
      phone: '',
      email: '',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      grade: '12',
      classId: classes[0]?.id || 'CLS-12A',
      className: classes[0]?.name || 'ថ្នាក់ទី១២ A',
      academicYear: school.academicYear,
      status: 'ACTIVE',
      enrollmentDate: new Date().toISOString().split('T')[0],
      emergencyContact: '',
      parentNameKhmer: '',
      parentPhone: '',
      age: 18,
      rlc: '',
      contributions: '',
      remark: '',
      orther: '',
      books: '',
      time_study: '07:30 - 11:00',
      semester: 'ឆមាសទី១',
      payment_by: ''
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចកែប្រែទិន្នន័យសិស្សបាន!');
      return;
    }
    setEditingStudent(student);
    const isStdGrade = Boolean(student.grade && Number(student.grade) >= 1 && Number(student.grade) <= 12);
    const isKnownClassId = classes.some(c => c.id === student.classId);
    const isOther = student.classId === 'CLS-OTHER' || student.grade === 'Other' || student.grade === 'ផ្សេងៗ' || (!isStdGrade && !isKnownClassId);

    setIsOtherClass(isOther);
    setCustomClassName(isOther ? (student.className || '') : '');

    const resolvedDob = getStudentDob(student);

    setFormData({ 
      ...student,
      no: student.no !== undefined && student.no !== '' ? student.no : getStudentNo(student),
      dob: resolvedDob,
      date_of_birth: resolvedDob,
      time_study: student.time_study || student.timeStudy || '',
      payment_by: student.payment_by || student.paymentBy || ''
    });
    setModalOpen(true);
  };

  const handleBatchImport = (importedList: Student[], mode: 'APPEND' | 'REPLACE') => {
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចនាំចូលទិន្នន័យ Excel បាន!');
      return;
    }
    if (onSaveStudentsBatch) {
      onSaveStudentsBatch(importedList, mode);
    } else {
      importedList.forEach(st => onSaveStudent(st));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចរក្សាទុកទិន្នន័យសិស្សបាន!');
      return;
    }
    if (!formData.nameKhmer || !formData.classId) return;

    const selectedCls = classes.find(c => c.id === formData.classId);

    const resolvedDob = getStudentDob(formData as any) || '2008-01-01';

    const newStudent: Student = {
      id: editingStudent ? editingStudent.id : `STU-${Date.now()}`,
      no: formData.no !== undefined && formData.no !== '' 
        ? (isNaN(Number(formData.no)) ? String(formData.no).trim() : Number(formData.no)) 
        : (editingStudent?.no ?? (students.length + 1)),
      studentCode: formData.studentCode || `STU-2026-${String(students.length + 1).padStart(5, '0')}`,
      nameKhmer: formData.nameKhmer || '',
      nameEnglish: formData.nameEnglish || '',
      gender: formData.gender || 'MALE',
      dob: resolvedDob,
      date_of_birth: resolvedDob,
      dateOfBirth: resolvedDob,
      pob: formData.pob || 'រាជធានីភ្នំពេញ',
      nationality: formData.nationality || 'ខ្មែរ (Cambodian)',
      address: formData.address || '',
      province: formData.province || 'រាជធានីភ្នំពេញ',
      phone: formData.phone || '',
      email: formData.email || '',
      photo: formData.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      grade: isOtherClass ? 'Other' : (formData.grade || selectedCls?.grade || '12'),
      classId: isOtherClass ? 'CLS-OTHER' : (formData.classId || classes[0]?.id || 'CLS-12A'),
      className: isOtherClass 
        ? (customClassName.trim() || 'ផ្សេងៗ (Other)') 
        : (selectedCls?.name || formData.className || 'ថ្នាក់ទី១២ A'),
      academicYear: formData.academicYear || school.academicYear,
      status: formData.status || 'ACTIVE',
      enrollmentDate: formData.enrollmentDate || '2025-09-01',
      emergencyContact: formData.emergencyContact || formData.parentPhone || '',
      parentNameKhmer: formData.parentNameKhmer || '',
      parentPhone: formData.parentPhone || '',

      // 16 fields support
      age: formData.age || '',
      rlc: formData.rlc || '',
      contributions: formData.contributions || '',
      remark: formData.remark || '',
      orther: formData.orther || '',
      books: formData.books || '',
      timeStudy: formData.time_study || '',
      time_study: formData.time_study || '',
      semester: formData.semester || 'ឆមាសទី១',
      paymentBy: formData.payment_by || '',
      payment_by: formData.payment_by || ''
    };

    onSaveStudent(newStudent);
    setModalOpen(false);
  };

  const handleExportCSV = () => {
    const exportData = sortedStudents.map((s, idx) => ({
      'no': getStudentDisplayNo(s, idx),
      'khmer_name': s.nameKhmer,
      'english_name': s.nameEnglish,
      'sex': getGenderKhmer(s.gender),
      'age': s.age || '',
      'grade': s.grade || '',
      'date_of_birth': getStudentDob(s),
      'rlc': s.rlc || s.classId,
      'phone_number': s.phone || s.parentPhone || '',
      'contributions': s.contributions || '',
      'remark': s.remark || '',
      'orther': s.orther || s.other || s.address || '',
      'books': s.books || '',
      'time_study': s.time_study || s.timeStudy || '',
      'status': s.status,
      'semester': s.semester || 'ឆមាសទី១',
      'payment_by': s.payment_by || s.paymentBy || ''
    }));
    exportToCSV(`បញ្ជីរាយនាមសិស្ស_Excel_${school.nameKhmer}_${new Date().toISOString().split('T')[0]}`, exportData);
  };

  const triggerViewIdCard = (student: Student) => {
    if (onOpenStudentModal) onOpenStudentModal(student);
    else if (onViewIdCard) onViewIdCard(student);
  };

  const triggerViewReportCard = (student: Student) => {
    if (onOpenReportCard) onOpenReportCard(student);
    else if (onViewReportCard) onViewReportCard(student);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-battambang flex items-center gap-2">
            <span>គ្រប់គ្រងព័ត៌មានសិស្ស</span>
            <span className="text-xs text-indigo-300 font-sans font-normal border border-indigo-400/30 bg-indigo-500/20 px-2.5 py-0.5 rounded-full">
              {sortedStudents.length} នាក់
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">គ្រប់គ្រងបញ្ជីឈ្មោះ ប្រវត្តិរូប នាំចូល Excel កាតសិស្ស និងលទ្ធផលសិក្សារបស់សិស្ស</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter All Users Quick Button */}
          <button
            onClick={handleResetToAllUsers}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition border backdrop-blur-md font-battambang ${
              userFilter === 'ALL' && selectedGrade === 'ALL' && selectedClass === 'ALL' && selectedGender === 'ALL' && selectedStatus === 'ALL' && !localSearch
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border-indigo-500/40'
            }`}
            title="បង្ហាញបញ្ជីអ្នកប្រើប្រាស់/សិស្សទាំងអស់ (Filter All Users / Reset All Filters)"
          >
            <Users className="w-4 h-4 text-indigo-300" />
            <span>👥 ត្រងអ្នកប្រើប្រាស់ទាំងអស់ (Filter All Users)</span>
          </button>

          {/* Upload / Change Student Payment QR Button (Auto sync to all students) */}
          <button
            onClick={() => {
              setSelectedStudentForQr(null);
              setPaymentQrInitialMode(isSuperAdmin ? 'CHANGE' : 'VIEW');
              setIsPaymentQrModalOpen(true);
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r ${
              isSuperAdmin 
                ? 'from-rose-600 via-red-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-500/20 border-rose-400/40' 
                : 'from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 border-white/10'
            } text-white rounded-2xl text-xs font-bold transition shadow-lg border backdrop-blur-md font-battambang`}
            title={isSuperAdmin ? "ប្តូរ ឬផ្ទុករូបភាព QR Code ទទួលប្រាក់សិស្ស (Auto-sync ទៅកាន់សិស្សទាំងអស់)" : "មើលរូបភាព QR Code ទទួលប្រាក់សិស្ស (Super Admin សម្រាប់កែប្រែ)"}
          >
            <QrCode className="w-4 h-4 text-rose-200" />
            <span>{isSuperAdmin ? '💳 ប្តូរ QR ទទួលប្រាក់សិស្ស' : '💳 QR ទទួលប្រាក់សិស្ស'}</span>
            <span className="hidden md:inline-block text-[10px] bg-black/30 text-rose-200 px-1.5 py-0.5 rounded-full font-mono">
              {school.paymentQrAccountName || 'RIN SOPHEAK'}
            </span>
          </button>

          {/* Upload Student Photo Button */}
          <button
            id="btn-upload-student-photo-main"
            onClick={() => {
              setSelectedStudentForPhoto(null);
              setIsPhotoUploadModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-purple-500/20 border border-purple-400/40 backdrop-blur-md font-battambang"
            title="ផ្ទុករូបថតសិស្ស (Upload / Change Student Photo - មួយៗ ឬច្រើនព្រមគ្នា)"
          >
            <Camera className="w-4 h-4 text-purple-200" />
            <span>📸 ផ្ទុករូបថតសិស្ស (Upload Photo)</span>
          </button>

          {/* Import Excel Button */}
          {isSuperAdmin ? (
            <button
              onClick={() => setIsExcelImportModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-emerald-500/20 border border-emerald-400/40 backdrop-blur-md font-battambang"
              title="នាំចូលទិន្នន័យសិស្សពីឯកសារ Excel (16 Fields)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>+ នាំចូល Excel (Import Excel)</span>
            </button>
          ) : (
            <button
              disabled
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800/80 text-slate-400 rounded-2xl text-xs font-semibold border border-white/5 cursor-not-allowed opacity-60 backdrop-blur-md font-battambang"
              title="មានតែ Super Admin ប៉ុណ្ណោះដែលអាចនាំចូល Excel បាន (Super Admin Only)"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>នាំចូល Excel</span>
            </button>
          )}

          {/* Export CSV / Excel Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-2xl text-xs font-semibold transition backdrop-blur-md"
          >
            <Download className="w-4 h-4 text-indigo-300" />
            <span>នាំចេញ Excel/CSV</span>
          </button>

          {/* Remove All Students Button (Super Admin) */}
          {isSuperAdmin && onRemoveAllStudents && students.length > 0 && (
            <button
              type="button"
              id="btn-remove-all-students"
              onClick={() => setIsRemoveAllStudentsModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-rose-500/20 border border-rose-400/30 backdrop-blur-md font-battambang"
              title="លុបទិន្នន័យសិស្សទាំងអស់ (Remove All Students)"
            >
              <Trash2 className="w-4 h-4" />
              <span>លុបសិស្សទាំងអស់ (Remove All)</span>
            </button>
          )}

          {/* New Student Button */}
          {isSuperAdmin ? (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-2xl text-xs font-semibold transition shadow-lg shadow-indigo-500/20 border border-indigo-400/30 backdrop-blur-md font-battambang"
            >
              <Plus className="w-4 h-4" />
              <span>ចុះឈ្មោះសិស្សថ្មី</span>
            </button>
          ) : (
            <button
              disabled
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800/80 text-slate-400 rounded-2xl text-xs font-semibold border border-white/5 cursor-not-allowed opacity-60 backdrop-blur-md font-battambang"
              title="មានតែ Super Admin ប៉ុណ្ណោះដែលអាចចុះឈ្មោះសិស្សបាន (Super Admin Only)"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>ចុះឈ្មោះសិស្ស</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar in Glass Panel */}
      <div className="glass-panel p-4 rounded-3xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        
        {/* Local Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder="ស្វែងរកឈ្មោះ ឬអត្តលេខ..."
            className="w-full pl-9 pr-3 py-2 bg-white/5 text-xs text-slate-100 placeholder-slate-400 rounded-2xl border border-white/10 focus:border-indigo-400 outline-none backdrop-blur-md"
          />
        </div>

        {/* Filter All Users Dropdown */}
        <select
          value={userFilter}
          onChange={e => setUserFilter(e.target.value as any)}
          className="px-3.5 py-2 bg-slate-900/80 text-xs text-indigo-300 font-semibold rounded-2xl border border-indigo-500/30 outline-none font-battambang"
        >
          <option value="ALL">👥 អ្នកប្រើប្រាស់ទាំងអស់ (All Users)</option>
          <option value="HAS_ACCOUNT">🔐 មានគណនីក្នុងប្រព័ន្ធ (With Account)</option>
          <option value="NO_ACCOUNT">👤 មិនទាន់មានគណនី (No Account)</option>
          <option value="HAS_PARENT">👨‍👩‍👧 មានអាណាព្យាបាល (With Guardian)</option>
          <option value="NO_PARENT">❓ គ្មានព័ត៌មានអាណាព្យាបាល (No Guardian)</option>
        </select>

        {/* Sort Students List by No Field (Replaced គ្រប់កម្រិតថ្នាក់ All Grades) */}
        <select
          id="select-sort-students-by-no"
          value={sortByNo}
          onChange={e => setSortByNo(e.target.value as any)}
          className="px-3.5 py-2 bg-slate-900/80 text-xs text-indigo-200 font-semibold rounded-2xl border border-indigo-500/40 hover:border-indigo-400 outline-none font-battambang transition shadow-sm"
          title="តម្រៀបបញ្ជីសិស្សតាមលេខរៀង No (Sort students list by No field name)"
        >
          <option value="NO_ASC">🔢 តម្រៀបតាម No (Sort students list by No: 1 → 9)</option>
          <option value="NO_DESC">🔢 តម្រៀបតាម No (Sort students list by No: 9 → 1)</option>
          <option value="NAME_ASC">🔤 តម្រៀបតាមឈ្មោះ (Sort by Name: A → Z)</option>
          <option value="NAME_DESC">🔤 តម្រៀបតាមឈ្មោះ (Sort by Name: Z → A)</option>
          <option value="CODE_ASC">🏷️ តម្រៀបតាមអត្តលេខ (Sort by Student Code)</option>
          <option value="NEWEST">🕒 សិស្សចុះឈ្មោះថ្មី (Sort by Newest)</option>
        </select>

        {/* Class Filter */}
        <select
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
          className="px-3.5 py-2 bg-slate-900/80 text-xs text-slate-200 rounded-2xl border border-white/10 outline-none font-battambang"
        >
          <option value="ALL">គ្រប់ថ្នាក់រៀន (All Classes)</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Time Study Filter */}
        <select
          value={selectedTimeStudy}
          onChange={e => setSelectedTimeStudy(e.target.value)}
          className="px-3.5 py-2 bg-slate-900/80 text-xs text-amber-300 font-medium rounded-2xl border border-amber-500/30 outline-none font-battambang"
        >
          <option value="ALL">🕒 គ្រប់ម៉ោងសិក្សា (All Time Study)</option>
          {availableTimeStudyOptions.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Gender Filter */}
        <select
          value={selectedGender}
          onChange={e => setSelectedGender(e.target.value)}
          className="px-3.5 py-2 bg-slate-900/80 text-xs text-slate-200 rounded-2xl border border-white/10 outline-none font-battambang"
        >
          <option value="ALL">គ្រប់ភេទ (All Genders)</option>
          <option value="MALE">ប្រុស (Male)</option>
          <option value="FEMALE">ស្រី (Female)</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="px-3.5 py-2 bg-slate-900/80 text-xs text-slate-200 rounded-2xl border border-white/10 outline-none font-battambang"
        >
          <option value="ALL">គ្រប់ស្ថានភាព (All Status)</option>
          <option value="ACTIVE">សកម្ម (Active)</option>
          <option value="DROPPED_OUT">បោះបង់ការសិក្សា (Dropped Out)</option>
          <option value="GRADUATED">បញ្ចប់ការសិក្សា (Graduated)</option>
          <option value="TRANSFERRED">ផ្ទេរការសិក្សា (Transferred)</option>
          <option value="INACTIVE">អសកម្ម (Inactive)</option>
        </select>

      </div>

      {/* Students Data Table in Glass Panel */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-slate-300 font-battambang">
                <th className="py-3.5 px-3 font-semibold text-center w-14">
                  <span className="flex items-center justify-center gap-1">
                    <span>ល.រ</span>
                    <span className="text-[10px] text-indigo-300 font-mono font-bold">(No)</span>
                  </span>
                </th>
                <th className="py-3.5 px-4 font-semibold">រូបថត & អត្តលេខ</th>
                <th className="py-3.5 px-4 font-semibold">គោត្តនាម-នាម</th>
                <th className="py-3.5 px-4 font-semibold">ភេទ & ថ្ងៃកំណើត</th>
                <th className="py-3.5 px-4 font-semibold">ថ្នាក់រៀន</th>
                <th className="py-3.5 px-4 font-semibold">អាណាព្យាបាល & ទូរស័ព្ទ</th>
                <th className="py-3.5 px-4 font-semibold">ស្ថានភាព</th>
                <th className="py-3.5 px-4 font-semibold text-right">សកម្មភាព (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {sortedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    មិនមានទិន្នន័យសិស្សត្រូវនឹងលក្ខខណ្ឌស្វែងរកឡើយ
                  </td>
                </tr>
              ) : (
                sortedStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-white/5 transition-colors">
                    
                    {/* No Column */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-[30px] h-7 px-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono font-bold text-indigo-300 shadow-sm">
                        {getStudentDisplayNo(student, idx)}
                      </span>
                    </td>

                    {/* Photo & Code */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative group flex-shrink-0">
                          <img 
                            src={student.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                            alt={student.nameKhmer}
                            className="w-10 h-10 rounded-2xl object-cover border border-white/20 shadow-md group-hover:border-indigo-400 transition" 
                          />
                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudentForPhoto(student);
                                setIsPhotoUploadModalOpen(true);
                              }}
                              className="absolute inset-0 bg-slate-950/70 rounded-2xl opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white"
                              title="ចុចដើម្បីប្តូររូបថតសិស្ស (Upload Student Photo)"
                            >
                              <Camera className="w-4 h-4 text-indigo-300" />
                            </button>
                          )}
                        </div>
                        <div>
                          <span className="font-mono font-bold text-indigo-300 block">{student.studentCode}</span>
                          <span className="text-[10px] text-slate-400">{student.academicYear}</span>
                        </div>
                      </div>
                    </td>

                    {/* Name & Extra Badges */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white font-battambang text-sm leading-tight">{student.nameKhmer}</p>
                        {(() => {
                          const linkedAcc = getStudentUserAccount(student);
                          if (linkedAcc) {
                            return (
                              <span 
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium font-sans"
                                title={`គណនីប្រើប្រាស់: ${linkedAcc.username || linkedAcc.email} (${linkedAcc.role})`}
                              >
                                <KeyRound className="w-2.5 h-2.5 text-emerald-400" />
                                <span>{linkedAcc.username || linkedAcc.role}</span>
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">{student.nameEnglish || '—'}</p>
                      
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {student.rlc && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono">
                            RLC: {student.rlc}
                          </span>
                        )}
                        {(student.time_study || student.timeStudy) && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-battambang flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {student.time_study || student.timeStudy}
                          </span>
                        )}
                        {student.contributions && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                            {student.contributions}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Gender & DOB & Age */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5 mb-1">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isFemaleGender(student.gender) ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {getGenderKhmer(student.gender)}
                        </span>
                        {student.age && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {student.age} ឆ្នាំ
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px] font-mono">{getStudentDob(student) || '—'}</p>
                    </td>

                    {/* Class */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200 font-battambang">{student.className}</span>
                      <span className="text-[10px] text-slate-400 block">កម្រិតទី {student.grade}</span>
                    </td>

                    {/* Parent */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-200 font-battambang">{student.parentNameKhmer || '—'}</p>
                      <p className="text-slate-400 font-mono text-[11px]">{student.parentPhone || student.phone || '—'}</p>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          student.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          student.status === 'DROPPED_OUT' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-extrabold' :
                          student.status === 'GRADUATED' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                          student.status === 'TRANSFERRED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                          'bg-slate-500/20 text-slate-300 border-slate-500/30'
                        }`}>
                          {student.status === 'ACTIVE' ? 'កំពុងរៀន' :
                           student.status === 'DROPPED_OUT' ? 'បោះបង់ការសិក្សា' :
                           student.status === 'GRADUATED' ? 'បញ្ចប់ការសិក្សា' :
                           student.status === 'TRANSFERRED' ? 'ផ្ទេរការសិក្សា' :
                           student.status === 'INACTIVE' ? 'អសកម្ម' : student.status}
                        </span>

                        {/* Return to school quick action button if dropped out */}
                        {student.status === 'DROPPED_OUT' && (
                          <button
                            onClick={() => handleReturnToSchool(student)}
                            className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold transition font-battambang active:scale-95 cursor-pointer shadow-sm"
                            title="ស្តារចូលរៀនវិញ (Return to school)"
                          >
                            <RotateCcw className="w-2.5 h-2.5 text-emerald-400" />
                            <span>ស្តារចូលរៀន (Return)</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        
                        {/* Return to school action if DROPPED_OUT */}
                        {student.status === 'DROPPED_OUT' && (
                          <button
                            onClick={() => handleReturnToSchool(student)}
                            className="p-2 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-xl transition border border-emerald-500/40 hover:border-emerald-300"
                            title="ស្តារសិស្សចូលរៀនវិញ (Return to school)"
                          >
                            <RotateCcw className="w-4 h-4 text-emerald-400" />
                          </button>
                        )}

                        {/* Upload / Change Student Photo */}
                        {isSuperAdmin && (
                          <button
                            onClick={() => {
                              setSelectedStudentForPhoto(student);
                              setIsPhotoUploadModalOpen(true);
                            }}
                            className="p-2 text-purple-300 hover:bg-purple-500/20 rounded-xl transition border border-purple-500/20 hover:border-purple-400/40"
                            title="ផ្ទុក/ប្តូររូបថតសិស្ស (Upload/Change Student Photo)"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        )}

                        {/* Student Payment QR */}
                        <button
                          onClick={() => {
                            setSelectedStudentForQr(student);
                            setPaymentQrInitialMode('VIEW');
                            setIsPaymentQrModalOpen(true);
                          }}
                          className="p-2 text-rose-300 hover:bg-rose-500/20 rounded-xl transition border border-rose-500/20 hover:border-rose-400/40"
                          title="QR ទទួលប្រាក់សិស្ស (Student Payment KHQR)"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* View ID Card */}
                        <button
                          onClick={() => triggerViewIdCard(student)}
                          className="p-2 text-indigo-300 hover:bg-white/10 rounded-xl transition border border-transparent hover:border-white/10"
                          title="កាតសម្គាល់សិស្ស (Student ID Card)"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>

                        {/* View Report Card */}
                        <button
                          onClick={() => triggerViewReportCard(student)}
                          className="p-2 text-emerald-300 hover:bg-white/10 rounded-xl transition border border-transparent hover:border-white/10"
                          title="ព្រឹត្តិបត្រពិន្ទុ (Report Card)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* View Profile Modal */}
                        <button
                          onClick={() => setProfileModalStudent(student)}
                          className="p-2 text-blue-300 hover:bg-white/10 rounded-xl transition border border-transparent hover:border-white/10"
                          title="មើលប្រវត្តិរូបសង្ខេប"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit (Super Admin only) */}
                        {isSuperAdmin ? (
                          <button
                            onClick={() => handleOpenEditModal(student)}
                            className="p-2 text-amber-300 hover:bg-white/10 rounded-xl transition border border-transparent hover:border-white/10"
                            title="កែប្រែទិន្នន័យសិស្ស (Super Admin)"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span 
                            className="p-2 text-slate-500 cursor-not-allowed opacity-40" 
                            title="សិទ្ធិកែប្រែ៖ Super Admin ប៉ុណ្ណោះ"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}

                        {/* Delete (Super Admin only) */}
                        {isSuperAdmin && (
                          <button
                            onClick={() => {
                              if (confirm(`តើអ្នកពិតជាចង់លុបសិស្ស ${student.nameKhmer} មែនទេ?`)) {
                                onDeleteStudent(student.id);
                              }
                            }}
                            className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition border border-transparent hover:border-rose-500/30"
                            title="លុបសិស្ស"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>បង្ហាញ {sortedStudents.length} នៃសិស្សសរុប {students.length} នាក់</span>
          <span>ឆ្នាំសិក្សា {school.academicYear}</span>
        </div>
      </div>

      {/* Add / Edit Student Frosted Glass Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <h3 className="font-bold text-white font-battambang text-base">
                {editingStudent ? 'កែប្រែព័ត៌មានសិស្ស' : 'ចុះឈ្មោះសិស្សថ្មី (New Student Enrollment)'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              
              {/* Student Photo Picker in Form */}
              <div 
                onDragOver={e => { e.preventDefault(); setIsPhotoDragging(true); }}
                onDragLeave={() => setIsPhotoDragging(false)}
                onDrop={e => {
                  e.preventDefault();
                  setIsPhotoDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFormPhotoFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`p-4 rounded-2xl border transition-all ${
                  isPhotoDragging 
                    ? 'bg-indigo-500/20 border-indigo-400' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <input
                  ref={formFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFormPhotoFile(file);
                    }
                    e.target.value = '';
                  }}
                />

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Photo Preview & Direct Click Trigger */}
                  <div 
                    onClick={() => formFileInputRef.current?.click()}
                    className="relative group cursor-pointer flex-shrink-0"
                    title="ចុចដើម្បីជ្រើសរើសរូបថត (Click to upload photo)"
                  >
                    <img
                      src={formData.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt="Student Preview"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-lg group-hover:border-indigo-400 transition"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-0.5">
                      <Camera className="w-5 h-5 text-indigo-300" />
                      <span>ប្តូររូបថត</span>
                    </div>

                    {isPhotoProcessing && (
                      <div className="absolute inset-0 bg-slate-950/80 rounded-2xl flex flex-col items-center justify-center text-indigo-300">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                        <span className="text-[9px] mt-1 font-mono">កំពុងផ្ទុក...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-bold font-battambang text-sm flex items-center gap-1.5">
                        <span>រូបថតសិស្ស (Student Photo)</span>
                        {formData.photo && (
                          <span className="text-[10px] text-emerald-400 font-sans font-normal px-1.5 py-0.2 bg-emerald-500/10 rounded border border-emerald-500/20">
                            ✓ រួចរាល់
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      លោកអ្នកអាចផ្ទុករូបថតផ្ទាល់ (JPG, PNG, WebP) ទម្លាក់រូបភាព ឬជ្រើសរូបភាពគំរូ
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 font-battambang">
                      
                      {/* Upload Button */}
                      <button
                        type="button"
                        onClick={() => formFileInputRef.current?.click()}
                        disabled={isPhotoProcessing}
                        className="cursor-pointer flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition border border-indigo-400/40 shadow-sm active:scale-95"
                      >
                        {isPhotoProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Camera className="w-3.5 h-3.5" />
                        )}
                        <span>ជ្រើសរើសរូបថត (Upload)</span>
                      </button>

                      {/* URL Toggle */}
                      <button
                        type="button"
                        onClick={() => setShowPhotoUrlInput(prev => !prev)}
                        className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-semibold transition border border-white/10 flex items-center gap-1"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>តំណភ្ជាប់ URL</span>
                      </button>

                      {/* Default Reset */}
                      {formData.photo && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                          className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition border border-white/10"
                        >
                          ប្រើរូបលំនាំដើម
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {photoUploadError && (
                  <div className="mt-2.5 p-2 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-[11px] flex items-center gap-1.5 font-battambang">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{photoUploadError}</span>
                  </div>
                )}

                {/* URL Input Box */}
                {showPhotoUrlInput && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="បិទភ្ជាប់តំណភ្ជាប់រូបភាព (https://...)"
                      value={photoUrlInputValue}
                      onChange={e => setPhotoUrlInputValue(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-indigo-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (photoUrlInputValue.trim()) {
                          setFormData(prev => ({ ...prev, photo: photoUrlInputValue.trim() }));
                          setShowPhotoUrlInput(false);
                          setPhotoUrlInputValue('');
                        }
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                    >
                      អនុវត្ត
                    </button>
                  </div>
                )}

                {/* Preset Avatars */}
                <div className="mt-3 pt-2.5 border-t border-white/10">
                  <span className="text-[10px] text-slate-400 block mb-1.5 font-battambang">
                    រូបថតគំរូសិស្សរហ័ស (Student Photo Presets):
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {STUDENT_PHOTO_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, photo: preset.url }))}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-xl text-[11px] transition border ${
                          formData.photo === preset.url
                            ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 ring-1 ring-indigo-400'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.label} 
                          className="w-4 h-4 rounded-full object-cover" 
                        />
                        <span className="font-battambang text-[10px]">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Codes & Names */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-slate-300 font-medium mb-1">ល.រ (No Field)</label>
                  <input
                    type="text"
                    value={formData.no ?? ''}
                    onChange={e => setFormData({ ...formData, no: e.target.value })}
                    placeholder="1"
                    className="w-full px-3 py-2 bg-white/5 rounded-2xl border border-white/10 font-mono font-bold text-indigo-300 outline-none"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-slate-300 font-medium mb-1">អត្តលេខសិស្ស (ID Code)*</label>
                  <input
                    type="text"
                    required
                    value={formData.studentCode || ''}
                    onChange={e => setFormData({ ...formData, studentCode: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 rounded-2xl border border-white/10 font-mono font-bold text-indigo-300 outline-none"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-slate-300 font-medium mb-1">ឈ្មោះជាភាសាខ្មែរ*</label>
                  <input
                    type="text"
                    required
                    value={formData.nameKhmer || ''}
                    onChange={e => setFormData({ ...formData, nameKhmer: e.target.value })}
                    placeholder="ឧ. ហេង ពិសិដ្ឋ"
                    className="w-full px-3 py-2 bg-white/5 rounded-2xl border border-white/10 focus:border-indigo-400 text-white font-battambang outline-none"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-slate-300 font-medium mb-1">ឈ្មោះឡាតាំង (English)*</label>
                  <input
                    type="text"
                    required
                    value={formData.nameEnglish || ''}
                    onChange={e => setFormData({ ...formData, nameEnglish: e.target.value })}
                    placeholder="e.g. Heng Piseth"
                    className="w-full px-3 py-2 bg-white/5 rounded-2xl border border-white/10 focus:border-indigo-400 text-white outline-none"
                  />
                </div>
              </div>

              {/* Gender, DOB, POB */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ភេទ (Gender)*</label>
                  <select
                    value={formData.gender || 'MALE'}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 text-slate-200 rounded-2xl border border-white/10 outline-none"
                  >
                    <option value="MALE">ប្រុស (Male)</option>
                    <option value="FEMALE">ស្រី (Female)</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-medium">ថ្ងៃខែឆ្នាំកំណើត*</label>
                    {getStudentDob(formData as any) && (
                      <span className="text-[10px] text-indigo-300 font-mono">
                        ({getStudentDob(formData as any)})
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    required
                    value={getStudentDob(formData as any)}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData({ ...formData, dob: val, date_of_birth: val, dateOfBirth: val });
                    }}
                    className="w-full px-3 py-2 bg-white/5 text-slate-200 rounded-2xl border border-white/10 focus:border-indigo-400 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ទីកន្លែងកំណើត (POB)</label>
                  <select
                    value={formData.pob || 'រាជធានីភ្នំពេញ'}
                    onChange={e => setFormData({ ...formData, pob: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 text-slate-200 rounded-2xl border border-white/10 font-battambang outline-none"
                  >
                    {CAMBODIA_PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Class & Academic Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1 font-battambang">ថ្នាក់រៀន (Class)*</label>
                  <select
                    id="student-form-class-select"
                    value={getSelectedClassValue()}
                    onChange={e => handleClassSelectChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 text-slate-200 rounded-2xl border border-white/10 font-battambang outline-none focus:border-indigo-400"
                  >
                    <option value="1">ថ្នាក់ទី១ (Grade 1)</option>
                    <option value="2">ថ្នាក់ទី២ (Grade 2)</option>
                    <option value="3">ថ្នាក់ទី៣ (Grade 3)</option>
                    <option value="4">ថ្នាក់ទី៤ (Grade 4)</option>
                    <option value="5">ថ្នាក់ទី៥ (Grade 5)</option>
                    <option value="6">ថ្នាក់ទី៦ (Grade 6)</option>
                    <option value="7">ថ្នាក់ទី៧ (Grade 7)</option>
                    <option value="8">ថ្នាក់ទី៨ (Grade 8)</option>
                    <option value="9">ថ្នាក់ទី៩ (Grade 9)</option>
                    <option value="10">ថ្នាក់ទី១០ (Grade 10)</option>
                    <option value="11">ថ្នាក់ទី១១ (Grade 11)</option>
                    <option value="12">ថ្នាក់ទី១២ (Grade 12)</option>
                    {/* Specific room sections if any */}
                    {classes.filter(c => ['CLS-11B', 'CLS-12B', 'CLS-COMP-A', 'CLS-COMP-B'].includes(c.id)).map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.room})</option>
                    ))}
                    <option value="OTHER">ផ្សេងៗ (Other)</option>
                  </select>

                  {/* Other Custom Class input field */}
                  {isOtherClass && (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <label className="block text-slate-300 font-medium mb-1 text-[11px] font-battambang">
                        ឈ្មោះថ្នាក់ផ្សេងៗ (Custom Class Name)*
                      </label>
                      <input
                        type="text"
                        required
                        id="student-form-custom-class-input"
                        placeholder="ឧ. ថ្នាក់កុំព្យូទ័រ, ថ្នាក់ភាសា, ថ្នាក់សិល្បៈ..."
                        value={customClassName}
                        onChange={e => {
                          const val = e.target.value;
                          setCustomClassName(val);
                          setFormData(prev => ({
                            ...prev,
                            classId: 'CLS-OTHER',
                            className: val || 'ផ្សេងៗ (Other)',
                            grade: 'Other'
                          }));
                        }}
                        className="w-full px-3 py-2 bg-indigo-500/10 text-white rounded-2xl border border-indigo-400/50 font-battambang outline-none focus:border-indigo-400 text-xs"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ឆ្នាំសិក្សា (Academic Year)</label>
                  <input
                    type="text"
                    value={formData.academicYear || school.academicYear}
                    onChange={e => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 text-slate-200 rounded-2xl border border-white/10 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">ស្ថានភាពសិស្ស</label>
                  <select
                    value={formData.status || 'ACTIVE'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                    className="w-full px-3 py-2 bg-slate-800 text-slate-200 rounded-2xl border border-white/10 outline-none font-battambang"
                  >
                    <option value="ACTIVE">សកម្ម / កំពុងរៀន (Active)</option>
                    <option value="DROPPED_OUT">បោះបង់ការសិក្សា (Dropped Out)</option>
                    <option value="GRADUATED">បញ្ចប់ការសិក្សា (Graduated)</option>
                    <option value="TRANSFERRED">ផ្ទេរចេញ (Transferred)</option>
                    <option value="INACTIVE">អសកម្ម (Inactive)</option>
                  </select>
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">លេខទូរស័ព្ទសិស្ស</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="098 xxx xxx"
                    className="w-full px-3 py-2 bg-white/5 text-slate-200 rounded-2xl border border-white/10 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">អ៊ីមែលសិស្ស</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@school.edu.kh"
                    className="w-full px-3 py-2 bg-white/5 text-slate-200 rounded-2xl border border-white/10 outline-none"
                  />
                </div>
              </div>

              {/* Parent Details */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                <h4 className="font-bold text-white font-battambang">ព័ត៌មានអាណាព្យាបាល (Parent / Guardian)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">ឈ្មោះឪពុក/ម្តាយ/អាណាព្យាបាល</label>
                    <input
                      type="text"
                      value={formData.parentNameKhmer || ''}
                      onChange={e => setFormData({ ...formData, parentNameKhmer: e.target.value })}
                      placeholder="ឧ. លោក ហេង រតនា"
                      className="w-full px-3 py-2 bg-white/5 text-slate-200 rounded-2xl border border-white/10 font-battambang outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">លេខទូរស័ព្ទអាណាព្យាបាល*</label>
                    <input
                      type="text"
                      value={formData.parentPhone || ''}
                      onChange={e => setFormData({ ...formData, parentPhone: e.target.value, emergencyContact: e.target.value })}
                      placeholder="012 xxx xxx"
                      className="w-full px-3 py-2 bg-white/5 text-slate-200 rounded-2xl border border-white/10 font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">អាសយដ្ឋានបច្ចុប្បន្ន (Current Address)</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="ផ្ទះលេខ... ផ្លូវ... សង្កាត់... ខណ្ឌ..."
                  className="w-full px-3 py-2 bg-white/5 text-slate-200 rounded-2xl border border-white/10 font-battambang outline-none"
                />
              </div>

              {/* Extra 16-field information Section */}
              <div className="p-4 bg-cyan-500/5 rounded-2xl border border-cyan-500/20 space-y-3">
                <h4 className="font-bold text-cyan-300 font-battambang flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>ព័ត៌មានលម្អិតបន្ថែម (Additional 16-Field Info)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">អាយុ (Age)</label>
                    <input
                      type="number"
                      value={formData.age || ''}
                      onChange={e => setFormData({ ...formData, age: e.target.value })}
                      placeholder="ឧ. 18"
                      className="w-full px-3 py-2 bg-white/5 text-slate-200 rounded-2xl border border-white/10 font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">លេខសម្គាល់ RLC (rlc)</label>
                    <input
                      type="text"
                      value={formData.rlc || ''}
                      onChange={e => setFormData({ ...formData, rlc: e.target.value })}
                      placeholder="ឧ. RLC-12A"
                      className="w-full px-3 py-2 bg-white/5 text-slate-200 rounded-2xl border border-white/10 font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">វិភាគទាន (contributions)</label>
                    <input
                      type="text"
                      value={formData.contributions || ''}
                      onChange={e => setFormData({ ...formData, contributions: e.target.value })}
                      placeholder="ឧ. $50.00"
                      className="w-full px-3 py-2 bg-white/5 text-slate-200 rounded-2xl border border-white/10 font-mono outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">ម៉ោងសិក្សា (time_study)</label>
                    <input
                      type="text"
                      value={formData.time_study || ''}
                      onChange={e => setFormData({ ...formData, time_study: e.target.value })}
                      placeholder="ឧ. 07:30 - 11:00"
                      className="w-full px-3 py-2 bg-white/5 text-slate-200 rounded-2xl border border-white/10 font-battambang outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">ឆមាស (semester)</label>
                    <input
                      type="text"
                      value={formData.semester || 'ឆមាសទី១'}
                      onChange={e => setFormData({ ...formData, semester: e.target.value })}
                      placeholder="ឧ. ឆមាសទី១"
                      className="w-full px-3 py-2 bg-white/5 text-slate-200 rounded-2xl border border-white/10 font-battambang outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">វិធីបង់ប្រាក់ (payment_by)</label>
                    <input
                      type="text"
                      value={formData.payment_by || ''}
                      onChange={e => setFormData({ ...formData, payment_by: e.target.value })}
                      placeholder="ឧ. ABA Bank, Cash"
                      className="w-full px-3 py-2 bg-white/5 text-slate-200 rounded-2xl border border-white/10 font-battambang outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">សៀវភៅពុម្ព (books)</label>
                    <input
                      type="text"
                      value={formData.books || ''}
                      onChange={e => setFormData({ ...formData, books: e.target.value })}
                      placeholder="ឧ. បានទទួល ៤ ក្បាល"
                      className="w-full px-3 py-2 bg-white/5 text-slate-200 rounded-2xl border border-white/10 font-battambang outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">ចំណាំ (remark)</label>
                    <input
                      type="text"
                      value={formData.remark || ''}
                      onChange={e => setFormData({ ...formData, remark: e.target.value })}
                      placeholder="ឧ. សិស្សពូកែ"
                      className="w-full px-3 py-2 bg-white/5 text-slate-200 rounded-2xl border border-white/10 font-battambang outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">ផ្សេងៗ (orther)</label>
                    <input
                      type="text"
                      value={formData.orther || ''}
                      onChange={e => setFormData({ ...formData, orther: e.target.value })}
                      placeholder="ឧ. ប្អូនបង្កើតសិស្សចាស់"
                      className="w-full px-3 py-2 bg-white/5 text-slate-200 rounded-2xl border border-white/10 font-battambang outline-none"
                    />
                  </div>
                </div>

              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl text-xs font-semibold transition border border-white/10"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-semibold transition shadow-lg shadow-indigo-500/20 border border-indigo-400/30 font-battambang"
                >
                  {editingStudent ? 'រក្សាទុកការកែប្រែ' : 'ចុះឈ្មោះសិស្ស'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Profile Detail Drawer / Modal in Frosted Glass */}
      {profileModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="relative bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 text-white p-6 border-b border-white/10">
              <button 
                onClick={() => setProfileModalStudent(null)} 
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-4">
                <div className="relative group flex-shrink-0">
                  <img 
                    src={profileModalStudent.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                    alt={profileModalStudent.nameKhmer}
                    className="w-20 h-20 rounded-2xl object-cover border border-white/30 shadow-xl" 
                  />
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = profileModalStudent;
                        setSelectedStudentForPhoto(target);
                        setIsPhotoUploadModalOpen(true);
                      }}
                      className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white"
                      title="ប្តូររូបថតសិស្ស (Upload/Change Photo)"
                    >
                      <Camera className="w-5 h-5 text-indigo-300" />
                      <span className="text-[9px] mt-0.5 font-battambang">ប្តូររូបថត</span>
                    </button>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      {profileModalStudent.className}
                    </span>
                    {profileModalStudent.rlc && (
                      <span className="bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                        RLC: {profileModalStudent.rlc}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold font-battambang text-white mt-1.5">{profileModalStudent.nameKhmer}</h3>
                  <p className="text-xs text-indigo-300 font-medium">{profileModalStudent.nameEnglish}</p>
                  <p className="text-xs text-amber-300 font-mono mt-1 font-bold">{profileModalStudent.studentCode}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-slate-400">ថ្ងៃខែឆ្នាំកំណើត & អាយុ</p>
                  <p className="font-semibold text-white text-xs mt-0.5 font-mono">
                    {getStudentDob(profileModalStudent)} {profileModalStudent.age ? `(${profileModalStudent.age} ឆ្នាំ)` : ''}
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-slate-400">ទីកន្លែងកំណើត</p>
                  <p className="font-semibold text-white text-xs mt-0.5 font-battambang">{profileModalStudent.pob}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-slate-400">អាណាព្យាបាល</p>
                  <p className="font-semibold text-white text-xs mt-0.5 font-battambang">{profileModalStudent.parentNameKhmer || '—'}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-slate-400">ទូរស័ព្ទទំនាក់ទំនង</p>
                  <p className="font-semibold text-white text-xs font-mono mt-0.5">{profileModalStudent.parentPhone || profileModalStudent.phone || '—'}</p>
                </div>
              </div>

              {/* 16 Fields details grid */}
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                <h5 className="font-bold text-cyan-300 font-battambang flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ព័ត៌មានសិក្សា និងវិភាគទាន (16 Fields Detail)</span>
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">វិភាគទាន:</span>
                    <strong className="text-emerald-300 font-mono">{profileModalStudent.contributions || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">ម៉ោងសិក្សា:</span>
                    <strong className="text-amber-300 font-battambang">{profileModalStudent.time_study || profileModalStudent.timeStudy || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">ឆមាស:</span>
                    <strong className="text-indigo-300 font-battambang">{profileModalStudent.semester || 'ឆមាសទី១'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">បង់ប្រាក់តាម:</span>
                    <strong className="text-slate-200 font-battambang">{profileModalStudent.payment_by || profileModalStudent.paymentBy || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">សៀវភៅ:</span>
                    <strong className="text-slate-200 font-battambang">{profileModalStudent.books || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">ផ្សេងៗ:</span>
                    <strong className="text-slate-200 font-battambang">{profileModalStudent.orther || profileModalStudent.other || '—'}</strong>
                  </div>
                </div>
                {profileModalStudent.remark && (
                  <div className="pt-1.5 border-t border-white/10 text-[11px]">
                    <span className="text-slate-400">ចំណាំ: </span>
                    <span className="text-slate-200 font-battambang">{profileModalStudent.remark}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-slate-400">អាសយដ្ឋានបច្ចុប្បន្ន</p>
                <p className="font-semibold text-white mt-0.5 font-battambang">{profileModalStudent.address || 'រាជធានីភ្នំពេញ'}</p>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    const s = profileModalStudent;
                    setProfileModalStudent(null);
                    triggerViewIdCard(s);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-indigo-300 border border-white/15 rounded-2xl font-semibold transition"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>បោះពុម្ពកាតសិស្ស</span>
                </button>
                <button
                  onClick={() => {
                    const s = profileModalStudent;
                    setProfileModalStudent(null);
                    triggerViewReportCard(s);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-2xl font-semibold transition border border-emerald-400/30 shadow-lg shadow-emerald-500/20"
                >
                  <FileText className="w-4 h-4" />
                  <span>ព្រឹត្តិបត្រពិន្ទុ</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      <StudentExcelImportModal
        isOpen={isExcelImportModalOpen}
        onClose={() => setIsExcelImportModalOpen(false)}
        classes={classes}
        academicYear={school.academicYear}
        existingStudentsCount={students.length}
        onImportSuccess={handleBatchImport}
      />

      {/* Remove All Students Confirmation Modal */}
      {isRemoveAllStudentsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl shadow-rose-950/50 space-y-5">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-battambang flex items-center gap-2">
                    <span>លុបទិន្នន័យសិស្សទាំងអស់</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 font-sans font-semibold">
                      {students.length} នាក់
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">Remove All Students Confirmation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRemoveAllStudentsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 leading-relaxed font-battambang">
              <p className="font-bold text-rose-300">តើលោកអ្នកពិតជាចង់លុបទិន្នន័យសិស្សទាំងអស់ ({students.length} នាក់) មែនដែរឬទេ?</p>
              <p className="mt-1 text-slate-300">
                ទិន្នន័យសិស្សទាំងអស់ក្នុងប្រព័ន្ធនឹងត្រូវបានលុបចេញ។ លោកអ្នកអាចនាំចូលទិន្នន័យសិស្សថ្មីពីឯកសារ Excel ឡើងវិញបាននៅពេលក្រោយ។
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-white/10 font-battambang">
              <button
                type="button"
                onClick={() => setIsRemoveAllStudentsModalOpen(false)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                id="btn-confirm-remove-all-students"
                onClick={() => {
                  if (onRemoveAllStudents) {
                    onRemoveAllStudents();
                  }
                  setIsRemoveAllStudentsModalOpen(false);
                }}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/30 border border-rose-400/40"
              >
                <Trash2 className="w-4 h-4" />
                <span>បញ្ជាក់ការលុបសិស្សទាំងអស់</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Payment QR Modal (Auto syncs globally) */}
      <PaymentQrModal
        isOpen={isPaymentQrModalOpen}
        onClose={() => {
          setIsPaymentQrModalOpen(false);
          setSelectedStudentForQr(null);
        }}
        school={school}
        onSaveSchool={onSaveSchool || (() => {})}
        student={selectedStudentForQr}
        totalStudentsCount={students.length}
        initialMode={paymentQrInitialMode}
        userRole={userRole}
      />

      {/* Student Photo Upload Modal (Single & Batch & Webcam) */}
      <StudentPhotoUploadModal
        isOpen={isPhotoUploadModalOpen}
        onClose={() => {
          setIsPhotoUploadModalOpen(false);
          setSelectedStudentForPhoto(null);
        }}
        students={students}
        initialSelectedStudent={selectedStudentForPhoto}
        onSaveStudent={onSaveStudent}
        onSaveStudentsBatch={onSaveStudentsBatch}
      />

    </div>
  );
};
