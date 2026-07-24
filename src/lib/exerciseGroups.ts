/**
 * Agrupado de ejercicios en BISERIES / SUPERSERIES.
 *
 * El esquema no tiene una columna de "grupo", así que usamos la convención
 * habitual: ejercicios CONSECUTIVOS marcados con el mismo `method`
 * (training_method / type) forman un bloque (A1, A2, …). Un método "normal" o
 * un ejercicio suelto no agrupa.
 */
import { isSpecialMethod } from "@/components/workout/ExerciseMeta";

export interface ExerciseGroupInfo {
  type: string; // método tal cual lo cargó el coach (biserie, superserie, …)
  letter: string; // A, B, C… del bloque
  position: number; // 1-based dentro del bloque
  size: number; // cantidad de ejercicios del bloque
}

export function computeExerciseGroups<T extends { id: string; method?: string | null }>(
  exercises: T[]
): Map<string, ExerciseGroupInfo> {
  const map = new Map<string, ExerciseGroupInfo>();
  let i = 0;
  let groupIdx = 0;

  while (i < exercises.length) {
    const method = exercises[i].method ?? null;
    if (isSpecialMethod(method)) {
      // corrida de consecutivos con el mismo método
      let j = i;
      while (j < exercises.length && (exercises[j].method ?? null) === method) j++;
      const size = j - i;
      if (size >= 2) {
        const letter = String.fromCharCode(65 + (groupIdx % 26));
        for (let k = i; k < j; k++) {
          map.set(exercises[k].id, { type: method as string, letter, position: k - i + 1, size });
        }
        groupIdx++;
      }
      i = j;
    } else {
      i++;
    }
  }

  return map;
}

/**
 * Igual que `computeExerciseGroups` pero además une ejercicios que el ALUMNO
 * marcó como biserie (`linkedIds`: ids unidos al anterior). Dos ejercicios
 * consecutivos quedan agrupados si comparten un método especial del coach O si
 * el segundo está en `linkedIds`. Si el bloque no tiene método del coach, se
 * rotula como "biserie".
 */
export function computeExerciseGroupsWithLinks<
  T extends { id: string; method?: string | null }
>(exercises: T[], linkedIds: Set<string>): Map<string, ExerciseGroupInfo> {
  const map = new Map<string, ExerciseGroupInfo>();
  let i = 0;
  let groupIdx = 0;

  const connected = (a: T, b: T) => {
    const am = a.method ?? null;
    const bm = b.method ?? null;
    const sameMethod = isSpecialMethod(am) && am === bm;
    return sameMethod || linkedIds.has(b.id);
  };

  while (i < exercises.length) {
    let j = i + 1;
    while (j < exercises.length && connected(exercises[j - 1], exercises[j])) j++;
    const size = j - i;
    if (size >= 2) {
      const letter = String.fromCharCode(65 + (groupIdx % 26));
      const coachMethod = isSpecialMethod(exercises[i].method ?? null)
        ? (exercises[i].method as string)
        : "biserie";
      for (let k = i; k < j; k++) {
        map.set(exercises[k].id, { type: coachMethod, letter, position: k - i + 1, size });
      }
      groupIdx++;
    }
    i = j;
  }

  return map;
}
