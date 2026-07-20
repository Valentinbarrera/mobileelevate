/**
 * Plan ACTIVO del alumno: qué programa manda hoy.
 *
 * Hasta ahora el programa del coach era siempre el que definía qué tocaba
 * entrenar, y los programas propios del alumno quedaban como algo aparte: se
 * podían entrenar, pero la app no los reconocía como "su plan". Desde que se
 * entrenan con la misma pantalla que los del coach, esa ambigüedad se nota.
 *
 * La regla es: UN SOLO plan activo a la vez. O el del coach (por defecto) o uno
 * propio. El activo es el que aparece en Inicio y el que se ofrece en Entrenar.
 *
 * Es una preferencia del alumno en ESTE dispositivo, así que vive en
 * localStorage. Cambiarla no toca nada del coach ni borra ningún programa.
 */
import type { MyProgram, ProgramDay } from "@/lib/myPrograms";

export type ActivePlan = { type: "coach" } | { type: "own"; programId: string };

const COACH_PLAN: ActivePlan = { type: "coach" };

const keyFor = (studentId: string) => `elevate_active_plan_${studentId}`;

export function loadActivePlan(studentId: string): ActivePlan {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    if (!raw) return COACH_PLAN;
    const parsed = JSON.parse(raw) as ActivePlan;
    if (parsed?.type === "own" && typeof parsed.programId === "string") return parsed;
    return COACH_PLAN;
  } catch {
    return COACH_PLAN;
  }
}

export function setActivePlan(studentId: string, plan: ActivePlan) {
  try {
    localStorage.setItem(keyFor(studentId), JSON.stringify(plan));
  } catch {
    /* almacenamiento no disponible */
  }
}

/** Vuelve al plan del coach (es el default, así que alcanza con olvidar). */
export function clearActivePlan(studentId: string) {
  try {
    localStorage.removeItem(keyFor(studentId));
  } catch {
    /* almacenamiento no disponible */
  }
}

export const isOwnPlanActive = (plan: ActivePlan, programId: string) =>
  plan.type === "own" && plan.programId === programId;

// ── Qué día toca del programa propio ────────────────────────────────────────
// Un programa propio no tiene calendario: sus días son una rotación (A, B, C, A…).
// En vez de atarlo a fechas —que obligaría a inventar una agenda que el alumno
// no eligió— se lleva un cursor que avanza cada vez que termina un día. Así la
// app puede decir "te toca el Día B" sin mentir sobre el calendario.

const cursorKeyFor = (studentId: string, programId: string) =>
  `elevate_plan_cursor_${studentId}_${programId}`;

export function getPlanCursor(studentId: string, programId: string): number {
  try {
    const raw = localStorage.getItem(cursorKeyFor(studentId, programId));
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** Día que le toca ahora (y su posición), o null si el programa no tiene días. */
export function nextProgramDay(
  studentId: string,
  program: MyProgram
): { day: ProgramDay; index: number } | null {
  if (!program.days.length) return null;
  const index = getPlanCursor(studentId, program.id) % program.days.length;
  return { day: program.days[index], index };
}

/** Avanza al día siguiente de la rotación. Se llama al terminar un entreno. */
export function advancePlanCursor(studentId: string, programId: string, daysCount: number) {
  if (daysCount <= 0) return;
  try {
    const next = (getPlanCursor(studentId, programId) + 1) % daysCount;
    localStorage.setItem(cursorKeyFor(studentId, programId), String(next));
  } catch {
    /* almacenamiento no disponible */
  }
}

/**
 * Si el alumno entrena un día salteado (no el que le tocaba), el cursor se
 * planta en el siguiente a ESE, que es lo que espera: seguir desde donde quedó.
 */
export function setPlanCursorAfter(
  studentId: string,
  programId: string,
  dayIndex: number,
  daysCount: number
) {
  if (daysCount <= 0) return;
  try {
    localStorage.setItem(cursorKeyFor(studentId, programId), String((dayIndex + 1) % daysCount));
  } catch {
    /* almacenamiento no disponible */
  }
}
