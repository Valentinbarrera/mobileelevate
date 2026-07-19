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
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 h

export function saveActiveWorkout(studentId: string, snap: ActiveWorkoutSnapshot) {
  try {
    localStorage.setItem(keyFor(studentId), JSON.stringify(snap));
  } catch {
    /* almacenamiento no disponible */
  }
}

/**
 * Devuelve la sesión en curso si existe, es de HOY, es reciente y tiene al menos
 * una serie cargada. Si está vencida o es de otro día, la limpia y devuelve null.
 */
export function loadActiveWorkout(studentId: string, todayDate: string): ActiveWorkoutSnapshot | null {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    if (!raw) return null;
    const snap = JSON.parse(raw) as ActiveWorkoutSnapshot;
    if (snap.date !== todayDate || Date.now() - snap.savedAt > MAX_AGE_MS) {
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

export function clearActiveWorkout(studentId: string) {
  try {
    localStorage.removeItem(keyFor(studentId));
  } catch {
    /* no-op */
  }
}
