/**
 * Hook para manejar sesiones de entrenamiento con datos del Coach
 * Guarda workout_sessions y exercise_sets en la DB local (Lovable Cloud)
 * Las rutinas vienen del Coach, el tracking se guarda localmente
 * Incluye soporte offline-first con sincronización automática
 */
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useOfflineSync } from "./useOfflineSync";
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
  savedOffline?: boolean;
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
  const { user } = useAuth();
  const [session, setSession] = useState<CoachWorkoutSession | null>(null);
  const [loading, setLoading] = useState(false);
  const { addPendingSet, isOnline } = useOfflineSync();

  // Start a new workout session
  const startSession = useCallback(async () => {
    if (!user) {
      toast.error("Debés iniciar sesión para entrenar");
      return null;
    }

    setLoading(true);
    try {
      // Create a workout record if it doesn't exist (using routineDayId as workout_id)
      // First, check if we have a workout mapping for this routine day
      const { data: existingWorkout } = await supabase
        .from("workouts")
        .select("id")
        .eq("id", routineDayId)
        .maybeSingle();

      let workoutId = routineDayId;

      // If no workout exists, we'll use a default or create one
      if (!existingWorkout) {
        // Use the first available workout as fallback
        const { data: defaultWorkout } = await supabase
          .from("workouts")
          .select("id")
          .limit(1)
          .single();
        
        workoutId = defaultWorkout?.id || "11111111-1111-1111-1111-111111111111";
      }

      const { data, error } = await supabase
        .from("workout_sessions")
        .insert({
          user_id: user.id,
          workout_id: workoutId,
          notes: `Coach routine: ${routineId}, Day: ${routineDayId}`,
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
  }, [user, routineDayId, routineId]);

  // Complete a set and save it (with offline fallback)
  const completeSet = useCallback(async (
    exercise: CoachExercise,
    setNumber: number,
    weight: number,
    reps: number,
    difficulty: DifficultyLevel
  ): Promise<CompletedSet | null> => {
    if (!session || !user) {
      console.error("No active session");
      return null;
    }

    try {
      // First, we need to check if an exercise exists in our DB
      // If not, create a temporary mapping (using the coach's exercise_id)
      let exerciseId = exercise.exerciseId;
      
      // Check if exercise exists in local DB
      const { data: existingExercise } = await supabase
        .from("exercises")
        .select("id")
        .eq("id", exercise.exerciseId)
        .maybeSingle();

      if (!existingExercise) {
        // Create exercise in local DB
        const { data: newExercise, error: createError } = await supabase
          .from("exercises")
          .insert({
            id: exercise.exerciseId,
            name: exercise.name,
            muscle_group: exercise.muscleGroup || "General",
            video_url: exercise.videoUrl,
            thumbnail: exercise.thumbnail,
            description: exercise.notes,
          })
          .select()
          .single();

        if (createError) {
          // If insert fails (maybe ID conflict), try to find by name
          const { data: byName } = await supabase
            .from("exercises")
            .select("id")
            .eq("name", exercise.name)
            .maybeSingle();
          
          exerciseId = byName?.id || exercise.exerciseId;
        } else {
          exerciseId = newExercise.id;
        }
      }

      // Get or create workout_exercise mapping
      let workoutExerciseId = exercise.id;
      
      const { data: existingWE } = await supabase
        .from("workout_exercises")
        .select("id")
        .eq("id", exercise.id)
        .maybeSingle();

      if (!existingWE) {
        // Use a default workout exercise or create one
        const { data: defaultWE } = await supabase
          .from("workout_exercises")
          .select("id")
          .limit(1)
          .single();
        
        workoutExerciseId = defaultWE?.id || exercise.id;
      }

      // Try to save the exercise set to the server
      const { data, error } = await supabase
        .from("exercise_sets")
        .insert({
          session_id: session.id,
          exercise_id: exerciseId,
          workout_exercise_id: workoutExerciseId,
          set_number: setNumber,
          weight,
          reps,
          difficulty,
        })
        .select()
        .single();

      if (error) {
        // If online save fails, store offline
        console.warn("Server save failed, storing offline:", error);
        
        addPendingSet({
          sessionId: session.id,
          exerciseId,
          workoutExerciseId,
          setNumber,
          weight,
          reps,
          difficulty,
          createdAt: new Date().toISOString(),
        });

        toast.warning("Serie guardada localmente. Se sincronizará cuando haya conexión.");

        return {
          setNumber,
          weight,
          reps,
          difficulty,
          completedAt: new Date(),
          savedOffline: true,
        };
      }

      const completedSet: CompletedSet = {
        setNumber,
        weight,
        reps,
        difficulty,
        completedAt: new Date(data.completed_at),
        isPR: data.is_pr,
      };

      if (data.is_pr) {
        toast.success("🎉 ¡Nuevo récord personal!");
      }

      return completedSet;
    } catch (error) {
      console.error("Error completing set:", error);
      
      // Fallback to offline storage on any error
      if (!isOnline) {
        addPendingSet({
          sessionId: session.id,
          exerciseId: exercise.exerciseId,
          workoutExerciseId: exercise.id,
          setNumber,
          weight,
          reps,
          difficulty,
          createdAt: new Date().toISOString(),
        });

        toast.warning("Sin conexión. Serie guardada localmente.");

        return {
          setNumber,
          weight,
          reps,
          difficulty,
          completedAt: new Date(),
          savedOffline: true,
        };
      }

      toast.error("Error al guardar la serie");
      return null;
    }
  }, [session, user, addPendingSet, isOnline]);

  // Finish the workout session
  const finishSession = useCallback(async (
    totalDurationSeconds: number,
    notes?: string
  ) => {
    if (!session) return null;

    try {
      const { data, error } = await supabase
        .from("workout_sessions")
        .update({
          completed_at: new Date().toISOString(),
          total_duration_seconds: totalDurationSeconds,
          notes: notes || session.routineId,
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
  const { user } = useAuth();

  const getWeeklyProgress = useCallback(async () => {
    if (!user) return { completedDays: 0, totalDays: 5 };

    try {
      // Get start of current week (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      startOfWeek.setHours(0, 0, 0, 0);

      // Get completed sessions this week
      const { data: sessions, error } = await supabase
        .from("workout_sessions")
        .select("id, completed_at, notes")
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .gte("completed_at", startOfWeek.toISOString());

      if (error) throw error;

      // Count unique days with completed workouts
      const completedDates = new Set(
        (sessions || []).map(s => {
          const date = new Date(s.completed_at!);
          return date.toDateString();
        })
      );

      return {
        completedDays: completedDates.size,
        totalDays: 5, // Default training days per week
        sessions: sessions || [],
      };
    } catch (error) {
      console.error("Error fetching weekly progress:", error);
      return { completedDays: 0, totalDays: 5 };
    }
  }, [user]);

  return { getWeeklyProgress };
}
