/**
 * Modal de "Nota del ejercicio" — el alumno escribe su propia nota (técnica,
 * ajustes de máquina, sensaciones) y puede fijarla en todas las semanas.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

interface Props {
  open: boolean;
  exerciseName: string;
  initialText: string;
  initialPinned: boolean;
  onClose: () => void;
  onSave: (text: string, pinned: boolean) => void;
}

const ExerciseNoteSheet = ({
  open,
  exerciseName,
  initialText,
  initialPinned,
  onClose,
  onSave,
}: Props) => {
  const [text, setText] = useState(initialText);
  const [pinned, setPinned] = useState(initialPinned);

  useEffect(() => {
    if (open) {
      setText(initialText);
      setPinned(initialPinned);
    }
  }, [open, initialText, initialPinned]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md card-elevated rounded-t-3xl sm:rounded-3xl p-6"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.14em]">
                  Nota del ejercicio
                </p>
                <h2 className="text-lg font-black text-foreground leading-tight truncate">{exerciseName}</h2>
              </div>
              <button onClick={onClose} aria-label="Cerrar" className="text-muted-foreground p-1 -mr-1 shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
              rows={4}
              placeholder="Escribí una nota para este ejercicio… (técnica, ajustes de máquina, sensaciones, etc.)"
              className="w-full rounded-xl bg-secondary border border-border px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none resize-none"
            />

            {/* Fijar en todas las semanas */}
            <button
              type="button"
              onClick={() => setPinned((p) => !p)}
              className="w-full flex items-center gap-3 rounded-xl bg-secondary/40 border border-white/[0.06] px-3.5 py-3 mt-3 text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">Fijar en todas las semanas</p>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Si está activado, la nota viaja con vos cada semana del mes.
                </p>
              </div>
              <span
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                  pinned ? "bg-primary" : "bg-secondary border border-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    pinned ? "translate-x-5" : ""
                  }`}
                />
              </span>
            </button>

            <div className="flex gap-2.5 mt-5">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-secondary/60 border border-white/[0.06] text-foreground font-bold active:scale-[0.99] transition-transform"
              >
                Cancelar
              </button>
              <button
                onClick={() => onSave(text, pinned)}
                className="flex-1 py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
              >
                <Check className="w-4 h-4" /> Guardar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExerciseNoteSheet;
