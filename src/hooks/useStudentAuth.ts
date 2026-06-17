/**
 * Hook unificado de autenticación para alumnos
 * Usa el Supabase de Elevate Web (gssgoeaupfssexhliazy)
 * Autentica y fetchea perfil de tabla students
 */
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getUserErrorMessage } from "@/lib/errors";

export interface Student {
  id: string;
  coach_id: string;
  full_name: string;
  email: string;
  status: string;
  goal: string | null;
  level: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  injuries: string | null;
  created_at: string;
  updated_at: string;
}

// Error shown when user is authenticated but not in students table
export const NOT_A_STUDENT_ERROR = 'Tu cuenta no está vinculada a ningún coach. Pedile a tu entrenador que te agregue como alumno.';

const ADMIN_MODE_KEY = 'elevate_admin_mode';

export function useStudentAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(() => localStorage.getItem(ADMIN_MODE_KEY) === 'true');

  const fetchStudentProfile = async (email: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (fetchError) {
        if (import.meta.env.DEV) console.error('Error fetching student profile:', fetchError);
        setError('No se pudo obtener el perfil del alumno');
      } else if (!data) {
        // No student record — user can still access the app without a coach
        setStudent(null);
        setError(null);
      } else {
        setStudent(data as Student);
        setError(null);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error in fetchStudentProfile:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      // Admin mode — skip Supabase auth entirely
      if (isAdminMode) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user?.email) {
          await fetchStudentProfile(session.user.email);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError(getUserErrorMessage(err, "No pudimos verificar tu sesión"));
        setLoading(false);
      }
    };

    void loadSession();

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user?.email) {
          fetchStudentProfile(session.user.email);
        } else {
          setStudent(null);
          setError(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(getUserErrorMessage(signInError, "No pudimos iniciar sesión"));
      setLoading(false);
      return { error: signInError };
    }

    // Explicitly fetch student profile after successful login
    // (onAuthStateChange may not fire if a session already existed in localStorage)
    if (data.user?.email) {
      setUser(data.user);
      setSession(data.session);
      await fetchStudentProfile(data.user.email);
    }

    return { data };
  };

  const signInAsAdmin = () => {
    localStorage.setItem(ADMIN_MODE_KEY, 'true');
    setIsAdminMode(true);
    setLoading(false);
  };

  const signOut = async () => {
    localStorage.removeItem(ADMIN_MODE_KEY);
    setIsAdminMode(false);
    await supabase.auth.signOut();
    setStudent(null);
  };

  return {
    user,
    session,
    student,
    loading,
    error,
    signIn,
    signInAsAdmin,
    signOut,
    isAuthenticated: !!user || isAdminMode,
    isAdminMode,
    hasCoach: !!student,
  };
}
