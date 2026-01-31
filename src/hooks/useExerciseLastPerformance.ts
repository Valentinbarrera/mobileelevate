/**
 * Hook to fetch the last performance of an exercise for the current user
 * Used to show "Anterior: X kg x Y reps" in the set input modal
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface LastPerformance {
  weight: number;
  reps: number;
  difficulty: string;
  completedAt: string;
}

interface PersonalRecord {
  maxWeight: number;
  maxReps: number;
  maxVolume: number;
}

export function useExerciseLastPerformance(exerciseId: string | undefined) {
  const { user } = useAuth();
  const [lastPerformance, setLastPerformance] = useState<LastPerformance | null>(null);
  const [personalRecord, setPersonalRecord] = useState<PersonalRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !exerciseId) {
      setLastPerformance(null);
      setPersonalRecord(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch last performance (most recent set for this exercise)
        const { data: lastSet, error: lastSetError } = await supabase
          .from("exercise_sets")
          .select(`
            weight,
            reps,
            difficulty,
            completed_at,
            session_id,
            workout_sessions!inner(user_id)
          `)
          .eq("exercise_id", exerciseId)
          .eq("workout_sessions.user_id", user.id)
          .order("completed_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!lastSetError && lastSet) {
          setLastPerformance({
            weight: Number(lastSet.weight),
            reps: lastSet.reps,
            difficulty: lastSet.difficulty,
            completedAt: lastSet.completed_at,
          });
        }

        // Fetch personal records
        const { data: records, error: prError } = await supabase
          .from("personal_records")
          .select("record_type, value")
          .eq("user_id", user.id)
          .eq("exercise_id", exerciseId);

        if (!prError && records && records.length > 0) {
          const pr: PersonalRecord = {
            maxWeight: 0,
            maxReps: 0,
            maxVolume: 0,
          };
          
          records.forEach(r => {
            if (r.record_type === "max_weight") pr.maxWeight = Number(r.value);
            if (r.record_type === "max_reps") pr.maxReps = Number(r.value);
            if (r.record_type === "max_volume") pr.maxVolume = Number(r.value);
          });
          
          setPersonalRecord(pr);
        }
      } catch (error) {
        console.error("Error fetching exercise history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, exerciseId]);

  return { lastPerformance, personalRecord, loading };
}
