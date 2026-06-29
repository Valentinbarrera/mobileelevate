/**
 * Historial de comidas por fecha, agrupado por mes. Cada día muestra el total
 * de kcal + barra de macros + agua; al tocarlo se despliega lo que se comió,
 * agrupado por tipo de comida.
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ChevronDown, Droplet, CheckCircle2 } from "lucide-react";
import ProgressRing from "@/components/ui/progress-ring";
import { NutritionDay } from "@/hooks/useNutritionHistory";
import type { MealType } from "@/hooks/useDailyNutritionTracking";

interface NutritionHistoryListProps {
  days: NutritionDay[];
  /** Objetivo de calorías para el anillo de cada día (plan del coach o dieta propia). */
  calorieGoal?: number | null;
}

const MEAL_ORDER: { key: MealType; label: string; emoji: string }[] = [
  { key: "desayuno", label: "Desayuno", emoji: "🌅" },
  { key: "almuerzo", label: "Almuerzo", emoji: "🍽️" },
  { key: "merienda", label: "Merienda", emoji: "☕" },
  { key: "cena", label: "Cena", emoji: "🌙" },
  { key: "snack", label: "Snack", emoji: "🍎" },
];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const dayNumber = (d: string) => new Date(d + "T00:00:00").getDate();
const weekdayShort = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "");
const monthLabel = (d: string) => {
  const dt = new Date(d + "T00:00:00");
  return `${cap(dt.toLocaleDateString("es-AR", { month: "long" }))} ${dt.getFullYear()}`;
};

/** Barra de proporción de macros (proteína/carbos/grasas por sus kcal). */
const MacroBar = ({ p, c, f }: { p: number; c: number; f: number }) => {
  const kp = p * 4;
  const kc = c * 4;
  const kf = f * 9;
  const tot = kp + kc + kf || 1;
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden bg-secondary/60 w-full">
      <div style={{ width: `${(kp / tot) * 100}%` }} className="bg-blue-400" />
      <div style={{ width: `${(kc / tot) * 100}%` }} className="bg-amber-400" />
      <div style={{ width: `${(kf / tot) * 100}%` }} className="bg-rose-400" />
    </div>
  );
};

const DayRow = ({ day, calorieGoal }: { day: NutritionDay; calorieGoal?: number | null }) => {
  const [open, setOpen] = useState(false);
  const hasFoods = day.foods.length > 0;
  const { protein, carbs, fats, calories } = day.totals;
  const goalPct = calorieGoal && calorieGoal > 0 ? Math.round((calories / calorieGoal) * 100) : null;

  const groups = MEAL_ORDER.map((m) => ({
    ...m,
    items: day.foods.filter((fd) => fd.mealType === m.key),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="rounded-xl bg-secondary/30 border border-white/[0.05] overflow-hidden">
      <button
        onClick={() => hasFoods && setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 p-2.5 text-left ${
          hasFoods ? "active:scale-[0.99] transition-transform" : "cursor-default"
        }`}
      >
        {/* Tile de fecha */}
        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center shrink-0 leading-none">
          <span className="text-base font-black text-foreground tabular-nums">{dayNumber(day.date)}</span>
          <span className="text-[9px] font-bold text-primary uppercase tracking-wide mt-0.5">
            {weekdayShort(day.date)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-foreground tabular-nums">{Math.round(calories)}</span>
            <span className="text-[11px] font-bold text-muted-foreground">kcal</span>
            <span className="text-[11px] text-muted-foreground ml-1 truncate">
              · P {Math.round(protein)} · C {Math.round(carbs)} · G {Math.round(fats)}
            </span>
          </div>
          <div className="mt-1.5">
            {protein + carbs + fats > 0 ? (
              <MacroBar p={protein} c={carbs} f={fats} />
            ) : (
              <span className="text-[11px] text-muted-foreground">Sin macros cargados</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {goalPct != null && calories > 0 ? (
            <ProgressRing progress={goalPct} size={42} stroke={4} gradientId={`ring-${day.date}`}>
              <span className="text-[10px] font-black text-foreground tabular-nums leading-none">{goalPct}%</span>
            </ProgressRing>
          ) : (
            day.water > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] font-bold text-sky-400">
                <Droplet className="w-3.5 h-3.5" />
                {day.water}
              </span>
            )
          )}
          {hasFoods && (
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-2.5 pb-3 pt-0 space-y-2.5">
              {groups.map((g) => (
                <div key={g.key} className="rounded-lg bg-background/50 border border-white/[0.05] p-2.5">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    {g.emoji} {g.label}
                  </p>
                  <div className="space-y-1">
                    {g.items.map((fd) => (
                      <div key={fd.id} className="flex items-center gap-2 text-[12px]">
                        <span className="flex-1 min-w-0 truncate text-foreground">{fd.name}</span>
                        {(fd.protein > 0 || fd.carbs > 0 || fd.fats > 0) && (
                          <span className="text-[10px] tabular-nums shrink-0">
                            <span className="text-blue-400">P{fd.protein}</span>{" "}
                            <span className="text-amber-400">C{fd.carbs}</span>{" "}
                            <span className="text-rose-400">G{fd.fats}</span>
                          </span>
                        )}
                        <span className="font-bold text-foreground tabular-nums shrink-0">
                          {Math.round(fd.calories)}
                          <span className="text-[10px] font-medium text-muted-foreground"> kcal</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3 px-0.5">
                {day.water > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-sky-400 font-semibold">
                    <Droplet className="w-3.5 h-3.5" />
                    {day.water} {day.water === 1 ? "vaso" : "vasos"} de agua
                  </span>
                )}
                {day.checkedMealsCount > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {day.checkedMealsCount} {day.checkedMealsCount === 1 ? "comida del plan" : "comidas del plan"}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NutritionHistoryList = ({ days, calorieGoal }: NutritionHistoryListProps) => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? days : days.slice(0, 8);

  const groups = useMemo(() => {
    const map = new Map<string, { label: string; items: NutritionDay[] }>();
    for (const d of visible) {
      const key = d.date.slice(0, 7);
      let g = map.get(key);
      if (!g) {
        g = { label: monthLabel(d.date), items: [] };
        map.set(key, g);
      }
      g.items.push(d);
    }
    return [...map.values()];
  }, [visible]);

  if (days.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="accent-bar" />
          <History className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-black tracking-tight text-foreground">Días registrados</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-6">
          Cargá comidas en Nutrición y tu historial aparece acá
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated rounded-2xl p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="accent-bar" />
        <History className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-black tracking-tight text-foreground">Días registrados</h3>
        <span className="ml-auto text-xs font-bold text-muted-foreground tabular-nums">{days.length}</span>
      </div>

      <div className="space-y-4">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="flex items-center gap-2 mb-2 px-0.5">
              <span className="text-[11px] font-black text-foreground/80 uppercase tracking-wider">{g.label}</span>
              <span className="text-[11px] text-muted-foreground">
                {g.items.length} {g.items.length === 1 ? "día" : "días"}
              </span>
              <span className="flex-1 h-px bg-white/[0.06]" />
            </div>
            <div className="space-y-2">
              {g.items.map((d) => (
                <DayRow key={d.date} day={d} calorieGoal={calorieGoal} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {days.length > 8 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="w-full mt-4 py-2 rounded-xl text-xs font-bold text-primary bg-primary/10 border border-primary/20 active:scale-[0.99] transition-transform"
        >
          {showAll ? "Ver menos" : `Ver los ${days.length} días`}
        </button>
      )}
    </motion.div>
  );
};

export default NutritionHistoryList;
