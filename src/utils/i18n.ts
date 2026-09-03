import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, UserRole } from '../types';

export interface Translations {
  // Common UI
  appName: string;
  appSubtitle: string;
  academicYear: string;
  searchPlaceholder: string;
  searchNoResults: string;
  searchQuickJump: string;
  searchRecent: string;
  live: string;
  online: string;
  switchLanguage: string;
  khmer: string;
  english: string;
  currentLanguage: string;
  save: string;
  saved: string;
  edit: string;
  delete: string;
  cancel: string;
  confirm: string;
  close: string;
  back: string;
  create: string;
  add: string;
  update: string;
  exportCsv: string;
  exportPdf: string;
  importExcel: string;
  importBackup: string;
  exportBackup: string;
  resetData: string;
  print: string;
  refresh: string;
  clear: string;
  filter: string;
  all: string;
  actions: string;
  details: string;
  status: string;
  date: string;
  time: string;
  name: string;
  khmerName: string;
  englishName: string;
  gender: string;
  male: string;
  female: string;
  phone: string;
  email: string;
  address: string;
  role: string;
  active: string;
  inactive: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  loading: string;
  noData: string;
  viewDetails: string;
  viewProfile: string;
  logout: string;
  logoutConfirm: string;
  notifications: string;
  markAllRead: string;
  noNotifications: string;
  newNotifications: string;
  switchRoleAccount: string;
  demoRoles: string;
  sampleAccounts: string;
  allAccounts: string;
  createAccount: string;
  autoHideSidebar: string;
  collapseSidebar: string;
  expandSidebar: string;
  superAdminOnly: string;
  permissionDenied: string;

  // Roles
  roleSuperAdmin: string;
  roleSchoolAdmin: string;
  roleDirector: string;
  roleTeacher: string;
  roleStudent: string;
  roleParent: string;
  roleAccountant: string;
  roleLibrarian: string;
  roleStaff: string;

  // Nav Groups & Tabs
  navGeneral: string;
  navWorkspace: string;
  navPeople: string;
  navAcademic: string;
  navFinance: string;
  navResources: string;
  navAdministration: string;

  navDashboard: string;
  navMyProjects: string;
  navMyNotes: string;
  navMyProgress: string;
  navProfile: string;
  navSecurityTests: string;
  navStudents: string;
  navTeachers: string;
  navParents: string;
  navClasses: string;
  navAttendance: string;
  navGrades: string;
  navReportCards: string;
  navFeesFinance: string;
  navTimetable: string;
  navAssignments: string;
  navLibrary: string;
  navAnnouncements: string;
  navCertificates: string;
  navReports: string;
  navAuditLogs: string;
  navSettings: string;

  // Dashboard View
  dashboardTitle: string;
  dashboardSubtitle: string;
  totalStudents: string;
  totalTeachers: string;
  totalClasses: string;
  todayAttendance: string;
  attendanceRate: string;
  tuitionRevenue: string;
  collectedFees: string;
  remainingFees: string;
  collectionRate: string;
  operationalExpenses: string;
  quickActions: string;
  registerStudentBtn: string;
  takeAttendanceBtn: string;
  createInvoiceBtn: string;
  enterGradesBtn: string;
  newAssignmentBtn: string;
  borrowBookBtn: string;
  attendanceTrend: string;
  recentAnnouncements: string;
  upcomingEvents: string;
  recentActivities: string;
  viewAll: string;
  studentRatio: string;

  // Students View
  studentsTitle: string;
  studentsSubtitle: string;
  studentCode: string;
  studentNameKhmer: string;
  studentNameLatin: string;
  dob: string;
  pob: string;
  gradeLevel: string;
  parentName: string;
  parentPhone: string;
  studentIdCard: string;
  printIdCard: string;
  generateReportCard: string;
  registerStudentModalTitle: string;
  editStudentModalTitle: string;
  importStudentsExcel: string;
  studentFilterClass: string;
  studentFilterGender: string;
  studentFilterStatus: string;
  totalStudentsCount: string;

  // Teachers View
  teachersTitle: string;
  teachersSubtitle: string;
  teacherCode: string;
  teacherNameKhmer: string;
  teacherNameEnglish: string;
  degreeQualification: string;
  specializedSubjects: string;
  classInCharge: string;
  baseSalary: string;
  joinDate: string;
  addTeacherBtn: string;
  editTeacherTitle: string;

  // Attendance View
  attendanceTitle: string;
  attendanceSubtitle: string;
  selectDate: string;
  selectClass: string;
  markAllPresent: string;
  saveAttendanceBtn: string;
  present: string;
  absent: string;
  late: string;
  permission: string;
  attendanceSavedSuccess: string;
  attendanceStats: string;

  // Exams & Grades View
  examsGradesTitle: string;
  examsGradesSubtitle: string;
  selectExam: string;
  selectSubject: string;
  score: string;
  gradeScore: string;
  rank: string;
  result: string;
  pass: string;
  fail: string;
  excellent: string;
  good: string;
  average: string;
  gpa: string;
  saveGradesBtn: string;
  newExamBtn: string;
  gradingScale: string;

  // Fees & Finance View
  feesFinanceTitle: string;
  feesFinanceSubtitle: string;
  invoicesTab: string;
  paymentsTab: string;
  expensesTab: string;
  financialReportsTab: string;
  createInvoiceBtnTitle: string;
  recordPaymentBtnTitle: string;
  addExpenseBtnTitle: string;
  invoiceNumber: string;
  amountUsd: string;
  paidUsd: string;
  remainingUsd: string;
  dueDate: string;
  paymentMethod: string;
  receiptNumber: string;
  generateKhqr: string;
  printReceiptBtn: string;
  paid: string;
  unpaid: string;
  partial: string;
  overdue: string;

  // Library View
  libraryTitle: string;
  librarySubtitle: string;
  booksCatalogTab: string;
  borrowRecordsTab: string;
  eBooksTab: string;
  addBookBtn: string;
  issueBorrowBtn: string;
  returnBookBtn: string;
  readEBookBtn: string;
  bookTitle: string;
  author: string;
  isbn: string;
  category: string;
  availableCopies: string;
  totalCopies: string;
  borrowDate: string;
  returnDate: string;
  borrowed: string;
  returned: string;

  // Assignments View
  assignmentsTitle: string;
  assignmentsSubtitle: string;
  createAssignmentBtn: string;
  assignmentTitle: string;
  assignmentDescription: string;
  maxScore: string;
  submissionCount: string;

  // Announcements & Events View
  announcementsTitle: string;
  announcementsSubtitle: string;
  postAnnouncementBtn: string;
  addEventBtn: string;
  announcementTitle: string;
  eventDate: string;
  eventLocation: string;
  urgent: string;
  general: string;

  // Certificates View
  certificatesTitle: string;
  certificatesSubtitle: string;
  issueCertificateBtn: string;
  certificateNumber: string;
  honorTitle: string;
  issueDate: string;
  printCertificateBtn: string;

  // Reports Center View
  reportsTitle: string;
  reportsSubtitle: string;
  studentEnrollmentReport: string;
  academicPerformanceReport: string;
  financeCollectionReport: string;
  attendanceSummaryReport: string;
  generateReportBtn: string;

  // Audit Logs View
  auditLogsTitle: string;
  auditLogsSubtitle: string;
  clearAuditLogsBtn: string;
  refreshLogsBtn: string;
  logModule: string;
  logAction: string;
  logDetails: string;
  logUser: string;
  logIp: string;
  logTime: string;

  // Settings View
  settingsTitle: string;
  settingsSubtitle: string;
  schoolInfoTab: string;
  userAccountsTab: string;
  backupRestoreTab: string;
  saveSchoolInfoBtn: string;
  schoolNameKhmer: string;
  schoolNameEnglish: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolAddressKhmer: string;
  schoolAddressEnglish: string;
  schoolMotto: string;
  directorName: string;

  // Workspace
  myProjectsTitle: string;
  myProjectsSubtitle: string;
  createNewProjectBtn: string;
  runCodeBtn: string;
  myNotesTitle: string;
  myNotesSubtitle: string;
  createNewNoteBtn: string;
  myProgressTitle: string;
  myProgressSubtitle: string;
  profileTitle: string;
  profileSubtitle: string;
  securityTestsTitle: string;
  securityTestsSubtitle: string;
}

export const translations: Record<Language, Translations> = {
  km: {
    appName: 'ប្រព័ន្ធគ្រប់គ្រងសាលារៀនកម្ពុជា',
    appSubtitle: 'Cambodia Smart School Cloud System',
    academicYear: 'ឆ្នាំសិក្សា',
    searchPlaceholder: 'ស្វែងរកសិស្ស គ្រូ ថ្នាក់ មុខវិជ្ជា វិក្កយបត្រ... (Search)',
    searchNoResults: 'រកមិនឃើញទិន្នន័យដែលផ្គូផ្គងនឹងការស្វែងរកទេ',
    searchQuickJump: 'លទ្ធផលរហ័ស',
    searchRecent: 'ការស្វែងរកថ្មីៗ',
    live: 'ផ្សាយផ្ទាល់',
    online: 'អនឡាញ',
    switchLanguage: 'ប្តូរភាសា (Switch Language)',
    khmer: 'ភាសាខ្មែរ',
    english: 'English',
    currentLanguage: 'ភាសាខ្មែរ (KM)',
    save: 'រក្សាទុក',
    saved: 'បានរក្សាទុកជោគជ័យ',
    edit: 'កែប្រែ',
    delete: 'លុប',
    cancel: 'បោះបង់',
    confirm: 'យល់ព្រម / បញ្ជាក់',
    close: 'បិទ',
    back: 'ត្រឡប់ក្រោយ',
    create: 'បង្កើតថ្មី',
    add: 'បន្ថែម',
    update: 'ធ្វើបច្ចុប្បន្នភាព',
    exportCsv: 'ទាញយក CSV',
    exportPdf: 'ទាញយក PDF',
    importExcel: 'បញ្ចូលទិន្នន័យពី Excel',
    importBackup: 'បញ្ចូល Backup Database',
    exportBackup: 'ទាញយក Backup JSON',
    resetData: 'កំណត់ទិន្នន័យឡើងវិញ',
    print: 'បោះពុម្ព',
    refresh: 'ផ្ទុកឡើងវិញ',
    clear: 'សម្អាត',
    filter: 'តម្រងស្វែងរក',
    all: 'ទាំងអស់',
    actions: 'សកម្មភាព',
    details: 'ព័ត៌មានលម្អិត',
    status: 'ស្ថានភាព',
    date: 'កាលបរិច្ឆេទ',
    time: 'ម៉ោង',
    name: 'ឈ្មោះ',
    khmerName: 'ឈ្មោះជាភាសាខ្មែរ',
    englishName: 'ឈ្មោះជាអក្សរឡាតាំង/អង់គ្លេស',
    gender: 'ភេទ',
    male: 'ប្រុស',
    female: 'ស្រី',
    phone: 'លេខទូរស័ព្ទ',
    email: 'អ៊ីមែល',
    address: 'អាសយដ្ឋាន',
    role: 'តួនាទី',
    active: 'សកម្ម / កំពុងរៀន',
    inactive: 'អសកម្ម / ផ្អាក',
    success: 'ជោគជ័យ',
    error: 'មានបញ្ហា',
    warning: 'ការព្រមាន',
    info: 'ព័ត៌មាន',
    loading: 'កំពុងដំណើរការ...',
    noData: 'មិនទាន់មានទិន្នន័យនៅឡើយទេ',
    viewDetails: 'មើលលម្អិត',
    viewProfile: 'មើលគណនីផ្ទាល់ខ្លួន',
    logout: 'ចាកចេញ',
    logoutConfirm: 'តើអ្នកពិតជាចង់ចាកចេញពីប្រព័ន្ធមែនទេ?',
    notifications: 'ការជូនដំណឹង',
    markAllRead: 'សម្គាល់ថាបានអានទាំងអស់',
    noNotifications: 'គ្មានការជូនដំណឹងថ្មីទេ',
    newNotifications: 'ថ្មី',
    switchRoleAccount: 'ប្តូរតួនាទី & គណនី',
    demoRoles: 'តួនាទីសាកល្បង',
    sampleAccounts: 'គណនីគំរូ',
    allAccounts: 'គណនីទាំងអស់',
    createAccount: 'ចុះឈ្មោះគណនីថ្មី',
    autoHideSidebar: 'លាក់ផ្ទាំងចំហៀងស្វ័យប្រវត្តិ',
    collapseSidebar: 'បង្រួមផ្ទាំងចំហៀង',
    expandSidebar: 'ពង្រីកផ្ទាំងចំហៀង',
    superAdminOnly: 'សិទ្ធិកែប្រែត្រូវបានកំណត់៖ មានតែ Super Admin ប៉ុណ្ណោះដែលអាចកែប្រែបាន!',
    permissionDenied: 'អ្នកគ្មានសិទ្ធិគ្រប់គ្រាន់ក្នុងការអនុវត្តសកម្មភាពនេះទេ',

    roleSuperAdmin: 'អភិបាលជាន់ខ្ពស់ (Super Admin)',
    roleSchoolAdmin: 'អ្នកគ្រប់គ្រងសាលា (School Admin)',
    roleDirector: 'នាយកសាលា (Director)',
    roleTeacher: 'លោកគ្រូ-អ្នកគ្រូ (Teacher)',
    roleStudent: 'សិស្សានុសិស្ស (Student)',
    roleParent: 'អាណាព្យាបាល (Parent)',
    roleAccountant: 'គណនេយ្យករ (Accountant)',
    roleLibrarian: 'បណ្ណារក្ស (Librarian)',
    roleStaff: 'បុគ្គលិកទូទៅ (Staff)',

    navGeneral: 'ទូទៅ',
    navWorkspace: 'កន្លែងផ្ទាល់ខ្លួន (My Workspace)',
    navPeople: 'ការគ្រប់គ្រងបុគ្គលិក-សិស្ស',
    navAcademic: 'ការសិក្សា & ការបង្រៀន',
    navFinance: 'ហិរញ្ញវត្ថុ & ថ្លៃសិក្សា',
    navResources: 'ធនធាន & ឯកសារ',
    navAdministration: 'រដ្ឋបាល & សុវត្ថិភាព',

    navDashboard: 'ផ្ទាំងគ្រប់គ្រង',
    navMyProjects: 'គម្រោងកូដផ្ទាល់ខ្លួន',
    navMyNotes: 'កំណត់ចំណាំរបស់ខ្ញុំ',
    navMyProgress: 'វឌ្ឍនភាពសិក្សា',
    navProfile: 'គណនីផ្ទាល់ខ្លួន',
    navSecurityTests: 'តេស្តសុវត្ថិភាព (IDOR)',
    navStudents: 'គ្រប់គ្រងសិស្ស',
    navTeachers: 'គ្រប់គ្រងគ្រូ',
    navParents: 'អាណាព្យាបាល',
    navClasses: 'ថ្នាក់ & មុខវិជ្ជា',
    navAttendance: 'វត្តមានប្រចាំថ្ងៃ',
    navGrades: 'ការប្រឡង & ពិន្ទុ',
    navReportCards: 'ព្រឹត្តិបត្រពិន្ទុ',
    navFeesFinance: 'ថ្លៃសិក្សា & ចំណាយ',
    navTimetable: 'កាលវិភាគបង្រៀន',
    navAssignments: 'កិច្ចការ & កិច្ចការផ្ទះ',
    navLibrary: 'បណ្ណាល័យសាលា',
    navAnnouncements: 'សេចក្តីជូនដំណឹង',
    navCertificates: 'វិញ្ញាបនបត្រ & ប័ណ្ណសរសើរ',
    navReports: 'របាយការណ៍ & ស្ថិតិ',
    navAuditLogs: 'កំណត់ត្រាសវនកម្ម',
    navSettings: 'ការកំណត់ប្រព័ន្ធ',

    dashboardTitle: 'ផ្ទាំងគ្រប់គ្រងសាលារៀន',
    dashboardSubtitle: 'ទិដ្ឋភាពទូទៅនៃប្រតិបត្តិការសាលា សិស្ស គ្រូ វត្តមាន និងហិរញ្ញវត្ថុ',
    totalStudents: 'សិស្សសរុប',
    totalTeachers: 'គ្រូបង្រៀន',
    totalClasses: 'ថ្នាក់រៀនសរុប',
    todayAttendance: 'វត្តមានថ្ងៃនេះ',
    attendanceRate: 'អត្រាវត្តមាន',
    tuitionRevenue: 'ចំណូលថ្លៃសិក្សា',
    collectedFees: 'បានប្រមូល',
    remainingFees: 'នៅសល់',
    collectionRate: 'អត្រាប្រមូល',
    operationalExpenses: 'ចំណាយប្រតិបត្តិការ',
    quickActions: 'សកម្មភាពរហ័ស',
    registerStudentBtn: 'ចុះឈ្មោះសិស្សថ្មី',
    takeAttendanceBtn: 'កត់ត្រាវត្តមាន',
    createInvoiceBtn: 'ចេញវិក្កយបត្រ',
    enterGradesBtn: 'បញ្ចូលពិន្ទុ',
    newAssignmentBtn: 'បង្កើតកិច្ចការថ្មី',
    borrowBookBtn: 'កត់ត្រាខ្ចីសៀវភៅ',
    attendanceTrend: 'និន្នាការវត្តមានសិស្សប្រចាំខែ',
    recentAnnouncements: 'សេចក្តីជូនដំណឹងថ្មីៗ',
    upcomingEvents: 'ព្រឹត្តិការណ៍សាលាខាងមុខ',
    recentActivities: 'សកម្មភាពប្រព័ន្ធថ្មីៗ',
    viewAll: 'មើលទាំងអស់',
    studentRatio: 'សមាមាត្រភេទសិស្ស',

    studentsTitle: 'បញ្ជីឈ្មោះសិស្សានុសិស្ស',
    studentsSubtitle: 'គ្រប់គ្រងប្រវត្តិរូបសិស្ស ចុះឈ្មោះ កែប្រែព័ត៌មាន និងបោះពុម្ពប័ណ្ណសិស្ស',
    studentCode: 'អត្តលេខសិស្ស',
    studentNameKhmer: 'ឈ្មោះសិស្ស (ខ្មែរ)',
    studentNameLatin: 'ឈ្មោះសិស្ស (ឡាតាំង)',
    dob: 'ថ្ងៃខែឆ្នាំកំណើត',
    pob: 'ទីកន្លែងកំណើត',
    gradeLevel: 'កម្រិតថ្នាក់',
    parentName: 'ឈ្មោះអាណាព្យាបាល',
    parentPhone: 'លេខទូរស័ព្ទអាណាព្យាបាល',
    studentIdCard: 'ប័ណ្ណសម្គាល់ខ្លួនសិស្ស',
    printIdCard: 'បោះពុម្ពកាតសិស្ស',
    generateReportCard: 'ចេញព្រឹត្តិបត្រពិន្ទុ',
    registerStudentModalTitle: 'ចុះឈ្មោះសិស្សថ្មីចូលរៀន',
    editStudentModalTitle: 'កែប្រែព័ត៌មានសិស្ស',
    importStudentsExcel: 'បញ្ចូលទិន្នន័យសិស្សពី Excel / CSV',
    studentFilterClass: 'ថ្នាក់ទាំងអស់',
    studentFilterGender: 'ភេទទាំងអស់',
    studentFilterStatus: 'ស្ថានភាពទាំងអស់',
    totalStudentsCount: 'ចំនួនសិស្សសរុប',

    teachersTitle: 'បញ្ជីឈ្មោះលោកគ្រូ-អ្នកគ្រូ',
    teachersSubtitle: 'គ្រប់គ្រងបុគ្គលិកគរុកោសល្យ កម្រិតវប្បធម៌ មុខវិជ្ជាឯកទេស និងបន្ទុកថ្នាក់',
    teacherCode: 'កូដគ្រូ',
    teacherNameKhmer: 'ឈ្មោះគ្រូ (ខ្មែរ)',
    teacherNameEnglish: 'ឈ្មោះគ្រូ (ឡាតាំង)',
    degreeQualification: 'កម្រិតសញ្ញាបត្រ',
    specializedSubjects: 'មុខវិជ្ជាឯកទេស',
    classInCharge: 'បន្ទុកថ្នាក់',
    baseSalary: 'ប្រាក់បៀវត្សរ៍គោល',
    joinDate: 'កាលបរិច្ឆេទចូលបម្រើការងារ',
    addTeacherBtn: 'បន្ថែមលោកគ្រូ/អ្នកគ្រូថ្មី',
    editTeacherTitle: 'កែប្រែព័ត៌មានគ្រូបង្រៀន',

    attendanceTitle: 'កត់ត្រាវត្តមានសិស្សប្រចាំថ្ងៃ',
    attendanceSubtitle: 'ស្រង់វត្តមានសិស្សតាមថ្នាក់ តាមកាលបរិច្ឆេទ និងកត់ត្រាមូលហេតុច្បាប់',
    selectDate: 'ជ្រើសរើសកាលបរិច្ឆេទ',
    selectClass: 'ជ្រើសរើសថ្នាក់រៀន',
    markAllPresent: 'វត្តមានទាំងអស់ (Mark All Present)',
    saveAttendanceBtn: 'រក្សាទុកវត្តមានថ្ងៃនេះ',
    present: 'វត្តមាន',
    absent: 'អវត្តមាន',
    late: 'មកយឺត',
    permission: 'ច្បាប់អនុញ្ញាត',
    attendanceSavedSuccess: 'បានរក្សាទុកវត្តមានដោយជោគជ័យ!',
    attendanceStats: 'ស្ថិតិវត្តមាន',

    examsGradesTitle: 'ការប្រឡង & បញ្ចូលពិន្ទុសិស្ស',
    examsGradesSubtitle: 'គ្រប់គ្រងសម័យប្រឡង បញ្ចូលពិន្ទុតាមមុខវិជ្ជា និងគណនាចំណាត់ថ្នាក់ស្វ័យប្រវត្តិ',
    selectExam: 'ជ្រើសរើសសម័យប្រឡង',
    selectSubject: 'ជ្រើសរើសមុខវិជ្ជា',
    score: 'ពិន្ទុ',
    gradeScore: 'និទ្ទេស',
    rank: 'ចំណាត់ថ្នាក់',
    result: 'លទ្ធផល',
    pass: 'ជាប់',
    fail: 'ធ្លាក់',
    excellent: 'ល្អប្រសើរ (A)',
    good: 'ល្អណាស់ (B)',
    average: 'មធ្យម (C)',
    gpa: 'មធ្យមភាគ',
    saveGradesBtn: 'រក្សាទុកពិន្ទុទាំងអស់',
    newExamBtn: 'បង្កើតសម័យប្រឡងថ្មី',
    gradingScale: 'កម្រិតកំណត់និទ្ទេស',

    feesFinanceTitle: 'ថ្លៃសិក្សា & ចំណាយហិរញ្ញវត្ថុ',
    feesFinanceSubtitle: 'គ្រប់គ្រងវិក្កយបត្រ ប្រវត្តិបង់ប្រាក់ KHQR បង្កាន់ដៃ និងចំណាយប្រតិបត្តិការ',
    invoicesTab: 'វិក្កយបត្រ (Invoices)',
    paymentsTab: 'ប្រវត្តិបង់ប្រាក់ (Payments)',
    expensesTab: 'ចំណាយប្រតិបត្តិការ (Expenses)',
    financialReportsTab: 'របាយការណ៍ហិរញ្ញវត្ថុ (Reports)',
    createInvoiceBtnTitle: 'ចេញវិក្កយបត្រថ្មី',
    recordPaymentBtnTitle: 'កត់ត្រាការបង់ប្រាក់',
    addExpenseBtnTitle: 'កត់ត្រាចំណាយថ្មី',
    invoiceNumber: 'លេខវិក្កយបត្រ',
    amountUsd: 'ចំនួនទឹកប្រាក់ ($)',
    paidUsd: 'បានបង់ ($)',
    remainingUsd: 'នៅខ្វះ ($)',
    dueDate: 'ថ្ងៃផុតកំណត់',
    paymentMethod: 'វិធីសាស្ត្រទូទាត់',
    receiptNumber: 'លេខបង្កាន់ដៃ',
    generateKhqr: 'បង្កើត QR Code (KHQR)',
    printReceiptBtn: 'បោះពុម្ពបង្កាន់ដៃ',
    paid: 'បានបង់រួចរាល់',
    unpaid: 'មិនទាន់បង់',
    partial: 'បង់បានមួយផ្នែក',
    overdue: 'ហួសកាលកំណត់',

    libraryTitle: 'បណ្ណាល័យសាលា & សៀវភៅអេឡិចត្រូនិច',
    librarySubtitle: 'គ្រប់គ្រងកាតាឡុកសៀវភៅ ការខ្ចី-សង និងអានសៀវភៅ PDF អនឡាញ',
    booksCatalogTab: 'កាតាឡុកសៀវភៅ',
    borrowRecordsTab: 'កំណត់ត្រាខ្ចី-សង',
    eBooksTab: 'សៀវភៅអេឡិចត្រូនិច (E-Books)',
    addBookBtn: 'បន្ថែមសៀវភៅថ្មី',
    issueBorrowBtn: 'ចេញប័ណ្ណខ្ចីសៀវភៅ',
    returnBookBtn: 'កត់ត្រាសងសៀវភៅ',
    readEBookBtn: 'អានសៀវភៅ PDF',
    bookTitle: 'ចំណងជើងសៀវភៅ',
    author: 'អ្នកនិពន្ធ',
    isbn: 'លេខកូដ ISBN',
    category: 'ប្រភេទសៀវភៅ',
    availableCopies: 'ចំនួននៅសល់',
    totalCopies: 'ចំនួនសរុប',
    borrowDate: 'ថ្ងៃខ្ចី',
    returnDate: 'ថ្ងៃត្រូវសង',
    borrowed: 'កំពុងខ្ចី',
    returned: 'បានសងរួចរាល់',

    assignmentsTitle: 'កិច្ចការសិស្ស & កិច្ចការផ្ទះ',
    assignmentsSubtitle: 'បង្កើតកិច្ចការ តាមដានការប្រគល់ និងដាក់ពិន្ទុកិច្ចការសិស្ស',
    createAssignmentBtn: 'បង្កើតកិច្ចការថ្មី',
    assignmentTitle: 'ចំណងជើងកិច្ចការ',
    assignmentDescription: 'សេចក្តីណែនាំអំពីកិច្ចការ',
    maxScore: 'ពិន្ទុអតិបរមា',
    submissionCount: 'ចំនួនសិស្សប្រគល់កិច្ចការ',

    announcementsTitle: 'សេចក្តីជូនដំណឹង & ព្រឹត្តិការណ៍សាលា',
    announcementsSubtitle: 'ផ្សព្វផ្សាយដំណឹងផ្លូវការ កាលវិភាគព្រឹត្តិការណ៍ និងសកម្មភាពសាលា',
    postAnnouncementBtn: 'ផ្សាយដំណឹងថ្មី',
    addEventBtn: 'បន្ថែមព្រឹត្តិការណ៍',
    announcementTitle: 'ចំណងជើងដំណឹង',
    eventDate: 'កាលបរិច្ឆេទព្រឹត្តិការណ៍',
    eventLocation: 'ទីកន្លែងរៀបចំ',
    urgent: 'បន្ទាន់',
    general: 'ទូទៅ',

    certificatesTitle: 'វិញ្ញាបនបត្រ & ប័ណ្ណសរសើរ',
    certificatesSubtitle: 'បង្កើត និងបោះពុម្ពប័ណ្ណសរសើរសិស្សឆ្នើម និងវិញ្ញាបនបត្របញ្ចប់ការសិក្សា',
    issueCertificateBtn: 'ចេញវិញ្ញាបនបត្រថ្មី',
    certificateNumber: 'លេខវិញ្ញាបនបត្រ',
    honorTitle: 'គោរមងារ / ជ័យលាភី',
    issueDate: 'ថ្ងៃចេញប័ណ្ណ',
    printCertificateBtn: 'បោះពុម្ពប័ណ្ណសរសើរ',

    reportsTitle: 'មជ្ឈមណ្ឌលរបាយការណ៍ & ស្ថិតិសាលា',
    reportsSubtitle: 'ទាញយករបាយការណ៍សិស្ស គ្រូ ពិន្ទុ វត្តមាន និងហិរញ្ញវត្ថុជាទម្រង់ PDF/CSV',
    studentEnrollmentReport: 'របាយការណ៍ស្ថិតិសិស្សចុះឈ្មោះ',
    academicPerformanceReport: 'របាយការណ៍លទ្ធផលសិក្សាសិស្ស',
    financeCollectionReport: 'របាយការណ៍ប្រមូលចំណូល និងចំណាយ',
    attendanceSummaryReport: 'របាយការណ៍សង្ខេបវត្តមានប្រចាំឆមាស',
    generateReportBtn: 'បង្កើតរបាយការណ៍',

    auditLogsTitle: 'កំណត់ត្រាសវនកម្ម & សុវត្ថិភាពប្រព័ន្ធ',
    auditLogsSubtitle: 'តាមដានគ្រប់សកម្មភាពការប្រើប្រាស់ ការកែប្រែទិន្នន័យ និងសុវត្ថិភាពគណនី',
    clearAuditLogsBtn: 'សម្អាតកំណត់ត្រាទាំងអស់',
    refreshLogsBtn: 'ផ្ទុកកំណត់ត្រាឡើងវិញ',
    logModule: 'ផ្នែក / ម៉ូឌុល',
    logAction: 'សកម្មភាព',
    logDetails: 'ព័ត៌មានលម្អិតនៃសកម្មភាព',
    logUser: 'អ្នកប្រើប្រាស់',
    logIp: 'អាសយដ្ឋាន IP',
    logTime: 'ពេលវេលា',

    settingsTitle: 'ការកំណត់ប្រព័ន្ធ & ព័ត៌មានសាលា',
    settingsSubtitle: 'គ្រប់គ្រងព័ត៌មានគ្រឹះស្ថានសិក្សា គណនីអ្នកប្រើប្រាស់ និងការបម្រុងទុកទិន្នន័យ',
    schoolInfoTab: 'ព័ត៌មានសាលារៀន',
    userAccountsTab: 'គ្រប់គ្រងគណនីបុគ្គលិក',
    backupRestoreTab: 'ការបម្រុងទុក & ស្តារឡើងវិញ (Backup)',
    saveSchoolInfoBtn: 'រក្សាទុកព័ត៌មានសាលា',
    schoolNameKhmer: 'ឈ្មោះសាលា (ភាសាខ្មែរ)',
    schoolNameEnglish: 'ឈ្មោះសាលា (អង់គ្លេស)',
    schoolPhone: 'លេខទូរស័ព្ទសាលា',
    schoolEmail: 'អ៊ីមែលសាលា',
    schoolAddressKhmer: 'អាសយដ្ឋាន (ភាសាខ្មែរ)',
    schoolAddressEnglish: 'អាសយដ្ឋាន (អង់គ្លេស)',
    schoolMotto: 'បាវចនាសាលា',
    directorName: 'ឈ្មោះនាយកសាលា',

    myProjectsTitle: 'គម្រោងកូដផ្ទាល់ខ្លួន (My Projects)',
    myProjectsSubtitle: 'កន្លែងសរសេរកូដ និងសាកល្បង HTML, CSS, JavaScript, Python',
    createNewProjectBtn: 'បង្កើតគម្រោងថ្មី',
    runCodeBtn: 'ដំណើរការកូដ (Run)',
    myNotesTitle: 'កំណត់ចំណាំផ្ទាល់ខ្លួន (My Notes)',
    myNotesSubtitle: 'កត់ត្រាមេរៀន ភារកិច្ច និងឯកសារផ្ទាល់ខ្លួន',
    createNewNoteBtn: 'បង្កើតកំណត់ចំណាំថ្មី',
    myProgressTitle: 'វឌ្ឍនភាពសិក្សាផ្ទាល់ខ្លួន (My Progress)',
    myProgressSubtitle: 'តាមដានពិន្ទុ វត្តមាន និងការវិវត្តនៃការសិក្សារបស់អ្នក',
    profileTitle: 'គណនីផ្ទាល់ខ្លួន (User Profile)',
    profileSubtitle: 'ព័ត៌មានគណនី សិទ្ធិប្រើប្រាស់ និងការផ្លាស់ប្តូរលេខសម្ងាត់',
    securityTestsTitle: 'តេស្តសុវត្ថិភាពប្រព័ន្ធ (IDOR & Access Control)',
    securityTestsSubtitle: 'ផ្ទៀងផ្ទាត់សុវត្ថិភាពការបែងចែកទិន្នន័យរវាងគណនីផ្សេងៗ'
  },
  en: {
    appName: 'Cambodia Smart School Cloud System',
    appSubtitle: 'MoEYS-Aligned Digital Campus Platform',
    academicYear: 'Academic Year',
    searchPlaceholder: 'Search students, teachers, classes, subjects, invoices... (Press ⌘K)',
    searchNoResults: 'No records found matching your search',
    searchQuickJump: 'Quick Results',
    searchRecent: 'Recent Searches',
    live: 'LIVE',
    online: 'Online',
    switchLanguage: 'Switch Language (ប្តូរភាសា)',
    khmer: 'ភាសាខ្មែរ (Khmer)',
    english: 'English (EN)',
    currentLanguage: 'English (EN)',
    save: 'Save Changes',
    saved: 'Saved Successfully',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    confirm: 'Confirm / Agree',
    close: 'Close',
    back: 'Go Back',
    create: 'Create New',
    add: 'Add New',
    update: 'Update',
    exportCsv: 'Export CSV',
    exportPdf: 'Export PDF',
    importExcel: 'Import Excel / CSV',
    importBackup: 'Import Database Backup',
    exportBackup: 'Export Backup JSON',
    resetData: 'Reset Demo Data',
    print: 'Print',
    refresh: 'Refresh',
    clear: 'Clear',
    filter: 'Filter',
    all: 'All',
    actions: 'Actions',
    details: 'Details',
    status: 'Status',
    date: 'Date',
    time: 'Time',
    name: 'Name',
    khmerName: 'Khmer Name',
    englishName: 'Latin / English Name',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    phone: 'Phone Number',
    email: 'Email Address',
    address: 'Address',
    role: 'Role',
    active: 'Active / Enrolled',
    inactive: 'Inactive / Suspended',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    loading: 'Loading...',
    noData: 'No records available yet',
    viewDetails: 'View Details',
    viewProfile: 'View Profile',
    logout: 'Log Out',
    logoutConfirm: 'Are you sure you want to log out of the system?',
    notifications: 'Notifications',
    markAllRead: 'Mark All as Read',
    noNotifications: 'No new notifications',
    newNotifications: 'new',
    switchRoleAccount: 'Switch Role & Account',
    demoRoles: 'Demo Roles',
    sampleAccounts: 'Sample Accounts',
    allAccounts: 'All Accounts',
    createAccount: 'Sign Up / Create Account',
    autoHideSidebar: 'Auto-Hide Sidebar',
    collapseSidebar: 'Collapse Sidebar',
    expandSidebar: 'Expand Sidebar',
    superAdminOnly: 'Permission restricted: Only Super Admin can modify this information!',
    permissionDenied: 'You do not have sufficient permissions to perform this action',

    roleSuperAdmin: 'Super Administrator',
    roleSchoolAdmin: 'School Administrator',
    roleDirector: 'School Director / Principal',
    roleTeacher: 'Teacher / Instructor',
    roleStudent: 'Student',
    roleParent: 'Parent / Guardian',
    roleAccountant: 'Accountant / Finance Officer',
    roleLibrarian: 'Librarian',
    roleStaff: 'General Staff',

    navGeneral: 'General',
    navWorkspace: 'My Workspace',
    navPeople: 'People Management',
    navAcademic: 'Academic & Teaching',
    navFinance: 'Finance & Tuition',
    navResources: 'Resources & Library',
    navAdministration: 'Administration & Security',

    navDashboard: 'Dashboard',
    navMyProjects: 'My Code Projects',
    navMyNotes: 'My Notes',
    navMyProgress: 'My Academic Progress',
    navProfile: 'My Profile',
    navSecurityTests: 'Security & IDOR Tests',
    navStudents: 'Students Directory',
    navTeachers: 'Teachers Directory',
    navParents: 'Parents Directory',
    navClasses: 'Classes & Subjects',
    navAttendance: 'Daily Attendance',
    navGrades: 'Exams & Grades',
    navReportCards: 'Report Cards',
    navFeesFinance: 'Fees & Finance',
    navTimetable: 'Teaching Timetable',
    navAssignments: 'Assignments & Homework',
    navLibrary: 'School Library',
    navAnnouncements: 'Announcements',
    navCertificates: 'Certificates of Honor',
    navReports: 'Reports & Analytics',
    navAuditLogs: 'Audit Logs',
    navSettings: 'System Settings',

    dashboardTitle: 'School Management Dashboard',
    dashboardSubtitle: 'Comprehensive overview of school operations, students, teachers, attendance, and finances',
    totalStudents: 'Total Students',
    totalTeachers: 'Faculty & Teachers',
    totalClasses: 'Total Classes',
    todayAttendance: "Today's Attendance",
    attendanceRate: 'Attendance Rate',
    tuitionRevenue: 'Tuition Revenue',
    collectedFees: 'Collected',
    remainingFees: 'Remaining',
    collectionRate: 'Collection Rate',
    operationalExpenses: 'Operational Expenses',
    quickActions: 'Quick Actions',
    registerStudentBtn: 'Register Student',
    takeAttendanceBtn: 'Take Attendance',
    createInvoiceBtn: 'Create Invoice',
    enterGradesBtn: 'Enter Grades',
    newAssignmentBtn: 'New Assignment',
    borrowBookBtn: 'Borrow Book',
    attendanceTrend: 'Monthly Attendance Trend',
    recentAnnouncements: 'Recent Announcements',
    upcomingEvents: 'Upcoming School Events',
    recentActivities: 'Recent System Activities',
    viewAll: 'View All',
    studentRatio: 'Student Gender Ratio',

    studentsTitle: 'Student Directory',
    studentsSubtitle: 'Manage student enrollment records, profiles, contacts, and generate student ID cards',
    studentCode: 'Student ID Code',
    studentNameKhmer: 'Student Name (Khmer)',
    studentNameLatin: 'Student Name (Latin)',
    dob: 'Date of Birth',
    pob: 'Place of Birth',
    gradeLevel: 'Grade Level',
    parentName: 'Parent / Guardian Name',
    parentPhone: 'Parent Phone Number',
    studentIdCard: 'Student Identity Card',
    printIdCard: 'Print Student ID Card',
    generateReportCard: 'Generate Report Card',
    registerStudentModalTitle: 'Register New Student Enrollment',
    editStudentModalTitle: 'Edit Student Information',
    importStudentsExcel: 'Import Students from Excel / CSV',
    studentFilterClass: 'All Classes',
    studentFilterGender: 'All Genders',
    studentFilterStatus: 'All Statuses',
    totalStudentsCount: 'Total Students Enrolled',

    teachersTitle: 'Faculty & Teachers Directory',
    teachersSubtitle: 'Manage academic faculty, academic degrees, specialized disciplines, and class assignments',
    teacherCode: 'Teacher Code',
    teacherNameKhmer: 'Teacher Name (Khmer)',
    teacherNameEnglish: 'Teacher Name (English)',
    degreeQualification: 'Degree & Qualifications',
    specializedSubjects: 'Specialized Subjects',
    classInCharge: 'Class Assigned',
    baseSalary: 'Base Monthly Salary',
    joinDate: 'Employment Date',
    addTeacherBtn: 'Add New Teacher',
    editTeacherTitle: 'Edit Teacher Profile',

    attendanceTitle: 'Daily Attendance Tracking',
    attendanceSubtitle: 'Take roll call by classroom and date, record permission slips and track absence reasons',
    selectDate: 'Select Date',
    selectClass: 'Select Classroom',
    markAllPresent: 'Mark All Present',
    saveAttendanceBtn: 'Save Today\'s Attendance',
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    permission: 'Permission',
    attendanceSavedSuccess: 'Attendance records saved successfully!',
    attendanceStats: 'Attendance Statistics',

    examsGradesTitle: 'Exams & Grade Entry',
    examsGradesSubtitle: 'Manage examination periods, input subject scorecards, and compute automatic student rankings',
    selectExam: 'Select Examination',
    selectSubject: 'Select Subject',
    score: 'Score',
    gradeScore: 'Grade Letter',
    rank: 'Rank',
    result: 'Result',
    pass: 'Passed',
    fail: 'Failed',
    excellent: 'Excellent (A)',
    good: 'Very Good (B)',
    average: 'Average (C)',
    gpa: 'Grade Point Average',
    saveGradesBtn: 'Save All Score Records',
    newExamBtn: 'Create New Examination',
    gradingScale: 'Grading Scale & Criteria',

    feesFinanceTitle: 'Tuition Fees & Financial Operations',
    feesFinanceSubtitle: 'Manage student invoices, payment transactions, KHQR codes, receipts, and operational expenses',
    invoicesTab: 'Invoices',
    paymentsTab: 'Payment History',
    expensesTab: 'Operating Expenses',
    financialReportsTab: 'Financial Reports',
    createInvoiceBtnTitle: 'Generate New Invoice',
    recordPaymentBtnTitle: 'Record Payment',
    addExpenseBtnTitle: 'Record New Expense',
    invoiceNumber: 'Invoice Number',
    amountUsd: 'Amount ($USD)',
    paidUsd: 'Paid ($USD)',
    remainingUsd: 'Remaining ($USD)',
    dueDate: 'Payment Due Date',
    paymentMethod: 'Payment Method',
    receiptNumber: 'Official Receipt Number',
    generateKhqr: 'Generate KHQR Code',
    printReceiptBtn: 'Print Official Receipt',
    paid: 'Paid in Full',
    unpaid: 'Unpaid',
    partial: 'Partial Payment',
    overdue: 'Overdue',

    libraryTitle: 'School Library & Digital E-Books',
    librarySubtitle: 'Manage book inventory, circulation lending records, and online digital reading material',
    booksCatalogTab: 'Book Catalog',
    borrowRecordsTab: 'Lending & Return Records',
    eBooksTab: 'Digital E-Books & Reader',
    addBookBtn: 'Add New Book',
    issueBorrowBtn: 'Issue Book Loan',
    returnBookBtn: 'Process Book Return',
    readEBookBtn: 'Open PDF Reader',
    bookTitle: 'Book Title',
    author: 'Author',
    isbn: 'ISBN Code',
    category: 'Book Category',
    availableCopies: 'Available In-Stock',
    totalCopies: 'Total Inventory',
    borrowDate: 'Borrowed Date',
    returnDate: 'Due Date',
    borrowed: 'Currently Borrowed',
    returned: 'Returned',

    assignmentsTitle: 'Assignments & Homework',
    assignmentsSubtitle: 'Create class coursework, track student submissions, and review academic assignments',
    createAssignmentBtn: 'Create New Assignment',
    assignmentTitle: 'Assignment Title',
    assignmentDescription: 'Instructions & Objectives',
    maxScore: 'Maximum Score',
    submissionCount: 'Submissions Received',

    announcementsTitle: 'School Announcements & Events',
    announcementsSubtitle: 'Publish institutional notices, academic calendars, and school-wide events',
    postAnnouncementBtn: 'Post Announcement',
    addEventBtn: 'Add School Event',
    announcementTitle: 'Announcement Title',
    eventDate: 'Event Date & Schedule',
    eventLocation: 'Event Venue / Location',
    urgent: 'Urgent Notice',
    general: 'General Notice',

    certificatesTitle: 'Certificates & Honor Rolls',
    certificatesSubtitle: 'Generate and print student honor roll awards and official completion certificates',
    issueCertificateBtn: 'Issue Certificate',
    certificateNumber: 'Certificate Number',
    honorTitle: 'Award / Honor Title',
    issueDate: 'Issue Date',
    printCertificateBtn: 'Print Official Certificate',

    reportsTitle: 'Reports & Analytics Center',
    reportsSubtitle: 'Generate and export student enrollment, academic performance, and financial audit reports in PDF/CSV',
    studentEnrollmentReport: 'Student Enrollment & Demographics Report',
    academicPerformanceReport: 'Academic Performance & Grade Distribution',
    financeCollectionReport: 'Fee Collection & Operating Expenses Report',
    attendanceSummaryReport: 'Semester Attendance Summary Report',
    generateReportBtn: 'Generate Analytical Report',

    auditLogsTitle: 'Audit Logs & Security Monitoring',
    auditLogsSubtitle: 'Track system user activities, data modifications, timestamps, and network access integrity',
    clearAuditLogsBtn: 'Clear Audit Logs',
    refreshLogsBtn: 'Refresh Log Feed',
    logModule: 'System Module',
    logAction: 'Action Performed',
    logDetails: 'Detailed Activity Record',
    logUser: 'User Account',
    logIp: 'IP Address',
    logTime: 'Timestamp',

    settingsTitle: 'System Settings & School Profile',
    settingsSubtitle: 'Configure school institutional identity, user account roles, and database backups',
    schoolInfoTab: 'Institutional Profile',
    userAccountsTab: 'Staff & User Accounts',
    backupRestoreTab: 'Database Backup & Restore',
    saveSchoolInfoBtn: 'Save School Profile',
    schoolNameKhmer: 'School Name (Khmer)',
    schoolNameEnglish: 'School Name (English)',
    schoolPhone: 'Official Phone Number',
    schoolEmail: 'Official Email Address',
    schoolAddressKhmer: 'Campus Address (Khmer)',
    schoolAddressEnglish: 'Campus Address (English)',
    schoolMotto: 'School Vision & Motto',
    directorName: 'School Director / Principal Name',

    myProjectsTitle: 'My Code Projects',
    myProjectsSubtitle: 'Personal developer sandbox to write and run HTML, CSS, JavaScript, and Python code',
    createNewProjectBtn: 'Create Project',
    runCodeBtn: 'Run Code',
    myNotesTitle: 'My Personal Notes',
    myNotesSubtitle: 'Manage personal study notes, lecture reminders, and private study items',
    createNewNoteBtn: 'Create New Note',
    myProgressTitle: 'My Academic Progress',
    myProgressSubtitle: 'Track your personal grades, attendance consistency, and subject performance',
    profileTitle: 'My User Profile',
    profileSubtitle: 'View account credentials, assigned role permissions, and update your password',
    securityTestsTitle: 'Security & Access Control (IDOR)',
    securityTestsSubtitle: 'Verify authorization boundaries and workspace resource isolation across accounts'
  }
};

// Helper function to get localized strings
export const getTranslation = (lang?: Language | string): Translations => {
  if (lang === 'en') return translations.en;
  return translations.km;
};

// React Context for Global Language
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  getStudentName: (student: { nameKhmer?: string; nameLatin?: string } | null | undefined) => string;
  getTeacherName: (teacher: { nameKhmer?: string; nameEnglish?: string } | null | undefined) => string;
  getSubjectName: (subject: { nameKhmer?: string; nameEnglish?: string } | null | undefined) => string;
  getSchoolName: (school: { nameKhmer?: string; nameEnglish?: string } | null | undefined) => string;
  getRoleLabel: (role: UserRole | string) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'km',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: translations.km,
  getStudentName: () => '',
  getTeacherName: () => '',
  getSubjectName: () => '',
  getSchoolName: () => '',
  getRoleLabel: () => ''
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{
  language: Language;
  onLanguageChange: (lang: Language) => void;
  children: React.ReactNode;
}> = ({ language, onLanguageChange, children }) => {
  const t = getTranslation(language);

  const toggleLanguage = () => {
    const nextLang: Language = language === 'km' ? 'en' : 'km';
    onLanguageChange(nextLang);
  };

  const getStudentName = (student: { nameKhmer?: string; nameLatin?: string } | null | undefined): string => {
    if (!student) return '';
    if (language === 'km') {
      return student.nameKhmer || student.nameLatin || '';
    }
    return student.nameLatin || student.nameKhmer || '';
  };

  const getTeacherName = (teacher: { nameKhmer?: string; nameEnglish?: string } | null | undefined): string => {
    if (!teacher) return '';
    if (language === 'km') {
      return teacher.nameKhmer || teacher.nameEnglish || '';
    }
    return teacher.nameEnglish || teacher.nameKhmer || '';
  };

  const getSubjectName = (subject: { nameKhmer?: string; nameEnglish?: string } | null | undefined): string => {
    if (!subject) return '';
    if (language === 'km') {
      return subject.nameKhmer || subject.nameEnglish || '';
    }
    return subject.nameEnglish || subject.nameKhmer || '';
  };

  const getSchoolName = (school: { nameKhmer?: string; nameEnglish?: string } | null | undefined): string => {
    if (!school) return '';
    if (language === 'km') {
      return school.nameKhmer || school.nameEnglish || '';
    }
    return school.nameEnglish || school.nameKhmer || '';
  };

  const getRoleLabel = (role: UserRole | string): string => {
    switch (role) {
      case 'SUPER_ADMIN': return t.roleSuperAdmin;
      case 'SCHOOL_ADMIN': return t.roleSchoolAdmin;
      case 'DIRECTOR': return t.roleDirector;
      case 'TEACHER': return t.roleTeacher;
      case 'STUDENT': return t.roleStudent;
      case 'PARENT': return t.roleParent;
      case 'ACCOUNTANT': return t.roleAccountant;
      case 'LIBRARIAN': return t.roleLibrarian;
      case 'STAFF': return t.roleStaff;
      case 'ADMIN': return t.roleSchoolAdmin;
      default: return role;
    }
  };

  return React.createElement(
    LanguageContext.Provider,
    {
      value: {
        language,
        setLanguage: onLanguageChange,
        toggleLanguage,
        t,
        getStudentName,
        getTeacherName,
        getSubjectName,
        getSchoolName,
        getRoleLabel
      }
    },
    children
  );
};
