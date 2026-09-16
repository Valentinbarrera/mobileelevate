import { describe, it, expect, beforeEach } from "vitest";
import { buildSessionRecap } from "@/lib/sessionRecap";
import { logSet } from "@/lib/workoutLog";

const SID = "test-recap";

describe("buildSessionRecap", () => {
  beforeEach(() => localStorage.clear());

  it("compara con la vez pasada y detecta récords", () => {
    logSet(SID, { exerciseId: "press", date: "2026-09-10", setNumber: 1, weight: 60, reps: 10 });
    logSet(SID, { exerciseId: "press", date: "2026-09-10", setNumber: 2, weight: 60, reps: 8 });
    // Lo de hoy ya está en el log cuando se arma el resumen
    logSet(SID, { exerciseId: "press", date: "2026-09-16", setNumber: 1, weight: 62.5, reps: 10 });

    const recap = buildSessionRecap(SID, "2026-09-16", [
      { id: "press", name: "Press banca", sets: [{ weight: 62.5, reps: 10 }, { weight: 60, reps: 10 }] },
      { id: "curl", name: "Curl", sets: [{ weight: 10, reps: 12 }] },
      { id: "nada", name: "Salteado", sets: [] },
    ]);

    expect(recap.exercises).toHaveLength(2);
    const press = recap.exercises[0];
    expect(press.volume).toBe(1225);
    expect(press.prevVolume).toBe(1080);
    expect(press.isPR).toBe(true);
    expect(recap.exercises[1]).toMatchObject({ prevVolume: null, isPR: false });
    expect(recap.totalVolume).toBe(1345);
    expect(recap.comparableVolume).toBe(1225);
    expect(recap.prevComparableVolume).toBe(1080);
    expect(recap.prCount).toBe(1);
  });
});
