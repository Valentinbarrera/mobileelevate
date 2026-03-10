/**
 * Hook unificado de autenticación para alumnos
 * Usa el Supabase de Elevate Web (gssgoeaupfssexhliazy)
 * Autentica y fetchea perfil de tabla students
 */
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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

export function useStudentAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(NOT_A_STUDENT_ERROR);
        setStudent(null);
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
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        fetchStudentProfile(session.user.email);
      } else {
        setLoading(false);
      }
    });

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
      setError(signInError.message);
      setLoading(false);
      return { error: signInError };
    }

    return { data };
  };

  const signOut = async () => {
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
    signOut,
    isAuthenticated: !!user && !!student,
  };
}
