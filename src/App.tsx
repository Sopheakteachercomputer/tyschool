import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  User,
  NavTab, 
  Student, 
  Teacher, 
  Parent, 
  ClassRoom, 
  Subject, 
  GradeRecord, 
  AttendanceRecord, 
  Exam,
  FeeInvoice, 
  PaymentRecord, 
  ExpenseRecord, 
  TimetableSlot, 
  Assignment, 
  Book, 
  BookBorrowRecord, 
  Announcement, 
  SchoolEvent, 
  CertificateRecord, 
  SchoolProfile, 
  AuditLog,
  NotificationItem,
  WeeklyReport,
  WeeklyQuizScore
} from './types';
import { StorageService, storageService } from './services/storageService';
import { FirebaseAuthService } from './services/firebase';
import { useFirebaseAuthPersistence } from './hooks/useFirebaseAuthPersistence';
import { LanguageProvider } from './utils/i18n';
import { Language } from './types';

// Layout components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// User-Owned & Auth Views
import { AuthView } from './components/AuthView';
import { MyProjectsView } from './components/MyProjectsView';
import { MyNotesView } from './components/MyNotesView';
import { MyProgressView } from './components/MyProgressView';
import { ProfileView } from './components/ProfileView';
import { SecurityTestsView } from './components/SecurityTestsView';
import { GeminiAiStudioView } from './components/GeminiAiStudioView';

// View modules
import { DashboardView } from './components/DashboardView';
import { WeeklyReportView } from './components/WeeklyReportView';
import { StudentsView } from './components/StudentsView';
import { TeachersView } from './components/TeachersView';
import { ParentsView } from './components/ParentsView';
import { ClassesSubjectsView } from './components/ClassesSubjectsView';
import { AttendanceView } from './components/AttendanceView';
import { ClassCleaningView } from './components/ClassCleaningView';
import { ExamsGradesView } from './components/ExamsGradesView';
import { ReportCardsView } from './components/ReportCardsView';
import { FeesFinanceView } from './components/FeesFinanceView';
import { TimetableView } from './components/TimetableView';
import { AssignmentsView } from './components/AssignmentsView';
import { LibraryView } from './components/LibraryView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { AcademicCalendarView } from './components/AcademicCalendarView';
import { NotificationsView } from './components/NotificationsView';
import { CertificatesView } from './components/CertificatesView';
import { ReportsCenterView } from './components/ReportsCenterView';
import { AuditLogsView } from './components/AuditLogsView';
import { SettingsView } from './components/SettingsView';

// Modals
import { ReceiptModal } from './components/ReceiptModal';
import { CertificateModal } from './components/CertificateModal';
import { ReportCardModal } from './components/ReportCardModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { SignUpUserModal } from './components/SignUpUserModal';
import { EditUserModal } from './components/EditUserModal';
import { SendNotificationModal } from './components/SendNotificationModal';
import { NotificationDetailModal } from './components/NotificationDetailModal';
import { ToastNotification } from './components/ToastNotification';

export default function App() {
  // Session & Authentication State (Strict Auth Gate)
  const [authSession, setAuthSession] = useState<any>(() => StorageService.getCurrentSession());

  // Hook for Firebase Auth State Persistence & browserLocalPersistence management
  const {
    firebaseUser,
    isAuthInitializing,
    isPersistenceReady
  } = useFirebaseAuthPersistence();

  // App Navigation & Role State
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const session = StorageService.getCurrentSession();
    return session?.user || storageService.getCurrentUser();
  });
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const session = StorageService.getCurrentSession();
    return session?.user?.role || storageService.getCurrentUser()?.role || 'STUDENT';
  });
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [selectedEditUser, setSelectedEditUser] = useState<User | null>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isSendNotifModalOpen, setIsSendNotifModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('app_language') as Language) || 'km';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('app_sidebar_collapsed') === 'true';
  });
  const [autoHideSidebar, setAutoHideSidebar] = useState(() => {
    return localStorage.getItem('app_sidebar_autohide') === 'true';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem('app_language', newLang);
  };

  const handleToggleAutoHide = () => {
    setAutoHideSidebar(prev => {
      const next = !prev;
      localStorage.setItem('app_sidebar_autohide', String(next));
      return next;
    });
  };

  const handleToggleCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('app_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Sync auth state
  const handleLoginSuccess = (sessionOrUser: any) => {
    const rawUser = sessionOrUser?.user || (sessionOrUser?.role ? sessionOrUser : null);
    const activeSession = sessionOrUser?.token 
      ? sessionOrUser 
      : (StorageService.getCurrentSession() || {
          token: `sess_${rawUser?.id || 'usr'}_${Date.now()}`,
          userId: rawUser?.id || 'USR-001',
          user: rawUser,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString()
        });

    const activeUser: User = rawUser || activeSession?.user || storageService.getCurrentUser() || users[0];
    
    if (activeUser) {
      storageService.setCurrentUser(activeUser);
    }
    
    setAuthSession(activeSession);
    setCurrentUser(activeUser);
    setCurrentRole(activeUser?.role || 'SUPER_ADMIN');
    setUsers(storageService.getUsers());
  };

  const handleLogout = async () => {
    try {
      await FirebaseAuthService.signOutFromFirebase();
    } catch (e) {
      console.warn('Firebase logout notice:', e);
    }
    StorageService.logout();
    setAuthSession(null);
    setActiveTab('dashboard');
  };

  // Core Data State
  const [school, setSchool] = useState<SchoolProfile>(() => storageService.getSchoolProfile());
  const [students, setStudents] = useState<Student[]>(() => storageService.getStudents());
  const [teachers, setTeachers] = useState<Teacher[]>(() => storageService.getTeachers());
  const [parents, setParents] = useState<Parent[]>(() => storageService.getParents());
  const [classes, setClasses] = useState<ClassRoom[]>(() => storageService.getClasses());
  const [subjects, setSubjects] = useState<Subject[]>(() => storageService.getSubjects());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => storageService.getAttendance());
  const [grades, setGrades] = useState<GradeRecord[]>(() => storageService.getGrades());
  const [exams, setExams] = useState<Exam[]>(() => storageService.getExams());
  const [invoices, setInvoices] = useState<FeeInvoice[]>(() => storageService.getInvoices());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => storageService.getPayments());
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => storageService.getExpenses());
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => storageService.getTimetable());
  const [assignments, setAssignments] = useState<Assignment[]>(() => storageService.getAssignments());
  const [books, setBooks] = useState<Book[]>(() => storageService.getBooks());
  const [borrows, setBorrows] = useState<BookBorrowRecord[]>(() => storageService.getBorrows());
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => storageService.getAnnouncements());
  const [events, setEvents] = useState<SchoolEvent[]>(() => storageService.getEvents());
  const [certificates, setCertificates] = useState<CertificateRecord[]>(() => storageService.getCertificates());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storageService.getAuditLogs());
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>(() => storageService.getWeeklyReports());
  const [quizScores, setQuizScores] = useState<WeeklyQuizScore[]>(() => storageService.getWeeklyQuizScores());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const initialUser = StorageService.getCurrentSession()?.user || storageService.getCurrentUser();
    return storageService.getNotifications(initialUser?.id, initialUser?.role);
  });

  // Listen to Firebase Auth state and handle session restoration across page refreshes
  useEffect(() => {
    if (isAuthInitializing) return;

    if (firebaseUser && firebaseUser.email) {
      const cleanEmail = firebaseUser.email.toLowerCase().trim();
      const storedUsers = StorageService.getUsers();
      let matched = storedUsers.find(u => u.email && u.email.toLowerCase() === cleanEmail);

      // If user signed in with Firebase but not yet in local users list, auto-create/sync profile
      if (!matched) {
        const baseUsername = cleanEmail.split('@')[0].replace(/[^a-z0-9_.]/g, '');
        let uniqueUsername = baseUsername;
        let counter = 1;
        while (storedUsers.some(u => u.username && u.username.toLowerCase() === uniqueUsername.toLowerCase())) {
          uniqueUsername = `${baseUsername}${counter++}`;
        }
        const assignedRole: UserRole = cleanEmail === 'sopheakctepangkor@gmail.com' ? 'SUPER_ADMIN' : 'STUDENT';
        const newUser: User = {
          id: `USR-${firebaseUser.uid.slice(0, 8)}`,
          username: uniqueUsername,
          email: cleanEmail,
          password: 'FirebaseProtected@' + firebaseUser.uid.slice(0, 6),
          nameKhmer: firebaseUser.displayName || 'អ្នកប្រើប្រាស់ Firebase',
          nameEnglish: firebaseUser.displayName || 'Firebase User',
          role: assignedRole,
          phone: firebaseUser.phoneNumber || '012 345 678',
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${uniqueUsername}`,
          schoolId: 'SCH-KH-001',
          status: 'ACTIVE',
          lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
        StorageService.saveUser(newUser);
        matched = newUser;
        setUsers(StorageService.getUsers());
      }

      // If no active session or current session doesn't match Firebase user, restore session seamlessly
      if (!authSession || currentUser?.email?.toLowerCase() !== cleanEmail) {
        handleLoginSuccess({ user: matched });
      }
    }
  }, [firebaseUser, isAuthInitializing]);

  // Sync notifications whenever active user changes
  useEffect(() => {
    if (currentUser) {
      setNotifications(storageService.getNotifications(currentUser.id, currentUser.role));
    }
  }, [currentUser?.id, currentUser?.role]);

  // Sync students and attendance when background/child events occur
  useEffect(() => {
    const handleStudentsUpdated = () => {
      setStudents(storageService.getStudents());
      setAttendance(storageService.getAttendance());
    };
    window.addEventListener('students-updated', handleStudentsUpdated);
    window.addEventListener('attendance-updated', handleStudentsUpdated);
    return () => {
      window.removeEventListener('students-updated', handleStudentsUpdated);
      window.removeEventListener('attendance-updated', handleStudentsUpdated);
    };
  }, []);

  // Modal Triggers
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentRecord | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateRecord | null>(null);
  const [selectedReportCardStudent, setSelectedReportCardStudent] = useState<Student | null>(null);
  const [selectedDetailStudent, setSelectedDetailStudent] = useState<Student | null>(null);
  const [selectedDetailNotification, setSelectedDetailNotification] = useState<NotificationItem | null>(null);
  const [activeToastNotification, setActiveToastNotification] = useState<NotificationItem | null>(null);
  const [replyTargetNotification, setReplyTargetNotification] = useState<NotificationItem | null>(null);

  // Notification Actions
  const handleSendNotification = (notif: Partial<NotificationItem>) => {
    const created = storageService.addNotification(notif);
    setNotifications(storageService.getNotifications(currentUser?.id, currentUser?.role));
    setActiveToastNotification(created);
    logAction('CREATE', 'Notifications', `ផ្ញើការជូនដំណឹង: ${notif.title || ''}`);
  };

  const handleMarkNotificationRead = (id: string) => {
    storageService.markNotificationAsRead(id);
    setNotifications(storageService.getNotifications(currentUser?.id, currentUser?.role));
  };

  const handleMarkAllNotificationsRead = () => {
    storageService.markAllNotificationsRead(currentUser?.id, currentUser?.role);
    setNotifications(storageService.getNotifications(currentUser?.id, currentUser?.role));
  };

  const handleClearAllNotifications = () => {
    storageService.clearAllNotifications(currentUser?.id, currentUser?.role);
    setNotifications(storageService.getNotifications(currentUser?.id, currentUser?.role));
    logAction('DELETE', 'Notifications', 'បានសម្អាតការជូនដំណឹងទាំងអស់');
  };

  const handleDeleteNotification = (id: string) => {
    storageService.deleteNotification(id);
    setNotifications(storageService.getNotifications(currentUser?.id, currentUser?.role));
    logAction('DELETE', 'Notifications', `លុបការជូនដំណឹង ID: ${id}`);
  };

  const handleSelectNotification = (notif: NotificationItem) => {
    setSelectedDetailNotification(notif);
    handleMarkNotificationRead(notif.id);
  };

  const handleOpenReplyNotification = (notif: NotificationItem) => {
    setSelectedDetailNotification(null);
    setReplyTargetNotification(notif);
    setIsSendNotifModalOpen(true);
  };

  const handleRestoreNotificationSamples = () => {
    const fresh = storageService.resetNotificationsToDefault();
    setNotifications(fresh);
    logAction('UPDATE', 'Notifications', 'បានផ្ទុកការជូនដំណឹងគំរូឡើងវិញ');
  };

  // Audit Log Helper
  const logAction = (action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT' | string, resource: string, details: string) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser?.id || 'USR-ADMIN',
      userName: currentUser?.nameKhmer || 'អ្នកគ្រប់គ្រង',
      userRole: currentUser?.role || currentRole || 'SUPER_ADMIN',
      role: currentUser?.role || currentRole || 'SUPER_ADMIN',
      action,
      resource,
      module: resource,
      details,
      timestamp: formattedDate,
      ipAddress: '192.168.1.102',
      ip: '192.168.1.102'
    };
    storageService.addAuditLog(newLog);
    setAuditLogs(storageService.getAuditLogs());
  };

  const handleClearAuditLogs = () => {
    storageService.clearAuditLogs();
    setAuditLogs([]);
  };

  const handleRefreshAuditLogs = () => {
    setAuditLogs(storageService.getAuditLogs());
  };

  // Student Handlers
  const handleSaveStudent = (student: Student) => {
    const isNew = !students.some(s => s.id === student.id);
    storageService.saveStudent(student);
    setStudents(storageService.getStudents());
    logAction(isNew ? 'CREATE' : 'UPDATE', 'Students', `${isNew ? 'ចុះឈ្មោះសិស្សថ្មី' : 'កែប្រែព័ត៌មានសិស្ស'}: ${student.nameKhmer} (${student.studentCode})`);
  };

  const handleSaveStudentsBatch = (importedList: Student[], mode: 'APPEND' | 'REPLACE' = 'APPEND') => {
    storageService.saveStudentsBatch(importedList, mode);
    setStudents(storageService.getStudents());
    logAction('CREATE', 'Students', `នាំចូលសិស្សចំនួន ${importedList.length} នាក់ពី Excel`);
  };

  const handleDeleteStudent = (id: string) => {
    const target = students.find(s => s.id === id);
    storageService.deleteStudent(id);
    setStudents(storageService.getStudents());
    logAction('DELETE', 'Students', `លុបសិស្ស: ${target?.nameKhmer || id}`);
  };

  const handleRemoveAllStudents = () => {
    storageService.removeAllStudents();
    setStudents([]);
    logAction('DELETE', 'Students', 'បានលុបទិន្នន័យសិស្សទាំងអស់');
  };

  // Teacher Handlers
  const handleSaveTeacher = (teacher: Teacher) => {
    const isNew = !teachers.some(t => t.id === teacher.id);
    storageService.saveTeacher(teacher);
    setTeachers(storageService.getTeachers());
    logAction(isNew ? 'CREATE' : 'UPDATE', 'Teachers', `${isNew ? 'បញ្ចូលគ្រូបង្រៀនថ្មី' : 'កែប្រែគ្រូបង្រៀន'}: ${teacher.nameKhmer}`);
  };

  const handleDeleteTeacher = (id: string) => {
    const target = teachers.find(t => t.id === id);
    storageService.deleteTeacher(id);
    setTeachers(storageService.getTeachers());
    logAction('DELETE', 'Teachers', `លុបគ្រូបង្រៀន: ${target?.nameKhmer || id}`);
  };

  // Parent Handlers
  const handleSaveParent = (parent: Parent) => {
    storageService.saveParent(parent);
    setParents(storageService.getParents());
    logAction('UPDATE', 'Parents', `កែប្រែព័ត៌មានអាណាព្យាបាល: ${parent.nameKhmer}`);
  };

  // Class & Subject Handlers
  const handleSaveClass = (cls: ClassRoom) => {
    storageService.saveClass(cls);
    setClasses(storageService.getClasses());
    logAction('CREATE', 'Classes', `បង្កើត/កែប្រែថ្នាក់រៀន: ${cls.name}`);
  };

  const handleDeleteClass = (id: string) => {
    storageService.deleteClass(id);
    setClasses(storageService.getClasses());
    logAction('DELETE', 'Classes', `លុបថ្នាក់រៀន ID: ${id}`);
  };

  const handleSaveSubject = (subject: Subject) => {
    storageService.saveSubject(subject);
    setSubjects(storageService.getSubjects());
    logAction('CREATE', 'Subjects', `បញ្ចូលមុខវិជ្ជា: ${subject.nameKhmer}`);
  };

  const handleDeleteSubject = (id: string) => {
    storageService.deleteSubject(id);
    setSubjects(storageService.getSubjects());
    logAction('DELETE', 'Subjects', `លុបមុខវិជ្ជា ID: ${id}`);
  };

  const handleSaveQuizScores = (records: WeeklyQuizScore[]) => {
    storageService.saveWeeklyQuizScoresBatch(records);
    setQuizScores(storageService.getWeeklyQuizScores());
    logAction('CREATE', 'Classes & Subjects', `កត់ត្រា/កែប្រែពិន្ទុតេស្តប្រចាំសប្តាហ៍ Typing, Writing, Practice (${records.length} នាក់)`);
  };

  // Attendance Handlers
  const handleSaveAttendance = (records: AttendanceRecord[]) => {
    storageService.saveAttendanceBatch(records);
    setAttendance(storageService.getAttendance());
    logAction('CREATE', 'Attendance', `កត់ត្រាវត្តមានសិស្ស ${records.length} នាក់`);

    storageService.addNotification({
      title: 'វត្តមានថ្ងៃនេះត្រូវបានកត់ត្រា',
      message: `វត្តមានសិស្សចំនួន ${records.length} នាក់ត្រូវបានបញ្ចូលក្នុងប្រព័ន្ធដោយ ${currentUser?.nameKhmer || 'លោកគ្រូ-អ្នកគ្រូ'}។`,
      type: 'SUCCESS',
      senderId: currentUser?.id,
      senderName: currentUser?.nameKhmer || 'លោកគ្រូ-អ្នកគ្រូ',
      senderRole: currentUser?.role || 'TEACHER',
      senderAvatar: currentUser?.avatar,
      targetRoles: ['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'PARENT'],
      linkTab: 'attendance',
      category: 'ATTENDANCE'
    });
    setNotifications(storageService.getNotifications(currentUser?.id, currentUser?.role));
  };

  // Grades Handlers
  const handleSaveGrades = (records: GradeRecord[]) => {
    storageService.saveGradesBatch(records);
    setGrades(storageService.getGrades());
    logAction('CREATE', 'Grades', `បញ្ចូលពិន្ទុសិស្ស ${records.length} កំណត់ត្រា`);

    storageService.addNotification({
      title: 'ពិន្ទុសិស្សត្រូវបានបញ្ចូលថ្មី',
      message: `ពិន្ទុសរុប ${records.length} កំណត់ត្រាត្រូវបានកត់ត្រាដោយ ${currentUser?.nameKhmer || 'គ្រូបង្រៀន'}។`,
      type: 'SUCCESS',
      senderId: currentUser?.id,
      senderName: currentUser?.nameKhmer,
      senderRole: currentUser?.role || 'TEACHER',
      senderAvatar: currentUser?.avatar,
      targetRoles: ['SUPER_ADMIN', 'ADMIN', 'PARENT', 'STUDENT'],
      linkTab: 'grades',
      category: 'ACADEMIC'
    });
    setNotifications(storageService.getNotifications(currentUser?.id, currentUser?.role));
  };

  // Finance Handlers
  const handleSaveInvoice = (invoice: FeeInvoice) => {
    storageService.saveInvoice(invoice);
    setInvoices(storageService.getInvoices());
    logAction('CREATE', 'Finance', `ចេញវិក្កយបត្រថ្មី ${invoice.invoiceNumber} ជូនសិស្ស ${invoice.studentNameKhmer}`);
  };

  const handleDeleteInvoice = (id: string) => {
    storageService.deleteInvoice(id);
    setInvoices(storageService.getInvoices());
    logAction('DELETE', 'Finance', `លុបវិក្កយបត្រ ID: ${id}`);
  };

  const handleRecordPayment = (payment: PaymentRecord, updatedInvoice: FeeInvoice) => {
    storageService.savePayment(payment);
    storageService.saveInvoice(updatedInvoice);
    setPayments(storageService.getPayments());
    setInvoices(storageService.getInvoices());
    logAction('CREATE', 'Finance', `ទទួលប្រាក់ ${payment.receiptNumber} ចំនួន $${payment.amountUSD} ពីសិស្ស ${payment.studentNameKhmer}`);

    storageService.addNotification({
      title: `ការបង់ប្រាក់បានជោគជ័យ ${payment.receiptNumber}`,
      message: `ទទួលបានប្រាក់ថ្លៃសិក្សា $${payment.amountUSD} ពីសិស្ស ${payment.studentNameKhmer}។`,
      type: 'SUCCESS',
      senderId: currentUser?.id,
      senderName: currentUser?.nameKhmer,
      senderRole: currentUser?.role || 'ACCOUNTANT',
      senderAvatar: currentUser?.avatar,
      targetRoles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'PARENT'],
      linkTab: 'fees_finance',
      category: 'FINANCE'
    });
    setNotifications(storageService.getNotifications(currentUser?.id, currentUser?.role));
  };

  const handleSaveExpense = (expense: ExpenseRecord) => {
    storageService.saveExpense(expense);
    setExpenses(storageService.getExpenses());
    logAction('CREATE', 'Finance', `កត់ត្រាចំណាយសាលា ${expense.expenseNumber} ចំនួន $${expense.amountUSD}`);
  };

  const handleDeleteExpense = (id: string) => {
    storageService.deleteExpense(id);
    setExpenses(storageService.getExpenses());
    logAction('DELETE', 'Finance', `លុបចំណាយ ID: ${id}`);
  };

  // Timetable
  const handleSaveTimetableSlot = (slot: TimetableSlot) => {
    storageService.saveTimetableSlot(slot);
    setTimetable(storageService.getTimetable());
    logAction('CREATE', 'Timetable', `បន្ថែម/កែប្រែកាលវិភាគ: ${slot.subjectNameKhmer}`);
  };

  const handleDeleteTimetableSlot = (id: string) => {
    storageService.deleteTimetableSlot(id);
    setTimetable(storageService.getTimetable());
    logAction('DELETE', 'Timetable', `លុបម៉ោងសិក្សា ID: ${id}`);
  };

  // Assignments
  const handleSaveAssignment = (assignment: Assignment) => {
    storageService.saveAssignment(assignment);
    setAssignments(storageService.getAssignments());
    logAction('CREATE', 'Assignments', `ដាក់កិច្ចការថ្មី: ${assignment.titleKhmer}`);

    storageService.addNotification({
      title: `កិច្ចការថ្មី៖ ${assignment.titleKhmer}`,
      message: `មុខវិជ្ជា ${assignment.subjectNameKhmer} (ថ្នាក់ ${assignment.className}) ផុតកំណត់ថ្ងៃ ${assignment.dueDate}។`,
      type: 'INFO',
      senderId: currentUser?.id,
      senderName: currentUser?.nameKhmer,
      senderRole: currentUser?.role || 'TEACHER',
      senderAvatar: currentUser?.avatar,
      targetRoles: ['STUDENT', 'PARENT'],
      linkTab: 'assignments',
      category: 'ACADEMIC'
    });
    setNotifications(storageService.getNotifications(currentUser?.id, currentUser?.role));
  };

  const handleDeleteAssignment = (id: string) => {
    storageService.deleteAssignment(id);
    setAssignments(storageService.getAssignments());
    logAction('DELETE', 'Assignments', `លុបកិច្ចការ ID: ${id}`);
  };

  // Library
  const handleSaveBook = (book: Book) => {
    storageService.saveBook(book);
    setBooks(storageService.getBooks());
    logAction('CREATE', 'Library', `បញ្ចូលសៀវភៅថ្មី: ${book.titleKhmer}`);
  };

  const handleDeleteBook = (id: string) => {
    storageService.deleteBook(id);
    setBooks(storageService.getBooks());
    logAction('DELETE', 'Library', `លុបសៀវភៅ ID: ${id}`);
  };

  const handleIssueBorrow = (record: BookBorrowRecord, updatedBook: Book) => {
    storageService.saveBorrow(record);
    storageService.saveBook(updatedBook);
    setBorrows(storageService.getBorrows());
    setBooks(storageService.getBooks());
    logAction('CREATE', 'Library', `អនុញ្ញាតឱ្យសិស្ស ${record.studentNameKhmer} ខ្ចីសៀវភៅ ${record.bookTitleKhmer}`);

    storageService.addNotification({
      title: `ការខ្ចីសៀវភៅបណ្ណាល័យ`,
      message: `សិស្ស ${record.studentNameKhmer} បានខ្ចីសៀវភៅ "${record.bookTitleKhmer}" (សងត្រឹម ${record.dueDate})។`,
      type: 'INFO',
      senderId: currentUser?.id,
      senderName: currentUser?.nameKhmer,
      senderRole: currentUser?.role || 'LIBRARIAN',
      senderAvatar: currentUser?.avatar,
      targetRoles: ['SUPER_ADMIN', 'LIBRARIAN'],
      linkTab: 'library',
      category: 'LIBRARY'
    });
    setNotifications(storageService.getNotifications(currentUser?.id, currentUser?.role));
  };

  const handleReturnBook = (borrowId: string, bookOrId?: Book | string) => {
    const borrow = borrows.find(b => b.id === borrowId);
    if (!borrow) return;
    
    const targetBookId = typeof bookOrId === 'string' ? bookOrId : (bookOrId?.id || borrow.bookId);
    const book = books.find(b => b.id === targetBookId);
    if (!book) return;

    const updatedBorrow: BookBorrowRecord = {
      ...borrow,
      status: 'RETURNED',
      returnDate: new Date().toISOString().split('T')[0]
    };

    const currentAvail = book.availableCopies ?? book.availableQty ?? 0;
    const currentTotal = book.totalCopies ?? book.totalQty ?? 1;

    const updatedBook: Book = {
      ...book,
      availableCopies: Math.min(currentTotal, currentAvail + 1),
      availableQty: Math.min(currentTotal, currentAvail + 1),
      status: 'AVAILABLE'
    };

    storageService.saveBorrow(updatedBorrow);
    storageService.saveBook(updatedBook);
    setBorrows(storageService.getBorrows());
    setBooks(storageService.getBooks());
    logAction('UPDATE', 'Library', `សិស្ស ${borrow.studentNameKhmer} បានប្រគល់សៀវភៅ ${borrow.bookTitleKhmer} ចូលបណ្ណាល័យវិញ`);
  };

  const handleDeleteBorrow = (id: string) => {
    storageService.deleteBorrow(id);
    setBorrows(storageService.getBorrows());
    logAction('DELETE', 'Library', `លុបកំណត់ត្រាខ្ចី ID: ${id}`);
  };

  // Announcements & Events
  const handleSaveAnnouncement = (ann: Announcement) => {
    storageService.saveAnnouncement(ann);
    setAnnouncements(storageService.getAnnouncements());
    logAction('CREATE', 'Announcements', `ចេញផ្សាយដំណឹង: ${ann.titleKhmer}`);

    storageService.addNotification({
      title: `ដំណឹងថ្មី៖ ${ann.titleKhmer}`,
      message: ann.contentKhmer.slice(0, 80) + '...',
      type: (ann.priority as string) === 'URGENT' ? 'URGENT' : ann.priority === 'HIGH' ? 'WARNING' : 'INFO',
      senderId: currentUser?.id,
      senderName: currentUser?.nameKhmer,
      senderRole: currentUser?.role || 'ADMIN',
      senderAvatar: currentUser?.avatar,
      targetRole: 'ALL',
      linkTab: 'announcements',
      category: 'ANNOUNCEMENT'
    });
    setNotifications(storageService.getNotifications(currentUser?.id, currentUser?.role));
  };

  const handleDeleteAnnouncement = (id: string) => {
    storageService.deleteAnnouncement(id);
    setAnnouncements(storageService.getAnnouncements());
    logAction('DELETE', 'Announcements', `លុបដំណឹង ID: ${id}`);
  };

  const handleSaveEvent = (ev: SchoolEvent) => {
    storageService.saveEvent(ev);
    setEvents(storageService.getEvents());
    logAction('CREATE', 'Events', `បន្ថែមព្រឹត្តិការណ៍: ${ev.titleKhmer}`);
  };

  const handleSaveEventsBatch = (newEvents: SchoolEvent[]) => {
    storageService.saveEventsBatch(newEvents);
    setEvents(storageService.getEvents());
    logAction('CREATE', 'Events', `បញ្ចូលព្រឹត្តិការណ៍ជាក្រុមចំនួន ${newEvents.length}`);
  };

  const handleDeleteEvent = (id: string) => {
    storageService.deleteEvent(id);
    setEvents(storageService.getEvents());
    logAction('DELETE', 'Events', `លុបព្រឹត្តិការណ៍ ID: ${id}`);
  };

  // Certificates
  const handleSaveCertificate = (cert: CertificateRecord) => {
    storageService.saveCertificate(cert);
    setCertificates(storageService.getCertificates());
    logAction('CREATE', 'Certificates', `ចេញប័ណ្ណសរសើរ ${cert.certNumber} ជូន ${cert.studentNameKhmer}`);
  };

  // Settings
  const handleSaveSchool = (profile: SchoolProfile) => {
    storageService.saveSchoolProfile(profile);
    setSchool(profile);
    logAction('UPDATE', 'Settings', `កែប្រែព័ត៌មានទូទៅនៃសាលា`);
  };

  // Weekly Reports
  const handleSaveWeeklyReport = (report: WeeklyReport) => {
    storageService.saveWeeklyReport(report);
    setWeeklyReports(storageService.getWeeklyReports());
    logAction('UPDATE', 'WeeklyReport', `បានរក្សាទុករបាយការណ៍បង្រៀនប្រចាំសប្តាហ៍: ${report.courseTitle} (${report.className})`);
  };

  const handleDeleteWeeklyReport = (id: string) => {
    storageService.deleteWeeklyReport(id);
    setWeeklyReports(storageService.getWeeklyReports());
    logAction('DELETE', 'WeeklyReport', `បានលុបរបាយការណ៍បង្រៀនប្រចាំសប្តាហ៍ ID: ${id}`);
  };

  const handleResetData = () => {
    if (window.confirm('តើអ្នកពិតជាចង់កំណត់ទិន្នន័យគំរូដើមឡើងវិញមែនទេ? (Reset Demo Data)')) {
      storageService.resetToDemo();
      window.location.reload();
    }
  };

  // Quick Open Modal Helpers
  const handleOpenPrintReceipt = (payment: PaymentRecord) => {
    setSelectedReceiptPayment(payment);
  };

  const handleOpenCertificateModal = (certOrStudent: CertificateRecord | Student) => {
    if ('certNumber' in certOrStudent) {
      setSelectedCertificate(certOrStudent);
    } else {
      // Create ad-hoc cert for student
      const adHocCert: CertificateRecord = {
        id: `CERT-ADHOC-${Date.now()}`,
        certNumber: `SIS-CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        studentId: certOrStudent.id,
        studentNameKhmer: certOrStudent.nameKhmer,
        studentNameEnglish: certOrStudent.nameEnglish,
        gender: certOrStudent.gender,
        dob: certOrStudent.dob,
        gradeLevel: certOrStudent.className,
        academicYear: school.academicYear,
        type: 'MERIT',
        titleKhmer: 'ប័ណ្ណសរសើរ សិស្សពូកែប្រចាំឆ្នាំ',
        descriptionKhmer: 'បានខិតខំប្រឹងប្រែងរៀនសូត្រ គោរពវិន័យបានល្អប្រសើរ និងទទួលបានលទ្ធផលឆ្នើមប្រចាំឆ្នាំសិក្សា ២០២៥-២០២៦។',
        issueDate: new Date().toISOString().split('T')[0],
        directorName: school.directorName
      };
      setSelectedCertificate(adHocCert);
    }
  };

  const handleOpenReportCardModal = (student: Student) => {
    setSelectedReportCardStudent(student);
  };

  const handleOpenStudentDetailModal = (student: Student) => {
    setSelectedDetailStudent(student);
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    const matchedUser = users.find(u => u.role === role);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      storageService.setCurrentUser(matchedUser);
    } else {
      const fallbackUser: User = {
        ...currentUser,
        role: role,
        nameKhmer: role === 'SUPER_ADMIN' ? 'ឯកឧត្តមបណ្ឌិត ស៊ន វណ្ណារ៉ា' : role === 'STUDENT' ? 'ចាន់ ពិសិដ្ឋ' : role === 'TEACHER' ? 'សេង សុភា' : 'លោក សុខ វិបុល',
        nameEnglish: role === 'SUPER_ADMIN' ? 'H.E. Dr. Sorn Vannara' : role === 'STUDENT' ? 'Chan Piseth' : role === 'TEACHER' ? 'Seng Sopheak' : 'Mr. Sok Vibol',
      };
      setCurrentUser(fallbackUser);
      storageService.setCurrentUser(fallbackUser);
    }
  };

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    storageService.setCurrentUser(user);
    logAction('LOGIN', 'User Auth', `ចូលប្រើគណនី: ${user.nameKhmer} (${user.role})`);
  };

  const handleCreateUser = (newUser: User, autoLogin: boolean) => {
    storageService.saveUser(newUser);
    const updatedUsers = storageService.getUsers();
    setUsers(updatedUsers);
    logAction('CREATE', 'Users', `បានចុះឈ្មោះគណនីថ្មី: ${newUser.nameKhmer} (${newUser.role})`);
    
    if (autoLogin) {
      handleSelectUser(newUser);
    }
  };

  const handleOpenEditUser = (user: User) => {
    setSelectedEditUser(user);
    setIsEditUserModalOpen(true);
  };

  const handleSaveEditedUser = (updatedUser: User) => {
    storageService.saveUser(updatedUser);
    const updatedUsers = storageService.getUsers();
    setUsers(updatedUsers);

    // If updated user is current active user, sync currentUser & currentRole
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      setCurrentRole(updatedUser.role);
      storageService.setCurrentUser(updatedUser);
    }

    // Refresh teachers and students in case their avatar or name was synced
    setTeachers(storageService.getTeachers());
    setStudents(storageService.getStudents());

    logAction('UPDATE', 'Users', `បានកែប្រែព័ត៌មានគណនី: ${updatedUser.nameKhmer} (${updatedUser.role})`);
  };

  const handleDeleteUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    storageService.deleteUser(userId);
    const updatedUsers = storageService.getUsers();
    setUsers(updatedUsers);
    logAction('DELETE', 'Users', `បានលុបគណនី: ${target?.nameKhmer || userId}`);
  };

  const handleRemoveAllUsers = (keepSuperAdmin: boolean = true) => {
    const remaining = storageService.removeAllUsers(keepSuperAdmin, currentUser?.id);
    setUsers(remaining);
    if (remaining.length > 0) {
      const active = remaining.find(u => u.id === currentUser?.id) || remaining[0];
      setCurrentUser(active);
      setCurrentRole(active.role);
      storageService.setCurrentUser(active);
    }
    logAction('DELETE', 'Users', `បានលុបគណនីអ្នកប្រើប្រាស់ទាំងអស់ (${keepSuperAdmin ? 'រក្សាទុក Super Admin' : 'លុបទាំងអស់'})`);
  };

  // Initial session restoration check during page refresh
  if (!authSession && isAuthInitializing) {
    return (
      <div className="min-h-screen bg-[#0f172a] bg-frosted-canvas text-slate-100 flex items-center justify-center font-battambang p-4">
        <div className="flex flex-col items-center space-y-4 p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-xl max-w-sm w-full text-center animate-in fade-in duration-300">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 animate-ping" />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20">
              <span className="text-2xl font-black text-white">TY</span>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">កំពុងផ្ទៀងផ្ទាត់សម័យសុវត្ថិភាព...</h3>
            <p className="text-[11px] text-slate-400 font-mono">Restoring Firebase Auth Session...</p>
          </div>
          <div className="w-44 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-500 rounded-full animate-pulse w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Auth Gate: If no active session, display only Login & Sign Up screen
  if (!authSession) {
    return (
      <LanguageProvider language={language} onLanguageChange={handleLanguageChange}>
        <AuthView
          school={school}
          onLoginSuccess={handleLoginSuccess}
          onAuthSuccess={handleLoginSuccess}
        />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider language={language} onLanguageChange={handleLanguageChange}>
      <div className="min-h-screen bg-[#0f172a] bg-frosted-canvas text-slate-100 flex flex-col font-kantumruy antialiased selection:bg-indigo-500/30 selection:text-white">
        
        {/* Top Frosted Glass Navigation Bar */}
        <Navbar
          currentUser={currentUser}
          users={users}
          school={school}
          language={language}
          onLanguageChange={handleLanguageChange}
          onRoleChange={handleRoleChange}
          onSelectUser={handleSelectUser}
          onEditUser={handleOpenEditUser}
          onOpenSignUpModal={() => setIsSignUpModalOpen(true)}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onClearAllNotifications={handleClearAllNotifications}
          onDeleteNotification={handleDeleteNotification}
          onSelectNotification={handleSelectNotification}
          onOpenSendNotification={() => {
            setReplyTargetNotification(null);
            setIsSendNotifModalOpen(true);
          }}
          onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
          activeTab={activeTab}
          onLogout={handleLogout}
          searchTerm={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleSidebar={handleToggleCollapse}
          isSidebarCollapsed={sidebarCollapsed}
          autoHideSidebar={autoHideSidebar}
          onToggleAutoHide={handleToggleAutoHide}
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        />

        {/* Main App Layout */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Frosted Glass Sidebar with Auto-Hide and Mobile Drawer */}
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab as NavTab);
              setMobileMenuOpen(false);
            }}
            userRole={currentRole}
            language={language}
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
            autoHide={autoHideSidebar}
            onToggleAutoHide={handleToggleAutoHide}
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
            onLogout={handleLogout}
            badgeCounts={{
              unpaidFees: invoices.filter(i => i.status !== 'PAID').length,
              pendingBorrows: borrows.filter(b => b.status === 'BORROWED').length,
              pendingAssignments: assignments.length,
              unreadNotifications: notifications.filter(n => !n.isRead).length
            }}
          />

          {/* Content View Container */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              
              {/* View Switcher */}
              {activeTab === 'dashboard' && (
                <DashboardView
                  students={students}
                  teachers={teachers}
                  classes={classes}
                  invoices={invoices}
                  attendance={attendance}
                  grades={grades}
                  subjects={subjects}
                  exams={exams}
                  announcements={announcements}
                  events={events}
                  onSaveEvent={handleSaveEvent}
                  notifications={notifications}
                  onSelectNotification={handleSelectNotification}
                  onOpenSendNotification={() => {
                    setReplyTargetNotification(null);
                    setIsSendNotifModalOpen(true);
                  }}
                  onRestoreSamples={handleRestoreNotificationSamples}
                  weeklyReports={weeklyReports}
                  school={school}
                  language={language}
                  userRole={currentRole}
                  onNavigate={(tab) => setActiveTab(tab as NavTab)}
                  onOpenReportCardModal={handleOpenReportCardModal}
                />
              )}

              {/* Dedicated Notifications View */}
              {activeTab === 'notifications' && (
                <NotificationsView
                  notifications={notifications}
                  currentUser={currentUser}
                  language={language}
                  onSelectNotification={handleSelectNotification}
                  onMarkAsRead={handleMarkNotificationRead}
                  onMarkAllAsRead={handleMarkAllNotificationsRead}
                  onClearAll={handleClearAllNotifications}
                  onDeleteNotification={handleDeleteNotification}
                  onOpenSendNotification={() => {
                    setReplyTargetNotification(null);
                    setIsSendNotifModalOpen(true);
                  }}
                  onOpenReply={handleOpenReplyNotification}
                  onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
                  onRestoreSamples={handleRestoreNotificationSamples}
                />
              )}

              {/* General Weekly Report View */}
              {activeTab === 'weekly_report' && (
                <WeeklyReportView
                  reports={weeklyReports}
                  school={school}
                  currentUser={currentUser}
                  userRole={currentRole}
                  language={language}
                  onSaveReport={handleSaveWeeklyReport}
                  onDeleteReport={handleDeleteWeeklyReport}
                  onNavigate={(tab) => setActiveTab(tab as NavTab)}
                />
              )}

            {/* User-Owned & Isolated Workspaces */}
            {activeTab === 'my_projects' && (
              <MyProjectsView
                currentUser={currentUser}
              />
            )}

            {activeTab === 'my_notes' && (
              <MyNotesView
                currentUser={currentUser}
              />
            )}

            {activeTab === 'my_progress' && (
              <MyProgressView
                currentUser={currentUser}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                currentUser={currentUser}
                onUpdateUser={handleSaveEditedUser}
              />
            )}

            {activeTab === 'security_tests' && (
              <SecurityTestsView />
            )}

            {activeTab === 'ai_studio' && (
              <GeminiAiStudioView
                currentUser={currentUser}
                language={language}
              />
            )}

            {activeTab === 'students' && (
              <StudentsView
                students={students}
                classes={classes}
                school={school}
                onSaveSchool={handleSaveSchool}
                onSaveStudent={handleSaveStudent}
                onSaveStudentsBatch={handleSaveStudentsBatch}
                onDeleteStudent={handleDeleteStudent}
                onRemoveAllStudents={handleRemoveAllStudents}
                onOpenStudentModal={handleOpenStudentDetailModal}
                onOpenReportCard={handleOpenReportCardModal}
                searchTerm={searchQuery}
                userRole={currentRole}
                users={users}
              />
            )}

            {activeTab === 'teachers' && (
              <TeachersView
                teachers={teachers}
                classes={classes}
                subjects={subjects}
                school={school}
                onSaveTeacher={handleSaveTeacher}
                onDeleteTeacher={handleDeleteTeacher}
                searchTerm={searchQuery}
                userRole={currentRole}
              />
            )}

            {activeTab === 'parents' && (
              <ParentsView
                parents={parents}
                students={students}
                onSaveParent={handleSaveParent}
                searchTerm={searchQuery}
              />
            )}

            {(activeTab === 'classes' || (activeTab as string) === 'classes_subjects' || (activeTab as string) === 'weekly_quiz') && (
              <ClassesSubjectsView
                classes={classes}
                subjects={subjects}
                teachers={teachers}
                students={students}
                timetable={timetable}
                quizScores={quizScores}
                weeklyReports={weeklyReports}
                school={school}
                currentUser={currentUser}
                language={language}
                onSaveClass={handleSaveClass}
                onDeleteClass={handleDeleteClass}
                onSaveSubject={handleSaveSubject}
                onDeleteSubject={handleDeleteSubject}
                onSaveTimetableSlot={handleSaveTimetableSlot}
                onDeleteTimetableSlot={handleDeleteTimetableSlot}
                onSaveQuizScores={handleSaveQuizScores}
                userRole={currentRole}
                searchTerm={searchQuery}
                initialSubTab={(activeTab as string) === 'weekly_quiz' ? 'WEEKLY_QUIZ' : undefined}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceView
                students={students}
                classes={classes}
                attendanceRecords={attendance}
                onSaveAttendanceBatch={handleSaveAttendance}
                onSaveAttendance={handleSaveAttendance}
                userRole={currentRole}
              />
            )}

            {activeTab === 'cleaning_groups' && (
              <ClassCleaningView
                students={students}
                classes={classes}
                school={school}
                currentUser={currentUser}
                userRole={currentRole}
                onSendNotification={handleSendNotification}
                searchTerm={searchQuery}
              />
            )}

            {activeTab === 'grades' && (
              <ExamsGradesView
                students={students}
                classes={classes}
                subjects={subjects}
                exams={exams}
                gradeRecords={grades}
                school={school}
                onSaveGrades={handleSaveGrades}
                onOpenReportCardModal={handleOpenReportCardModal}
                userRole={currentRole}
              />
            )}

            {activeTab === 'report_cards' && (
              <ReportCardsView
                students={students}
                classes={classes}
                subjects={subjects}
                gradeRecords={grades}
                attendanceRecords={attendance}
                school={school}
                onOpenReportCardModal={handleOpenReportCardModal}
                onOpenCertificateModal={handleOpenCertificateModal}
              />
            )}

            {activeTab === 'fees_finance' && (
              <FeesFinanceView
                invoices={invoices}
                payments={payments}
                expenses={expenses}
                students={students}
                school={school}
                onSaveSchool={handleSaveSchool}
                onSaveInvoice={handleSaveInvoice}
                onDeleteInvoice={handleDeleteInvoice}
                onRecordPayment={handleRecordPayment}
                onSaveExpense={handleSaveExpense}
                onDeleteExpense={handleDeleteExpense}
                onPrintReceipt={handleOpenPrintReceipt}
                searchTerm={searchQuery}
                userRole={currentRole}
              />
            )}

            {activeTab === 'timetable' && (
              <TimetableView
                slots={timetable}
                classes={classes}
                subjects={subjects}
                teachers={teachers}
                school={school}
                onSaveSlot={handleSaveTimetableSlot}
              />
            )}

            {activeTab === 'assignments' && (
              <AssignmentsView
                assignments={assignments}
                classes={classes}
                subjects={subjects}
                teachers={teachers}
                onSaveAssignment={handleSaveAssignment}
                onDeleteAssignment={handleDeleteAssignment}
                searchTerm={searchQuery}
                userRole={currentRole}
              />
            )}

            {activeTab === 'library' && (
              <LibraryView
                books={books}
                borrows={borrows}
                students={students}
                onSaveBook={handleSaveBook}
                onDeleteBook={handleDeleteBook}
                onIssueBorrow={handleIssueBorrow}
                onReturnBook={handleReturnBook}
                onDeleteBorrow={handleDeleteBorrow}
                searchTerm={searchQuery}
                userRole={currentRole}
              />
            )}

            {activeTab === 'announcements' && (
              <AnnouncementsView
                announcements={announcements}
                events={events}
                onSaveAnnouncement={handleSaveAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                onSaveEvent={handleSaveEvent}
                onDeleteEvent={handleDeleteEvent}
                userRole={currentRole}
              />
            )}

            {(activeTab === 'academic_calendar' || activeTab === 'events') && (
              <AcademicCalendarView
                events={events}
                onSaveEvent={handleSaveEvent}
                onDeleteEvent={handleDeleteEvent}
                onSaveEventsBatch={handleSaveEventsBatch}
                userRole={currentRole}
                language={language}
                classes={classes}
              />
            )}

            {activeTab === 'certificates' && (
              <CertificatesView
                certificates={certificates}
                students={students}
                school={school}
                onSaveSchool={handleSaveSchool}
                onSaveCertificate={handleSaveCertificate}
                onOpenCertificateModal={handleOpenCertificateModal}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsCenterView
                students={students}
                teachers={teachers}
                grades={grades}
                invoices={invoices}
                attendance={attendance}
                school={school}
              />
            )}

            {activeTab === 'audit_logs' && (
              <AuditLogsView
                logs={auditLogs}
                searchTerm={searchQuery}
                onClearLogs={handleClearAuditLogs}
                onRefreshLogs={handleRefreshAuditLogs}
                userRole={currentRole}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                school={school}
                currentUser={currentUser}
                onSaveSchool={handleSaveSchool}
                onResetData={handleResetData}
                users={users}
                onOpenSignUpModal={() => setIsSignUpModalOpen(true)}
                onSelectUser={handleSelectUser}
                onEditUser={handleOpenEditUser}
                onDeleteUser={handleDeleteUser}
                onRemoveAllUsers={handleRemoveAllUsers}
                onClearLogs={handleClearAuditLogs}
              />
            )}

          </div>
        </main>

      </div>

      {/* Global Modals */}

      {/* 1. Official KHQR Receipt Modal */}
      {selectedReceiptPayment && (
        <ReceiptModal
          payment={selectedReceiptPayment}
          school={school}
          onClose={() => setSelectedReceiptPayment(null)}
        />
      )}

      {/* 2. Ornate Certificate of Honor Modal */}
      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          school={school}
          onSaveSchool={handleSaveSchool}
          onSaveCertificate={handleSaveCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}

      {/* 3. MoEYS-Compliant Student Report Card Modal */}
      {selectedReportCardStudent && (
        <ReportCardModal
          student={selectedReportCardStudent}
          school={school}
          subjects={subjects}
          grades={grades.filter(g => g.studentId === selectedReportCardStudent.id)}
          attendance={attendance.filter(a => a.studentId === selectedReportCardStudent.id)}
          onClose={() => setSelectedReportCardStudent(null)}
        />
      )}

      {/* 4. Student Detail Profile & ID Card Modal */}
      {selectedDetailStudent && (
        <StudentDetailModal
          student={selectedDetailStudent}
          school={school}
          onSaveSchool={handleSaveSchool}
          grades={grades.filter(g => g.studentId === selectedDetailStudent.id)}
          invoices={invoices.filter(i => i.studentId === selectedDetailStudent.id)}
          attendance={attendance.filter(a => a.studentId === selectedDetailStudent.id)}
          onClose={() => setSelectedDetailStudent(null)}
          onOpenReportCard={(st) => {
            setSelectedDetailStudent(null);
            setSelectedReportCardStudent(st);
          }}
          userRole={currentRole}
        />
      )}

      {/* 5. User Signup & Account Creation Modal */}
      <SignUpUserModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        onUserCreated={handleCreateUser}
      />

      {/* 6. Super Admin & User Profile Edit Modal */}
      {isEditUserModalOpen && selectedEditUser && (
        <EditUserModal
          isOpen={isEditUserModalOpen}
          user={selectedEditUser}
          currentUser={currentUser}
          onClose={() => {
            setIsEditUserModalOpen(false);
            setSelectedEditUser(null);
          }}
          onSaveUser={handleSaveEditedUser}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {/* 7. Send Direct User Notification Modal */}
      <SendNotificationModal
        isOpen={isSendNotifModalOpen}
        onClose={() => {
          setIsSendNotifModalOpen(false);
          setReplyTargetNotification(null);
        }}
        currentUser={currentUser}
        users={users}
        onSendNotification={handleSendNotification}
        replyTargetNotification={replyTargetNotification}
      />

      {/* 8. Notification Full Detail Modal */}
      {selectedDetailNotification && (
        <NotificationDetailModal
          notification={selectedDetailNotification}
          currentUser={currentUser}
          onClose={() => setSelectedDetailNotification(null)}
          onMarkAsRead={handleMarkNotificationRead}
          onDelete={handleDeleteNotification}
          onNavigateTab={(tab) => {
            setSelectedDetailNotification(null);
            setActiveTab(tab as NavTab);
          }}
          onOpenReply={handleOpenReplyNotification}
        />
      )}

      {/* 9. Live Real-Time Toast Notification Banner with Audio Chime */}
      <ToastNotification
        notification={activeToastNotification}
        onDismiss={() => setActiveToastNotification(null)}
        onViewNotification={(notif) => {
          handleSelectNotification(notif);
        }}
      />

    </div>
  </LanguageProvider>
  );
}
