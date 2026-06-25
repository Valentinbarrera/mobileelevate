/**
 * Tracking de nutrición del día — guardado LOCAL (localStorage), por alumno y
 * por fecha. Permite marcar comidas como "comidas" y registrar vasos de agua
 * sin tocar la base. Más adelante se puede sincronizar a Supabase.
 */
import { useState, useCallback, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { getLocalDateString } from "@/lib/date";

interface DailyLog {
  checkedMeals: string[]; // ids de comidas marcadas como comidas hoy
  water: number; // vasos
}

const EMPTY: DailyLog = { checkedMeals: [], water: 0 };
const keyFor = (studentId: string, date: string) => `elevate_nutri_${studentId}_${date}`;

export function useDailyNutritionTracking() {
  const { student, isAdminMode } = useAuthContext();
  const studentId = student?.id || (isAdminMode ? "admin" : "anon");
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

  const toggleMeal = useCallback((mealId: string) => {
    setLog((prev) => {
      const has = prev.checkedMeals.includes(mealId);
      return {
        ...prev,
        checkedMeals: has
          ? prev.checkedMeals.filter((id) => id !== mealId)
          : [...prev.checkedMeals, mealId],
      };
    });
  }, []);

  const setWater = useCallback((n: number) => {
    setLog((prev) => ({ ...prev, water: Math.max(0, n) }));
  }, []);

  const isMealChecked = useCallback(
    (mealId: string) => log.checkedMeals.includes(mealId),
    [log.checkedMeals]
  );

  return {
    checkedMeals: log.checkedMeals,
    water: log.water,
    toggleMeal,
    setWater,
    isMealChecked,
  };
}
