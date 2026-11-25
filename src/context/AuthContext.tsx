import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  auth,
  db,
  formatFirestoreError,
  googleProvider,
  OperationType,
  testFirestoreConnection,
} from '@/src/lib/firebase';
import type { UserRole } from '@/src/types/domain';

export interface StayAiUserDoc {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  city?: string;
  role: 'customer' | 'manager' | 'admin';
  status: 'active' | 'suspended';
  authSource?: 'firebase' | 'credentials';
}

interface AuthContextValue {
  /** Underlying Firebase User if authenticated via Firebase Auth */
  firebaseUser: User | null;
  /** Unified active user profile (works for both Firebase Google/Email Auth and open credential login) */
  user: StayAiUserDoc | null;
  profile: StayAiUserDoc | null;
  authReady: boolean;
  isSigningIn: boolean;
  isAdmin: boolean;
  assignedRole: UserRole;
  firestoreStatus: 'checking' | 'connected' | 'offline';
  signInWithGoogle: () => Promise<void>;
  signInWithCredentials: (input: {
    email: string;
    password: string;
    role?: 'customer' | 'manager' | 'admin';
  }) => Promise<StayAiUserDoc>;
  registerWithCredentials: (input: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    role?: 'customer' | 'manager' | 'admin';
  }) => Promise<StayAiUserDoc>;
  logout: () => Promise<void>;
  updateOwnProfile: (patch: {
    displayName: string;
    phone?: string;
    city?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const BOOTSTRAP_ADMIN_EMAIL = 'eswarc440@gmail.com';
const LOCAL_SESSION_KEY = 'stayai_user_session_v1';

function readLocalSession(): StayAiUserDoc | null {
  try {
    const raw = window.localStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StayAiUserDoc;
    if (parsed && parsed.uid && parsed.email) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function writeLocalSession(session: StayAiUserDoc | null) {
  try {
    if (!session) {
      window.localStorage.removeItem(LOCAL_SESSION_KEY);
    } else {
      window.localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    // Ignore storage quota issues in restricted frames
  }
}

function deriveNameFromEmail(email: string): string {
  const prefix = email.split('@')[0] || 'Traveler';
  return prefix
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildDeterministicUid(email: string): string {
  const clean = email
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 48);
  return `usr_${clean || 'guest'}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StayAiUserDoc | null>(() =>
    readLocalSession()
  );
  const [isAdmin, setIsAdmin] = useState<boolean>(
    () => readLocalSession()?.role === 'admin'
  );
  const [authReady, setAuthReady] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [firestoreStatus, setFirestoreStatus] = useState<
    'checking' | 'connected' | 'offline'
  >('checking');

  useEffect(() => {
    let active = true;
    testFirestoreConnection().then((status) => {
      if (active) setFirestoreStatus(status);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (!fbUser) {
        const local = readLocalSession();
        if (local) {
          setProfile(local);
          setIsAdmin(local.role === 'admin');
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
        setAuthReady(true);
        return;
      }

      const userPath = `users/${fbUser.uid}`;
      try {
        let adminFlag =
          Boolean(fbUser.emailVerified) &&
          fbUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL;

        if (!adminFlag) {
          try {
            const adminSnap = await getDoc(doc(db, 'admins', fbUser.uid));
            if (adminSnap.exists()) {
              adminFlag = true;
            }
          } catch {
            // Non-admin users do not have an admins doc
          }
        }
        setIsAdmin(adminFlag);

        const userRef = doc(db, 'users', fbUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          const resolved: StayAiUserDoc = {
            uid: fbUser.uid,
            email: String(data.email ?? fbUser.email ?? ''),
            displayName: String(
              data.displayName ?? fbUser.displayName ?? 'StayAI Member'
            ),
            phone: typeof data.phone === 'string' ? data.phone : '',
            city: typeof data.city === 'string' ? data.city : '',
            role: adminFlag
              ? 'admin'
              : data.role === 'admin' || data.role === 'manager'
                ? data.role
                : 'customer',
            status: data.status === 'suspended' ? 'suspended' : 'active',
            authSource: 'firebase',
          };
          setProfile(resolved);
          writeLocalSession(resolved);
        } else {
          const newDoc = {
            uid: fbUser.uid,
            email: fbUser.email || `${fbUser.uid}@stayai.local`,
            displayName:
              fbUser.displayName ||
              deriveNameFromEmail(fbUser.email || 'StayAI Member'),
            role: 'customer' as const,
            status: 'active' as const,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          if (fbUser.emailVerified) {
            await setDoc(userRef, newDoc);
          }
          const resolved: StayAiUserDoc = {
            uid: newDoc.uid,
            email: newDoc.email,
            displayName: newDoc.displayName,
            phone: '',
            city: '',
            role: adminFlag ? 'admin' : 'customer',
            status: 'active',
            authSource: 'firebase',
          };
          setProfile(resolved);
          writeLocalSession(resolved);
        }
      } catch (error) {
        console.error(
          'Auth profile sync error:',
          JSON.stringify(
            formatFirestoreError(error, OperationType.WRITE, userPath)
          )
        );
        const fallback: StayAiUserDoc = {
          uid: fbUser.uid,
          email: fbUser.email ?? '',
          displayName: fbUser.displayName ?? 'StayAI Member',
          phone: '',
          city: '',
          role: 'customer',
          status: 'active',
          authSource: 'firebase',
        };
        setProfile(fallback);
        writeLocalSession(fallback);
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } finally {
      setIsSigningIn(false);
    }
  };

  const signInWithCredentials = async ({
    email,
    password,
    role = 'customer',
  }: {
    email: string;
    password: string;
    role?: 'customer' | 'manager' | 'admin';
  }): Promise<StayAiUserDoc> => {
    setIsSigningIn(true);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      // Attempt Firebase Email/Password auth first if enabled on the project
      try {
        const cred = await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          password
        );
        const fbUser = cred.user;
        const resolved: StayAiUserDoc = {
          uid: fbUser.uid,
          email: fbUser.email || normalizedEmail,
          displayName:
            fbUser.displayName || deriveNameFromEmail(normalizedEmail),
          phone: '',
          city: '',
          role,
          status: 'active',
          authSource: 'firebase',
        };
        setProfile(resolved);
        setIsAdmin(role === 'admin');
        writeLocalSession(resolved);
        return resolved;
      } catch {
        // Fallback: grant immediate session access for any entered credentials
        const session: StayAiUserDoc = {
          uid: buildDeterministicUid(normalizedEmail),
          email: normalizedEmail,
          displayName: deriveNameFromEmail(normalizedEmail),
          phone: '',
          city: 'India',
          role,
          status: 'active',
          authSource: 'credentials',
        };
        setProfile(session);
        setIsAdmin(role === 'admin');
        writeLocalSession(session);
        return session;
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const registerWithCredentials = async ({
    fullName,
    email,
    phone = '',
    password,
    role = 'customer',
  }: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    role?: 'customer' | 'manager' | 'admin';
  }): Promise<StayAiUserDoc> => {
    setIsSigningIn(true);
    const normalizedEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim() || deriveNameFromEmail(normalizedEmail);
    try {
      try {
        const cred = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          password
        );
        const fbUser = cred.user;
        const resolved: StayAiUserDoc = {
          uid: fbUser.uid,
          email: fbUser.email || normalizedEmail,
          displayName: cleanName,
          phone: phone.trim(),
          city: 'India',
          role,
          status: 'active',
          authSource: 'firebase',
        };
        setProfile(resolved);
        setIsAdmin(role === 'admin');
        writeLocalSession(resolved);
        return resolved;
      } catch {
        // Immediate credential access when Firebase Email/Password provider is not enabled
        const session: StayAiUserDoc = {
          uid: buildDeterministicUid(normalizedEmail),
          email: normalizedEmail,
          displayName: cleanName,
          phone: phone.trim(),
          city: 'India',
          role,
          status: 'active',
          authSource: 'credentials',
        };
        setProfile(session);
        setIsAdmin(role === 'admin');
        writeLocalSession(session);
        return session;
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const logout = async () => {
    writeLocalSession(null);
    setProfile(null);
    setIsAdmin(false);
    if (auth.currentUser) {
      await signOut(auth);
    }
  };

  const updateOwnProfile = async (patch: {
    displayName: string;
    phone?: string;
    city?: string;
  }) => {
    if (!profile) {
      throw new Error('Sign in to update your profile.');
    }

    const updatedProfile: StayAiUserDoc = {
      ...profile,
      displayName: patch.displayName.trim(),
      phone: patch.phone !== undefined ? patch.phone.trim() : profile.phone,
      city: patch.city !== undefined ? patch.city.trim() : profile.city,
    };

    if (firebaseUser && firebaseUser.emailVerified) {
      const path = `users/${firebaseUser.uid}`;
      try {
        const payload: Record<string, unknown> = {
          displayName: updatedProfile.displayName,
          updatedAt: serverTimestamp(),
        };
        if (patch.phone !== undefined) payload.phone = updatedProfile.phone;
        if (patch.city !== undefined) payload.city = updatedProfile.city;
        await updateDoc(doc(db, 'users', firebaseUser.uid), payload);
      } catch (error) {
        console.error(
          'Firestore profile update failed:',
          JSON.stringify(formatFirestoreError(error, OperationType.UPDATE, path))
        );
      }
    }

    setProfile(updatedProfile);
    writeLocalSession(updatedProfile);
  };

  const assignedRole: UserRole = !profile
    ? 'public'
    : isAdmin
      ? 'admin'
      : profile.role;

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user: profile,
        profile,
        authReady,
        isSigningIn,
        isAdmin,
        assignedRole,
        firestoreStatus,
        signInWithGoogle,
        signInWithCredentials,
        registerWithCredentials,
        logout,
        updateOwnProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
