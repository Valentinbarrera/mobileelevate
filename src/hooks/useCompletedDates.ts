/**
 * Fechas con entrenamiento COMPLETADO real del alumno: las del plan del coach
 * (`completed_sessions`) MÁS las de sus programas propios (`own_workout_sessions`).
 * Los dos tipos de entreno pintan verde el día en el calendario de Entrenar.
 * Solo lectura; se combina con los completados manuales en el calendario.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { fetchOwnSessionDates } from "@/lib/ownWorkoutsApi";

export function useCompletedDates() {
  const { student } = useAuthContext();
  const studentId = student?.id ?? null;

  const { data } = useQuery({
    queryKey: ["completed-dates", studentId],
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<string[]> => {
      if (!studentId) return [];
      const { data, error } = await supabase
        .from("completed_sessions")
        .select("date")
        .eq("student_id", studentId);
      if (error) throw error;
      const coachDates = (data || []).map((r) => r.date as string);
      // Best-effort: `fetchOwnSessionDates` nunca lanza, así que si la tabla de
      // entrenos propios no existe el calendario queda igual que antes.
      const ownDates = await fetchOwnSessionDates(studentId);
      // El Set del return ya deduplica si un día tiene entreno del coach y propio.
      return [...coachDates, ...ownDates];
    },
  });

  return new Set(data ?? []);
}
