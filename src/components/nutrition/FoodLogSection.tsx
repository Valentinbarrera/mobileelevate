/**
 * Sección "Mi registro de hoy" — lo que el alumno comió (registro libre),
 * agrupado por tipo de comida, con totales y eliminar. El sheet de alta se
 * monta en la página.
 */
import { motion } from "framer-motion";
import { Plus, Trash2, Utensils, ScanBarcode } from "lucide-react";
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
  /** Carril rápido al escáner. Opcional: sin esto la sección queda como estaba. */
  onScan?: () => void;
}

const FoodLogSection = ({ foods, totalCalories, onAdd, onRemove, onScan }: FoodLogSectionProps) => {
  const groups = MEAL_ORDER.map((m) => ({
    ...m,
    items: foods.filter((f) => f.mealType === m.key),
  })).filter((g) => g.items.length > 0);

  return (
    <motion.div variants={fadeUp} className="card-elevated rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="accent-bar" />
        <h3 className="text-lg font-black text-foreground tracking-tight">Mi registro de hoy</h3>
        {totalCalories > 0 && (
          <span className="ml-auto text-sm font-black text-primary tabular-nums">
            {Math.round(totalCalories)} kcal
          </span>
        )}
        {/* Agregar vive también acá arriba: abajo sólo aparecía con algo ya
            cargado, así que en el estado vacío la acción no se nombraba.
            El escáner NO va en este renglón: con el título en 18px y el total
            de kcal, un tercer elemento parte "Mi registro de hoy" en dos
            líneas. Vive abajo, al lado de "Agregar comida". */}
        <button
          onClick={onAdd}
          aria-label="Agregar comida"
          className={`${totalCalories > 0 ? "" : "ml-auto"} -mr-1 w-11 h-11 flex items-center justify-center rounded-full text-primary active:scale-90 active:bg-primary/10 transition-transform`}
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {foods.length === 0 ? (
        <>
          <button
            onClick={onAdd}
            className="w-full flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/40 text-muted-foreground transition-colors"
          >
            <Utensils className="w-7 h-7 text-primary" />
            <span className="text-base font-bold text-foreground">Agregar comida</span>
            <span className="text-sm">Sumá lo que comiste, dentro o fuera del plan</span>
          </button>
          {/* El día vacío es JUSTO cuando alguien usa el escáner por primera
              vez: si el atajo sólo apareciera con comidas ya cargadas, nunca
              lo descubriría. */}
          {onScan && (
            <button
              onClick={onScan}
              className="w-full mt-2 min-h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-bold text-primary active:scale-[0.99] transition-transform"
            >
              <ScanBarcode className="w-5 h-5" strokeWidth={2.2} />
              Escanear un código de barras
            </button>
          )}
        </>
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
                      <p className="text-base font-semibold text-foreground truncate">{f.name}</p>
                      {(f.protein > 0 || f.carbs > 0 || f.fats > 0) && (
                        <p className="text-sm text-muted-foreground tabular-nums">
                          {f.protein > 0 && <span className="text-blue-400">P {f.protein}</span>}
                          {f.carbs > 0 && <span className="text-amber-400"> · C {f.carbs}</span>}
                          {f.fats > 0 && <span className="text-rose-400"> · G {f.fats}</span>}
                        </p>
                      )}
                    </div>
                    <span className="text-base font-black text-foreground tabular-nums shrink-0">
                      {Math.round(f.calories)}
                      <span className="text-xs font-bold text-muted-foreground"> kcal</span>
                    </span>
                    <button
                      onClick={() => onRemove(f.id)}
                      aria-label="Eliminar"
                      className="text-muted-foreground/60 hover:text-destructive w-11 h-11 flex items-center justify-center shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Carril rápido al escáner, al lado de agregar: acá sí hay ancho, y
              escanear un envase es lo que más se repite en el día. */}
          <div className="flex gap-2">
            <button
              onClick={onAdd}
              className="flex-1 flex items-center justify-center gap-2 min-h-11 py-2.5 rounded-xl bg-secondary/60 border border-white/[0.06] text-sm font-bold text-foreground active:scale-[0.99] hover:bg-secondary transition-all"
            >
              <Plus className="w-5 h-5 text-primary" /> Agregar comida
            </button>
            {onScan && (
              <button
                onClick={onScan}
                aria-label="Escanear código de barras"
                className="shrink-0 w-14 min-h-11 flex items-center justify-center rounded-xl bg-primary/12 border border-primary/25 text-primary active:scale-95 transition-transform"
              >
                <ScanBarcode className="w-5 h-5" strokeWidth={2.2} />
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FoodLogSection;
