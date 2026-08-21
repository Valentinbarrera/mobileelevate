/**
 * El cuestionario suma tres datos que usa el generador de plan (sessionMinutes,
 * injurySeverity, avoidedExercises) y que viven en columnas que agrega
 * scripts/add-onboarding-plan-fields.sql.
 *
 * Un upsert de PostgREST es todo-o-nada: si UNA columna no existe, se pierde el
 * cuestionario ENTERO, no sólo ese campo. Por eso `saveOnboardingRemote`
 * reintenta sin esas tres columnas. Estos tests fijan las dos mitades:
 * con la migración corrida se mandan, sin ella se guarda igual el resto.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

type Row = Record<string, unknown>;

/** Columnas que existen en la tabla simulada. La cambia cada test. */
let existingColumns: Set<string> | null = null; // null = la tabla acepta todo
const upsertCalls: Row[] = [];

const upsert = vi.fn(async (row: Row) => {
  upsertCalls.push(row);
  if (existingColumns) {
    const missing = Object.keys(row).find((c) => !existingColumns!.has(c));
    if (missing) {
      return { error: { code: "42703", message: `column "${missing}" does not exist` } };
    }
  }
  return { error: null };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ upsert }) },
}));

import { saveOnboardingRemote } from "@/lib/onboardingApi";
import { emptyOnboarding } from "@/lib/onboarding";

const SID = "11111111-2222-3333-4444-555555555555";

const datos = () => ({
  ...emptyOnboarding(),
  sex: "masculino" as const,
  age: 30,
  sessionMinutes: 45,
  injurySeverity: "molestia" as const,
  avoidedExercises: ["Peso muerto"],
});

beforeEach(() => {
  upsert.mockClear();
  upsertCalls.length = 0;
  existingColumns = null;
});

describe("saveOnboardingRemote", () => {
  it("manda los tres campos del generador cuando la columna existe", async () => {
    const ok = await saveOnboardingRemote(SID, datos());

    expect(ok).toBe(true);
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(upsertCalls[0]).toMatchObject({
      session_minutes: 45,
      injury_severity: "molestia",
      avoided_exercises: ["Peso muerto"],
    });
  });

  it("si falta la columna, reintenta sin ella y NO pierde el resto del cuestionario", async () => {
    // La tabla vieja: todo menos las tres columnas nuevas.
    existingColumns = new Set([
      "student_id", "sex", "age", "height_cm", "weight_kg", "experience",
      "mastered_exercises", "injury_areas", "injury_notes", "goal",
      "priorities", "equipment", "activity_level", "meals_per_day",
      "dietary_restrictions", "nutrition_notes", "training_mode",
      "days_per_week", "split", "program_weeks", "completed_at", "updated_at",
    ]);

    const ok = await saveOnboardingRemote(SID, datos());

    expect(ok).toBe(true);
    expect(upsert).toHaveBeenCalledTimes(2); // el intento completo + el reintento
    // El reintento va sin las tres columnas nuevas...
    expect(upsertCalls[1]).not.toHaveProperty("session_minutes");
    expect(upsertCalls[1]).not.toHaveProperty("injury_severity");
    expect(upsertCalls[1]).not.toHaveProperty("avoided_exercises");
    // ...pero con el cuestionario completo.
    expect(upsertCalls[1]).toMatchObject({ student_id: SID, sex: "masculino", age: 30 });
  });

  it("un error que no sea de columna faltante no dispara reintento", async () => {
    upsert.mockImplementationOnce(async () => ({ error: { code: "42501", message: "permission denied" } }));

    const ok = await saveOnboardingRemote(SID, datos());

    expect(ok).toBe(false);
    expect(upsert).toHaveBeenCalledTimes(1);
  });
});
