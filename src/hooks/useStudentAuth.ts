/**
 * Hook unificado de autenticación para alumnos
 * Usa el Supabase de Elevate Web (gssgoeaupfssexhliazy)
 * Autentica y fetchea perfil de tabla students
 */
import { useState, useEffect, useRef } from "react";
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
  // Guarda el user.id cuyo perfil ya buscamos, para evitar refetch innecesario en TOKEN_REFRESHED
  const fetchedUserIdRef = useRef<string | null>(null);

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
    // Fuente única de verdad de la sesión: onAuthStateChange.
    // Al suscribirnos, Supabase dispara INITIAL_SESSION con la sesión persistida,
    // así que ya NO llamamos getSession()/fetchStudentProfile por separado (evita fetch duplicado).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Logout: limpiar estado
        if (event === 'SIGNED_OUT') {
          fetchedUserIdRef.current = null;
          setStudent(null);
          setError(null);
          setLoading(false);
          return;
        }

        // Refresh de token (~cada 1h): si ya tenemos el perfil del mismo usuario,
        // solo actualizamos sesión/token (arriba) y NO refetcheamos.
        if (
          event === 'TOKEN_REFRESHED' &&
          session?.user?.id &&
          fetchedUserIdRef.current === session.user.id
        ) {
          return;
        }

        if (session?.user?.email) {
          // Diferimos el fetch fuera del callback (patrón recomendado por Supabase
          // para no invocar al cliente dentro del propio callback → evita deadlocks).
          const email = session.user.email;
          const uid = session.user.id;
          fetchedUserIdRef.current = uid;
          setTimeout(() => {
            void fetchStudentProfile(email);
          }, 0);
        } else {
          fetchedUserIdRef.current = null;
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

    // No fetcheamos el perfil acá: signInWithPassword dispara el evento SIGNED_IN,
    // y el callback de onAuthStateChange se encarga del único fetch (evita duplicado).
    // loading queda en true hasta que ese fetch resuelva (finally de fetchStudentProfile).
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
