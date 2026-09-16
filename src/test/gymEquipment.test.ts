import { describe, it, expect } from "vitest";
import { fitsMyGym, libraryEquipmentNeed } from "@/lib/gymEquipment";

describe("libraryEquipmentNeed", () => {
  it("lleva la taxonomía del coach a las opciones del cuestionario", () => {
    expect(libraryEquipmentNeed("Barra")).toBe("Barra y discos");
    expect(libraryEquipmentNeed("Mancuernas")).toBe("Mancuernas");
    expect(libraryEquipmentNeed("Máquina")).toBe("Máquinas / poleas");
    expect(libraryEquipmentNeed("Polea")).toBe("Máquinas / poleas");
    expect(libraryEquipmentNeed("Kettlebell")).toBe("Kettlebells");
    expect(libraryEquipmentNeed("Banda elástica")).toBe("Bandas elásticas");
  });

  it("no pide nada para peso corporal, barras de colgarse o datos vacíos", () => {
    expect(libraryEquipmentNeed("Peso corporal")).toBeNull();
    expect(libraryEquipmentNeed("Barra de dominadas")).toBeNull();
    expect(libraryEquipmentNeed("Paralelas")).toBeNull();
    expect(libraryEquipmentNeed(null)).toBeNull();
    expect(libraryEquipmentNeed("algo raro")).toBeNull();
  });
});

describe("fitsMyGym", () => {
  it("sin gym cargado muestra todo", () => {
    expect(fitsMyGym("Barra", [])).toBe(true);
  });
  it("gimnasio completo incluye barra y máquinas", () => {
    expect(fitsMyGym("Barra", ["Gimnasio completo"])).toBe(true);
    expect(fitsMyGym("Polea", ["Gimnasio completo"])).toBe(true);
  });
  it("en casa con mancuernas no entra la barra", () => {
    expect(fitsMyGym("Barra", ["Mancuernas", "Bandas elásticas"])).toBe(false);
    expect(fitsMyGym("Mancuernas", ["Mancuernas", "Bandas elásticas"])).toBe(true);
    expect(fitsMyGym("Peso corporal", ["Solo peso corporal"])).toBe(true);
  });
});
