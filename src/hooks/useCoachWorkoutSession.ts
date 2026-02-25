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

export function useCoachWorkoutSession(routineDayId: string, routineId: string) {
  const { student } = useAuthContext();
  const [session, setSession] = useState<CoachWorkoutSession | null>(null);
  const [loading, setLoading] = useState(false);

  const startSession = useCallback(async () => {
    if (!student) {
      toast.error("Debés iniciar sesión para entrenar");
      return null;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

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
        if (import.meta.env.DEV) console.error("Could not find or create planned session");
        toast.error("Error al preparar la sesión");
        return null;
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
      if (import.meta.env.DEV) console.error("Error starting session:", error);
      toast.error("Error al iniciar la sesión");
      return null;
    } finally {
      setLoading(false);
    }
  }, [student, routineDayId, routineId]);

  const completeSet = useCallback(async (
    exercise: CoachExercise,
    setNumber: number,
    weight: number,
    reps: number,
    _difficulty: string
  ): Promise<CompletedSet | null> => {
    if (!session || !student) {
      if (import.meta.env.DEV) console.error("No active session");
      return null;
    }

    try {
      const tonnage = weight * reps;
      const { data, error } = await supabase
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
      toast.error("Error al guardar la serie");
      return null;
    }
  }, [session, student]);

  const finishSession = useCallback(async (
    totalDurationSeconds: number,
    notes?: string
  ) => {
    if (!session) return null;

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
        })
        .eq("id", session.id)
        .select()
        .single();

      if (error) throw error;

      toast.success("¡Entrenamiento completado!");
      return data;
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error finishing session:", error);
      toast.error("Error al finalizar la sesión");
      return null;
    }
  }, [session]);

  return {
    session,
    loading,
    startSession,
    completeSet,
    finishSession,
  };
}

export function useCoachWeeklyProgress() {
  const { student } = useAuthContext();

  const getWeeklyProgress = useCallback(async () => {
    if (!student) return { completedDays: 0, totalDays: 5 };

    try {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const startDate = startOfWeek.toISOString().split('T')[0];

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
