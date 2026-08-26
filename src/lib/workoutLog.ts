/**
 * Registro de entrenamiento LOCAL (localStorage): guarda cada serie cargada
 * (peso × reps por ejercicio y fecha) para que persista sin tocar la base.
 * Alimenta "la vez pasada", los PRs y el historial dentro de la app.
 *
 * El studentId se resuelve igual en toda la app: student.id, o "admin" en modo
 * admin, o "anon".
 */
export interface LoggedSet {
  exerciseId: string; // routine_exercise_id
  date: string; // YYYY-MM-DD
  setNumber: number;
  weight: number;
  reps: number;
  /**
   * Nombre legible del ejercicio. Opcional porque las series viejas no lo
   * tienen: sin esto el historial del anotador mostraría UUIDs. Para los
   * ejercicios libres se puede reconstruir del id (`free:press-banca`), pero
   * pierde acentos y mayúsculas, así que las nuevas lo guardan tal cual.
   */
  name?: string;
}

const keyFor = (studentId: string) => `elevate_workoutlog_${studentId}`;

function read(studentId: string): LoggedSet[] {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    return raw ? (JSON.parse(raw) as LoggedSet[]) : [];
  } catch {
    return [];
  }
}

function write(studentId: string, sets: LoggedSet[]) {
  try {
    // Cap defensivo para no crecer sin límite
    localStorage.setItem(keyFor(studentId), JSON.stringify(sets.slice(-3000)));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function logSet(studentId: string, entry: LoggedSet) {
  const all = read(studentId);
  all.push(entry);
  write(studentId, all);
}

export function getExerciseSets(studentId: string, exerciseId: string): LoggedSet[] {
  return read(studentId).filter((s) => s.exerciseId === exerciseId);
}

/** Edita la última serie cargada que coincida (mismo ejercicio/fecha/número). */
export function updateLoggedSet(
  studentId: string,
  exerciseId: string,
  date: string,
  setNumber: number,
  patch: { weight: number; reps: number }
) {
  const all = read(studentId);
  for (let i = all.length - 1; i >= 0; i--) {
    const s = all[i];
    if (s.exerciseId === exerciseId && s.date === date && s.setNumber === setNumber) {
      all[i] = { ...s, ...patch };
      write(studentId, all);
      return;
    }
  }
}

/** Borra la última serie cargada que coincida (mismo ejercicio/fecha/número). */
export function deleteLoggedSet(
  studentId: string,
  exerciseId: string,
  date: string,
  setNumber: number
) {
  const all = read(studentId);
  for (let i = all.length - 1; i >= 0; i--) {
    const s = all[i];
    if (s.exerciseId === exerciseId && s.date === date && s.setNumber === setNumber) {
      all.splice(i, 1);
      write(studentId, all);
      return;
    }
  }
}

/** ¿Ya hay series cargadas HOY para alguno de estos ejercicios? (entreno en curso) */
export function hasLoggedToday(studentId: string, exerciseIds: string[], date: string): boolean {
  if (!exerciseIds.length) return false;
  const ids = new Set(exerciseIds);
  return read(studentId).some((s) => s.date === date && ids.has(s.exerciseId));
}

/** Último registro del ejercicio (excluyendo opcionalmente la fecha actual). */
export function getLastPerformance(
  studentId: string,
  exerciseId: string,
  excludeDate?: string
): { weight: number; reps: number } | null {
  const sets = getExerciseSets(studentId, exerciseId).filter(
    (s) => !excludeDate || s.date !== excludeDate
  );
  if (!sets.length) return null;
  const sorted = [...sets].sort((a, b) =>
    a.date === b.date ? b.setNumber - a.setNumber : a.date < b.date ? 1 : -1
  );
  return { weight: sorted[0].weight, reps: sorted[0].reps };
}

/** Récord personal (mayor peso) del ejercicio. */
export function getPR(
  studentId: string,
  exerciseId: string,
  excludeDate?: string
): { maxWeight: number; maxReps: number } | null {
  const sets = getExerciseSets(studentId, exerciseId).filter(
    (s) => !excludeDate || s.date !== excludeDate
  );
  if (!sets.length) return null;
  const pr = sets.reduce((max, s) => (s.weight > max.weight ? s : max), sets[0]);
  return { maxWeight: pr.weight, maxReps: pr.reps };
}

/** Id de un ejercicio anotado a mano. Igual que en el entreno libre. */
export const freeExerciseId = (name: string) =>
  "free:" + name.trim().toLowerCase().replace(/\s+/g, "-");

/** Reconstruye un nombre presentable de un id libre: `free:press-banca` → "Press banca". */
function nameFromId(exerciseId: string): string | null {
  if (!exerciseId.startsWith("free:")) return null;
  const raw = exerciseId.slice(5).replace(/-/g, " ").trim();
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : null;
}

export interface LoggedDay {
  date: string;
  sets: (LoggedSet & { name: string })[];
}

/**
 * Todo lo anotado, agrupado por día (del más reciente al más viejo).
 *
 * Deja afuera las series sin nombre resoluble: son las del plan del coach,
 * cuyo id es un uuid de `routine_exercises` que acá no significa nada. Ésas ya
 * se ven dentro de su rutina; el anotador muestra lo que anotaste vos.
 */
export function getLoggedHistory(studentId: string): LoggedDay[] {
  const byDate = new Map<string, (LoggedSet & { name: string })[]>();

  // Se recorre al revés para que dentro del día quede primero lo último
  // anotado. Ordenar por `setNumber` no sirve: es por ejercicio, así que la
  // serie 1 de lo que acabás de anotar caía abajo de la serie 3 de lo anterior.
  const all = read(studentId);
  for (let i = all.length - 1; i >= 0; i--) {
    const s = all[i];
    const name = s.name ?? nameFromId(s.exerciseId);
    if (!name) continue;
    const list = byDate.get(s.date) ?? [];
    list.push({ ...s, name });
    byDate.set(s.date, list);
  }

  return [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, sets]) => ({ date, sets }));
}

/** Cuántas series lleva ese ejercicio ese día (para numerar la siguiente). */
export function countSetsOn(studentId: string, exerciseId: string, date: string): number {
  return read(studentId).filter((s) => s.exerciseId === exerciseId && s.date === date).length;
}
