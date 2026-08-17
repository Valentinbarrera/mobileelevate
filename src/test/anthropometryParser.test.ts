/**
 * El intérprete del informe de antropometría, probado sobre grillas armadas a
 * mano: las mismas formas que `pdfText` produce a partir de un PDF real
 * (etiqueta y valor en la misma celda, en celdas contiguas, o en columna).
 */
import { describe, it, expect } from "vitest";
import {
  parseAnthropometryGrids,
  parseNumericCell,
  parseDateString,
  matchField,
  validateMeasurement,
  deriveMissingFields,
} from "@/lib/anthropometryParser";
import type { PdfPageGrid } from "@/lib/pdfText";

const page = (rows: string[][]): PdfPageGrid[] => [{ page: 1, rows }];
const today = new Date(2026, 7, 16); // 16/8/2026

describe("parseNumericCell", () => {
  it("acepta coma decimal y unidades pegadas", () => {
    expect(parseNumericCell("78,2 kg")).toBe(78.2);
    expect(parseNumericCell("17.2%")).toBe(17.2);
    expect(parseNumericCell("  34,80  ")).toBe(34.8);
  });

  it("resuelve el separador de miles según cuál venga último", () => {
    expect(parseNumericCell("1.234,5")).toBe(1234.5);
    expect(parseNumericCell("1,234.5")).toBe(1234.5);
  });

  it("devuelve null cuando no hay número", () => {
    expect(parseNumericCell("kg")).toBeNull();
    expect(parseNumericCell("")).toBeNull();
    expect(parseNumericCell("-")).toBeNull();
  });
});

describe("parseDateString", () => {
  it("lee los formatos que aparecen en los informes", () => {
    expect(parseDateString("16/08/2026")?.getMonth()).toBe(7);
    expect(parseDateString("2026-08-16")?.getDate()).toBe(16);
    expect(parseDateString("16 de agosto de 2026")?.getFullYear()).toBe(2026);
    expect(parseDateString("16 ago 2026")?.getMonth()).toBe(7);
  });

  it("interpreta el año de dos dígitos", () => {
    expect(parseDateString("16/08/26")?.getFullYear()).toBe(2026);
  });
});

describe("matchField", () => {
  it("prefiere el alias más largo", () => {
    expect(matchField("Masa muscular")?.field.id).toBe("muscle_mass");
    expect(matchField("Índice de masa corporal")?.field.id).toBe("bmi");
  });

  it("usa la sección para desambiguar 'muslo'", () => {
    expect(matchField("Muslo", "skinfolds")?.field.id).toBe("thigh_skinfold");
    expect(matchField("Muslo", "circumferences")?.field.id).toBe("thigh_circumference");
  });

  it("usa la unidad de la etiqueta como desempate", () => {
    expect(matchField("Muslo (mm)")?.field.id).toBe("thigh_skinfold");
    expect(matchField("Muslo (cm)")?.field.id).toBe("thigh_circumference");
  });

  it("ignora etiquetas que no son variables", () => {
    expect(matchField("Informe de evaluación física")).toBeNull();
    expect(matchField("2026")).toBeNull();
  });
});

describe("parseAnthropometryGrids", () => {
  it("lee etiqueta y valor en celdas contiguas", () => {
    const result = parseAnthropometryGrids(
      page([
        ["Fecha de evaluación", "16/08/2026"],
        ["Peso", "78,2", "kg"],
        ["Altura", "176", "cm"],
        ["Masa muscular", "34,8", "kg"],
        ["% Grasa corporal", "17,2", "%"],
      ]),
      { fileName: "informe.pdf", today }
    );

    expect(result.measurementDate).toBe("2026-08-16");
    expect(result.dateSource).toBe("informe");
    expect(result.values.weight).toBe(78.2);
    expect(result.values.height).toBe(176);
    expect(result.values.muscle_mass).toBe(34.8);
    expect(result.values.body_fat_percentage).toBe(17.2);
  });

  it("lee etiqueta y valor pegados en la misma celda", () => {
    const result = parseAnthropometryGrids(
      page([["Peso: 78,2 kg"], ["Masa adiposa 13,4 kg"], ["IMC 24,3"]]),
      { fileName: "informe.pdf", today }
    );

    expect(result.values.weight).toBe(78.2);
    expect(result.values.fat_mass).toBe(13.4);
    expect(result.values.bmi).toBe(24.3);
  });

  it("lee tablas con el valor debajo del encabezado", () => {
    const result = parseAnthropometryGrids(
      page([
        ["Peso", "Masa muscular", "Masa ósea"],
        ["78,2", "34,8", "3,6"],
      ]),
      { fileName: "informe.pdf", today }
    );

    expect(result.values.weight).toBe(78.2);
    expect(result.values.muscle_mass).toBe(34.8);
    expect(result.values.bone_mass).toBe(3.6);
  });

  it("desambigua por encabezado de sección", () => {
    const result = parseAnthropometryGrids(
      page([
        ["Pliegues"],
        ["Muslo", "18,4"],
        ["Pantorrilla", "9,2"],
        ["Perímetros"],
        ["Muslo", "56,1"],
        ["Pantorrilla", "37,8"],
      ]),
      { fileName: "informe.pdf", today }
    );

    expect(result.values.thigh_skinfold).toBe(18.4);
    expect(result.values.calf_skinfold).toBe(9.2);
    expect(result.values.thigh_circumference).toBe(56.1);
    expect(result.values.calf_circumference).toBe(37.8);
  });

  it("convierte porcentajes en fracción y alturas en metros", () => {
    const result = parseAnthropometryGrids(
      page([
        ["Altura", "1,76"],
        ["% Grasa corporal", "0,172"],
      ]),
      { fileName: "informe.pdf", today }
    );

    expect(result.values.height).toBe(176);
    expect(result.values.body_fat_percentage).toBe(17.2);
    expect(result.detected.find((d) => d.fieldId === "height")?.notes.length).toBeGreaterThan(0);
  });

  it("cae al nombre del archivo cuando el informe no trae la fecha", () => {
    const result = parseAnthropometryGrids(page([["Peso", "78,2"]]), {
      fileName: "Informe_Antropometria_16-08-2026.pdf",
      today,
    });

    expect(result.measurementDate).toBe("2026-08-16");
    expect(result.dateSource).toBe("nombre del archivo");
  });

  it("usa hoy y avisa cuando no hay fecha en ningún lado", () => {
    const result = parseAnthropometryGrids(page([["Peso", "78,2"]]), {
      fileName: "informe.pdf",
      today,
    });

    expect(result.measurementDate).toBe("2026-08-16");
    expect(result.dateSource).toBe("hoy");
    expect(result.issues.some((i) => i.level === "warning")).toBe(true);
  });

  it("guarda como extra lo que no reconoce, sin romper", () => {
    const result = parseAnthropometryGrids(
      page([
        ["Peso", "78,2"],
        ["Somatotipo endomórfico", "3,4"],
      ]),
      { fileName: "informe.pdf", today }
    );

    expect(result.values.weight).toBe(78.2);
    expect(Object.values(result.extra)).toContain(3.4);
  });

  it("avisa cuando el PDF no tenía ninguna variable reconocible", () => {
    const result = parseAnthropometryGrids(page([["Gracias por tu visita"]]), {
      fileName: "informe.pdf",
      today,
    });

    expect(result.detected).toHaveLength(0);
    expect(result.issues.some((i) => i.message.includes("No reconocimos"))).toBe(true);
  });

  it("se queda con la primera aparición de cada variable", () => {
    const result = parseAnthropometryGrids(
      page([
        ["Peso", "78,2"],
        ["Peso", "99,9"],
      ]),
      { fileName: "informe.pdf", today }
    );

    expect(result.values.weight).toBe(78.2);
  });
});

/**
 * Formas sacadas de un informe real de fraccionamiento de 5 masas (Kerr) con
 * protocolo ISAK. Cada una rompía el parser antes de calibrarlo.
 */
describe("informe de fraccionamiento (Kerr / ISAK)", () => {
  it("toma la columna de resultados, no la ajustada ni el score-Z", () => {
    const result = parseAnthropometryGrids(
      page([
        ["", "", "", "", "Resultados", "Ajustado", "", "Score-Z"],
        ["", "Peso (kg)", "", "", "56,50", "73,35", "", "1,02"],
        ["", "Talla (cm)", "", "", "156,00"],
      ]),
      { fileName: "antro.pdf", today }
    );

    expect(result.values.weight).toBe(56.5);
    expect(result.values.height).toBe(156);
  });

  it("lee el rótulo de sección aunque venga pegado al primer dato del bloque", () => {
    const result = parseAnthropometryGrids(
      page([
        ["PERIMETROS (cm) Caderas (máxima)", "95,70"],
        ["", "Muslo (medial)", "49,90"],
      ]),
      { fileName: "antro.pdf", today }
    );

    expect(result.values.hip_circumference).toBe(95.7);
    expect(result.values.thigh_circumference).toBe(49.9);
  });

  it("separa el muslo perímetro del muslo pliegue cuando la etiqueta se repite", () => {
    const result = parseAnthropometryGrids(
      page([
        ["PERIMETROS (cm) Muslo (superior)", "56,40"],
        ["", "Muslo (medial)", "49,90"],
        ["", "Pantorrilla (máxima)", "33,30"],
        ["", "Tríceps", "15,00"],
        ["", "Muslo (medial)", "17,00"],
        ["PLIEGUES CUTANEOS (mm) Pantorrilla", "11,00"],
      ]),
      { fileName: "antro.pdf", today }
    );

    expect(result.values.upper_thigh_circumference).toBe(56.4);
    expect(result.values.thigh_circumference).toBe(49.9);
    expect(result.values.calf_circumference).toBe(33.3);
    expect(result.values.thigh_skinfold).toBe(17);
    expect(result.values.calf_skinfold).toBe(11);
  });

  it("no confunde un diámetro de tórax con el perímetro de tórax", () => {
    const result = parseAnthropometryGrids(
      page([
        ["", "Tórax Transverso", "24,20"],
        ["", "Tórax Anteroposterior", "18,40"],
        ["", "Tórax Mesoesternal", "91,00"],
      ]),
      { fileName: "antro.pdf", today }
    );

    expect(result.values.chest_transverse_breadth).toBe(24.2);
    expect(result.values.chest_ap_breadth).toBe(18.4);
    expect(result.values.chest_circumference).toBe(91);
  });

  it("no toma un teléfono como si fuera el valor de una variable", () => {
    const result = parseAnthropometryGrids(
      page([
        ["Gasto energético", "", "", "Teléfono: 2214955747"],
        ["Gasto energético total estimado:", "", "2475,176", "Kcals."],
      ]),
      { fileName: "antro.pdf", today }
    );

    expect(result.values.energy_expenditure).toBe(2475.176);
  });

  it("encuentra el valor aunque esté muchas columnas a la derecha", () => {
    const rows = [["Metabolismo Basal (MB): (Harris & Benedict, 1919)"]];
    rows[0].length = 13;
    rows[0][12] = "1302,724";

    const result = parseAnthropometryGrids(page(rows), { fileName: "antro.pdf", today });
    expect(result.values.basal_metabolism).toBe(1302.724);
  });

  it("ignora los rangos de una tabla de referencia ('<0.72')", () => {
    const result = parseAnthropometryGrids(
      page([
        ["INDICE CINTURA CADERA 30-39", "<0.72", "0.72-0.78"],
        ["Indice cintura/cadera: 0,771"],
      ]),
      { fileName: "antro.pdf", today }
    );

    expect(result.values.waist_hip_ratio).toBe(0.771);
  });

  it("rescata el porcentaje que acompaña a cada masa", () => {
    const result = parseAnthropometryGrids(
      page([
        ["FRACCIONAMIENTO 5 MASAS"],
        ["Masa Adiposa", "16,621", "27,98%"],
        ["Masa Muscular", "24,645", "46,07%"],
      ]),
      { fileName: "antro.pdf", today }
    );

    expect(result.values.fat_mass).toBe(16.621);
    expect(result.values.body_fat_percentage).toBe(27.98);
    expect(result.values.muscle_mass).toBe(24.645);
    expect(result.values.muscle_percentage).toBe(46.07);
  });

  it("lee el somatotipo de la fila de abajo del encabezado", () => {
    const result = parseAnthropometryGrids(
      page([
        ["", "ENDO", "MESO", "ECTO"],
        ["", "4,4", "5,2", "1,2"],
      ]),
      { fileName: "antro.pdf", today }
    );

    expect(result.values.somatotype_endo).toBe(4.4);
    expect(result.values.somatotype_meso).toBe(5.2);
    expect(result.values.somatotype_ecto).toBe(1.2);
  });

  it("no toma 'Talla sentado' como la altura", () => {
    const result = parseAnthropometryGrids(
      page([
        ["Talla sentado (cm)", "83,00"],
        ["Talla (cm)", "156,00"],
      ]),
      { fileName: "antro.pdf", today }
    );

    expect(result.values.sitting_height).toBe(83);
    expect(result.values.height).toBe(156);
  });

  it("lee la fecha del encabezado del informe", () => {
    const result = parseAnthropometryGrids(
      page([["Nombre: Antonela Z.", "", "Fecha de medición: 8/6/2021"]]),
      { fileName: "antro.pdf", today }
    );

    expect(result.measurementDate).toBe("2021-06-08");
    expect(result.dateSource).toBe("informe");
  });

  it("no guarda números absurdos como variables extra", () => {
    const result = parseAnthropometryGrids(page([["Teléfono: 2214955747"]]), {
      fileName: "antro.pdf",
      today,
    });

    expect(Object.values(result.extra)).not.toContain(2214955747);
  });
});

describe("validateMeasurement", () => {
  it("marca valores fuera de rango sin bloquear", () => {
    const issues = validateMeasurement({ weight: 5 });
    expect(issues[0].fieldId).toBe("weight");
    expect(issues[0].level).toBe("warning");
  });

  it("detecta que las masas no suman el peso", () => {
    const issues = validateMeasurement({
      weight: 78.2,
      muscle_mass: 34.8,
      fat_mass: 13.4,
      bone_mass: 3.6,
      residual_mass: 3.2,
      skin_mass: 2.8,
    });
    expect(issues.some((i) => i.message.includes("no coincide con el peso"))).toBe(true);
  });

  it("no se queja cuando todo es coherente", () => {
    expect(validateMeasurement({ weight: 78.2, body_fat_percentage: 17.2, fat_mass: 13.4 })).toHaveLength(0);
  });
});

describe("deriveMissingFields", () => {
  it("calcula el IMC a partir de peso y altura", () => {
    const [derived] = deriveMissingFields({ weight: 78.2, height: 176 });
    expect(derived.fieldId).toBe("bmi");
    expect(derived.value).toBeCloseTo(25.24, 1);
  });

  it("calcula el % de grasa a partir de la masa adiposa", () => {
    const derived = deriveMissingFields({ weight: 78.2, fat_mass: 13.4 });
    expect(derived.find((d) => d.fieldId === "body_fat_percentage")?.value).toBeCloseTo(17.1, 1);
  });

  it("no pisa lo que ya vino en el informe", () => {
    expect(deriveMissingFields({ weight: 78.2, height: 176, bmi: 24.3 })).toHaveLength(0);
  });
});
