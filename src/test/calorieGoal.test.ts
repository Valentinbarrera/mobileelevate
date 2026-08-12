import { describe, it, expect, beforeEach } from "vitest";
import {
  sanitize,
  loadCalorieGoal,
  saveCalorieGoal,
  AUTO,
  MANUAL_MIN,
  MANUAL_MAX,
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
