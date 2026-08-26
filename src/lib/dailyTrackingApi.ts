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
  /** Cómo se sintieron las cargas (1-5). Ver abajo por qué viaja en la nota. */
  load: number;
  note: string;
  workoutName: string;
}

const LOAD_LABEL = ["", "muy livianas", "livianas", "justas", "pesadas", "no pude"];

/**
 * `daily_tracking` no tiene columna para las cargas y la base está congelada,
 * así que el dato viaja al principio de la nota para que el coach lo vea igual.
 * Cuando se pueda tocar el schema, esto sale de acá y se va a su columna.
 */
export function composeNote(c: CheckInRemote): string | null {
  const carga = c.load > 0 ? `Cargas: ${c.load}/5 (${LOAD_LABEL[c.load]})` : "";
  const partes = [carga, c.note].filter(Boolean);
  return partes.length ? partes.join(" · ") : null;
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
        note: composeNote(c),
        workout_name: c.workoutName || null,
      },
      { onConflict: "student_id,date" }
    );
    return !error;
  } catch {
    return false;
  }
}
