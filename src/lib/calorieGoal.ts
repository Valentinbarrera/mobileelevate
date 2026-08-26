/**
 * Objetivo calórico elegido por el alumno.
 *
 * Hasta acá el número salía SOLO del cuestionario: si el objetivo era bajar
 * grasa, déficit de 500 y listo. Pero el alumno sabe cosas que el cuestionario
 * no pregunta —viene de una etapa de volumen, el nutricionista le dio un número,
 * quiere aflojar el déficit esta semana— y no tenía dónde decirlo.
 *
 * Vive en localStorage por alumno: la base está congelada, y además esto es una
 * preferencia del dispositivo hasta que el coach pueda verla desde Elevate Web.
 */
import type { CalorieGoalMode } from "./nutritionCalc";
import { MAX_ADJUST } from "./nutritionCalc";

export type CalorieGoalPref =
  /** Lo que sale del cuestionario. Es el default. */
  | { kind: "auto" }
  /** Mismo cálculo, pero con el modo y el ajuste que eligió el alumno. */
  | { kind: "preset"; mode: CalorieGoalMode; adjust: number }
  /** Un número puesto a mano; ignora el cálculo. */
  | { kind: "manual"; calories: number };

export const AUTO: CalorieGoalPref = { kind: "auto" };

/** Rango plausible para un objetivo diario puesto a mano. */
export const MANUAL_MIN = 1000;
export const MANUAL_MAX = 6000;

const keyFor = (studentId: string) => `elevate_calorie_goal_${studentId}`;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Normaliza cualquier cosa que venga del storage a una preferencia válida. */
export function sanitize(raw: unknown): CalorieGoalPref {
  if (!raw || typeof raw !== "object") return AUTO;
  const v = raw as Record<string, unknown>;

  if (v.kind === "manual") {
    const n = Math.round(Number(v.calories));
    return Number.isFinite(n) ? { kind: "manual", calories: clamp(n, MANUAL_MIN, MANUAL_MAX) } : AUTO;
  }

  if (v.kind === "preset") {
    const mode = v.mode;
    if (mode !== "deficit" && mode !== "surplus" && mode !== "maintain") return AUTO;
    // Mantenimiento no lleva ajuste: guardarlo con uno sería mentirle al cálculo.
    const adjust = mode === "maintain" ? 0 : clamp(Math.round(Number(v.adjust) || 0), 0, MAX_ADJUST);
    return { kind: "preset", mode, adjust };
  }

  return AUTO;
}

export function loadCalorieGoal(studentId: string): CalorieGoalPref {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    return raw ? sanitize(JSON.parse(raw)) : AUTO;
  } catch {
    return AUTO;
  }
}

export function saveCalorieGoal(studentId: string, pref: CalorieGoalPref) {
  try {
    const clean = sanitize(pref);
    if (clean.kind === "auto") localStorage.removeItem(keyFor(studentId));
    else localStorage.setItem(keyFor(studentId), JSON.stringify(clean));
  } catch {
    /* storage lleno o bloqueado: se sigue con el cálculo automático */
  }
}

export const MODE_LABEL: Record<CalorieGoalMode, string> = {
  deficit: "Déficit",
  maintain: "Mantenimiento",
  surplus: "Volumen",
};

// ─── Resolución contra el plan del coach ──────────────────────────────────────

/** Quién manda hoy en el número que ve el alumno. */
export type GoalSource =
  /** El alumno definió el suyo y pisa al del coach. */
  | "own"
  /** La meta del plan que asignó el coach. */
  | "coach"
  /** Lo que derivó el cuestionario (no hay plan ni elección propia). */
  | "auto"
  /** No hay de dónde sacar un número. */
  | "none";

export interface ResolvedGoal {
  calories: number | null;
  source: GoalSource;
  /** La meta del coach, esté mandando o no: si el alumno la pisó, se muestra al lado. */
  coachCalories: number | null;
}

/**
 * Decide qué objetivo calórico manda.
 *
 * El bug que arregla: la card grande de Nutrición usaba SIEMPRE
 * `plan.calories_target`, así que el alumno tocaba "Cambiar", elegía 2800 y el
 * número grande le seguía diciendo "de 2500". Ahora hay una sola respuesta y las
 * dos pantallas (Nutrición e Historial) la piden acá.
 *
 * Orden: lo que eligió el alumno → el plan del coach → el cuestionario.
 * El default con plan asignado es el del coach: sólo lo pisa una elección
 * explícita (`pref.kind !== "auto"`).
 *
 * @param estimate el número que sale del cuestionario YA aplicando `pref`
 *                 (preset recalculado o el manual), o null si faltan datos.
 */
export function resolveCalorieGoal({
  pref,
  estimate,
  coachTarget,
}: {
  pref: CalorieGoalPref;
  estimate: number | null;
  coachTarget: number | null;
}): ResolvedGoal {
  const coach = coachTarget != null && coachTarget > 0 ? coachTarget : null;

  if (pref.kind !== "auto" && estimate != null) {
    return { calories: estimate, source: "own", coachCalories: coach };
  }
  if (coach != null) return { calories: coach, source: "coach", coachCalories: coach };
  if (estimate != null) return { calories: estimate, source: "auto", coachCalories: null };
  return { calories: null, source: "none", coachCalories: null };
}

export interface MacroTargets {
  protein: number | null;
  carbs: number | null;
  fats: number | null;
}

/**
 * Reescala los macros del coach a otra cantidad de calorías.
 *
 * Se usa sólo en el hueco raro: el alumno puso una meta a mano pero le faltan
 * datos del perfil, así que no se le pueden sugerir macros desde el peso. Dejar
 * los del coach sería mostrar barras que suman 2500 abajo de un objetivo de
 * 2800; escalarlas al menos no miente sobre el total.
 */
export function scaleMacros(
  macros: MacroTargets,
  fromCalories: number | null,
  toCalories: number | null,
): MacroTargets {
  if (!fromCalories || fromCalories <= 0 || !toCalories || toCalories <= 0) return macros;
  const ratio = toCalories / fromCalories;
  const scale = (v: number | null) => (v == null ? null : Math.round(v * ratio));
  return { protein: scale(macros.protein), carbs: scale(macros.carbs), fats: scale(macros.fats) };
}
