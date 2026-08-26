/**
 * El objetivo calórico del alumno, ya resuelto contra el plan del coach.
 *
 * Vive acá y no adentro de cada página porque Nutrición y el Historial tienen
 * que mostrar el MISMO número: cuando cada una lo derivaba por su cuenta, el
 * anillo del día y el del historial podían decir cosas distintas.
 */
import { useCallback, useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { loadOnboarding } from "@/lib/onboarding";
import {
  inputsFromOnboarding,
  defaultModeForGoal,
  computeTarget,
  suggestMacros,
  type CalorieInputs,
  type CalorieResult,
  type CalorieGoalMode,
  type MacroSuggestion,
} from "@/lib/nutritionCalc";
import {
  loadCalorieGoal,
  saveCalorieGoal,
  resolveCalorieGoal,
  type CalorieGoalPref,
  type ResolvedGoal,
} from "@/lib/calorieGoal";

export interface CalorieGoalState {
  /** Lo que el alumno tiene elegido hoy (auto / preset / a mano). */
  pref: CalorieGoalPref;
  /** Guarda la elección y re-renderiza. */
  save: (pref: CalorieGoalPref) => void;
  /** Datos del cuestionario para el cálculo; null si faltan. */
  inputs: CalorieInputs | null;
  /** Modo y ajuste que derivó el objetivo del cuestionario. */
  autoPreset: { mode: CalorieGoalMode; adjust: number };
  /** El cálculo sin la elección del alumno (para poder volver a él). */
  autoResult: CalorieResult | null;
  /** El número propio del alumno: el cálculo YA con su elección aplicada. */
  estimate: number | null;
  /** Macros sugeridos para `estimate` desde el peso; null si faltan datos. */
  macros: MacroSuggestion | null;
  /** Quién manda: el alumno, el coach o el cuestionario. */
  resolved: ResolvedGoal;
}

export function useCalorieGoal(coachTarget: number | null): CalorieGoalState {
  const { student, isAdminMode } = useAuthContext();
  const sid = student?.id || (isAdminMode ? "admin" : "anon");

  const ob = loadOnboarding(sid);
  const inputs = inputsFromOnboarding(ob);
  const autoPreset = defaultModeForGoal(ob.goal);
  const autoResult = inputs ? computeTarget(inputs, autoPreset.mode, autoPreset.adjust) : null;

  const [pref, setPref] = useState<CalorieGoalPref>(() => loadCalorieGoal(sid));

  // Con un preset propio se recalcula sobre los mismos inputs; a mano, el número
  // se usa tal cual; en auto queda lo que derivó el cuestionario.
  const chosen =
    inputs && pref.kind === "preset" ? computeTarget(inputs, pref.mode, pref.adjust) : autoResult;
  const estimate = pref.kind === "manual" ? pref.calories : chosen?.target ?? null;
  const macros = estimate != null && inputs ? suggestMacros(estimate, inputs.weightKg) : null;

  const save = useCallback(
    (next: CalorieGoalPref) => {
      saveCalorieGoal(sid, next);
      setPref(next);
    },
    [sid],
  );

  return {
    pref,
    save,
    inputs,
    autoPreset,
    autoResult,
    estimate,
    macros,
    resolved: resolveCalorieGoal({ pref, estimate, coachTarget }),
  };
}
