/**
 * Semanas y estados de los programas propios. Lo que se fija acá es sobre todo
 * la COMPATIBILIDAD: los programas que el alumno ya tiene guardados no llevan
 * `week` ni `completedAt`, y tienen que seguir comportándose igual que siempre.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// El guardado empuja a Supabase best-effort; acá no queremos red.
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      upsert: async () => ({ error: { message: "sin tabla" } }),
      select: () => {
        const q = {
          eq: () => q,
          order: () => q,
          then: (r: (v: unknown) => unknown) => r({ data: null, error: { message: "sin tabla" } }),
        };
        return q;
      },
      delete: () => {
        const q = {
          eq: () => q,
          then: (r: (v: unknown) => unknown) => r({ data: null, error: { message: "sin tabla" } }),
        };
        return q;
      },
    }),
  },
}));

import {
  saveMyProgram,
  getMyProgram,
  emptyProgram,
  newId,
  programStatus,
  finishProgram,
  reopenProgram,
  groupDaysByWeek,
  programWeekCount,
  type MyProgram,
} from "@/lib/myPrograms";

const SID = "11111111-2222-3333-4444-555555555555";

/** Programa "viejo": días sin semana y sin completedAt, como los ya guardados. */
const legacyProgram = (): MyProgram => ({
  ...emptyProgram(),
  name: "Full Body",
  days: [
    { id: newId(), name: "Día A", exercises: [] },
    { id: newId(), name: "Día B", exercises: [] },
  ],
});

beforeEach(() => localStorage.clear());

describe("compatibilidad con los programas ya guardados", () => {
  it("los días sin semana cuentan como semana 1", () => {
    const p = legacyProgram();
    const grupos = groupDaysByWeek(p);
    expect(grupos).toHaveLength(1);
    expect(grupos[0].week).toBe(1);
    expect(grupos[0].days).toHaveLength(2);
    expect(programWeekCount(p)).toBe(1);
  });

  it("un programa sin completedAt no está terminado", () => {
    expect(programStatus(legacyProgram(), false)).toBe("guardado");
  });
});

describe("estados (derivados, no guardados)", () => {
  it("el plan activo está en curso; el resto, guardado", () => {
    const p = legacyProgram();
    expect(programStatus(p, true)).toBe("en_curso");
    expect(programStatus(p, false)).toBe("guardado");
  });

  it("terminado gana sobre en curso: un programa cerrado no sigue en curso", () => {
    const p = { ...legacyProgram(), completedAt: "2026-07-20T00:00:00.000Z" };
    expect(programStatus(p, true)).toBe("terminado");
  });

  it("terminar archiva sin borrar, y se puede reabrir", () => {
    const p = saveMyProgram(SID, legacyProgram());

    const terminado = finishProgram(SID, p.id);
    expect(terminado?.completedAt).toBeTruthy();
    expect(getMyProgram(SID, p.id)).not.toBeNull(); // sigue existiendo
    expect(programStatus(getMyProgram(SID, p.id)!, false)).toBe("terminado");

    const reabierto = reopenProgram(SID, p.id);
    expect(reabierto?.completedAt).toBeNull();
    expect(programStatus(getMyProgram(SID, p.id)!, false)).toBe("guardado");
  });

  it("terminar un programa que no existe no rompe", () => {
    expect(finishProgram(SID, "no-existe")).toBeNull();
    expect(reopenProgram(SID, "no-existe")).toBeNull();
  });
});

describe("semanas", () => {
  const mesociclo = (): MyProgram => ({
    ...emptyProgram(),
    name: "Mesociclo",
    days: [
      { id: "s2a", name: "Día A", exercises: [], week: 2 },
      { id: "s1a", name: "Día A", exercises: [], week: 1 },
      { id: "s1b", name: "Día B", exercises: [], week: 1 },
    ],
  });

  it("agrupa por semana en orden, sin importar el orden de los días", () => {
    const grupos = groupDaysByWeek(mesociclo());
    expect(grupos.map((g) => g.week)).toEqual([1, 2]);
    expect(grupos[0].days.map((d) => d.id)).toEqual(["s1a", "s1b"]);
    expect(grupos[1].days.map((d) => d.id)).toEqual(["s2a"]);
  });

  it("cuenta las semanas del diseño", () => {
    expect(programWeekCount(mesociclo())).toBe(2);
  });

  it("una semana inválida (0 o negativa) cae en la 1", () => {
    const p: MyProgram = {
      ...emptyProgram(),
      days: [{ id: "x", name: "Día X", exercises: [], week: 0 }],
    };
    expect(groupDaysByWeek(p)[0].week).toBe(1);
    expect(programWeekCount(p)).toBe(1);
  });
});
