/**
 * Hook para manejar sesiones de entrenamiento con datos del Coach
 * Guarda completed_sessions y completed_exercises en Supabase
 */
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import type { DifficultyLevel } from "@/types/database";
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
  difficulty: DifficultyLevel;
  completedAt: Date;
  isPR?: boolean;
}

interface CoachWorkoutSession {
  id: string;
  routineDayId: string;
  routineId: string;
  startedAt: Date;
  completedAt?: Date;
  totalDurationSeconds?: number;
}

export function useCoachWorkoutSession(routineDayId: string, routineId: string) {
  const { student } = useAuthContext();
  const [session, setSession] = useState<CoachWorkoutSession | null>(null);
  const [loading, setLoading] = useState(false);

  // Start a new workout session
  const startSession = useCallback(async () => {
    if (!student) {
      toast.error("Debés iniciar sesión para entrenar");
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("completed_sessions")
        .insert({
          student_id: student.id,
          routine_day_id: routineDayId,
          routine_id: routineId,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const newSession: CoachWorkoutSession = {
        id: data.id,
        routineDayId,
        routineId,
        startedAt: new Date(data.started_at),
      };

      setSession(newSession);
      return newSession;
    } catch (error) {
      console.error("Error starting session:", error);
      toast.error("Error al iniciar la sesión");
      return null;
    } finally {
      setLoading(false);
    }
  }, [student, routineDayId, routineId]);

  // Complete a set and save it
  const completeSet = useCallback(async (
    exercise: CoachExercise,
    setNumber: number,
    weight: number,
    reps: number,
    difficulty: DifficultyLevel
  ): Promise<CompletedSet | null> => {
    if (!session || !student) {
      console.error("No active session");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("completed_exercises")
        .insert({
          session_id: session.id,
          exercise_id: exercise.exerciseId,
          routine_exercise_id: exercise.id,
          set_number: setNumber,
          weight,
          reps,
          difficulty,
        })
        .select()
        .single();

      if (error) {
        console.warn("Error saving set:", error);
        toast.error("Error al guardar la serie");
        return null;
      }

      const completedSet: CompletedSet = {
        setNumber,
        weight,
        reps,
        difficulty,
        completedAt: new Date(data.created_at),
      };

      return completedSet;
    } catch (error) {
      console.error("Error completing set:", error);
      toast.error("Error al guardar la serie");
      return null;
    }
  }, [session, student]);

  // Finish the workout session
  const finishSession = useCallback(async (
    totalDurationSeconds: number,
    notes?: string
  ) => {
    if (!session) return null;

    try {
      const { data, error } = await supabase
        .from("completed_sessions")
        .update({
          completed_at: new Date().toISOString(),
          duration_seconds: totalDurationSeconds,
          notes: notes || null,
        })
        .eq("id", session.id)
        .select()
        .single();

      if (error) throw error;

      toast.success("¡Entrenamiento completado!");
      return data;
    } catch (error) {
      console.error("Error finishing session:", error);
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

// Hook to get completed coach workouts for weekly progress
export function useCoachWeeklyProgress() {
  const { student } = useAuthContext();

  const getWeeklyProgress = useCallback(async () => {
    if (!student) return { completedDays: 0, totalDays: 5 };

    try {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      startOfWeek.setHours(0, 0, 0, 0);

      const { data: sessions, error } = await supabase
        .from("completed_sessions")
        .select("id, completed_at")
        .eq("student_id", student.id)
        .not("completed_at", "is", null)
        .gte("completed_at", startOfWeek.toISOString());

      if (error) throw error;

      const completedDates = new Set(
        (sessions || []).map(s => {
          const date = new Date(s.completed_at!);
          return date.toDateString();
        })
      );

      return {
        completedDays: completedDates.size,
        totalDays: 5,
        sessions: sessions || [],
      };
    } catch (error) {
      console.error("Error fetching weekly progress:", error);
      return { completedDays: 0, totalDays: 5 };
    }
  }, [student]);

  return { getWeeklyProgress };
}
