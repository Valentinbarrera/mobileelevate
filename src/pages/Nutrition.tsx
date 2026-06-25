/**
 * Nutrition — Student-facing meal plan viewer
 * Shows the active plan assigned by the coach:
 * - Macro targets for the day
 * - Each meal with foods and per-meal macros
 * - Day selector if the plan has multiple days
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Apple, ChevronLeft, ChevronRight, Droplets, Check } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageLoading from "@/components/ui/page-loading";
import ProgressRing from "@/components/ui/progress-ring";
import CountUp from "@/components/ui/count-up";
import { useDailyNutritionTracking } from "@/hooks/useDailyNutritionTracking";
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

const MealCard = ({
  meal,
  checked,
  onToggle,
}: {
  meal: NutritionMeal;
  checked: boolean;
  onToggle: () => void;
}) => {
  const [expanded, setExpanded] = useState(true);
  const label = MEAL_TYPE_LABELS[meal.meal_type] ?? meal.meal_type;
  const icon = MEAL_TYPE_ICONS[meal.meal_type] ?? "🍽️";

  return (
    <motion.div
      variants={fadeUp}
      className={`card-elevated rounded-2xl overflow-hidden transition-shadow ${
        checked ? "ring-1 ring-emerald-500/40" : ""
      }`}
    >
      {/* Meal header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Check de "comido" */}
        <button
          onClick={onToggle}
          aria-label={checked ? "Marcar como no comida" : "Marcar como comida"}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
            checked
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-white/15 text-transparent active:bg-white/5"
          }`}
        >
          <Check className="w-4 h-4" strokeWidth={3} />
        </button>

        {/* Cabecera expandible */}
        <button
          className="flex-1 flex items-center justify-between gap-3 min-w-0"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl">{icon}</span>
            <div className="text-left min-w-0">
              <p className={`text-sm font-semibold truncate ${checked ? "text-emerald-400" : "text-foreground"}`}>
                {label}
              </p>
              <p className="text-xs text-muted-foreground">
                {Math.round(meal.totalCalories)} kcal &middot; {meal.foods.length} alimento
                {meal.foods.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <ChevronRight
            className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          />
        </button>
      </div>

      {/* Food list */}
      {expanded && meal.foods.length > 0 && (
        <div className="border-t border-white/[0.06] divide-y divide-white/[0.04]">
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
        <div className="px-4 pb-3 pt-1 border-t border-white/[0.04]">
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
    <div className="flex items-center justify-between card-elevated rounded-2xl px-4 py-3">
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

// ─── Water tracker ────────────────────────────────────────────────────────────

const WaterTracker = ({
  glasses,
  goal,
  onChange,
}: {
  glasses: number;
  goal: number;
  onChange: (n: number) => void;
}) => (
  <motion.div variants={fadeUp} className="card-elevated rounded-2xl p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="accent-bar" />
        <h3 className="text-sm font-black tracking-tight text-foreground">Agua</h3>
      </div>
      <span className="text-sm text-muted-foreground">
        <span className="text-foreground font-black tabular-nums">{glasses}</span> / {goal} vasos
      </span>
    </div>
    <div className="flex gap-1.5">
      {Array.from({ length: goal }).map((_, i) => {
        const filled = i < glasses;
        return (
          <button
            key={i}
            onClick={() => onChange(glasses === i + 1 ? i : i + 1)}
            aria-label={`${i + 1} vasos`}
            className={`flex-1 h-10 rounded-lg flex items-center justify-center transition-colors active:scale-95 ${
              filled
                ? "bg-blue-500/80 border border-blue-400/50"
                : "bg-secondary/50 border border-white/[0.05]"
            }`}
          >
            <Droplets className={`w-4 h-4 ${filled ? "text-white" : "text-muted-foreground/40"}`} />
          </button>
        );
      })}
    </div>
  </motion.div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Nutrition() {
  const { data: plan, isLoading, error } = useStudentNutrition();
  const [dayIndex, setDayIndex] = useState(0);
  const { water, setWater, isMealChecked, toggleMeal } = useDailyNutritionTracking();

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

  // Totales CONSUMIDOS hoy (solo las comidas marcadas como comidas)
  const dayTotals = currentDay
    ? currentDay.meals
        .filter((m) => isMealChecked(m.id))
        .reduce(
          (acc, m) => ({
            calories: acc.calories + m.totalCalories,
            protein: acc.protein + m.totalProtein,
            carbs: acc.carbs + m.totalCarbs,
            fats: acc.fats + m.totalFats,
          }),
          { calories: 0, protein: 0, carbs: 0, fats: 0 }
        )
    : { calories: 0, protein: 0, carbs: 0, fats: 0 };

  const totalMeals = currentDay?.meals.length ?? 0;
  const checkedCount = currentDay
    ? currentDay.meals.filter((m) => isMealChecked(m.id)).length
    : 0;

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
              className="card-elevated rounded-2xl p-4"
            >
              {/* Calorie ring */}
              <div className="flex items-center gap-4 mb-4">
                <ProgressRing progress={caloriesPct} size={64} stroke={6} gradientId="kcalRing">
                  <span className="text-xs font-black text-foreground leading-none tabular-nums">
                    <CountUp value={Math.round(caloriesPct)} />%
                  </span>
                </ProgressRing>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Consumido hoy</p>
                  <p className="text-2xl font-black text-primary tabular-nums">
                    {Math.round(dayTotals.calories)}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      / {plan.calories_target} kcal
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                    {checkedCount}/{totalMeals} comidas registradas
                  </p>
                </div>
              </div>

              {/* Macros row */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.06]">
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
              className="card-elevated rounded-2xl p-6 text-center"
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
          {currentDay && currentDay.meals.length > 0 && (
            <motion.div variants={fadeUp} className="flex items-center gap-2 px-0.5 pt-1">
              <span className="accent-bar" />
              <h3 className="text-sm font-black text-foreground tracking-tight">Comidas del día</h3>
            </motion.div>
          )}
          {currentDay?.meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              checked={isMealChecked(meal.id)}
              onToggle={() => toggleMeal(meal.id)}
            />
          ))}

          {/* Tracker de agua */}
          <WaterTracker glasses={water} goal={8} onChange={setWater} />
        </div>
      </motion.div>
    </AppShell>
  );
}
