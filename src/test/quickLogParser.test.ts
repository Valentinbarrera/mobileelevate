import { describe, it, expect } from "vitest";
import { parseQuickLog } from "@/lib/quickLogParser";

describe("quickLogParser · lo que se escribe en el gimnasio", () => {
  it("la forma más común: nombre y pesoxreps", () => {
    expect(parseQuickLog("sentadilla 100x8")).toEqual({
      exercise: "Sentadilla",
      sets: [{ weight: 100, reps: 8 }],
    });
  });

  it("con espacios y unidad", () => {
    expect(parseQuickLog("Press banca 60 kg x 10")).toEqual({
      exercise: "Press banca",
      sets: [{ weight: 60, reps: 10 }],
    });
  });

  it('acepta "por" y "de" como separadores', () => {
    expect(parseQuickLog("peso muerto 120 por 5")?.sets).toEqual([{ weight: 120, reps: 5 }]);
    expect(parseQuickLog("2 kg de 3 repes")?.sets).toEqual([{ weight: 2, reps: 3 }]);
  });

  it("sin nombre devuelve exercise null, para seguir el anterior", () => {
    expect(parseQuickLog("100x7")?.exercise).toBeNull();
    expect(parseQuickLog("2 kg de 3 repes")?.exercise).toBeNull();
  });

  it("varias series en un mismo mensaje", () => {
    expect(parseQuickLog("sentadilla 100x8 100x7 95x6")).toEqual({
      exercise: "Sentadilla",
      sets: [
        { weight: 100, reps: 8 },
        { weight: 100, reps: 7 },
        { weight: 95, reps: 6 },
      ],
    });
  });

  it('"3 series de 100x8" son tres series iguales', () => {
    const r = parseQuickLog("3 series de 100x8");
    expect(r?.sets).toHaveLength(3);
    expect(r?.sets[0]).toEqual({ weight: 100, reps: 8 });
  });

  it("el número de series no se confunde con el peso", () => {
    expect(parseQuickLog("4 series de sentadilla 80x10")?.exercise).toBe("Sentadilla");
    expect(parseQuickLog("4 series de sentadilla 80x10")?.sets).toHaveLength(4);
  });

  it("peso y reps sueltos, cada uno con su palabra", () => {
    expect(parseQuickLog("remo 70 kg 12 reps")?.sets).toEqual([{ weight: 70, reps: 12 }]);
  });

  it("sin peso es peso corporal", () => {
    expect(parseQuickLog("dominadas 12 repes")?.sets).toEqual([{ weight: 0, reps: 12 }]);
  });

  it("entiende la palabra entera, no solo la abreviada", () => {
    // En un string de JS "\w" es "w": la clase quedaba en "repetw*" y
    // "repeticiones" no matcheaba, aunque "repes" si.
    expect(parseQuickLog("sentadilla 100 por 8 repeticiones")?.sets).toEqual([
      { weight: 100, reps: 8 },
    ]);
    expect(parseQuickLog("dominadas 10 repeticiones")?.sets).toEqual([{ weight: 0, reps: 10 }]);
    expect(parseQuickLog("sentadilla 100 por 8 repeticiones")?.exercise).toBe("Sentadilla");
  });

  it("decimales con coma", () => {
    expect(parseQuickLog("curl 22,5 x 12")?.sets).toEqual([{ weight: 22.5, reps: 12 }]);
  });

  it("tildes y mayúsculas no importan", () => {
    expect(parseQuickLog("PRÉSS MILITAR 40x8")?.exercise).toBe("Press militar");
  });

  it("ignora el relleno de una frase entera", () => {
    expect(parseQuickLog("hoy hice sentadilla con 100 por 8")).toEqual({
      exercise: "Sentadilla",
      sets: [{ weight: 100, reps: 8 }],
    });
  });

  it("un peso solo no alcanza: no inventa repeticiones", () => {
    expect(parseQuickLog("sentadilla 100 kg")).toBeNull();
  });

  it("lo que no es una serie devuelve null en vez de adivinar", () => {
    expect(parseQuickLog("hola")).toBeNull();
    expect(parseQuickLog("")).toBeNull();
    expect(parseQuickLog("   ")).toBeNull();
    expect(parseQuickLog("me duele la rodilla")).toBeNull();
  });

  it("descarta números imposibles", () => {
    expect(parseQuickLog("sentadilla 5000x8")).toBeNull();
    expect(parseQuickLog("sentadilla 100x900")).toBeNull();
  });
});
