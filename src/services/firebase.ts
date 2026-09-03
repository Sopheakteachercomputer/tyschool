import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth, 
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  linkWithPopup,
  unlink,
  GoogleAuthProvider,
  User as FirebaseUser,
  type Auth
} from "firebase/auth";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCDAMriSRJIZts7qT5QCrq_WTysUrgQwYE",
  authDomain: "tyschool-8e14f.firebaseapp.com",
  projectId: "tyschool-8e14f",
  storageBucket: "tyschool-8e14f.firebasestorage.app",
  messagingSenderId: "597970551722",
  appId: "1:597970551722:web:d3272b2476f1f6b25321d3",
  measurementId: "G-LFDRZ1EFB5"
};

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth: Auth = getAuth(app);

// Automatically configure persistent session state using browserLocalPersistence
let persistenceInitialized = false;
export const ensureLocalPersistence = async (): Promise<boolean> => {
  if (persistenceInitialized) return true;
  try {
    if (typeof window !== "undefined") {
      await setPersistence(auth, browserLocalPersistence);
      persistenceInitialized = true;
      console.log("Firebase Auth: browserLocalPersistence active");
      return true;
    }
  } catch (error) {
    console.warn("Firebase Auth setPersistence error (fallback in place):", error);
  }
  return false;
};

// Initial setup attempt at module load in browser
if (typeof window !== "undefined") {
  ensureLocalPersistence().catch(() => {});
}

// Initialize Analytics (optional/graceful)
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Ignore analytics unsupported in some sandbox environments
  });
}

export interface FirebaseAuthErrorDetail {
  khmer: string;
  english: string;
  code?: string;
  type: 'NETWORK' | 'CREDENTIALS' | 'EXISTS' | 'POPUP' | 'SECURITY' | 'UNKNOWN';
  suggestionKhmer?: string;
  suggestionEnglish?: string;
}

export function parseFirebaseAuthError(err: any): FirebaseAuthErrorDetail {
  const code = err?.code || '';
  const msg = err?.message || '';

  if (code === 'auth/network-request-failed' || msg.includes('network') || msg.includes('Failed to fetch')) {
    return {
      khmer: 'មិនអាចភ្ជាប់ទៅកាន់ប្រព័ន្ធ Firebase Auth បានទេ ដោយសារបញ្ហាបណ្តាញ (Network Error)',
      english: 'Unable to connect to Firebase Authentication due to a network connection issue.',
      code: 'auth/network-request-failed',
      type: 'NETWORK',
      suggestionKhmer: 'សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិតរបស់អ្នក ឬសាកល្បងម្តងទៀតនៅពេលបន្តិចក្រោយ។',
      suggestionEnglish: 'Please check your internet connection and try again.'
    };
  }

  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return {
      khmer: 'អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ (Invalid Credentials)',
      english: 'Invalid email or password. Please verify your credentials.',
      code: code || 'auth/invalid-credential',
      type: 'CREDENTIALS',
      suggestionKhmer: 'សូមពិនិត្យអក្ខរាវិរុទ្ធអ៊ីមែល និងពាក្យសម្ងាត់របស់អ្នកឡើងវិញ ឬប្រើមុខងារភ្លេចពាក្យសម្ងាត់។',
      suggestionEnglish: 'Please check for typos in your email and password or use password reset.'
    };
  }

  if (code === 'auth/email-already-in-use') {
    return {
      khmer: 'អ៊ីមែលនេះមានគណនីរួចហើយក្នុងប្រព័ន្ធ (Email Already in Use)',
      english: 'This email address is already associated with an existing account.',
      code: 'auth/email-already-in-use',
      type: 'EXISTS',
      suggestionKhmer: 'សូមចូលប្រើប្រាស់គណនីរបស់អ្នក ឬប្រើអ៊ីមែលផ្សេងទៀតដើម្បីចុះឈ្មោះ។',
      suggestionEnglish: 'Please switch to the Login tab or use a different email address.'
    };
  }

  if (code === 'auth/weak-password') {
    return {
      khmer: 'ពាក្យសម្ងាត់ខ្សោយពេក (Weak Password)',
      english: 'Password is too weak. Must be at least 6 characters.',
      code: 'auth/weak-password',
      type: 'SECURITY',
      suggestionKhmer: 'សូមបញ្ចូលពាក្យសម្ងាត់ដែលមានយ៉ាងតិច ៦ តួអក្សរ។',
      suggestionEnglish: 'Please enter a password with at least 6 characters.'
    };
  }

  if (code === 'auth/invalid-email') {
    return {
      khmer: 'ទម្រង់អាសយដ្ឋានអ៊ីមែលមិនត្រឹមត្រូវ (Invalid Email Format)',
      english: 'The email address format is invalid.',
      code: 'auth/invalid-email',
      type: 'CREDENTIALS',
      suggestionKhmer: 'សូមបញ្ចូលអ៊ីមែលដែលមានទម្រង់ត្រឹមត្រូវ (ឧ. user@domain.com)។',
      suggestionEnglish: 'Please enter a valid email format (e.g. user@domain.com).'
    };
  }

  if (code === 'auth/too-many-requests') {
    return {
      khmer: 'ការប៉ុនប៉ងចូលបរាជ័យច្រើនដងពេក គណនីត្រូវបានទប់ស្កាត់ជាបណ្តោះអាសន្ន (Too Many Requests)',
      english: 'Access to this account has been temporarily disabled due to many failed login attempts.',
      code: 'auth/too-many-requests',
      type: 'SECURITY',
      suggestionKhmer: 'សូមរង់ចាំពីរបីនាទីមុននឹងព្យាយាមម្តងទៀត ឬកំណត់ពាក្យសម្ងាត់ឡើងវិញ។',
      suggestionEnglish: 'Please wait a few minutes before trying again or reset your password.'
    };
  }

  if (code === 'auth/popup-closed-by-user') {
    return {
      khmer: 'ផ្ទាំងផ្ទៀងផ្ទាត់ Google ត្រូវបានបិទមុនពេលបញ្ចប់ (Popup Closed)',
      english: 'Google sign-in popup was closed before completing authentication.',
      code: 'auth/popup-closed-by-user',
      type: 'POPUP',
      suggestionKhmer: 'សូមចុចប៊ូតុង Sign in with Google ម្តងទៀត ហើយបំពេញការផ្ទៀងផ្ទាត់។',
      suggestionEnglish: 'Please click the Google button again and complete the sign-in.'
    };
  }

  if (code === 'auth/popup-blocked') {
    return {
      khmer: 'ផ្ទាំង Pop-up ត្រូវបានទប់ស្កាត់ដោយកម្មវិធីរុករក (Popup Blocked)',
      english: 'The sign-in popup was blocked by your browser settings.',
      code: 'auth/popup-blocked',
      type: 'POPUP',
      suggestionKhmer: 'សូមអនុញ្ញាតឱ្យគេហទំព័រនេះបើក Pop-up នៅក្នុងការកំណត់កម្មវិធីរុករករបស់អ្នក។',
      suggestionEnglish: 'Please allow popups for this site in your browser settings.'
    };
  }

  if (code === 'auth/credential-already-in-use') {
    return {
      khmer: 'គណនី Google នេះត្រូវបានភ្ជាប់ជាមួយគណនី Firebase ផ្សេងទៀតរួចហើយ (Credential Already In Use)',
      english: 'This Google account is already linked with another user account.',
      code: 'auth/credential-already-in-use',
      type: 'EXISTS',
      suggestionKhmer: 'សូមប្រើប្រាស់គណនី Google ផ្សេង ឬចូលដោយផ្ទាល់តាមរយៈគណនី Google នោះ។',
      suggestionEnglish: 'Please select a different Google account or log in directly with that Google account.'
    };
  }

  if (code === 'auth/provider-already-linked') {
    return {
      khmer: 'គណនីនេះបានភ្ជាប់ជាមួយ Google រួចរាល់ហើយ (Provider Already Linked)',
      english: 'Your account is already linked with Google.',
      code: 'auth/provider-already-linked',
      type: 'EXISTS',
      suggestionKhmer: 'គណនី Google របស់អ្នកត្រូវបានតភ្ជាប់រួចជាស្រេច។',
      suggestionEnglish: 'This provider is already connected to your current profile.'
    };
  }

  if (code === 'auth/requires-recent-login') {
    return {
      khmer: 'ប្រតិបត្តិការសុវត្ថិភាពនេះទាមទារឱ្យអ្នកចូលគណនីម្តងទៀតជាមុនសិន (Requires Recent Login)',
      english: 'This sensitive security operation requires recent authentication. Please re-login and try again.',
      code: 'auth/requires-recent-login',
      type: 'SECURITY',
      suggestionKhmer: 'សូមចាកចេញពីគណនី ហើយចូលម្តងទៀតដើម្បីបន្តប្រតិបត្តិការនេះ។',
      suggestionEnglish: 'Please sign out and sign back in before modifying authentication providers.'
    };
  }

  if (code === 'auth/user-disabled') {
    return {
      khmer: 'គណនីនេះត្រូវបានផ្អាកដំណើរការដោយអ្នកគ្រប់គ្រង (Account Disabled)',
      english: 'This account has been disabled by an administrator.',
      code: 'auth/user-disabled',
      type: 'SECURITY',
      suggestionKhmer: 'សូមទាក់ទងរដ្ឋបាលសាលាដើម្បីដោះស្រាយបញ្ហានេះ។',
      suggestionEnglish: 'Please contact the school administration for assistance.'
    };
  }

  return {
    khmer: msg || 'មានបញ្ហាក្នុងការផ្ទៀងផ្ទាត់ជាមួយ Firebase (Authentication Error)',
    english: msg || 'An error occurred during authentication with Firebase.',
    code: code || 'auth/unknown',
    type: 'UNKNOWN',
    suggestionKhmer: 'សូមព្យាយាមម្តងទៀត ឬទាក់ទងផ្នែកបច្ចេកវិទ្យា។',
    suggestionEnglish: 'Please try again or contact technical support.'
  };
}

/**
 * Firebase Authentication Service Wrapper
 * Provides clean helpers matching the app requirements
 */
export const FirebaseAuthService = {
  getAuth: () => auth,
  
  getCurrentFirebaseUser: (): FirebaseUser | null => {
    return auth.currentUser;
  },

  signUpWithFirebase: async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }
      return { success: true, user: userCredential.user, error: null, errorDetail: null };
    } catch (err: any) {
      console.warn("Firebase SignUp notice:", err?.message || err);
      const errorDetail = parseFirebaseAuthError(err);
      return { 
        success: false, 
        user: null, 
        error: errorDetail.khmer,
        code: err?.code,
        errorDetail
      };
    }
  },

  setLocalPersistence: async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      return { success: true };
    } catch (err: any) {
      console.warn("Firebase Auth setPersistence error:", err);
      return { success: false, error: err?.message };
    }
  },

  ensurePersistence: async () => {
    return ensureLocalPersistence();
  },

  signInWithFirebase: async (email: string, password: string) => {
    try {
      await ensureLocalPersistence();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user, error: null, errorDetail: null };
    } catch (err: any) {
      console.warn("Firebase SignIn notice:", err?.message || err);
      const errorDetail = parseFirebaseAuthError(err);
      return { 
        success: false, 
        user: null, 
        error: errorDetail.khmer,
        code: err?.code,
        errorDetail
      };
    }
  },

  signInWithGoogle: async () => {
    try {
      await ensureLocalPersistence();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(auth, provider);
      return { success: true, user: userCredential.user, error: null, errorDetail: null };
    } catch (err: any) {
      console.warn("Firebase Google SignIn notice:", err?.message || err);
      const errorDetail = parseFirebaseAuthError(err);
      return { 
        success: false, 
        user: null, 
        error: errorDetail.khmer,
        code: err?.code,
        errorDetail
      };
    }
  },

  signOutFromFirebase: async () => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (err: any) {
      console.warn("Firebase SignOut notice:", err?.message || err);
      return { success: false, error: err?.message };
    }
  },

  sendPasswordReset: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, error: null, errorDetail: null };
    } catch (err: any) {
      console.warn("Firebase Password Reset notice:", err?.message || err);
      const errorDetail = parseFirebaseAuthError(err);
      return { 
        success: false, 
        error: errorDetail.khmer, 
        code: err?.code,
        errorDetail
      };
    }
  },

  sendVerificationEmail: async (user?: FirebaseUser | null) => {
    const targetUser = user || auth.currentUser;
    if (!targetUser) {
      return {
        success: false,
        error: 'មិនមានគណនី Firebase ដែលកំពុងដំណើរការទេ (No active Firebase user)',
        errorDetail: {
          khmer: 'មិនមានគណនី Firebase ដែលកំពុងដំណើរការទេ',
          english: 'No active Firebase user session found.',
          type: 'CREDENTIALS' as const,
          suggestionKhmer: 'សូមចូលគណនី Firebase របស់អ្នកជាមុនសិន។'
        }
      };
    }
    try {
      await sendEmailVerification(targetUser);
      return { success: true, error: null, errorDetail: null };
    } catch (err: any) {
      console.warn("Firebase Email Verification notice:", err?.message || err);
      const errorDetail = parseFirebaseAuthError(err);
      return { 
        success: false, 
        error: errorDetail.khmer, 
        code: err?.code,
        errorDetail
      };
    }
  },

  linkGoogleAccount: async (user?: FirebaseUser | null) => {
    const targetUser = user || auth.currentUser;
    if (!targetUser) {
      return {
        success: false,
        user: null,
        error: 'មិនមានគណនី Firebase ដែលកំពុងដំណើរការទេ (No active Firebase user)',
        errorDetail: {
          khmer: 'មិនមានគណនី Firebase ដែលកំពុងដំណើរការទេ',
          english: 'No active Firebase user session found.',
          type: 'CREDENTIALS' as const,
          suggestionKhmer: 'សូមចូលគណនី Firebase របស់អ្នកជាមុនសិន។'
        }
      };
    }
    try {
      await ensureLocalPersistence();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await linkWithPopup(targetUser, provider);
      return { 
        success: true, 
        user: userCredential.user, 
        error: null, 
        errorDetail: null 
      };
    } catch (err: any) {
      console.warn("Firebase linkGoogleAccount notice:", err?.message || err);
      const errorDetail = parseFirebaseAuthError(err);
      return { 
        success: false, 
        user: null, 
        error: errorDetail.khmer, 
        code: err?.code,
        errorDetail
      };
    }
  },

  unlinkGoogleAccount: async (user?: FirebaseUser | null) => {
    const targetUser = user || auth.currentUser;
    if (!targetUser) {
      return {
        success: false,
        user: null,
        error: 'មិនមានគណនី Firebase ដែលកំពុងដំណើរការទេ (No active Firebase user)',
        errorDetail: {
          khmer: 'មិនមានគណនី Firebase ដែលកំពុងដំណើរការទេ',
          english: 'No active Firebase user session found.',
          type: 'CREDENTIALS' as const
        }
      };
    }
    try {
      const updatedUser = await unlink(targetUser, 'google.com');
      return { success: true, user: updatedUser, error: null, errorDetail: null };
    } catch (err: any) {
      console.warn("Firebase unlinkGoogleAccount notice:", err?.message || err);
      const errorDetail = parseFirebaseAuthError(err);
      return { 
        success: false, 
        user: null, 
        error: errorDetail.khmer, 
        code: err?.code,
        errorDetail 
      };
    }
  },

  isProviderLinked: (providerId: string, user?: FirebaseUser | null): boolean => {
    const targetUser = user || auth.currentUser;
    if (!targetUser || !targetUser.providerData) return false;
    return targetUser.providerData.some(p => p.providerId === providerId);
  },

  reloadUser: async (user?: FirebaseUser | null) => {
    const targetUser = user || auth.currentUser;
    if (!targetUser) return null;
    try {
      await targetUser.reload();
      return auth.currentUser;
    } catch (err) {
      console.warn("Firebase reloadUser error:", err);
      return auth.currentUser;
    }
  },

  onAuthChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};
