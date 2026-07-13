/**
 * Nutrition — Student-facing meal plan viewer
 * Shows the active plan assigned by the coach:
 * - Macro targets for the day
 * - Each meal with foods and per-meal macros
 * - Day selector if the plan has multiple days
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Apple, ChevronLeft, ChevronRight, Droplets, Check, Soup, History, Sparkles, UserPlus } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import PageLoading from "@/components/ui/page-loading";
import ProgressRing from "@/components/ui/progress-ring";
import CountUp from "@/components/ui/count-up";
import { useDailyNutritionTracking, type MealType } from "@/hooks/useDailyNutritionTracking";
import FoodLogSheet from "@/components/nutrition/FoodLogSheet";
import FoodLogSection from "@/components/nutrition/FoodLogSection";
import NutritionDisclaimer from "@/components/nutrition/NutritionDisclaimer";
import { useIsDesktop } from "@/hooks/use-media-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { loadOnboarding } from "@/lib/onboarding";
import { inputsFromOnboarding, defaultModeForGoal, computeTarget, suggestMacros } from "@/lib/nutritionCalc";
import { staggerContainer, fadeUp } from "@/lib/animations";
import {
  useStudentNutrition,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_ICONS,
  type NutritionDay,
  type NutritionMeal,
} from "@/hooks/useStudentNutrition";

// Mapea el meal_type del plan (inglés) al tipo local del registro (español)
const planMealTypeToLocal = (mt: string): MealType => {
  switch (mt) {
    case "breakfast":
      return "desayuno";
    case "lunch":
      return "almuerzo";
    case "snack":
      return "merienda";
    case "dinner":
      return "cena";
    default:
      return "snack"; // pre_workout / post_workout / other
  }
};

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
  <div className="flex flex-col items-center gap-0.5">
    <span className={`text-lg font-black tabular-nums ${color}`}>{Math.round(value)}</span>
    {target && (
      <span className="text-[10px] text-muted-foreground tabular-nums">/ {target}g</span>
    )}
    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-0.5">
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
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { data: plan, isLoading, error, refetch } = useStudentNutrition();
  const [dayIndex, setDayIndex] = useState(0);
  const { water, setWater, isMealChecked, toggleMeal, foods, addFood, removeFood, loggedTotals } =
    useDailyNutritionTracking();
  const [showFoodSheet, setShowFoodSheet] = useState(false);
  const { student, isAdminMode } = useAuthContext();
  const sid = student?.id || (isAdminMode ? "admin" : "anon");

  // Meta automática desde el onboarding (Harris-Benedict, sin IA). Sólo se usa en
  // el layout "sin plan del coach"; si hay plan, la meta la pone el coach.
  const ob = loadOnboarding(sid);
  const autoInputs = inputsFromOnboarding(ob);
  const autoResult = autoInputs
    ? computeTarget(autoInputs, defaultModeForGoal(ob.goal).mode, defaultModeForGoal(ob.goal).adjust)
    : null;
  const autoGoal = autoResult?.target ?? null;
  const autoMacros = autoResult && autoInputs ? suggestMacros(autoResult.target, autoInputs.weightKg) : null;

  const myDietEntry = (
    <motion.button
      variants={fadeUp}
      onClick={() => navigate("/nutrition/my-diet")}
      className="w-full text-left rounded-2xl card-elevated p-4 flex items-center gap-3.5 active:scale-[0.99] hover:bg-secondary/30 transition-all"
    >
      <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
        <Soup className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Mi dieta</p>
        <p className="text-sm font-semibold text-foreground">Diseñá tu propio plan</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
    </motion.button>
  );

  // CTA cuando faltan datos del perfil para el cálculo automático.
  const missingProfileCta = (
    <motion.button
      variants={fadeUp}
      onClick={() => navigate("/onboarding")}
      className="w-full text-left rounded-2xl card-elevated p-4 flex items-center gap-3.5 active:scale-[0.99] hover:bg-secondary/30 transition-all"
    >
      <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
        <UserPlus className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Calorías</p>
        <p className="text-sm font-semibold text-foreground">Completá tu perfil para calcularlas solas</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
    </motion.button>
  );

  // Estimación automática (Harris-Benedict) — se muestra SIEMPRE (con o sin plan
  // del coach). Si faltan datos del perfil, cae al CTA de completar el onboarding.
  const caloriesEstimate =
    autoGoal != null && autoResult ? (
      <motion.button
        variants={fadeUp}
        onClick={() => navigate("/nutrition/my-diet")}
        className="w-full text-left rounded-2xl card-elevated p-4 flex items-center gap-3.5 active:scale-[0.99] hover:bg-secondary/30 transition-all"
      >
        <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
            Tu estimación · Harris-Benedict
          </p>
          <p className="text-sm font-semibold text-foreground tabular-nums">
            {autoGoal} kcal{" "}
            <span className="text-muted-foreground font-normal">· mantenimiento {autoResult.tdee}</span>
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      </motion.button>
    ) : (
      missingProfileCta
    );

  const historyEntry = (
    <motion.button
      variants={fadeUp}
      onClick={() => navigate("/nutrition/history")}
      className="w-full text-left rounded-2xl card-elevated p-4 flex items-center gap-3.5 active:scale-[0.99] hover:bg-secondary/30 transition-all"
    >
      <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
        <History className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Historial</p>
        <p className="text-sm font-semibold text-foreground">Qué venís comiendo + macros</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
    </motion.button>
  );

  // El registro libre lista SOLO lo manual; las comidas del plan tildadas se ven
  // arriba como cards (aunque ambas cuenten para el total del día y el historial).
  const manualFoods = foods.filter((f) => f.source !== "plan");
  const manualCalories = manualFoods.reduce((s, f) => s + (f.calories || 0), 0);

  const foodLogSection = (
    <FoodLogSection
      foods={manualFoods}
      totalCalories={manualCalories}
      onAdd={() => setShowFoodSheet(true)}
      onRemove={removeFood}
    />
  );
  const foodSheet = (
    <FoodLogSheet open={showFoodSheet} onClose={() => setShowFoodSheet(false)} onAdd={addFood} />
  );
  const disclaimer = (
    <motion.div variants={fadeUp}>
      <NutritionDisclaimer />
    </motion.div>
  );

  if (isLoading) return <PageLoading message="Cargando plan nutricional..." />;

  // ── Sin plan asignado: igual puede registrar lo que comió ──
  if (!plan) {
    return (
      <AppShell>
        <PageHeader
          eyebrow={
            <>
              <Apple className="w-3.5 h-3.5" />
              Nutrición
            </>
          }
          title="Nutrición"
        />
        <motion.div
          className="min-h-screen bg-background pb-nav lg:pb-10"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <div className="max-w-2xl mx-auto px-5 pt-5 space-y-4">
            <div className="rounded-2xl bg-primary/5 border border-primary/20 px-4 py-3">
              <p className="text-sm text-foreground/80">
                Tu coach todavía no te asignó un plan, pero podés diseñar tu dieta y registrar lo que comés. 🍽️
              </p>
            </div>

            {/* Meta de calorías calculada SOLA desde el onboarding (Harris-Benedict) */}
            {autoGoal != null && autoResult && (
              <motion.button
                variants={fadeUp}
                onClick={() => navigate("/nutrition/my-diet")}
                className="w-full text-left card-hero rounded-3xl p-5 active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
                      Tus calorías objetivo
                    </p>
                    <p className="text-3xl font-black text-foreground tabular-nums leading-tight">
                      <CountUp value={autoGoal} />
                      <span className="text-sm font-bold text-muted-foreground"> kcal</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Según tu perfil · mantenimiento{" "}
                      <span className="font-bold text-foreground/80 tabular-nums">{autoResult.tdee}</span>
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </div>
                {autoMacros && (
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                    {[
                      { l: "Proteína", v: autoMacros.protein, c: "text-blue-400" },
                      { l: "Carbos", v: autoMacros.carbs, c: "text-amber-400" },
                      { l: "Grasas", v: autoMacros.fats, c: "text-rose-400" },
                    ].map((m) => (
                      <div key={m.l} className="text-center">
                        <p className={`text-base font-black tabular-nums ${m.c}`}>{m.v}g</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                          {m.l}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.button>
            )}

            {autoGoal == null && missingProfileCta}
            {myDietEntry}
            {historyEntry}
            {foodLogSection}
            {disclaimer}
          </div>

          {foodSheet}
        </motion.div>
      </AppShell>
    );
  }

  const currentDay = plan.days[dayIndex] ?? null;

  // Totales CONSUMIDOS hoy = todo el registro del día (lo manual + las comidas del
  // plan que el alumno fue tildando, que ya quedan registradas como alimentos).
  const dayTotals = loggedTotals;

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
      <PageHeader
        eyebrow={
          <>
            <Apple className="w-3.5 h-3.5" />
            Nutrición
          </>
        }
        title={plan.name}
        maxWidth="max-w-2xl lg:max-w-6xl"
      />
      <motion.div
        className="min-h-screen bg-background pb-nav lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {(() => {
          const errorBanner = error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 flex items-center justify-between gap-3">
              <p className="text-sm text-destructive">No pudimos cargar tu plan.</p>
              <button
                onClick={() => refetch()}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive text-xs font-bold active:scale-95 transition-transform"
              >
                Reintentar
              </button>
            </div>
          );

          const macroSummary = plan.calories_target && (
            <motion.div
              variants={fadeUp}
              className="card-hero rounded-3xl p-5"
            >
              {/* Calorie ring */}
              <div className="flex items-center gap-4 mb-4">
                <ProgressRing progress={caloriesPct} size={72} stroke={7} gradientId="kcalRing">
                  <span className="text-sm font-black text-foreground leading-none tabular-nums">
                    <CountUp value={Math.round(caloriesPct)} />%
                  </span>
                </ProgressRing>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Consumido hoy
                  </p>
                  <p className="text-3xl font-black text-foreground tabular-nums leading-tight">
                    {Math.round(dayTotals.calories)}
                    <span className="text-sm font-bold text-muted-foreground">
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
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/[0.06]">
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
          );

          const daySelector = (
            <motion.div variants={fadeUp}>
              <DaySelector
                days={plan.days}
                currentIndex={dayIndex}
                onChange={setDayIndex}
              />
            </motion.div>
          );

          const noDays = plan.days.length === 0 && (
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
          );

          const dayNotes = currentDay?.notes && (
            <motion.div
              variants={fadeUp}
              className="bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3"
            >
              <p className="text-xs text-primary font-semibold mb-1">
                Nota del coach
              </p>
              <p className="text-sm text-foreground/80">{currentDay.notes}</p>
            </motion.div>
          );

          const mealsBlock = (
            <>
              {currentDay && currentDay.meals.length > 0 && (
                <motion.div variants={fadeUp} className="px-0.5 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="accent-bar" />
                    <h3 className="text-sm font-black text-foreground tracking-tight">Comidas del día</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-3">
                    Tocá el ✓ cuando comas una — se suma a tu día y queda en tu historial.
                  </p>
                </motion.div>
              )}
              {currentDay?.meals.map((meal) => {
                const label = MEAL_TYPE_LABELS[meal.meal_type] ?? "Comida";
                return (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    checked={isMealChecked(meal.id)}
                    onToggle={() => {
                      const wasChecked = isMealChecked(meal.id);
                      toggleMeal({
                        id: meal.id,
                        name: label,
                        mealType: planMealTypeToLocal(meal.meal_type),
                        calories: meal.totalCalories,
                        protein: meal.totalProtein,
                        carbs: meal.totalCarbs,
                        fats: meal.totalFats,
                      });
                      if (navigator.vibrate) navigator.vibrate(wasChecked ? 8 : [10, 30, 10]);
                      if (wasChecked) {
                        toast(`${label} quitada de tu día`);
                      } else {
                        toast.success(`✓ ${label} sumada a tu día`, {
                          description: `+${Math.round(meal.totalCalories)} kcal · ya queda en tu historial`,
                        });
                      }
                    }}
                  />
                );
              })}
            </>
          );

          const waterTracker = <WaterTracker glasses={water} goal={8} onChange={setWater} />;

          // Desktop: comidas a la izquierda; macros, selector y agua en rail derecho (sticky).
          if (isDesktop) {
            return (
              <div className="max-w-6xl mx-auto px-8 pt-5">
                {errorBanner}
                <div className="grid grid-cols-12 gap-6 items-start mt-4">
                  <div className="col-span-7 space-y-4">
                    {noDays}
                    {dayNotes}
                    {mealsBlock}
                    {foodLogSection}
                    {disclaimer}
                  </div>
                  <div className="col-span-5 space-y-4 lg:sticky lg:top-20">
                    {macroSummary}
                    {daySelector}
                    {caloriesEstimate}
                    {myDietEntry}
                    {historyEntry}
                    {waterTracker}
                  </div>
                </div>
              </div>
            );
          }

          // Mobile: pila única (sin cambios).
          return (
            <div className="max-w-2xl mx-auto px-5 pt-5 space-y-4">
              {errorBanner}
              {macroSummary}
              {daySelector}
              {noDays}
              {dayNotes}
              {mealsBlock}
              {foodLogSection}
              {caloriesEstimate}
              {myDietEntry}
              {historyEntry}
              {waterTracker}
              {disclaimer}
            </div>
          );
        })()}

        {foodSheet}
      </motion.div>
    </AppShell>
  );
}
