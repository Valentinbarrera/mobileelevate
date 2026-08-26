import { describe, it, expect } from "vitest";
import { composeNote } from "@/lib/dailyTrackingApi";

const base = { date: "2026-08-26", rpe: 7, energy: 4, workoutName: "Full Body" };

describe("dailyTrackingApi · composeNote", () => {
  it("manda las cargas adelante para que el coach las vea sin columna nueva", () => {
    expect(composeNote({ ...base, load: 3, note: "" })).toBe("Cargas: 3/5 (justas)");
  });

  it("junta las cargas con la nota del alumno", () => {
    expect(composeNote({ ...base, load: 5, note: "me molestó la rodilla" })).toBe(
      "Cargas: 5/5 (no pude) · me molestó la rodilla",
    );
  });

  it("sin cargas, viaja sólo la nota", () => {
    expect(composeNote({ ...base, load: 0, note: "todo bien" })).toBe("todo bien");
  });

  it("sin nada, null en vez de un string vacío", () => {
    expect(composeNote({ ...base, load: 0, note: "" })).toBeNull();
  });
});
