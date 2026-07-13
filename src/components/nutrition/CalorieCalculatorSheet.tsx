/**
 * Calculadora de calorías (Harris-Benedict) — modal para "Mi dieta".
 *
 * Lee los datos del onboarding (sexo, edad, altura, peso, actividad), estima el
 * mantenimiento y deja al alumno elegir déficit / equilibrio / superávit y cuántas
 * kcal, con guardrails de seguridad. Al confirmar, setea la meta de calorías.
 * Es cálculo puro (sin IA) y orientativo — ver nutritionCalc.ts + NutritionDisclaimer.
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Check, Calculator, Minus, Plus, TrendingDown, TrendingUp, Scale, AlertTriangle } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { loadOnboarding } from "@/lib/onboarding";
import {
  computeTarget,
  defaultModeForGoal,
  inputsFromOnboarding,
  suggestMacros,
  ACTIVITY_FACTORS,
  MAX_ADJUST,
  type CalorieGoalMode,
} from "@/lib/nutritionCalc";

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (target: number) => void;
}

const MODES: { value: CalorieGoalMode; label: string; icon: typeof Scale }[] = [
  { value: "deficit", label: "Déficit", icon: TrendingDown },
  { value: "maintain", label: "Equilibrio", icon: Scale },
  { value: "surplus", label: "Superávit", icon: TrendingUp },
];

const ADJUST_PRESETS = [250, 500, 750];
const ADJUST_STEP = 50;

const CalorieCalculatorSheet = ({ open, onClose, onApply }: Props) => {
  const navigate = useNavigate();
  const { student, isAdminMode } = useAuthContext();
  const studentId = student?.id || (isAdminMode ? "admin" : "anon");

  const onboarding = useMemo(() => (open ? loadOnboarding(studentId) : null), [open, studentId]);
  const inputs = useMemo(() => (onboarding ? inputsFromOnboarding(onboarding) : null), [onboarding]);
  const preset = useMemo(() => defaultModeForGoal(onboarding?.goal ?? null), [onboarding]);

  const [mode, setMode] = useState<CalorieGoalMode>(preset.mode);
  const [adjust, setAdjust] = useState<number>(preset.adjust || 500);
  // Sincroniza el preset cuando se abre con datos nuevos
  const [seededFor, setSeededFor] = useState<string | null>(null);
  if (open && seededFor !== studentId && inputs) {
    setSeededFor(studentId);
    setMode(preset.mode);
    setAdjust(preset.adjust || 500);
  }

  const result = useMemo(
    () => (inputs ? computeTarget(inputs, mode, adjust) : null),
    [inputs, mode, adjust]
  );
  const macros = useMemo(
    () => (result && inputs ? suggestMacros(result.target, inputs.weightKg) : null),
    [result, inputs]
  );

  const stepAdjust = (delta: number) =>
    setAdjust((a) => Math.min(MAX_ADJUST, Math.max(0, a + delta)));

  const apply = () => {
    if (result) onApply(result.target);
    onClose();
  };

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
                <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                  <Calculator className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground leading-tight">Calcular calorías</h2>
                  <p className="text-xs text-muted-foreground">Método Harris-Benedict</p>
                </div>
              </div>
              <button onClick={onClose} aria-label="Cerrar" className="text-muted-foreground p-1 -mr-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Falta completar el perfil */}
            {!inputs ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary/60 border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-base font-black text-foreground mb-1">Faltan datos de tu perfil</p>
                <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
                  Para calcular necesitamos tu sexo, edad, altura, peso y nivel de actividad. Los cargás
                  en el cuestionario en menos de un minuto.
                </p>
                <button
                  onClick={() => navigate("/onboarding")}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-bold active:scale-95 transition-transform"
                >
                  Completar mi perfil
                </button>
              </div>
            ) : (
              result && (
                <>
                  {/* Desglose del cálculo */}
                  <div className="rounded-2xl bg-secondary/40 border border-white/[0.06] p-4 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Metabolismo basal (BMR)</span>
                      <span className="font-bold text-foreground tabular-nums">{result.bmr} kcal</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-white/[0.06]">
                      <span className="text-muted-foreground">
                        Mantenimiento
                        <span className="text-[11px] text-muted-foreground/70">
                          {" "}
                          (×{ACTIVITY_FACTORS[inputs.activityLevel]})
                        </span>
                      </span>
                      <span className="font-bold text-foreground tabular-nums">{result.tdee} kcal</span>
                    </div>
                  </div>

                  {/* Selector de objetivo */}
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Tu objetivo
                  </p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {MODES.map((m) => {
                      const Icon = m.icon;
                      const active = mode === m.value;
                      return (
                        <button
                          key={m.value}
                          onClick={() => setMode(m.value)}
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-bold transition-all ${
                            active
                              ? "bg-primary/15 border-primary/40 text-primary"
                              : "bg-secondary/50 border-white/[0.06] text-muted-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {m.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Magnitud del ajuste (solo déficit/superávit) */}
                  <AnimatePresence initial={false}>
                    {mode !== "maintain" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                          {mode === "deficit" ? "Cuánto déficit por día" : "Cuánto superávit por día"}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => stepAdjust(-ADJUST_STEP)}
                            aria-label="Menos"
                            className="w-11 h-11 rounded-xl bg-secondary/60 border border-white/[0.06] flex items-center justify-center text-foreground active:scale-95 transition-transform"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <div className="flex-1 h-11 rounded-xl bg-secondary/60 border border-white/[0.06] flex items-center justify-center">
                            <span className="text-base font-black text-foreground tabular-nums">
                              {mode === "deficit" ? "−" : "+"}
                              {adjust} kcal
                            </span>
                          </div>
                          <button
                            onClick={() => stepAdjust(ADJUST_STEP)}
                            aria-label="Más"
                            className="w-11 h-11 rounded-xl bg-secondary/60 border border-white/[0.06] flex items-center justify-center text-foreground active:scale-95 transition-transform"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          {ADJUST_PRESETS.map((p) => (
                            <button
                              key={p}
                              onClick={() => setAdjust(p)}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                                adjust === p
                                  ? "bg-primary/15 border-primary/40 text-primary"
                                  : "bg-secondary/40 border-white/[0.06] text-muted-foreground"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Resultado */}
                  <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/25 p-4 mt-4 text-center">
                    <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Tu meta diaria</p>
                    <p className="text-4xl font-black text-foreground tabular-nums leading-tight mt-1">
                      {result.target}
                      <span className="text-base font-bold text-muted-foreground"> kcal</span>
                    </p>
                    {macros && (
                      <p className="text-xs text-muted-foreground tabular-nums mt-1.5">
                        <span className="text-blue-400 font-bold">P {macros.protein}g</span>
                        {" · "}
                        <span className="text-amber-400 font-bold">C {macros.carbs}g</span>
                        {" · "}
                        <span className="text-rose-400 font-bold">G {macros.fats}g</span>
                      </p>
                    )}
                  </div>

                  {/* Aviso de piso de seguridad */}
                  {result.clampedToFloor && (
                    <div className="flex items-start gap-2 mt-3 rounded-xl bg-amber-500/10 border border-amber-500/25 px-3 py-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-foreground/80">
                        Ajustamos tu meta al mínimo seguro. Bajar más de ahí no es recomendable sin la
                        supervisión de un profesional.
                      </p>
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-3">
                    Es una estimación orientativa, no una indicación médica. Consultá a tu coach o a un
                    nutricionista antes de sostener un déficit o superávit.
                  </p>

                  <button
                    onClick={apply}
                    className="w-full h-12 rounded-2xl bg-gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-[0.99] transition-transform mt-4"
                  >
                    <Check className="w-5 h-5" /> Usar {result.target} kcal como meta
                  </button>
                </>
              )
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CalorieCalculatorSheet;
