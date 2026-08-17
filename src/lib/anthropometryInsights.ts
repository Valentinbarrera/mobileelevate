/**
 * Derivados de una evaluación de antropometría: reparto de masas para el anillo
 * de composición, comparación contra la evaluación anterior y series históricas
 * para los gráficos. Todo cálculo puro y determinista, sin IA.
 */
import type { AnthropometryEvaluation } from "@/lib/evaluations";
import { FIELDS_BY_ID } from "@/types/evaluation";
import type { MeasurementValues } from "@/types/evaluation";

export const numeric = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

export interface CompositionSlice {
  id: string;
  label: string;
  kg: number;
  /** Porcentaje sobre el peso total. */
  pct: number;
  color: string;
}

/** Masas del fraccionamiento, en el orden en que se muestran. */
const MASS_SLICES: { id: string; label: string; color: string }[] = [
  { id: "muscle_mass", label: "Masa muscular", color: "#f97316" },
  { id: "fat_mass", label: "Masa adiposa", color: "#eab308" },
  { id: "bone_mass", label: "Masa ósea", color: "#3b82f6" },
  { id: "residual_mass", label: "Masa residual", color: "#a855f7" },
  { id: "skin_mass", label: "Piel", color: "#ec4899" },
];

const REST_COLOR = "#52525b";

/**
 * Reparto de masas sobre el peso total. Si las masas cargadas no llegan al peso
 * (fraccionamiento incompleto) se agrega un tramo "Otros" en vez de inflar los
 * porcentajes: preferimos mostrar el hueco a mentir el reparto.
 */
export function compositionBreakdown(values: MeasurementValues): {
  weight: number | null;
  slices: CompositionSlice[];
} {
  const weight = numeric(values.weight) ?? numeric(values.total_body_mass);

  const present = MASS_SLICES.map((s) => ({ ...s, kg: numeric(values[s.id]) })).filter(
    (s): s is typeof s & { kg: number } => s.kg !== null && s.kg > 0
  );

  if (present.length === 0) return { weight, slices: [] };

  const sum = present.reduce((acc, s) => acc + s.kg, 0);
  const total = weight && weight > sum ? weight : sum;

  const slices: CompositionSlice[] = present.map((s) => ({
    id: s.id,
    label: s.label,
    kg: s.kg,
    pct: (s.kg / total) * 100,
    color: s.color,
  }));

  const rest = total - sum;
  // Menos de 100 g de diferencia es ruido de redondeo, no un tramo real.
  if (rest > 0.1) {
    slices.push({
      id: "other",
      label: "Otros",
      kg: rest,
      pct: (rest / total) * 100,
      color: REST_COLOR,
    });
  }

  return { weight: total, slices };
}

/**
 * Hacia dónde es "mejorar" para cada variable. Las que dependen del objetivo
 * del alumno (peso, IMC) quedan sin dirección y se muestran en neutro: la app
 * no opina si bajar de peso es bueno.
 */
export const GOOD_DIRECTION: Record<string, "up" | "down"> = {
  muscle_mass: "up",
  muscle_percentage: "up",
  fat_mass: "down",
  body_fat_percentage: "down",
  muscle_bone_index: "up",
};

export interface FieldDelta {
  value: number;
  /** Diferencia contra la evaluación anterior (null si no hay con qué comparar). */
  diff: number | null;
  /** Fecha de la evaluación con la que se comparó. */
  comparedTo: string | null;
}

export function deltaFor(
  fieldId: string,
  current: AnthropometryEvaluation,
  previous: AnthropometryEvaluation | null
): FieldDelta | null {
  const value = numeric(current.values[fieldId]);
  if (value === null) return null;

  const before = previous ? numeric(previous.values[fieldId]) : null;
  return {
    value,
    diff: before === null ? null : Number((value - before).toFixed(2)),
    comparedTo: before === null ? null : previous!.date,
  };
}

/**
 * Serie histórica de un campo, de la más vieja a la más nueva (como la esperan
 * los gráficos).
 */
export function seriesFor(
  fieldId: string,
  evaluations: AnthropometryEvaluation[]
): { date: string; value: number }[] {
  return evaluations
    .map((e) => ({ date: e.date, value: numeric(e.values[fieldId]) }))
    .filter((p): p is { date: string; value: number } => p.value !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Cuántos valores efectivamente cargados tiene la evaluación. */
export function countFilled(values: MeasurementValues): number {
  return Object.entries(values).filter(
    ([, v]) => v !== null && v !== undefined && v !== ""
  ).length;
}

/** Formatea el valor con los decimales y la unidad del catálogo. */
export function formatValue(fieldId: string, value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const field = FIELDS_BY_ID[fieldId];
  if (!field || field.type === "text") return String(value);
  const n = numeric(value);
  if (n === null) return String(value);
  return n.toFixed(field.decimals ?? 1);
}

/** "Hace 12 días" / "Hace 1 mes" — el subtítulo que acompaña a cada fecha. */
export function relativeDate(date: string, today = new Date()): string {
  const then = new Date(`${date}T00:00:00`);
  const days = Math.floor((today.getTime() - then.getTime()) / 86_400_000);
  if (days <= 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 30) return `Hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months === 1) return "Hace 1 mes";
  if (months < 12) return `Hace ${months} meses`;
  const years = Math.floor(months / 12);
  return years === 1 ? "Hace 1 año" : `Hace ${years} años`;
}

const MONTHS_SHORT = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

/**
 * "16 Ago 2026". A mano y no con `toLocaleDateString`, porque en es-AR devuelve
 * "16 de ago. de 2026" y queda largo y con puntos en las tarjetas.
 */
export function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}
