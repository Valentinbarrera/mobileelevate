/**
 * Sección "Mi registro de hoy" — lo que el alumno comió (registro libre),
 * agrupado por tipo de comida, con totales y eliminar. El sheet de alta se
 * monta en la página.
 */
import { motion } from "framer-motion";
import { Plus, Trash2, Utensils } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import type { LoggedFood, MealType } from "@/hooks/useDailyNutritionTracking";

const MEAL_ORDER: { key: MealType; label: string; emoji: string }[] = [
  { key: "desayuno", label: "Desayuno", emoji: "🌅" },
  { key: "almuerzo", label: "Almuerzo", emoji: "🍽️" },
  { key: "merienda", label: "Merienda", emoji: "☕" },
  { key: "cena", label: "Cena", emoji: "🌙" },
  { key: "snack", label: "Snack", emoji: "🍎" },
];

interface FoodLogSectionProps {
  foods: LoggedFood[];
  totalCalories: number;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

const FoodLogSection = ({ foods, totalCalories, onAdd, onRemove }: FoodLogSectionProps) => {
  const groups = MEAL_ORDER.map((m) => ({
    ...m,
    items: foods.filter((f) => f.mealType === m.key),
  })).filter((g) => g.items.length > 0);

  return (
    <motion.div variants={fadeUp} className="card-elevated rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="accent-bar" />
        <h3 className="text-sm font-black text-foreground tracking-tight">Mi registro de hoy</h3>
        {totalCalories > 0 && (
          <span className="ml-auto text-sm font-black text-primary tabular-nums">
            {Math.round(totalCalories)} kcal
          </span>
        )}
      </div>

      {foods.length === 0 ? (
        <button
          onClick={onAdd}
          className="w-full flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/40 text-muted-foreground transition-colors"
        >
          <Utensils className="w-7 h-7 text-primary" />
          <span className="text-sm font-bold text-foreground">Registrá lo que comiste</span>
          <span className="text-xs">Sumá comidas dentro o fuera del plan</span>
        </button>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <div key={g.key}>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                {g.emoji} {g.label}
              </p>
              <div className="space-y-1.5">
                {g.items.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 rounded-xl bg-secondary/40 border border-white/[0.05] px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{f.name}</p>
                      {(f.protein > 0 || f.carbs > 0 || f.fats > 0) && (
                        <p className="text-[11px] text-muted-foreground tabular-nums">
                          {f.protein > 0 && <span className="text-blue-400">P {f.protein}</span>}
                          {f.carbs > 0 && <span className="text-amber-400"> · C {f.carbs}</span>}
                          {f.fats > 0 && <span className="text-rose-400"> · G {f.fats}</span>}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-black text-foreground tabular-nums shrink-0">
                      {Math.round(f.calories)}
                      <span className="text-[10px] font-bold text-muted-foreground"> kcal</span>
                    </span>
                    <button
                      onClick={() => onRemove(f.id)}
                      aria-label="Eliminar"
                      className="text-muted-foreground/60 hover:text-destructive p-1 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={onAdd}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary/60 border border-white/[0.06] text-sm font-bold text-foreground active:scale-[0.99] hover:bg-secondary transition-all"
          >
            <Plus className="w-4 h-4 text-primary" /> Agregar comida
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default FoodLogSection;
