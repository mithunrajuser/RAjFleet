import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { UserProfile, UserRole, UserStatus } from '../types';
import { FIRESTORE_COLLECTIONS } from '../constants';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isRider: boolean;
  signInWithGoogle: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Firebase Error Handler
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const path = `users/${firebaseUser.uid}`;
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            console.warn("User authenticated but profile node missing in Firestore.");
            setProfile(null);
          }
        } catch (e) {
          console.error("Critical Auth Profile Load Fail:", e);
          // Don't throw here to avoid white-screening the entire app
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (role: UserRole) => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, 'users', result.user.uid);
      let userDoc;
      try {
        userDoc = await getDoc(userRef);
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, `users/${result.user.uid}`);
        return;
      }
      
      if (!userDoc.exists()) {
        const newProfile: UserProfile = {
          uid: result.user.uid,
          role,
          displayName: result.user.displayName || 'User',
          email: result.user.email || '',
          status: UserStatus.ACTIVE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        try {
          await setDoc(userRef, newProfile);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `users/${result.user.uid}`);
        }
        setProfile(newProfile);

        if (role === UserRole.ADMIN) {
           try {
             await setDoc(doc(db, 'admins', result.user.uid), {
               email: result.user.email,
               assignedAt: Timestamp.now()
             });
           } catch (e) {
             handleFirestoreError(e, OperationType.WRITE, `admins/${result.user.uid}`);
           }
        }
      } else {
        setProfile(userDoc.data() as UserProfile);
      }
      toast.success("Identity Verified. Access Granted.");
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.error(error);
      toast.error(error.message || "Authentication Failed");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      toast.info("Session Terminated.");
    } catch (e) {
      toast.error("Logout failed");
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === UserRole.ADMIN,
    isRider: profile?.role === UserRole.RIDER,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
