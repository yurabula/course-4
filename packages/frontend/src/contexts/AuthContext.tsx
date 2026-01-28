import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useSessionTimer from '../hooks/useSessionTimer.ts';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User,
  signInWithCustomToken
} from 'firebase/auth';
import { auth } from '../config/firebase.ts';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string, gender?: string, age?: number | null) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  currentSession: {
    trainingId: string;
    name: string;
    startTime: string;
  } | null;
  startSession: (trainingId: string, name: string) => void;
  stopSession: () => Promise<void>;
  sessionTimer?: {
    elapsedMs: number;
    minutes: number;
    seconds: number;
    label: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<{
    trainingId: string;
    name: string;
    startTime: string;
  } | null>(() => {
    try {
      const raw = localStorage.getItem('currentSession');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  const sessionTimer = useSessionTimer(currentSession?.startTime);

  const signup = async (email: string, password: string, displayName: string, gender?: string, age?: number | null) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName, gender, age })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Помилка реєстрації');
      }

      if (data.customToken) {
        await signInWithCustomToken(auth, data.customToken);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('Користувача не знайдено');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Невірний пароль');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Невалідний email');
      } else {
        throw new Error('Помилка входу');
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('Користувача не знайдено');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Невалідний email');
      } else {
        throw new Error('Помилка відновлення паролю');
      }
    }
  };


  const updateUserProfile = async (displayName: string, photoURL?: string, gender?: string | null, age?: number | null) => {
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ displayName, photoURL, gender, age })
      });
    } catch (e) {
      console.error('Не вдалося оновити профіль на бекенді', e);
    }

    try {
      await updateProfile(currentUser, { displayName, photoURL: photoURL || currentUser.photoURL });
      setCurrentUser({ ...currentUser });
    } catch (e) {
      console.error('Не вдалося оновити профіль локально', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const startSession = (trainingId: string, name: string) => {
    const session = {
      trainingId,
      name,
      startTime: new Date().toISOString()
    };
    setCurrentSession(session);
    try {
      localStorage.setItem('currentSession', JSON.stringify(session));
    } catch (e) {
    }
  };

  const stopSession = async () => {
    if (!currentSession || !currentUser) return;

    try {
      const endTime = new Date().toISOString();
      const start = new Date(currentSession.startTime).getTime();
      const end = new Date(endTime).getTime();
      const durationMinutes = Math.max(1, Math.round((end - start) / 60000));

      const token = await currentUser.getIdToken();
      await fetch('/api/trainingSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: currentSession.name,
          trainingId: currentSession.trainingId,
          startTime: currentSession.startTime,
          endTime,
          durationMinutes
        })
      });
    } catch (e) {
      console.error('Помилка збереження сесії:', e);
    } finally {
      setCurrentSession(null);
      try { localStorage.removeItem('currentSession'); } catch (e) {}
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile
    ,
    currentSession,
    startSession,
    stopSession
    ,
    sessionTimer
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};