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
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Package, Pencil } from "lucide-react";
import { toast } from "sonner";
import CountUp from "@/components/ui/count-up";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import {
  calculateNutritionForServing,
  suggestedAmounts,
  productLogName,
  hasNutritionData,
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
  /** El producto tal como quedó tras editarlo, para recordarlo en recientes. */
  onSaveProduct?: (product: FoodProduct) => void;
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

/** Campo numérico de "por 100". Vacío = el dato no existe, y eso vale. */
const Per100Input = ({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  color: string;
}) => (
  <label className="flex flex-col gap-1 min-w-0">
    <span className={`text-[11px] font-bold uppercase tracking-wider px-1 ${color}`}>{label}</span>
    <input
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={(e) => e.target.select()}
      placeholder="—"
      className="w-full min-w-0 h-11 rounded-lg bg-secondary border border-border text-center text-base font-bold text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none"
    />
  </label>
);

/** "12,5" → 12.5 · "" → null. Vacío es "no sé", no es cero. */
const parseField = (raw: string): number | null => {
  const n = parseFloat(raw.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 10) / 10 : null;
};
const fieldOf = (v: number | null) => (v == null ? "" : String(v));

const ScannedProductSheet = ({
  product,
  onClose,
  defaultMeal = "snack",
  onAdd,
  onSaveProduct,
}: ScannedProductSheetProps) => {
  const kb = useKeyboardInset();
  const [meal, setMeal] = useState<MealType>(defaultMeal);
  const [amount, setAmount] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [imgFailed, setImgFailed] = useState(false);

  // Datos editables. Arrancan en lo que trajo la base y el alumno los puede
  // corregir o completar: si el envase dice otra cosa, manda el envase.
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [prot, setProt] = useState("");
  const [carb, setCarb] = useState("");
  const [fat, setFat] = useState("");
  const [editing, setEditing] = useState(false);

  // Al cambiar de producto se recarga todo. Un producto sin nombre o sin
  // ningún dato abre DIRECTO en edición: no tiene sentido mostrar una ficha
  // vacía y pedir un toque más para poder llenarla.
  const barcode = product?.barcode ?? null;
  useEffect(() => {
    if (!product) return;
    setName(product.name);
    setKcal(fieldOf(product.per100.calories));
    setProt(fieldOf(product.per100.protein));
    setCarb(fieldOf(product.per100.carbs));
    setFat(fieldOf(product.per100.fats));
    setAmount(null);
    setCustom("");
    setImgFailed(false);
    setEditing(!product.name || !hasNutritionData(product));
  }, [barcode, product]);

  // El producto tal como quedó después de editar. Es lo que se usa para
  // calcular, para guardar y para recordar en recientes.
  const edited = useMemo<FoodProduct | null>(() => {
    if (!product) return null;
    return {
      ...product,
      name: name.trim(),
      per100: {
        calories: parseField(kcal),
        protein: parseField(prot),
        carbs: parseField(carb),
        fats: parseField(fat),
        fiber: product.per100.fiber,
      },
    };
  }, [product, name, kcal, prot, carb, fat]);

  const options = useMemo(() => (edited ? suggestedAmounts(edited) : []), [edited]);

  // Al abrir, la cantidad arranca en la porción del fabricante (o la primera
  // sugerida): que el alumno pueda confirmar sin tocar nada es la diferencia
  // entre tres segundos y quince.
  const effectiveAmount = amount ?? options[0]?.amount ?? 100;

  const nutrients = useMemo(
    () => (edited ? calculateNutritionForServing(edited.per100, effectiveAmount) : null),
    [edited, effectiveAmount]
  );

  if (!product || !edited) return null;

  const hasAnyData = hasNutritionData(edited);
  const canSave = edited.name !== "" && (nutrients?.calories ?? 0) > 0;

  const setCustomAmount = (raw: string) => {
    const clean = raw.replace(/[^0-9.,]/g, "").replace(",", ".");
    setCustom(clean);
    const n = parseFloat(clean);
    if (Number.isFinite(n) && n > 0) setAmount(Math.round(n * 10) / 10);
  };

  const confirm = () => {
    if (!canSave) {
      toast.error(edited.name === "" ? "Poné el nombre del producto" : "Cargá las calorías");
      return;
    }
    // Se recuerda con lo editado: si cargaste vos los datos de un producto que
    // la base no tiene, la próxima vez que lo escanees ya están.
    onSaveProduct?.(edited);
    onAdd({
      name: `${productLogName(edited)} · ${effectiveAmount} ${edited.unit}`,
      mealType: meal,
      // El registro del día trabaja con números: lo que no se declaró entra
      // como 0 para no romper las sumas, pero en pantalla se vio "—" y el
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
              {/* El nombre se escribe cuando el producto no está en la base.
                  Si ya vino con nombre se muestra como titulo, pero igual se
                  puede corregir desde "Editar datos". */}
              {editing ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre del producto"
                  aria-label="Nombre del producto"
                  className="w-full h-11 rounded-xl bg-secondary border border-border px-3 text-base font-bold text-foreground placeholder:text-muted-foreground/50 placeholder:font-normal focus:border-primary focus:outline-none"
                />
              ) : (
                <h2 className="text-lg font-black text-foreground tracking-tight leading-tight">
                  {edited.name}
                </h2>
              )}
              <p className="text-[11px] text-muted-foreground tabular-nums mt-1">
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

          {/* Los valores del envase. Se editan acá mismo: antes, cuando el
              producto no estaba en la base o venía sin datos, el cartel te
              mandaba a "Agregar comida" — otro formulario, desde cero y
              perdiendo el código de barras. */}
          {editing && (
            <div className="mb-5 rounded-2xl bg-secondary/40 border border-white/[0.06] p-4">
              <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">
                Valores por 100 {edited.unit}
              </p>
              <p className="text-[12px] text-muted-foreground leading-tight mt-0.5 mb-3">
                Como figuran en la tabla nutricional del envase. Lo que no sepas, dejalo vacío.
              </p>
              <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                <Per100Input label="Calorías (kcal)" value={kcal} onChange={setKcal} color="text-foreground/70" />
                <Per100Input label="Proteína (g)" value={prot} onChange={setProt} color="text-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Per100Input label="Carbos (g)" value={carb} onChange={setCarb} color="text-amber-400" />
                <Per100Input label="Grasas (g)" value={fat} onChange={setFat} color="text-rose-400" />
              </div>
              <p className="text-[12px] text-muted-foreground leading-tight mt-3">
                Se guarda con este código de barras: la próxima vez que lo escanees, ya va a estar.
              </p>
            </div>
          )}

          {!editing && !hasAnyData && (
            <button
              onClick={() => setEditing(true)}
              className="w-full mb-5 rounded-2xl bg-amber-400/10 border border-amber-400/25 p-3.5 text-left active:scale-[0.99] transition-transform"
            >
              <p className="text-sm text-amber-200/90 leading-relaxed">
                Este producto está en la base pero <strong>sin información nutricional</strong>.
                Tocá acá para cargar los valores del envase.
              </p>
            </button>
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

            {/* Los datos de la base pueden estar mal o incompletos: si el
                envase dice otra cosa, manda el envase. */}
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="w-full min-h-11 mt-3 flex items-center justify-center gap-1.5 text-sm font-bold text-primary active:scale-[0.99] transition-transform"
              >
                <Pencil className="w-4 h-4" />
                Editar datos del producto
              </button>
            )}
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
