/**
 * Biblioteca de ejercicios — catálogo que ve el alumno: los ejercicios del
 * sistema + los que cargó su coach. Cada uno con video, técnica e instrucciones.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

export interface LibraryExercise {
  id: string;
  name: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  muscle: string | null;
  secondaryMuscles: string[] | null;
  equipment: string | null;
  level: string | null;
  category: string | null;
  description: string | null;
  instructions: string[] | null;
}

export function useExerciseLibrary() {
  const { student, isAdminMode } = useAuthContext();
  const coachId = student?.coach_id ?? null;

  const query = useQuery({
    queryKey: ["exercise-library", coachId, isAdminMode],
    staleTime: 1000 * 60 * 10,
    queryFn: async (): Promise<LibraryExercise[]> => {
      let q = supabase
        .from("exercises")
        .select(
          "id, name, video_url, thumbnail_url, muscle, secondary_muscles, equipment, level, category, description, instructions"
        )
        .order("name", { ascending: true });

      // El alumno ve los del sistema + los de su coach
      q = coachId ? q.or(`is_system.eq.true,coach_id.eq.${coachId}`) : q.eq("is_system", true);

      const { data, error } = await q;
      if (error) throw error;

      return (data || []).map((e) => ({
        id: e.id,
        name: e.name,
        videoUrl: e.video_url,
        thumbnailUrl: e.thumbnail_url,
        muscle: e.muscle,
        secondaryMuscles: e.secondary_muscles,
        equipment: e.equipment,
        level: e.level,
        category: e.category,
        description: e.description,
        instructions: e.instructions,
      }));
    },
  });

  return {
    exercises: query.data ?? [],
    loading: query.isLoading,
    error: query.error as Error | null,
  };
}
