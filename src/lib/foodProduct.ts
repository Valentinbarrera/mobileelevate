/**
 * Productos envasados por código de barras.
 *
 * Fuente: Open Food Facts (openfoodfacts.org), base abierta y colaborativa.
 * Se eligió por tres motivos concretos: no pide API key —o sea que no hay
 * ningún secreto viajando en el cliente—, habilita CORS (funciona igual desde
 * el navegador y desde la WebView de Capacitor) y tiene buena carga de
 * productos argentinos, que es lo que van a escanear los alumnos.
 *
 * Regla dura de este archivo: NUNCA inventar un nutriente. Si el producto no
 * lo declara, viaja como `null` y la UI muestra que no está. Un dato inventado
 * en una app de nutrición es peor que un dato faltante.
 *
 * Capas: este archivo hace el fetch y NORMALIZA. Ni el scanner ni la UI saben
 * cómo es la respuesta de Open Food Facts.
 */

/** Nutrientes de un alimento. `null` = el producto no lo declara. */
export interface Nutrients {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  fiber: number | null;
}

export interface FoodProduct {
  barcode: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  /** Gramos/ml de UNA porción declarada por el fabricante. null si no la declara. */
  servingSize: number | null;
  /** "g" o "ml" — la unidad en la que están expresados `per100` y `servingSize`. */
  unit: "g" | "ml";
  /** Nutrientes por 100 g/ml. Es la base de todos los cálculos. */
  per100: Nutrients;
}

/**
 * Por qué falló una búsqueda. Cada motivo tiene su propio texto y su propia
 * acción en la UI: "algo salió mal" no le sirve a nadie.
 */
export type LookupFailure =
  | "invalid_barcode"
  | "not_found"
  | "offline"
  | "timeout"
  | "rate_limit"
  | "server_error"
  | "bad_response";

export type LookupResult =
  | { ok: true; product: FoodProduct }
  | { ok: false; reason: LookupFailure };

const API = "https://world.openfoodfacts.org/api/v2/product";
const TIMEOUT_MS = 8000;

/**
 * ¿Es un código de producto plausible? EAN-8, UPC-A (12), EAN-13 y GTIN-14.
 * Filtra de entrada la basura para no gastar un request en algo que no existe.
 */
export function isValidBarcode(code: string): boolean {
  if (!/^\d+$/.test(code)) return false;
  return [8, 12, 13, 14].includes(code.length);
}

/** "150 g" → 150 · "1 porción (30 g)" → 30 · "" → null */
export function parseServingSize(raw: unknown): number | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  // La cantidad que importa es la que está pegada a la unidad, no un "1" suelto
  // de "1 porción": por eso se exige g/ml/gr inmediatamente después.
  const m = raw.replace(",", ".").match(/(\d+(?:\.\d+)?)\s*(g|gr|gramos|ml)\b/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Número válido, no negativo y FÍSICAMENTE POSIBLE, o null.
 *
 * El filtro de máximo no es paranoia: Open Food Facts es colaborativo y tiene
 * cargas con errores de tipeo (una coma de más y un alimento pasa a tener 520 g
 * de proteína cada 100 g). Repetir eso como si fuera un dato sería peor que no
 * mostrarlo — es una app de nutrición y Apple ya nos rechazó una vez por dar
 * información de salud sin respaldo.
 *
 * Los topes: no puede haber más de 100 g de un macro dentro de 100 g de
 * producto, y 900 kcal/100 g es el techo real (grasa pura = 900).
 */
const num = (v: unknown, max: number): number | null => {
  const n = typeof v === "string" ? parseFloat(v.replace(",", ".")) : v;
  if (typeof n !== "number" || !Number.isFinite(n) || n < 0 || n > max) return null;
  return Math.round(n * 10) / 10;
};

const MAX_KCAL_PER_100 = 900;
const MAX_GRAMS_PER_100 = 100;

const text = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
};

interface OffNutriments {
  "energy-kcal_100g"?: unknown;
  proteins_100g?: unknown;
  carbohydrates_100g?: unknown;
  fat_100g?: unknown;
  fiber_100g?: unknown;
}

interface OffProduct {
  product_name_es?: unknown;
  product_name?: unknown;
  generic_name_es?: unknown;
  generic_name?: unknown;
  brands?: unknown;
  image_front_small_url?: unknown;
  image_front_url?: unknown;
  image_url?: unknown;
  serving_size?: unknown;
  quantity?: unknown;
  nutriments?: OffNutriments;
}

/**
 * Traduce la respuesta cruda de Open Food Facts al modelo de Elevate.
 * Exportada aparte de `lookupProductByBarcode` para poder testearla sin red.
 */
export function mapOffProduct(barcode: string, raw: OffProduct): FoodProduct | null {
  const name =
    text(raw.product_name_es) ??
    text(raw.product_name) ??
    text(raw.generic_name_es) ??
    text(raw.generic_name);

  // Sin nombre no hay producto que mostrar: para el alumno es lo mismo que si
  // no existiera, y es mejor mandarlo a la carga manual que enseñarle una
  // ficha vacía.
  if (!name) return null;

  const n = raw.nutriments ?? {};

  // La unidad sale de cómo el fabricante declara el contenido: si dice "1 L"
  // o "500 ml", los "por 100" de la API son por 100 ml.
  const q = `${text(raw.quantity) ?? ""} ${text(raw.serving_size) ?? ""}`.toLowerCase();
  const unit: "g" | "ml" = /\bml\b|\bl\b|litro/.test(q) ? "ml" : "g";

  return {
    barcode,
    name,
    brand: text(raw.brands),
    imageUrl:
      text(raw.image_front_small_url) ?? text(raw.image_front_url) ?? text(raw.image_url),
    servingSize: parseServingSize(raw.serving_size),
    unit,
    per100: {
      calories: num(n["energy-kcal_100g"], MAX_KCAL_PER_100),
      protein: num(n.proteins_100g, MAX_GRAMS_PER_100),
      carbs: num(n.carbohydrates_100g, MAX_GRAMS_PER_100),
      fats: num(n.fat_100g, MAX_GRAMS_PER_100),
      fiber: num(n.fiber_100g, MAX_GRAMS_PER_100),
    },
  };
}

/**
 * Busca un producto por su código. Nunca lanza: cada modo de fallar tiene su
 * `reason`, y la UI decide qué ofrecer en cada caso.
 */
export async function lookupProductByBarcode(barcode: string): Promise<LookupResult> {
  if (!isValidBarcode(barcode)) return { ok: false, reason: "invalid_barcode" };

  // navigator.onLine sólo es confiable en negativo: si dice que no hay red,
  // no hay red. Nos ahorra un timeout de 8 segundos para nada.
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { ok: false, reason: "offline" };
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    // Se piden sólo los campos que se usan: la ficha completa de Open Food
    // Facts pesa cientos de KB por producto.
    const fields = [
      "product_name",
      "product_name_es",
      "generic_name",
      "generic_name_es",
      "brands",
      "image_front_small_url",
      "image_front_url",
      "image_url",
      "serving_size",
      "quantity",
      "nutriments",
    ].join(",");

    const res = await fetch(`${API}/${encodeURIComponent(barcode)}.json?fields=${fields}`, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });

    if (res.status === 404) return { ok: false, reason: "not_found" };
    if (res.status === 429) return { ok: false, reason: "rate_limit" };
    if (!res.ok) return { ok: false, reason: "server_error" };

    const data = (await res.json()) as { status?: unknown; product?: OffProduct };
    // La API mezcla `1` y `"success"` según la versión del endpoint.
    const found = data.status === 1 || data.status === "success";
    if (!found || !data.product) return { ok: false, reason: "not_found" };

    const product = mapOffProduct(barcode, data.product);
    if (!product) return { ok: false, reason: "not_found" };
    return { ok: true, product };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return { ok: false, reason: "timeout" };
    }
    // fetch sólo rechaza por red o CORS; con la respuesta ya en mano no llega acá.
    return { ok: false, reason: "offline" };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Nutrientes para una cantidad concreta, a partir de los valores por 100.
 * Pura y sin dependencias: es la única fuente del cálculo, así que la ficha
 * del producto y lo que finalmente se guarda no pueden discrepar.
 *
 * Lo que el producto no declara sigue siendo `null` después de escalar: cero
 * no es lo mismo que "no sabemos".
 */
export function calculateNutritionForServing(per100: Nutrients, amount: number): Nutrients {
  const factor = Number.isFinite(amount) && amount > 0 ? amount / 100 : 0;
  const scale = (v: number | null) => (v == null ? null : Math.round(v * factor * 10) / 10);
  return {
    calories: scale(per100.calories),
    protein: scale(per100.protein),
    carbs: scale(per100.carbs),
    fats: scale(per100.fats),
    fiber: scale(per100.fiber),
  };
}

/**
 * Cantidades sugeridas para un producto, en su unidad. Si el fabricante
 * declara una porción, esa va primero y marcada: es la que el alumno más
 * probablemente comió.
 */
export function suggestedAmounts(product: FoodProduct): { amount: number; label: string }[] {
  const base = product.unit === "ml" ? [100, 200, 250, 330] : [30, 50, 100, 150];
  const out: { amount: number; label: string }[] = [];
  if (product.servingSize) {
    out.push({ amount: product.servingSize, label: `1 porción · ${product.servingSize} ${product.unit}` });
  }
  for (const a of base) {
    if (out.some((o) => o.amount === a)) continue;
    out.push({ amount: a, label: `${a} ${product.unit}` });
  }
  return out.slice(0, 5);
}

/** Nombre para el registro: "Yogur Ser (La Serenísima)". */
export function productLogName(product: FoodProduct): string {
  return product.brand ? `${product.name} (${product.brand})` : product.name;
}
