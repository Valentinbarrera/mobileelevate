/**
 * Ajustes del alumno sobre la sesión de HOY: cambiar un ejercicio por otro,
 * sacarlo del día, sumar uno extra y reordenar.
 *
 * La rutina del coach es de SOLO LECTURA para el alumno, así que nada de esto
 * la toca: es una capa de override local que se aplica encima al renderizar.
 *
 * "Solo para hoy" está garantizado por la CLAVE, que incluye la fecha: mañana
 * la sesión vuelve a arrancar tal cual la armó el coach. Se guarda en
 * localStorage (y no en memoria) para que sobreviva a recargar la app o a
 * reanudar el entreno, que es justo cuando el alumno ya hizo sus cambios.
 *
 * Este módulo maneja SOLO los datos del plan (ids, reemplazos, extras, orden).
 * El armado de la lista final de ejercicios vive en la página, que es donde se
 * conoce el tipo concreto del ejercicio del coach.
 */

/** Ejercicio elegido de la biblioteca (para reemplazar o para sumar). */
export interface PickedExercise {
  exerciseId: string; // id real de la tabla `exercises`
  name: string;
  muscleGroup?: string | null;
  equipment?: string | null;
  videoUrl?: string | null;
  thumbnail?: string | null;
}

/** Ejercicio EXTRA que el alumno sumó al día (no está en la rutina del coach). */
export interface ExtraExercise extends PickedExercise {
  id: string; // id local con prefijo (ver EXTRA_PREFIX)
  sets: number;
  reps: string;
  restSeconds: number | null;
}

export interface SessionPlan {
  /** ids de ejercicios del coach que el alumno sacó de la sesión de hoy */
  removed: string[];
  /** id del ejercicio del coach → ejercicio por el que lo cambió */
  replaced: Record<string, PickedExercise>;
  /** ejercicios sumados por el alumno */
  extras: ExtraExercise[];
  /** orden final elegido (ids del coach + ids de extras) */
  order: string[];
}

export const emptyPlan = (): SessionPlan => ({
  removed: [],
  replaced: {},
  extras: [],
  order: [],
});

/** Los ejercicios que NO son del coach llevan este prefijo en el id. */
const EXTRA_PREFIX = "extra:";

export const isExtraId = (id: string) => id.startsWith(EXTRA_PREFIX);

export const newExtraId = () =>
  `${EXTRA_PREFIX}${
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.round(Math.random() * 1e6)}`
  }`;

/**
 * ¿Este ejercicio se puede guardar en `completed_exercises`? Solo los del coach:
 * la columna `routine_exercise_id` apunta a su rutina, así que un extra rompería
 * la FK y un reemplazo guardaría los kilos bajo el ejercicio equivocado. Ambos
 * se registran solo en el historial local (que igual alimenta PRs y "la vez pasada").
 */
export const isCoachPrescribed = (plan: SessionPlan, exerciseId: string) =>
  !isExtraId(exerciseId) && !plan.replaced[exerciseId];

const KEY_PREFIX = "elevate_sessionplan_";
const keyFor = (studentId: string, routineDayId: string, date: string) =>
  `${KEY_PREFIX}${studentId}_${routineDayId}_${date}`;

/** Borra los planes de días anteriores (son de un solo día, no se acumulan). */
function pruneOldPlans(today: string) {
  try {
    const stale: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(KEY_PREFIX) && !k.endsWith(`_${today}`)) stale.push(k);
    }
    stale.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function loadSessionPlan(
  studentId: string,
  routineDayId: string,
  date: string
): SessionPlan {
  pruneOldPlans(date);
  try {
    const raw = localStorage.getItem(keyFor(studentId, routineDayId, date));
    if (!raw) return emptyPlan();
    const parsed = JSON.parse(raw) as Partial<SessionPlan>;
    return {
      removed: Array.isArray(parsed.removed) ? parsed.removed : [],
      replaced: parsed.replaced && typeof parsed.replaced === "object" ? parsed.replaced : {},
      extras: Array.isArray(parsed.extras) ? parsed.extras : [],
      order: Array.isArray(parsed.order) ? parsed.order : [],
    };
  } catch {
    return emptyPlan();
  }
}

export function saveSessionPlan(
  studentId: string,
  routineDayId: string,
  date: string,
  plan: SessionPlan
) {
  try {
    localStorage.setItem(keyFor(studentId, routineDayId, date), JSON.stringify(plan));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function clearSessionPlan(studentId: string, routineDayId: string, date: string) {
  try {
    localStorage.removeItem(keyFor(studentId, routineDayId, date));
  } catch {
    /* almacenamiento no disponible */
  }
}

/** ¿El alumno tocó algo? (para mostrar el aviso y el botón de restaurar) */
export const planHasChanges = (plan: SessionPlan) =>
  plan.removed.length > 0 || plan.extras.length > 0 || Object.keys(plan.replaced).length > 0;

// ── Mutadores puros (devuelven un plan nuevo) ───────────────────────────────

/** Saca un ejercicio del día. Si era un extra, lo elimina del todo. */
export function removeFromPlan(plan: SessionPlan, exerciseId: string): SessionPlan {
  if (isExtraId(exerciseId)) {
    return {
      ...plan,
      extras: plan.extras.filter((e) => e.id !== exerciseId),
      order: plan.order.filter((id) => id !== exerciseId),
    };
  }
  const replaced = { ...plan.replaced };
  delete replaced[exerciseId]; // si estaba cambiado, el reemplazo ya no aplica
  return {
    ...plan,
    removed: plan.removed.includes(exerciseId) ? plan.removed : [...plan.removed, exerciseId],
    replaced,
    order: plan.order.filter((id) => id !== exerciseId),
  };
}

/** Deshace un "sacar del día" (vuelve a la rutina del coach). */
export function restoreToPlan(plan: SessionPlan, exerciseId: string): SessionPlan {
  return { ...plan, removed: plan.removed.filter((id) => id !== exerciseId) };
}

/**
 * Cambia un ejercicio por otro. Mantiene series/reps/descanso del coach: lo que
 * cambia es el MOVIMIENTO, no la prescripción. En un extra, edita el extra.
 */
export function replaceInPlan(
  plan: SessionPlan,
  exerciseId: string,
  picked: PickedExercise
): SessionPlan {
  if (isExtraId(exerciseId)) {
    return {
      ...plan,
      extras: plan.extras.map((e) => (e.id === exerciseId ? { ...e, ...picked } : e)),
    };
  }
  return { ...plan, replaced: { ...plan.replaced, [exerciseId]: picked } };
}

/** Deshace un cambio de ejercicio (vuelve al que prescribió el coach). */
export function undoReplaceInPlan(plan: SessionPlan, exerciseId: string): SessionPlan {
  const replaced = { ...plan.replaced };
  delete replaced[exerciseId];
  return { ...plan, replaced };
}

/** Suma un ejercicio al final del día. */
export function addToPlan(plan: SessionPlan, extra: ExtraExercise): SessionPlan {
  return {
    ...plan,
    extras: [...plan.extras, extra],
    order: plan.order.length ? [...plan.order, extra.id] : [],
  };
}

/** Mueve un ejercicio una posición arriba (-1) o abajo (+1) dentro de `ids`. */
export function moveInOrder(ids: string[], id: string, dir: -1 | 1): string[] {
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return ids;
  const next = [...ids];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}
