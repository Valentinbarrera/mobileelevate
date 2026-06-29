/**
 * Hook para manejar sesiones de entrenamiento con datos del Coach
 * Guarda completed_sessions y completed_exercises en Supabase
 * Schema: completed_sessions tiene planned_session_id (required), date, student_id
 *         completed_exercises tiene completed_session_id, routine_exercise_id, series, reps, weight
 */
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getLocalDateString, getStartOfWeekLocal } from "@/lib/date";
import { getUserErrorMessage } from "@/lib/errors";
import { logSet, updateLoggedSet, deleteLoggedSet } from "@/lib/workoutLog";

interface CoachExercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number | null;
  notes: string | null;
  videoUrl: string | null;
  thumbnail: string | null;
  muscleGroup: string | null;
  equipment: string | null;
}

interface CompletedSet {
  setNumber: number;
  weight: number;
  reps: number;
  completedAt: Date;
}

interface CoachWorkoutSession {
  id: string;
  plannedSessionId: string | null;
  routineDayId: string;
  date: string;
}

// Sentinel id for ephemeral (admin/demo) sessions that are never persisted
const LOCAL_SESSION_ID = "local-demo";

export function useCoachWorkoutSession(routineDayId: string, routineId: string) {
  const { student, isAdminMode } = useAuthContext();
  const [session, setSession] = useState<CoachWorkoutSession | null>(null);
  const [loading, setLoading] = useState(false);

  // Ephemeral session: lets the user go through the full workout UI
  // (exercises, sets, rest timer) without persisting anything to the DB.
  const startLocalSession = useCallback(() => {
    const localSession: CoachWorkoutSession = {
      id: LOCAL_SESSION_ID,
      plannedSessionId: null,
      routineDayId,
      date: getLocalDateString(),
    };
    setSession(localSession);
    return localSession;
  }, [routineDayId]);

  const startSession = useCallback(async () => {
    // Admin/demo mode (no real student): run the workout locally
    if (isAdminMode || !student) {
      return startLocalSession();
    }

    setLoading(true);
    try {
      const today = getLocalDateString();

      // Try to find a planned_session for this routine_day and student
      const { data: planned } = await supabase
        .from("planned_sessions")
        .select("id")
        .eq("student_id", student.id)
        .eq("routine_day_id", routineDayId)
        .eq("date", today)
        .maybeSingle();

      let plannedSessionId = planned?.id || null;

      // If no planned session exists, create one
      if (!plannedSessionId) {
        // Get the assignment_id for this routine
        const { data: assignment } = await supabase
          .from("routine_assignments")
          .select("id")
          .eq("student_id", student.id)
          .eq("routine_id", routineId)
          .eq("status", "active")
          .maybeSingle();

        if (assignment) {
          const { data: newPlanned, error: planError } = await supabase
            .from("planned_sessions")
            .insert({
              student_id: student.id,
              routine_day_id: routineDayId,
              assignment_id: assignment.id,
              date: today,
            })
            .select()
            .single();

          if (!planError && newPlanned) {
            plannedSessionId = newPlanned.id;
          }
        }
      }

      if (!plannedSessionId) {
        if (import.meta.env.DEV) console.warn("Could not find or create planned session — running in local mode");
        toast.info("Entrenamiento en modo prueba (no se guardará el progreso)");
        return startLocalSession();
      }

      const { data, error } = await supabase
        .from("completed_sessions")
        .insert({
          student_id: student.id,
          planned_session_id: plannedSessionId,
          date: today,
        })
        .select()
        .single();

      if (error) throw error;

      const newSession: CoachWorkoutSession = {
        id: data.id,
        plannedSessionId,
        routineDayId,
        date: today,
      };

      setSession(newSession);
      return newSession;
    } catch (error) {
      if (import.meta.env.DEV) console.warn("Error starting session — running in local mode:", error);
      toast.info("Entrenamiento en modo prueba (no se guardará el progreso)");
      return startLocalSession();
    } finally {
      setLoading(false);
    }
  }, [student, isAdminMode, routineDayId, routineId, startLocalSession]);

  const completeSet = useCallback(async (
    exercise: CoachExercise,
    setNumber: number,
    weight: number,
    reps: number,
    _difficulty: string
  ): Promise<CompletedSet | null> => {
    if (!session) {
      if (import.meta.env.DEV) console.error("No active session");
      return null;
    }

    // Guardado LOCAL siempre: alimenta "la vez pasada", PRs e historial,
    // persista o no en la base.
    const localStudentId = student?.id || (isAdminMode ? "admin" : "anon");
    logSet(localStudentId, {
      exerciseId: exercise.id,
      date: session.date,
      setNumber,
      weight,
      reps,
    });

    // Demo/admin session: ya quedó guardado local, no tocamos la base
    if (session.id === LOCAL_SESSION_ID) {
      return { setNumber, weight, reps, completedAt: new Date() };
    }

    try {
      const tonnage = weight * reps;
      const { error } = await supabase
        .from("completed_exercises")
        .insert({
          completed_session_id: session.id,
          routine_exercise_id: exercise.id,
          series: setNumber,
          reps,
          weight: weight || null,
          tonnage: tonnage || null,
        })
        .select()
        .single();

      if (error) {
        if (import.meta.env.DEV) console.warn("Error saving set:", error);
        toast.error("Error al guardar la serie");
        return null;
      }

      return {
        setNumber,
        weight,
        reps,
        completedAt: new Date(),
      };
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error completing set:", error);
      toast.error(getUserErrorMessage(error, "Error al guardar la serie"));
      return null;
    }
  }, [session, student, isAdminMode]);

  // Editar una serie ya cargada (modificar kg/reps sobre la marcha)
  const updateSet = useCallback(async (
    exerciseId: string,
    setNumber: number,
    weight: number,
    reps: number
  ): Promise<boolean> => {
    if (!session) return false;

    const localStudentId = student?.id || (isAdminMode ? "admin" : "anon");
    updateLoggedSet(localStudentId, exerciseId, session.date, setNumber, { weight, reps });

    if (session.id === LOCAL_SESSION_ID) return true;

    try {
      const tonnage = weight * reps;
      const { error } = await supabase
        .from("completed_exercises")
        .update({ reps, weight: weight || null, tonnage: tonnage || null })
        .eq("completed_session_id", session.id)
        .eq("routine_exercise_id", exerciseId)
        .eq("series", setNumber);

      if (error) {
        if (import.meta.env.DEV) console.warn("Error updating set:", error);
        toast.error("Error al actualizar la serie");
        return false;
      }
      return true;
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error updating set:", error);
      toast.error(getUserErrorMessage(error, "Error al actualizar la serie"));
      return false;
    }
  }, [session, student, isAdminMode]);

  // Borrar una serie ya cargada (deshacer / volver atrás)
  const deleteSet = useCallback(async (
    exerciseId: string,
    setNumber: number
  ): Promise<boolean> => {
    if (!session) return false;

    const localStudentId = student?.id || (isAdminMode ? "admin" : "anon");
    deleteLoggedSet(localStudentId, exerciseId, session.date, setNumber);

    if (session.id === LOCAL_SESSION_ID) return true;

    try {
      const { error } = await supabase
        .from("completed_exercises")
        .delete()
        .eq("completed_session_id", session.id)
        .eq("routine_exercise_id", exerciseId)
        .eq("series", setNumber);

      if (error) {
        if (import.meta.env.DEV) console.warn("Error deleting set:", error);
        toast.error("Error al borrar la serie");
        return false;
      }
      return true;
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error deleting set:", error);
      toast.error(getUserErrorMessage(error, "Error al borrar la serie"));
      return false;
    }
  }, [session, student, isAdminMode]);

  const finishSession = useCallback(async (
    totalDurationSeconds: number,
    notes?: string
  ) => {
    if (!session) return null;

    // Demo/admin session: nothing was persisted, just celebrate locally
    if (session.id === LOCAL_SESSION_ID) {
      toast.success("¡Entrenamiento completado! (modo demo, no se guardó)");
      return { id: LOCAL_SESSION_ID };
    }

    try {
      // Calculate total tonnage from completed exercises
      const { data: exercises } = await supabase
        .from("completed_exercises")
        .select("tonnage")
        .eq("completed_session_id", session.id);

      const totalTonnage = (exercises || []).reduce(
        (acc, e) => acc + (e.tonnage || 0), 0
      );

      const { data, error } = await supabase
        .from("completed_sessions")
        .update({
          notes: notes || null,
          total_tonnage: totalTonnage || null,
          duration_seconds: totalDurationSeconds || null,
        })
        .eq("id", session.id)
        .select()
        .single();

      if (error) throw error;

      toast.success("¡Entrenamiento completado!");
      return data;
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error finishing session:", error);
      toast.error(getUserErrorMessage(error, "Error al finalizar la sesión"));
      return null;
    }
  }, [session]);

  return {
    session,
    loading,
    startSession,
    completeSet,
    updateSet,
    deleteSet,
    finishSession,
  };
}

export function useCoachWeeklyProgress() {
  const { student } = useAuthContext();

  const getWeeklyProgress = useCallback(async () => {
    if (!student) return { completedDays: 0, totalDays: 5 };

    try {
      const startDate = getLocalDateString(getStartOfWeekLocal());

      const { data: sessions, error } = await supabase
        .from("completed_sessions")
        .select("id, date")
        .eq("student_id", student.id)
        .gte("date", startDate);

      if (error) throw error;

      const completedDates = new Set(
        (sessions || []).map(s => s.date)
      );

      return {
        completedDays: completedDates.size,
        totalDays: 5,
        sessions: sessions || [],
      };
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error fetching weekly progress:", error);
      return { completedDays: 0, totalDays: 5 };
    }
  }, [student]);

  return { getWeeklyProgress };
}
