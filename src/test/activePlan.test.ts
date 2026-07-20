/**
 * El plan activo decide qué programa manda en Inicio y en Entrenar, así que las
 * reglas importantes son: por defecto manda el coach, y la rotación de días de
 * un programa propio avanza sin salirse de rango aunque el alumno saltee días.
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  loadActivePlan,
  setActivePlan,
  clearActivePlan,
  isOwnPlanActive,
  nextProgramDay,
  advancePlanCursor,
  setPlanCursorAfter,
} from "@/lib/activePlan";
import type { MyProgram } from "@/lib/myPrograms";

const SID = "sid-1";
const PROG_ID = "prog-1";

const program = (): MyProgram => ({
  id: PROG_ID,
  name: "Mi Full Body",
  origin: "propio",
  createdAt: "2026-07-01T00:00:00.000Z",
  days: [
    { id: "d-a", name: "Día A", exercises: [] },
    { id: "d-b", name: "Día B", exercises: [] },
    { id: "d-c", name: "Día C", exercises: [] },
  ],
});

beforeEach(() => localStorage.clear());

describe("plan activo", () => {
  it("por defecto manda el programa del coach", () => {
    expect(loadActivePlan(SID)).toEqual({ type: "coach" });
  });

  it("se puede activar un programa propio y volver atrás", () => {
    setActivePlan(SID, { type: "own", programId: PROG_ID });
    expect(loadActivePlan(SID)).toEqual({ type: "own", programId: PROG_ID });
    clearActivePlan(SID);
    expect(loadActivePlan(SID)).toEqual({ type: "coach" });
  });

  it("un valor corrupto no rompe: cae al del coach", () => {
    localStorage.setItem(`elevate_active_plan_${SID}`, "{no es json");
    expect(loadActivePlan(SID)).toEqual({ type: "coach" });
    localStorage.setItem(`elevate_active_plan_${SID}`, JSON.stringify({ type: "own" }));
    expect(loadActivePlan(SID)).toEqual({ type: "coach" }); // sin programId no vale
  });

  it("isOwnPlanActive distingue el programa activo del resto", () => {
    const plan = { type: "own", programId: PROG_ID } as const;
    expect(isOwnPlanActive(plan, PROG_ID)).toBe(true);
    expect(isOwnPlanActive(plan, "otro")).toBe(false);
    expect(isOwnPlanActive({ type: "coach" }, PROG_ID)).toBe(false);
  });
});

describe("rotación de días del programa propio", () => {
  it("arranca por el primer día", () => {
    expect(nextProgramDay(SID, program())?.day.name).toBe("Día A");
  });

  it("avanza y vuelve al principio al terminar la vuelta", () => {
    const p = program();
    advancePlanCursor(SID, PROG_ID, p.days.length);
    expect(nextProgramDay(SID, p)?.day.name).toBe("Día B");
    advancePlanCursor(SID, PROG_ID, p.days.length);
    advancePlanCursor(SID, PROG_ID, p.days.length);
    expect(nextProgramDay(SID, p)?.day.name).toBe("Día A"); // dio la vuelta
  });

  it("si entrena un día salteado, sigue por el que viene después de ese", () => {
    const p = program();
    setPlanCursorAfter(SID, PROG_ID, 2, p.days.length); // hizo el Día C
    expect(nextProgramDay(SID, p)?.day.name).toBe("Día A");
  });

  it("no se rompe si el programa quedó sin días", () => {
    expect(nextProgramDay(SID, { ...program(), days: [] })).toBeNull();
  });

  it("un cursor viejo mayor que la cantidad de días no se sale de rango", () => {
    localStorage.setItem(`elevate_plan_cursor_${SID}_${PROG_ID}`, "97");
    const res = nextProgramDay(SID, program());
    expect(res?.index).toBe(1); // 97 % 3
    expect(res?.day.name).toBe("Día B");
  });
});
