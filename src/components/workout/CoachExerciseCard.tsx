/**
 * Exercise tracking card for active workout
 * Allows logging sets with weight, reps and difficulty
 * Uses enhanced modal with history, coach notes and offline support
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Play, ChevronDown, ChevronUp, Dumbbell, Trophy } from "lucide-react";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer";
import SetInputModalV2 from "./SetInputModalV2";
import type { DifficultyLevel } from "@/types/database";

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
  ) => Promise<boolean>;
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

  const lastPerformance = null;
  const personalRecord = null;

  const currentSetNumber = state.currentSet + 1;
  const isCompleted = state.completed;

  // Get previous set from current session for auto-fill
  const previousSetInSession = state.completedSets.length > 0 
    ? {
        weight: state.completedSets[state.completedSets.length - 1].weight,
        reps: state.completedSets[state.completedSets.length - 1].reps,
        difficulty: state.completedSets[state.completedSets.length - 1].difficulty as DifficultyLevel,
      }
    : null;

  const handleLogSet = () => {
    if (!isCompleted) {
      setShowSetInput(true);
    }
  };

  const handleConfirmSet = async (weight: number, reps: number, difficulty: DifficultyLevel): Promise<boolean> => {
    const success = await onCompleteSet(exercise.id, currentSetNumber, weight, reps, difficulty);
    return success;
  };

  return (
    <>
      <motion.div
        className={`relative bg-card border rounded-2xl overflow-hidden transition-all ${
          isActive 
            ? "border-primary shadow-lg shadow-primary/10" 
            : isCompleted 
              ? "border-emerald-500/40 bg-emerald-500/5" 
              : "border-border"
        } ${isCompleted ? "opacity-70" : ""}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => {
          if (!isActive) onSelect();
          setExpanded(!expanded);
        }}
      >
        {/* Completed overlay badge */}
        {isCompleted && (
          <motion.div 
            className="absolute top-3 right-3 z-10"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
          </motion.div>
        )}

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
              <span className={`text-xs ${isCompleted ? "text-emerald-500/70" : "text-muted-foreground"}`}>
                {state.currentSet}/{exercise.sets} series • {exercise.reps} reps
              </span>
              {isCompleted && (
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                  ✓ Listo
                </span>
              )}
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

      {/* Enhanced Set Input Modal */}
      <SetInputModalV2
        isOpen={showSetInput}
        onClose={() => setShowSetInput(false)}
        onSubmit={handleConfirmSet}
        exerciseName={exercise.name}
        setNumber={currentSetNumber}
        totalSets={exercise.sets}
        targetReps={exercise.reps}
        coachNotes={exercise.notes}
        videoUrl={exercise.videoUrl}
        onShowVideo={() => {
          setShowSetInput(false);
          setShowVideo(true);
        }}
        lastPerformance={lastPerformance}
        personalRecord={personalRecord}
        previousSetInSession={previousSetInSession}
      />
    </>
  );
};

export default CoachExerciseCard;
