/**
 * Los últimos productos que el alumno escaneó.
 *
 * Es la mejora de fricción más grande de toda la función: el yogur de todas
 * las mañanas y la barrita de después del entreno se repiten, y volver a
 * apuntar la cámara al mismo envase todos los días es trabajo al pedo. Con
 * esto, el segundo escaneo de un producto pasa a ser dos toques y cero cámara.
 *
 * Guardado local por alumno. NO va a Supabase a propósito: es una comodidad de
 * este teléfono, no un dato del que el coach tenga que enterarse, y no vale
 * abrir una tabla nueva —ni romper el freeze de la base— por una lista de
 * atajos. El registro real de lo que comió sí se persiste, como siempre.
 */
import type { FoodProduct } from "@/lib/foodProduct";

/** Cuántos se recuerdan. Más que esto es una lista para scrollear, no un atajo. */
const MAX = 8;

const keyFor = (studentId: string) => `elevate_recent_products_${studentId}`;

/** Descarta cualquier cosa que no tenga la forma de un producto guardado. */
const isProduct = (v: unknown): v is FoodProduct => {
  const p = v as FoodProduct | null;
  return !!p && typeof p.barcode === "string" && typeof p.name === "string" && !!p.per100;
};

export function loadRecentProducts(studentId: string): FoodProduct[] {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isProduct).slice(0, MAX);
  } catch {
    return [];
  }
}

/**
 * Sube el producto al tope de la lista. Si ya estaba, se mueve arriba en vez
 * de duplicarse — y se guarda la versión nueva, que puede traer datos que
 * antes faltaban.
 */
export function rememberProduct(studentId: string, product: FoodProduct): FoodProduct[] {
  const next = [product, ...loadRecentProducts(studentId).filter((p) => p.barcode !== product.barcode)].slice(0, MAX);
  try {
    localStorage.setItem(keyFor(studentId), JSON.stringify(next));
  } catch {
    /* almacenamiento no disponible — los recientes son opcionales */
  }
  return next;
}
