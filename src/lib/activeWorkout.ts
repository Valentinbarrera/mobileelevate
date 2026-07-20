/**
 * Persistencia de la sesión de entreno EN CURSO, para poder "reanudar" si la app
 * se cierra o se va a segundo plano a mitad del entrenamiento. Local por alumno.
 *
 * Las series individuales ya se loguean aparte (workoutLog); esto guarda el
 * estado vivo (qué ejercicio, series hechas, cronómetro y la sesión de DB) para
 * reconstruir la pantalla tal como estaba, reusando el mismo completed_session.
 */
export interface PersistedSet {
  setNumber: number;
  weight: number;
  reps: number;
  difficulty: string;
  completedAt: string; // ISO
}

export interface PersistedExerciseState {
  id: string;
  completed: boolean;
  currentSet: number;
  completedSets: PersistedSet[];
  extraSets?: number;
}

export interface ActiveWorkoutSnapshot {
  routineDayId: string;
  routineName?: string;
  session: { id: string; plannedSessionId: string | null; routineDayId: string; date: string };
  exerciseStates: PersistedExerciseState[];
  activeExerciseId: string | null;
  orderIds: string[];
  startedAt: number; // ms (ancla del cronómetro)
  pausedTotal: number; // ms acumulados en pausa
  date: string; // fecha local (yyyy-mm-dd)
  savedAt: number; // ms
}

const keyFor = (studentId: string) => `elevate_active_workout_${studentId}`;
/**
 * Una sesión a medias se puede retomar hasta 7 días después: el alumno arranca
 * el entreno, lo corta, y lo termina otro día. Pasado ese plazo ya no tiene
 * sentido continuarla y se descarta.
 */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function saveActiveWorkout(studentId: string, snap: ActiveWorkoutSnapshot) {
  try {
    localStorage.setItem(keyFor(studentId), JSON.stringify(snap));
  } catch {
    /* almacenamiento no disponible */
  }
}

/**
 * Devuelve la sesión a medias si existe, no está vencida y tiene al menos una
 * serie cargada. Puede ser de un día anterior: el alumno puede retomarla.
 * Si está vencida, la limpia y devuelve null.
 */
export function loadActiveWorkout(studentId: string, _todayDate?: string): ActiveWorkoutSnapshot | null {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    if (!raw) return null;
    const snap = JSON.parse(raw) as ActiveWorkoutSnapshot;
    if (Date.now() - snap.savedAt > MAX_AGE_MS) {
      clearActiveWorkout(studentId);
      return null;
    }
    const anySets = snap.exerciseStates.some((s) => s.completedSets.length > 0);
    if (!anySets) return null;
    return snap;
  } catch {
    return null;
  }
}

/** Tiempo de entreno ya acumulado cuando se guardó (para no contar el tiempo ausente). */
export const elapsedAtSave = (snap: ActiveWorkoutSnapshot) =>
  Math.max(0, snap.savedAt - snap.startedAt - snap.pausedTotal);

/** Texto para el prompt de reanudar: "hoy", "ayer" o "hace N días". */
export function snapshotAge(snap: ActiveWorkoutSnapshot, todayDate: string): string {
  if (snap.date === todayDate) return "hoy";
  const days = Math.round(
    (new Date(todayDate + "T00:00:00").getTime() - new Date(snap.date + "T00:00:00").getTime()) /
      86_400_000
  );
  if (days === 1) return "ayer";
  return days > 1 ? `hace ${days} días` : "hoy";
}

export function clearActiveWorkout(studentId: string) {
  try {
    localStorage.removeItem(keyFor(studentId));
  } catch {
    /* no-op */
  }
}
