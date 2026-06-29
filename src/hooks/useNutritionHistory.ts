/**
 * Historial de tracking de comidas del alumno.
 *
 * Fuente de verdad: Supabase (tabla nutrition_log_entries) cuando hay un alumno
 * real y la tabla existe. Se mergea con el registro LOCAL (localStorage
 * `elevate_nutri_${studentId}_${date}`) como fallback para fechas todavía no
 * sincronizadas / dispositivos sin conexión. Lo remoto pisa a lo local por fecha.
 *
 * En modo admin/demo usa MOCK_NUTRITION_HISTORY.
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import type { LoggedFood, MealType } from "./useDailyNutritionTracking";
import { fetchNutritionLogRemote, type RemoteFoodEntry } from "@/lib/nutritionLogApi";
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

/** Lee todos los registros diarios de localStorage para este alumno. */
function scanLocal(studentId: string): NutritionDay[] {
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
      const parsed = JSON.parse(raw) as { foods?: LoggedFood[]; water?: number; checkedMeals?: string[] };
      const foods = parsed.foods || [];
      const water = parsed.water || 0;
      const checkedMealsCount = (parsed.checkedMeals || []).length;
      if (foods.length === 0 && water === 0 && checkedMealsCount === 0) continue;

      out.push({ date, foods, totals: sumFoods(foods), water, checkedMealsCount });
    }
  } catch {
    /* localStorage no disponible o JSON inválido */
  }
  return out;
}

/** Agrupa las filas remotas (una por alimento) en días. */
function groupRemote(rows: RemoteFoodEntry[]): Map<string, NutritionDay> {
  const map = new Map<string, NutritionDay>();
  for (const r of rows) {
    let day = map.get(r.date);
    if (!day) {
      day = { date: r.date, foods: [], totals: { calories: 0, protein: 0, carbs: 0, fats: 0 }, water: 0, checkedMealsCount: 0 };
      map.set(r.date, day);
    }
    day.foods.push({
      id: r.id,
      remoteId: r.id,
      name: r.name,
      mealType: r.meal_type as MealType,
      calories: Number(r.calories) || 0,
      protein: Number(r.protein) || 0,
      carbs: Number(r.carbs) || 0,
      fats: Number(r.fats) || 0,
    });
  }
  return map;
}

export function useNutritionHistory() {
  const { student, isAdminMode } = useAuthContext();
  const studentId = student?.id || (isAdminMode ? "admin" : "anon");

  const { data: days = [], isLoading } = useQuery<NutritionDay[]>({
    queryKey: ["nutrition-history", studentId, isAdminMode],
    queryFn: async () => {
      if (isAdminMode) return MOCK_NUTRITION_HISTORY as unknown as NutritionDay[];

      const localDays = scanLocal(studentId);
      const byDate = new Map<string, NutritionDay>(localDays.map((d) => [d.date, d]));

      // Solo un alumno real tiene datos remotos
      if (student?.id) {
        const rows = await fetchNutritionLogRemote(student.id);
        const remote = groupRemote(rows);
        for (const [date, rd] of remote) {
          const local = byDate.get(date);
          // lo remoto pisa los alimentos; conservamos agua/plan de lo local si existe
          byDate.set(date, {
            ...rd,
            totals: sumFoods(rd.foods),
            water: local?.water ?? 0,
            checkedMealsCount: local?.checkedMealsCount ?? 0,
          });
        }
      }

      return [...byDate.values()].sort((a, b) => (a.date < b.date ? 1 : -1)); // más reciente primero
    },
  });

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

  return { days, summary, loading: isLoading };
}
