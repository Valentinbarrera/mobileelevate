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
