import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Exercise, ExerciseSet, PersonalRecord } from "@/types/database";

interface ExercisePerformance {
  date: string;
  maxWeight: number;
  totalVolume: number;
  totalReps: number;
  sets: {
    setNumber: number;
    weight: number;
    reps: number;
    difficulty: string;
    isPR: boolean;
  }[];
}

interface ExerciseDetails {
  exercise: Exercise | null;
  performances: ExercisePerformance[];
  personalRecords: {
    maxWeight: number | null;
    maxReps: number | null;
    maxVolume: number | null;
  };
  improvement: {
    weightChange: number;
    percentChange: number;
  } | null;
}

export function useExerciseHistory(exerciseId: string) {
  const { user } = useAuth();
  const [data, setData] = useState<ExerciseDetails>({
    exercise: null,
    performances: [],
    personalRecords: { maxWeight: null, maxReps: null, maxVolume: null },
    improvement: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchExerciseHistory = useCallback(async () => {
    if (!user || !exerciseId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch exercise details
      const { data: exercise, error: exerciseError } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", exerciseId)
        .single();

      if (exerciseError) throw exerciseError;

      // Fetch personal records
      const { data: prs, error: prsError } = await supabase
        .from("personal_records")
        .select("*")
        .eq("user_id", user.id)
        .eq("exercise_id", exerciseId);

      if (prsError) throw prsError;

      const personalRecords = {
        maxWeight: prs?.find(p => p.record_type === "max_weight")?.value || null,
        maxReps: prs?.find(p => p.record_type === "max_reps")?.value || null,
        maxVolume: prs?.find(p => p.record_type === "max_volume")?.value || null,
      };

      // Fetch all sets for this exercise
      const { data: sets, error: setsError } = await supabase
        .from("exercise_sets")
        .select(`
          *,
          workout_sessions!inner(user_id, completed_at)
        `)
        .eq("exercise_id", exerciseId)
        .eq("workout_sessions.user_id", user.id)
        .order("completed_at", { ascending: false });

      if (setsError) throw setsError;

      // Group sets by session date
      const performancesByDate: { [key: string]: ExercisePerformance } = {};
      
      (sets || []).forEach(set => {
        const date = new Date((set.workout_sessions as any).completed_at).toISOString().split('T')[0];
        
        if (!performancesByDate[date]) {
          performancesByDate[date] = {
            date,
            maxWeight: 0,
            totalVolume: 0,
            totalReps: 0,
            sets: [],
          };
        }
        
        performancesByDate[date].maxWeight = Math.max(performancesByDate[date].maxWeight, set.weight);
        performancesByDate[date].totalVolume += set.weight * set.reps;
        performancesByDate[date].totalReps += set.reps;
        performancesByDate[date].sets.push({
          setNumber: set.set_number,
          weight: set.weight,
          reps: set.reps,
          difficulty: set.difficulty,
          isPR: set.is_pr,
        });
      });

      const performances = Object.values(performancesByDate).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Calculate improvement (compare last 2 sessions)
      let improvement = null;
      if (performances.length >= 2) {
        const current = performances[0].maxWeight;
        const previous = performances[1].maxWeight;
        const weightChange = current - previous;
        const percentChange = previous > 0 ? ((current - previous) / previous) * 100 : 0;
        improvement = { weightChange, percentChange };
      }

      setData({
        exercise: exercise as Exercise,
        performances,
        personalRecords,
        improvement,
      });
    } catch (error) {
      console.error("Error fetching exercise history:", error);
    } finally {
      setLoading(false);
    }
  }, [user, exerciseId]);

  useEffect(() => {
    fetchExerciseHistory();
  }, [fetchExerciseHistory]);

  return {
    ...data,
    loading,
    refetch: fetchExerciseHistory,
  };
}
