/**
 * Fechas con entrenamiento COMPLETADO real (tabla completed_sessions) del alumno.
 * Solo lectura; se combina con los completados manuales en el calendario.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

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
      return (data || []).map((r) => r.date as string);
    },
  });

  return new Set(data ?? []);
}
