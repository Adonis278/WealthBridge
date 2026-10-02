'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { USER_SCHEMA_VERSION } from '@/lib/schema';

/**
 * Firestore is loaded on demand rather than imported at the top of this file.
 * AuthProvider lives in the root layout, so a static import here would put
 * ~249KB of Firestore on every page — including ones that never read data,
 * like /terms and /login.
 */
async function loadFirestore() {
  const [fs, { db }] = await Promise.all([
    import('firebase/firestore'),
    import('@/lib/firestore'),
  ]);
  return { ...fs, db };
}

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: ConfirmationResult;
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  setupRecaptcha: (phoneNumber: string) => Promise<ConfirmationResult>;
  verifyOTP: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

  /**
   * Create the user document on first sign-in, and on every later sign-in
   * touch ONLY identity + login fields.
   *
   * Two things this must never do:
   *  - rewrite `createdAt` (the rules pin it immutable after create)
   *  - rewrite level/points/streak/achievements (that would reset the user's
   *    progress on every single login)
   */
  const ensureUserProfile = async (activeUser: User) => {
    try {
      const { doc, getDoc, setDoc, updateDoc, serverTimestamp, db } = await loadFirestore();

      const userRef = doc(db, 'users', activeUser.uid);
      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) {
        await setDoc(userRef, {
          uid: activeUser.uid,
          schemaVersion: USER_SCHEMA_VERSION,
          email: activeUser.email ?? '',
          displayName: activeUser.displayName ?? '',
          photoURL: activeUser.photoURL ?? '',
          bio: '',
          location: '',
          level: 1,
          points: 0,
          streak: 0,
          treeGrowth: 0,
          achievements: [],
          preferences: {
            notifications: true,
            emailUpdates: true,
            darkMode: false,
          },
          createdAt: serverTimestamp(),
          lastLoginDate: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return;
      }

      await updateDoc(userRef, {
        uid: activeUser.uid,
        schemaVersion: USER_SCHEMA_VERSION,
        email: activeUser.email ?? '',
        displayName: activeUser.displayName ?? snapshot.data().displayName ?? '',
        lastLoginDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn('Unable to update user profile record:', error);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initAuth = async () => {
      try {
        await setPersistence(auth, browserSessionPersistence);
      } catch (error) {
        console.warn('Could not apply session persistence:', error);
      }

      unsubscribe = onAuthStateChanged(auth, async (activeUser) => {
        setUser(activeUser);
        if (activeUser) {
          await ensureUserProfile(activeUser);
        }
        setLoading(false);
      });
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    let idleTimer: ReturnType<typeof setTimeout>;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        signOut(auth).catch((error) => console.warn('Idle timeout sign-out failed:', error));
      }, SESSION_IDLE_TIMEOUT_MS);
    };

    const events: Array<keyof WindowEventMap> = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach((event) => window.removeEventListener(event, resetIdleTimer));
    };
  }, [user]);

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name, then let ensureUserProfile seed the Firestore doc so
    // creation lives in exactly one place (and stamps schemaVersion).
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
      await ensureUserProfile(userCredential.user);
    }
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    if (credential.user) {
      await ensureUserProfile(credential.user);
    }
  };

  const setupRecaptcha = async (phoneNumber: string): Promise<ConfirmationResult> => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          // Reset reCAPTCHA if expired
          window.recaptchaVerifier?.clear();
          window.recaptchaVerifier = undefined as unknown as RecaptchaVerifier;
        },
      });
    }
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  };

  const verifyOTP = async (otp: string) => {
    if (window.confirmationResult) {
      const credential = await window.confirmationResult.confirm(otp);
      if (credential.user) {
        await ensureUserProfile(credential.user);
      }
    } else {
      throw new Error('No confirmation result found. Please request OTP again.');
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    setupRecaptcha,
    verifyOTP,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
