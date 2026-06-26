/**
 * Mi dieta — el alumno diseña su propio plan de alimentación (comidas + alimentos
 * con macros). Persistente y local. Puede definir su meta de calorías, ver los
 * totales y volcar una comida al registro del día ("Comer hoy").
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Target, Check, X, Soup, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/layout/AppShell";
import ProgressRing from "@/components/ui/progress-ring";
import CountUp from "@/components/ui/count-up";
import DietFoodSheet from "@/components/nutrition/DietFoodSheet";
import { useCustomDiet, sumFoods, type DietFood } from "@/hooks/useCustomDiet";
import { useDailyNutritionTracking, type MealType } from "@/hooks/useDailyNutritionTracking";
import { staggerContainer, fadeUp } from "@/lib/animations";

const toMealType = (name: string): MealType => {
  const n = name.toLowerCase();
  if (n.includes("desayun")) return "desayuno";
  if (n.includes("almuerz")) return "almuerzo";
  if (n.includes("merien")) return "merienda";
  if (n.includes("cena")) return "cena";
  return "snack";
};

const MacroBar = ({ p, c, f }: { p: number; c: number; f: number }) => {
  const kp = p * 4;
  const kc = c * 4;
  const kf = f * 9;
  const tot = kp + kc + kf || 1;
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden bg-secondary/60">
      <div style={{ width: `${(kp / tot) * 100}%` }} className="bg-blue-400" />
      <div style={{ width: `${(kc / tot) * 100}%` }} className="bg-amber-400" />
      <div style={{ width: `${(kf / tot) * 100}%` }} className="bg-rose-400" />
    </div>
  );
};

export default function MyDiet() {
  const navigate = useNavigate();
  const {
    meals,
    calorieGoal,
    totals,
    addMeal,
    removeMeal,
    addFood,
    removeFood,
    setCalorieGoal,
    seedDefault,
  } = useCustomDiet();
  const { addFood: logFood } = useDailyNutritionTracking();

  const [foodSheetMeal, setFoodSheetMeal] = useState<{ id: string; name: string } | null>(null);
  const [addingMeal, setAddingMeal] = useState(false);
  const [newMeal, setNewMeal] = useState("");
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(calorieGoal ? String(calorieGoal) : "");

  const hasDiet = meals.length > 0;
  const goalPct = calorieGoal ? Math.min(100, Math.round((totals.calories / calorieGoal) * 100)) : 0;

  const saveGoal = () => {
    setCalorieGoal(parseFloat(goalInput) || null);
    setEditingGoal(false);
  };

  const confirmAddMeal = () => {
    if (newMeal.trim()) {
      addMeal(newMeal);
      setNewMeal("");
      setAddingMeal(false);
    }
  };

  const eatToday = (mealName: string, foods: DietFood[]) => {
    if (foods.length === 0) return;
    const mealType = toMealType(mealName);
    foods.forEach((f) =>
      logFood({
        name: f.name,
        mealType,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fats: f.fats,
      })
    );
    toast.success(`${mealName} sumada a tu registro de hoy 🍽️`);
  };

  return (
    <AppShell>
      <motion.div
        className="min-h-screen bg-background pb-32 lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
          <div className="max-w-4xl mx-auto flex items-center gap-3 px-5 lg:px-8 py-3">
            <button onClick={() => navigate(-1)} className="text-muted-foreground" aria-label="Volver">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <Soup className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Nutrición</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Mi dieta</h1>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-5 lg:px-8 pt-5 space-y-4">
          {/* Resumen del día */}
          {hasDiet && (
            <motion.div variants={fadeUp} className="card-hero rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <ProgressRing progress={goalPct} size={68} stroke={7} gradientId="dietRing">
                  <span className="text-sm font-black text-foreground tabular-nums leading-none">
                    {calorieGoal ? (
                      <>
                        <CountUp value={goalPct} />%
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                </ProgressRing>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total del plan</p>
                  <p className="text-2xl font-black text-foreground tabular-nums leading-tight">
                    <CountUp value={Math.round(totals.calories)} />
                    <span className="text-sm font-bold text-muted-foreground">
                      {calorieGoal ? ` / ${calorieGoal}` : ""} kcal
                    </span>
                  </p>

                  {/* Meta editable */}
                  {editingGoal ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        placeholder="kcal meta"
                        autoFocus
                        className="w-28 min-w-0 h-9 rounded-lg bg-secondary border border-border text-center text-sm font-bold text-foreground focus:border-primary focus:outline-none"
                      />
                      <button onClick={saveGoal} className="h-9 px-3 rounded-lg bg-gradient-primary text-primary-foreground text-sm font-bold">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setGoalInput(calorieGoal ? String(calorieGoal) : "");
                        setEditingGoal(true);
                      }}
                      className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-primary"
                    >
                      <Target className="w-3.5 h-3.5" />
                      {calorieGoal ? "Editar meta" : "Definí tu meta de calorías"}
                    </button>
                  )}
                </div>
              </div>

              {/* Macros */}
              {totals.calories > 0 && (
                <div className="mt-4">
                  <MacroBar p={totals.protein} c={totals.carbs} f={totals.fats} />
                  <div className="grid grid-cols-3 gap-2 mt-2.5">
                    {[
                      { l: "Proteína", v: totals.protein, c: "text-blue-400" },
                      { l: "Carbos", v: totals.carbs, c: "text-amber-400" },
                      { l: "Grasas", v: totals.fats, c: "text-rose-400" },
                    ].map((m) => (
                      <div key={m.l} className="text-center">
                        <p className={`text-base font-black tabular-nums ${m.c}`}>{Math.round(m.v)}g</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{m.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Empty state */}
          {!hasDiet && (
            <motion.div variants={fadeUp} className="card-hero rounded-3xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-4">
                <Soup className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-black text-foreground mb-1">Diseñá tu propia dieta</p>
              <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
                Armá tus comidas con sus alimentos y macros. Vos tenés el control.
              </p>
              <button
                onClick={seedDefault}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-bold active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" /> Empezar con 4 comidas
              </button>
            </motion.div>
          )}

          {/* Comidas (grilla de 2 columnas en desktop) */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 lg:items-start space-y-4">
          {meals.map((meal) => {
            const mt = sumFoods(meal.foods);
            return (
              <motion.div key={meal.id} variants={fadeUp} className="card-elevated rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                  <h3 className="flex-1 text-sm font-black text-foreground tracking-tight truncate">{meal.name}</h3>
                  <span className="text-xs font-bold text-muted-foreground tabular-nums">
                    {Math.round(mt.calories)} kcal
                  </span>
                  <button
                    onClick={() => removeMeal(meal.id)}
                    aria-label="Eliminar comida"
                    className="text-muted-foreground/50 hover:text-destructive p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Alimentos */}
                <div className="divide-y divide-white/[0.04]">
                  {meal.foods.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {f.name}
                          {f.qty && <span className="text-muted-foreground font-normal"> · {f.qty}</span>}
                        </p>
                        {(f.protein > 0 || f.carbs > 0 || f.fats > 0) && (
                          <p className="text-[11px] tabular-nums">
                            <span className="text-blue-400">P {f.protein}</span>
                            <span className="text-amber-400"> · C {f.carbs}</span>
                            <span className="text-rose-400"> · G {f.fats}</span>
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-black text-foreground tabular-nums shrink-0">
                        {Math.round(f.calories)}
                        <span className="text-[10px] font-bold text-muted-foreground"> kcal</span>
                      </span>
                      <button
                        onClick={() => removeFood(meal.id, f.id)}
                        aria-label="Eliminar alimento"
                        className="text-muted-foreground/50 hover:text-destructive p-1 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {meal.foods.length === 0 && (
                    <p className="px-4 py-3 text-xs text-muted-foreground">Sin alimentos todavía</p>
                  )}
                </div>

                {/* Acciones de la comida */}
                <div className="flex gap-2 p-3">
                  <button
                    onClick={() => setFoodSheetMeal({ id: meal.id, name: meal.name })}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-secondary/60 border border-white/[0.06] text-sm font-bold text-foreground active:scale-[0.99] hover:bg-secondary transition-all"
                  >
                    <Plus className="w-4 h-4 text-primary" /> Alimento
                  </button>
                  {meal.foods.length > 0 && (
                    <button
                      onClick={() => eatToday(meal.name, meal.foods)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/25 text-sm font-bold text-primary active:scale-[0.99] transition-transform"
                    >
                      <CalendarPlus className="w-4 h-4" /> Comer hoy
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
          </div>

          {/* Agregar comida */}
          {hasDiet && (
            <AnimatePresence mode="wait">
              {addingMeal ? (
                <motion.div
                  key="adding"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <input
                    value={newMeal}
                    onChange={(e) => setNewMeal(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && confirmAddMeal()}
                    placeholder="Nombre de la comida"
                    autoFocus
                    className="flex-1 min-w-0 h-11 rounded-xl bg-secondary border border-border px-3 text-base font-medium text-foreground focus:border-primary focus:outline-none"
                  />
                  <button onClick={confirmAddMeal} className="h-11 px-4 rounded-xl bg-gradient-primary text-primary-foreground font-bold">
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setAddingMeal(false); setNewMeal(""); }}
                    className="h-11 px-3 rounded-xl bg-secondary/60 border border-white/[0.06] text-muted-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="add-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setAddingMeal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/40 text-sm font-bold text-foreground transition-colors"
                >
                  <Plus className="w-4 h-4 text-primary" /> Agregar comida
                </motion.button>
              )}
            </AnimatePresence>
          )}
        </div>

        <DietFoodSheet
          open={!!foodSheetMeal}
          mealName={foodSheetMeal?.name ?? ""}
          onClose={() => setFoodSheetMeal(null)}
          onAdd={(food) => foodSheetMeal && addFood(foodSheetMeal.id, food)}
        />
      </motion.div>
    </AppShell>
  );
}
