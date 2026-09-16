/**
 * Sugerencia de carga para la primera serie de hoy (doble progresión).
 *
 * Mira la última sesión del ejercicio —la serie más pesada y el RIR que anotó
 * el alumno— contra el rango de reps prescripto:
 *  - Llegó al tope del rango sin quedarse sin resto → sube peso y vuelve al piso.
 *  - Le sobró mucho resto (RIR alto) → sube peso aunque no haya llegado al tope.
 *  - No llegó al piso y fue al fallo → baja un poco el peso.
 *  - Si no → mismo peso, una rep más.
 *
 * Es cálculo puro, sin IA: es una sugerencia que precarga los campos, el
 * alumno la pisa cuando quiera.
 */

export interface PastSet {
  weight: number;
  reps: number;
  /** RIR anotado por el alumno en esa serie, si lo cargó. */
  rir: number | null;
}

export type SuggestionKind = "subir" | "mantener" | "bajar";

export interface LoadSuggestion {
  weight: number;
  reps: number;
  kind: SuggestionKind;
  /** Frase corta que explica el porqué, en voz de entrenador. */
  reason: string;
}

/** "8-12" → [8, 12] · "10" → [10, 10] · "AMRAP" → null */
export function parseRepRange(reps: string | null | undefined): [number, number] | null {
  const nums = (reps ?? "").match(/\d+/g)?.map(Number) ?? [];
  if (nums.length === 0) return null;
  const low = Math.min(nums[0], nums[1] ?? nums[0]);
  const high = Math.max(nums[0], nums[1] ?? nums[0]);
  return [low, high];
}

/** Salto de carga: 2,5 kg en general, 1 kg con pesos livianos. */
const stepFor = (weight: number) => (weight < 10 ? 1 : 2.5);

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

export const formatKg = (kg: number) =>
  Number.isInteger(kg) ? String(kg) : kg.toFixed(1).replace(".", ",");

export function suggestLoad(
  lastSession: PastSet[],
  repsPrescribed: string | null | undefined,
  targetRir: number | null | undefined
): LoadSuggestion | null {
  const valid = lastSession.filter((s) => s.reps > 0);
  if (valid.length === 0) return null;

  // Serie de referencia: la más pesada; a igual peso, la de más reps.
  const top = valid.reduce((best, s) =>
    s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps) ? s : best
  );

  const range = parseRepRange(repsPrescribed) ?? [top.reps, top.reps];
  const [low, high] = range;
  const rirGoal = targetRir ?? 2;
  const step = stepFor(top.weight);

  // Peso corporal: no hay kilos que mover, se progresa en reps.
  if (top.weight <= 0) {
    return top.reps >= high
      ? { weight: 0, reps: high + 1, kind: "subir", reason: "Llegaste al tope: sumá una rep más" }
      : { weight: 0, reps: Math.max(low, top.reps + 1), kind: "mantener", reason: "Buscá una rep más que la vez pasada" };
  }

  const leftInTank = top.rir;

  if (top.reps < low && leftInTank != null && leftInTank <= 1) {
    const weight = Math.max(step, roundTo(top.weight * 0.95, step));
    return {
      weight,
      reps: low,
      kind: "bajar",
      reason: `La vez pasada no llegaste a ${low} reps: bajá un poco y hacelas bien`,
    };
  }

  const reachedTop = top.reps >= high && (leftInTank == null || leftInTank >= Math.max(0, rirGoal - 1));
  const tooEasy = leftInTank != null && leftInTank >= rirGoal + 2 && top.reps >= low;

  if (reachedTop || tooEasy) {
    return {
      weight: roundTo(top.weight + step, step),
      reps: low,
      kind: "subir",
      reason: reachedTop
        ? `Hiciste ${formatKg(top.weight)} kg × ${top.reps}: tocá subir`
        : `Te sobraron ${leftInTank} reps: tocá subir`,
    };
  }

  return {
    weight: top.weight,
    reps: Math.min(high, Math.max(low, top.reps + 1)),
    kind: "mantener",
    reason: `Mismo peso que la vez pasada, buscá una rep más`,
  };
}
