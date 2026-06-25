/**
 * Check-in post-entreno: el alumno registra esfuerzo (RPE), energía, sueño y una
 * nota para el coach. Rápido y dopamínico (pocos toques). Estilo bottom-sheet.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import type { CheckInData } from "@/lib/checkins";

const ENERGY = ["😫", "😕", "😐", "🙂", "🔥"];
const SLEEP = ["😵", "😞", "😐", "😌", "😴"];

const rpeLabel = (v: number) => (v <= 3 ? "Fácil" : v <= 6 ? "Moderado" : v <= 8 ? "Duro" : "Al límite");

const ScaleRow = ({
  label,
  emojis,
  value,
  onChange,
}: {
  label: string;
  emojis: string[];
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="mb-5">
    <p className="text-sm font-bold text-foreground mb-2">{label}</p>
    <div className="flex gap-2">
      {emojis.map((e, i) => {
        const v = i + 1;
        const on = value === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`flex-1 h-12 rounded-xl text-xl transition-all ${
              on ? "bg-primary/15 ring-2 ring-primary scale-105" : "bg-secondary/60 active:bg-secondary"
            }`}
          >
            {e}
          </button>
        );
      })}
    </div>
  </div>
);

interface WorkoutCheckInProps {
  open: boolean;
  onComplete: (data: CheckInData) => void;
  onSkip: () => void;
}

const WorkoutCheckIn = ({ open, onComplete, onSkip }: WorkoutCheckInProps) => {
  const [rpe, setRpe] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [note, setNote] = useState("");

  const canSave = rpe > 0 || energy > 0 || sleep > 0;

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
            className="w-full sm:max-w-md card-elevated rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-start justify-between mb-1">
              <h2 className="text-xl font-black text-foreground">¿Cómo te fue?</h2>
              <button onClick={onSkip} aria-label="Saltar" className="text-muted-foreground p-1 -mr-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Un segundo para que tu coach ajuste mejor tu plan.
            </p>

            {/* RPE */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-foreground">Esfuerzo (RPE)</p>
                {rpe > 0 && (
                  <span className="text-xs font-bold text-primary">
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
                      className={`h-9 rounded-lg text-xs font-bold transition-colors ${
                        on ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            <ScaleRow label="¿Cómo te sentís?" emojis={ENERGY} value={energy} onChange={setEnergy} />
            <ScaleRow label="¿Cómo dormiste?" emojis={SLEEP} value={sleep} onChange={setSleep} />

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
                onClick={() => onComplete({ rpe, energy, sleep, note: note.trim() })}
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
