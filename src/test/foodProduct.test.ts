/**
 * La capa de datos del escaneo. Es lo único de esta feature donde un error no
 * se ve: una UI rota se nota al toque, un factor de escala mal puesto le suma
 * calorías equivocadas al alumno todos los días sin que nadie se entere.
 *
 * Lo que se fija acá: que nunca se invente un nutriente, que escalar por
 * cantidad dé exacto, y que cada modo de fallar de la API tenga su motivo.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  isValidBarcode,
  parseServingSize,
  mapOffProduct,
  calculateNutritionForServing,
  suggestedAmounts,
  productLogName,
  lookupProductByBarcode,
  emptyProduct,
  hasNutritionData,
  type FoodProduct,
} from "@/lib/foodProduct";

const per100 = (over: Partial<FoodProduct["per100"]> = {}) => ({
  calories: 200,
  protein: 10,
  carbs: 20,
  fats: 5,
  fiber: 2,
  ...over,
});

describe("isValidBarcode", () => {
  it("acepta EAN-13, EAN-8, UPC-A y GTIN-14", () => {
    expect(isValidBarcode("7790895000997")).toBe(true); // EAN-13
    expect(isValidBarcode("96385074")).toBe(true); // EAN-8
    expect(isValidBarcode("012345678905")).toBe(true); // UPC-A
    expect(isValidBarcode("01234567890128")).toBe(true); // GTIN-14
  });

  it("rechaza lo que no es un código de producto", () => {
    expect(isValidBarcode("")).toBe(false);
    expect(isValidBarcode("123")).toBe(false); // muy corto
    expect(isValidBarcode("7790895000997123")).toBe(false); // muy largo
    expect(isValidBarcode("ABC1234567890")).toBe(false); // letras
    expect(isValidBarcode("779089500099 ")).toBe(false); // espacio
  });
});

describe("parseServingSize", () => {
  it("saca los gramos de las formas que usa la industria", () => {
    expect(parseServingSize("150 g")).toBe(150);
    expect(parseServingSize("30g")).toBe(30);
    expect(parseServingSize("1 porción (30 g)")).toBe(30);
    expect(parseServingSize("250 ml")).toBe(250);
    expect(parseServingSize("12,5 g")).toBe(12.5);
  });

  it("devuelve null cuando no hay una cantidad con unidad", () => {
    expect(parseServingSize("1 unidad")).toBeNull();
    expect(parseServingSize("")).toBeNull();
    expect(parseServingSize(undefined)).toBeNull();
    expect(parseServingSize(42)).toBeNull();
  });
});

describe("mapOffProduct", () => {
  it("normaliza un producto completo", () => {
    const p = mapOffProduct("7790895000997", {
      product_name_es: "Yogur natural",
      brands: "La Serenísima",
      image_front_small_url: "https://img/y.jpg",
      serving_size: "190 g",
      quantity: "190 g",
      nutriments: {
        "energy-kcal_100g": 61,
        proteins_100g: 3.5,
        carbohydrates_100g: 4.7,
        fat_100g: 3.2,
        fiber_100g: 0,
      },
    });
    expect(p).not.toBeNull();
    expect(p!.name).toBe("Yogur natural");
    expect(p!.brand).toBe("La Serenísima");
    expect(p!.servingSize).toBe(190);
    expect(p!.unit).toBe("g");
    expect(p!.per100.calories).toBe(61);
  });

  it("marca como null lo que el producto NO declara, nunca 0", () => {
    const p = mapOffProduct("7790895000997", {
      product_name: "Galletitas",
      nutriments: { "energy-kcal_100g": 450 },
    });
    expect(p!.per100.calories).toBe(450);
    expect(p!.per100.protein).toBeNull();
    expect(p!.per100.carbs).toBeNull();
    expect(p!.per100.fats).toBeNull();
    expect(p!.per100.fiber).toBeNull();
  });

  it("detecta líquidos para expresar todo en ml", () => {
    const p = mapOffProduct("123", {
      product_name: "Gaseosa",
      quantity: "1,5 L",
      nutriments: {},
    });
    expect(p!.unit).toBe("ml");
  });

  it("descarta el producto sin nombre: no hay ficha que mostrar", () => {
    expect(mapOffProduct("123", { brands: "Marca", nutriments: {} })).toBeNull();
  });

  it("tolera valores que vienen como string", () => {
    const p = mapOffProduct("123", {
      product_name: "Arroz",
      nutriments: { "energy-kcal_100g": "350", proteins_100g: "7,1" },
    });
    expect(p!.per100.calories).toBe(350);
    expect(p!.per100.protein).toBe(7.1);
  });

  it("ignora negativos, que sólo pueden ser un dato roto", () => {
    const p = mapOffProduct("123", {
      product_name: "Roto",
      nutriments: { "energy-kcal_100g": -10 },
    });
    expect(p!.per100.calories).toBeNull();
  });

  it("descarta lo físicamente imposible en vez de repetirlo", () => {
    // Open Food Facts es colaborativo: una coma de más y aparece un alimento
    // con 520 g de proteína cada 100 g. Eso no se muestra como dato.
    const p = mapOffProduct("123", {
      product_name: "Carga con error",
      nutriments: {
        "energy-kcal_100g": 5000, // más que grasa pura (900)
        proteins_100g: 520, // más de 100 g dentro de 100 g
        carbohydrates_100g: 68, // este sí es posible
      },
    });
    expect(p!.per100.calories).toBeNull();
    expect(p!.per100.protein).toBeNull();
    expect(p!.per100.carbs).toBe(68);
  });

  it("acepta los extremos que sí son posibles", () => {
    const p = mapOffProduct("123", {
      product_name: "Aceite",
      nutriments: { "energy-kcal_100g": 900, fat_100g: 100 },
    });
    expect(p!.per100.calories).toBe(900);
    expect(p!.per100.fats).toBe(100);
  });
});

describe("calculateNutritionForServing", () => {
  it("escala proporcional a la cantidad", () => {
    expect(calculateNutritionForServing(per100(), 100).calories).toBe(200);
    expect(calculateNutritionForServing(per100(), 150).calories).toBe(300);
    expect(calculateNutritionForServing(per100(), 50).calories).toBe(100);
  });

  it("escala TODOS los macros, no sólo las calorías", () => {
    const r = calculateNutritionForServing(per100(), 200);
    expect(r.protein).toBe(20);
    expect(r.carbs).toBe(40);
    expect(r.fats).toBe(10);
    expect(r.fiber).toBe(4);
  });

  it("lo que falta sigue faltando después de escalar", () => {
    const r = calculateNutritionForServing(per100({ protein: null }), 150);
    expect(r.calories).toBe(300);
    expect(r.protein).toBeNull();
  });

  it("redondea a un decimal en vez de arrastrar coma flotante", () => {
    expect(calculateNutritionForServing(per100({ calories: 61 }), 190).calories).toBe(115.9);
  });

  it("una cantidad inválida da 0, nunca NaN", () => {
    expect(calculateNutritionForServing(per100(), 0).calories).toBe(0);
    expect(calculateNutritionForServing(per100(), -50).calories).toBe(0);
    expect(calculateNutritionForServing(per100(), NaN).calories).toBe(0);
  });
});

describe("suggestedAmounts", () => {
  const base: FoodProduct = {
    barcode: "1",
    name: "X",
    brand: null,
    imageUrl: null,
    servingSize: null,
    unit: "g",
    per100: per100(),
  };

  it("pone primero la porción del fabricante", () => {
    const opts = suggestedAmounts({ ...base, servingSize: 190 });
    expect(opts[0].amount).toBe(190);
    expect(opts[0].label).toContain("1 porción");
  });

  it("no repite la porción si coincide con una sugerida", () => {
    const opts = suggestedAmounts({ ...base, servingSize: 100 });
    expect(opts.filter((o) => o.amount === 100)).toHaveLength(1);
  });

  it("usa cantidades de líquido para los ml", () => {
    const opts = suggestedAmounts({ ...base, unit: "ml" });
    expect(opts.map((o) => o.amount)).toContain(250);
  });
});

describe("productLogName", () => {
  it("suma la marca cuando existe", () => {
    expect(productLogName({ name: "Yogur", brand: "Ser" } as FoodProduct)).toBe("Yogur (Ser)");
  });
  it("sin marca deja sólo el nombre", () => {
    expect(productLogName({ name: "Yogur", brand: null } as FoodProduct)).toBe("Yogur");
  });
});

describe("lookupProductByBarcode", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const stubOnline = () => vi.stubGlobal("navigator", { onLine: true });

  it("no gasta un request con un código inválido", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const r = await lookupProductByBarcode("abc");
    expect(r).toEqual({ ok: false, reason: "invalid_barcode" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("corta sin red antes de esperar el timeout", async () => {
    vi.stubGlobal("navigator", { onLine: false });
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const r = await lookupProductByBarcode("7790895000997");
    expect(r).toEqual({ ok: false, reason: "offline" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("devuelve el producto normalizado cuando existe", async () => {
    stubOnline();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: 1,
          product: { product_name: "Avena", nutriments: { "energy-kcal_100g": 380 } },
        }),
      })
    );
    const r = await lookupProductByBarcode("7790895000997");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.product.name).toBe("Avena");
  });

  it("distingue no encontrado de error del servidor y de rate limit", async () => {
    stubOnline();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    expect(await lookupProductByBarcode("7790895000997")).toEqual({
      ok: false,
      reason: "not_found",
    });

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429 }));
    expect(await lookupProductByBarcode("7790895000997")).toEqual({
      ok: false,
      reason: "rate_limit",
    });

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    expect(await lookupProductByBarcode("7790895000997")).toEqual({
      ok: false,
      reason: "server_error",
    });
  });

  it("status 0 con 200 OK también es no encontrado", async () => {
    stubOnline();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ status: 0 }) })
    );
    expect(await lookupProductByBarcode("7790895000997")).toEqual({
      ok: false,
      reason: "not_found",
    });
  });

  it("un producto sin nombre se trata como no encontrado", async () => {
    stubOnline();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 1, product: { nutriments: {} } }),
      })
    );
    expect(await lookupProductByBarcode("7790895000997")).toEqual({
      ok: false,
      reason: "not_found",
    });
  });

  it("una caída de red no lanza, devuelve offline", async () => {
    stubOnline();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    expect(await lookupProductByBarcode("7790895000997")).toEqual({
      ok: false,
      reason: "offline",
    });
  });

  it("el corte por tiempo se reporta como timeout", async () => {
    stubOnline();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError"))
    );
    expect(await lookupProductByBarcode("7790895000997")).toEqual({
      ok: false,
      reason: "timeout",
    });
  });
});

describe("emptyProduct / hasNutritionData", () => {
  it("la ficha para cargar a mano conserva el codigo escaneado", () => {
    const p = emptyProduct("7790895000997");
    expect(p.barcode).toBe("7790895000997");
    expect(p.name).toBe("");
    expect(hasNutritionData(p)).toBe(false);
  });

  it("alcanza UN dato para considerarla cargada", () => {
    const p = emptyProduct("123");
    expect(hasNutritionData({ ...p, per100: { ...p.per100, calories: 90 } })).toBe(true);
    expect(hasNutritionData({ ...p, per100: { ...p.per100, protein: 3 } })).toBe(true);
  });

  it("la fibra sola no cuenta: no alcanza para calcular nada", () => {
    const p = emptyProduct("123");
    expect(hasNutritionData({ ...p, per100: { ...p.per100, fiber: 2 } })).toBe(false);
  });

  it("lo que carga el alumno se escala igual que lo que viene de la base", () => {
    const p = emptyProduct("123");
    const cargado = { ...p.per100, calories: 250, protein: 8, carbs: 30, fats: 10 };
    const r = calculateNutritionForServing(cargado, 50);
    expect(r.calories).toBe(125);
    expect(r.protein).toBe(4);
  });
});
