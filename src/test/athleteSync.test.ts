/**
 * La sincronización de los datos local-first (readiness, feedback, programas,
 * notas, peso) es BEST-EFFORT: mientras no se corra scripts/setup-athlete-sync.sql
 * las tablas no existen y Supabase devuelve error. Estos tests fijan la garantía
 * de que, pase lo que pase con el remoto, el guardado LOCAL sigue funcionando y
 * nada lanza — que es lo que mantiene la app usable sin la migración corrida.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// El cliente de Supabase se reemplaza por uno que SIEMPRE falla, simulando el
// peor caso (tabla inexistente / sin red).
const upsert = vi.fn(async () => ({ error: { message: "relation does not exist" } }));
const select = vi.fn(() => {
  const q = {
    eq: () => q,
    order: () => q,
    then: (resolve: (v: unknown) => unknown) =>
      resolve({ data: null, error: { message: "relation does not exist" } }),
  };
  return q;
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      upsert,
      select,
      delete: () => {
        const q = {
          eq: () => q,
          then: (resolve: (v: unknown) => unknown) =>
            resolve({ data: null, error: { message: "relation does not exist" } }),
        };
        return q;
      },
    }),
  },
}));

import { saveReadiness, getReadinessForDate } from "@/lib/readiness";
import { saveExerciseFeedback, getExerciseFeedback } from "@/lib/exerciseFeedback";
import { saveExerciseNote, getExerciseNote } from "@/lib/exerciseNotes";
import { saveMyProgram, loadMyPrograms, deleteMyProgram, emptyProgram } from "@/lib/myPrograms";
import { pushMyProgram, pushReadiness } from "@/lib/athleteSyncApi";

const SID = "11111111-2222-3333-4444-555555555555"; // alumno real (uuid)

beforeEach(() => {
  localStorage.clear();
  upsert.mockClear();
  select.mockClear();
});

describe("sync best-effort: el guardado local nunca depende del remoto", () => {
  it("readiness se guarda local aunque Supabase falle", () => {
    expect(() =>
      saveReadiness(SID, "2026-07-19", {
        sleep: 4,
        energy: 4,
        recovery: 3,
        stress: 5,
        motivation: 5,
      })
    ).not.toThrow();

    const saved = getReadinessForDate(SID, "2026-07-19");
    expect(saved?.vitality).toBe(80); // promedio 4.2 → (4.2-1)/4 = 80
  });

  it("el feedback de ejercicio se guarda local aunque Supabase falle", () => {
    saveExerciseFeedback(SID, {
      date: "2026-07-19",
      exerciseId: "ex-1",
      exerciseName: "Press banca",
      stimulus: 4,
      jointPain: 1,
    });
    expect(getExerciseFeedback(SID, "2026-07-19", "ex-1")?.stimulus).toBe(4);
  });

  it("la nota de ejercicio se guarda y se borra local aunque Supabase falle", () => {
    saveExerciseNote(SID, "ex-1", { text: "subir el banco", pinned: true, date: "2026-07-19" });
    expect(getExerciseNote(SID, "ex-1", "2026-07-19")?.text).toBe("subir el banco");

    saveExerciseNote(SID, "ex-1", { text: "  ", pinned: true, date: "2026-07-19" });
    expect(getExerciseNote(SID, "ex-1", "2026-07-19")).toBeNull();
  });

  it("los programas propios se crean y se borran local aunque Supabase falle", () => {
    const p = { ...emptyProgram(), name: "Full Body" };
    saveMyProgram(SID, p);
    expect(loadMyPrograms(SID).map((x) => x.name)).toEqual(["Full Body"]);

    deleteMyProgram(SID, p.id);
    expect(loadMyPrograms(SID)).toEqual([]);
  });
});

describe("guardas antes de tocar la red", () => {
  it("el modo admin/demo no escribe en la base", async () => {
    await pushReadiness("admin", {
      date: "2026-07-19",
      sleep: 3,
      energy: 3,
      recovery: 3,
      stress: 3,
      motivation: 3,
      vitality: 50,
    });
    expect(upsert).not.toHaveBeenCalled();
  });

  it("un programa con id no-uuid no se sube (la columna es uuid)", async () => {
    const ok = await pushMyProgram(SID, { ...emptyProgram(), id: "1752900000000-123456" });
    expect(ok).toBe(false);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("un programa con id uuid sí intenta subirse (y tolera el error)", async () => {
    const ok = await pushMyProgram(SID, emptyProgram());
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(ok).toBe(false); // el remoto falló, pero no lanzó
  });
});
