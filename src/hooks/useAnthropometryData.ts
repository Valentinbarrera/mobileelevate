/**
 * Hook para obtener datos de antropometría del alumno
 * Tabla: anthropometry (weight_kg, waist_cm, chest_cm, arm_cm, thigh_cm, hips_cm, body_fat, date)
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

export interface AnthropometryEntry {
  id: string;
  date: string;
  weight_kg: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  arm_cm: number | null;
  thigh_cm: number | null;
  hips_cm: number | null;
  body_fat: number | null;
  notes: string | null;
}

export function useAnthropometryData() {
  const { student } = useAuthContext();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["anthropometry", student?.id],
    queryFn: async () => {
      if (!student?.id) return [];
      const { data, error } = await supabase
        .from("anthropometry")
        .select("*")
        .eq("student_id", student.id)
        .order("date", { ascending: true });
      if (error) throw error;
      return (data || []) as AnthropometryEntry[];
    },
    enabled: !!student?.id,
  });

  const latest = entries.length > 0 ? entries[entries.length - 1] : null;

  const weightHistory = entries
    .filter(e => e.weight_kg != null)
    .map(e => ({ date: e.date, value: e.weight_kg! }));

  const waistHistory = entries
    .filter(e => e.waist_cm != null)
    .map(e => ({ date: e.date, value: e.waist_cm! }));

  return {
    entries,
    latest,
    weightHistory,
    waistHistory,
    loading: isLoading,
  };
}
