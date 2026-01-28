/**
 * Hook para manejar la autenticación con el proyecto Coach
 * Usa el mismo email/password que la app Coach
 */
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { coachSupabase } from "@/integrations/coach/client";
import type { Student } from "@/integrations/coach/types";

export function useCoachAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = coachSupabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch student profile when authenticated
        if (session?.user) {
          setTimeout(() => {
            fetchStudentProfile(session.user.id);
          }, 0);
        } else {
          setStudent(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    coachSupabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchStudentProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchStudentProfile = async (userId: string) => {
    try {
      const { data, error: fetchError } = await coachSupabase
        .from('students')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching student profile:', fetchError);
        setError('No se pudo obtener el perfil del alumno');
      } else {
        setStudent(data);
      }
    } catch (err) {
      console.error('Error in fetchStudentProfile:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    const { data, error: signInError } = await coachSupabase.auth.signInWithPassword({
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
    await coachSupabase.auth.signOut();
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
