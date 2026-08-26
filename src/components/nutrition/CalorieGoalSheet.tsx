/**
 * Bottom-sheet para elegir el objetivo calórico.
 *
 * Tres presets sobre el mismo cálculo (déficit / mantenimiento / volumen) o un
 * número a mano. Muestra el resultado mientras elegís: el alumno no tiene por
 * qué saber cuánto le queda un "déficit de 500" hasta verlo.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Target, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  computeTarget,
  MAX_ADJUST,
  type CalorieGoalMode,
  type CalorieInputs,
} from "@/lib/nutritionCalc";
import {
  AUTO,
  MANUAL_MAX,
  MANUAL_MIN,
  MODE_LABEL,
  type CalorieGoalPref,
} from "@/lib/calorieGoal";

type Choice = CalorieGoalMode | "manual";

const MODES: CalorieGoalMode[] = ["deficit", "maintain", "surplus"];
const STEP = 50;

interface Props {
  open: boolean;
  onClose: () => void;
  inputs: CalorieInputs;
  /** Lo que el cuestionario propone, para poder volver a "automático". */
  autoTarget: number;
  /** Modo y ajuste que derivó el cuestionario, para abrir mostrando ese número. */
  autoPreset: { mode: CalorieGoalMode; adjust: number };
  /**
   * Meta del plan del coach, si hay. Cambia qué significa "volver": con plan
   * asignado, resetear devuelve el mando al coach, no al cuestionario.
   */
  coachTarget?: number | null;
  current: CalorieGoalPref;
  onSave: (pref: CalorieGoalPref) => void;
}

const CalorieGoalSheet = ({
  open,
  onClose,
  inputs,
  autoTarget,
  autoPreset,
  coachTarget,
  current,
  onSave,
}: Props) => {
  const [choice, setChoice] = useState<Choice>("maintain");
  const [adjust, setAdjust] = useState(500);
  const [manual, setManual] = useState("");

  // Al abrir, arranca en lo que el alumno tiene puesto hoy. En "auto" eso es lo
  // que derivó el cuestionario: si abriera en mantenimiento, el sheet mostraría
  // un número distinto al de la card que acabás de tocar.
  useEffect(() => {
    if (!open) return;
    if (current.kind === "manual") {
      setChoice("manual");
      setManual(String(current.calories));
    } else if (current.kind === "preset") {
      setChoice(current.mode);
      setAdjust(current.mode === "maintain" ? 500 : current.adjust);
    } else {
      setChoice(autoPreset.mode);
      setAdjust(autoPreset.mode === "maintain" ? 500 : autoPreset.adjust);
      setManual(String(autoTarget));
    }
  }, [open, current, autoTarget, autoPreset.mode, autoPreset.adjust]);

  if (!open) return null;

  const manualNum = Math.round(Number(manual) || 0);
  const manualValid = manualNum >= MANUAL_MIN && manualNum <= MANUAL_MAX;

  const preview =
    choice === "manual"
      ? manualValid
        ? manualNum
        : null
      : computeTarget(inputs, choice, choice === "maintain" ? 0 : adjust).target;

  const guardar = () => {
    if (choice === "manual") {
      if (!manualValid) {
        toast.error(`Poné un número entre ${MANUAL_MIN} y ${MANUAL_MAX} kcal`);
        return;
      }
      onSave({ kind: "manual", calories: manualNum });
    } else {
      onSave({ kind: "preset", mode: choice, adjust: choice === "maintain" ? 0 : adjust });
    }
    toast.success("Objetivo actualizado");
    onClose();
  };

  const hayPlan = coachTarget != null && coachTarget > 0;

  const volverAlAutomatico = () => {
    onSave(AUTO);
    toast(hayPlan ? "Volviste a la meta de tu coach" : "Volviste al objetivo del cuestionario");
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          role="dialog"
          aria-label="Elegir objetivo calórico"
          className="w-full sm:max-w-md card-elevated rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-black text-foreground">Tu objetivo</h2>
              <p className="text-sm text-muted-foreground tabular-nums">
                Mantenimiento estimado: {computeTarget(inputs, "maintain", 0).tdee} kcal
              </p>
            </div>
            <button onClick={onClose} aria-label="Cerrar" className="w-11 h-11 flex items-center justify-center">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {MODES.map((m) => (
              <button
                key={m}
                onClick={() => setChoice(m)}
                aria-pressed={choice === m}
                className={`min-h-11 rounded-xl px-3 text-sm font-bold border transition-colors ${
                  choice === m
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "bg-secondary/40 border-white/[0.06] text-foreground/70"
                }`}
              >
                {MODE_LABEL[m]}
              </button>
            ))}
            <button
              onClick={() => setChoice("manual")}
              aria-pressed={choice === "manual"}
              className={`min-h-11 rounded-xl px-3 text-sm font-bold border transition-colors ${
                choice === "manual"
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-secondary/40 border-white/[0.06] text-foreground/70"
              }`}
            >
              Poner el número
            </button>
          </div>

          {choice === "manual" ? (
            <label className="flex flex-col gap-1.5 mb-4">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Calorías por día
              </span>
              <input
                type="number"
                inputMode="numeric"
                autoFocus
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="2400"
                className="w-full min-h-12 rounded-xl bg-background border border-white/10 px-4 text-lg font-black text-foreground tabular-nums focus:border-primary/60 focus:outline-none"
              />
            </label>
          ) : choice !== "maintain" ? (
            <div className="mb-4">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {choice === "deficit" ? "Cuánto bajás" : "Cuánto subís"}
              </span>
              <div className="flex items-center gap-3 mt-1.5">
                <button
                  onClick={() => setAdjust((v) => Math.max(0, v - STEP))}
                  aria-label="Menos"
                  className="w-12 h-12 rounded-xl bg-secondary/60 border border-white/[0.06] text-xl font-black text-foreground active:scale-95 transition-transform"
                >
                  −
                </button>
                <span className="flex-1 text-center text-xl font-black text-foreground tabular-nums">
                  {adjust} <span className="text-sm font-bold text-muted-foreground">kcal</span>
                </span>
                <button
                  onClick={() => setAdjust((v) => Math.min(MAX_ADJUST, v + STEP))}
                  aria-label="Más"
                  className="w-12 h-12 rounded-xl bg-secondary/60 border border-white/[0.06] text-xl font-black text-foreground active:scale-95 transition-transform"
                >
                  +
                </button>
              </div>
            </div>
          ) : null}

          {/* El resultado a la vista mientras elegís: "déficit de 500" no le
              dice nada a nadie hasta ver en cuántas calorías termina. */}
          <div className="rounded-2xl bg-primary/10 border border-primary/25 p-4 mb-5 text-center">
            <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Tu objetivo queda en</p>
            <p className="text-3xl font-black text-foreground tabular-nums leading-tight mt-0.5">
              {preview ?? "—"}
              <span className="text-sm font-bold text-muted-foreground"> kcal</span>
            </p>
          </div>

          <button
            onClick={guardar}
            className="w-full min-h-12 rounded-xl bg-primary text-primary-foreground font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Check className="w-5 h-5" /> Guardar
          </button>

          {current.kind !== "auto" && (
            <button
              onClick={volverAlAutomatico}
              className="w-full min-h-11 mt-2 flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground"
            >
              <RotateCcw className="w-4 h-4" />{" "}
              {hayPlan
                ? `Volver a la de tu coach (${coachTarget} kcal)`
                : `Volver al del cuestionario (${autoTarget} kcal)`}
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CalorieGoalSheet;
