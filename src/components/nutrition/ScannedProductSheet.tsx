/**
 * Ficha del producto escaneado: qué es, cuánto comiste y a qué comida va.
 *
 * Las calorías lideran porque son el número contra el que el alumno compara su
 * objetivo todos los días; los macros van abajo en una fila, como en el resto
 * de Nutrición. Todo se recalcula al cambiar la cantidad: no hay ningún valor
 * fijo en esta pantalla.
 *
 * Lo que el fabricante no declara se muestra como "—" y nunca como 0: en una
 * app de nutrición, un dato inventado es peor que un dato que falta.
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Package } from "lucide-react";
import CountUp from "@/components/ui/count-up";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import {
  calculateNutritionForServing,
  suggestedAmounts,
  productLogName,
  type FoodProduct,
} from "@/lib/foodProduct";
import type { LoggedFood, MealType } from "@/hooks/useDailyNutritionTracking";

const MEALS: { key: MealType; label: string }[] = [
  { key: "desayuno", label: "Desayuno" },
  { key: "almuerzo", label: "Almuerzo" },
  { key: "merienda", label: "Merienda" },
  { key: "cena", label: "Cena" },
  { key: "snack", label: "Snack" },
];

interface ScannedProductSheetProps {
  product: FoodProduct | null;
  onClose: () => void;
  defaultMeal?: MealType;
  onAdd: (food: Omit<LoggedFood, "id">) => void;
}

/** Valor de un macro ya escalado. `null` se dibuja como "—". */
const MacroCell = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number | null;
  color: string;
}) => (
  <div className="flex-1 min-w-0 text-center">
    <p className={`text-lg font-black tabular-nums ${value == null ? "text-muted-foreground/50" : color}`}>
      {value == null ? "—" : `${value}g`}
    </p>
    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
  </div>
);

const ScannedProductSheet = ({
  product,
  onClose,
  defaultMeal = "snack",
  onAdd,
}: ScannedProductSheetProps) => {
  const kb = useKeyboardInset();
  const [meal, setMeal] = useState<MealType>(defaultMeal);
  const [amount, setAmount] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [imgFailed, setImgFailed] = useState(false);

  const options = useMemo(() => (product ? suggestedAmounts(product) : []), [product]);

  // Al abrir, la cantidad arranca en la porción del fabricante (o la primera
  // sugerida): que el alumno pueda confirmar sin tocar nada es la diferencia
  // entre tres segundos y quince.
  const effectiveAmount = amount ?? options[0]?.amount ?? 100;

  const nutrients = useMemo(
    () => (product ? calculateNutritionForServing(product.per100, effectiveAmount) : null),
    [product, effectiveAmount]
  );

  if (!product) return null;

  const hasAnyData =
    product.per100.calories != null ||
    product.per100.protein != null ||
    product.per100.carbs != null ||
    product.per100.fats != null;

  const setCustomAmount = (raw: string) => {
    const clean = raw.replace(/[^0-9.,]/g, "").replace(",", ".");
    setCustom(clean);
    const n = parseFloat(clean);
    if (Number.isFinite(n) && n > 0) setAmount(Math.round(n * 10) / 10);
  };

  const confirm = () => {
    onAdd({
      name: `${productLogName(product)} · ${effectiveAmount} ${product.unit}`,
      mealType: meal,
      // El registro del día trabaja con números: lo que el producto no declara
      // entra como 0 para no romper las sumas, pero en pantalla se vio "—" y el
      // alumno supo que faltaba.
      calories: nutrients?.calories ?? 0,
      protein: nutrients?.protein ?? 0,
      carbs: nutrients?.carbs ?? 0,
      fats: nutrients?.fats ?? 0,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-md card-elevated rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto transition-[margin,max-height] duration-200"
          style={
            kb > 0 ? { marginBottom: kb, maxHeight: `calc(100dvh - ${kb + 24}px)` } : undefined
          }
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Identidad del producto */}
          <div className="flex items-start gap-3.5 mb-5">
            {/* Si la foto no está o no carga, cae al ícono. Esconder el <img>
                dejaba un hueco vacío, que se ve peor que no tener foto. */}
            {product.imageUrl && !imgFailed ? (
              <img
                src={product.imageUrl}
                alt=""
                loading="lazy"
                className="w-16 h-16 rounded-2xl object-cover bg-secondary shrink-0"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-primary/12 border border-primary/20 flex items-center justify-center shrink-0">
                <Package className="w-7 h-7 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {product.brand && (
                <p className="text-[11px] font-black uppercase tracking-widest text-primary truncate">
                  {product.brand}
                </p>
              )}
              <h2 className="text-lg font-black text-foreground tracking-tight leading-tight">
                {product.name}
              </h2>
              <p className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                {product.barcode}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="w-11 h-11 -mr-2 -mt-1 flex items-center justify-center text-muted-foreground shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!hasAnyData && (
            <div className="mb-5 rounded-2xl bg-amber-400/10 border border-amber-400/25 p-3.5">
              <p className="text-sm text-amber-200/90 leading-relaxed">
                Este producto está en la base pero <strong>no tiene información nutricional
                cargada</strong>. Podés agregarlo igual y completar los valores a mano desde
                "Agregar comida".
              </p>
            </div>
          )}

          {/* Cantidad — manda sobre todo lo de abajo */}
          <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            ¿Cuánto comiste?
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {options.map((o) => {
              const active = effectiveAmount === o.amount && custom === "";
              return (
                <button
                  key={o.label}
                  onClick={() => {
                    setAmount(o.amount);
                    setCustom("");
                  }}
                  aria-pressed={active}
                  className={`min-h-11 px-3.5 rounded-xl text-sm font-bold border transition-colors ${
                    active
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-secondary/60 border-white/[0.06] text-muted-foreground"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          <div className="relative mb-5">
            <input
              inputMode="decimal"
              value={custom}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Otra cantidad"
              aria-label={`Cantidad personalizada en ${product.unit}`}
              className="w-full h-12 pl-3.5 pr-12 rounded-2xl bg-secondary border border-border text-foreground font-bold tabular-nums focus:border-primary focus:outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground pointer-events-none">
              {product.unit}
            </span>
          </div>

          {/* Nutrición de ESA cantidad */}
          <div className="rounded-2xl bg-secondary/40 border border-white/[0.06] p-4 mb-5">
            <div className="flex items-baseline justify-between mb-3">
              {/* El mismo contador que usa el resto de Elevate, en modo
                  continuo: al cambiar la cantidad el número viaja del valor
                  viejo al nuevo, en vez de reiniciarse desde cero. */}
              <div className="flex items-baseline gap-1.5">
                {nutrients?.calories == null ? (
                  <span className="text-3xl font-black text-muted-foreground/50 leading-none">—</span>
                ) : (
                  <CountUp
                    value={nutrients.calories}
                    continuous
                    className="text-3xl font-black text-foreground tabular-nums leading-none"
                  />
                )}
                <span className="text-sm font-bold text-muted-foreground">kcal</span>
              </div>
              <span className="text-sm font-bold text-muted-foreground tabular-nums">
                {effectiveAmount} {product.unit}
              </span>
            </div>
            {/* Proteína, carbos y grasas: los mismos tres macros que usan el
                plan del coach, el resumen del día y el historial. La fibra se
                lee de la API pero NO se muestra — el registro del día no la
                guarda, así que sería un número que la app promete y después
                tira, y encima es el campo peor cargado de la base. */}
            <div className="flex gap-2 pt-3 border-t border-white/[0.06]">
              <MacroCell label="Proteína" value={nutrients?.protein ?? null} color="text-blue-400" />
              <MacroCell label="Carbos" value={nutrients?.carbs ?? null} color="text-amber-400" />
              <MacroCell label="Grasas" value={nutrients?.fats ?? null} color="text-rose-400" />
            </div>
          </div>

          {/* Comida */}
          <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            ¿En qué comida?
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
            {MEALS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMeal(m.key)}
                aria-pressed={meal === m.key}
                className={`min-h-11 px-3.5 rounded-xl text-sm font-bold border transition-colors ${
                  meal === m.key
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-secondary/60 border-white/[0.06] text-muted-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <button
            onClick={confirm}
            className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
          >
            <Check className="w-5 h-5" strokeWidth={3} />
            Agregar a {MEALS.find((m) => m.key === meal)?.label.toLowerCase()}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScannedProductSheet;
