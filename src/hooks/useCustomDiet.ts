/**
 * "Mi dieta" — plan de alimentación que el ALUMNO diseña para sí mismo
 * (persistente, local por alumno). Distinto del plan del coach (read-only) y del
 * registro diario (lo que comió hoy). Más adelante se sincroniza a Supabase.
 */
import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

export interface DietFood {
  id: string;
  name: string;
  qty: string; // porción libre, ej "150g", "1 taza"
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface DietMeal {
  id: string;
  name: string;
  foods: DietFood[];
}

export interface CustomDiet {
  meals: DietMeal[];
  calorieGoal: number | null;
}

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const EMPTY: CustomDiet = { meals: [], calorieGoal: null };
const keyFor = (studentId: string) => `elevate_diet_${studentId}`;

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.round(Math.random() * 1e6)}`;

const DEFAULT_MEAL_NAMES = ["Desayuno", "Almuerzo", "Merienda", "Cena"];

export const sumFoods = (foods: DietFood[]): MacroTotals =>
  foods.reduce(
    (a, f) => ({
      calories: a.calories + (f.calories || 0),
      protein: a.protein + (f.protein || 0),
      carbs: a.carbs + (f.carbs || 0),
      fats: a.fats + (f.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

export function useCustomDiet() {
  const { student, isAdminMode } = useAuthContext();
  const studentId = student?.id || (isAdminMode ? "admin" : "anon");
  const storageKey = keyFor(studentId);

  const [diet, setDiet] = useState<CustomDiet>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
    } catch {
      return EMPTY;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(diet));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [storageKey, diet]);

  const addMeal = useCallback((name: string) => {
    const n = name.trim();
    if (!n) return;
    setDiet((d) => ({ ...d, meals: [...d.meals, { id: newId(), name: n, foods: [] }] }));
  }, []);

  const renameMeal = useCallback((mealId: string, name: string) => {
    setDiet((d) => ({
      ...d,
      meals: d.meals.map((m) => (m.id === mealId ? { ...m, name: name.trim() || m.name } : m)),
    }));
  }, []);

  const removeMeal = useCallback((mealId: string) => {
    setDiet((d) => ({ ...d, meals: d.meals.filter((m) => m.id !== mealId) }));
  }, []);

  const addFood = useCallback((mealId: string, food: Omit<DietFood, "id">) => {
    setDiet((d) => ({
      ...d,
      meals: d.meals.map((m) =>
        m.id === mealId ? { ...m, foods: [...m.foods, { ...food, id: newId() }] } : m
      ),
    }));
  }, []);

  const removeFood = useCallback((mealId: string, foodId: string) => {
    setDiet((d) => ({
      ...d,
      meals: d.meals.map((m) =>
        m.id === mealId ? { ...m, foods: m.foods.filter((f) => f.id !== foodId) } : m
      ),
    }));
  }, []);

  const setCalorieGoal = useCallback((n: number | null) => {
    setDiet((d) => ({ ...d, calorieGoal: n && n > 0 ? Math.round(n) : null }));
  }, []);

  const seedDefault = useCallback(() => {
    setDiet((d) =>
      d.meals.length
        ? d
        : { ...d, meals: DEFAULT_MEAL_NAMES.map((name) => ({ id: newId(), name, foods: [] })) }
    );
  }, []);

  const totals = sumFoods(diet.meals.flatMap((m) => m.foods));

  return {
    diet,
    meals: diet.meals,
    calorieGoal: diet.calorieGoal,
    totals,
    addMeal,
    renameMeal,
    removeMeal,
    addFood,
    removeFood,
    setCalorieGoal,
    seedDefault,
  };
}
