import { 
  SchoolProfile, 
  User, 
  Student, 
  Parent, 
  Teacher, 
  ClassRoom, 
  Subject, 
  AcademicYear, 
  Semester, 
  AttendanceRecord, 
  TimetableSlot, 
  Exam, 
  GradeItem, 
  GradeRecord,
  FeeInvoice, 
  PaymentRecord, 
  ExpenseRecord, 
  Book, 
  BookBorrow, 
  Assignment, 
  AssignmentSubmission, 
  Announcement, 
  SchoolEvent, 
  CertificateRecord, 
  AuditLog, 
  NotificationItem,
  UserRole,
  AttendanceStatusType,
  AuthSession,
  Project,
  Note,
  UserProgress,
  WeeklyReport,
  CleaningDutyGroup,
  CleaningDutyRecord,
  CleaningDutyDay,
  CleaningDutyStatus,
  ChatMessage,
  WeeklyQuizScore
} from '../types';

import {
  initialSchoolProfile,
  initialUsers,
  initialClasses,
  initialSubjects,
  initialParents,
  initialTeachers,
  initialStudents,
  initialAcademicYears,
  initialSemesters,
  initialAttendance,
  initialTimetable,
  initialExams,
  initialGrades,
  initialInvoices,
  initialPayments,
  initialExpenses,
  initialBooks,
  initialBorrows,
  initialAssignments,
  initialAnnouncements,
  initialEvents,
  initialCertificates,
  initialAuditLogs,
  initialNotifications,
  initialProjects,
  initialNotes,
  initialProgress,
  initialWeeklyReports,
  initialCleaningGroups,
  initialCleaningRecords,
  initialChatMessages,
  initialWeeklyQuizScores
} from '../data/initialData';

import { hashPassword, generateSessionToken, checkResourceOwnership } from '../utils/security';
import { FirebaseAuthService, FirebaseAuthErrorDetail, parseFirebaseAuthError } from './firebase';

const STORAGE_KEYS = {
  PROFILE: 'sms_kh_profile',
  SESSION: 'sms_kh_auth_session',
  CURRENT_USER: 'sms_kh_current_user',
  USERS: 'sms_kh_users',
  PROJECTS: 'sms_kh_projects',
  NOTES: 'sms_kh_notes',
  PROGRESS: 'sms_kh_progress',
  WEEKLY_REPORTS: 'sms_kh_weekly_reports',
  CLASSES: 'sms_kh_classes',
  SUBJECTS: 'sms_kh_subjects',
  PARENTS: 'sms_kh_parents',
  TEACHERS: 'sms_kh_teachers',
  STUDENTS: 'sms_kh_students',
  ACADEMIC_YEARS: 'sms_kh_academic_years',
  SEMESTERS: 'sms_kh_semesters',
  ATTENDANCE: 'sms_kh_attendance',
  TIMETABLE: 'sms_kh_timetable',
  EXAMS: 'sms_kh_exams',
  GRADES: 'sms_kh_grades',
  INVOICES: 'sms_kh_invoices',
  PAYMENTS: 'sms_kh_payments',
  EXPENSES: 'sms_kh_expenses',
  BOOKS: 'sms_kh_books',
  BORROWS: 'sms_kh_borrows',
  ASSIGNMENTS: 'sms_kh_assignments',
  ANNOUNCEMENTS: 'sms_kh_announcements',
  EVENTS: 'sms_kh_events',
  CERTIFICATES: 'sms_kh_certificates',
  AUDIT_LOGS: 'sms_kh_audit_logs',
  NOTIFICATIONS: 'sms_kh_notifications',
  CLEANING_GROUPS: 'sms_kh_cleaning_groups',
  CLEANING_RECORDS: 'sms_kh_cleaning_records',
  CHAT_MESSAGES: 'sms_kh_chat_messages',
  WEEKLY_QUIZ_SCORES: 'sms_kh_weekly_quiz_scores'
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

function cleanUpStorageQuota(): void {
  try {
    // 1. Prune audit logs to last 20
    const auditStr = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (auditStr) {
      try {
        const logs = JSON.parse(auditStr);
        if (Array.isArray(logs) && logs.length > 20) {
          localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 20)));
        }
      } catch {
        localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
      }
    }
    // 2. Prune notifications to last 20
    const notifStr = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (notifStr) {
      try {
        const notifs = JSON.parse(notifStr);
        if (Array.isArray(notifs) && notifs.length > 20) {
          localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs.slice(0, 20)));
        }
      } catch {
        localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      }
    }
    // 3. Prune chat messages to last 30
    const chatStr = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    if (chatStr) {
      try {
        const chats = JSON.parse(chatStr);
        if (Array.isArray(chats) && chats.length > 30) {
          localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(chats.slice(-30)));
        }
      } catch {
        localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
      }
    }
  } catch (err) {
    console.warn('Storage emergency cleanup warning:', err);
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Storage setItem failed for "${key}", initiating emergency quota cleanup...`, err);
    cleanUpStorageQuota();
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (retryErr) {
      console.warn(`Storage setItem retry failed for "${key}":`, retryErr);
      // If saving SESSION or CURRENT_USER with a giant avatar string, keep session intact with fallback avatar
      if (key === STORAGE_KEYS.SESSION) {
        try {
          const sessionObj = JSON.parse(JSON.stringify(value)) as any;
          if (sessionObj?.user?.avatar && sessionObj.user.avatar.length > 20000) {
            sessionObj.user.avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(sessionObj.user.username || 'user')}`;
            localStorage.setItem(key, JSON.stringify(sessionObj));
          }
        } catch {}
      }
    }
  }
}

const PERMANENT_VAULT_KEYS = {
  BOOKS: 'sms_kh_permanent_vault_books',
  BORROWS: 'sms_kh_permanent_vault_borrows',
  USER_PROFILES: 'sms_kh_permanent_vault_user_profiles'
};

export const StorageService = {
  // Reset all data to Cambodian demo defaults (Preserving Library data & User Profiles completely)
  resetToDefaults: () => {
    // 1. Safeguard existing Library books, borrows, and customized user profiles
    const preservedBooks = StorageService.getBooks();
    const preservedBorrows = StorageService.getBorrows();
    const preservedProfiles = getItem<Record<string, any>>(PERMANENT_VAULT_KEYS.USER_PROFILES, {});
    const currentSession = getItem<AuthSession | null>(STORAGE_KEYS.SESSION, null);

    // 2. Clear all other application keys
    Object.values(STORAGE_KEYS).forEach(k => {
      if (k !== STORAGE_KEYS.BOOKS && k !== STORAGE_KEYS.BORROWS) {
        localStorage.removeItem(k);
      }
    });

    // 3. Re-persist and vault Library data and User Profiles
    setItem(STORAGE_KEYS.BOOKS, preservedBooks);
    setItem(STORAGE_KEYS.BORROWS, preservedBorrows);
    setItem(PERMANENT_VAULT_KEYS.BOOKS, preservedBooks);
    setItem(PERMANENT_VAULT_KEYS.BORROWS, preservedBorrows);
    setItem(PERMANENT_VAULT_KEYS.USER_PROFILES, preservedProfiles);
    if (currentSession) {
      setItem(STORAGE_KEYS.SESSION, currentSession);
      setItem(STORAGE_KEYS.CURRENT_USER, currentSession.user);
    }

    window.location.reload();
  },

  // School Profile
  getProfile: (): SchoolProfile => getItem(STORAGE_KEYS.PROFILE, initialSchoolProfile),
  saveProfile: (profile: SchoolProfile) => {
    setItem(STORAGE_KEYS.PROFILE, profile);
    StorageService.addAuditLog('ការកំណត់សាលា (Settings)', 'កែប្រែព័ត៌មានសាលា', `បានធ្វើបច្ចុប្បន្នភាពព័ត៌មាន ${profile.nameKhmer}`);
  },

  // Users & Auth
  getUsers: (): User[] => {
    let raw = getItem<User[]>(STORAGE_KEYS.USERS, initialUsers);
    
    // Auto-migrate: Ensure all default seed initial users exist in storage
    let modified = false;
    for (const initUser of initialUsers) {
      const exists = raw.some(u => 
        u.id === initUser.id || 
        (u.email && initUser.email && u.email.toLowerCase() === initUser.email.toLowerCase()) ||
        (u.username && initUser.username && u.username.toLowerCase() === initUser.username.toLowerCase())
      );
      if (!exists) {
        raw.push(initUser);
        modified = true;
      }
    }
    if (modified) {
      setItem(STORAGE_KEYS.USERS, raw);
    }

    const vault = getItem<Record<string, Partial<User>>>(PERMANENT_VAULT_KEYS.USER_PROFILES, {});
    return raw.map(u => {
      const saved = vault[u.id] || (u.email ? vault[`email_${u.email.toLowerCase()}`] : null);
      if (saved) {
        return {
          ...u,
          nameKhmer: saved.nameKhmer || u.nameKhmer,
          nameEnglish: saved.nameEnglish || u.nameEnglish,
          avatar: saved.avatar || u.avatar,
          phone: saved.phone || u.phone
        };
      }
      return u;
    });
  },
  saveUser: (user: User) => {
    // 1. Permanently vault user's profile and picture so it persists forever
    try {
      const vault = getItem<Record<string, Partial<User>>>(PERMANENT_VAULT_KEYS.USER_PROFILES, {});
      vault[user.id] = {
        id: user.id,
        nameKhmer: user.nameKhmer,
        nameEnglish: user.nameEnglish,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role
      };
      if (user.email) {
        vault[`email_${user.email.toLowerCase()}`] = vault[user.id];
      }
      setItem(PERMANENT_VAULT_KEYS.USER_PROFILES, vault);
    } catch (vaultErr) {
      console.warn('Could not update permanent user profile vault:', vaultErr);
    }

    // 2. Update user in main USERS list
    const list = StorageService.getUsers();
    const index = list.findIndex(u => u.id === user.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...user };
    } else {
      list.unshift(user);
    }
    setItem(STORAGE_KEYS.USERS, list);

    // 3. If this user matches active session or current user, sync immediately
    const currentSession = getItem<AuthSession | null>(STORAGE_KEYS.SESSION, null);
    if (currentSession && (currentSession.userId === user.id || currentSession.user?.id === user.id || currentSession.user?.email === user.email)) {
      currentSession.user = { ...currentSession.user, ...user };
      setItem(STORAGE_KEYS.SESSION, currentSession);
      setItem(STORAGE_KEYS.CURRENT_USER, currentSession.user);
    }

    // 4. Synchronize with Teacher record if applicable
    try {
      const teachers = StorageService.getTeachers();
      const teacherIdx = teachers.findIndex(t => 
        t.id === user.id || 
        (t.email && user.email && t.email.toLowerCase() === user.email.toLowerCase()) ||
        (t.nameKhmer && user.nameKhmer && t.nameKhmer === user.nameKhmer)
      );
      if (teacherIdx >= 0) {
        teachers[teacherIdx] = {
          ...teachers[teacherIdx],
          nameKhmer: user.nameKhmer,
          nameEnglish: user.nameEnglish || teachers[teacherIdx].nameEnglish,
          email: user.email || teachers[teacherIdx].email,
          phone: user.phone || teachers[teacherIdx].phone,
          photo: user.avatar || teachers[teacherIdx].photo
        };
        setItem(STORAGE_KEYS.TEACHERS, teachers);
      }
    } catch (syncErr) {
      console.warn('Teacher sync notice:', syncErr);
    }

    // 5. Synchronize with Student record if applicable
    try {
      const students = StorageService.getStudents();
      const studentIdx = students.findIndex(s => 
        s.id === user.id || 
        (s.email && user.email && s.email.toLowerCase() === user.email.toLowerCase())
      );
      if (studentIdx >= 0) {
        students[studentIdx] = {
          ...students[studentIdx],
          nameKhmer: user.nameKhmer,
          nameEnglish: user.nameEnglish || students[studentIdx].nameEnglish,
          photo: user.avatar || students[studentIdx].photo,
          phone: user.phone || students[studentIdx].phone
        };
        setItem(STORAGE_KEYS.STUDENTS, students);
      }
    } catch (syncErr) {
      console.warn('Student sync notice:', syncErr);
    }

    StorageService.addAuditLog('អ្នកប្រើប្រាស់ (Users)', 'កែប្រែព័ត៌មានផ្ទាល់ខ្លួន', `បានរក្សាទុកព័ត៌មាន និងរូបថតរបស់ ${user.nameKhmer} (${user.role}) ជាអចិន្ត្រៃយ៍`);
    return user;
  },
  deleteUser: (id: string) => {
    const list = StorageService.getUsers();
    const user = list.find(u => u.id === id);
    const updated = list.filter(u => u.id !== id);
    setItem(STORAGE_KEYS.USERS, updated);
    if (user) {
      StorageService.addAuditLog('អ្នកប្រើប្រាស់ (Users)', 'លុបគណនី', `បានលុបគណនី ${user.nameKhmer} (${user.role})`);
    }
  },
  removeAllUsers: (keepSuperAdmin: boolean = false, currentUserId?: string): User[] => {
    const list = StorageService.getUsers();
    let remaining: User[] = [];
    if (keepSuperAdmin) {
      remaining = list.filter(u => u.role === 'SUPER_ADMIN' || (currentUserId && u.id === currentUserId));
    }
    setItem(STORAGE_KEYS.USERS, remaining);
    StorageService.addAuditLog(
      'អ្នកប្រើប្រាស់ (Users)',
      'លុបគណនីទាំងអស់',
      `បានលុបគណនីអ្នកប្រើប្រាស់ទាំងអស់ (${list.length - remaining.length} គណនី)`
    );
    return remaining;
  },

  // Authentication & Sessions
  getCurrentSession: (): AuthSession | null => {
    const session = getItem<AuthSession | null>(STORAGE_KEYS.SESSION, null);
    if (!session) return null;
    // Check expiration safely without invoking logout recursion
    if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      return null;
    }
    // Merge with permanent profile vault
    if (session.user) {
      const vault = getItem<Record<string, Partial<User>>>(PERMANENT_VAULT_KEYS.USER_PROFILES, {});
      const saved = vault[session.user.id] || (session.user.email ? vault[`email_${session.user.email.toLowerCase()}`] : null);
      if (saved) {
        session.user = {
          ...session.user,
          ...saved
        };
      }
    }
    return session;
  },

  getCurrentUser: (): User | null => {
    const session = getItem<AuthSession | null>(STORAGE_KEYS.SESSION, null);
    const vault = getItem<Record<string, Partial<User>>>(PERMANENT_VAULT_KEYS.USER_PROFILES, {});
    if (session && session.user) {
      if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        return null;
      }
      const saved = vault[session.user.id] || (session.user.email ? vault[`email_${session.user.email.toLowerCase()}`] : null);
      if (saved) {
        return {
          ...session.user,
          ...saved
        };
      }
      return session.user;
    }
    // Fallback check
    const stored = getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (stored) {
      const saved = vault[stored.id] || (stored.email ? vault[`email_${stored.email.toLowerCase()}`] : null);
      if (saved) {
        return { ...stored, ...saved };
      }
    }
    return stored;
  },

  setCurrentUser: (user: User) => {
    setItem(STORAGE_KEYS.CURRENT_USER, user);
    const session = getItem<AuthSession | null>(STORAGE_KEYS.SESSION, null);
    if (session) {
      session.user = user;
      setItem(STORAGE_KEYS.SESSION, session);
    }
  },

  login: async (emailOrUsername: string, passwordPlain: string): Promise<{ success: boolean; session?: AuthSession; user?: User; errorKhmer?: string; errorEnglish?: string; errorDetail?: FirebaseAuthErrorDetail }> => {
    const users = StorageService.getUsers();
    const cleanId = emailOrUsername.trim().toLowerCase();
    
    // Find user by username or email
    const user = users.find(u => 
      (u.email && u.email.toLowerCase() === cleanId) || 
      (u.username && u.username.toLowerCase() === cleanId) ||
      (cleanId === 'sopheakctepangkor@gmail.com' && (u.role === 'SUPER_ADMIN' || u.id === 'USR-001'))
    );

    // Attempt Firebase Authentication if email format or mapped email
    const targetEmail = user?.email || (cleanId.includes('@') ? cleanId : undefined);
    let fbResult: any = null;
    if (targetEmail) {
      try {
        fbResult = await FirebaseAuthService.signInWithFirebase(targetEmail, passwordPlain);
      } catch (fbErr) {
        console.warn('Firebase Auth sign in attempt notice:', fbErr);
      }
    }

    if (!user) {
      if (fbResult && !fbResult.success && fbResult.errorDetail) {
        return {
          success: false,
          errorKhmer: fbResult.errorDetail.khmer,
          errorEnglish: fbResult.errorDetail.english,
          errorDetail: fbResult.errorDetail
        };
      }
      return {
        success: false,
        errorKhmer: 'គណនីនេះមិនមានក្នុងប្រព័ន្ធទេ (Account does not exist)',
        errorEnglish: 'Account does not exist',
        errorDetail: {
          khmer: 'គណនីនេះមិនមានក្នុងប្រព័ន្ធទេ (Account does not exist)',
          english: 'Account does not exist in local database or Firebase.',
          type: 'CREDENTIALS',
          code: 'auth/user-not-found',
          suggestionKhmer: 'សូមពិនិត្យអក្ខរាវិរុទ្ធឈ្មោះគណនី ឬអ៊ីមែលឡើងវិញ ឬចុះឈ្មោះគណនីថ្មី។',
          suggestionEnglish: 'Please check your username/email for typos or register a new account.'
        }
      };
    }

    if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
      return {
        success: false,
        errorKhmer: 'គណនីនេះត្រូវបានផ្អាកជាបណ្តោះអាសន្ន (Account is suspended)',
        errorEnglish: 'Account is suspended',
        errorDetail: {
          khmer: 'គណនីនេះត្រូវបានផ្អាកជាបណ្តោះអាសន្ន (Account is suspended)',
          english: 'This account has been suspended by an administrator.',
          type: 'SECURITY',
          code: 'auth/user-disabled',
          suggestionKhmer: 'សូមទាក់ទងរដ្ឋបាលសាលាដើម្បីបើកដំណើរការគណនីឡើងវិញ។',
          suggestionEnglish: 'Please contact the school administration to reactivate your account.'
        }
      };
    }

    // Verify password with hash or direct match
    const hashed = await hashPassword(passwordPlain);
    const isDirectMatch = user.password === passwordPlain;
    const isHashMatch = user.password === hashed;

    if (!isDirectMatch && !isHashMatch) {
      if (fbResult && !fbResult.success && fbResult.errorDetail) {
        return {
          success: false,
          errorKhmer: fbResult.errorDetail.khmer,
          errorEnglish: fbResult.errorDetail.english,
          errorDetail: fbResult.errorDetail
        };
      }
      return {
        success: false,
        errorKhmer: 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ (Incorrect password)',
        errorEnglish: 'Invalid password. Please check your credentials.',
        errorDetail: {
          khmer: 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ (Incorrect password)',
          english: 'Incorrect password entered.',
          type: 'CREDENTIALS',
          code: 'auth/wrong-password',
          suggestionKhmer: 'សូមពិនិត្យអក្សរតូច/ធំ ឬចុច "ភ្លេចពាក្យសម្ងាត់" ដើម្បីប្តូរពាក្យសម្ងាត់ថ្មី។',
          suggestionEnglish: 'Please check Caps Lock or click "Forgot Password?" to reset.'
        }
      };
    }

    // Create secure 24-hour session
    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const session: AuthSession = {
      token: generateSessionToken(user.id),
      userId: user.id,
      user: {
        ...user,
        lastLogin: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      },
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString()
    };

    setItem(STORAGE_KEYS.SESSION, session);
    setItem(STORAGE_KEYS.CURRENT_USER, session.user);

    StorageService.addAuditLog('ប្រព័ន្ធសុវត្ថិភាព (Auth)', 'ចូលប្រព័ន្ធ (Login)', `ចូលប្រើប្រាស់ដោយជោគជ័យ: ${user.nameKhmer} (${user.role}) [Firebase Auth Sync]`);

    return {
      success: true,
      session,
      user: session.user
    };
  },

  loginWithGoogle: async (): Promise<{ success: boolean; session?: AuthSession; user?: User; errorKhmer?: string; errorEnglish?: string; errorDetail?: FirebaseAuthErrorDetail }> => {
    try {
      const fbResult = await FirebaseAuthService.signInWithGoogle();
      if (!fbResult.success || !fbResult.user) {
        return {
          success: false,
          errorKhmer: fbResult.errorDetail?.khmer || fbResult.error || 'បរាជ័យក្នុងការចូលតាម Google',
          errorEnglish: fbResult.errorDetail?.english || fbResult.error || 'Failed to sign in with Google',
          errorDetail: fbResult.errorDetail || parseFirebaseAuthError({ code: fbResult.code, message: fbResult.error })
        };
      }

      const fbUser = fbResult.user;
      const cleanEmail = (fbUser.email || '').toLowerCase().trim();
      const users = StorageService.getUsers();
      
      let user = users.find(u => 
        (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail) ||
        (cleanEmail === 'sopheakctepangkor@gmail.com' && (u.role === 'SUPER_ADMIN' || u.id === 'USR-001'))
      );

      if (user) {
        user.lastLogin = new Date().toISOString().replace('T', ' ').slice(0, 16);
        if (fbUser.photoURL && (!user.avatar || user.avatar.includes('dicebear'))) {
          user.avatar = fbUser.photoURL;
        }
        StorageService.saveUser(user);
      } else {
        // Create new registered user from Google profile
        const baseUsername = cleanEmail ? cleanEmail.split('@')[0].replace(/[^a-z0-9_.]/g, '') : `user_${Date.now().toString().slice(-4)}`;
        let uniqueUsername = baseUsername;
        let counter = 1;
        while (users.some(u => u.username && u.username.toLowerCase() === uniqueUsername.toLowerCase())) {
          uniqueUsername = `${baseUsername}${counter++}`;
        }

        const hashedPassword = await hashPassword('GoogleAuth@' + fbUser.uid.slice(0, 8));
        const newUserId = `USR-${fbUser.uid.slice(0, 8)}`;
        const assignedRole: UserRole = cleanEmail === 'sopheakctepangkor@gmail.com' ? 'SUPER_ADMIN' : 'STUDENT';

        user = {
          id: newUserId,
          username: uniqueUsername,
          email: cleanEmail || `${uniqueUsername}@tayaek.edu.kh`,
          password: hashedPassword,
          nameKhmer: fbUser.displayName || 'អ្នកប្រើប្រាស់ Google',
          nameEnglish: fbUser.displayName || 'Google User',
          role: assignedRole,
          phone: fbUser.phoneNumber || '012 345 678',
          avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${uniqueUsername}`,
          schoolId: 'SCH-KH-001',
          status: 'ACTIVE',
          lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };

        StorageService.saveUser(user);

        // Seed welcome notes and projects for new user
        StorageService.saveProject({
          title: 'គម្រោងដំបូងរបស់ខ្ញុំ (My First Project)',
          description: 'គម្រោងសរសេរកូដស្វាគមន៍ដំបូងរបស់ខ្ញុំនៅលើ Khmer Coding Academy',
          code: `<!DOCTYPE html>\n<html>\n<head>\n  <title>Hello</title>\n</head>\n<body style="background: #0f172a; color: white; font-family: sans-serif; text-align: center; padding: 40px;">\n  <h1>សួស្តីពិភពលោក! Hello World!</h1>\n  <p>គម្រោងផ្ទាល់ខ្លួនរបស់ខ្ញុំ: ${user.nameKhmer}</p>\n</body>\n</html>`,
          language: 'html',
          tags: ['FirstProject', 'HTML']
        }, user.id);

        StorageService.saveNote({
          title: 'សូមស្វាគមន៍មកកាន់កំណត់ចំណាំផ្ទាល់ខ្លួន!',
          content: `សួស្តី ${user.nameKhmer}!\n\nនេះជាទីកន្លែងកត់ត្រាចំណេះដឹង និងមេរៀនរបស់អ្នក។ មានតែអ្នកប៉ុណ្ណោះដែលអាចមើល កែប្រែ ឬលុបកំណត់ត្រានេះបាន (Strict User Ownership Protected).`,
          color: 'indigo',
          isPinned: true,
          tags: ['Welcome', 'Guide']
        }, user.id);
      }

      const now = new Date();
      const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const session: AuthSession = {
        token: generateSessionToken(user.id),
        userId: user.id,
        user: {
          ...user,
          lastLogin: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
        },
        createdAt: now.toISOString(),
        expiresAt: expires.toISOString()
      };

      setItem(STORAGE_KEYS.SESSION, session);
      setItem(STORAGE_KEYS.CURRENT_USER, session.user);

      StorageService.addAuditLog('ប្រព័ន្ធសុវត្ថិភាព (Auth)', 'ចូលប្រព័ន្ធ Google (Google Sign-In)', `ចូលប្រើប្រាស់ដោយជោគជ័យតាម Google: ${user.nameKhmer} (${user.role}) [Firebase Auth]`);

      return {
        success: true,
        session,
        user: session.user
      };
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      const detail = parseFirebaseAuthError(err);
      return {
        success: false,
        errorKhmer: detail.khmer || 'មានបញ្ហាក្នុងការផ្ទៀងផ្ទាត់ជាមួយ Google សូមព្យាយាមម្តងទៀត',
        errorEnglish: detail.english || err?.message || 'Google sign-in failed',
        errorDetail: detail
      };
    }
  },

  register: async (payload: {
    nameKhmer: string;
    nameEnglish?: string;
    username: string;
    email: string;
    passwordPlain: string;
    role?: UserRole;
    phone?: string;
    avatar?: string;
  }): Promise<{ success: boolean; session?: AuthSession; user?: User; errorKhmer?: string; errorEnglish?: string; errorDetail?: FirebaseAuthErrorDetail }> => {
    const users = StorageService.getUsers();
    const cleanUsername = payload.username.trim().toLowerCase();
    const cleanEmail = payload.email.trim().toLowerCase();

    // Validate unique username & email
    if (users.some(u => u.username && u.username.toLowerCase() === cleanUsername)) {
      return {
        success: false,
        errorKhmer: 'ឈ្មោះគណនី (Username) នេះមានអ្នកប្រើរួចហើយ (Username already exists)',
        errorEnglish: 'Username already exists',
        errorDetail: {
          khmer: 'ឈ្មោះគណនី (Username) នេះមានអ្នកប្រើរួចហើយ (Username already exists)',
          english: 'Username is already taken by another account.',
          type: 'EXISTS',
          suggestionKhmer: 'សូមជ្រើសរើសឈ្មោះគណនីផ្សេងទៀត (ឧ. បន្ថែមលេខ ឬអក្សរកាត់)។',
          suggestionEnglish: 'Please choose a different username.'
        }
      };
    }

    if (users.some(u => u.email && u.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        errorKhmer: 'អ៊ីមែល (Email) នេះមានក្នុងប្រព័ន្ធរួចហើយ (Email already registered)',
        errorEnglish: 'Email already registered',
        errorDetail: {
          khmer: 'អ៊ីមែល (Email) នេះមានក្នុងប្រព័ន្ធរួចហើយ (Email already registered)',
          english: 'Email is already registered.',
          type: 'EXISTS',
          code: 'auth/email-already-in-use',
          suggestionKhmer: 'សូមចូលប្រើប្រាស់គណនីរបស់អ្នក ឬប្រើអ៊ីមែលផ្សេងទៀត។',
          suggestionEnglish: 'Please switch to Login or use a different email.'
        }
      };
    }

    // Register with Firebase Authentication
    let firebaseUid: string | undefined;
    try {
      const fbResult = await FirebaseAuthService.signUpWithFirebase(
        cleanEmail, 
        payload.passwordPlain, 
        payload.nameEnglish || payload.nameKhmer
      );
      if (fbResult.user) {
        firebaseUid = fbResult.user.uid;
      } else if (!fbResult.success && fbResult.errorDetail) {
        // If network error or fatal firebase error, return structured error
        if (fbResult.errorDetail.type === 'EXISTS' || fbResult.errorDetail.type === 'NETWORK') {
          return {
            success: false,
            errorKhmer: fbResult.errorDetail.khmer,
            errorEnglish: fbResult.errorDetail.english,
            errorDetail: fbResult.errorDetail
          };
        }
      }
    } catch (fbErr) {
      console.warn('Firebase Auth sign up notice:', fbErr);
    }

    const hashedPassword = await hashPassword(payload.passwordPlain);
    const newUserId = firebaseUid ? `USR-${firebaseUid.slice(0, 8)}` : `USR-${Date.now().toString().slice(-4)}`;

    const newUser: User = {
      id: newUserId,
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      nameKhmer: payload.nameKhmer.trim(),
      nameEnglish: payload.nameEnglish?.trim() || payload.nameKhmer.trim(),
      role: payload.role || 'STUDENT',
      phone: payload.phone || '012 345 678',
      avatar: payload.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      schoolId: 'SCH-KH-001',
      status: 'ACTIVE',
      lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    // Save user to storage
    StorageService.saveUser(newUser);

    // Seed default welcome project & note for new user
    StorageService.saveProject({
      title: 'គម្រោងដំបូងរបស់ខ្ញុំ (My First Project)',
      description: 'គម្រោងសរសេរកូដស្វាគមន៍ដំបូងរបស់ខ្ញុំនៅលើ Khmer Coding Academy',
      code: `<!DOCTYPE html>\n<html>\n<head>\n  <title>Hello</title>\n</head>\n<body style="background: #0f172a; color: white; font-family: sans-serif; text-align: center; padding: 40px;">\n  <h1>សួស្តីពិភពលោក! Hello World!</h1>\n  <p>គម្រោងផ្ទាល់ខ្លួនរបស់ខ្ញុំ: ${newUser.nameKhmer}</p>\n</body>\n</html>`,
      language: 'html',
      tags: ['FirstProject', 'HTML']
    }, newUser.id);

    StorageService.saveNote({
      title: 'សូមស្វាគមន៍មកកាន់កំណត់ចំណាំផ្ទាល់ខ្លួន!',
      content: `សួស្តី ${newUser.nameKhmer}!\n\nនេះជាទីកន្លែងកត់ត្រាចំណេះដឹង និងមេរៀនរបស់អ្នក។ មានតែអ្នកប៉ុណ្ណោះដែលអាចមើល កែប្រែ ឬលុបកំណត់ត្រានេះបាន (Strict User Ownership Protected).`,
      color: 'indigo',
      isPinned: true,
      tags: ['Welcome', 'Guide']
    }, newUser.id);

    // Auto log-in
    const now = new Date();
    const session: AuthSession = {
      token: generateSessionToken(newUser.id),
      userId: newUser.id,
      user: newUser,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    };

    setItem(STORAGE_KEYS.SESSION, session);
    setItem(STORAGE_KEYS.CURRENT_USER, session.user);

    StorageService.addAuditLog('ប្រព័ន្ធសុវត្ថិភាព (Auth)', 'ចុះឈ្មោះថ្មី (Sign Up)', `បានបង្កើតគណនីថ្មី: ${newUser.nameKhmer} (${newUser.role}) [Firebase Auth Enabled]`);

    return {
      success: true,
      session,
      user: newUser
    };
  },

  logout: () => {
    const session = getItem<AuthSession | null>(STORAGE_KEYS.SESSION, null);
    const user = session?.user || getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    
    // Sign out from Firebase Auth
    try {
      FirebaseAuthService.signOutFromFirebase();
    } catch (fbErr) {
      console.warn('Firebase sign out notice:', fbErr);
    }

    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    if (user && user.nameKhmer) {
      try {
        StorageService.addAuditLog('ប្រព័ន្ធសុវត្ថិភាព (Auth)', 'ចាកចេញ (Logout)', `បានចាកចេញពីប្រព័ន្ធ: ${user.nameKhmer}`);
      } catch (err) {
        console.warn('Could not add audit log for logout:', err);
      }
    }
  },

  resetPassword: async (email: string, newPasswordPlain: string): Promise<{ success: boolean; messageKhmer: string; errorDetail?: FirebaseAuthErrorDetail }> => {
    const cleanEmail = email.trim().toLowerCase();
    const users = StorageService.getUsers();
    const user = users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
    
    // Trigger Firebase password reset email
    let fbResult: any = null;
    try {
      fbResult = await FirebaseAuthService.sendPasswordReset(cleanEmail);
    } catch (fbErr) {
      console.warn('Firebase reset password email notice:', fbErr);
    }

    if (!user) {
      if (fbResult && !fbResult.success && fbResult.errorDetail) {
        return { 
          success: false, 
          messageKhmer: fbResult.errorDetail.khmer,
          errorDetail: fbResult.errorDetail
        };
      }
      return { 
        success: false, 
        messageKhmer: 'រកមិនឃើញអ៊ីមែលនេះក្នុងប្រព័ន្ធទេ (Email not found)',
        errorDetail: {
          khmer: 'រកមិនឃើញអ៊ីមែលនេះក្នុងប្រព័ន្ធទេ (Email not found)',
          english: 'Email not found in system records.',
          type: 'CREDENTIALS',
          code: 'auth/user-not-found',
          suggestionKhmer: 'សូមពិនិត្យអក្ខរាវិរុទ្ធអ៊ីមែល ឬចុះឈ្មោះគណនីថ្មី។',
          suggestionEnglish: 'Please check your email address or sign up for an account.'
        }
      };
    }
    const hashed = await hashPassword(newPasswordPlain);
    user.password = hashed;
    StorageService.saveUser(user);
    StorageService.addAuditLog('ប្រព័ន្ធសុវត្ថិភាព (Auth)', 'កំណត់ពាក្យសម្ងាត់ឡើងវិញ', `បានប្តូរពាក្យសម្ងាត់សម្រាប់ ${user.email} [Firebase Reset Triggered]`);
    return { success: true, messageKhmer: 'បានប្តូរពាក្យសម្ងាត់ជោគជ័យ និងផ្ញើតំណភ្ជាប់បញ្ជាក់តាម Firebase Auth!' };
  },

  // ==========================================
  // USER-OWNED DATA (STRICT IDOR PROTECTION)
  // ==========================================

  // Projects (Scoped to authenticated user)
  getProjects: (currentUserId?: string): Project[] => {
    const all = getItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
    if (!currentUserId) return [];
    
    // Check role of current user
    const users = StorageService.getUsers();
    const user = users.find(u => u.id === currentUserId);
    if (user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')) {
      return all;
    }
    // Normal users can ONLY see their own projects
    return all.filter(p => p.userId === currentUserId);
  },

  getProjectById: (id: string, currentUserId: string): Project | null => {
    const all = getItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
    const target = all.find(p => p.id === id);
    if (!target) return null;

    const user = StorageService.getUsers().find(u => u.id === currentUserId);
    const auth = checkResourceOwnership(target.userId, currentUserId, user?.role);
    if (!auth.authorized) {
      // Return null (404) for IDOR protection
      return null;
    }
    return target;
  },

  saveProject: (projectData: Partial<Project>, currentUserId: string): { success: boolean; project?: Project; error?: string } => {
    if (!currentUserId) {
      return { success: false, error: 'Unauthorized: User session required' };
    }

    const all = getItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
    const user = StorageService.getUsers().find(u => u.id === currentUserId);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (projectData.id) {
      // Editing existing project - enforce ownership
      const existingIdx = all.findIndex(p => p.id === projectData.id);
      if (existingIdx === -1) {
        return { success: false, error: '404 Not Found' };
      }
      const existing = all[existingIdx];
      const auth = checkResourceOwnership(existing.userId, currentUserId, user?.role);
      if (!auth.authorized) {
        return { success: false, error: '404 Not Found: Cannot modify resource owned by another user' };
      }

      const updated: Project = {
        ...existing,
        ...projectData,
        userId: existing.userId, // Never allow changing owner via client payload
        updatedAt: now
      };
      all[existingIdx] = updated;
      setItem(STORAGE_KEYS.PROJECTS, all);
      StorageService.addAuditLog('គម្រោងសរសេរកូដ (Projects)', 'កែប្រែគម្រោង', `បានកែប្រែគម្រោង "${updated.title}"`);
      return { success: true, project: updated };
    } else {
      // Creating new project - automatically bind session user ID
      const newProj: Project = {
        id: `PRJ-${Date.now().toString().slice(-6)}`,
        userId: currentUserId,
        title: projectData.title || 'គម្រោងថ្មី (Untitled Project)',
        description: projectData.description || '',
        code: projectData.code || '',
        language: projectData.language || 'html',
        tags: projectData.tags || ['Coding'],
        isPublic: false,
        createdAt: now,
        updatedAt: now
      };
      all.unshift(newProj);
      setItem(STORAGE_KEYS.PROJECTS, all);
      StorageService.addAuditLog('គម្រោងសរសេរកូដ (Projects)', 'បង្កើតគម្រោង', `បានបង្កើតគម្រោងថ្មី "${newProj.title}"`);
      return { success: true, project: newProj };
    }
  },

  deleteProject: (id: string, currentUserId: string): { success: boolean; error?: string } => {
    if (!currentUserId) return { success: false, error: 'Unauthorized' };
    const all = getItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
    const target = all.find(p => p.id === id);
    if (!target) return { success: false, error: '404 Not Found' };

    const user = StorageService.getUsers().find(u => u.id === currentUserId);
    const auth = checkResourceOwnership(target.userId, currentUserId, user?.role);
    if (!auth.authorized) {
      return { success: false, error: '404 Not Found: Cannot delete resource owned by another user' };
    }

    const filtered = all.filter(p => p.id !== id);
    setItem(STORAGE_KEYS.PROJECTS, filtered);
    StorageService.addAuditLog('គម្រោងសរសេរកូដ (Projects)', 'លុបគម្រោង', `បានលុបគម្រោង "${target.title}"`);
    return { success: true };
  },

  // Notes (Scoped to authenticated user)
  getNotes: (currentUserId?: string): Note[] => {
    const all = getItem<Note[]>(STORAGE_KEYS.NOTES, initialNotes);
    if (!currentUserId) return [];
    const user = StorageService.getUsers().find(u => u.id === currentUserId);
    if (user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')) {
      return all;
    }
    return all.filter(n => n.userId === currentUserId);
  },

  saveNote: (noteData: Partial<Note>, currentUserId: string): { success: boolean; note?: Note; error?: string } => {
    if (!currentUserId) return { success: false, error: 'Unauthorized' };
    const all = getItem<Note[]>(STORAGE_KEYS.NOTES, initialNotes);
    const user = StorageService.getUsers().find(u => u.id === currentUserId);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (noteData.id) {
      const idx = all.findIndex(n => n.id === noteData.id);
      if (idx === -1) return { success: false, error: '404 Not Found' };
      const existing = all[idx];
      const auth = checkResourceOwnership(existing.userId, currentUserId, user?.role);
      if (!auth.authorized) {
        return { success: false, error: '404 Not Found: Cannot modify another user note' };
      }
      const updated: Note = {
        ...existing,
        ...noteData,
        userId: existing.userId,
        updatedAt: now
      };
      all[idx] = updated;
      setItem(STORAGE_KEYS.NOTES, all);
      return { success: true, note: updated };
    } else {
      const newNote: Note = {
        id: `NOTE-${Date.now().toString().slice(-6)}`,
        userId: currentUserId,
        title: noteData.title || 'ចំណាំថ្មី',
        content: noteData.content || '',
        color: noteData.color || 'indigo',
        isPinned: noteData.isPinned || false,
        tags: noteData.tags || [],
        createdAt: now,
        updatedAt: now
      };
      all.unshift(newNote);
      setItem(STORAGE_KEYS.NOTES, all);
      return { success: true, note: newNote };
    }
  },

  deleteNote: (id: string, currentUserId: string): { success: boolean; error?: string } => {
    if (!currentUserId) return { success: false, error: 'Unauthorized' };
    const all = getItem<Note[]>(STORAGE_KEYS.NOTES, initialNotes);
    const target = all.find(n => n.id === id);
    if (!target) return { success: false, error: '404 Not Found' };
    const user = StorageService.getUsers().find(u => u.id === currentUserId);
    const auth = checkResourceOwnership(target.userId, currentUserId, user?.role);
    if (!auth.authorized) {
      return { success: false, error: '404 Not Found' };
    }
    setItem(STORAGE_KEYS.NOTES, all.filter(n => n.id !== id));
    return { success: true };
  },

  // Progress (Scoped to authenticated user)
  getProgress: (currentUserId?: string): UserProgress[] => {
    const all = getItem<UserProgress[]>(STORAGE_KEYS.PROGRESS, initialProgress);
    if (!currentUserId) return [];
    const user = StorageService.getUsers().find(u => u.id === currentUserId);
    if (user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')) {
      return all;
    }
    return all.filter(p => p.userId === currentUserId);
  },

  saveProgress: (progress: UserProgress, currentUserId: string): boolean => {
    if (!currentUserId) return false;
    const all = getItem<UserProgress[]>(STORAGE_KEYS.PROGRESS, initialProgress);
    const idx = all.findIndex(p => p.id === progress.id && p.userId === currentUserId);
    if (idx >= 0) {
      all[idx] = { ...progress, userId: currentUserId };
    } else {
      all.push({ ...progress, userId: currentUserId });
    }
    setItem(STORAGE_KEYS.PROGRESS, all);
    return true;
  },

  // Interactive Automated IDOR Security Test Runner
  runSecurityAuthorizationTests: async (): Promise<{
    name: string;
    testNumber: number;
    descriptionKhmer: string;
    expectedStatus: number;
    actualStatus: number;
    passed: boolean;
    logs: string[];
  }[]> => {
    const results = [];
    const userA_Id = 'USR-004'; // Kosal Keo
    const userB_Id = 'USR-005'; // Sokha Chan

    // Test 1: User A creates Project A, can GET, PUT, DELETE
    const t1Logs = [];
    t1Logs.push('1. Authenticating as User A (Kosal Keo, USR-004)...');
    const createRes = StorageService.saveProject({
      title: 'Security Test Project Alpha',
      code: 'console.log("Secret of User A");'
    }, userA_Id);
    
    let t1Passed = false;
    let projA_Id = '';
    if (createRes.success && createRes.project) {
      projA_Id = createRes.project.id;
      t1Logs.push(`2. User A successfully created Project ID: ${projA_Id}`);
      
      const getRes = StorageService.getProjectById(projA_Id, userA_Id);
      t1Logs.push(`3. User A GET ${projA_Id} -> ${getRes ? 'Found (200 OK)' : 'Failed'}`);
      
      const updateRes = StorageService.saveProject({
        id: projA_Id,
        title: 'Security Test Project Alpha (Updated by User A)'
      }, userA_Id);
      t1Logs.push(`4. User A PUT ${projA_Id} -> ${updateRes.success ? 'Success (200 OK)' : 'Failed'}`);
      
      t1Passed = !!getRes && updateRes.success;
    }
    results.push({
      testNumber: 1,
      name: 'User A CRUD Operations on Own Data',
      descriptionKhmer: 'អ្នកប្រើប្រាស់ A បង្កើត មើល និងកែប្រែទិន្នន័យផ្ទាល់ខ្លួនរបស់គាត់',
      expectedStatus: 200,
      actualStatus: t1Passed ? 200 : 500,
      passed: t1Passed,
      logs: t1Logs
    });

    // Test 2: User B attempts to access Project A
    const t2Logs = [];
    t2Logs.push('1. Authenticating as User B (Sokha Chan, USR-005)...');
    t2Logs.push(`2. User B executing GET /api/projects/${projA_Id} (owned by User A)...`);
    const t2Get = StorageService.getProjectById(projA_Id, userB_Id);
    const t2Passed = t2Get === null; // Must be blocked (404)
    t2Logs.push(`3. Result: ${t2Get === null ? '404 Not Found (Access Denied & IDOR Blocked)' : 'FAIL: Resource Leaked!'}`);
    results.push({
      testNumber: 2,
      name: 'User B Cross-Account Read Access (IDOR Prevention)',
      descriptionKhmer: 'អ្នកប្រើប្រាស់ B ព្យាយាមលួចមើលទិន្នន័យរបស់អ្នកប្រើប្រាស់ A (GET)',
      expectedStatus: 404,
      actualStatus: t2Passed ? 404 : 200,
      passed: t2Passed,
      logs: t2Logs
    });

    // Test 3: User B attempts to edit Project A
    const t3Logs = [];
    t3Logs.push(`1. User B executing PUT /api/projects/${projA_Id} with payload { title: "Hacked by User B" }...`);
    const t3Edit = StorageService.saveProject({
      id: projA_Id,
      title: 'Hacked by User B'
    }, userB_Id);
    const t3Passed = !t3Edit.success;
    t3Logs.push(`2. Server Response: ${t3Edit.error || 'Blocked'}`);
    const verifyUnchanged = StorageService.getProjectById(projA_Id, userA_Id);
    t3Logs.push(`3. Verified Project A in storage: "${verifyUnchanged?.title}" (Remains intact)`);
    results.push({
      testNumber: 3,
      name: 'User B Cross-Account Edit Block (Unauthorized PUT)',
      descriptionKhmer: 'អ្នកប្រើប្រាស់ B ព្យាយាមកែប្រែទិន្នន័យរបស់អ្នកប្រើប្រាស់ A (PUT)',
      expectedStatus: 404,
      actualStatus: t3Passed ? 404 : 200,
      passed: t3Passed && verifyUnchanged?.title !== 'Hacked by User B',
      logs: t3Logs
    });

    // Test 4: User B attempts to delete Project A
    const t4Logs = [];
    t4Logs.push(`1. User B executing DELETE /api/projects/${projA_Id}...`);
    const t4Delete = StorageService.deleteProject(projA_Id, userB_Id);
    const t4Passed = !t4Delete.success;
    t4Logs.push(`2. Server Response: ${t4Delete.error || 'Blocked'}`);
    const verifyStillExists = StorageService.getProjectById(projA_Id, userA_Id);
    t4Logs.push(`3. Verified Project A in storage: ${verifyStillExists ? 'Still Exists (Protected)' : 'FAIL: Deleted!'}`);
    results.push({
      testNumber: 4,
      name: 'User B Cross-Account Delete Block (Unauthorized DELETE)',
      descriptionKhmer: 'អ្នកប្រើប្រាស់ B ព្យាយាមលុបទិន្នន័យរបស់អ្នកប្រើប្រាស់ A (DELETE)',
      expectedStatus: 404,
      actualStatus: t4Passed ? 404 : 200,
      passed: t4Passed && verifyStillExists !== null,
      logs: t4Logs
    });

    // Test 5: Unauthenticated user attempts to access Project A
    const t5Logs = [];
    t5Logs.push('1. Testing Unauthenticated Request (No Session Token / Public Access)...');
    t5Logs.push(`2. Requesting GET /api/projects/${projA_Id} without auth headers...`);
    const t5Get = StorageService.getProjectById(projA_Id, '');
    const t5Create = StorageService.saveProject({ title: 'Unauth' }, '');
    const t5Passed = t5Get === null && !t5Create.success;
    t5Logs.push('3. Result: 401 Unauthorized / Redirect to Login');
    results.push({
      testNumber: 5,
      name: 'Unauthenticated Protected Route Guard',
      descriptionKhmer: 'អ្នកមិនទាន់ចូលគណនី (Guest) ព្យាយាមចូលដំណើរការទិន្នន័យសម្ងាត់',
      expectedStatus: 401,
      actualStatus: t5Passed ? 401 : 200,
      passed: t5Passed,
      logs: t5Logs
    });

    // Clean up temporary test project
    if (projA_Id) {
      StorageService.deleteProject(projA_Id, userA_Id);
    }

    return results;
  },

  // Students
  getStudents: (): Student[] => getItem(STORAGE_KEYS.STUDENTS, initialStudents),
  saveStudent: (student: Student) => {
    const list = StorageService.getStudents();
    const index = list.findIndex(s => s.id === student.id);
    if (index >= 0) {
      list[index] = student;
      StorageService.addAuditLog('គ្រប់គ្រងសិស្ស (Students)', 'កែប្រែព័ត៌មានសិស្ស', `កែប្រែសិស្ស ${student.nameKhmer} (${student.studentCode})`);
    } else {
      list.unshift(student);
      StorageService.addAuditLog('គ្រប់គ្រងសិស្ស (Students)', 'បង្កើតសិស្សថ្មី', `បានចុះឈ្មោះសិស្សថ្មី ${student.nameKhmer} (${student.studentCode})`);
    }
    setItem(STORAGE_KEYS.STUDENTS, list);
    return student;
  },
  saveStudentsBatch: (newOrUpdatedStudents: Student[], mode: 'APPEND' | 'REPLACE' = 'APPEND') => {
    const currentList = StorageService.getStudents();
    let finalList: Student[] = [];

    if (mode === 'REPLACE') {
      finalList = [...newOrUpdatedStudents];
    } else {
      finalList = [...currentList];
      newOrUpdatedStudents.forEach(stu => {
        const existingIdx = finalList.findIndex(s => s.id === stu.id || (s.nameKhmer && s.nameKhmer.trim() === stu.nameKhmer.trim()));
        if (existingIdx >= 0) {
          finalList[existingIdx] = { ...finalList[existingIdx], ...stu };
        } else {
          finalList.unshift(stu);
        }
      });
    }

    setItem(STORAGE_KEYS.STUDENTS, finalList);
    StorageService.addAuditLog(
      'គ្រប់គ្រងសិស្ស (Students)',
      'នាំចូលទិន្នន័យ Excel (Import Excel)',
      `បាននាំចូលសិស្សចំនួន ${newOrUpdatedStudents.length} នាក់ពី Excel ដោយជោគជ័យ`
    );
    return finalList;
  },
  deleteStudent: (id: string) => {
    const list = StorageService.getStudents();
    const student = list.find(s => s.id === id);
    const updated = list.filter(s => s.id !== id);
    setItem(STORAGE_KEYS.STUDENTS, updated);
    if (student) {
      StorageService.addAuditLog('គ្រប់គ្រងសិស្ស (Students)', 'លុបសិស្ស', `បានលុបសិស្ស ${student.nameKhmer}`);
    }
  },
  removeAllStudents: (): void => {
    const list = StorageService.getStudents();
    setItem(STORAGE_KEYS.STUDENTS, []);
    StorageService.addAuditLog('គ្រប់គ្រងសិស្ស (Students)', 'លុបសិស្សទាំងអស់', `បានលុបសិស្សទាំងអស់ (${list.length} នាក់)`);
  },

  // Teachers
  getTeachers: (): Teacher[] => {
    return getItem(STORAGE_KEYS.TEACHERS, initialTeachers);
  },
  saveTeacher: (teacher: Teacher) => {
    const list = StorageService.getTeachers();
    const index = list.findIndex(t => t.id === teacher.id);
    if (index >= 0) {
      list[index] = teacher;
      StorageService.addAuditLog('គ្រប់គ្រងគ្រូ (Teachers)', 'កែប្រែព័ត៌មានគ្រូ', `កែប្រែគ្រូ ${teacher.nameKhmer}`);
    } else {
      list.unshift(teacher);
      StorageService.addAuditLog('គ្រប់គ្រងគ្រូ (Teachers)', 'បន្ថែមគ្រូថ្មី', `បានបន្ថែមលោកគ្រូ/អ្នកគ្រូ ${teacher.nameKhmer}`);
    }
    setItem(STORAGE_KEYS.TEACHERS, list);
  },
  deleteTeacher: (id: string) => {
    const list = StorageService.getTeachers();
    const teacher = list.find(t => t.id === id);
    const updated = list.filter(t => t.id !== id);
    setItem(STORAGE_KEYS.TEACHERS, updated);
    if (teacher) {
      StorageService.addAuditLog('គ្រប់គ្រងគ្រូ (Teachers)', 'លុបគ្រូ', `បានលុបគ្រូ ${teacher.nameKhmer}`);
    }
  },

  // Parents
  getParents: (): Parent[] => getItem(STORAGE_KEYS.PARENTS, initialParents),
  saveParent: (parent: Parent) => {
    const list = StorageService.getParents();
    const index = list.findIndex(p => p.id === parent.id);
    if (index >= 0) {
      list[index] = parent;
    } else {
      list.unshift(parent);
    }
    setItem(STORAGE_KEYS.PARENTS, list);
    StorageService.addAuditLog('អាណាព្យាបាល (Parents)', 'រក្សាទុកអាណាព្យាបាល', `អាណាព្យាបាល ${parent.nameKhmer}`);
  },

  // Classes & Subjects
  getClasses: (): ClassRoom[] => {
    const list = getItem(STORAGE_KEYS.CLASSES, initialClasses);
    let changed = false;
    initialClasses.forEach(initCls => {
      if (!list.some(c => c.id === initCls.id)) {
        list.push(initCls);
        changed = true;
      }
    });
    if (changed) {
      setItem(STORAGE_KEYS.CLASSES, list);
    }
    return list;
  },
  saveClass: (cls: ClassRoom) => {
    const list = StorageService.getClasses();
    const index = list.findIndex(c => c.id === cls.id);
    if (index >= 0) list[index] = cls;
    else list.push(cls);
    setItem(STORAGE_KEYS.CLASSES, list);
    StorageService.addAuditLog('ថ្នាក់រៀន (Classes)', 'រក្សាទុកថ្នាក់រៀន', `ថ្នាក់ ${cls.name}`);
  },
  deleteClass: (id: string) => {
    const list = StorageService.getClasses();
    const target = list.find(c => c.id === id);
    setItem(STORAGE_KEYS.CLASSES, list.filter(c => c.id !== id));
    if (target) {
      StorageService.addAuditLog('ថ្នាក់រៀន (Classes)', 'លុបថ្នាក់រៀន', `បានលុបថ្នាក់ ${target.name}`);
    }
  },
  getSubjects: (): Subject[] => {
    const list = getItem(STORAGE_KEYS.SUBJECTS, initialSubjects);
    let changed = false;
    initialSubjects.forEach(initSub => {
      if (!list.some(s => s.id === initSub.id || s.code === initSub.code)) {
        list.push(initSub);
        changed = true;
      }
    });
    if (changed) {
      setItem(STORAGE_KEYS.SUBJECTS, list);
    }
    return list;
  },
  saveSubject: (subj: Subject) => {
    const list = StorageService.getSubjects();
    const index = list.findIndex(s => s.id === subj.id);
    if (index >= 0) list[index] = subj;
    else list.push(subj);
    setItem(STORAGE_KEYS.SUBJECTS, list);
    StorageService.addAuditLog('មុខវិជ្ជា (Subjects)', 'រក្សាទុកមុខវិជ្ជា', `មុខវិជ្ជា ${subj.nameKhmer}`);
  },
  deleteSubject: (id: string) => {
    const list = StorageService.getSubjects();
    const target = list.find(s => s.id === id);
    setItem(STORAGE_KEYS.SUBJECTS, list.filter(s => s.id !== id));
    if (target) {
      StorageService.addAuditLog('មុខវិជ្ជា (Subjects)', 'លុបមុខវិជ្ជា', `បានលុបមុខវិជ្ជា ${target.nameKhmer}`);
    }
  },

  // Academic Years & Semesters
  getAcademicYears: (): AcademicYear[] => getItem(STORAGE_KEYS.ACADEMIC_YEARS, initialAcademicYears),
  getSemesters: (): Semester[] => getItem(STORAGE_KEYS.SEMESTERS, initialSemesters),

  // Attendance
  getAttendance: (): AttendanceRecord[] => getItem(STORAGE_KEYS.ATTENDANCE, initialAttendance),
  saveAttendanceBulk: (records: AttendanceRecord[]) => {
    const current = StorageService.getAttendance();
    // Filter out same student & date
    const recordMap = new Map<string, AttendanceRecord>();
    current.forEach(r => recordMap.set(`${r.studentId}_${r.date}`, r));
    records.forEach(r => recordMap.set(`${r.studentId}_${r.date}`, r));
    const merged = Array.from(recordMap.values());
    setItem(STORAGE_KEYS.ATTENDANCE, merged);
    StorageService.addAuditLog('វត្តមាន (Attendance)', 'កត់ត្រាវត្តមាន', `បានកត់ត្រាវត្តមានចំនួន ${records.length} នាក់ សម្រាប់ថ្ងៃ ${records[0]?.date || ''}`);
  },
  markAttendance: (studentId: string, studentCode: string, studentNameKhmer: string, classId: string, className: string, date: string, status: AttendanceStatusType, reason?: string) => {
    const currentUser = StorageService.getCurrentUser();
    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      studentId,
      studentCode,
      studentNameKhmer,
      classId,
      className,
      date,
      status,
      reason,
      recordedBy: currentUser?.nameKhmer || 'Admin',
      timestamp: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' })
    };
    StorageService.saveAttendanceBulk([newRecord]);
  },

  // Timetable
  getTimetable: (): TimetableSlot[] => getItem(STORAGE_KEYS.TIMETABLE, initialTimetable),
  saveTimetableSlot: (slot: TimetableSlot) => {
    const list = StorageService.getTimetable();
    const index = list.findIndex(s => s.id === slot.id);
    if (index >= 0) list[index] = slot;
    else list.push(slot);
    setItem(STORAGE_KEYS.TIMETABLE, list);
    StorageService.addAuditLog('កាលវិភាគ (Timetable)', 'រក្សាទុកកាលវិភាគ', `ម៉ោង ${slot.subjectNameKhmer} (${slot.day})`);
  },
  deleteTimetableSlot: (id: string) => {
    const list = StorageService.getTimetable();
    const target = list.find(s => s.id === id);
    setItem(STORAGE_KEYS.TIMETABLE, list.filter(s => s.id !== id));
    if (target) {
      StorageService.addAuditLog('កាលវិភាគ (Timetable)', 'លុបម៉ោងសិក្សា', `បានលុបម៉ោង ${target.subjectNameKhmer} (${target.day})`);
    }
  },

  // Exams & Grades
  getExams: (): Exam[] => getItem(STORAGE_KEYS.EXAMS, initialExams),
  saveExam: (exam: Exam) => {
    const list = StorageService.getExams();
    const index = list.findIndex(e => e.id === exam.id);
    if (index >= 0) list[index] = exam;
    else list.unshift(exam);
    setItem(STORAGE_KEYS.EXAMS, list);
    StorageService.addAuditLog('ការប្រឡង (Exams)', 'បង្កើត/កែប្រែការប្រឡង', `${exam.title}`);
  },
  getGrades: (): GradeItem[] => getItem(STORAGE_KEYS.GRADES, initialGrades),
  saveGrade: (grade: GradeItem) => {
    const list = StorageService.getGrades();
    const index = list.findIndex(g => g.id === grade.id || (g.studentId === grade.studentId && g.subjectId === grade.subjectId && g.semester === grade.semester));
    if (index >= 0) list[index] = grade;
    else list.unshift(grade);
    setItem(STORAGE_KEYS.GRADES, list);
    StorageService.addAuditLog('ពិន្ទុ (Grades)', 'បញ្ចូលពិន្ទុ', `ពិន្ទុ ${grade.subjectNameKhmer} របស់សិស្ស ${grade.studentNameKhmer} (${grade.totalScore}ពិន្ទុ)`);
  },

  // Invoices & Payments
  getInvoices: (): FeeInvoice[] => getItem(STORAGE_KEYS.INVOICES, initialInvoices),
  saveInvoice: (invoice: FeeInvoice) => {
    const list = StorageService.getInvoices();
    const index = list.findIndex(i => i.id === invoice.id);
    if (index >= 0) list[index] = invoice;
    else list.unshift(invoice);
    setItem(STORAGE_KEYS.INVOICES, list);
    StorageService.addAuditLog('ថ្លៃសិក្សា (Invoices)', 'បង្កើត/កែប្រែវិក្កយបត្រ', `វិក្កយបត្រ ${invoice.invoiceNumber} របស់ ${invoice.studentNameKhmer}`);
  },
  deleteInvoice: (id: string) => {
    const list = StorageService.getInvoices();
    const target = list.find(i => i.id === id);
    setItem(STORAGE_KEYS.INVOICES, list.filter(i => i.id !== id));
    if (target) {
      StorageService.addAuditLog('ថ្លៃសិក្សា (Invoices)', 'លុបវិក្កយបត្រ', `បានលុបវិក្កយបត្រ ${target.invoiceNumber}`);
    }
  },
  getPayments: (): PaymentRecord[] => getItem(STORAGE_KEYS.PAYMENTS, initialPayments),
  recordPayment: (payment: PaymentRecord) => {
    const list = StorageService.getPayments();
    list.unshift(payment);
    setItem(STORAGE_KEYS.PAYMENTS, list);

    // Update corresponding invoice
    const invoices = StorageService.getInvoices();
    const inv = invoices.find(i => i.id === payment.invoiceId);
    if (inv) {
      inv.paidUSD += payment.amountUSD;
      inv.remainingUSD = Math.max(0, (inv.amountUSD - inv.discountUSD) - inv.paidUSD);
      inv.status = inv.remainingUSD === 0 ? 'PAID' : 'PARTIAL';
      setItem(STORAGE_KEYS.INVOICES, invoices);
    }
    StorageService.addAuditLog('ការទូទាត់ (Payments)', 'កត់ត្រាការទូទាត់', `បង្កាន់ដៃ ${payment.receiptNumber} ចំនួន $${payment.amountUSD} តាម ${payment.method}`);
  },

  // Expenses
  getExpenses: (): ExpenseRecord[] => getItem(STORAGE_KEYS.EXPENSES, initialExpenses),
  saveExpense: (expense: ExpenseRecord) => {
    const list = StorageService.getExpenses();
    const index = list.findIndex(e => e.id === expense.id);
    if (index >= 0) list[index] = expense;
    else list.unshift(expense);
    setItem(STORAGE_KEYS.EXPENSES, list);
    StorageService.addAuditLog('ចំណាយ (Expenses)', 'កត់ត្រាចំណាយ', `ចំណាយ ${expense.expenseCode}: $${expense.amountUSD} (${expense.description})`);
  },
  deleteExpense: (id: string) => {
    const list = StorageService.getExpenses();
    const target = list.find(e => e.id === id);
    setItem(STORAGE_KEYS.EXPENSES, list.filter(e => e.id !== id));
    if (target) {
      StorageService.addAuditLog('ចំណាយ (Expenses)', 'លុបចំណាយ', `បានលុបកំណត់ត្រាចំណាយ ${target.titleKhmer}`);
    }
  },

  // Library (Permanent Storage Vault - Protected from system updates & resets)
  getBooks: (): Book[] => {
    let list = getItem<Book[] | null>(STORAGE_KEYS.BOOKS, null);
    if (!list || list.length === 0) {
      // Check secondary permanent vault
      const vaultBooks = getItem<Book[] | null>(PERMANENT_VAULT_KEYS.BOOKS, null);
      if (vaultBooks && vaultBooks.length > 0) {
        list = vaultBooks;
        setItem(STORAGE_KEYS.BOOKS, list);
      } else {
        list = initialBooks;
        setItem(STORAGE_KEYS.BOOKS, list);
        setItem(PERMANENT_VAULT_KEYS.BOOKS, list);
      }
    }
    return list;
  },
  saveBook: (book: Book) => {
    const list = StorageService.getBooks();
    const index = list.findIndex(b => b.id === book.id);
    if (index >= 0) list[index] = book;
    else list.unshift(book);
    setItem(STORAGE_KEYS.BOOKS, list);
    setItem(PERMANENT_VAULT_KEYS.BOOKS, list);
    StorageService.addAuditLog('បណ្ណាល័យ (Library)', 'រក្សាទុកសៀវភៅ', `សៀវភៅ ${book.titleKhmer}`);
  },
  deleteBook: (id: string) => {
    const list = StorageService.getBooks();
    const target = list.find(b => b.id === id);
    const updated = list.filter(b => b.id !== id);
    setItem(STORAGE_KEYS.BOOKS, updated);
    setItem(PERMANENT_VAULT_KEYS.BOOKS, updated);
    if (target) {
      StorageService.addAuditLog('បណ្ណាល័យ (Library)', 'លុបសៀវភៅ', `បានលុបសៀវភៅ ${target.titleKhmer}`);
    }
  },
  getBorrows: (): BookBorrow[] => {
    let list = getItem<BookBorrow[] | null>(STORAGE_KEYS.BORROWS, null);
    if (!list) {
      const vaultBorrows = getItem<BookBorrow[] | null>(PERMANENT_VAULT_KEYS.BORROWS, null);
      if (vaultBorrows) {
        list = vaultBorrows;
        setItem(STORAGE_KEYS.BORROWS, list);
      } else {
        list = initialBorrows;
        setItem(STORAGE_KEYS.BORROWS, list);
        setItem(PERMANENT_VAULT_KEYS.BORROWS, list);
      }
    }
    return list;
  },
  saveBorrow: (borrow: BookBorrow) => {
    const list = StorageService.getBorrows();
    const index = list.findIndex(b => b.id === borrow.id);
    if (index >= 0) list[index] = borrow;
    else list.unshift(borrow);
    setItem(STORAGE_KEYS.BORROWS, list);
    setItem(PERMANENT_VAULT_KEYS.BORROWS, list);
    StorageService.addAuditLog('បណ្ណាល័យ (Library)', 'កត់ត្រាការខ្ចី', `${borrow.studentNameKhmer} ខ្ចី ${borrow.bookTitleKhmer}`);
  },
  deleteBorrow: (id: string) => {
    const list = StorageService.getBorrows();
    const updated = list.filter(b => b.id !== id);
    setItem(STORAGE_KEYS.BORROWS, updated);
    setItem(PERMANENT_VAULT_KEYS.BORROWS, updated);
  },

  // Assignments
  getAssignments: (): Assignment[] => getItem(STORAGE_KEYS.ASSIGNMENTS, initialAssignments),
  saveAssignment: (assignment: Assignment) => {
    const list = StorageService.getAssignments();
    const index = list.findIndex(a => a.id === assignment.id);
    if (index >= 0) list[index] = assignment;
    else list.unshift(assignment);
    setItem(STORAGE_KEYS.ASSIGNMENTS, list);
    StorageService.addAuditLog('កិច្ចការសិស្ស (Assignments)', 'បង្កើតកិច្ចការ', `${assignment.titleKhmer || assignment.title || ''}`);
  },
  deleteAssignment: (id: string) => {
    const list = StorageService.getAssignments();
    const updated = list.filter(a => a.id !== id);
    setItem(STORAGE_KEYS.ASSIGNMENTS, updated);
  },

  // Announcements & Events
  getAnnouncements: (): Announcement[] => getItem(STORAGE_KEYS.ANNOUNCEMENTS, initialAnnouncements),
  saveAnnouncement: (announcement: Announcement) => {
    const list = StorageService.getAnnouncements();
    const index = list.findIndex(a => a.id === announcement.id);
    if (index >= 0) list[index] = announcement;
    else list.unshift(announcement);
    setItem(STORAGE_KEYS.ANNOUNCEMENTS, list);
    StorageService.addAuditLog('សេចក្តីជូនដំណឹង (Announcements)', 'ផ្សាយដំណឹង', `${announcement.titleKhmer}`);
  },
  deleteAnnouncement: (id: string) => {
    const list = StorageService.getAnnouncements();
    setItem(STORAGE_KEYS.ANNOUNCEMENTS, list.filter(a => a.id !== id));
  },
  getEvents: (): SchoolEvent[] => getItem(STORAGE_KEYS.EVENTS, initialEvents),
  saveEvent: (event: SchoolEvent) => {
    const list = StorageService.getEvents();
    const index = list.findIndex(e => e.id === event.id);
    if (index >= 0) list[index] = event;
    else list.unshift(event);
    setItem(STORAGE_KEYS.EVENTS, list);
    StorageService.addAuditLog('ប្រតិទិនអប់រំ (Academic Calendar)', index >= 0 ? 'កែប្រែព្រឹត្តិការណ៍' : 'បន្ថែមព្រឹត្តិការណ៍', `${event.titleKhmer} (${event.type})`);
  },
  deleteEvent: (id: string) => {
    const list = StorageService.getEvents();
    const target = list.find(e => e.id === id);
    setItem(STORAGE_KEYS.EVENTS, list.filter(e => e.id !== id));
    StorageService.addAuditLog('ប្រតិទិនអប់រំ (Academic Calendar)', 'លុបព្រឹត្តិការណ៍', target ? target.titleKhmer : `ID: ${id}`);
  },
  saveEventsBatch: (newEvents: SchoolEvent[]) => {
    const list = StorageService.getEvents();
    const existingIds = new Set(list.map(e => e.id));
    const combined = [...list];
    newEvents.forEach(ev => {
      const idx = combined.findIndex(e => e.id === ev.id);
      if (idx >= 0) {
        combined[idx] = ev;
      } else {
        combined.push(ev);
      }
    });
    setItem(STORAGE_KEYS.EVENTS, combined);
    StorageService.addAuditLog('ប្រតិទិនអប់រំ (Academic Calendar)', 'បញ្ចូលព្រឹត្តិការណ៍ជាក្រុម', `បានបញ្ចូល ${newEvents.length} ព្រឹត្តិការណ៍/ថ្ងៃឈប់សម្រាក`);
  },

  // Certificates
  getCertificates: (): CertificateRecord[] => getItem(STORAGE_KEYS.CERTIFICATES, initialCertificates),
  saveCertificate: (cert: CertificateRecord) => {
    const list = StorageService.getCertificates();
    const index = list.findIndex(c => c.id === cert.id);
    if (index >= 0) list[index] = cert;
    else list.unshift(cert);
    setItem(STORAGE_KEYS.CERTIFICATES, list);
    StorageService.addAuditLog('វិញ្ញាបនបត្រ (Certificates)', 'ចេញវិញ្ញាបនបត្រ', `${cert.certNumber} ជូន ${cert.studentNameKhmer}`);
  },
  deleteCertificate: (id: string) => {
    const list = StorageService.getCertificates();
    setItem(STORAGE_KEYS.CERTIFICATES, list.filter(c => c.id !== id));
  },

  // Audit Logs
  getAuditLogs: (): AuditLog[] => {
    const raw = getItem(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
    return raw.map((l: any) => ({
      ...l,
      resource: l.resource || l.module || 'ប្រព័ន្ធទូទៅ',
      module: l.module || l.resource || 'ប្រព័ន្ធទូទៅ',
      userRole: l.userRole || l.role || 'ADMIN',
      role: l.role || l.userRole || 'ADMIN',
      ipAddress: l.ipAddress || l.ip || '192.168.1.102',
      ip: l.ip || l.ipAddress || '192.168.1.102'
    }));
  },
  addAuditLog: (moduleOrLog: string | AuditLog, action?: string, details?: string) => {
    const logs = StorageService.getAuditLogs();
    const user = StorageService.getCurrentUser();
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    let newLog: AuditLog;
    if (typeof moduleOrLog === 'object') {
      const res = moduleOrLog.resource || moduleOrLog.module || 'ប្រព័ន្ធទូទៅ';
      const uRole = moduleOrLog.userRole || moduleOrLog.role || user?.role || 'ADMIN';
      const uIp = moduleOrLog.ipAddress || moduleOrLog.ip || '192.168.1.102';
      newLog = {
        ...moduleOrLog,
        id: moduleOrLog.id || `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: moduleOrLog.timestamp || formattedDate,
        userId: moduleOrLog.userId || user?.id || 'USR-001',
        userName: moduleOrLog.userName || user?.nameKhmer || 'អ្នកគ្រប់គ្រង',
        userRole: uRole,
        role: uRole,
        resource: res,
        module: res,
        action: moduleOrLog.action || action || 'ACTION',
        details: moduleOrLog.details || details || '',
        ipAddress: uIp,
        ip: uIp
      };
    } else {
      const res = moduleOrLog || 'ប្រព័ន្ធទូទៅ';
      const uRole = user?.role || 'ADMIN';
      newLog = {
        id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: formattedDate,
        userId: user?.id || 'USR-001',
        userName: user?.nameKhmer || 'អ្នកគ្រប់គ្រង',
        userRole: uRole,
        role: uRole,
        resource: res,
        module: res,
        action: action || 'ACTION',
        details: details || '',
        ipAddress: '192.168.1.102',
        ip: '192.168.1.102'
      };
    }
    logs.unshift(newLog);
    // Keep last 300 logs
    if (logs.length > 300) logs.pop();
    setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
    return newLog;
  },
  clearAuditLogs: () => {
    setItem(STORAGE_KEYS.AUDIT_LOGS, []);
  },

  // Notifications
  getAllNotifications: (): NotificationItem[] => {
    let list: NotificationItem[] = getItem(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    if (!list || list.length === 0) {
      list = [...initialNotifications];
      setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    }
    return list;
  },
  
  getNotifications: (currentUserId?: string, userRole?: string): NotificationItem[] => {
    let list: NotificationItem[] = getItem(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    // Auto-heal if list in storage was empty
    if (!list || list.length === 0) {
      list = [...initialNotifications];
      setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    }

    if (!currentUserId && !userRole) return list;

    return list.filter(n => {
      // Super Admin and Admin have school-wide visibility to oversee all communications
      if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') return true;

      // Sender can always see the notification they authored
      if (n.senderId && n.senderId === currentUserId) return true;

      // Direct recipient match
      if (n.userId && n.userId === currentUserId) return true;
      if (n.recipientId && n.recipientId === currentUserId) return true;
      
      // Targeted role match
      if (userRole) {
        if (n.targetRole === 'ALL') return true;
        if (n.targetRole && n.targetRole === userRole) return true;
        if (n.targetRoles && (n.targetRoles.includes(userRole as any) || n.targetRoles.includes('ALL' as any))) return true;
      }
      
      // Global broadcast (no specific user or role restriction)
      if (!n.userId && !n.recipientId && !n.targetRole && (!n.targetRoles || n.targetRoles.length === 0)) {
        return true;
      }

      return false;
    });
  },

  resetNotificationsToDefault: (): NotificationItem[] => {
    const list = [...initialNotifications];
    setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    return list;
  },

  addNotification: (notif: Partial<NotificationItem>): NotificationItem => {
    const list: NotificationItem[] = getItem(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    const newNotif: NotificationItem = {
      id: notif.id || `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: notif.title || 'ការជូនដំណឹងថ្មី',
      message: notif.message || '',
      type: notif.type || 'INFO',
      timestamp: notif.timestamp || `មុននេះ (${timeFormatted})`,
      createdAt: notif.createdAt || now.toISOString(),
      isRead: notif.isRead ?? false,
      linkTab: notif.linkTab,
      userId: notif.userId || notif.recipientId,
      recipientId: notif.recipientId || notif.userId,
      targetRole: notif.targetRole,
      targetRoles: notif.targetRoles,
      senderId: notif.senderId,
      senderName: notif.senderName,
      senderRole: notif.senderRole,
      senderAvatar: notif.senderAvatar,
      category: notif.category || 'GENERAL',
      data: notif.data
    };

    list.unshift(newNotif);
    if (list.length > 200) list.pop();
    setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    return newNotif;
  },

  markNotificationAsRead: (id: string) => {
    const list: NotificationItem[] = getItem(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    const target = list.find(n => n.id === id);
    if (target) {
      target.isRead = true;
      setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  },

  markAllNotificationsRead: (currentUserId?: string, userRole?: string) => {
    const list: NotificationItem[] = getItem(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    list.forEach(n => {
      if (!currentUserId && !userRole) {
        n.isRead = true;
      } else {
        const isForUser = 
          (n.userId && n.userId === currentUserId) ||
          (n.recipientId && n.recipientId === currentUserId) ||
          (userRole && (n.targetRole === 'ALL' || n.targetRole === userRole || n.targetRoles?.includes(userRole as any))) ||
          (!n.userId && !n.recipientId && !n.targetRole && (!n.targetRoles || n.targetRoles.length === 0));
        
        if (isForUser) {
          n.isRead = true;
        }
      }
    });
    setItem(STORAGE_KEYS.NOTIFICATIONS, list);
  },

  deleteNotification: (id: string) => {
    const list: NotificationItem[] = getItem(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    const filtered = list.filter(n => n.id !== id);
    setItem(STORAGE_KEYS.NOTIFICATIONS, filtered);
  },

  clearAllNotifications: (currentUserId?: string, userRole?: string) => {
    if (!currentUserId && !userRole) {
      setItem(STORAGE_KEYS.NOTIFICATIONS, []);
      return;
    }
    const list: NotificationItem[] = getItem(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    const remaining = list.filter(n => {
      const isForUser = 
        (n.userId && n.userId === currentUserId) ||
        (n.recipientId && n.recipientId === currentUserId) ||
        (userRole && (n.targetRole === 'ALL' || n.targetRole === userRole || n.targetRoles?.includes(userRole as any))) ||
        (!n.userId && !n.recipientId && !n.targetRole && (!n.targetRoles || n.targetRoles.length === 0));
      return !isForUser;
    });
    setItem(STORAGE_KEYS.NOTIFICATIONS, remaining);
  },

  // ==========================================
  // CHAT BOT & ALL USERS MESSAGING ENGINE
  // ==========================================
  getChatMessages: (): ChatMessage[] => {
    return getItem(STORAGE_KEYS.CHAT_MESSAGES, initialChatMessages);
  },

  sendChatMessage: (msg: Partial<ChatMessage>): ChatMessage => {
    const list: ChatMessage[] = getItem(STORAGE_KEYS.CHAT_MESSAGES, initialChatMessages);
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newMsg: ChatMessage = {
      id: msg.id || `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      senderId: msg.senderId || 'USR-001',
      senderName: msg.senderName || 'អ្នកប្រើប្រាស់',
      senderRole: msg.senderRole,
      senderAvatar: msg.senderAvatar,
      recipientId: msg.recipientId || 'all-school',
      recipientName: msg.recipientName,
      content: msg.content || '',
      timestamp: msg.timestamp || timeFormatted,
      isRead: msg.isRead ?? false,
      type: msg.type || 'TEXT',
      attachmentUrl: msg.attachmentUrl
    };

    list.push(newMsg);
    if (list.length > 600) {
      list.shift();
    }
    setItem(STORAGE_KEYS.CHAT_MESSAGES, list);
    return newMsg;
  },

  markChatMessagesAsRead: (recipientId: string, currentUserId: string, currentUserRole?: string): void => {
    const list: ChatMessage[] = getItem(STORAGE_KEYS.CHAT_MESSAGES, initialChatMessages);
    const isSuperAdmin = currentUserRole === 'SUPER_ADMIN' || currentUserId === 'USR-001';
    let changed = false;
    list.forEach(m => {
      const isDirectMatch = (m.recipientId === currentUserId && m.senderId === recipientId && !m.isRead);
      const isAdminAliasMatch = isSuperAdmin && (m.recipientId === 'USR-001' || m.recipientId === 'admin' || m.recipientId === 'super-admin') && m.senderId === recipientId && !m.isRead;
      const isAllSchoolMatch = recipientId === 'all-school' && m.recipientId === 'all-school' && m.senderId !== currentUserId && !m.isRead;
      const isAiBotMatch = recipientId === 'ai-bot' && m.recipientId === 'ai-bot' && !m.isRead;

      if (isDirectMatch || isAdminAliasMatch || isAllSchoolMatch || isAiBotMatch) {
        m.isRead = true;
        changed = true;
      }
    });
    if (changed) {
      setItem(STORAGE_KEYS.CHAT_MESSAGES, list);
    }
  },

  clearChatConversation: (recipientId: string, currentUserId?: string): void => {
    let list: ChatMessage[] = getItem(STORAGE_KEYS.CHAT_MESSAGES, initialChatMessages);
    if (recipientId === 'all-school') {
      list = list.filter(m => m.recipientId !== 'all-school');
    } else if (recipientId === 'ai-bot') {
      list = list.filter(m => m.recipientId !== 'ai-bot' && m.senderId !== 'ai-bot');
    } else if (currentUserId) {
      list = list.filter(m => !(
        (m.senderId === currentUserId && m.recipientId === recipientId) ||
        (m.senderId === recipientId && (m.recipientId === currentUserId || m.recipientId === 'USR-001' || m.recipientId === 'admin'))
      ));
    }
    setItem(STORAGE_KEYS.CHAT_MESSAGES, list);
  },

  deleteChatMessage: (id: string): void => {
    const list: ChatMessage[] = getItem(STORAGE_KEYS.CHAT_MESSAGES, initialChatMessages);
    const filtered = list.filter(m => m.id !== id);
    setItem(STORAGE_KEYS.CHAT_MESSAGES, filtered);
  },

  getUnreadChatCount: (currentUserId: string, currentUserRole?: string): number => {
    const list: ChatMessage[] = getItem(STORAGE_KEYS.CHAT_MESSAGES, initialChatMessages);
    const isSuperAdmin = currentUserRole === 'SUPER_ADMIN' || currentUserId === 'USR-001';
    return list.filter(m => 
      !m.isRead && 
      m.senderId !== currentUserId &&
      (
        m.recipientId === currentUserId || 
        m.recipientId === 'all-school' ||
        (isSuperAdmin && (m.recipientId === 'USR-001' || m.recipientId === 'admin' || m.recipientId === 'super-admin'))
      )
    ).length;
  },

  // Weekly Teaching Reports (Matching user custom template)
  getWeeklyReports: (): WeeklyReport[] => {
    return getItem(STORAGE_KEYS.WEEKLY_REPORTS, initialWeeklyReports);
  },
  saveWeeklyReport: (report: WeeklyReport): void => {
    const list: WeeklyReport[] = getItem(STORAGE_KEYS.WEEKLY_REPORTS, initialWeeklyReports);
    const existingIndex = list.findIndex(r => r.id === report.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...report, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...report, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setItem(STORAGE_KEYS.WEEKLY_REPORTS, list);
  },
  deleteWeeklyReport: (id: string): void => {
    const list: WeeklyReport[] = getItem(STORAGE_KEYS.WEEKLY_REPORTS, initialWeeklyReports);
    const filtered = list.filter(r => r.id !== id);
    setItem(STORAGE_KEYS.WEEKLY_REPORTS, filtered);
  },

  // ==========================================
  // WEEKLY FRIDAY QUIZ SCORES (TYPING, PRACTICE, WRITING)
  // ==========================================
  getWeeklyQuizScores: (): WeeklyQuizScore[] => {
    const list: WeeklyQuizScore[] = getItem(STORAGE_KEYS.WEEKLY_QUIZ_SCORES, initialWeeklyQuizScores);
    if (!list || list.length < initialWeeklyQuizScores.length) {
      const existingIds = new Set(list.map(s => s.id));
      const missing = initialWeeklyQuizScores.filter(s => !existingIds.has(s.id));
      const combined = [...list, ...missing];
      setItem(STORAGE_KEYS.WEEKLY_QUIZ_SCORES, combined);
      return combined;
    }
    return list;
  },
  saveWeeklyQuizScore: (score: WeeklyQuizScore): void => {
    const list: WeeklyQuizScore[] = getItem(STORAGE_KEYS.WEEKLY_QUIZ_SCORES, initialWeeklyQuizScores);
    const existingIndex = list.findIndex(s => s.id === score.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...score, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...score, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    setItem(STORAGE_KEYS.WEEKLY_QUIZ_SCORES, list);
  },
  saveWeeklyQuizScoresBatch: (scores: WeeklyQuizScore[]): void => {
    const list: WeeklyQuizScore[] = getItem(STORAGE_KEYS.WEEKLY_QUIZ_SCORES, initialWeeklyQuizScores);
    scores.forEach(sc => {
      const idx = list.findIndex(item => item.id === sc.id || (item.studentId === sc.studentId && item.fridayDate === sc.fridayDate && item.className === sc.className));
      if (idx >= 0) {
        list[idx] = { ...sc, updatedAt: new Date().toISOString() };
      } else {
        list.push({ ...sc, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
    });
    setItem(STORAGE_KEYS.WEEKLY_QUIZ_SCORES, list);
  },
  deleteWeeklyQuizScore: (id: string): void => {
    const list: WeeklyQuizScore[] = getItem(STORAGE_KEYS.WEEKLY_QUIZ_SCORES, initialWeeklyQuizScores);
    const filtered = list.filter(s => s.id !== id);
    setItem(STORAGE_KEYS.WEEKLY_QUIZ_SCORES, filtered);
  },
  deleteWeeklyQuizScoresByFriday: (fridayDate: string, className: string): void => {
    const list: WeeklyQuizScore[] = getItem(STORAGE_KEYS.WEEKLY_QUIZ_SCORES, initialWeeklyQuizScores);
    const filtered = list.filter(s => !(s.fridayDate === fridayDate && s.className === className));
    setItem(STORAGE_KEYS.WEEKLY_QUIZ_SCORES, filtered);
  },

  // ==========================================
  // CLASS CLEANING GROUPS & SCORING ENGINE
  // ==========================================
  getCleaningGroups: (classId?: string): CleaningDutyGroup[] => {
    const list: CleaningDutyGroup[] = getItem(STORAGE_KEYS.CLEANING_GROUPS, initialCleaningGroups);
    if (!classId) return list;
    return list.filter(g => g.classId === classId);
  },

  saveCleaningGroup: (groupData: Partial<CleaningDutyGroup>): CleaningDutyGroup => {
    const list: CleaningDutyGroup[] = getItem(STORAGE_KEYS.CLEANING_GROUPS, initialCleaningGroups);
    const now = new Date().toISOString();

    if (groupData.id) {
      const idx = list.findIndex(g => g.id === groupData.id);
      if (idx >= 0) {
        list[idx] = {
          ...list[idx],
          ...groupData,
          updatedAt: now
        } as CleaningDutyGroup;
        setItem(STORAGE_KEYS.CLEANING_GROUPS, list);
        return list[idx];
      }
    }

    const newGroup: CleaningDutyGroup = {
      id: `GRP-${Date.now().toString().slice(-6)}`,
      classId: groupData.classId || 'CLS-12A',
      className: groupData.className || 'ថ្នាក់ទី១២ A',
      dayOfWeek: groupData.dayOfWeek || 'MONDAY',
      groupNameKhmer: groupData.groupNameKhmer || 'ក្រុមវេនថ្មី',
      groupNameEnglish: groupData.groupNameEnglish || 'Cleaning Crew',
      groupLeaderId: groupData.groupLeaderId,
      groupLeaderName: groupData.groupLeaderName,
      studentIds: groupData.studentIds || [],
      tasks: groupData.tasks || ['បោស និងជូតកម្រាលបន្ទប់រៀន', 'ជូតក្តារខៀន និងរៀបចំតុគ្រូ', 'រៀបចំតុសិស្ស', 'យកធុងសំរាមទៅចាក់'],
      notes: groupData.notes || '',
      createdAt: now,
      updatedAt: now
    };

    list.push(newGroup);
    setItem(STORAGE_KEYS.CLEANING_GROUPS, list);
    return newGroup;
  },

  addStudentToDayGroup: (classId: string, dayOfWeek: CleaningDutyDay, studentId: string): { success: boolean; group?: CleaningDutyGroup; message?: string } => {
    const list: CleaningDutyGroup[] = getItem(STORAGE_KEYS.CLEANING_GROUPS, initialCleaningGroups);
    let target = list.find(g => g.classId === classId && g.dayOfWeek === dayOfWeek);

    const students = StorageService.getStudents();
    const student = students.find(s => s.id === studentId);
    const classes = StorageService.getClasses();
    const classObj = classes.find(c => c.id === classId);

    const dayNameKhmerMap: Record<CleaningDutyDay, string> = {
      MONDAY: 'ថ្ងៃច័ន្ទ',
      TUESDAY: 'ថ្ងៃអង្គារ',
      WEDNESDAY: 'ថ្ងៃពុធ',
      THURSDAY: 'ថ្ងៃព្រហស្បតិ៍',
      FRIDAY: 'ថ្ងៃសុក្រ'
    };

    if (!target) {
      // Create new group for this day
      target = {
        id: `GRP-${classId || 'ALL'}-${dayOfWeek}`,
        classId: classId || 'ALL',
        className: classObj?.name || 'ទូទៅ',
        dayOfWeek,
        groupNameKhmer: `ក្រុមវេន${dayNameKhmerMap[dayOfWeek]}`,
        groupNameEnglish: `${dayOfWeek} Cleaning Crew`,
        studentIds: [studentId],
        tasks: ['បោស និងជូតបន្ទប់រៀន', 'ជូតក្តារខៀន', 'រៀបចំតុសិស្ស', 'យកសំរាមទៅចាក់'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      list.push(target);
    } else {
      if (!target.studentIds.includes(studentId)) {
        target.studentIds.push(studentId);
        target.updatedAt = new Date().toISOString();
      }
    }

    setItem(STORAGE_KEYS.CLEANING_GROUPS, list);
    
    if (student) {
      StorageService.addAuditLog(
        'វេនសម្អាតថ្នាក់ (Cleaning Duty)',
        'បញ្ចូលសិស្សក្នុងក្រុមវេន',
        `បានបញ្ចូលសិស្ស ${student.nameKhmer} ទៅក្នុងក្រុមវេន ${dayNameKhmerMap[dayOfWeek]}`
      );
    }

    return { success: true, group: target };
  },

  deleteCleaningGroup: (groupId: string): boolean => {
    const list: CleaningDutyGroup[] = getItem(STORAGE_KEYS.CLEANING_GROUPS, initialCleaningGroups);
    const target = list.find(g => g.id === groupId);
    const filtered = list.filter(g => g.id !== groupId);
    setItem(STORAGE_KEYS.CLEANING_GROUPS, filtered);
    if (target) {
      StorageService.addAuditLog(
        'វេនសម្អាតថ្នាក់ (Cleaning Duty)',
        'លុបក្រុមវេនសម្អាត',
        `បានលុបក្រុមវេន ${target.groupNameKhmer}`
      );
    }
    return true;
  },

  deleteCleaningGroupByDay: (classId: string, dayOfWeek: CleaningDutyDay): boolean => {
    const list: CleaningDutyGroup[] = getItem(STORAGE_KEYS.CLEANING_GROUPS, initialCleaningGroups);
    const target = list.find(g => (classId === 'ALL' || g.classId === classId) && g.dayOfWeek === dayOfWeek);
    const filtered = list.filter(g => !((classId === 'ALL' || g.classId === classId) && g.dayOfWeek === dayOfWeek));
    setItem(STORAGE_KEYS.CLEANING_GROUPS, filtered);
    if (target) {
      StorageService.addAuditLog(
        'វេនសម្អាតថ្នាក់ (Cleaning Duty)',
        'លុបក្រុមវេនសម្អាត',
        `បានលុបក្រុមវេន ${target.groupNameKhmer}`
      );
    }
    return true;
  },

  clearGroupStudents: (groupId: string): boolean => {
    const list: CleaningDutyGroup[] = getItem(STORAGE_KEYS.CLEANING_GROUPS, initialCleaningGroups);
    const target = list.find(g => g.id === groupId);
    if (target) {
      target.studentIds = [];
      target.groupLeaderId = undefined;
      target.groupLeaderName = undefined;
      target.updatedAt = new Date().toISOString();
      setItem(STORAGE_KEYS.CLEANING_GROUPS, list);
      StorageService.addAuditLog(
        'វេនសម្អាតថ្នាក់ (Cleaning Duty)',
        'ជម្រះសិស្សក្នុងក្រុមវេន',
        `បានលុបសមាជិកទាំងអស់ចេញពី ${target.groupNameKhmer}`
      );
    }
    return true;
  },

  deleteAllClassCleaningGroups: (classId?: string): boolean => {
    const list: CleaningDutyGroup[] = getItem(STORAGE_KEYS.CLEANING_GROUPS, initialCleaningGroups);
    const filtered = classId && classId !== 'ALL' ? list.filter(g => g.classId !== classId) : [];
    setItem(STORAGE_KEYS.CLEANING_GROUPS, filtered);
    StorageService.addAuditLog(
      'វេនសម្អាតថ្នាក់ (Cleaning Duty)',
      'លុបក្រុមវេនទាំងអស់',
      'បានលុបក្រុមវេនសម្អាតទាំងអស់'
    );
    return true;
  },

  removeStudentFromGroup: (groupId: string, studentId: string): void => {
    const list: CleaningDutyGroup[] = getItem(STORAGE_KEYS.CLEANING_GROUPS, initialCleaningGroups);
    const target = list.find(g => g.id === groupId);
    if (target) {
      target.studentIds = target.studentIds.filter(id => id !== studentId);
      if (target.groupLeaderId === studentId) {
        target.groupLeaderId = target.studentIds[0] || undefined;
        const students = StorageService.getStudents();
        const leader = students.find(s => s.id === target.groupLeaderId);
        target.groupLeaderName = leader?.nameKhmer || undefined;
      }
      target.updatedAt = new Date().toISOString();
      setItem(STORAGE_KEYS.CLEANING_GROUPS, list);
    }
  },

  autoAssignAllStudentsToDailyGroups: (customStudentIds?: string[]): CleaningDutyGroup[] => {
    const allStudents = StorageService.getStudents();
    const targetStudentIds = customStudentIds && customStudentIds.length > 0 
      ? customStudentIds 
      : allStudents.map(s => s.id);

    const days: CleaningDutyDay[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    const dayNamesKhmer: Record<CleaningDutyDay, string> = {
      MONDAY: 'ក្រុមវេនថ្ងៃច័ន្ទ (ក្រុមទី១)',
      TUESDAY: 'ក្រុមវេនថ្ងៃអង្គារ (ក្រុមទី២)',
      WEDNESDAY: 'ក្រុមវេនថ្ងៃពុធ (ក្រុមទី៣)',
      THURSDAY: 'ក្រុមវេនថ្ងៃព្រហស្បតិ៍ (ក្រុមទី៤)',
      FRIDAY: 'ក្រុមវេនថ្ងៃសុក្រ (ក្រុមទី៥)'
    };

    const newGroups: CleaningDutyGroup[] = days.map((day, idx) => {
      // Distribute all students evenly into 5 groups (Mon to Fri)
      const groupStudentIds = targetStudentIds.filter((_, i) => i % 5 === idx);
      const leaderStudent = allStudents.find(s => s.id === groupStudentIds[0]);

      return {
        id: `GRP-ALL-${day}`,
        classId: 'ALL',
        className: 'សិស្សទាំងអស់',
        dayOfWeek: day,
        groupNameKhmer: dayNamesKhmer[day],
        groupNameEnglish: `${day} Cleaning Crew`,
        groupLeaderId: leaderStudent?.id,
        groupLeaderName: leaderStudent?.nameKhmer,
        studentIds: groupStudentIds,
        tasks: ['បោស និងជូតកម្រាលបន្ទប់រៀន', 'ជូតក្តារខៀន និងរៀបចំតុគ្រូ', 'រៀបចំតុសិស្សឱ្យត្រង់ជួរ', 'យកធុងសំរាមទៅចាក់'],
        notes: `ក្រុមវេនប្រចាំ${dayNamesKhmer[day]} បែងចែកដោយស្វ័យប្រវត្តិ`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    setItem(STORAGE_KEYS.CLEANING_GROUPS, newGroups);

    StorageService.addAuditLog(
      'វេនសម្អាតថ្នាក់ (Cleaning Duty)',
      'បែងចែកក្រុមវេនស្វ័យប្រវត្តិ',
      `បានបែងចែកសិស្ស ${targetStudentIds.length} នាក់ជា ៥ ក្រុមពីថ្ងៃច័ន្ទ ដល់ថ្ងៃសុក្រ`
    );

    return newGroups;
  },

  autoAssignClassToDailyGroups: (classId: string, customStudentIds?: string[]): CleaningDutyGroup[] => {
    let allGroups: CleaningDutyGroup[] = getItem(STORAGE_KEYS.CLEANING_GROUPS, initialCleaningGroups);
    // Remove existing groups for this class
    allGroups = allGroups.filter(g => g.classId !== classId);

    const students = StorageService.getStudents().filter(s => s.classId === classId);
    const classObj = StorageService.getClasses().find(c => c.id === classId);
    const className = classObj?.name || 'ថ្នាក់រៀន';

    const targetStudentIds = customStudentIds && customStudentIds.length > 0 
      ? customStudentIds 
      : students.map(s => s.id);

    const days: CleaningDutyDay[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    const dayNamesKhmer: Record<CleaningDutyDay, string> = {
      MONDAY: 'ក្រុមវេនថ្ងៃច័ន្ទ (ក្រុមទី១)',
      TUESDAY: 'ក្រុមវេនថ្ងៃអង្គារ (ក្រុមទី២)',
      WEDNESDAY: 'ក្រុមវេនថ្ងៃពុធ (ក្រុមទី៣)',
      THURSDAY: 'ក្រុមវេនថ្ងៃព្រហស្បតិ៍ (ក្រុមទី៤)',
      FRIDAY: 'ក្រុមវេនថ្ងៃសុក្រ (ក្រុមទី៥)'
    };

    const newGroups: CleaningDutyGroup[] = days.map((day, idx) => {
      // Distribute students evenly into 5 groups (Mon to Fri)
      const groupStudentIds = targetStudentIds.filter((_, i) => i % 5 === idx);
      const leaderStudent = students.find(s => s.id === groupStudentIds[0]);

      return {
        id: `GRP-${classId}-${day}`,
        classId,
        className,
        dayOfWeek: day,
        groupNameKhmer: dayNamesKhmer[day],
        groupNameEnglish: `${day} Cleaning Crew`,
        groupLeaderId: leaderStudent?.id,
        groupLeaderName: leaderStudent?.nameKhmer,
        studentIds: groupStudentIds,
        tasks: ['បោស និងជូតកម្រាលបន្ទប់រៀន', 'ជូតក្តារខៀន និងរៀបចំតុគ្រូ', 'រៀបចំតុសិស្សឱ្យត្រង់ជួរ', 'យកធុងសំរាមទៅចាក់'],
        notes: `ក្រុមវេនប្រចាំ${dayNamesKhmer[day]} បែងចែកដោយស្វ័យប្រវត្តិ`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    allGroups.push(...newGroups);
    setItem(STORAGE_KEYS.CLEANING_GROUPS, allGroups);

    StorageService.addAuditLog(
      'វេនសម្អាតថ្នាក់ (Cleaning Duty)',
      'បែងចែកក្រុមវេនស្វ័យប្រវត្តិ',
      `បានបែងចែកសិស្ស ${targetStudentIds.length} នាក់ជា ៥ ក្រុមពីថ្ងៃច័ន្ទ ដល់ថ្ងៃសុក្រ សម្រាប់ ${className}`
    );

    return newGroups;
  },

  // Cleaning Duty Records & Score (+20 for Cleaned, -20 for Not Cleaned)
  getCleaningRecords: (classId?: string, date?: string, studentId?: string): CleaningDutyRecord[] => {
    let list: CleaningDutyRecord[] = getItem(STORAGE_KEYS.CLEANING_RECORDS, initialCleaningRecords);
    if (classId) list = list.filter(r => r.classId === classId);
    if (date) list = list.filter(r => r.date === date);
    if (studentId) list = list.filter(r => r.studentId === studentId);
    return list;
  },

  saveCleaningRecord: (recordData: Partial<CleaningDutyRecord>): CleaningDutyRecord => {
    const list: CleaningDutyRecord[] = getItem(STORAGE_KEYS.CLEANING_RECORDS, initialCleaningRecords);
    const now = new Date().toISOString();

    // Determine scoreChange automatically according to rules:
    // If CLEANED -> +20
    // If NOT_CLEANED -> -20
    // If EXCUSED or PENDING -> 0
    let calculatedScore = 0;
    if (recordData.status === 'CLEANED') calculatedScore = 20;
    else if (recordData.status === 'NOT_CLEANED') calculatedScore = -20;
    else calculatedScore = 0;

    // Check if record exists for same student, class and date
    const existingIndex = list.findIndex(r => 
      (recordData.id && r.id === recordData.id) ||
      (r.studentId === recordData.studentId && r.date === recordData.date && r.classId === recordData.classId)
    );

    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...list[existingIndex],
        ...recordData,
        scoreChange: calculatedScore,
        timestamp: now
      } as CleaningDutyRecord;
      setItem(STORAGE_KEYS.CLEANING_RECORDS, list);
      return list[existingIndex];
    } else {
      const newRecord: CleaningDutyRecord = {
        id: recordData.id || `REC-CLN-${recordData.date || new Date().toISOString().split('T')[0]}-${recordData.studentId || Date.now()}`,
        date: recordData.date || new Date().toISOString().split('T')[0],
        dayOfWeek: recordData.dayOfWeek || 'MONDAY',
        classId: recordData.classId || 'CLS-12A',
        className: recordData.className || 'ថ្នាក់រៀន',
        groupId: recordData.groupId,
        groupName: recordData.groupName,
        studentId: recordData.studentId || '',
        studentCode: recordData.studentCode || '',
        studentNameKhmer: recordData.studentNameKhmer || '',
        studentGender: recordData.studentGender,
        studentPhoto: recordData.studentPhoto,
        status: recordData.status || 'PENDING',
        scoreChange: calculatedScore,
        inspectorName: recordData.inspectorName || 'គ្រូបន្ទុកថ្នាក់',
        notes: recordData.notes || '',
        timestamp: now
      };
      list.unshift(newRecord);
      setItem(STORAGE_KEYS.CLEANING_RECORDS, list);
      return newRecord;
    }
  },

  bulkSaveCleaningRecords: (records: Partial<CleaningDutyRecord>[]): CleaningDutyRecord[] => {
    const saved: CleaningDutyRecord[] = [];
    records.forEach(r => {
      saved.push(StorageService.saveCleaningRecord(r));
    });
    return saved;
  },

  deleteCleaningRecord: (id: string): void => {
    const list: CleaningDutyRecord[] = getItem(STORAGE_KEYS.CLEANING_RECORDS, initialCleaningRecords);
    const filtered = list.filter(r => r.id !== id);
    setItem(STORAGE_KEYS.CLEANING_RECORDS, filtered);
  },

  getStudentCleaningScoreSummary: (studentId: string): {
    totalScore: number;
    cleanedCount: number;
    missedCount: number;
    excusedCount: number;
    history: CleaningDutyRecord[];
  } => {
    const records = StorageService.getCleaningRecords(undefined, undefined, studentId);
    let totalScore = 0;
    let cleanedCount = 0;
    let missedCount = 0;
    let excusedCount = 0;

    records.forEach(r => {
      totalScore += r.scoreChange;
      if (r.status === 'CLEANED') cleanedCount++;
      else if (r.status === 'NOT_CLEANED') missedCount++;
      else if (r.status === 'EXCUSED') excusedCount++;
    });

    return {
      totalScore,
      cleanedCount,
      missedCount,
      excusedCount,
      history: records
    };
  },

  getAllStudentsCleaningScores: (classId?: string) => {
    const students = StorageService.getStudents().filter(s => !classId || s.classId === classId);
    const records = StorageService.getCleaningRecords(classId);

    return students.map(st => {
      const stRecords = records.filter(r => r.studentId === st.id);
      let totalScore = 0;
      let cleanedCount = 0;
      let missedCount = 0;
      let excusedCount = 0;

      stRecords.forEach(r => {
        totalScore += r.scoreChange;
        if (r.status === 'CLEANED') cleanedCount++;
        else if (r.status === 'NOT_CLEANED') missedCount++;
        else if (r.status === 'EXCUSED') excusedCount++;
      });

      const totalDutyEvents = cleanedCount + missedCount;
      const rate = totalDutyEvents > 0 ? Math.round((cleanedCount / totalDutyEvents) * 100) : 100;

      return {
        studentId: st.id,
        studentNameKhmer: st.nameKhmer,
        studentNameEnglish: st.nameEnglish,
        studentCode: st.studentCode,
        gender: st.gender,
        photo: st.photo,
        time_study: st.time_study || st.timeStudy || '',
        classId: st.classId,
        className: st.className,
        totalScore,
        cleanedCount,
        missedCount,
        excusedCount,
        rate,
        totalDutyEvents
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  },

  // Export and Import Database
  exportFullBackup: (): string => {
    const backup: Record<string, any> = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      backup[name] = getItem(key, null);
    });
    return JSON.stringify(backup, null, 2);
  },
  importFullBackup: (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
        if (parsed[name] !== undefined) {
          setItem(key, parsed[name]);
        }
      });
      if (parsed.BOOKS) {
        setItem(PERMANENT_VAULT_KEYS.BOOKS, parsed.BOOKS);
      }
      if (parsed.BORROWS) {
        setItem(PERMANENT_VAULT_KEYS.BORROWS, parsed.BORROWS);
      }
      return true;
    } catch {
      return false;
    }
  },
  importBackup: (jsonString: string): boolean => {
    return StorageService.importFullBackup(jsonString);
  },
  cleanUpStorageQuota: () => {
    cleanUpStorageQuota();
  },

  // Aliases for compatibility
  getSchoolProfile: (): SchoolProfile => StorageService.getProfile(),
  saveSchoolProfile: (p: SchoolProfile) => StorageService.saveProfile(p),
  resetToDemo: () => StorageService.resetToDefaults(),
  savePayment: (p: PaymentRecord) => StorageService.recordPayment(p),
  saveAttendanceBatch: (records: AttendanceRecord[]) => StorageService.saveAttendanceBulk(records),
  saveGradesBatch: (records: GradeRecord[]) => {
    records.forEach(g => StorageService.saveGrade(g as any));
  },
  markNotificationsAsRead: () => StorageService.markAllNotificationsRead()
};

export const storageService = StorageService;
