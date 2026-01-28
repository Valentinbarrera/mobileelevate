/**
 * Context para compartir el estado de autenticación del Coach
 * a través de toda la aplicación
 */
import React, { createContext, useContext, ReactNode } from 'react';
import { useCoachAuth } from '@/hooks/useCoachAuth';
import type { User, Session } from '@supabase/supabase-js';
import type { Student } from '@/integrations/coach/types';

interface CoachAuthContextValue {
  user: User | null;
  session: Session | null;
  student: Student | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const CoachAuthContext = createContext<CoachAuthContextValue | undefined>(undefined);

export function CoachAuthProvider({ children }: { children: ReactNode }) {
  const auth = useCoachAuth();

  return (
    <CoachAuthContext.Provider value={auth}>
      {children}
    </CoachAuthContext.Provider>
  );
}

export function useCoachAuthContext() {
  const context = useContext(CoachAuthContext);
  if (context === undefined) {
    throw new Error('useCoachAuthContext must be used within a CoachAuthProvider');
  }
  return context;
}
