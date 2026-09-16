import { describe, it, expect } from "vitest";
import { parseRepRange, suggestLoad } from "@/lib/loadSuggestion";

describe("parseRepRange", () => {
  it("lee rangos y números sueltos", () => {
    expect(parseRepRange("8-12")).toEqual([8, 12]);
    expect(parseRepRange("10")).toEqual([10, 10]);
    expect(parseRepRange("AMRAP")).toBeNull();
  });
});

describe("suggestLoad", () => {
  it("sin historial no sugiere nada", () => {
    expect(suggestLoad([], "8-12", 2)).toBeNull();
  });

  it("llegó al tope del rango → sube 2,5 kg y vuelve al piso", () => {
    const s = suggestLoad([{ weight: 60, reps: 12, rir: 2 }], "8-12", 2);
    expect(s).toMatchObject({ weight: 62.5, reps: 8, kind: "subir" });
  });

  it("le sobró mucho resto → sube aunque no llegó al tope", () => {
    const s = suggestLoad([{ weight: 60, reps: 9, rir: 4 }], "8-12", 2);
    expect(s).toMatchObject({ weight: 62.5, kind: "subir" });
  });

  it("dentro del rango → mismo peso, una rep más", () => {
    const s = suggestLoad([{ weight: 60, reps: 9, rir: 2 }], "8-12", 2);
    expect(s).toMatchObject({ weight: 60, reps: 10, kind: "mantener" });
  });

  it("no llegó al piso y fue al fallo → baja", () => {
    const s = suggestLoad([{ weight: 60, reps: 6, rir: 0 }], "8-12", 2);
    expect(s?.kind).toBe("bajar");
    expect(s!.weight).toBeLessThan(60);
  });

  it("toma la serie más pesada de la sesión", () => {
    const s = suggestLoad(
      [
        { weight: 50, reps: 12, rir: null },
        { weight: 60, reps: 10, rir: null },
      ],
      "8-12",
      2
    );
    expect(s).toMatchObject({ weight: 60, reps: 11 });
  });

  it("peso corporal progresa en reps", () => {
    const s = suggestLoad([{ weight: 0, reps: 12, rir: null }], "8-12", null);
    expect(s).toMatchObject({ weight: 0, reps: 13, kind: "subir" });
  });

  it("con pesos livianos el salto es de 1 kg", () => {
    const s = suggestLoad([{ weight: 8, reps: 15, rir: 2 }], "12-15", 2);
    expect(s?.weight).toBe(9);
  });
});
