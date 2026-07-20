/**
 * Sincronización a Supabase de los datos que hasta ahora eran SOLO locales:
 * readiness pre-sesión, feedback por ejercicio, programas propios, notas de
 * ejercicio y registro de peso corporal.
 *
 * Requiere correr `scripts/setup-athlete-sync.sql` en el dashboard. Mientras la
 * tabla no exista (o falle la red), TODAS las llamadas fallan suave: devuelven
 * false/null y la app sigue andando 100% con localStorage. Nunca lanzan.
 *
 * Estrategia: el localStorage sigue siendo la fuente de verdad para la UI
 * (escritura inmediata, cero latencia) y el remoto es (a) respaldo para no
 * perder los datos al reinstalar y (b) la forma en que el COACH los ve.
 *
 * Las tablas no están en los tipos generados de Supabase, así que se accede vía
 * un cliente sin tipar aislado en este archivo, igual que en dailyTrackingApi.
 */
import { supabase } from "@/integrations/supabase/client";
import type { ReadinessEntry } from "@/lib/readiness";
import type { ExerciseFeedbackEntry } from "@/lib/exerciseFeedback";
import type { MyProgram } from "@/lib/myPrograms";
import type { ExerciseNote } from "@/lib/exerciseNotes";
import type { BodyEntry } from "@/hooks/useLocalBodyLog";

type Row = Record<string, unknown>;

interface Query extends PromiseLike<{ data: Row[] | null; error: unknown }> {
  eq: (column: string, value: unknown) => Query;
  order: (column: string, opts?: { ascending?: boolean }) => Query;
}

interface Table {
  select: (columns: string) => Query;
  upsert: (row: Row, opts?: { onConflict: string }) => PromiseLike<{ error: unknown }>;
  delete: () => Query;
}

const sb = supabase as unknown as { from: (table: string) => Table };

/** El modo admin/demo y el estado deslogueado no tocan la base. */
const isRealStudent = (studentId: string) =>
  !!studentId && studentId !== "admin" && studentId !== "anon";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Upsert best-effort: nunca lanza, devuelve si se pudo guardar. */
async function upsert(table: string, row: Row, onConflict: string): Promise<boolean> {
  try {
    const { error } = await sb.from(table).upsert(row, { onConflict });
    return !error;
  } catch {
    return false;
  }
}

/** Select best-effort: nunca lanza, devuelve [] si falla. */
async function selectRows(
  table: string,
  columns: string,
  studentId: string,
  order?: { column: string; ascending?: boolean }
): Promise<Row[]> {
  try {
    let q = sb.from(table).select(columns).eq("student_id", studentId);
    if (order) q = q.order(order.column, { ascending: order.ascending ?? true });
    const { data, error } = await q;
    return error || !data ? [] : data;
  } catch {
    return [];
  }
}

// ── Readiness ───────────────────────────────────────────────────────────────
// Push-only: la UI lo lee de local; el remoto es para el coach y el respaldo.

export async function pushReadiness(studentId: string, entry: ReadinessEntry): Promise<boolean> {
  if (!isRealStudent(studentId)) return false;
  return upsert(
    "readiness_entries",
    {
      student_id: studentId,
      date: entry.date,
      sleep: entry.sleep,
      energy: entry.energy,
      recovery: entry.recovery,
      stress: entry.stress,
      motivation: entry.motivation,
      vitality: entry.vitality,
    },
    "student_id,date"
  );
}

// ── Feedback por ejercicio ──────────────────────────────────────────────────

export async function pushExerciseFeedback(
  studentId: string,
  entry: ExerciseFeedbackEntry
): Promise<boolean> {
  if (!isRealStudent(studentId)) return false;
  return upsert(
    "exercise_feedback",
    {
      student_id: studentId,
      date: entry.date,
      exercise_id: entry.exerciseId,
      exercise_name: entry.exerciseName || null,
      stimulus: entry.stimulus,
      joint_pain: entry.jointPain,
    },
    "student_id,date,exercise_id"
  );
}

// ── Programas propios ───────────────────────────────────────────────────────
// Estos SÍ se hidratan al abrir "Entrenar": son lo que más duele perder.

export async function pushMyProgram(studentId: string, program: MyProgram): Promise<boolean> {
  // el id lo genera el cliente y la columna es uuid; si el fallback no-uuid de
  // newId() se usó (navegador sin crypto.randomUUID), se queda solo en local.
  if (!isRealStudent(studentId) || !UUID_RE.test(program.id)) return false;
  return upsert(
    "my_programs",
    {
      id: program.id,
      student_id: studentId,
      name: program.name,
      description: program.description ?? null,
      level: program.level ?? null,
      weeks: program.weeks ?? null,
      days_per_week: program.daysPerWeek ?? null,
      origin: program.origin,
      template_id: program.templateId ?? null,
      split_id: program.splitId ?? null,
      days: program.days,
      completed_at: program.completedAt ?? null,
      created_at: program.createdAt,
    },
    "id"
  );
}

export async function deleteMyProgramRemote(studentId: string, id: string): Promise<boolean> {
  if (!isRealStudent(studentId) || !UUID_RE.test(id)) return false;
  try {
    const { error } = await sb.from("my_programs").delete().eq("student_id", studentId).eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchMyPrograms(studentId: string): Promise<MyProgram[]> {
  if (!isRealStudent(studentId)) return [];
  const rows = await selectRows(
    "my_programs",
    "id,name,description,level,weeks,days_per_week,origin,template_id,split_id,days,completed_at,created_at",
    studentId,
    { column: "created_at", ascending: true }
  );
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name ?? ""),
    description: (r.description as string) ?? undefined,
    level: (r.level as string) ?? undefined,
    weeks: (r.weeks as number) ?? undefined,
    daysPerWeek: (r.days_per_week as number) ?? undefined,
    days: Array.isArray(r.days) ? (r.days as MyProgram["days"]) : [],
    origin: (r.origin as MyProgram["origin"]) ?? "propio",
    templateId: (r.template_id as string) ?? undefined,
    splitId: (r.split_id as string) ?? undefined,
    completedAt: (r.completed_at as string) ?? null,
    createdAt: String(r.created_at ?? new Date().toISOString()),
  }));
}

// ── Notas de ejercicio ──────────────────────────────────────────────────────

export async function pushExerciseNote(
  studentId: string,
  exerciseId: string,
  note: ExerciseNote
): Promise<boolean> {
  if (!isRealStudent(studentId)) return false;
  return upsert(
    "exercise_notes",
    {
      student_id: studentId,
      exercise_id: exerciseId,
      text: note.text,
      pinned: note.pinned,
      date: note.date,
    },
    "student_id,exercise_id"
  );
}

export async function deleteExerciseNoteRemote(
  studentId: string,
  exerciseId: string
): Promise<boolean> {
  if (!isRealStudent(studentId)) return false;
  try {
    const { error } = await sb
      .from("exercise_notes")
      .delete()
      .eq("student_id", studentId)
      .eq("exercise_id", exerciseId);
    return !error;
  } catch {
    return false;
  }
}

export async function fetchExerciseNotes(
  studentId: string
): Promise<Record<string, ExerciseNote>> {
  if (!isRealStudent(studentId)) return {};
  const rows = await selectRows("exercise_notes", "exercise_id,text,pinned,date", studentId);
  const out: Record<string, ExerciseNote> = {};
  for (const r of rows) {
    out[String(r.exercise_id)] = {
      text: String(r.text ?? ""),
      pinned: Boolean(r.pinned),
      date: String(r.date ?? ""),
    };
  }
  return out;
}

// ── Peso corporal ───────────────────────────────────────────────────────────

export async function pushBodyWeight(
  studentId: string,
  date: string,
  weightKg: number
): Promise<boolean> {
  if (!isRealStudent(studentId)) return false;
  return upsert(
    "body_log",
    { student_id: studentId, date, weight_kg: weightKg },
    "student_id,date"
  );
}

export async function fetchBodyLog(studentId: string): Promise<BodyEntry[]> {
  if (!isRealStudent(studentId)) return [];
  const rows = await selectRows("body_log", "date,weight_kg", studentId, {
    column: "date",
    ascending: true,
  });
  return rows
    .map((r) => ({ date: String(r.date), value: Number(r.weight_kg) }))
    .filter((e) => Number.isFinite(e.value));
}
