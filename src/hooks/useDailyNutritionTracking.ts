/**
 * Tracking de nutrición del día — guardado LOCAL (localStorage), por alumno y
 * por fecha. Permite marcar comidas como "comidas" y registrar vasos de agua
 * sin tocar la base. Más adelante se puede sincronizar a Supabase.
 */
import { useState, useCallback, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { getLocalDateString } from "@/lib/date";
import { addNutritionLogRemote, removeNutritionLogRemote } from "@/lib/nutritionLogApi";

export type MealType = "desayuno" | "almuerzo" | "merienda" | "cena" | "snack";

export interface LoggedFood {
  id: string;
  name: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  /** id en Supabase (si se sincronizó). Permite borrar la fila remota. */
  remoteId?: string;
  /** Origen: "manual" (lo cargó el alumno) o "plan" (comida del coach tildada). */
  source?: "manual" | "plan";
  /** Si vino de tildar una comida del plan, su id (para destildar/quitar). */
  planMealId?: string;
}

/** Payload mínimo de una comida del plan para registrarla al tildarla. */
export interface PlanMealInput {
  id: string;
  name: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DailyLog {
  checkedMeals: string[]; // ids de comidas marcadas como comidas hoy
  water: number; // vasos
  foods: LoggedFood[]; // registro libre del alumno (lo que comió fuera/dentro del plan)
}

const EMPTY: DailyLog = { checkedMeals: [], water: 0, foods: [] };

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
const keyFor = (studentId: string, date: string) => `elevate_nutri_${studentId}_${date}`;

export function useDailyNutritionTracking() {
  const { student, isAdminMode } = useAuthContext();
  const studentId = student?.id || (isAdminMode ? "admin" : "anon");
  // Solo sincronizamos a Supabase para un alumno real (no admin/anon)
  const canSync = !!student?.id && !isAdminMode;
  const date = getLocalDateString();
  const storageKey = keyFor(studentId, date);

  const [log, setLog] = useState<DailyLog>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
    } catch {
      return EMPTY;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(log));
    } catch {
      /* almacenamiento no disponible — se ignora */
    }
  }, [storageKey, log]);

  /**
   * Tilda/destilda una comida del plan. Al tildarla la REGISTRA como un alimento
   * (con sus macros) para que cuente en el día, el historial y Supabase; al
   * destildarla la quita (local + remoto). Devuelve true si quedó tildada.
   */
  const toggleMeal = useCallback(
    (meal: PlanMealInput): boolean => {
      const existing = log.foods.filter((f) => f.planMealId === meal.id);
      if (existing.length) {
        // destildar → quitar
        existing.forEach((f) => f.remoteId && removeNutritionLogRemote(f.remoteId));
        setLog((prev) => ({ ...prev, foods: prev.foods.filter((f) => f.planMealId !== meal.id) }));
        return false;
      }
      // tildar → registrar la comida del plan
      const localId = newId();
      setLog((prev) => ({
        ...prev,
        foods: [
          ...prev.foods,
          {
            id: localId,
            planMealId: meal.id,
            source: "plan",
            name: meal.name,
            mealType: meal.mealType,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fats: meal.fats,
          },
        ],
      }));
      if (canSync) {
        addNutritionLogRemote(student!.id, {
          date,
          mealType: meal.mealType,
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fats: meal.fats,
        }).then((remoteId) => {
          if (remoteId) {
            setLog((prev) => ({
              ...prev,
              foods: prev.foods.map((f) => (f.id === localId ? { ...f, remoteId } : f)),
            }));
          }
        });
      }
      return true;
    },
    [log, canSync, student, date]
  );

  const setWater = useCallback((n: number) => {
    setLog((prev) => ({ ...prev, water: Math.max(0, n) }));
  }, []);

  const isMealChecked = useCallback(
    (mealId: string) => log.foods.some((f) => f.planMealId === mealId),
    [log.foods]
  );

  const addFood = useCallback(
    (food: Omit<LoggedFood, "id">) => {
      const localId = newId();
      // Local inmediato (optimista)
      setLog((prev) => ({ ...prev, foods: [...prev.foods, { ...food, id: localId, source: food.source ?? "manual" }] }));
      // Remoto best-effort: al volver, guardamos el remoteId para poder borrar
      if (canSync) {
        addNutritionLogRemote(student!.id, { date, mealType: food.mealType, ...food }).then((remoteId) => {
          if (!remoteId) return;
          setLog((prev) => ({
            ...prev,
            foods: prev.foods.map((f) => (f.id === localId ? { ...f, remoteId } : f)),
          }));
        });
      }
    },
    [canSync, student, date]
  );

  const removeFood = useCallback(
    (id: string) => {
      setLog((prev) => {
        const target = prev.foods.find((f) => f.id === id);
        if (target?.remoteId) removeNutritionLogRemote(target.remoteId);
        return { ...prev, foods: prev.foods.filter((f) => f.id !== id) };
      });
    },
    []
  );

  // Totales del registro libre del día
  const loggedTotals = (log.foods || []).reduce(
    (acc, f) => ({
      calories: acc.calories + (f.calories || 0),
      protein: acc.protein + (f.protein || 0),
      carbs: acc.carbs + (f.carbs || 0),
      fats: acc.fats + (f.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  return {
    checkedMeals: log.checkedMeals,
    water: log.water,
    foods: log.foods || [],
    toggleMeal,
    setWater,
    isMealChecked,
    addFood,
    removeFood,
    loggedTotals,
  };
}
