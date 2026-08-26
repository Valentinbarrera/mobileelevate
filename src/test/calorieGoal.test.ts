import { describe, it, expect, beforeEach } from "vitest";
import {
  sanitize,
  loadCalorieGoal,
  saveCalorieGoal,
  AUTO,
  MANUAL_MIN,
  MANUAL_MAX,
  resolveCalorieGoal,
  scaleMacros,
} from "@/lib/calorieGoal";

describe("calorieGoal · sanitize", () => {
  it("cae en auto con basura", () => {
    for (const raw of [null, undefined, 0, "auto", [], { kind: "otra" }]) {
      expect(sanitize(raw)).toEqual(AUTO);
    }
  });

  it("acepta un número a mano y lo redondea", () => {
    expect(sanitize({ kind: "manual", calories: 2400.6 })).toEqual({ kind: "manual", calories: 2401 });
  });

  it("recorta números imposibles en vez de descartarlos", () => {
    expect(sanitize({ kind: "manual", calories: 50 })).toEqual({ kind: "manual", calories: MANUAL_MIN });
    expect(sanitize({ kind: "manual", calories: 99999 })).toEqual({ kind: "manual", calories: MANUAL_MAX });
  });

  it("descarta un manual no numérico", () => {
    expect(sanitize({ kind: "manual", calories: "muchas" })).toEqual(AUTO);
  });

  it("acepta los tres modos", () => {
    expect(sanitize({ kind: "preset", mode: "deficit", adjust: 500 })).toEqual({
      kind: "preset",
      mode: "deficit",
      adjust: 500,
    });
    expect(sanitize({ kind: "preset", mode: "surplus", adjust: 300 })).toEqual({
      kind: "preset",
      mode: "surplus",
      adjust: 300,
    });
  });

  it("mantenimiento nunca guarda ajuste", () => {
    expect(sanitize({ kind: "preset", mode: "maintain", adjust: 400 })).toEqual({
      kind: "preset",
      mode: "maintain",
      adjust: 0,
    });
  });

  it("rechaza un modo inventado", () => {
    expect(sanitize({ kind: "preset", mode: "turbo", adjust: 500 })).toEqual(AUTO);
  });

  it("recorta un ajuste desmedido", () => {
    const r = sanitize({ kind: "preset", mode: "deficit", adjust: 9000 });
    expect(r).toMatchObject({ kind: "preset", mode: "deficit" });
    expect((r as { adjust: number }).adjust).toBeLessThanOrEqual(1000);
  });

  it("no acepta un ajuste negativo", () => {
    expect(sanitize({ kind: "preset", mode: "deficit", adjust: -200 })).toEqual({
      kind: "preset",
      mode: "deficit",
      adjust: 0,
    });
  });
});

describe("calorieGoal · persistencia", () => {
  beforeEach(() => localStorage.clear());

  it("sin nada guardado devuelve auto", () => {
    expect(loadCalorieGoal("u1")).toEqual(AUTO);
  });

  it("guarda y recupera", () => {
    saveCalorieGoal("u1", { kind: "manual", calories: 2400 });
    expect(loadCalorieGoal("u1")).toEqual({ kind: "manual", calories: 2400 });
  });

  it("volver a auto borra lo guardado", () => {
    saveCalorieGoal("u1", { kind: "manual", calories: 2400 });
    saveCalorieGoal("u1", AUTO);
    expect(loadCalorieGoal("u1")).toEqual(AUTO);
    expect(localStorage.getItem("elevate_calorie_goal_u1")).toBeNull();
  });

  it("cada alumno tiene el suyo", () => {
    saveCalorieGoal("u1", { kind: "manual", calories: 2400 });
    saveCalorieGoal("u2", { kind: "preset", mode: "surplus", adjust: 300 });
    expect(loadCalorieGoal("u1")).toEqual({ kind: "manual", calories: 2400 });
    expect(loadCalorieGoal("u2")).toEqual({ kind: "preset", mode: "surplus", adjust: 300 });
  });

  it("un storage corrupto no rompe la pantalla", () => {
    localStorage.setItem("elevate_calorie_goal_u1", "{ no es json");
    expect(loadCalorieGoal("u1")).toEqual(AUTO);
  });
});

describe("calorieGoal · resolveCalorieGoal", () => {
  const deficit = { kind: "preset", mode: "deficit", adjust: 500 } as const;

  it("con plan del coach y sin elección propia, manda el coach", () => {
    expect(resolveCalorieGoal({ pref: AUTO, estimate: 2100, coachTarget: 2500 })).toEqual({
      calories: 2500,
      source: "coach",
      coachCalories: 2500,
    });
  });

  it("si el alumno eligió la suya, pisa a la del coach y la del coach queda a la vista", () => {
    expect(resolveCalorieGoal({ pref: deficit, estimate: 2100, coachTarget: 2500 })).toEqual({
      calories: 2100,
      source: "own",
      coachCalories: 2500,
    });
  });

  it("sin plan, la elección propia gana sobre el cuestionario", () => {
    const r = resolveCalorieGoal({
      pref: { kind: "manual", calories: 2800 },
      estimate: 2800,
      coachTarget: null,
    });
    expect(r).toEqual({ calories: 2800, source: "own", coachCalories: null });
  });

  it("sin plan ni elección, queda el número del cuestionario", () => {
    expect(resolveCalorieGoal({ pref: AUTO, estimate: 2100, coachTarget: null })).toEqual({
      calories: 2100,
      source: "auto",
      coachCalories: null,
    });
  });

  it("un plan sin meta cargada no cuenta como meta del coach", () => {
    for (const coachTarget of [null, 0]) {
      expect(resolveCalorieGoal({ pref: AUTO, estimate: 2100, coachTarget })).toMatchObject({
        calories: 2100,
        source: "auto",
      });
    }
  });

  it("con preferencia propia pero sin datos del perfil, no inventa: vuelve al coach", () => {
    expect(resolveCalorieGoal({ pref: deficit, estimate: null, coachTarget: 2500 })).toMatchObject({
      calories: 2500,
      source: "coach",
    });
  });

  it("sin ninguna fuente devuelve null en vez de 0", () => {
    expect(resolveCalorieGoal({ pref: AUTO, estimate: null, coachTarget: null })).toEqual({
      calories: null,
      source: "none",
      coachCalories: null,
    });
  });
});

describe("calorieGoal · scaleMacros", () => {
  const macros = { protein: 150, carbs: 250, fats: 70 };

  it("reescala al nuevo objetivo", () => {
    expect(scaleMacros(macros, 2500, 2800)).toEqual({ protein: 168, carbs: 280, fats: 78 });
  });

  it("deja los macros como están si no hay contra qué escalar", () => {
    expect(scaleMacros(macros, null, 2800)).toEqual(macros);
    expect(scaleMacros(macros, 0, 2800)).toEqual(macros);
    expect(scaleMacros(macros, 2500, null)).toEqual(macros);
  });

  it("respeta los macros que el coach no cargó", () => {
    expect(scaleMacros({ protein: 150, carbs: null, fats: null }, 2500, 5000)).toEqual({
      protein: 300,
      carbs: null,
      fats: null,
    });
  });
});
