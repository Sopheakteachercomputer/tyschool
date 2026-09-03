import { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, FirebaseAuthService, ensureLocalPersistence } from '../services/firebase';

export interface UseFirebaseAuthPersistenceResult {
  firebaseUser: FirebaseUser | null;
  isAuthInitializing: boolean;
  isPersistenceReady: boolean;
  authError: Error | null;
  refreshUser: () => Promise<FirebaseUser | null>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  linkGoogleAccount: () => Promise<{ success: boolean; user?: FirebaseUser | null; error?: string | null }>;
  unlinkGoogleAccount: () => Promise<{ success: boolean; user?: FirebaseUser | null; error?: string | null }>;
}

/**
 * Custom React hook for robust Firebase Auth state persistence.
 * Guarantees browserLocalPersistence is active and manages authentication
 * state transitions seamlessly across full-page reloads and browser restarts.
 */
export function useFirebaseAuthPersistence(): UseFirebaseAuthPersistenceResult {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(() => auth.currentUser);
  const [isAuthInitializing, setIsAuthInitializing] = useState<boolean>(true);
  const [isPersistenceReady, setIsPersistenceReady] = useState<boolean>(false);
  const [authError, setAuthError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Establish browserLocalPersistence
    const initializePersistence = async () => {
      try {
        const ready = await ensureLocalPersistence();
        if (isMounted) {
          setIsPersistenceReady(ready);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Firebase Auth persistence initialization warning:', err);
          setAuthError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    };

    initializePersistence();

    // 2. Subscribe to Firebase Auth state transitions
    const unsubscribe = FirebaseAuthService.onAuthChanged((user) => {
      if (isMounted) {
        setFirebaseUser(user);
        setIsAuthInitializing(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const refreshUser = useCallback(async (): Promise<FirebaseUser | null> => {
    try {
      const refreshed = await FirebaseAuthService.reloadUser();
      setFirebaseUser(refreshed);
      return refreshed;
    } catch (err: any) {
      console.warn('Error refreshing Firebase user in hook:', err);
      return auth.currentUser;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const res = await FirebaseAuthService.signOutFromFirebase();
      setFirebaseUser(null);
      return res;
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  }, []);

  const linkGoogleAccount = useCallback(async () => {
    try {
      const res = await FirebaseAuthService.linkGoogleAccount();
      if (res.success && res.user) {
        setFirebaseUser(res.user);
      }
      return res;
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  }, []);

  const unlinkGoogleAccount = useCallback(async () => {
    try {
      const res = await FirebaseAuthService.unlinkGoogleAccount();
      if (res.success && res.user) {
        setFirebaseUser(res.user);
      }
      return res;
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  }, []);

  return {
    firebaseUser,
    isAuthInitializing,
    isPersistenceReady,
    authError,
    refreshUser,
    signOut,
    linkGoogleAccount,
    unlinkGoogleAccount
  };
}
