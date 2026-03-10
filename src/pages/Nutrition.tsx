/**
 * Nutrition — Student-facing meal plan viewer
 * Shows the active plan assigned by the coach:
 * - Macro targets for the day
 * - Each meal with foods and per-meal macros
 * - Day selector if the plan has multiple days
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Apple, ChevronLeft, ChevronRight, Droplets } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageLoading from "@/components/ui/page-loading";
import { staggerContainer, fadeUp } from "@/lib/animations";
import {
  useStudentNutrition,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_ICONS,
  type NutritionDay,
  type NutritionMeal,
} from "@/hooks/useStudentNutrition";

// ─── Macro pill ───────────────────────────────────────────────────────────────

const MacroPill = ({
  label,
  value,
  target,
  color,
}: {
  label: string;
  value: number;
  target: number | null;
  color: string;
}) => (
  <div className="flex flex-col items-center gap-1">
    <span className={`text-lg font-black ${color}`}>{Math.round(value)}</span>
    {target && (
      <span className="text-[10px] text-muted-foreground">/ {target}g</span>
    )}
    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
      {label}
    </span>
  </div>
);

// ─── Meal card ────────────────────────────────────────────────────────────────

const MealCard = ({ meal }: { meal: NutritionMeal }) => {
  const [expanded, setExpanded] = useState(true);
  const label = MEAL_TYPE_LABELS[meal.meal_type] ?? meal.meal_type;
  const icon = MEAL_TYPE_ICONS[meal.meal_type] ?? "🍽️";

  return (
    <motion.div
      variants={fadeUp}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      {/* Meal header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">
              {Math.round(meal.totalCalories)} kcal &middot;{" "}
              {meal.foods.length} alimento{meal.foods.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-xs">
            <span className="text-blue-400 font-semibold">
              P {Math.round(meal.totalProtein)}g
            </span>
            <span className="text-amber-400 font-semibold">
              C {Math.round(meal.totalCarbs)}g
            </span>
            <span className="text-rose-400 font-semibold">
              G {Math.round(meal.totalFats)}g
            </span>
          </div>
          <ChevronRight
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>

      {/* Food list */}
      {expanded && meal.foods.length > 0 && (
        <div className="border-t border-border/50 divide-y divide-border/30">
          {meal.foods.map((food) => (
            <div
              key={food.id}
              className="flex items-center justify-between px-4 py-2.5"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{food.name}</p>
                <p className="text-xs text-muted-foreground">
                  {food.quantity * food.serving_size}
                  {food.serving_unit}
                  {food.notes && (
                    <span className="ml-2 text-primary/70">· {food.notes}</span>
                  )}
                </p>
              </div>
              <div className="flex items-baseline gap-1 ml-3">
                <span className="text-sm font-bold text-foreground">
                  {Math.round(food.calories * food.quantity)}
                </span>
                <span className="text-xs text-muted-foreground">kcal</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {expanded && meal.foods.length === 0 && (
        <p className="px-4 pb-3 text-xs text-muted-foreground">
          Sin alimentos cargados
        </p>
      )}

      {meal.notes && (
        <div className="px-4 pb-3 pt-1 border-t border-border/30">
          <p className="text-xs text-primary/80 italic">📝 {meal.notes}</p>
        </div>
      )}
    </motion.div>
  );
};

// ─── Day selector ─────────────────────────────────────────────────────────────

const DaySelector = ({
  days,
  currentIndex,
  onChange,
}: {
  days: NutritionDay[];
  currentIndex: number;
  onChange: (i: number) => void;
}) => {
  if (days.length <= 1) return null;
  const day = days[currentIndex];
  return (
    <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3">
      <button
        onClick={() => onChange(Math.max(0, currentIndex - 1))}
        disabled={currentIndex === 0}
        className="p-1 rounded-lg disabled:opacity-30"
      >
        <ChevronLeft className="w-5 h-5 text-foreground" />
      </button>
      <div className="text-center">
        <p className="text-sm font-bold text-foreground">{day.day_name}</p>
        <p className="text-xs text-muted-foreground">
          Día {day.day_number} de {days.length}
        </p>
      </div>
      <button
        onClick={() => onChange(Math.min(days.length - 1, currentIndex + 1))}
        disabled={currentIndex === days.length - 1}
        className="p-1 rounded-lg disabled:opacity-30"
      >
        <ChevronRight className="w-5 h-5 text-foreground" />
      </button>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Nutrition() {
  const { data: plan, isLoading, error } = useStudentNutrition();
  const [dayIndex, setDayIndex] = useState(0);

  if (isLoading) return <PageLoading message="Cargando plan nutricional..." />;

  // ── No plan assigned ──
  if (!plan) {
    return (
      <AppShell>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <Apple className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Sin plan nutricional
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Tu coach todavía no te asignó un plan de alimentación. Cuando lo
            haga vas a verlo acá.
          </p>
        </div>
      </AppShell>
    );
  }

  const currentDay = plan.days[dayIndex] ?? null;

  // Compute totals for today
  const dayTotals = currentDay
    ? currentDay.meals.reduce(
        (acc, m) => ({
          calories: acc.calories + m.totalCalories,
          protein: acc.protein + m.totalProtein,
          carbs: acc.carbs + m.totalCarbs,
          fats: acc.fats + m.totalFats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      )
    : { calories: 0, protein: 0, carbs: 0, fats: 0 };

  const caloriesPct =
    plan.calories_target && plan.calories_target > 0
      ? Math.min(100, (dayTotals.calories / plan.calories_target) * 100)
      : 0;

  return (
    <AppShell>
      <motion.div
        className="min-h-screen bg-background pb-32 lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Header */}
        <motion.header
          className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50"
          variants={fadeUp}
        >
          <div className="max-w-2xl mx-auto flex items-center justify-between px-5 py-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Apple className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Nutrición
                </span>
              </div>
              <h1 className="text-xl font-bold text-foreground truncate max-w-[220px]">
                {plan.name}
              </h1>
            </div>
          </div>
        </motion.header>

        <div className="max-w-2xl mx-auto px-5 pt-5 space-y-4">
          {/* Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 text-sm text-destructive">
              Error al cargar el plan: {(error as Error).message}
            </div>
          )}

          {/* Macro targets summary */}
          {plan.calories_target && (
            <motion.div
              variants={fadeUp}
              className="bg-card border border-border rounded-2xl p-4"
            >
              {/* Calorie ring */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      fill="none"
                      stroke="hsl(var(--border))"
                      strokeWidth="6"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - caloriesPct / 100)}`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-black text-foreground leading-none">
                      {Math.round(caloriesPct)}%
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Objetivo diario
                  </p>
                  <p className="text-2xl font-black text-primary">
                    {plan.calories_target}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      kcal
                    </span>
                  </p>
                </div>
              </div>

              {/* Macros row */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
                <MacroPill
                  label="Proteína"
                  value={dayTotals.protein}
                  target={plan.protein_target}
                  color="text-blue-400"
                />
                <MacroPill
                  label="Carbos"
                  value={dayTotals.carbs}
                  target={plan.carbs_target}
                  color="text-amber-400"
                />
                <MacroPill
                  label="Grasas"
                  value={dayTotals.fats}
                  target={plan.fats_target}
                  color="text-rose-400"
                />
              </div>
            </motion.div>
          )}

          {/* Day selector */}
          <motion.div variants={fadeUp}>
            <DaySelector
              days={plan.days}
              currentIndex={dayIndex}
              onChange={setDayIndex}
            />
          </motion.div>

          {/* No days */}
          {plan.days.length === 0 && (
            <motion.div
              variants={fadeUp}
              className="bg-card border border-border rounded-2xl p-6 text-center"
            >
              <Apple className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold text-foreground mb-1">
                Plan sin días configurados
              </p>
              <p className="text-sm text-muted-foreground">
                Tu coach todavía está armando tu plan
              </p>
            </motion.div>
          )}

          {/* Day notes */}
          {currentDay?.notes && (
            <motion.div
              variants={fadeUp}
              className="bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3"
            >
              <p className="text-xs text-primary font-semibold mb-1">
                Nota del coach
              </p>
              <p className="text-sm text-foreground/80">{currentDay.notes}</p>
            </motion.div>
          )}

          {/* Meals */}
          {currentDay?.meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}

          {/* Hydration reminder */}
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl px-4 py-3"
          >
            <Droplets className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <p className="text-sm text-blue-400">
              Recordá tomar{" "}
              <strong>2–3 litros de agua</strong> durante el día
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AppShell>
  );
}
