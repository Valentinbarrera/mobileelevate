/**
 * Historial de tracking de comidas del alumno: recorre todos los registros
 * diarios guardados en localStorage (`elevate_nutri_${studentId}_${date}`) y los
 * agrega por fecha con sus totales de macros.
 *
 * Es LOCAL por ahora (no sincroniza a Supabase). En modo admin/demo usa
 * MOCK_NUTRITION_HISTORY para que la pantalla no quede vacía.
 */
import { useMemo } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import type { LoggedFood } from "./useDailyNutritionTracking";
import { MOCK_NUTRITION_HISTORY } from "@/lib/mock-data";

export interface NutritionDay {
  date: string;
  foods: LoggedFood[];
  totals: { calories: number; protein: number; carbs: number; fats: number };
  water: number;
  checkedMealsCount: number;
}

const PREFIX = "elevate_nutri_";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const sumFoods = (foods: LoggedFood[]) =>
  foods.reduce(
    (a, f) => ({
      calories: a.calories + (f.calories || 0),
      protein: a.protein + (f.protein || 0),
      carbs: a.carbs + (f.carbs || 0),
      fats: a.fats + (f.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

export function useNutritionHistory() {
  const { student, isAdminMode } = useAuthContext();
  const studentId = student?.id || (isAdminMode ? "admin" : "anon");

  const days = useMemo<NutritionDay[]>(() => {
    if (isAdminMode) return MOCK_NUTRITION_HISTORY as unknown as NutritionDay[];

    const prefix = `${PREFIX}${studentId}_`;
    const out: NutritionDay[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith(prefix)) continue;
        const date = k.slice(prefix.length);
        if (!DATE_RE.test(date)) continue;

        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const parsed = JSON.parse(raw) as {
          foods?: LoggedFood[];
          water?: number;
          checkedMeals?: string[];
        };
        const foods = parsed.foods || [];
        const water = parsed.water || 0;
        const checkedMealsCount = (parsed.checkedMeals || []).length;
        // día sin nada registrado → no lo mostramos
        if (foods.length === 0 && water === 0 && checkedMealsCount === 0) continue;

        out.push({ date, foods, totals: sumFoods(foods), water, checkedMealsCount });
      }
    } catch {
      /* localStorage no disponible o JSON inválido — devolvemos lo que haya */
    }

    return out.sort((a, b) => (a.date < b.date ? 1 : -1)); // más reciente primero
  }, [studentId, isAdminMode]);

  // Resumen para la cabecera (promedios sobre los días con calorías cargadas)
  const summary = useMemo(() => {
    const withCals = days.filter((d) => d.totals.calories > 0);
    if (!withCals.length) return { avgCalories: 0, avgProtein: 0, daysTracked: days.length };
    const t = withCals.reduce(
      (a, d) => ({ cal: a.cal + d.totals.calories, prot: a.prot + d.totals.protein }),
      { cal: 0, prot: 0 }
    );
    return {
      avgCalories: Math.round(t.cal / withCals.length),
      avgProtein: Math.round(t.prot / withCals.length),
      daysTracked: days.length,
    };
  }, [days]);

  return { days, summary };
}
