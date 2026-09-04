export type UserRole = 
  | 'ADMIN'
  | 'SUPER_ADMIN' 
  | 'SCHOOL_ADMIN' 
  | 'DIRECTOR' 
  | 'TEACHER' 
  | 'STUDENT' 
  | 'PARENT' 
  | 'ACCOUNTANT' 
  | 'LIBRARIAN' 
  | 'STAFF';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'M' | 'F';

export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'TRANSFERRED' | 'SUSPENDED' | 'DROPPED_OUT';

export type AttendanceStatusType = 'PRESENT' | 'ABSENT' | 'LATE' | 'PERMISSION' | 'DROPPED_OUT';
export type AttendanceStatus = AttendanceStatusType;

export type ExamType = 'MONTHLY' | 'MIDTERM' | 'FINAL' | 'QUIZ' | 'ASSIGNMENT';

export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE' | 'PENDING';
export type InvoiceStatus = PaymentStatus;

export type PaymentMethod = 'ABA' | 'ABA_PAY' | 'ACLEDA' | 'WING' | 'CASH' | 'BANK_TRANSFER' | 'KHQR' | 'BAKONG_KHQR';

export type ShiftType = 'MORNING' | 'AFTERNOON' | 'EVENING';

export type Language = 'km' | 'en';

export type NavTab =
  | 'dashboard'
  | 'notifications'
  | 'weekly_report'
  | 'my_courses'
  | 'my_projects'
  | 'my_notes'
  | 'my_progress'
  | 'students'
  | 'teachers'
  | 'parents'
  | 'classes'
  | 'classes_subjects'
  | 'weekly_quiz'
  | 'cleaning_groups'
  | 'attendance'
  | 'grades'
  | 'exams_grades'
  | 'report_cards'
  | 'fees_finance'
  | 'timetable'
  | 'assignments'
  | 'library'
  | 'announcements'
  | 'events'
  | 'academic_calendar'
  | 'certificates'
  | 'reports'
  | 'audit_logs'
  | 'ai_studio'
  | 'profile'
  | 'security_tests'
  | 'settings';

export interface AuthSession {
  token: string;
  userId: string;
  user: User;
  createdAt: string;
  expiresAt: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  code?: string;
  language?: 'html' | 'javascript' | 'python' | 'react' | string;
  tags?: string[];
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  color?: string;
  isPinned?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  courseTitleKhmer: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  lastLessonTitle?: string;
  lastStudiedAt: string;
  quizScore?: number;
  isCompleted: boolean;
  certificateEarned?: boolean;
}

export interface SchoolProfile {
  id: string;
  nameKhmer: string;
  nameEnglish: string;
  schoolCode?: string;
  code?: string;
  logo: string;
  directorName?: string;
  principalKhmer?: string;
  principalEnglish?: string;
  addressKhmer?: string;
  address?: string;
  province?: string;
  district?: string;
  commune?: string;
  phone: string;
  email: string;
  website?: string;
  academicYear: string;
  currentSemester?: string;
  currency?: 'USD' | 'KHR';
  exchangeRate: number;
  stampUrl?: string;
  signatureUrl?: string;
  mottoKhmer?: string;
  mottoEnglish?: string;

  // Student Payment QR Settings (Auto applied to all students)
  paymentQrUrl?: string;
  paymentQrAccountName?: string;
  paymentQrBankName?: string;
  paymentQrAccountNumber?: string;
  paymentQrCurrency?: 'KHR' | 'USD' | 'BOTH';
  paymentQrDefaultAmount?: number;
  paymentQrNotes?: string;
  paymentQrUpdatedAt?: string;

  // Certificate Background & Template Settings
  certificateBackgroundUrl?: string;
  certificateBgOpacity?: number;
  certificateBorderStyle?: 'ORNATE_GOLD' | 'ROYAL_BLUE' | 'EMERALD' | 'PARCHMENT' | 'MINIMAL' | 'NONE';
  certificateTheme?: 'CLASSIC_GOLD' | 'ROYAL_BLUE' | 'EMERALD' | 'PARCHMENT' | 'CUSTOM';
  certificateCustomLayout?: Record<string, any>;
  letterBackgroundUrl?: string;
}

export interface User {
  id: string;
  username?: string;
  password?: string;
  email: string;
  role: UserRole;
  nameKhmer: string;
  nameEnglish: string;
  avatar?: string;
  phone?: string;
  schoolId?: string;
  linkedEntityId?: string;
  lastLogin?: string;
  status?: string;
}

export interface Student {
  id: string;
  no?: number | string;
  studentCode: string;
  nameKhmer: string;
  nameEnglish: string;
  gender: Gender;
  dob: string;
  pobKhmer?: string;
  pob?: string;
  nationality?: string;
  addressKhmer?: string;
  address?: string;
  province?: string;
  phone?: string;
  email?: string;
  photo: string;
  parentId?: string;
  parentNameKhmer?: string;
  parentPhone?: string;
  guardianNameKhmer?: string;
  guardianPhone?: string;
  emergencyContact?: string;
  grade?: string;
  classId: string;
  className: string;
  academicYear?: string;
  status: StudentStatus;
  enrollmentDate?: string;
  previousSchool?: string;
  medicalNotes?: string;

  // Custom user fields from Excel Import (khmer_name, english_name, sex, age, grade, date_of_birth, rlc, phone_number, contributions, remark, orther, books, time_study, status, semester, payment_by)
  date_of_birth?: string;
  dateOfBirth?: string;
  age?: number | string;
  rlc?: string;
  contributions?: string | number;
  remark?: string;
  orther?: string;
  other?: string;
  books?: string;
  timeStudy?: string;
  time_study?: string;
  semester?: string;
  paymentBy?: string;
  payment_by?: string;
}

export interface Parent {
  id: string;
  parentCode: string;
  nameKhmer: string;
  nameEnglish: string;
  gender: Gender;
  relationship: string;
  phone: string;
  email: string;
  address?: string;
  addressKhmer?: string;
  occupation?: string;
  emergencyContact?: string;
  childrenIds?: string[];
  studentIds?: string[];
  studentsCount?: number;
}

export interface Teacher {
  id: string;
  teacherCode: string;
  nameKhmer: string;
  nameEnglish: string;
  gender: Gender;
  dob: string;
  phone: string;
  email: string;
  address?: string;
  addressKhmer?: string;
  qualification: string;
  specialization: string;
  employmentDate?: string;
  position: string;
  photo: string;
  assignedClassIds?: string[];
  assignedSubjectIds?: string[];
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: string;
  academicYear?: string;
  room: string;
  teacherId: string;
  teacherName: string;
  capacity: number;
  shift?: ShiftType;
  status?: 'ACTIVE' | 'ARCHIVED';
}

export interface Subject {
  id: string;
  code: string;
  nameKhmer: string;
  nameEnglish: string;
  grade?: string;
  credits?: number;
  totalHoursPerWeek?: number;
  description?: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Semester {
  id: string;
  nameKhmer: string;
  nameEnglish: string;
  academicYearId: string;
  isCurrent: boolean;
  startDate: string;
  endDate: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentCode: string;
  studentNameKhmer: string;
  classId: string;
  className: string;
  date: string;
  status: AttendanceStatusType;
  reason?: string;
  remarks?: string;
  recordedBy?: string;
  timestamp?: string;
}

export type CleaningDutyDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';

export interface CleaningDutyGroup {
  id: string;
  classId: string;
  className: string;
  dayOfWeek: CleaningDutyDay;
  groupNameKhmer: string; // e.g. 'ក្រុមវេនថ្ងៃច័ន្ទ', 'ក្រុមទី១'
  groupNameEnglish?: string;
  groupLeaderId?: string;
  groupLeaderName?: string;
  studentIds: string[];
  tasks?: string[]; // e.g. ['បោសជូតបន្ទប់រៀន', 'ជូតក្តារខៀន', 'រៀបចំតុគ្រូ និងតុសិស្ស', 'យកធុងសំរាមទៅចាក់']
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CleaningDutyStatus = 'CLEANED' | 'NOT_CLEANED' | 'EXCUSED' | 'PENDING';

export interface CleaningDutyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: CleaningDutyDay;
  classId: string;
  className: string;
  groupId?: string;
  groupName?: string;
  studentId: string;
  studentCode: string;
  studentNameKhmer: string;
  studentGender?: Gender;
  studentPhoto?: string;
  status: CleaningDutyStatus;
  scoreChange: number; // +20 if CLEANED, -20 if NOT_CLEANED, 0 if EXCUSED/PENDING
  inspectorName?: string; // e.g. 'លោកគ្រូ ចាន់ សុខា (គ្រូបន្ទុកថ្នាក់)'
  notes?: string;
  timestamp: string;
}

export interface TimetableSlot {
  id: string;
  day?: 'ចន្ទ' | 'អង្គារ' | 'ពុធ' | 'ព្រហស្បតិ៍' | 'សុក្រ' | 'សៅរ៍';
  dayOfWeek?: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  period?: number;
  periodNumber?: number;
  startTime?: string;
  endTime?: string;
  timeRange?: string;
  classId: string;
  className?: string;
  subjectId: string;
  subjectNameKhmer: string;
  teacherId: string;
  teacherName?: string;
  teacherNameKhmer?: string;
  room: string;
}

export interface Exam {
  id: string;
  title: string;
  nameKhmer?: string;
  examType: ExamType;
  classId: string;
  className: string;
  subjectId: string;
  subjectNameKhmer: string;
  teacherId: string;
  teacherName: string;
  date: string;
  startTime: string;
  endTime: string;
  maxScore: number;
  weightPercent?: number;
  academicYear: string;
  semester: string;
}

export interface GradeItem {
  id: string;
  studentId: string;
  studentCode: string;
  studentNameKhmer: string;
  studentNameEnglish?: string;
  gender?: Gender;
  classId: string;
  className?: string;
  subjectId: string;
  subjectNameKhmer: string;
  academicYear?: string;
  semester?: string;
  examId?: string;
  examName?: string;
  examNameKhmer?: string;
  attendanceScore?: number;
  homeworkScore?: number;
  quizScore?: number;
  midtermScore?: number;
  finalScore?: number;
  score?: number;
  maxScore?: number;
  totalScore?: number;
  letterGrade?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | string;
  gradeKhmer?: string;
  gradeEnglish?: string;
  gpa?: number;
  rankInSubject?: number;
  teacherComment?: string;
  remarksKhmer?: string;
  recordedDate?: string;
  recordedAt?: string;
}

export type GradeRecord = GradeItem;

export interface StudentReportCard {
  student: Student;
  academicYear: string;
  semester: string;
  grades: {
    subjectNameKhmer: string;
    subjectNameEnglish: string;
    credits: number;
    attendanceScore: number;
    homeworkScore: number;
    quizScore: number;
    midtermScore: number;
    finalScore: number;
    totalScore: number;
    letterGrade: string;
  }[];
  totalScore: number;
  averageScore: number;
  classRank: number;
  totalStudentsInClass: number;
  overallGrade: string;
  attendanceSummary: {
    present: number;
    absent: number;
    late: number;
    permission: number;
  };
  conductGrade: 'ល្អប្រសើរ' | 'ល្អ' | 'មធ្យម' | 'ខ្សោយ';
  teacherComment: string;
  directorComment: string;
}

export interface FeeInvoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentCode: string;
  studentNameKhmer: string;
  classId?: string;
  className?: string;
  feeType?: string;
  titleKhmer?: string;
  amountUSD: number;
  amountKHR?: number;
  discountUSD: number;
  discountKHR?: number;
  paidUSD: number;
  paidKHR?: number;
  remainingUSD: number;
  remainingKHR?: number;
  dueDate: string;
  issueDate?: string;
  status: PaymentStatus;
  academicYear?: string;
  createdAt?: string;
}

export interface PaymentRecord {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  studentId: string;
  studentNameKhmer: string;
  studentCode: string;
  amountUSD: number;
  amountKHR: number;
  method: PaymentMethod;
  date: string;
  receivedBy: string;
  transactionRef?: string;
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  expenseCode?: string;
  expenseNumber?: string;
  titleKhmer?: string;
  category: string;
  description?: string;
  amountUSD: number;
  amountKHR: number;
  date: string;
  paidTo?: string;
  paidBy?: string;
  approvedBy?: string;
  paymentMethod?: PaymentMethod | string;
  receiptDoc?: string;
  notes?: string;
}

export interface Book {
  id: string;
  isbn: string;
  titleKhmer: string;
  titleEnglish: string;
  author?: string;
  authorKhmer?: string;
  publisher?: string;
  publishedYear?: number;
  category: string;
  genre?: string;
  genreKhmer?: string;
  tags?: string[];
  totalQty?: number;
  totalCopies?: number;
  availableQty?: number;
  availableCopies?: number;
  shelf?: string;
  shelfLocation?: string;
  locationShelf?: string;
  coverImage?: string;
  priceUSD?: number;
  status?: 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE';
  // Digital / E-Book PDF properties
  pdfUrl?: string;
  pdfFileName?: string;
  pdfFileSize?: string;
  pdfPageCount?: number;
  isDigital?: boolean;
  description?: string;
  downloadAllowed?: boolean;
  pdfSource?: 'DEVICE' | 'GOOGLE_DRIVE' | 'URL';
  driveFileId?: string;
}

export interface BookBorrow {
  id: string;
  borrowCode?: string;
  bookId: string;
  isbn?: string;
  bookTitle?: string;
  bookTitleKhmer?: string;
  studentId: string;
  studentCode: string;
  studentNameKhmer: string;
  className?: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
  fineUSD?: number;
  fineKHR?: number;
  issuedBy?: string;
}

export type BookBorrowRecord = BookBorrow;

export interface Assignment {
  id: string;
  title?: string;
  titleKhmer?: string;
  titleEnglish?: string;
  description: string;
  subjectId: string;
  subjectNameKhmer: string;
  classId: string;
  className: string;
  assignedByTeacherId?: string;
  assignedByTeacherName?: string;
  teacherName?: string;
  dueDate: string;
  maxScore: number;
  submissionsCount: number;
  totalStudents: number;
  status?: 'ACTIVE' | 'DRAFT' | 'CLOSED';
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentNameKhmer: string;
  studentCode: string;
  submittedAt: string;
  content: string;
  fileUrl?: string;
  score?: number;
  feedback?: string;
  status: 'SUBMITTED' | 'GRADED' | 'LATE';
}

export interface Announcement {
  id: string;
  titleKhmer: string;
  titleEnglish?: string;
  contentKhmer: string;
  contentEnglish?: string;
  target?: 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'CLASS';
  targetRoles?: string[];
  targetClass?: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
  author?: string;
  authorName?: string;
  isPinned: boolean;
}

export interface SchoolEvent {
  id: string;
  titleKhmer: string;
  titleEnglish?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  type: 'HOLIDAY' | 'EXAM' | 'MEETING' | 'SPORTS' | 'GRADUATION' | 'FESTIVAL' | 'EVENT' | 'CEREMONY' | 'ACADEMIC';
  description: string;
  location?: string;
  targetAudience?: 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'CLASS';
  targetClass?: string;
  targetGrade?: string;
  color?: string;
  isImportant?: boolean;
  academicYear?: string;
  semester?: 'SEMESTER_1' | 'SEMESTER_2' | 'ALL';
  createdBy?: string;
  createdAt?: string;
}

export interface CertificateRecord {
  id: string;
  certNumber: string;
  studentId: string;
  studentNameKhmer: string;
  studentNameEnglish: string;
  gender: Gender;
  dob: string;
  gradeLevel: string;
  academicYear: string;
  type: 'GRADUATION' | 'EXCELLENCE' | 'COMPLETION' | 'PARTICIPATION' | 'SPORTS' | 'MERIT' | 'APPRECIATION';
  titleKhmer: string;
  descriptionKhmer: string;
  issueDate: string;
  directorName: string;
  qrCodeData?: string;
  backgroundUrl?: string;
  bgOpacity?: number;
  borderStyle?: 'ORNATE_GOLD' | 'ROYAL_BLUE' | 'EMERALD' | 'PARCHMENT' | 'MINIMAL' | 'NONE';
  hideDefaultBorders?: boolean;
  customLayout?: Record<string, any>;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName: string;
  role?: string;
  userRole?: string;
  module?: string;
  resource?: string;
  action: string;
  details: string;
  ip?: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'URGENT';
  timestamp: string;
  createdAt?: string;
  isRead: boolean;
  linkTab?: string;
  userId?: string;          // Specific recipient user ID (if targeted to a specific user)
  recipientId?: string;     // Alias for recipient user ID
  targetRole?: UserRole | 'ALL' | string;   // Targeted role
  targetRoles?: (UserRole | string)[];      // Targeted roles array
  senderId?: string;        // ID of user who initiated/sent
  senderName?: string;      // Name of sender (e.g. "លោកគ្រូ ចាន់ សុខា")
  senderRole?: UserRole | string; // Role of sender
  senderAvatar?: string;    // Avatar of sender
  category?: 'ACADEMIC' | 'FINANCE' | 'ATTENDANCE' | 'LIBRARY' | 'ANNOUNCEMENT' | 'SYSTEM' | 'MESSAGE' | 'GENERAL';
  data?: Record<string, any>; // Extra payload data (studentId, invoiceId, score, etc.)
}

export interface ChatMessage {
  id: string;
  senderId: string;       // user id or 'ai-bot'
  senderName: string;
  senderRole?: string;
  senderAvatar?: string;
  recipientId: string;    // user id or 'all-school' (community) or 'ai-bot'
  recipientName?: string;
  content: string;
  timestamp: string;
  isRead?: boolean;
  type?: 'TEXT' | 'IMAGE' | 'SYSTEM';
  attachmentUrl?: string;
}

export interface WeeklyTeachingDayPlan {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thur' | 'Fri';
  topic: string;
  engage: string;
  study: string;
  activate: string;
  typing: string;
  quiz: string;
}

export interface WeeklyAttendanceDaily {
  date: string; // e.g. '8/10'
  dayName: 'Mon' | 'Tue' | 'Wed' | 'Thur' | 'Fri';
  teacher: string;
  actualStudents: number;
  attendedStudents: number;
}

export interface WeeklyReport {
  id: string;
  courseTitle: string; // e.g. 'Coding ( Scratch & Microbit )'
  enrollment: number; // e.g. 30
  className: string; // e.g. 'PC01'
  timeSlot: string; // e.g. '11:00-12:00 AM'
  weekTitle: string; // e.g. 'Teaching plan for week 3( 17/8-21/8)'
  teacherName: string; // e.g. 'Rin Sopheak'
  dailyAttendance: {
    mon: WeeklyAttendanceDaily;
    tue: WeeklyAttendanceDaily;
    wed: WeeklyAttendanceDaily;
    thur: WeeklyAttendanceDaily;
    fri: WeeklyAttendanceDaily;
  };
  notes: string[]; // 5 lines of notes
  plans: WeeklyTeachingDayPlan[];
  droppedOutCount?: number;
  academicYear?: string;
  createdAt?: string;
  updatedAt?: string;
  fridayQuizScores?: WeeklyQuizScore[];
}

export interface WeeklyQuizScore {
  id: string;
  studentId: string;
  studentCode: string;
  studentNameKhmer: string;
  studentNameEnglish: string;
  gender: 'MALE' | 'FEMALE';
  className: string;
  timeSlot?: string;
  timeStudy?: string;
  time_study?: string;
  shift?: ShiftType | string;
  weekReportId?: string;
  weekNumber: number;
  weekTitle: string;
  fridayDate: string;
  typingScore: number;
  practiceScore: number;
  writingScore: number;
  maxScorePerSubject: number;
  totalScore: number;
  averageScore: number;
  percentage: number;
  letterGrade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  gradeKhmer: string;
  rank?: number;
  remarks?: string;
  teacherName?: string;
  recordedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}
