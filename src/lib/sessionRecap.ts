/**
 * Resumen por ejercicio del entreno que acaba de terminar: volumen de hoy
 * contra la vez pasada y si hubo récord de peso. Lee el registro local
 * (workoutLog), que se escribe en cada serie venga de un plan del coach o de un
 * programa propio.
 */
import { getLastSessionSets, getPR } from "./workoutLog";

export interface RecapExercise {
  name: string;
  sets: number;
  /** kg × reps sumado de hoy */
  volume: number;
  /** Mismo cálculo de la última sesión anterior; null si es la primera vez. */
  prevVolume: number | null;
  best: { weight: number; reps: number };
  /** Superó el peso máximo que tenía registrado antes de hoy. */
  isPR: boolean;
}

export interface SessionRecap {
  exercises: RecapExercise[];
  totalVolume: number;
  /** Volumen de la vez pasada, solo de los ejercicios que tienen con qué comparar. */
  prevComparableVolume: number;
  /** Volumen de hoy de esos mismos ejercicios (para comparar peras con peras). */
  comparableVolume: number;
  prCount: number;
}

const volumeOf = (sets: { weight: number; reps: number }[]) =>
  sets.reduce((acc, s) => acc + (s.weight || 0) * (s.reps || 0), 0);

export function buildSessionRecap(
  studentId: string,
  today: string,
  done: { id: string; name: string; sets: { weight: number; reps: number }[] }[]
): SessionRecap {
  const exercises: RecapExercise[] = [];
  let totalVolume = 0;
  let prevComparableVolume = 0;
  let comparableVolume = 0;

  for (const ex of done) {
    if (ex.sets.length === 0) continue;
    const volume = volumeOf(ex.sets);
    const prevSets = getLastSessionSets(studentId, ex.id, today);
    const prevVolume = prevSets.length ? volumeOf(prevSets) : null;
    const prevPR = getPR(studentId, ex.id, today);
    const best = ex.sets.reduce((b, s) =>
      s.weight > b.weight || (s.weight === b.weight && s.reps > b.reps) ? s : b
    );
    const isPR = !!prevPR && best.weight > 0 && best.weight > prevPR.maxWeight;

    totalVolume += volume;
    if (prevVolume != null) {
      prevComparableVolume += prevVolume;
      comparableVolume += volume;
    }
    exercises.push({
      name: ex.name,
      sets: ex.sets.length,
      volume,
      prevVolume,
      best: { weight: best.weight, reps: best.reps },
      isPR,
    });
  }

  return {
    exercises,
    totalVolume: Math.round(totalVolume),
    prevComparableVolume: Math.round(prevComparableVolume),
    comparableVolume: Math.round(comparableVolume),
    prCount: exercises.filter((e) => e.isPR).length,
  };
}
