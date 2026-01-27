import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
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

  // Реєстрація через backend
  const signup = async (email: string, password: string, displayName: string) => {
    try {
      // Викликаємо backend API для створення користувача
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Помилка реєстрації');
      }

      // Автоматичний вхід через custom token
      if (data.customToken) {
        await signInWithCustomToken(auth, data.customToken);
      }
    } catch (error: any) {
      throw error;
    }
  };

  // Вхід
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

  // Вихід
  const logout = async () => {
    await signOut(auth);
  };

  // Відновлення паролю
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

  // Оновлення профілю
  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (currentUser) {
      await updateProfile(currentUser, {
        displayName,
        photoURL: photoURL || currentUser.photoURL
      });
      // Оновити стан
      setCurrentUser({ ...currentUser });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};