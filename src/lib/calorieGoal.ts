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
