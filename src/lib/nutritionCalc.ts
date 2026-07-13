/**
 * Motor de cálculo de calorías — 100% fórmula, SIN IA.
 *
 * Estima el gasto energético con el método Harris-Benedict revisado
 * (Roza & Shizgal, 1984) y aplica un objetivo (déficit / equilibrio / superávit)
 * elegido por el alumno. Es un cálculo estándar y citable, no una recomendación
 * "generada": el mismo input siempre da el mismo número.
 *
 * Guardrails de seguridad (requisito App Store 1.4.1 — Physical Harm): nunca
 * devuelve una meta por debajo de un piso seguro ni permite ajustes peligrosos.
 * Es orientativo y no reemplaza el consejo de un profesional (ver NutritionDisclaimer).
 */
import type { ActivityLevel, Goal, Sex } from "./onboarding";

export type CalorieGoalMode = "deficit" | "maintain" | "surplus";

export interface CalorieInputs {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
}

/** Factores de actividad estándar aplicados al metabolismo basal. */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  very_high: 1.9,
};

/** Piso de calorías por sexo — nunca recomendar por debajo de esto (seguridad). */
export const CALORIE_FLOOR: Record<Sex, number> = {
  male: 1500,
  female: 1200,
};

/** Ajuste máximo permitido por día — evita déficits/superávits peligrosos. */
export const MAX_ADJUST = 1000;

/** Metabolismo basal (BMR) — Harris-Benedict revisada (Roza & Shizgal, 1984). */
export function calcBMR({ sex, age, heightCm, weightKg }: CalorieInputs): number {
  if (sex === "male") {
    return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  }
  return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
}

/** Gasto energético total diario (TDEE) = BMR × factor de actividad = mantenimiento. */
export function calcTDEE(inputs: CalorieInputs): number {
  return calcBMR(inputs) * ACTIVITY_FACTORS[inputs.activityLevel];
}

export interface CalorieResult {
  bmr: number;
  tdee: number; // mantenimiento
  target: number; // objetivo final, ya con guardrails aplicados
  appliedAdjust: number; // ajuste real aplicado (puede ser menor al pedido por el cap)
  clampedToFloor: boolean; // true si se topó contra el piso de seguridad
}

/**
 * Aplica el objetivo al mantenimiento con guardrails.
 * `adjust` = kcal a restar (déficit) o sumar (superávit); en "maintain" se ignora.
 */
export function computeTarget(
  inputs: CalorieInputs,
  mode: CalorieGoalMode,
  adjust: number
): CalorieResult {
  const bmr = calcBMR(inputs);
  const tdee = calcTDEE(inputs);
  const safeAdjust = Math.min(Math.max(0, Math.abs(adjust)), MAX_ADJUST);

  let target = tdee;
  if (mode === "deficit") target = tdee - safeAdjust;
  else if (mode === "surplus") target = tdee + safeAdjust;

  const floor = CALORIE_FLOOR[inputs.sex];
  const clampedToFloor = mode === "deficit" && target < floor;
  if (clampedToFloor) target = floor;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target: Math.round(target),
    appliedAdjust: mode === "maintain" ? 0 : safeAdjust,
    clampedToFloor,
  };
}

/** Preset de modo + ajuste sugerido a partir del objetivo del onboarding. */
export function defaultModeForGoal(goal: Goal | null): { mode: CalorieGoalMode; adjust: number } {
  switch (goal) {
    case "lose_fat":
      return { mode: "deficit", adjust: 500 };
    case "gain_muscle":
      return { mode: "surplus", adjust: 300 };
    case "performance":
      return { mode: "surplus", adjust: 200 };
    case "recomp":
    case "maintain":
    default:
      return { mode: "maintain", adjust: 0 };
  }
}

export interface MacroSuggestion {
  protein: number;
  fats: number;
  carbs: number;
}

/**
 * Reparto de macros orientativo y determinístico:
 * proteína 1.8 g/kg, grasas 25% de las kcal, el resto en carbohidratos.
 */
export function suggestMacros(target: number, weightKg: number): MacroSuggestion {
  const protein = Math.round(1.8 * weightKg);
  const fats = Math.round((target * 0.25) / 9);
  const carbKcal = Math.max(0, target - protein * 4 - fats * 9);
  const carbs = Math.round(carbKcal / 4);
  return { protein, fats, carbs };
}

/** Arma los inputs desde el onboarding; devuelve null si falta algún dato. */
export function inputsFromOnboarding(o: {
  sex: Sex | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: ActivityLevel | null;
}): CalorieInputs | null {
  if (!o.sex || !o.age || !o.heightCm || !o.weightKg || !o.activityLevel) return null;
  return {
    sex: o.sex,
    age: o.age,
    heightCm: o.heightCm,
    weightKg: o.weightKg,
    activityLevel: o.activityLevel,
  };
}
