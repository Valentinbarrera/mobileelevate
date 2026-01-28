/**
 * Exercise tracking card for active workout
 * Allows logging sets with weight, reps and difficulty
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Play, ChevronDown, ChevronUp, Dumbbell, Trophy, X, Flame, TrendingUp } from "lucide-react";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer";
import { Button } from "@/components/ui/button";

interface CoachExercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number | null;
  notes: string | null;
  videoUrl: string | null;
  thumbnail: string | null;
  muscleGroup: string | null;
  equipment: string | null;
}

interface CompletedSet {
  setNumber: number;
  weight: number;
  reps: number;
  difficulty: string;
  completedAt: Date;
}

interface ExerciseState {
  id: string;
  completed: boolean;
  currentSet: number;
  completedSets: CompletedSet[];
}

interface CoachExerciseCardProps {
  exercise: CoachExercise;
  state: ExerciseState;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onCompleteSet: (
    exerciseId: string,
    setNumber: number,
    weight: number,
    reps: number,
    difficulty: string
  ) => void;
}

const CoachExerciseCard = ({
  exercise,
  state,
  index,
  isActive,
  onSelect,
  onCompleteSet,
}: CoachExerciseCardProps) => {
  const [showVideo, setShowVideo] = useState(false);
  const [showSetInput, setShowSetInput] = useState(false);
  const [expanded, setExpanded] = useState(isActive);

  const currentSetNumber = state.currentSet + 1;
  const isCompleted = state.completed;

  // Get last set's weight as suggestion
  const lastWeight = state.completedSets.length > 0 
    ? state.completedSets[state.completedSets.length - 1].weight 
    : 0;

  // Parse target reps
  const targetReps = parseInt(exercise.reps.split('-')[0]) || 10;

  const handleLogSet = () => {
    if (!isCompleted) {
      setShowSetInput(true);
    }
  };

  const handleConfirmSet = (weight: number, reps: number, difficulty: string) => {
    onCompleteSet(exercise.id, currentSetNumber, weight, reps, difficulty);
    setShowSetInput(false);
  };

  return (
    <>
      <motion.div
        className={`bg-card border rounded-2xl overflow-hidden transition-all ${
          isActive 
            ? "border-primary shadow-lg shadow-primary/10" 
            : isCompleted 
              ? "border-emerald-500/30 bg-emerald-500/5" 
              : "border-border"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => {
          if (!isActive) onSelect();
          setExpanded(!expanded);
        }}
      >
        {/* Header */}
        <div className="p-4 flex items-center gap-4">
          {/* Status indicator */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isCompleted 
              ? "bg-emerald-500" 
              : isActive 
                ? "bg-primary" 
                : "bg-secondary"
          }`}>
            {isCompleted ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <span className={`text-sm font-bold ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}>
                {index + 1}
              </span>
            )}
          </div>

          {/* Exercise info */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm truncate ${
              isCompleted ? "text-emerald-500" : "text-foreground"
            }`}>
              {exercise.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {state.currentSet}/{exercise.sets} series • {exercise.reps} reps
              </span>
            </div>
          </div>

          {/* Expand toggle */}
          <button 
            className="p-2"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                {/* Video preview */}
                {exercise.videoUrl && (
                  <div 
                    className="relative h-40 rounded-xl overflow-hidden bg-secondary cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowVideo(true);
                    }}
                  >
                    {exercise.thumbnail ? (
                      <img 
                        src={exercise.thumbnail} 
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Dumbbell className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary fill-current ml-1" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Coach notes */}
                {exercise.notes && (
                  <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl">
                    <p className="text-xs text-foreground">
                      <span className="font-medium">💡 Nota:</span> {exercise.notes}
                    </p>
                  </div>
                )}

                {/* Completed sets */}
                {state.completedSets.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Series completadas
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {state.completedSets.map((set, i) => (
                        <div 
                          key={i}
                          className="bg-secondary rounded-lg p-2 text-center"
                        >
                          <p className="text-xs text-muted-foreground">Serie {set.setNumber}</p>
                          <p className="text-sm font-bold text-foreground">
                            {set.weight}kg × {set.reps}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Log set button */}
                {!isCompleted && (
                  <motion.button
                    className="w-full py-3 bg-primary rounded-xl text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogSet();
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trophy className="w-4 h-4" />
                    Registrar Serie {currentSetNumber}
                  </motion.button>
                )}

                {isCompleted && (
                  <div className="py-3 bg-emerald-500/10 rounded-xl text-emerald-500 font-semibold text-sm text-center flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    Ejercicio Completado
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Video Player Modal */}
      {showVideo && exercise.videoUrl && (
        <ExerciseVideoPlayer
          videoUrl={exercise.videoUrl}
          exerciseName={exercise.name}
          onClose={() => setShowVideo(false)}
        />
      )}

      {/* Inline Set Input Modal */}
      <AnimatePresence>
        {showSetInput && (
          <CoachSetInputModal
            exerciseName={exercise.name}
            setNumber={currentSetNumber}
            totalSets={exercise.sets}
            targetReps={exercise.reps}
            suggestedWeight={lastWeight}
            onConfirm={handleConfirmSet}
            onClose={() => setShowSetInput(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// Inline modal component for set input
interface CoachSetInputModalProps {
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  targetReps: string;
  suggestedWeight: number;
  onConfirm: (weight: number, reps: number, difficulty: string) => void;
  onClose: () => void;
}

const CoachSetInputModal = ({
  exerciseName,
  setNumber,
  totalSets,
  targetReps,
  suggestedWeight,
  onConfirm,
  onClose,
}: CoachSetInputModalProps) => {
  const defaultReps = parseInt(targetReps.split('-')[0]) || 10;
  const [weight, setWeight] = useState(suggestedWeight || 20);
  const [reps, setReps] = useState(defaultReps);
  const [difficulty, setDifficulty] = useState<"easy" | "moderate" | "hard" | "max_effort">("moderate");

  const adjustWeight = (delta: number) => setWeight(prev => Math.max(0, prev + delta));
  const adjustReps = (delta: number) => setReps(prev => Math.max(1, prev + delta));

  const handleSubmit = () => {
    onConfirm(weight, reps, difficulty);
  };

  const difficulties = [
    { key: "easy" as const, label: "Fácil", color: "text-emerald-500" },
    { key: "moderate" as const, label: "Moderado", color: "text-blue-500" },
    { key: "hard" as const, label: "Difícil", color: "text-amber-500" },
    { key: "max_effort" as const, label: "Máximo", color: "text-red-500" },
  ];

  return (
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
                key={level.key}
                onClick={() => setDifficulty(level.key)}
                className={`py-3 px-2 rounded-xl border-2 transition-all ${
                  difficulty === level.key
                    ? `${level.color} border-current bg-current/10`
                    : "bg-secondary border-transparent text-muted-foreground"
                }`}
              >
                <Flame className={`w-5 h-5 mx-auto mb-1 ${
                  difficulty === level.key ? "" : "opacity-50"
                }`} />
                <span className="text-[10px] font-semibold block">
                  {level.label}
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
  );
};

export default CoachExerciseCard;
