/**
 * Enhanced Set Input Modal with:
 * - Previous performance display
 * - Editable number inputs
 * - Coach notes inside modal
 * - Loading spinner on save
 * - 1RM estimation display
 * - Quick video access
 */
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp, ChevronDown, Trophy, TrendingUp, Flame, MessageSquare, Play, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { estimatedOneRepMax } from "@/lib/strength-calculations";
import type { DifficultyLevel } from "@/types/database";

interface SetInputModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (weight: number, reps: number, difficulty: DifficultyLevel) => Promise<boolean>;
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  targetReps: string;
  coachNotes?: string | null;
  videoUrl?: string | null;
  onShowVideo?: () => void;
  lastPerformance?: {
    weight: number;
    reps: number;
  } | null;
  personalRecord?: {
    maxWeight?: number;
    maxReps?: number;
    max1RM?: number;
  } | null;
  previousSetInSession?: {
    weight: number;
    reps: number;
    difficulty: DifficultyLevel;
  } | null;
}

const difficultyConfig = {
  easy: { label: "Fácil", color: "text-emerald-500", bgActive: "bg-emerald-500/10 border-emerald-500" },
  moderate: { label: "Moderado", color: "text-blue-500", bgActive: "bg-blue-500/10 border-blue-500" },
  hard: { label: "Difícil", color: "text-amber-500", bgActive: "bg-amber-500/10 border-amber-500" },
  max_effort: { label: "Máximo", color: "text-red-500", bgActive: "bg-red-500/10 border-red-500" },
};

const SetInputModalV2 = ({
  isOpen,
  onClose,
  onSubmit,
  exerciseName,
  setNumber,
  totalSets,
  targetReps,
  coachNotes,
  videoUrl,
  onShowVideo,
  lastPerformance,
  personalRecord,
  previousSetInSession,
}: SetInputModalV2Props) => {
  // Priority: previousSetInSession > lastPerformance > defaults
  const defaultWeight = previousSetInSession?.weight || lastPerformance?.weight || 20;
  const defaultReps = previousSetInSession?.reps || lastPerformance?.reps || parseInt(targetReps) || 10;
  const defaultDifficulty = previousSetInSession?.difficulty || "moderate";

  const [weight, setWeight] = useState(defaultWeight);
  const [reps, setReps] = useState(defaultReps);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(defaultDifficulty);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const weightInputRef = useRef<HTMLInputElement>(null);
  const repsInputRef = useRef<HTMLInputElement>(null);

  // Calculate estimated 1RM
  const estimated1RM = useMemo(() => {
    if (weight > 0 && reps > 0) {
      return estimatedOneRepMax(weight, reps);
    }
    return 0;
  }, [weight, reps]);

  // Reset state when modal opens with new values
  useEffect(() => {
    if (isOpen) {
      if (previousSetInSession) {
        setWeight(previousSetInSession.weight);
        setReps(previousSetInSession.reps);
        setDifficulty(previousSetInSession.difficulty);
      } else if (lastPerformance) {
        setWeight(lastPerformance.weight);
        setReps(lastPerformance.reps);
        setDifficulty("moderate");
      }
      setIsLoading(false);
      setIsClosing(false);
    }
  }, [isOpen, previousSetInSession, lastPerformance]);

  const adjustWeight = (delta: number) => {
    setWeight(prev => Math.max(0, Math.round((prev + delta) * 10) / 10));
  };

  const adjustReps = (delta: number) => {
    setReps(prev => Math.max(1, prev + delta));
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setWeight(value);
    } else if (e.target.value === "") {
      setWeight(0);
    }
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setReps(value);
    } else if (e.target.value === "") {
      setReps(1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const success = await onSubmit(weight, reps, difficulty);
      
      if (success) {
        setIsClosing(true);
        // Smooth exit animation
        setTimeout(() => {
          onClose();
        }, 200);
      }
    } finally {
      setIsLoading(false);
    }
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
          animate={{ opacity: isClosing ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-end lg:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: isClosing ? "100%" : 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-card rounded-t-3xl lg:rounded-3xl border-t lg:border border-border p-6 pb-safe lg:pb-6 lg:max-h-[90vh] lg:overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs text-primary font-semibold uppercase tracking-wider">
                  Serie {setNumber} de {totalSets}
                </p>
                <h3 className="text-xl font-bold text-foreground mt-1">{exerciseName}</h3>
              </div>
              <div className="flex items-center gap-2">
                {/* Video button */}
                {videoUrl && onShowVideo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowVideo();
                    }}
                    className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center"
                    disabled={isLoading}
                    title="Ver técnica"
                  >
                    <Play className="w-4 h-4 text-primary ml-0.5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Info pills row: Last Performance + 1RM Estimate */}
            <div className="flex gap-2 mb-4">
              {/* Last Performance Hint */}
              {lastPerformance && (
                <div className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-xs text-blue-500">
                    Anterior: <strong>{lastPerformance.weight}kg × {lastPerformance.reps}</strong>
                  </span>
                </div>
              )}
              
              {/* 1RM Estimate */}
              {estimated1RM > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Target className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span className="text-xs text-purple-500">
                    1RM: <strong>{estimated1RM}kg</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Coach Notes */}
            {coachNotes && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 mb-4">
                <MessageSquare className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-primary mb-0.5">Nota del Profe</p>
                  <p className="text-xs text-foreground/80">{coachNotes}</p>
                </div>
              </div>
            )}

            {/* Potential PR Alert */}
            {isPotentialPR && (
              <motion.div 
                className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-500 font-semibold">
                  ¡Podés batir tu récord personal!
                </span>
              </motion.div>
            )}

            {/* Weight Input */}
            <div className="mb-5">
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-3">
                Peso (kg)
              </label>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => adjustWeight(-2.5)}
                  className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center active:bg-secondary/70 transition-colors"
                  disabled={isLoading}
                >
                  <ChevronDown className="w-5 h-5 text-foreground" />
                </button>
                <div className="relative">
                  <Input
                    ref={weightInputRef}
                    type="number"
                    value={weight}
                    onChange={handleWeightChange}
                    className="w-28 h-16 text-center text-4xl font-black bg-secondary border-none focus:ring-2 focus:ring-primary tabular-nums"
                    step="0.5"
                    min="0"
                    disabled={isLoading}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    kg
                  </span>
                </div>
                <button
                  onClick={() => adjustWeight(2.5)}
                  className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center active:bg-secondary/70 transition-colors"
                  disabled={isLoading}
                >
                  <ChevronUp className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>

            {/* Reps Input */}
            <div className="mb-5">
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-3">
                Repeticiones
              </label>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => adjustReps(-1)}
                  className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center active:bg-secondary/70 transition-colors"
                  disabled={isLoading}
                >
                  <ChevronDown className="w-5 h-5 text-foreground" />
                </button>
                <div className="relative">
                  <Input
                    ref={repsInputRef}
                    type="number"
                    value={reps}
                    onChange={handleRepsChange}
                    className="w-28 h-16 text-center text-4xl font-black bg-secondary border-none focus:ring-2 focus:ring-primary tabular-nums"
                    min="1"
                    disabled={isLoading}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    reps
                  </span>
                </div>
                <button
                  onClick={() => adjustReps(1)}
                  className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center active:bg-secondary/70 transition-colors"
                  disabled={isLoading}
                >
                  <ChevronUp className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="mb-6">
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-3">
                ¿Cómo se sintió?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {difficulties.map((level) => {
                  const config = difficultyConfig[level];
                  const isSelected = difficulty === level;
                  
                  return (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      disabled={isLoading}
                      className={`py-3 px-2 rounded-xl border-2 transition-all ${
                        isSelected
                          ? config.bgActive
                          : "bg-secondary border-transparent text-muted-foreground"
                      }`}
                    >
                      <Flame className={`w-5 h-5 mx-auto mb-1 ${
                        isSelected ? config.color : "opacity-50"
                      }`} />
                      <span className={`text-[10px] font-semibold block ${
                        isSelected ? config.color : ""
                      }`}>
                        {config.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-base glow-primary relative"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" className="border-primary-foreground/30 border-t-primary-foreground" />
                  <span>Guardando...</span>
                </div>
              ) : (
                "✓ GUARDAR SERIE"
              )}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SetInputModalV2;
