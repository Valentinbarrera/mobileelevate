/**
 * Cuestionario de intake del alumno (onboarding). Captura el contexto que el
 * coach necesita para programar: datos corporales, experiencia, ejercicios que
 * domina, lesiones, objetivo, prioridades, equipamiento, actividad diaria,
 * datos nutricionales y la config del programa. SIN motor de calorías.
 *
 * Fase 1: persistencia LOCAL (mismo patrón que workoutLog/checkins). La Fase 2
 * lo sube a Supabase para que lo vea el coach (ver scripts/setup-onboarding.sql).
 */

export type Sex = "male" | "female";
export type Experience = "beginner" | "intermediate" | "advanced";
export type Goal = "lose_fat" | "gain_muscle" | "recomp" | "maintain" | "performance";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "high" | "very_high";
export type TrainingMode = "weekly" | "free_cycle";

export interface OnboardingData {
  // Datos corporales
  sex: Sex | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  // Experiencia
  experience: Experience | null;
  // Ejercicios que domina
  masteredExercises: string[];
  // Lesiones / molestias
  injuryAreas: string[];
  injuryNotes: string;
  // Objetivo + prioridades
  goal: Goal | null;
  priorities: string[];
  // Equipamiento
  equipment: string[];
  // Actividad diaria
  activityLevel: ActivityLevel | null;
  // Datos nutricionales (contexto para el coach, sin cálculo)
  mealsPerDay: number | null;
  dietaryRestrictions: string[];
  nutritionNotes: string;
  // Programa
  trainingMode: TrainingMode | null;
  daysPerWeek: number | null;
  /**
   * Días concretos que entrena el alumno. Índices 0=Lun … 6=Dom (ver WEEKDAYS).
   * Es la fuente de verdad del calendario semanal; `daysPerWeek` se deriva de
   * su longitud (daysPerWeek === trainingDays.length).
   */
  trainingDays: number[];
  split: string | null;
  programWeeks: number | null;
  // Meta
  completedAt: string | null;
}

export const emptyOnboarding = (): OnboardingData => ({
  sex: null,
  age: null,
  heightCm: null,
  weightKg: null,
  experience: null,
  masteredExercises: [],
  injuryAreas: [],
  injuryNotes: "",
  goal: null,
  priorities: [],
  equipment: [],
  activityLevel: null,
  mealsPerDay: null,
  dietaryRestrictions: [],
  nutritionNotes: "",
  trainingMode: null,
  daysPerWeek: null,
  trainingDays: [],
  split: null,
  programWeeks: null,
  completedAt: null,
});

// ───────── Opciones (datos puros, sin JSX) ─────────
type Opt<T extends string = string> = { value: T; label: string; desc?: string };

export const SEX_OPTIONS: Opt<Sex>[] = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Femenino" },
];

export const EXPERIENCE_OPTIONS: Opt<Experience>[] = [
  { value: "beginner", label: "Principiante", desc: "Menos de 1 año entrenando o recién arrancando" },
  { value: "intermediate", label: "Intermedio", desc: "1 a 3 años, técnica sólida en básicos" },
  { value: "advanced", label: "Avanzado", desc: "+3 años, entrenás con periodización" },
];

export const MASTERED_EXERCISES = [
  "Sentadilla", "Sentadilla frontal", "Sentadilla búlgara", "Prensa",
  "Peso muerto", "Peso muerto rumano", "Peso muerto sumo", "Hip thrust",
  "Estocadas", "Extensión de cuádriceps", "Curl femoral", "Gemelos",
  "Press banca", "Press inclinado", "Aperturas", "Fondos", "Pull over",
  "Press militar", "Elevaciones laterales", "Face pull",
  "Dominadas", "Jalón al pecho", "Remo con barra", "Remo en máquina",
  "Curl de bíceps", "Press francés", "Abdominales", "Plancha",
];

export const INJURY_AREAS = [
  "Hombro", "Codo", "Muñeca", "Cuello", "Espalda alta",
  "Espalda baja (lumbar)", "Cadera", "Rodilla", "Tobillo",
];

export const GOAL_OPTIONS: Opt<Goal>[] = [
  { value: "lose_fat", label: "Perder grasa", desc: "Bajar % de grasa manteniendo músculo" },
  { value: "gain_muscle", label: "Ganar músculo", desc: "Hipertrofia / aumentar masa" },
  { value: "recomp", label: "Recomposición", desc: "Bajar grasa y ganar músculo a la vez" },
  { value: "maintain", label: "Mantener", desc: "Sostener tu estado actual" },
  { value: "performance", label: "Rendimiento / fuerza", desc: "Más fuerte y atlético" },
];

export const PRIORITY_MUSCLES = [
  "Pecho", "Espalda", "Hombros", "Bíceps", "Tríceps", "Cuádriceps",
  "Isquios", "Glúteos", "Gemelos", "Core / abdomen",
  "Fuerza", "Resistencia", "Movilidad", "Postura",
];

export const EQUIPMENT_OPTIONS = [
  "Gimnasio completo", "Mancuernas", "Barra y discos", "Máquinas / poleas",
  "Bandas elásticas", "Kettlebells", "Banco", "Solo peso corporal",
];

export const ACTIVITY_OPTIONS: Opt<ActivityLevel>[] = [
  { value: "sedentary", label: "Sedentario", desc: "Trabajo de escritorio, poco movimiento" },
  { value: "light", label: "Ligero", desc: "Camino un poco / actividad leve diaria" },
  { value: "moderate", label: "Moderado", desc: "Bastante de pie o caminando" },
  { value: "high", label: "Alto", desc: "Trabajo físico o muy activo" },
  { value: "very_high", label: "Muy alto", desc: "Trabajo físico pesado + deporte" },
];

export const DIETARY_RESTRICTIONS = [
  "Ninguna", "Vegetariano", "Vegano", "Sin gluten", "Sin lactosa",
  "Keto / low carb", "Alergias (anotar abajo)",
];

export const TRAINING_MODE_OPTIONS: Opt<TrainingMode>[] = [
  { value: "weekly", label: "Por semana", desc: "Rutina fija de lunes a domingo" },
  { value: "free_cycle", label: "Ciclo libre", desc: "Días encadenados sin atarlos al calendario" },
];

export const SPLIT_OPTIONS = [
  "Full body", "Torso / Pierna", "Empuje · Tirón · Pierna (PPL)",
  "Arnold split", "Weider (1 grupo por día)", "Que lo decida el coach",
];

export const PROGRAM_WEEKS_OPTIONS = [4, 6, 8, 12];

/** Labels de los días de la semana. Índice 0=Lun … 6=Dom (ver trainingDays). */
export const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// ───────── Persistencia local ─────────
const keyFor = (studentId: string) => `elevate_onboarding_${studentId}`;

export function loadOnboarding(studentId: string): OnboardingData {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    if (raw) return { ...emptyOnboarding(), ...(JSON.parse(raw) as Partial<OnboardingData>) };
  } catch {
    /* almacenamiento no disponible */
  }
  return emptyOnboarding();
}

export function saveOnboarding(studentId: string, data: OnboardingData) {
  try {
    localStorage.setItem(keyFor(studentId), JSON.stringify(data));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function isOnboardingComplete(studentId: string): boolean {
  return !!loadOnboarding(studentId).completedAt;
}
