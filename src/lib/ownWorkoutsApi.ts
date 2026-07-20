/**
 * Persistencia de los entrenamientos PROPIOS del alumno (los que se arma él
 * desde `myPrograms`, sin plan del coach).
 *
 * ¿Por qué tablas separadas y no las del coach? Porque no entran: en
 * `completed_sessions` el `planned_session_id` es obligatorio (y acá no hay
 * sesión planificada) y `completed_exercises.routine_exercise_id` es FK a la
 * rutina del coach (y acá los ejercicios salen de la biblioteca o los escribe
 * el alumno). Por eso van `own_workout_sessions` + `own_workout_sets`.
 *
 * Requiere correr `scripts/setup-own-workouts.sql` en el dashboard. Mientras la
 * tabla no exista (o falle la red), TODAS las llamadas fallan suave: devuelven
 * null/false/[] y la app sigue andando en modo local. Nunca lanzan.
 *
 * Las tablas no están en los tipos generados de Supabase, así que se accede vía
 * un cliente sin tipar aislado en este archivo, igual que en athleteSyncApi.
 */
import { supabase } from "@/integrations/supabase/client";

type Row = Record<string, unknown>;

interface Query extends PromiseLike<{ data: Row[] | null; error: unknown }> {
  eq: (column: string, value: unknown) => Query;
  in: (column: string, values: unknown[]) => Query;
  order: (column: string, opts?: { ascending?: boolean }) => Query;
  limit: (n: number) => Query;
  select: (columns: string) => Query;
  single: () => PromiseLike<{ data: Row | null; error: unknown }>;
}

interface Table {
  select: (columns: string) => Query;
  insert: (row: Row) => Query;
  update: (row: Row) => Query;
  delete: () => Query;
}

const sb = supabase as unknown as { from: (table: string) => Table };

/** El modo admin/demo y el estado deslogueado no tocan la base. */
const isRealStudent = (studentId: string) =>
  !!studentId && studentId !== "admin" && studentId !== "anon";

export interface OwnSession {
  id: string;
  date: string; // YYYY-MM-DD
  programId: string | null;
  programName: string | null;
  dayName: string | null;
}

export interface OwnSetInput {
  exerciseId: string | null; // id de la biblioteca si se enlazó
  exerciseName: string;
  series: number;
  reps: number;
  weight: number;
}

// ── Ciclo de vida de la sesión ──────────────────────────────────────────────

/** Crea la sesión. Devuelve null si no se pudo (la app sigue en modo local). */
export async function startOwnSession(
  studentId: string,
  input: {
    programId: string | null;
    programName: string | null;
    dayName: string | null;
    date: string;
  }
): Promise<OwnSession | null> {
  if (!isRealStudent(studentId)) return null;
  try {
    const { data, error } = await sb
      .from("own_workout_sessions")
      .insert({
        student_id: studentId,
        date: input.date,
        program_id: input.programId,
        program_name: input.programName,
        day_name: input.dayName,
      })
      .select("id,date,program_id,program_name,day_name")
      .single();
    if (error || !data) return null;
    return {
      id: String(data.id),
      date: String(data.date ?? input.date),
      programId: (data.program_id as string) ?? null,
      programName: (data.program_name as string) ?? null,
      dayName: (data.day_name as string) ?? null,
    };
  } catch {
    return null;
  }
}

/** Cierra la sesión: guarda duración, notas y el tonelaje total (sumado de sus series). */
export async function finishOwnSession(
  sessionId: string,
  durationSeconds: number,
  notes: string | null
): Promise<boolean> {
  if (!sessionId) return false;
  try {
    // El tonelaje se recalcula leyendo las series ya guardadas (y no acumulando
    // en el cliente) para que ediciones/borrados de series queden reflejados.
    let totalTonnage: number | null = null;
    const { data, error } = await sb
      .from("own_workout_sets")
      .select("tonnage")
      .eq("session_id", sessionId);
    if (!error && data) {
      const sum = data.reduce((acc, r) => acc + (Number(r.tonnage) || 0), 0);
      totalTonnage = sum > 0 ? sum : null;
    }

    const { error: updError } = await sb
      .from("own_workout_sessions")
      .update({
        duration_seconds: durationSeconds,
        notes,
        total_tonnage: totalTonnage,
      })
      .eq("id", sessionId);
    return !updError;
  } catch {
    return false;
  }
}

// ── Series ──────────────────────────────────────────────────────────────────

export async function logOwnSet(sessionId: string, set: OwnSetInput): Promise<boolean> {
  if (!sessionId) return false;
  const tonnage = (Number(set.weight) || 0) * (Number(set.reps) || 0);
  try {
    const { error } = await sb.from("own_workout_sets").insert({
      session_id: sessionId,
      exercise_id: set.exerciseId,
      exercise_name: set.exerciseName,
      series: set.series,
      reps: set.reps,
      weight: set.weight,
      tonnage: tonnage > 0 ? tonnage : null,
    });
    return !error;
  } catch {
    return false;
  }
}

/** Edita una serie ya cargada (se identifica por sesión + nombre de ejercicio + nro de serie). */
export async function updateOwnSet(
  sessionId: string,
  exerciseName: string,
  series: number,
  values: { reps: number; weight: number }
): Promise<boolean> {
  if (!sessionId) return false;
  const tonnage = (Number(values.weight) || 0) * (Number(values.reps) || 0);
  try {
    const { error } = await sb
      .from("own_workout_sets")
      .update({
        reps: values.reps,
        weight: values.weight,
        tonnage: tonnage > 0 ? tonnage : null,
      })
      .eq("session_id", sessionId)
      .eq("exercise_name", exerciseName)
      .eq("series", series);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteOwnSet(
  sessionId: string,
  exerciseName: string,
  series: number
): Promise<boolean> {
  if (!sessionId) return false;
  try {
    const { error } = await sb
      .from("own_workout_sets")
      .delete()
      .eq("session_id", sessionId)
      .eq("exercise_name", exerciseName)
      .eq("series", series);
    return !error;
  } catch {
    return false;
  }
}

// ── Historial ───────────────────────────────────────────────────────────────

/**
 * Historial de entrenos propios, YA CON LA FORMA de las filas del coach para
 * que `build()` de useWorkoutDetails los mezcle sin ramificarse: por eso
 * `exercise_name` se devuelve envuelto en `routine_exercises: { name }` y la
 * sesión expone `completed_session_id` / `total_tonnage` / `notes` con los
 * mismos nombres que las tablas del plan.
 */
export interface OwnHistorySessionRow {
  id: string;
  date: string;
  total_tonnage: number | null;
  notes: string | null;
}

export interface OwnHistoryExerciseRow {
  completed_session_id: string;
  series: number | null;
  weight: number | null;
  reps: number | null;
  routine_exercises: { name: string } | null; // ojo: se rellena con exercise_name
}

export async function fetchOwnWorkoutHistory(
  studentId: string,
  limit = 50
): Promise<{ sessions: OwnHistorySessionRow[]; exercises: OwnHistoryExerciseRow[] }> {
  const empty = { sessions: [], exercises: [] };
  if (!isRealStudent(studentId)) return empty;
  try {
    const { data: sessionRows, error } = await sb
      .from("own_workout_sessions")
      .select("id,date,total_tonnage,notes,program_name,day_name")
      .eq("student_id", studentId)
      .order("date", { ascending: false })
      .limit(limit);
    if (error || !sessionRows || sessionRows.length === 0) return empty;

    const sessions: OwnHistorySessionRow[] = sessionRows.map((r) => ({
      id: String(r.id),
      date: String(r.date ?? ""),
      total_tonnage: r.total_tonnage == null ? null : Number(r.total_tonnage),
      // `notes` es lo que el historial muestra como NOMBRE del entreno: si el
      // alumno no escribió nada, se arma un título con el programa y el día.
      notes: sessionTitle(r),
    }));

    const ids = sessions.map((s) => s.id);
    const { data: setRows, error: setsError } = await sb
      .from("own_workout_sets")
      .select("session_id,exercise_name,series,reps,weight")
      .in("session_id", ids);
    if (setsError || !setRows) return { sessions, exercises: [] };

    const exercises: OwnHistoryExerciseRow[] = setRows.map((r) => ({
      completed_session_id: String(r.session_id),
      series: r.series == null ? null : Number(r.series),
      weight: r.weight == null ? null : Number(r.weight),
      reps: r.reps == null ? null : Number(r.reps),
      routine_exercises: { name: String(r.exercise_name ?? "Ejercicio") },
    }));

    return { sessions, exercises };
  } catch {
    return empty;
  }
}

/**
 * Fechas (YYYY-MM-DD) de los entrenos propios. Liviano: solo la columna date.
 *
 * Existe para que la racha, los días activos del mes y el calendario cuenten
 * TAMBIÉN los entrenos propios: si solo miran `completed_sessions`, el alumno ve
 * el entreno en el historial pero se le corta la racha, que es incoherente.
 * Best-effort: si la tabla no existe o falla la red, devuelve [] y quien la use
 * sigue funcionando igual que antes.
 */
export async function fetchOwnSessionDates(
  studentId: string,
  limit = 200
): Promise<string[]> {
  if (!isRealStudent(studentId)) return [];
  try {
    const { data, error } = await sb
      .from("own_workout_sessions")
      .select("date")
      .eq("student_id", studentId)
      .order("date", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data
      .map((r) => (r.date == null ? "" : String(r.date)))
      .filter((d): d is string => d.length > 0);
  } catch {
    return [];
  }
}

/** Título visible del entreno propio: notas > "programa · día" > genérico. */
function sessionTitle(row: Row): string {
  const notes = typeof row.notes === "string" ? row.notes.trim() : "";
  if (notes) return notes;
  const parts = [row.program_name, row.day_name]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);
  return parts.length ? parts.join(" · ") : "Entrenamiento propio";
}
