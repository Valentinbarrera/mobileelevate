/**
 * Bottom-sheet para agregar un alimento a una comida de "Mi dieta".
 * Nombre + porción + calorías (obligatorio) + macros opcionales.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { toast } from "sonner";
import type { DietFood } from "@/hooks/useCustomDiet";

interface DietFoodSheetProps {
  open: boolean;
  mealName: string;
  onClose: () => void;
  onAdd: (food: Omit<DietFood, "id">) => void;
}

const num = (v: string) => Math.max(0, Math.round((parseFloat(v) || 0) * 10) / 10);

const DietFoodSheet = ({ open, mealName, onClose, onAdd }: DietFoodSheetProps) => {
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setQty("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFats("");
    }
  }, [open]);

  const save = () => {
    if (!name.trim()) return toast.error("Poné un nombre");
    const kcal = num(calories);
    if (kcal <= 0) return toast.error("Ingresá las calorías");
    onAdd({
      name: name.trim(),
      qty: qty.trim(),
      calories: kcal,
      protein: num(protein),
      carbs: num(carbs),
      fats: num(fats),
    });
    toast.success("Alimento agregado");
    onClose();
  };

  const macroInput = (label: string, value: string, set: (v: string) => void, color: string) => (
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
              <div>
                <h2 className="text-xl font-black text-foreground leading-tight">Agregar alimento</h2>
                <p className="text-sm text-muted-foreground truncate">a {mealName}</p>
              </div>
              <button onClick={onClose} aria-label="Cerrar" className="text-muted-foreground p-1 -mr-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alimento. Ej: Pechuga de pollo"
                className="flex-[2] min-w-0 h-12 rounded-xl bg-secondary border border-border px-3 text-base font-medium text-foreground focus:border-primary focus:outline-none"
              />
              <input
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="150g"
                className="flex-1 min-w-0 h-12 rounded-xl bg-secondary border border-border px-3 text-base font-medium text-center text-foreground focus:border-primary focus:outline-none"
              />
            </div>

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

            <div className="grid grid-cols-3 gap-2 mb-6">
              {macroInput("Proteína", protein, setProtein, "text-blue-400")}
              {macroInput("Carbos", carbs, setCarbs, "text-amber-400")}
              {macroInput("Grasas", fats, setFats, "text-rose-400")}
            </div>

            <button
              onClick={save}
              className="w-full h-12 rounded-2xl bg-gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
            >
              <Check className="w-5 h-5" /> Agregar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DietFoodSheet;
