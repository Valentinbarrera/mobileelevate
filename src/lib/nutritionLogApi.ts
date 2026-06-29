/**
 * Persistencia del registro de comidas en Supabase (tabla nutrition_log_entries).
 * Requiere correr scripts/setup-nutrition-log.sql en el dashboard. Mientras no
 * exista la tabla (o falle la red), todas las llamadas fallan suave y la app
 * sigue funcionando con el guardado local.
 *
 * La tabla aún no está en los tipos generados de Supabase, así que accedemos vía
 * un cliente sin tipar (aislado en este archivo) para no romper el typecheck.
 */
import { supabase } from "@/integrations/supabase/client";

export interface RemoteFoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  meal_type: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface NewFoodEntry {
  date: string;
  mealType: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const TABLE = "nutrition_log_entries";

// Cliente sin tipar SOLO para esta tabla nueva (hasta regenerar types.ts).
const sb = supabase as unknown as {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (c: string, v: string) => {
        order: (c: string, o: { ascending: boolean }) => Promise<{ data: RemoteFoodEntry[] | null; error: unknown }>;
      };
    };
    insert: (row: Record<string, unknown>) => {
      select: (cols: string) => { single: () => Promise<{ data: { id: string } | null; error: unknown }> };
    };
    delete: () => { eq: (c: string, v: string) => Promise<{ error: unknown }> };
  };
};

/** Trae todo el registro de comidas del alumno (vacío si no hay tabla o falla). */
export async function fetchNutritionLogRemote(studentId: string): Promise<RemoteFoodEntry[]> {
  try {
    const { data, error } = await sb.from(TABLE).select("*").eq("student_id", studentId).order("date", { ascending: false });
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

/** Inserta una comida; devuelve el id remoto, o null si no se pudo sincronizar. */
export async function addNutritionLogRemote(studentId: string, e: NewFoodEntry): Promise<string | null> {
  try {
    const { data, error } = await sb
      .from(TABLE)
      .insert({
        student_id: studentId,
        date: e.date,
        meal_type: e.mealType,
        name: e.name,
        calories: e.calories || 0,
        protein: e.protein || 0,
        carbs: e.carbs || 0,
        fats: e.fats || 0,
      })
      .select("id")
      .single();
    if (error || !data) return null;
    return data.id;
  } catch {
    return null;
  }
}

/** Borra una comida por su id remoto. */
export async function removeNutritionLogRemote(id: string): Promise<boolean> {
  try {
    const { error } = await sb.from(TABLE).delete().eq("id", id);
    return !error;
  } catch {
    return false;
  }
}
