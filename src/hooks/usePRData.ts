/**
 * Hook para calcular Personal Records del alumno
 * Calcula PRs desde completed_exercises (max weight per exercise)
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

      // Get all completed exercises with their session dates and exercise names
      const { data, error } = await supabase
        .from("completed_exercises")
        .select(`
          weight,
          reps,
          completed_sessions!inner(date, student_id),
          routine_exercises!inner(exercises!inner(name))
        `)
        .eq("completed_sessions.student_id", student.id)
        .not("weight", "is", null)
        .gt("weight", 0)
        .order("weight", { ascending: false });

      if (error) {
        console.error("Error fetching PRs:", error);
        return [];
      }

      // Group by exercise name and find max weight
      const prMap = new Map<string, PersonalRecord>();

      (data || []).forEach((entry: any) => {
        const name = entry.routine_exercises?.exercises?.name;
        if (!name) return;

        const existing = prMap.get(name);
        if (!existing || entry.weight > existing.weight) {
          prMap.set(name, {
            exerciseName: name,
            weight: entry.weight,
            reps: entry.reps,
            date: entry.completed_sessions?.date || "",
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
