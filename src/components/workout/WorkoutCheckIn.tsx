/**
 * Check-in post-entreno: el alumno registra esfuerzo (RPE), cómo terminó, cómo
 * se sintieron las cargas y una nota para el coach. Rápido (pocos toques).
 *
 * Dos decisiones que se ven raras si no se cuentan:
 *  - Números, no emojis. Un 😐 no es una medida: cada uno lo lee distinto y el
 *    coach no puede comparar dos entrenos. Los números sí, y encima quedan
 *    consistentes con el RPE, que siempre fue 1-10.
 *  - No se pregunta el sueño. Ya lo pregunta el readiness ANTES de entrenar,
 *    que es cuando sirve para decidir la sesión; repetirlo al final era pedir
 *    dos veces el mismo dato y no decía nada del entreno que acababa de pasar.
 *    En su lugar va cómo se sintieron los pesos, que es lo que el coach usa
 *    para subir o bajar la carga la próxima vez.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import type { CheckInData } from "@/lib/checkins";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";

const ENERGY_LABEL = ["", "Fundido", "Flojo", "Normal", "Bien", "Enchufado"];
const LOAD_LABEL = ["", "Muy livianas", "Livianas", "Justas", "Pesadas", "No pude"];

const rpeLabel = (v: number) => (v <= 3 ? "Fácil" : v <= 6 ? "Moderado" : v <= 8 ? "Duro" : "Al límite");

/** Escala 1-5 en números, con el significado del elegido al lado del título. */
const ScaleRow = ({
  label,
  labels,
  value,
  onChange,
}: {
  label: string;
  labels: string[];
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="mb-5">
    <div className="flex items-center justify-between gap-3 mb-2">
      <p className="text-sm font-bold text-foreground">{label}</p>
      {value > 0 && (
        <span className="text-sm font-bold text-primary shrink-0">
          {value} · {labels[value]}
        </span>
      )}
    </div>
    <div className="flex gap-2">
      {labels.slice(1).map((_, i) => {
        const v = i + 1;
        const on = value === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            aria-label={`${v} · ${labels[v]}`}
            aria-pressed={on}
            className={`flex-1 h-12 rounded-xl text-base font-bold transition-colors ${
              on ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {v}
          </button>
        );
      })}
    </div>
    {/* Los extremos, para que el número signifique algo sin tener que tocarlo. */}
    <div className="flex justify-between mt-1.5">
      <span className="text-[11px] text-muted-foreground">{labels[1]}</span>
      <span className="text-[11px] text-muted-foreground">{labels[5]}</span>
    </div>
  </div>
);

interface WorkoutCheckInProps {
  open: boolean;
  onComplete: (data: CheckInData) => void;
  onSkip: () => void;
}

const WorkoutCheckIn = ({ open, onComplete, onSkip }: WorkoutCheckInProps) => {
  const kb = useKeyboardInset();
  const [rpe, setRpe] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [load, setLoad] = useState(0);
  const [note, setNote] = useState("");

  const canSave = rpe > 0 || energy > 0 || load > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full sm:max-w-md card-elevated rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto transition-[margin,max-height] duration-200"
            style={
              kb > 0
                ? { marginBottom: kb, maxHeight: `calc(100dvh - ${kb + 24}px)` }
                : undefined
            }
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-xl font-black text-foreground">¿Cómo te fue?</h2>
              <button onClick={onSkip} aria-label="Saltar" className="w-11 h-11 -mr-2 flex items-center justify-center text-muted-foreground shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-foreground/70 mb-5">
              Un segundo para que tu coach ajuste mejor tu plan.
            </p>

            {/* RPE */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-foreground">Esfuerzo (RPE)</p>
                {rpe > 0 && (
                  <span className="text-sm font-bold text-primary">
                    {rpe} · {rpeLabel(rpe)}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 10 }).map((_, i) => {
                  const v = i + 1;
                  const on = rpe === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setRpe(v)}
                      className={`h-11 rounded-lg text-sm font-bold transition-colors ${
                        on ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            <ScaleRow
              label="¿Cómo terminaste?"
              labels={ENERGY_LABEL}
              value={energy}
              onChange={setEnergy}
            />
            <ScaleRow
              label="¿Cómo se sintieron las cargas?"
              labels={LOAD_LABEL}
              value={load}
              onChange={setLoad}
            />

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nota para tu coach (opcional)"
              rows={2}
              className="w-full rounded-xl bg-secondary border border-border p-3 text-sm text-foreground focus:border-primary focus:outline-none mb-5 resize-none"
            />

            <div className="flex gap-3">
              <button onClick={onSkip} className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-bold active:scale-95 transition-transform">
                Saltar
              </button>
              <button
                onClick={() => onComplete({ rpe, energy, load, note: note.trim() })}
                disabled={!canSave}
                className="flex-1 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform"
              >
                <Check className="w-4 h-4" />
                Guardar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorkoutCheckIn;
