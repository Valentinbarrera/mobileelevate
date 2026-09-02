/**
 * Nutrition — Student-facing meal plan viewer
 * Shows the active plan assigned by the coach:
 * - Macro targets for the day
 * - Each meal with foods and per-meal macros
 * - Day selector if the plan has multiple days
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Apple, ChevronLeft, ChevronRight, Droplets, Check, Soup, History, Sparkles, Calculator, Pencil } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import PageLoading from "@/components/ui/page-loading";
import ProgressRing from "@/components/ui/progress-ring";
import CountUp from "@/components/ui/count-up";
import { useDailyNutritionTracking, type MealType } from "@/hooks/useDailyNutritionTracking";
import FoodLogSheet from "@/components/nutrition/FoodLogSheet";
import FoodLogSection from "@/components/nutrition/FoodLogSection";
import BarcodeScannerSheet from "@/components/nutrition/BarcodeScannerSheet";
import ScannedProductSheet from "@/components/nutrition/ScannedProductSheet";
import type { FoodProduct } from "@/lib/foodProduct";
import { loadRecentProducts, rememberProduct } from "@/lib/recentProducts";
import CalorieCalculatorSheet from "@/components/nutrition/CalorieCalculatorSheet";
import NutritionDisclaimer from "@/components/nutrition/NutritionDisclaimer";
import { useIsDesktop } from "@/hooks/use-media-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCalorieGoal } from "@/hooks/useCalorieGoal";
import { AUTO, MODE_LABEL, scaleMacros } from "@/lib/calorieGoal";
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
  bar,
}: {
  label: string;
  value: number;
  target: number | null;
  color: string;
  /** Clase de fondo de la barra, del mismo color que el número. */
  bar: string;
}) => {
  const pct = target && target > 0 ? Math.min(100, (value / target) * 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-1">
        <span className={`text-lg font-black tabular-nums ${color}`}>{Math.round(value)}</span>
        {target && <span className="text-sm text-muted-foreground tabular-nums">/ {target}g</span>}
      </div>
      {/* La barra hace legible de un vistazo cuál macro viene atrasado: tres
          números sueltos obligan a comparar de memoria. */}
      <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
        <div className={`h-full rounded-full ${bar} transition-[width] duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">{label}</span>
    </div>
  );
};

// ─── Meal card ────────────────────────────────────────────────────────────────

const MealCard = ({
  meal,
  checked,
  onToggle,
  expanded,
  onToggleExpanded,
}: {
  meal: NutritionMeal;
  checked: boolean;
  onToggle: () => void;
  expanded: boolean;
  onToggleExpanded: () => void;
}) => {
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
        {/* El tilde se ve apagado incluso sin marcar: un círculo vacío no le
            dice a nadie que ahí se toca para registrar la comida. */}
        <button
          onClick={onToggle}
          aria-pressed={checked}
          aria-label={checked ? `${label} comida — tocá para desmarcar` : `Marcar ${label} como comida`}
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
            checked
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-white/25 bg-white/[0.04] text-white/30 active:bg-white/10"
          }`}
        >
          <Check className="w-5 h-5" strokeWidth={3} />
        </button>

        {/* Cabecera expandible */}
        <button
          className="flex-1 flex items-center justify-between gap-3 min-w-0"
          aria-expanded={expanded}
          onClick={onToggleExpanded}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl">{icon}</span>
            <div className="text-left min-w-0">
              <p className={`text-base font-semibold truncate ${checked ? "text-emerald-400" : "text-foreground"}`}>
                {label}
              </p>
              <p className="text-sm text-foreground/70">
                {Math.round(meal.totalCalories)} kcal &middot; {meal.foods.length} alimento
                {meal.foods.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <ChevronRight
            className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${
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
                <p className="text-base text-foreground truncate">{food.name}</p>
                <p className="text-sm text-foreground/70">
                  {food.quantity * food.serving_size}
                  {food.serving_unit}
                  {food.notes && (
                    <span className="ml-2 text-primary/70">· {food.notes}</span>
                  )}
                </p>
              </div>
              <div className="flex items-baseline gap-1 ml-3">
                <span className="text-base font-bold text-foreground">
                  {Math.round(food.calories * food.quantity)}
                </span>
                <span className="text-sm text-muted-foreground">kcal</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {expanded && meal.foods.length === 0 && (
        <p className="px-4 pb-3 text-sm text-foreground/70">
          Sin alimentos cargados
        </p>
      )}

      {meal.notes && (
        <div className="px-4 pb-3 pt-1 border-t border-white/[0.04]">
          <p className="text-sm text-primary/80 italic">📝 {meal.notes}</p>
        </div>
      )}
    </motion.div>
  );
};

// ─── Day selector ─────────────────────────────────────────────────────────────

/**
 * Tira de días del plan, con el cumplimiento de cada uno a la vista.
 *
 * Antes eran dos flechas: veías un día por vez y no tenías forma de saber cómo
 * venía la semana sin recorrerla entera. El anillo por día responde eso de un
 * vistazo, y tocar uno lo abre.
 */
const DaySelector = ({
  days,
  currentIndex,
  onChange,
  progressFor,
}: {
  days: NutritionDay[];
  currentIndex: number;
  onChange: (i: number) => void;
  progressFor: (day: NutritionDay) => { done: number; total: number };
}) => {
  if (days.length <= 1) return null;

  return (
    <div className="card-elevated rounded-2xl px-2 py-3">
      <div className="flex gap-1 overflow-x-auto rj-scroll snap-x" role="tablist" aria-label="Días del plan">
        {days.map((day, i) => {
          const { done, total } = progressFor(day);
          const pct = total > 0 ? (done / total) * 100 : 0;
          const active = i === currentIndex;
          const complete = total > 0 && done === total;
          return (
            <button
              key={day.id}
              role="tab"
              aria-selected={active}
              aria-label={`${day.day_name}, día ${day.day_number}. ${done} de ${total} comidas`}
              onClick={() => onChange(i)}
              className={`shrink-0 snap-start flex flex-col items-center gap-1 rounded-xl px-2 pt-2 pb-1.5 min-w-[52px] transition-colors ${
                active ? "bg-primary/15 border border-primary/40" : "border border-transparent active:bg-white/5"
              }`}
            >
              <ProgressRing progress={pct} size={34} stroke={3} gradientId={`dayRing${i}`}>
                {complete ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={3.5} />
                ) : (
                  <span
                    className={`text-[11px] font-black tabular-nums ${
                      active ? "text-primary" : "text-foreground/70"
                    }`}
                  >
                    {day.day_number}
                  </span>
                )}
              </ProgressRing>
              <span
                className={`text-[10px] font-bold uppercase tracking-wide ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {day.day_name.slice(0, 3)}
              </span>
            </button>
          );
        })}
      </div>
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
        <h3 className="text-lg font-black tracking-tight text-foreground">Agua</h3>
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
            className={`flex-1 h-11 rounded-lg flex items-center justify-center transition-colors active:scale-95 ${
              filled
                ? "bg-blue-500/80 border border-blue-400/50"
                : "bg-secondary/50 border border-white/[0.05]"
            }`}
          >
            <Droplets className={`w-5 h-5 ${filled ? "text-white" : "text-muted-foreground/40"}`} />
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
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const { water, setWater, isMealChecked, toggleMeal, foods, addFood, removeFood, loggedTotals } =
    useDailyNutritionTracking();
  // Los recientes se guardan por alumno, igual que el resto del registro.
  const { student, isAdminMode } = useAuthContext();
  const sid = student?.id || (isAdminMode ? "admin" : "anon");

  const [showFoodSheet, setShowFoodSheet] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState<FoodProduct | null>(null);
  const [recents, setRecents] = useState<FoodProduct[]>(() => loadRecentProducts(sid));

  // Un producto encontrado sube a recientes ANTES de abrir la ficha: aunque el
  // alumno se arrepienta y no lo agregue, ya no va a tener que volver a
  // escanearlo para mirarlo de nuevo.
  const openProduct = (p: FoodProduct) => {
    setRecents(rememberProduct(sid, p));
    setScanned(p);
  };

  // Se cierra el sheet de carga manual al abrir la camara: son dos caminos del
  // mismo flujo, no dos ventanas apiladas.
  const openScanner = () => {
    setShowFoodSheet(false);
    setScanning(true);
  };

  // Llegada directa desde el Home (?escanear=1): abre la cámara al montar y
  // limpia el parámetro, para que volver atrás no la vuelva a disparar.
  //
  // El guard con ref NO es decorativo: `useSearchParams` devuelve un objeto
  // nuevo en cada render, así que sin él el efecto se relanza para siempre y
  // la pantalla se cae con "Algo salió mal". Y se escribe una COPIA en vez de
  // mutar `params`, que es de React Router.
  const [params, setParams] = useSearchParams();
  const scanParamHandled = useRef(false);
  useEffect(() => {
    if (scanParamHandled.current) return;
    if (params.get("escanear") !== "1") return;
    scanParamHandled.current = true;
    setScanning(true);
    const next = new URLSearchParams(params);
    next.delete("escanear");
    setParams(next, { replace: true });
  }, [params, setParams]);
  // Meta calórica del alumno, ya resuelta contra el plan del coach: con plan
  // asignado manda el coach, salvo que el alumno haya elegido la suya a
  // propósito. El Historial pide exactamente lo mismo al mismo hook.
  const coachTarget = plan?.calories_target ?? null;
  const {
    pref: goalPref,
    save: saveGoal,
    inputs: autoInputs,
    autoPreset: preset,
    autoResult,
    estimate: autoGoal,
    macros: autoMacros,
    resolved: goal,
  } = useCalorieGoal(coachTarget);
  const [goalSheet, setGoalSheet] = useState(false);

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
        <p className="text-base font-semibold text-foreground">Diseñá tu propio plan</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
    </motion.button>
  );

  // Estimación automática (Harris-Benedict) — se muestra SIEMPRE (con o sin plan
  // del coach). Si faltan datos del perfil, cae al CTA de completar el onboarding.
  const goalLabel =
    goalPref.kind === "manual"
      ? "Tu objetivo · a mano"
      : goalPref.kind === "preset"
        ? `Tu objetivo · ${MODE_LABEL[goalPref.mode].toLowerCase()}`
        : "Tu estimación · Harris-Benedict";

  // Se monta siempre: si faltan datos del perfil, el propio sheet ofrece
  // completar el cuestionario en vez de que la entrada desaparezca.
  const goalSheetEl = (
    <CalorieCalculatorSheet
      open={goalSheet}
      onClose={() => setGoalSheet(false)}
      current={goalPref}
      onSave={saveGoal}
      coachTarget={coachTarget}
    />
  );

  // Entrada de menú, al lado de "Mi dieta": el alumno puede llegar al objetivo
  // sin depender de la card de arriba.
  const calcGoalEntry = (
    <motion.button
      variants={fadeUp}
      onClick={() => setGoalSheet(true)}
      className="w-full text-left rounded-2xl card-elevated p-4 flex items-center gap-3.5 active:scale-[0.99] hover:bg-secondary/30 transition-all"
    >
      <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
        <Calculator className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Tu objetivo</p>
        <p className="text-base font-semibold text-foreground">Calculá tus calorías</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
    </motion.button>
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
        <p className="text-base font-semibold text-foreground">Qué venís comiendo + macros</p>
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
      onScan={openScanner}
    />
  );
  const foodSheet = (
    <>
      <FoodLogSheet
        open={showFoodSheet}
        onClose={() => setShowFoodSheet(false)}
        onAdd={addFood}
        onScan={openScanner}
        recents={recents}
        onPickRecent={openProduct}
      />

      {/* Escáner y ficha del producto. Se montan al lado del sheet de carga
          manual porque los tres son el MISMO flujo ("agregar comida") visto
          desde distintas puertas. */}
      <BarcodeScannerSheet
        open={scanning}
        onClose={() => setScanning(false)}
        onFound={(p) => {
          setScanning(false);
          openProduct(p);
        }}
        onManual={() => {
          setScanning(false);
          setShowFoodSheet(true);
        }}
      />
      <ScannedProductSheet
        product={scanned}
        onClose={() => setScanned(null)}
        onAdd={(food) => {
          addFood(food);
          setScanned(null);
          setShowFoodSheet(false);
          toast.success(`${food.name} sumado a tu día 🍽️`);
        }}
      />
    </>
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
              <p className="text-base text-foreground/80">
                Tu coach todavía no te asignó un plan, pero podés diseñar tu dieta y registrar lo que comés. 🍽️
              </p>
            </div>

            {/* Meta de calorías calculada SOLA desde el onboarding (Harris-Benedict) */}
            {autoGoal != null && autoResult && (
              <motion.div variants={fadeUp} className="card-hero rounded-3xl p-5">
                {/* Un solo destino: tocar tu objetivo lleva a la calculadora.
                    Antes el tap iba a Mi dieta y el número se cambiaba desde un
                    botón aparte. */}
                <button
                  onClick={() => setGoalSheet(true)}
                  className="w-full flex items-center gap-4 text-left active:scale-[0.99] transition-transform"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-primary uppercase tracking-wider">{goalLabel}</p>
                    <p className="text-3xl font-black text-foreground tabular-nums leading-tight">
                      <CountUp value={autoGoal} />
                      <span className="text-sm font-bold text-muted-foreground"> kcal</span>
                    </p>
                    <p className="text-sm text-foreground/70 mt-0.5">
                      {goalPref.kind === "auto" ? "Según tu perfil" : "Elegido por vos"} · mantenimiento{" "}
                      <span className="font-bold text-foreground/80 tabular-nums">{autoResult.tdee}</span>
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </button>
                {autoMacros && (
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                    {[
                      { l: "Proteína", v: autoMacros.protein, c: "text-blue-400" },
                      { l: "Carbos", v: autoMacros.carbs, c: "text-amber-400" },
                      { l: "Grasas", v: autoMacros.fats, c: "text-rose-400" },
                    ].map((m) => (
                      <div key={m.l} className="text-center">
                        <p className={`text-base font-black tabular-nums ${m.c}`}>{m.v}g</p>
                        <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                          {m.l}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {myDietEntry}
            {calcGoalEntry}
            {historyEntry}
            {foodLogSection}
            {disclaimer}
          </div>

          {foodSheet}
          {goalSheetEl}
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

  // Guarda los ids desplegados, no un booleano por comida: así el día arranca
  // cerrado (se ven las 4 comidas de un vistazo) y cambiar de día no arrastra
  // lo abierto del anterior, porque sus ids no están en el set.
  const allMealsExpanded = totalMeals > 0 && currentDay!.meals.every((m) => expandedMeals.has(m.id));
  const toggleAllMeals = () =>
    setExpandedMeals(allMealsExpanded ? new Set() : new Set(currentDay!.meals.map((m) => m.id)));
  const toggleMealExpanded = (id: string) =>
    setExpandedMeals((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // El número que manda sale del hook, no del plan a secas: la card grande
  // seguía diciendo "de 2500" aunque el alumno hubiera elegido 2800.
  const usingOwnGoal = goal.source === "own";
  const effectiveGoal = goal.calories ?? 0;

  const caloriesLeft = Math.round(effectiveGoal - dayTotals.calories);

  const caloriesPct =
    effectiveGoal > 0 ? Math.min(100, (dayTotals.calories / effectiveGoal) * 100) : 0;

  // Con meta propia los macros del coach ya no cierran con el total: se sugieren
  // desde el peso y, si faltan datos del perfil, se reescalan al nuevo objetivo.
  const planMacros = {
    protein: plan.protein_target,
    carbs: plan.carbs_target,
    fats: plan.fats_target,
  };
  const macroTargets = usingOwnGoal
    ? autoMacros ?? scaleMacros(planMacros, plan.calories_target, effectiveGoal)
    : planMacros;

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
                className="shrink-0 px-4 min-h-11 flex items-center rounded-lg bg-destructive/20 text-destructive text-sm font-bold active:scale-95 transition-transform"
              >
                Reintentar
              </button>
            </div>
          );

          const macroSummary = effectiveGoal > 0 && (
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
                {/* Lidera con lo que FALTA, no con lo consumido: "te quedan 900"
                    dice qué hacer ahora; "0 / 2500" sólo informa. */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {caloriesLeft >= 0 ? "Te quedan" : "Te pasaste"}
                  </p>
                  <p className="text-3xl font-black text-foreground tabular-nums leading-tight">
                    {Math.abs(caloriesLeft)}
                    <span className="text-sm font-bold text-muted-foreground"> kcal</span>
                  </p>
                  <p className="text-sm text-foreground/70 mt-0.5 tabular-nums">
                    {Math.round(dayTotals.calories)} de {effectiveGoal} · {checkedCount}/{totalMeals} comidas
                  </p>
                </div>
              </div>

              {/* Macros row */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/[0.06]">
                <MacroPill
                  label="Proteína"
                  value={dayTotals.protein}
                  target={macroTargets.protein}
                  color="text-blue-400"
                  bar="bg-blue-400"
                />
                <MacroPill
                  label="Carbos"
                  value={dayTotals.carbs}
                  target={macroTargets.carbs}
                  color="text-amber-400"
                  bar="bg-amber-400"
                />
                <MacroPill
                  label="Grasas"
                  value={dayTotals.fats}
                  target={macroTargets.fats}
                  color="text-rose-400"
                  bar="bg-rose-400"
                />
              </div>

              {/* De quién es el número. Antes convivían dos cards con metas
                  distintas y ninguna decía cuál mandaba. */}
              {/* De quién es el número + cómo cambiarlo. "Meta de tu coach ›"
                  abría el editor, pero se leía como un rótulo y nadie lo
                  tocaba: ahora el editor es un botón que dice lo que hace. */}
              <div className="pt-3.5 mt-3.5 border-t border-white/[0.06]">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">
                    {usingOwnGoal ? goalLabel : "Meta de tu coach"}
                  </p>
                  <p className="text-[15px] font-black text-foreground tabular-nums shrink-0">
                    {effectiveGoal} kcal
                  </p>
                </div>

                {usingOwnGoal && goal.coachCalories != null && (
                  <p className="text-sm text-foreground/70 tabular-nums mt-1">
                    Tu coach sugiere {goal.coachCalories} kcal
                  </p>
                )}

                <button
                  onClick={() => setGoalSheet(true)}
                  className="w-full min-h-12 mt-3 rounded-2xl bg-primary/12 border border-primary/25 text-[15px] font-bold text-primary flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <Pencil className="w-4 h-4" />
                  Editar objetivo
                </button>

                {usingOwnGoal && (
                  <button
                    onClick={() => saveGoal(AUTO)}
                    className="w-full min-h-11 mt-2 rounded-xl bg-secondary/50 border border-white/[0.06] text-sm font-bold text-foreground/70 active:scale-[0.98] transition-transform"
                  >
                    Volver a la meta de tu coach
                  </button>
                )}
              </div>
            </motion.div>
          );

          const daySelector = (
            <motion.div variants={fadeUp}>
              <DaySelector
                days={plan.days}
                currentIndex={dayIndex}
                onChange={setDayIndex}
                progressFor={(d) => ({
                  done: d.meals.filter((m) => isMealChecked(m.id)).length,
                  total: d.meals.length,
                })}
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
              <p className="text-base text-foreground/70">
                Tu coach todavía está armando tu plan
              </p>
            </motion.div>
          );

          const dayNotes = currentDay?.notes && (
            <motion.div
              variants={fadeUp}
              className="bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3"
            >
              <p className="text-sm text-primary font-semibold mb-1">
                Nota del coach
              </p>
              <p className="text-base text-foreground/80">{currentDay.notes}</p>
            </motion.div>
          );

          const mealsBlock = (
            <>
              {currentDay && currentDay.meals.length > 0 && (
                <motion.div variants={fadeUp} className="px-0.5 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="accent-bar" />
                    <h3 className="text-lg font-black text-foreground tracking-tight">Comidas del día</h3>
                    <button
                      onClick={() => navigate("/nutrition/history")}
                      className="ml-auto -mr-2 px-2 min-h-11 flex items-center gap-1 text-sm font-bold text-primary active:scale-95 transition-transform"
                    >
                      Ver historial
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1 ml-3">
                    <p className="text-sm text-foreground/70 flex-1 min-w-0">
                      Tocá el ✓ cuando comas una.
                    </p>
                    <button
                      onClick={toggleAllMeals}
                      aria-expanded={allMealsExpanded}
                      className="shrink-0 -mr-2 px-2 min-h-11 flex items-center gap-1 text-sm font-bold text-primary active:scale-95 transition-transform"
                    >
                      {allMealsExpanded ? "Retraer todo" : "Desplegar todo"}
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${allMealsExpanded ? "-rotate-90" : "rotate-90"}`}
                      />
                    </button>
                  </div>
                </motion.div>
              )}
              {currentDay?.meals.map((meal) => {
                const label = MEAL_TYPE_LABELS[meal.meal_type] ?? "Comida";
                return (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    expanded={expandedMeals.has(meal.id)}
                    onToggleExpanded={() => toggleMealExpanded(meal.id)}
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
                    {daySelector}
                    {macroSummary}
                    {myDietEntry}
                    {calcGoalEntry}
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
              {/* El día antes del resumen: mostrar "0 / 2500 kcal" sin haber dicho
                  todavía de qué día se habla dejaba el número sin contexto. */}
              {daySelector}
              {macroSummary}
              {noDays}
              {dayNotes}
              {mealsBlock}
              {foodLogSection}
              {myDietEntry}
              {calcGoalEntry}
              {historyEntry}
              {waterTracker}
              {disclaimer}
            </div>
          );
        })()}

        {foodSheet}
        {goalSheetEl}
      </motion.div>
    </AppShell>
  );
}
