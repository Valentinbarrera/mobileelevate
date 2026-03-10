/**
 * useStudentNutrition
 * Fetches the active meal plan assigned to the student, with full
 * day → meal → meal_foods → food hierarchy.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NutritionFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number | null;
  serving_size: number;
  serving_unit: string;
  quantity: number; // multiplier from meal_foods.quantity
  notes: string | null;
}

export interface NutritionMeal {
  id: string;
  meal_type: string;
  order_index: number;
  notes: string | null;
  foods: NutritionFood[];
  // computed
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export interface NutritionDay {
  id: string;
  day_number: number;
  day_name: string;
  notes: string | null;
  meals: NutritionMeal[];
}

export interface ActiveNutritionPlan {
  id: string;
  name: string;
  description: string | null;
  calories_target: number | null;
  protein_target: number | null;
  carbs_target: number | null;
  fats_target: number | null;
  days: NutritionDay[];
}

// ─── Meal type labels ─────────────────────────────────────────────────────────

export const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  snack: "Merienda",
  dinner: "Cena",
  pre_workout: "Pre-entreno",
  post_workout: "Post-entreno",
  other: "Otro",
};

export const MEAL_TYPE_ICONS: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  snack: "🍎",
  dinner: "🌙",
  pre_workout: "⚡",
  post_workout: "💪",
  other: "🍽️",
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function computeMealMacros(foods: NutritionFood[]) {
  return foods.reduce(
    (acc, f) => ({
      totalCalories: acc.totalCalories + f.calories * f.quantity,
      totalProtein: acc.totalProtein + f.protein * f.quantity,
      totalCarbs: acc.totalCarbs + f.carbs * f.quantity,
      totalFats: acc.totalFats + f.fats * f.quantity,
    }),
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 }
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStudentNutrition() {
  const { student } = useAuthContext();

  return useQuery({
    queryKey: ["student-nutrition", student?.id],
    enabled: !!student?.id,
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<ActiveNutritionPlan | null> => {
      if (!student?.id) return null;

      // 1. Find active assignment
      const { data: assignment, error: assignErr } = await supabase
        .from("meal_plan_assignments")
        .select("meal_plan_id")
        .eq("student_id", student.id)
        .eq("status", "active")
        .order("start_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (assignErr) throw assignErr;
      if (!assignment) return null;

      // 2. Fetch plan
      const { data: plan, error: planErr } = await supabase
        .from("meal_plans")
        .select("id, name, description, calories_target, protein_target, carbs_target, fats_target")
        .eq("id", assignment.meal_plan_id)
        .single();

      if (planErr) throw planErr;

      // 3. Fetch days
      const { data: days, error: daysErr } = await supabase
        .from("meal_plan_days")
        .select("id, day_number, day_name, notes")
        .eq("meal_plan_id", plan.id)
        .order("day_number");

      if (daysErr) throw daysErr;
      if (!days || days.length === 0) {
        return { ...plan, days: [] };
      }

      // 4. Fetch meals for all days
      const dayIds = days.map((d) => d.id);
      const { data: meals, error: mealsErr } = await supabase
        .from("meals")
        .select("id, meal_plan_day_id, meal_type, order_index, notes")
        .in("meal_plan_day_id", dayIds)
        .order("order_index");

      if (mealsErr) throw mealsErr;

      // 5. Fetch meal_foods + foods for all meals
      const mealIds = (meals || []).map((m) => m.id);
      let mealFoodsWithFood: Array<{
        id: string;
        meal_id: string;
        quantity: number;
        notes: string | null;
        foods: {
          id: string;
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fats: number;
          fiber: number | null;
          serving_size: number;
          serving_unit: string;
        } | null;
      }> = [];

      if (mealIds.length > 0) {
        const { data: mf, error: mfErr } = await supabase
          .from("meal_foods")
          .select("id, meal_id, quantity, notes, foods(id, name, calories, protein, carbs, fats, fiber, serving_size, serving_unit)")
          .in("meal_id", mealIds);

        if (mfErr) throw mfErr;
        mealFoodsWithFood = (mf || []) as typeof mealFoodsWithFood;
      }

      // 6. Assemble hierarchy
      const assembledDays: NutritionDay[] = days.map((day) => {
        const dayMeals = (meals || [])
          .filter((m) => m.meal_plan_day_id === day.id)
          .map((meal) => {
            const foods: NutritionFood[] = mealFoodsWithFood
              .filter((mf) => mf.meal_id === meal.id && mf.foods)
              .map((mf) => ({
                id: mf.foods!.id,
                name: mf.foods!.name,
                calories: mf.foods!.calories,
                protein: mf.foods!.protein,
                carbs: mf.foods!.carbs,
                fats: mf.foods!.fats,
                fiber: mf.foods!.fiber,
                serving_size: mf.foods!.serving_size,
                serving_unit: mf.foods!.serving_unit,
                quantity: mf.quantity,
                notes: mf.notes,
              }));

            const macros = computeMealMacros(foods);
            return { ...meal, foods, ...macros };
          });

        return { ...day, meals: dayMeals };
      });

      return { ...plan, days: assembledDays };
    },
  });
}
