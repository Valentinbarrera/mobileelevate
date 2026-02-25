/**
 * Hook para calcular Personal Records del alumno
 * Calcula PRs desde completed_exercises (max weight per exercise)
 * Schema: completed_exercises → routine_exercises (has name field directly)
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

export interface PersonalRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
}

export function usePRData() {
  const { student } = useAuthContext();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["personal-records", student?.id],
    queryFn: async () => {
      if (!student?.id) return [];

      // Two-step query to avoid RLS issues with nested joins
      // Step 1: Get completed sessions for this student
      const { data: sessions, error: sessError } = await supabase
        .from("completed_sessions")
        .select("id, date")
        .eq("student_id", student.id);

      if (sessError || !sessions?.length) return [];

      const sessionIds = sessions.map(s => s.id);
      const sessionDateMap = new Map(sessions.map(s => [s.id, s.date]));

      // Step 2: Get completed exercises with routine_exercise name
      const { data: exercises, error: exError } = await supabase
        .from("completed_exercises")
        .select("weight, reps, completed_session_id, routine_exercises(name)")
        .in("completed_session_id", sessionIds)
        .not("weight", "is", null)
        .gt("weight", 0);

      if (exError) {
        if (import.meta.env.DEV) console.error("Error fetching PRs:", exError);
        return [];
      }

      // Group by exercise name, find max weight
      const prMap = new Map<string, PersonalRecord>();

      (exercises || []).forEach((entry: { weight: number; reps: number; completed_session_id: string; routine_exercises: { name: string } | null }) => {
        const name = entry.routine_exercises?.name;
        if (!name) return;

        const existing = prMap.get(name);
        if (!existing || entry.weight > existing.weight) {
          prMap.set(name, {
            exerciseName: name,
            weight: entry.weight,
            reps: entry.reps,
            date: sessionDateMap.get(entry.completed_session_id) || "",
          });
        }
      });

      return Array.from(prMap.values()).sort((a, b) => b.weight - a.weight);
    },
    enabled: !!student?.id,
  });

  return {
    records,
    loading: isLoading,
  };
}
