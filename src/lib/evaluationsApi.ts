/**
 * Evaluaciones de antropometría — acceso a Supabase, best-effort.
 *
 * Dos destinos, a propósito:
 *
 *  1. `evaluations` + `anthropometry_measurements` (las 36 variables completas).
 *     Requiere correr `scripts/setup-evaluations.sql`. Es lo que lee la web del
 *     coach (módulo Evaluaciones).
 *  2. `anthropometry` (la tabla vieja, 7 columnas). Espejo de las métricas que
 *     sí entran ahí, para que la pantalla Mediciones, los gráficos de Progreso
 *     y el coach vean el dato AUNQUE todavía no se haya corrido el SQL nuevo.
 *
 * Como en `athleteSyncApi`, nada de acá lanza: si la tabla no existe, no hay red
 * o la RLS dice que no, devolvemos false/[] y la app sigue andando con
 * localStorage. Las tablas nuevas no están en los tipos generados, así que se
 * accede por un cliente sin tipar aislado en este archivo.
 */
import { supabase } from "@/integrations/supabase/client";
import type { MeasurementValues } from "@/types/evaluation";
import { ANTHROPOMETRY_FIELDS } from "@/types/evaluation";

type Row = Record<string, unknown>;

interface Query extends PromiseLike<{ data: Row[] | null; error: unknown }> {
  eq: (column: string, value: unknown) => Query;
  order: (column: string, opts?: { ascending?: boolean }) => Query;
  select: (columns: string) => Query;
  maybeSingle: () => PromiseLike<{ data: Row | null; error: unknown }>;
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

/** Columnas reales de `anthropometry_measurements` (el id del campo ES la columna). */
const MEASUREMENT_COLUMNS = new Set(ANTHROPOMETRY_FIELDS.map((f) => f.id));

/**
 * Equivalencias con la tabla vieja `anthropometry`.
 * Sólo las 7 columnas que existen ahí; el resto vive en la tabla nueva.
 */
const LEGACY_COLUMNS: Record<string, string> = {
  weight: "weight_kg",
  waist_circumference: "waist_cm",
  chest_circumference: "chest_cm",
  relaxed_arm_circumference: "arm_cm",
  thigh_circumference: "thigh_cm",
  hip_circumference: "hips_cm",
  body_fat_percentage: "body_fat",
};

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

export interface RemoteEvaluation {
  id: string;
  date: string;
  values: MeasurementValues;
  sourceFileName: string | null;
  createdAt: string;
  /** Objetivo que le fijó el COACH a esta evaluación (desde la web). */
  goal: string | null;
  goalNote: string | null;
  notes: string | null;
}

// ── Escritura ───────────────────────────────────────────────────────────────

/**
 * Guarda la evaluación completa en `evaluations` + `anthropometry_measurements`.
 * Devuelve el id remoto, o null si el módulo todavía no está activado.
 */
export async function pushEvaluation(
  studentId: string,
  evaluation: { date: string; values: MeasurementValues; sourceFileName: string | null }
): Promise<string | null> {
  if (!isRealStudent(studentId)) return null;

  try {
    // Una evaluación por alumno/tipo/fecha: si ya hay una de esa fecha, la reusamos.
    const { data: existing } = await sb
      .from("evaluations")
      .select("id")
      .eq("student_id", studentId)
      .eq("type", "anthropometry")
      .eq("measurement_date", evaluation.date)
      .maybeSingle();

    let evaluationId = (existing?.id as string) ?? null;

    if (evaluationId) {
      await sb
        .from("evaluations")
        .update({
          source_file_name: evaluation.sourceFileName,
          raw_data: evaluation.values,
        })
        .eq("id", evaluationId);
    } else {
      const { data, error } = await sb
        .from("evaluations")
        .insert({
          student_id: studentId,
          type: "anthropometry",
          measurement_date: evaluation.date,
          source_file_name: evaluation.sourceFileName,
          raw_data: evaluation.values,
        })
        .select("id")
        .maybeSingle();
      if (error || !data?.id) return null;
      evaluationId = data.id as string;
    }

    // Sólo los ids que son columnas reales; lo demás va a extra_data.
    const columns: Row = { evaluation_id: evaluationId };
    const extra: Row = {};
    for (const [id, value] of Object.entries(evaluation.values)) {
      if (value === null || value === undefined || value === "") continue;
      if (MEASUREMENT_COLUMNS.has(id)) columns[id] = value;
      else extra[id] = value;
    }
    if (Object.keys(extra).length > 0) columns.extra_data = extra;

    const { data: existingM } = await sb
      .from("anthropometry_measurements")
      .select("id")
      .eq("evaluation_id", evaluationId)
      .maybeSingle();

    if (existingM?.id) {
      await sb.from("anthropometry_measurements").update(columns).eq("id", existingM.id);
    } else {
      await sb.from("anthropometry_measurements").insert(columns);
    }

    return evaluationId;
  } catch {
    return null;
  }
}

/**
 * Espeja en la tabla vieja `anthropometry` lo que entra en sus 7 columnas.
 * Es lo que hace que el dato se vea en Mediciones/Progreso y del lado del coach
 * sin depender de la migración nueva. Find-or-create por (student_id, date).
 */
export async function mirrorToAnthropometry(
  studentId: string,
  date: string,
  values: MeasurementValues
): Promise<boolean> {
  if (!isRealStudent(studentId)) return false;

  const row: Row = {};
  for (const [fieldId, column] of Object.entries(LEGACY_COLUMNS)) {
    const v = num(values[fieldId]);
    if (v !== null) row[column] = v;
  }
  if (Object.keys(row).length === 0) return false;

  try {
    const { data: existing } = await sb
      .from("anthropometry")
      .select("id")
      .eq("student_id", studentId)
      .eq("date", date)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await sb.from("anthropometry").update(row).eq("id", existing.id);
      return !error;
    }
    const { error } = await sb
      .from("anthropometry")
      .insert({ student_id: studentId, date, ...row });
    return !error;
  } catch {
    return false;
  }
}

// ── Lectura ─────────────────────────────────────────────────────────────────

/** Trae las evaluaciones del alumno. [] si el módulo no está activado. */
export async function pullEvaluations(studentId: string): Promise<RemoteEvaluation[]> {
  if (!isRealStudent(studentId)) return [];

  try {
    const { data, error } = await sb
      .from("evaluations")
      .select(
        "id, measurement_date, source_file_name, created_at, raw_data, goal, goal_note, notes, anthropometry_measurements(*)"
      )
      .eq("student_id", studentId)
      .eq("type", "anthropometry")
      .order("measurement_date", { ascending: false });

    if (error || !data) return [];

    return data.map((row) => {
      const embedded = row.anthropometry_measurements;
      const measurement = (Array.isArray(embedded) ? embedded[0] : embedded) as Row | null;

      const values: MeasurementValues = {};
      if (measurement) {
        for (const field of ANTHROPOMETRY_FIELDS) {
          const v = measurement[field.id];
          if (v === null || v === undefined) continue;
          values[field.id] = field.type === "text" ? String(v) : num(v);
        }
        const extra = measurement.extra_data as Record<string, unknown> | null;
        if (extra && typeof extra === "object") {
          for (const [k, v] of Object.entries(extra)) {
            if (values[k] === undefined) values[k] = v as number | string | null;
          }
        }
      } else if (row.raw_data && typeof row.raw_data === "object") {
        // Sin fila de medición (guardado a medias): al menos mostramos lo leído.
        Object.assign(values, row.raw_data as MeasurementValues);
      }

      return {
        id: String(row.id),
        date: String(row.measurement_date),
        values,
        sourceFileName: (row.source_file_name as string) ?? null,
        createdAt: String(row.created_at ?? ""),
        goal: (row.goal as string) ?? null,
        goalNote: (row.goal_note as string) ?? null,
        notes: (row.notes as string) ?? null,
      };
    });
  } catch {
    return [];
  }
}

/** Borra la evaluación remota. No lanza. */
export async function deleteRemoteEvaluation(id: string): Promise<boolean> {
  try {
    const { error } = await sb.from("evaluations").delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}
