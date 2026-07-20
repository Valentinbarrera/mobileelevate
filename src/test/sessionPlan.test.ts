/**
 * El plan de sesión es la capa de ajustes del alumno sobre la rutina del coach
 * (cambiar / sacar / sumar / reordenar ejercicios, solo por hoy). Como decide
 * qué se ve durante el entreno y qué se puede guardar en la base, estos tests
 * fijan las reglas: la rutina del coach nunca se toca, y los ejercicios que no
 * son suyos no pueden escribirse en completed_exercises.
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  emptyPlan,
  isExtraId,
  newExtraId,
  isCoachPrescribed,
  removeFromPlan,
  restoreToPlan,
  replaceInPlan,
  undoReplaceInPlan,
  addToPlan,
  moveInOrder,
  planHasChanges,
  loadSessionPlan,
  saveSessionPlan,
  type ExtraExercise,
} from "@/lib/sessionPlan";

const PICKED = { exerciseId: "lib-99", name: "Prensa 45°" };

const extra = (): ExtraExercise => ({
  id: newExtraId(),
  exerciseId: "lib-7",
  name: "Elevaciones laterales",
  sets: 3,
  reps: "12-15",
  restSeconds: 60,
});

beforeEach(() => localStorage.clear());

describe("qué se puede guardar en la base", () => {
  it("solo los ejercicios tal cual los prescribió el coach", () => {
    const plan = replaceInPlan(emptyPlan(), "coach-1", PICKED);
    // cambiado: guardaría los kilos bajo el ejercicio equivocado
    expect(isCoachPrescribed(plan, "coach-1")).toBe(false);
    // extra: su id no existe en la rutina → rompería la FK
    expect(isCoachPrescribed(plan, newExtraId())).toBe(false);
    // intacto: sí
    expect(isCoachPrescribed(plan, "coach-2")).toBe(true);
  });

  it("los ids de extras se distinguen de los del coach", () => {
    expect(isExtraId(newExtraId())).toBe(true);
    expect(isExtraId("f47ac10b-58cc-4372-a567-0e02b2c3d479")).toBe(false);
  });
});

describe("mutadores", () => {
  it("sacar un ejercicio del coach es reversible", () => {
    let plan = removeFromPlan(emptyPlan(), "coach-1");
    expect(plan.removed).toEqual(["coach-1"]);
    plan = restoreToPlan(plan, "coach-1");
    expect(plan.removed).toEqual([]);
  });

  it("sacar un ejercicio cambiado tambien descarta el reemplazo", () => {
    let plan = replaceInPlan(emptyPlan(), "coach-1", PICKED);
    plan = removeFromPlan(plan, "coach-1");
    expect(plan.replaced["coach-1"]).toBeUndefined();
  });

  it("sacar un extra lo elimina del todo, no lo marca como removido", () => {
    const e = extra();
    let plan = addToPlan(emptyPlan(), e);
    plan = removeFromPlan(plan, e.id);
    expect(plan.extras).toEqual([]);
    expect(plan.removed).toEqual([]);
  });

  it("un ejercicio ya cambiado se puede volver a cambiar", () => {
    let plan = replaceInPlan(emptyPlan(), "coach-1", PICKED);
    plan = replaceInPlan(plan, "coach-1", { exerciseId: "lib-42", name: "Hack squat" });
    expect(plan.replaced["coach-1"].name).toBe("Hack squat");
    expect(Object.keys(plan.replaced)).toHaveLength(1); // pisa, no acumula
  });

  it("cambiar un ejercicio se puede deshacer", () => {
    let plan = replaceInPlan(emptyPlan(), "coach-1", PICKED);
    expect(plan.replaced["coach-1"].name).toBe("Prensa 45°");
    plan = undoReplaceInPlan(plan, "coach-1");
    expect(plan.replaced["coach-1"]).toBeUndefined();
  });

  it("cambiar un extra edita el extra en vez de crear un reemplazo", () => {
    const e = extra();
    let plan = addToPlan(emptyPlan(), e);
    plan = replaceInPlan(plan, e.id, PICKED);
    expect(plan.replaced).toEqual({});
    expect(plan.extras[0].name).toBe("Prensa 45°");
    expect(plan.extras[0].sets).toBe(3); // conserva la prescripción
  });

  it("reordenar respeta los bordes", () => {
    const ids = ["a", "b", "c"];
    expect(moveInOrder(ids, "b", -1)).toEqual(["b", "a", "c"]);
    expect(moveInOrder(ids, "a", -1)).toEqual(ids); // ya es el primero
    expect(moveInOrder(ids, "c", 1)).toEqual(ids); // ya es el último
  });

  it("planHasChanges detecta si el alumno tocó algo", () => {
    expect(planHasChanges(emptyPlan())).toBe(false);
    expect(planHasChanges(removeFromPlan(emptyPlan(), "coach-1"))).toBe(true);
  });
});

describe("persistencia por día", () => {
  it("el plan se guarda y se recupera para el mismo día", () => {
    const plan = removeFromPlan(emptyPlan(), "coach-1");
    saveSessionPlan("sid", "day-1", "2026-07-19", plan);
    expect(loadSessionPlan("sid", "day-1", "2026-07-19").removed).toEqual(["coach-1"]);
  });

  it("al día siguiente la sesión vuelve a la rutina del coach", () => {
    saveSessionPlan("sid", "day-1", "2026-07-19", removeFromPlan(emptyPlan(), "coach-1"));
    expect(loadSessionPlan("sid", "day-1", "2026-07-20")).toEqual(emptyPlan());
  });

  it("los planes viejos se limpian solos", () => {
    saveSessionPlan("sid", "day-1", "2026-07-19", removeFromPlan(emptyPlan(), "coach-1"));
    loadSessionPlan("sid", "day-1", "2026-07-20"); // el load de hoy purga lo viejo
    expect(loadSessionPlan("sid", "day-1", "2026-07-19")).toEqual(emptyPlan());
  });
});
