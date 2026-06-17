/**
 * Context de autenticación unificado para alumnos
 * Reemplaza CoachAuthContext - usa un solo Supabase project
 */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, ReactNode } from 'react';
import { useStudentAuth, type Student } from '@/hooks/useStudentAuth';
import type { User, Session, AuthError } from '@supabase/supabase-js';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  student: Student | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ data?: { user: User; session: Session }; error?: AuthError }>;
  signInAsAdmin: () => void;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isAdminMode: boolean;
  hasCoach: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useStudentAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
