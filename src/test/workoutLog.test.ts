import { describe, it, expect, beforeEach } from "vitest";
import {
  logSet,
  getLoggedHistory,
  countSetsOn,
  freeExerciseId,
  deleteLoggedSet,
} from "@/lib/workoutLog";

const SID = "u1";

const anotar = (name: string, date: string, setNumber: number, weight: number, reps: number) =>
  logSet(SID, { exerciseId: freeExerciseId(name), date, setNumber, weight, reps, name });

describe("workoutLog · getLoggedHistory", () => {
  beforeEach(() => localStorage.clear());

  it("agrupa por día, del más reciente al más viejo", () => {
    anotar("Sentadilla", "2026-08-24", 1, 100, 8);
    anotar("Press banca", "2026-08-26", 1, 60, 10);

    expect(getLoggedHistory(SID).map((d) => d.date)).toEqual(["2026-08-26", "2026-08-24"]);
  });

  it("dentro del día, lo último anotado va primero aunque sea la serie 1", () => {
    // El bug que fija: ordenar por setNumber ponía la serie 3 de sentadilla
    // arriba del press banca que se acababa de anotar.
    anotar("Sentadilla", "2026-08-26", 1, 100, 8);
    anotar("Sentadilla", "2026-08-26", 2, 100, 7);
    anotar("Press banca", "2026-08-26", 1, 60, 10);

    expect(getLoggedHistory(SID)[0].sets.map((s) => `${s.name} ${s.reps}`)).toEqual([
      "Press banca 10",
      "Sentadilla 7",
      "Sentadilla 8",
    ]);
  });

  it("reconstruye el nombre de las series viejas, que no lo guardaban", () => {
    logSet(SID, { exerciseId: "free:press-banca", date: "2026-08-26", setNumber: 1, weight: 60, reps: 10 });

    expect(getLoggedHistory(SID)[0].sets[0].name).toBe("Press banca");
  });

  it("deja afuera las series del plan del coach, cuyo id no dice nada", () => {
    logSet(SID, {
      exerciseId: "9f1c0c2e-0000-4000-8000-000000000000",
      date: "2026-08-26",
      setNumber: 1,
      weight: 80,
      reps: 5,
    });
    anotar("Sentadilla", "2026-08-26", 1, 100, 8);

    const sets = getLoggedHistory(SID)[0].sets;
    expect(sets).toHaveLength(1);
    expect(sets[0].name).toBe("Sentadilla");
  });

  it("no rompe con el storage vacío", () => {
    expect(getLoggedHistory(SID)).toEqual([]);
  });
});

describe("workoutLog · countSetsOn", () => {
  beforeEach(() => localStorage.clear());

  it("cuenta sólo ese ejercicio en esa fecha", () => {
    anotar("Sentadilla", "2026-08-26", 1, 100, 8);
    anotar("Sentadilla", "2026-08-26", 2, 100, 7);
    anotar("Sentadilla", "2026-08-25", 1, 95, 8);
    anotar("Press banca", "2026-08-26", 1, 60, 10);

    expect(countSetsOn(SID, freeExerciseId("Sentadilla"), "2026-08-26")).toBe(2);
    expect(countSetsOn(SID, freeExerciseId("Remo"), "2026-08-26")).toBe(0);
  });

  it("después de borrar una serie, la siguiente no repite número", () => {
    const id = freeExerciseId("Sentadilla");
    anotar("Sentadilla", "2026-08-26", 1, 100, 8);
    anotar("Sentadilla", "2026-08-26", 2, 100, 7);
    deleteLoggedSet(SID, id, "2026-08-26", 2);

    expect(countSetsOn(SID, id, "2026-08-26") + 1).toBe(2);
  });
});

describe("workoutLog · freeExerciseId", () => {
  it("normaliza el nombre igual que el entreno libre", () => {
    expect(freeExerciseId("  Press   Banca ")).toBe("free:press-banca");
    expect(freeExerciseId("Sentadilla")).toBe("free:sentadilla");
  });
});
