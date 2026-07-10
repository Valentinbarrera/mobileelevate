/**
 * Guardar una medición corporal (antropometría) cargada por el ALUMNO.
 *
 * Hace find-or-create por (student_id, date):
 *   - Si NO existe fila de esa fecha  → INSERT (funciona con la RLS de INSERT
 *     del alumno, la misma que usan las fotos de progreso).
 *   - Si YA existe                    → UPDATE de esa fila, pisando SOLO las
 *     columnas que el usuario cargó (las vacías quedan como estaban).
 *
 * Si el UPDATE falla por RLS (falta la policy de UPDATE del alumno), lanzamos
 * un Error claro en español en vez de romper la app. En ese caso el dueño debe
 * correr `scripts/setup-student-measurements.sql`.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { getLocalDateString } from "@/lib/date";

export interface MeasurementInput {
  date: string; // YYYY-MM-DD (requerido)
  weight_kg?: number | null;
  waist_cm?: number | null;
  chest_cm?: number | null;
  arm_cm?: number | null;
  thigh_cm?: number | null;
  hips_cm?: number | null;
  body_fat?: number | null;
  notes?: string | null;
}

const NUMERIC_FIELDS = [
  "weight_kg",
  "waist_cm",
  "chest_cm",
  "arm_cm",
  "thigh_cm",
  "hips_cm",
  "body_fat",
] as const;

// Detecta el error típico de RLS (permiso denegado por policy).
const isRlsError = (err: unknown): boolean => {
  const e = err as { code?: string; message?: string } | null;
  if (!e) return false;
  return (
    e.code === "42501" ||
    /row-level security|violates row-level|policy/i.test(e.message || "")
  );
};

export function useSaveMeasurement() {
  const { student } = useAuthContext();
  const queryClient = useQueryClient();
  const studentId = student?.id ?? null;

  const mutation = useMutation({
    mutationFn: async (input: MeasurementInput) => {
      if (!studentId) throw new Error("Tenés que iniciar sesión para cargar mediciones.");
      if (!input.date) throw new Error("Elegí una fecha para la medición.");

      // Solo las columnas que el usuario efectivamente cargó.
      const values: Record<string, number | string | null> = {};
      for (const key of NUMERIC_FIELDS) {
        const v = input[key];
        if (v != null && !Number.isNaN(v)) values[key] = v;
      }
      if (input.notes != null && input.notes.trim() !== "") {
        values.notes = input.notes.trim();
      }

      if (Object.keys(values).length === 0) {
        throw new Error("Cargá al menos un valor para guardar la medición.");
      }

      // 1. find-or-create por (student_id, date)
      const { data: existing, error: findErr } = await supabase
        .from("anthropometry")
        .select("id")
        .eq("student_id", studentId)
        .eq("date", input.date)
        .maybeSingle();
      if (findErr) throw findErr;

      if (!existing?.id) {
        // No existe → INSERT (RLS de INSERT del alumno ya habilitada)
        const { error: insertErr } = await supabase
          .from("anthropometry")
          .insert({ student_id: studentId, date: input.date, ...values });
        if (insertErr) {
          if (isRlsError(insertErr)) {
            throw new Error(
              "No se pudo guardar la medición. Pedile al coach que habilite la carga de mediciones."
            );
          }
          throw insertErr;
        }
        return { mode: "insert" as const };
      }

      // Existe → UPDATE solo de las columnas provistas
      const { error: updateErr } = await supabase
        .from("anthropometry")
        .update(values)
        .eq("id", existing.id);
      if (updateErr) {
        if (isRlsError(updateErr)) {
          throw new Error(
            "No se pudo actualizar la medición de esa fecha. Probá con la fecha de hoy o pedile al coach que habilite la edición."
          );
        }
        throw updateErr;
      }
      return { mode: "update" as const };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anthropometry", studentId] });
    },
  });

  return {
    saveMeasurement: mutation.mutateAsync,
    saving: mutation.isPending,
    canSave: !!studentId,
    today: getLocalDateString(),
  };
}
