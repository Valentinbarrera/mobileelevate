import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp, ChevronDown, Trophy, TrendingUp, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DifficultyLevel } from "@/types/database";
import { difficultyLabels, difficultyColors } from "@/types/database";

interface SetInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (weight: number, reps: number, difficulty: DifficultyLevel) => void;
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  targetReps: string;
  targetWeight?: number | null;
  lastPerformance?: {
    weight: number;
    reps: number;
  } | null;
  personalRecord?: {
    maxWeight?: number;
    maxReps?: number;
  } | null;
  previousSetInSession?: {
    weight: number;
    reps: number;
    difficulty: DifficultyLevel;
  } | null;
}

const SetInputModal = ({
  isOpen,
  onClose,
  onSubmit,
  exerciseName,
  setNumber,
  totalSets,
  targetReps,
  targetWeight,
  lastPerformance,
  personalRecord,
  previousSetInSession,
}: SetInputModalProps) => {
  // Priority: previousSetInSession > lastPerformance > targetWeight
  const defaultWeight = previousSetInSession?.weight || lastPerformance?.weight || targetWeight || 20;
  const defaultReps = previousSetInSession?.reps || lastPerformance?.reps || parseInt(targetReps) || 10;
  const defaultDifficulty = previousSetInSession?.difficulty || "moderate";

  const [weight, setWeight] = useState(defaultWeight);
  const [reps, setReps] = useState(defaultReps);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(defaultDifficulty);

  useEffect(() => {
    // Update when modal opens with new values
    if (previousSetInSession) {
      setWeight(previousSetInSession.weight);
      setReps(previousSetInSession.reps);
      setDifficulty(previousSetInSession.difficulty);
    } else if (lastPerformance) {
      setWeight(lastPerformance.weight);
      setReps(lastPerformance.reps);
    } else if (targetWeight) {
      setWeight(targetWeight);
    }
  }, [previousSetInSession, lastPerformance, targetWeight]);

  const adjustWeight = (delta: number) => {
    setWeight(prev => Math.max(0, prev + delta));
  };

  const adjustReps = (delta: number) => {
    setReps(prev => Math.max(1, prev + delta));
  };

  const handleSubmit = () => {
    onSubmit(weight, reps, difficulty);
    onClose();
  };

  const isPotentialPR = personalRecord && (
    weight > (personalRecord.maxWeight || 0) ||
    reps > (personalRecord.maxReps || 0)
  );

  const difficulties: DifficultyLevel[] = ["easy", "moderate", "hard", "max_effort"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-card rounded-t-3xl border-t border-border p-6 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-primary font-semibold uppercase tracking-wider">
                  Serie {setNumber} de {totalSets}
                </p>
                <h3 className="text-xl font-bold text-foreground mt-1">{exerciseName}</h3>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Last Performance Hint */}
            {lastPerformance && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-500">
                  Última vez: {lastPerformance.weight}kg × {lastPerformance.reps} reps
                </span>
              </div>
            )}

            {/* Potential PR Alert */}
            {isPotentialPR && (
              <motion.div 
                className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 mb-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-semibold">
                  ¡Podés batir tu récord personal!
                </span>
              </motion.div>
            )}

            {/* Weight Input */}
            <div className="mb-6">
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-3">
                Peso (kg)
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => adjustWeight(-2.5)}
                  className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center active:bg-secondary/70"
                >
                  <ChevronDown className="w-6 h-6 text-foreground" />
                </button>
                <div className="w-32 text-center">
                  <span className="text-5xl font-black text-foreground tabular-nums">
                    {weight}
                  </span>
                  <span className="text-lg text-muted-foreground ml-1">kg</span>
                </div>
                <button
                  onClick={() => adjustWeight(2.5)}
                  className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center active:bg-secondary/70"
                >
                  <ChevronUp className="w-6 h-6 text-foreground" />
                </button>
              </div>
            </div>

            {/* Reps Input */}
            <div className="mb-6">
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-3">
                Repeticiones
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => adjustReps(-1)}
                  className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center active:bg-secondary/70"
                >
                  <ChevronDown className="w-6 h-6 text-foreground" />
                </button>
                <div className="w-32 text-center">
                  <span className="text-5xl font-black text-foreground tabular-nums">
                    {reps}
                  </span>
                  <span className="text-lg text-muted-foreground ml-1">reps</span>
                </div>
                <button
                  onClick={() => adjustReps(1)}
                  className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center active:bg-secondary/70"
                >
                  <ChevronUp className="w-6 h-6 text-foreground" />
                </button>
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="mb-8">
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-3">
                ¿Cómo se sintió?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {difficulties.map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`py-3 px-2 rounded-xl border-2 transition-all ${
                      difficulty === level
                        ? `${difficultyColors[level]} border-current`
                        : "bg-secondary border-transparent text-muted-foreground"
                    }`}
                  >
                    <Flame className={`w-5 h-5 mx-auto mb-1 ${
                      difficulty === level ? "" : "opacity-50"
                    }`} />
                    <span className="text-[10px] font-semibold block">
                      {difficultyLabels[level]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-base glow-primary"
            >
              ✓ GUARDAR SERIE
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SetInputModal;
