/**
 * Plantillas de SPLIT (esqueleto de días) para el wizard de programas.
 * Sólo definen la estructura de días (nombres + foco muscular sugerido); el
 * alumno después llena los ejercicios de cada día. Redacción propia de Elevate.
 *
 * Cada preset declara para cuántos días/semana aplica; el wizard muestra los que
 * coinciden con lo elegido, más la opción "Desde cero".
 */
import { newId, type ProgramDay } from "@/lib/myPrograms";

export interface SplitDay {
  name: string;
  /** grupos musculares sugeridos (ids de muscleGroups) para pre-orientar el día */
  focus: string[];
}

export interface SplitPreset {
  id: string;
  name: string;
  daysPerWeek: number;
  /** chips cortos que resumen el split */
  tags: string[];
  description: string;
  days: SplitDay[];
}

export const SPLIT_PRESETS: SplitPreset[] = [
  // ── 1 día ──
  {
    id: "fb-1",
    name: "Full Body",
    daysPerWeek: 1,
    tags: ["Full Body"],
    description: "Todo el cuerpo en una sola sesión. Ideal si entrenás una vez por semana o estás arrancando.",
    days: [{ name: "Full Body", focus: ["piernas", "espalda", "pecho", "hombros"] }],
  },

  // ── 2 días ──
  {
    id: "ul-2",
    name: "Torso / Pierna",
    daysPerWeek: 2,
    tags: ["Torso", "Pierna"],
    description: "Un día de tren superior y otro de tren inferior. Buena frecuencia con poco tiempo.",
    days: [
      { name: "Torso", focus: ["pecho", "espalda", "hombros", "biceps", "triceps"] },
      { name: "Pierna", focus: ["cuadriceps", "isquios", "gluteos", "gemelos"] },
    ],
  },
  {
    id: "fb-2",
    name: "Full Body x2",
    daysPerWeek: 2,
    tags: ["Full Body A", "Full Body B"],
    description: "Dos sesiones de cuerpo completo con distinto énfasis. Máximo estímulo por sesión.",
    days: [
      { name: "Full Body A", focus: ["piernas", "espalda", "pecho"] },
      { name: "Full Body B", focus: ["piernas", "hombros", "biceps", "triceps"] },
    ],
  },

  // ── 3 días ──
  {
    id: "ppl-3",
    name: "Push / Pull / Legs",
    daysPerWeek: 3,
    tags: ["Empuje", "Tirón", "Pierna"],
    description: "El clásico PPL: empuje (pecho/hombro/tríceps), tirón (espalda/bíceps) y pierna. Ordenado y escalable.",
    days: [
      { name: "Empuje", focus: ["pecho", "hombros", "triceps"] },
      { name: "Tirón", focus: ["espalda", "biceps"] },
      { name: "Pierna", focus: ["cuadriceps", "isquios", "gluteos", "gemelos"] },
    ],
  },
  {
    id: "fb-3",
    name: "Full Body x3",
    daysPerWeek: 3,
    tags: ["A", "B", "C"],
    description: "Cuerpo completo tres veces por semana. Alta frecuencia por grupo, excelente para principiantes e intermedios.",
    days: [
      { name: "Full Body A", focus: ["piernas", "pecho", "espalda"] },
      { name: "Full Body B", focus: ["piernas", "hombros", "espalda"] },
      { name: "Full Body C", focus: ["piernas", "pecho", "biceps", "triceps"] },
    ],
  },

  // ── 4 días ──
  {
    id: "ul-4",
    name: "Torso / Pierna x2",
    daysPerWeek: 4,
    tags: ["Torso A", "Pierna A", "Torso B", "Pierna B"],
    description: "Upper/Lower dos veces por semana. Frecuencia 2x por grupo, la más respaldada para hipertrofia.",
    days: [
      { name: "Torso A", focus: ["pecho", "espalda", "hombros"] },
      { name: "Pierna A", focus: ["cuadriceps", "gluteos", "gemelos"] },
      { name: "Torso B", focus: ["espalda", "hombros", "biceps", "triceps"] },
      { name: "Pierna B", focus: ["isquios", "gluteos", "cuadriceps"] },
    ],
  },

  // ── 5 días ──
  {
    id: "bro-5",
    name: "Split por grupo",
    daysPerWeek: 5,
    tags: ["Pecho", "Espalda", "Pierna", "Hombro", "Brazo"],
    description: "Un grupo grande por día. Mucho volumen por sesión, popular para trabajo de detalle.",
    days: [
      { name: "Pecho", focus: ["pecho"] },
      { name: "Espalda", focus: ["espalda"] },
      { name: "Pierna", focus: ["cuadriceps", "isquios", "gluteos", "gemelos"] },
      { name: "Hombro", focus: ["hombros"] },
      { name: "Brazo", focus: ["biceps", "triceps"] },
    ],
  },
  {
    id: "glute-5",
    name: "Enfoque Glúteo",
    daysPerWeek: 5,
    tags: ["Glúteo A", "Torso", "Glúteo B", "Pierna", "Glúteo C"],
    description: "Máximo volumen semanal de glúteo repartido en 3 días, con torso y pierna de apoyo.",
    days: [
      { name: "Glúteo A", focus: ["gluteos", "isquios"] },
      { name: "Torso", focus: ["espalda", "hombros", "pecho"] },
      { name: "Glúteo B", focus: ["gluteos", "cuadriceps"] },
      { name: "Pierna", focus: ["cuadriceps", "gemelos"] },
      { name: "Glúteo C", focus: ["gluteos", "isquios"] },
    ],
  },

  // ── 6 días ──
  {
    id: "ppl-6",
    name: "Push / Pull / Legs x2",
    daysPerWeek: 6,
    tags: ["Empuje", "Tirón", "Pierna", "×2"],
    description: "PPL dos veces por semana. Máxima frecuencia y volumen para avanzados con buena recuperación.",
    days: [
      { name: "Empuje A", focus: ["pecho", "hombros", "triceps"] },
      { name: "Tirón A", focus: ["espalda", "biceps"] },
      { name: "Pierna A", focus: ["cuadriceps", "gluteos", "gemelos"] },
      { name: "Empuje B", focus: ["hombros", "pecho", "triceps"] },
      { name: "Tirón B", focus: ["espalda", "biceps"] },
      { name: "Pierna B", focus: ["isquios", "gluteos", "cuadriceps"] },
    ],
  },
];

/** Presets disponibles para una cantidad de días/semana dada. */
export function presetsForDays(daysPerWeek: number): SplitPreset[] {
  return SPLIT_PRESETS.filter((p) => p.daysPerWeek === daysPerWeek);
}

/** Convierte un preset en los ProgramDay vacíos (listos para llenar). */
export function daysFromPreset(preset: SplitPreset): ProgramDay[] {
  return preset.days.map((d) => ({ id: newId(), name: d.name, exercises: [] }));
}

/** Días genéricos vacíos ("Día 1..N") para "empezar de cero". */
export function blankDays(count: number): ProgramDay[] {
  return Array.from({ length: Math.max(1, count) }, (_, i) => ({
    id: newId(),
    name: `Día ${i + 1}`,
    exercises: [],
  }));
}
