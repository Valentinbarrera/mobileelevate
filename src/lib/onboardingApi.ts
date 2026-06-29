/**
 * Persistencia del cuestionario de onboarding en Supabase (tabla athlete_onboarding).
 * Requiere correr scripts/setup-onboarding.sql en el dashboard. Mientras no exista
 * la tabla, las llamadas fallan suave y la app sigue con el guardado local.
 *
 * La tabla aún no está en los tipos generados de Supabase, así que accedemos vía
 * un cliente sin tipar (aislado en este archivo) para no romper el typecheck.
 */
import { supabase } from "@/integrations/supabase/client";
import { OnboardingData, emptyOnboarding } from "./onboarding";

// Cliente sin tipar SOLO para esta tabla nueva (hasta regenerar types.ts).
const sb = supabase as unknown as {
  from: (table: string) => {
    select: (cols: string) => { eq: (c: string, v: string) => { maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: unknown }> } };
    upsert: (row: Record<string, unknown>, opts: { onConflict: string }) => Promise<{ error: unknown }>;
  };
};

const TABLE = "athlete_onboarding";

const toRow = (studentId: string, d: OnboardingData): Record<string, unknown> => ({
  student_id: studentId,
  sex: d.sex,
  age: d.age,
  height_cm: d.heightCm,
  weight_kg: d.weightKg,
  experience: d.experience,
  mastered_exercises: d.masteredExercises,
  injury_areas: d.injuryAreas,
  injury_notes: d.injuryNotes || null,
  goal: d.goal,
  priorities: d.priorities,
  equipment: d.equipment,
  activity_level: d.activityLevel,
  meals_per_day: d.mealsPerDay,
  dietary_restrictions: d.dietaryRestrictions,
  nutrition_notes: d.nutritionNotes || null,
  training_mode: d.trainingMode,
  days_per_week: d.daysPerWeek,
  split: d.split,
  program_weeks: d.programWeeks,
  completed_at: d.completedAt,
  updated_at: new Date().toISOString(),
});

const num = (v: unknown): number | null => (v == null ? null : Number(v));
const str = (v: unknown): string => (v == null ? "" : String(v));
const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

const fromRow = (r: Record<string, unknown>): OnboardingData => ({
  ...emptyOnboarding(),
  sex: (r.sex as OnboardingData["sex"]) ?? null,
  age: num(r.age),
  heightCm: num(r.height_cm),
  weightKg: num(r.weight_kg),
  experience: (r.experience as OnboardingData["experience"]) ?? null,
  masteredExercises: arr(r.mastered_exercises),
  injuryAreas: arr(r.injury_areas),
  injuryNotes: str(r.injury_notes),
  goal: (r.goal as OnboardingData["goal"]) ?? null,
  priorities: arr(r.priorities),
  equipment: arr(r.equipment),
  activityLevel: (r.activity_level as OnboardingData["activityLevel"]) ?? null,
  mealsPerDay: num(r.meals_per_day),
  dietaryRestrictions: arr(r.dietary_restrictions),
  nutritionNotes: str(r.nutrition_notes),
  trainingMode: (r.training_mode as OnboardingData["trainingMode"]) ?? null,
  daysPerWeek: num(r.days_per_week),
  split: (r.split as string) ?? null,
  programWeeks: num(r.program_weeks),
  completedAt: (r.completed_at as string) ?? null,
});

/** Trae el cuestionario del alumno desde Supabase (null si no hay o falla). */
export async function fetchOnboardingRemote(studentId: string): Promise<OnboardingData | null> {
  try {
    const { data, error } = await sb.from(TABLE).select("*").eq("student_id", studentId).maybeSingle();
    if (error || !data) return null;
    return fromRow(data);
  } catch {
    return null;
  }
}

/** Guarda (upsert) el cuestionario del alumno en Supabase. */
export async function saveOnboardingRemote(studentId: string, d: OnboardingData): Promise<boolean> {
  try {
    const { error } = await sb.from(TABLE).upsert(toRow(studentId, d), { onConflict: "student_id" });
    if (error) {
      if (import.meta.env.DEV) console.warn("onboarding remote save failed:", error);
      return false;
    }
    return true;
  } catch (e) {
    if (import.meta.env.DEV) console.warn("onboarding remote save threw:", e);
    return false;
  }
}
