/**
 * Persistencia del tracking diario (agua + bienestar) en Supabase
 * (tabla daily_tracking, una fila por alumno/día). Requiere correr
 * scripts/setup-daily-tracking.sql en el dashboard. Mientras no exista la tabla
 * (o falle la red), las llamadas fallan suave y la app sigue con el guardado local.
 *
 * Upsert PARCIAL por (student_id, date): enviar solo `water` actualiza el agua
 * sin pisar el bienestar, y viceversa.
 *
 * La tabla aún no está en los tipos generados de Supabase, así que accedemos vía
 * un cliente sin tipar (aislado en este archivo) para no romper el typecheck.
 */
import { supabase } from "@/integrations/supabase/client";

const TABLE = "daily_tracking";

const sb = supabase as unknown as {
  from: (table: string) => {
    upsert: (row: Record<string, unknown>, opts: { onConflict: string }) => Promise<{ error: unknown }>;
  };
};

const isRealStudent = (studentId: string) =>
  !!studentId && studentId !== "admin" && studentId !== "anon";

/** Guarda los vasos de agua del día (no toca el bienestar). */
export async function upsertWaterRemote(studentId: string, date: string, water: number): Promise<boolean> {
  if (!isRealStudent(studentId)) return false;
  try {
    const { error } = await sb
      .from(TABLE)
      .upsert({ student_id: studentId, date, water }, { onConflict: "student_id,date" });
    return !error;
  } catch {
    return false;
  }
}

export interface CheckInRemote {
  date: string;
  rpe: number;
  energy: number;
  sleep: number;
  note: string;
  workoutName: string;
}

/** Guarda el check-in de bienestar del día (no toca el agua). */
export async function upsertCheckInRemote(studentId: string, c: CheckInRemote): Promise<boolean> {
  if (!isRealStudent(studentId)) return false;
  try {
    const { error } = await sb.from(TABLE).upsert(
      {
        student_id: studentId,
        date: c.date,
        rpe: c.rpe,
        energy: c.energy,
        sleep: c.sleep,
        note: c.note || null,
        workout_name: c.workoutName || null,
      },
      { onConflict: "student_id,date" }
    );
    return !error;
  } catch {
    return false;
  }
}
