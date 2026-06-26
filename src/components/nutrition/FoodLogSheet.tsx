/**
 * Bottom-sheet para registrar lo que el alumno comió (registro libre).
 * Nombre + calorías (obligatorio) + macros opcionales + tipo de comida.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Utensils } from "lucide-react";
import { toast } from "sonner";
import type { LoggedFood, MealType } from "@/hooks/useDailyNutritionTracking";

const MEAL_TYPES: { key: MealType; label: string; emoji: string }[] = [
  { key: "desayuno", label: "Desayuno", emoji: "🌅" },
  { key: "almuerzo", label: "Almuerzo", emoji: "🍽️" },
  { key: "merienda", label: "Merienda", emoji: "☕" },
  { key: "cena", label: "Cena", emoji: "🌙" },
  { key: "snack", label: "Snack", emoji: "🍎" },
];

interface FoodLogSheetProps {
  open: boolean;
  onClose: () => void;
  defaultMeal?: MealType;
  onAdd: (food: Omit<LoggedFood, "id">) => void;
}

const numField = (v: string) => Math.max(0, Math.round((parseFloat(v) || 0) * 10) / 10);

const FoodLogSheet = ({ open, onClose, defaultMeal = "almuerzo", onAdd }: FoodLogSheetProps) => {
  const [mealType, setMealType] = useState<MealType>(defaultMeal);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  useEffect(() => {
    if (open) {
      setMealType(defaultMeal);
      setName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFats("");
    }
  }, [open, defaultMeal]);

  const save = () => {
    if (!name.trim()) {
      toast.error("Poné un nombre");
      return;
    }
    const kcal = numField(calories);
    if (kcal <= 0) {
      toast.error("Ingresá las calorías");
      return;
    }
    onAdd({
      name: name.trim(),
      mealType,
      calories: kcal,
      protein: numField(protein),
      carbs: numField(carbs),
      fats: numField(fats),
    });
    toast.success("Comida registrada 🍽️");
    onClose();
  };

  const macroInput = (
    label: string,
    value: string,
    set: (v: string) => void,
    color: string
  ) => (
    <label className="flex flex-col gap-1 min-w-0">
      <span className={`text-[10px] font-bold uppercase tracking-wider px-1 ${color}`}>{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => set(e.target.value)}
        onFocus={(e) => e.target.select()}
        placeholder="0"
        className="w-full min-w-0 h-11 rounded-lg bg-secondary border border-border text-center text-base font-bold text-foreground focus:border-primary focus:outline-none"
      />
    </label>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md card-elevated rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground leading-tight">Registrar comida</h2>
                  <p className="text-sm text-muted-foreground">Lo que comiste hoy</p>
                </div>
              </div>
              <button onClick={onClose} aria-label="Cerrar" className="text-muted-foreground p-1 -mr-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tipo de comida */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 mb-5">
              {MEAL_TYPES.map((t) => {
                const active = mealType === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setMealType(t.key)}
                    className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 border text-sm font-bold transition-colors ${
                      active
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-white/[0.06] bg-secondary/40 text-muted-foreground"
                    }`}
                  >
                    <span>{t.emoji}</span> {t.label}
                  </button>
                );
              })}
            </div>

            {/* Nombre */}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="¿Qué comiste? Ej: Pollo con arroz"
              className="w-full min-w-0 h-12 rounded-xl bg-secondary border border-border px-3 text-base font-medium text-foreground focus:border-primary focus:outline-none mb-3"
            />

            {/* Calorías */}
            <label className="flex flex-col gap-1 min-w-0 mb-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                Calorías (kcal)
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="w-full min-w-0 h-12 rounded-xl bg-secondary border border-border text-center text-lg font-black text-foreground focus:border-primary focus:outline-none"
              />
            </label>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {macroInput("Proteína", protein, setProtein, "text-blue-400")}
              {macroInput("Carbos", carbs, setCarbs, "text-amber-400")}
              {macroInput("Grasas", fats, setFats, "text-rose-400")}
            </div>

            <button
              onClick={save}
              className="w-full h-12 rounded-2xl bg-gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
            >
              <Check className="w-5 h-5" /> Registrar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FoodLogSheet;
