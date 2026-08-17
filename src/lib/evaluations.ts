/**
 * Evaluaciones de antropometría del alumno.
 *
 * El alumno sube el PDF de su evaluación física, la app lo interpreta, él revisa
 * los valores y los guarda. Fuente de verdad para la UI = localStorage (escritura
 * inmediata, cero latencia, funciona en modo demo y sin red). En paralelo se
 * empuja best-effort a Supabase (ver `evaluationsApi`) para respaldarlo y para
 * que el COACH lo vea.
 *
 * Misma estrategia que readiness / notas de ejercicio / programas propios:
 * el dual-write vive acá adentro, así todos los call sites quedan cubiertos.
 */
import {
  pushEvaluation,
  mirrorToAnthropometry,
  pullEvaluations,
  deleteRemoteEvaluation,
} from "@/lib/evaluationsApi";
import type { MeasurementValues } from "@/types/evaluation";

export interface AnthropometryEvaluation {
  /** uuid generado en el cliente (o el remoto, si vino de la nube). */
  id: string;
  /** Fecha de la evaluación, YYYY-MM-DD. */
  date: string;
  /** id de campo -> valor. Ver `ANTHROPOMETRY_FIELDS`. */
  values: MeasurementValues;
  /** Nombre del PDF del que salió, si vino de un archivo. */
  sourceFileName: string | null;
  createdAt: string;
  /** Objetivo que le fijó el coach desde la web. Sólo lectura para el alumno. */
  goal?: string | null;
  goalNote?: string | null;
  notes?: string | null;
}

const keyFor = (studentId: string) => `elevate_evaluations_${studentId}`;

const MAX_STORED = 60;

export function newEvaluationId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
    /* entorno sin crypto */
  }
  return `ev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Más reciente primero. */
const byDateDesc = (a: AnthropometryEvaluation, b: AnthropometryEvaluation) =>
  b.date.localeCompare(a.date);

function read(studentId: string): AnthropometryEvaluation[] {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnthropometryEvaluation[];
    return Array.isArray(parsed) ? parsed.sort(byDateDesc) : [];
  } catch {
    return [];
  }
}

function write(studentId: string, all: AnthropometryEvaluation[]) {
  try {
    localStorage.setItem(
      keyFor(studentId),
      JSON.stringify(all.sort(byDateDesc).slice(0, MAX_STORED))
    );
  } catch {
    /* almacenamiento no disponible */
  }
}

export function listEvaluations(studentId: string): AnthropometryEvaluation[] {
  return read(studentId);
}

export function getLatestEvaluation(studentId: string): AnthropometryEvaluation | null {
  return read(studentId)[0] ?? null;
}

/**
 * Guarda (o pisa, si ya hay una de esa fecha) la evaluación.
 * Devuelve la entrada tal como quedó guardada localmente.
 */
export function saveEvaluation(
  studentId: string,
  input: { date: string; values: MeasurementValues; sourceFileName?: string | null; id?: string }
): AnthropometryEvaluation {
  const previous = read(studentId).find((e) => e.date === input.date);
  const entry: AnthropometryEvaluation = {
    id: input.id ?? previous?.id ?? newEvaluationId(),
    date: input.date,
    values: input.values,
    sourceFileName: input.sourceFileName ?? previous?.sourceFileName ?? null,
    createdAt: previous?.createdAt ?? new Date().toISOString(),
    // El objetivo lo escribe el coach: al re-guardar una fecha no se pisa.
    goal: previous?.goal ?? null,
    goalNote: previous?.goalNote ?? null,
    notes: previous?.notes ?? null,
  };

  write(studentId, [...read(studentId).filter((e) => e.date !== input.date), entry]);

  // Best-effort, en paralelo y sin bloquear la UI:
  //  - tabla nueva (36 variables, la que lee el módulo del coach)
  //  - espejo en la tabla vieja, que ya existe hoy y alimenta Mediciones/Progreso
  void pushEvaluation(studentId, {
    date: entry.date,
    values: entry.values,
    sourceFileName: entry.sourceFileName,
  });
  void mirrorToAnthropometry(studentId, entry.date, entry.values);

  return entry;
}

export function deleteEvaluation(studentId: string, id: string) {
  const target = read(studentId).find((e) => e.id === id);
  write(studentId, read(studentId).filter((e) => e.id !== id));
  if (target) void deleteRemoteEvaluation(id);
}

/**
 * Trae de la nube lo que falte acá: evaluaciones que cargó el coach desde la
 * web, o las propias después de reinstalar.
 *
 * **Los valores locales ganan siempre** (son los que el alumno revisó y
 * confirmó); del remoto sólo se adopta lo que el alumno no escribe nunca: el
 * objetivo y las notas que le pone el coach.
 *
 * Devuelve la lista final, o null si no hubo nada que aplicar.
 */
export async function hydrateEvaluations(
  studentId: string
): Promise<AnthropometryEvaluation[] | null> {
  const remote = await pullEvaluations(studentId);
  if (remote.length === 0) return null;

  const local = read(studentId);
  const byDate = new Map(local.map((e) => [e.date, e]));
  let changed = false;

  for (const r of remote) {
    const existing = byDate.get(r.date);

    if (!existing) {
      byDate.set(r.date, {
        id: r.id,
        date: r.date,
        values: r.values,
        sourceFileName: r.sourceFileName,
        createdAt: r.createdAt || new Date().toISOString(),
        goal: r.goal,
        goalNote: r.goalNote,
        notes: r.notes,
      });
      changed = true;
      continue;
    }

    if (
      existing.goal !== r.goal ||
      existing.goalNote !== r.goalNote ||
      existing.notes !== r.notes
    ) {
      byDate.set(r.date, { ...existing, goal: r.goal, goalNote: r.goalNote, notes: r.notes });
      changed = true;
    }
  }

  if (!changed) return null;

  const merged = [...byDate.values()];
  write(studentId, merged);
  return merged.sort(byDateDesc);
}
