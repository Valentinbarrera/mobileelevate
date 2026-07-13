/**
 * Modal that appears when an exercise is completed
 * Shows success message and suggests next exercise
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Trophy, Sparkles, Activity, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Confetti from "@/components/summary/Confetti";

interface ExerciseCompletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToNext: () => void;
  completedExerciseName: string;
  nextExercise?: {
    name: string;
    sets: number;
    reps: string;
  } | null;
  isLastExercise?: boolean;
  totalCompleted: number;
  totalExercises: number;
  onSubmitFeedback?: (stimulus: number, jointPain: number) => void;
}

/** Escala compacta 1-5 para el feedback del ejercicio. */
const MiniScale = ({
  value,
  onChange,
  tone,
}: {
  value: number | null;
  onChange: (n: number) => void;
  tone: "primary" | "amber";
}) => (
  <div className="grid grid-cols-5 gap-1">
    {[1, 2, 3, 4, 5].map((n) => {
      const active = value === n;
      const activeCls = tone === "amber" ? "bg-amber-500 border-amber-500 text-white" : "bg-primary border-primary text-primary-foreground";
      return (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`h-9 rounded-lg text-xs font-black tabular-nums border transition-all active:scale-95 ${
            active ? activeCls : "bg-secondary/60 border-white/[0.06] text-muted-foreground"
          }`}
        >
          {n}
        </button>
      );
    })}
  </div>
);

const ExerciseCompletedModal = ({
  isOpen,
  onClose,
  onGoToNext,
  completedExerciseName,
  nextExercise,
  isLastExercise,
  totalCompleted,
  totalExercises,
  onSubmitFeedback,
}: ExerciseCompletedModalProps) => {
  const [stimulus, setStimulus] = useState<number | null>(null);
  const [jointPain, setJointPain] = useState<number | null>(null);

  // Reinicia el feedback cada vez que se abre para un ejercicio nuevo
  useEffect(() => {
    if (isOpen) {
      setStimulus(null);
      setJointPain(null);
    }
  }, [isOpen, completedExerciseName]);

  // Guarda el feedback (si el usuario tocó algo) antes de seguir
  const withFeedback = (next: () => void) => () => {
    if (onSubmitFeedback && (stimulus != null || jointPain != null)) {
      onSubmitFeedback(stimulus ?? 0, jointPain ?? 0);
    }
    next();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
          onClick={withFeedback(onClose)}
        >
          {/* Mini confetti for celebration */}
          {isLastExercise && <Confetti />}
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-full max-w-sm bg-card rounded-3xl border border-border p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
            >
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-black text-foreground mb-1"
            >
              ¡Buen trabajo!
            </motion.h2>

            {/* Completed exercise name */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground mb-4"
            >
              Completaste <span className="text-foreground font-semibold">{completedExerciseName}</span>
            </motion.p>

            {/* Progress indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                {totalCompleted}/{totalExercises} ejercicios
              </span>
            </motion.div>

            {/* Next exercise suggestion or finish message */}
            {nextExercise && !isLastExercise ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Siguiente ejercicio
                </p>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="text-lg font-bold text-foreground">{nextExercise.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {nextExercise.sets} series × {nextExercise.reps}
                  </p>
                </div>
              </motion.div>
            ) : isLastExercise ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
              >
                <Sparkles className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-emerald-500">
                  ¡Último ejercicio completado!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ya podés finalizar tu entrenamiento
                </p>
              </motion.div>
            ) : null}

            {/* Feedback rápido del ejercicio (opcional) */}
            {onSubmitFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="mb-6 space-y-3"
              >
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                  ¿Cómo sentiste el ejercicio? <span className="normal-case font-medium">· opcional</span>
                </p>
                <div className="text-left">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-bold text-foreground">Estímulo muscular</span>
                  </div>
                  <MiniScale value={stimulus} onChange={setStimulus} tone="primary" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-foreground">Dolor articular</span>
                  </div>
                  <MiniScale value={jointPain} onChange={setJointPain} tone="amber" />
                </div>
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-3"
            >
              {nextExercise && !isLastExercise ? (
                <Button
                  onClick={withFeedback(onGoToNext)}
                  className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-base glow-primary flex items-center justify-center gap-2"
                >
                  Ir al siguiente
                  <ArrowRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  onClick={withFeedback(onClose)}
                  className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-base glow-primary"
                >
                  Continuar
                </Button>
              )}

              {nextExercise && !isLastExercise && (
                <button
                  onClick={withFeedback(onClose)}
                  className="w-full py-3 text-sm text-muted-foreground font-medium hover:text-foreground transition-colors"
                >
                  Quedarme aquí
                </button>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExerciseCompletedModal;
