import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { 
  WorkoutSession, 
  ExerciseSet, 
  DifficultyLevel,
  ExerciseWithTracking 
} from "@/types/database";
import { toast } from "sonner";

export function useWorkoutSession(workoutId: string) {
  const { user } = useAuth();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(false);

  const startSession = useCallback(async () => {
    if (!user) {
      toast.error("Debés iniciar sesión para entrenar");
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("workout_sessions")
        .insert({
          user_id: user.id,
          workout_id: workoutId,
        })
        .select()
        .single();

      if (error) throw error;

      setSession(data as WorkoutSession);
      return data as WorkoutSession;
    } catch (error) {
      console.error("Error starting session:", error);
      toast.error("Error al iniciar el entrenamiento");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, workoutId]);

  const completeSet = useCallback(async (
    workoutExerciseId: string,
    exerciseId: string,
    setNumber: number,
    weight: number,
    reps: number,
    difficulty: DifficultyLevel
  ) => {
    if (!session) {
      toast.error("No hay sesión activa");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("exercise_sets")
        .insert({
          session_id: session.id,
          workout_exercise_id: workoutExerciseId,
          exercise_id: exerciseId,
          set_number: setNumber,
          weight,
          reps,
          difficulty,
        })
        .select()
        .single();

      if (error) throw error;

      const exerciseSet = data as ExerciseSet;
      
      if (exerciseSet.is_pr) {
        toast.success("🎉 ¡Nuevo récord personal!", {
          description: `${weight}kg x ${reps} reps`,
        });
      }

      return exerciseSet;
    } catch (error) {
      console.error("Error completing set:", error);
      toast.error("Error al guardar la serie");
      return null;
    }
  }, [session]);

  const finishSession = useCallback(async (
    totalDurationSeconds: number,
    overallDifficulty?: DifficultyLevel,
    notes?: string
  ) => {
    if (!session) return null;

    try {
      const { data, error } = await supabase
        .from("workout_sessions")
        .update({
          completed_at: new Date().toISOString(),
          total_duration_seconds: totalDurationSeconds,
          overall_difficulty: overallDifficulty,
          notes,
        })
        .eq("id", session.id)
        .select()
        .single();

      if (error) throw error;

      return data as WorkoutSession;
    } catch (error) {
      console.error("Error finishing session:", error);
      toast.error("Error al finalizar el entrenamiento");
      return null;
    }
  }, [session]);

  const getLastPerformance = useCallback(async (exerciseId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("exercise_sets")
        .select(`
          weight,
          reps,
          completed_at,
          workout_sessions!inner(user_id)
        `)
        .eq("exercise_id", exerciseId)
        .eq("workout_sessions.user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return {
          weight: data.weight,
          reps: data.reps,
          date: data.completed_at,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching last performance:", error);
      return null;
    }
  }, [user]);

  const getPersonalRecords = useCallback(async (exerciseId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("personal_records")
        .select("record_type, value")
        .eq("user_id", user.id)
        .eq("exercise_id", exerciseId);

      if (error) throw error;

      if (data && data.length > 0) {
        const records: { maxWeight?: number; maxReps?: number; maxVolume?: number } = {};
        data.forEach((record) => {
          if (record.record_type === "max_weight") records.maxWeight = record.value;
          if (record.record_type === "max_reps") records.maxReps = record.value;
          if (record.record_type === "max_volume") records.maxVolume = record.value;
        });
        return records;
      }
      return null;
    } catch (error) {
      console.error("Error fetching PRs:", error);
      return null;
    }
  }, [user]);

  return {
    session,
    loading,
    startSession,
    completeSet,
    finishSession,
    getLastPerformance,
    getPersonalRecords,
  };
}
