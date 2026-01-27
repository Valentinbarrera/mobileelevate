import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, MessageSquare, Clock, Trophy, TrendingUp, Play } from "lucide-react";
import type { ExerciseWithTracking, DifficultyLevel, ExerciseSet } from "@/types/database";
import { difficultyColors } from "@/types/database";
import SetInputModal from "./SetInputModal";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer";
interface ExerciseTrackingCardProps {
  exercise: ExerciseWithTracking;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onCompleteSet: (
    workoutExerciseId: string,
    exerciseId: string,
    setNumber: number,
    weight: number,
    reps: number,
    difficulty: DifficultyLevel
  ) => Promise<ExerciseSet | null>;
  workoutStarted: boolean;
}

const ExerciseTrackingCard = ({
  exercise,
  index,
  isActive,
  onSelect,
  onCompleteSet,
  workoutStarted,
}: ExerciseTrackingCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSetInput, setShowSetInput] = useState(false);
  const [completedSetsLocal, setCompletedSetsLocal] = useState<ExerciseSet[]>(exercise.completedSets || []);

  useEffect(() => {
    if (isActive && workoutStarted) {
      setIsExpanded(true);
    }
  }, [isActive, workoutStarted]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      onSelect();
    }
  };

  const handleCompleteSetClick = () => {
    setShowSetInput(true);
  };

  const handleSetSubmit = async (weight: number, reps: number, difficulty: DifficultyLevel) => {
    const result = await onCompleteSet(
      exercise.id,
      exercise.exercise_id,
      completedSetsLocal.length + 1,
      weight,
      reps,
      difficulty
    );

    if (result) {
      setCompletedSetsLocal(prev => [...prev, result]);
    }
  };

  const currentSet = completedSetsLocal.length;
  const isCompleted = currentSet >= exercise.sets;
  const setsArray = Array.from({ length: exercise.sets }, (_, i) => i);
  const [showVideo, setShowVideo] = useState(false);
  const hasVideo = !!exercise.exercise?.video_url;

  return (
    <>
      <motion.div
        layout
        className={`rounded-2xl overflow-hidden transition-all duration-300 ${
          isCompleted
            ? "bg-emerald-500/10 border-2 border-emerald-500/40"
            : isActive
              ? "bg-card border-2 border-primary shadow-lg shadow-primary/20"
              : "bg-card border border-border"
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        {/* Header */}
        <button
          onClick={handleToggle}
          className="w-full p-4 flex items-center gap-4"
        >
          {/* Thumbnail/Status with Video Indicator */}
          <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl overflow-hidden ${
            isCompleted
              ? "bg-emerald-500/20 border-2 border-emerald-500"
              : isActive
                ? "bg-primary/20 border-2 border-primary"
                : "bg-secondary border-2 border-border"
          }`}>
            {isCompleted ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            ) : (
              <>
                {exercise.exercise?.thumbnail || "💪"}
                {hasVideo && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white" fill="white" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Exercise Info */}
          <div className="flex-1 text-left min-w-0">
            <h3 className={`font-bold text-base truncate ${
              isCompleted ? "text-emerald-500" : "text-foreground"
            }`}>
              {exercise.exercise?.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-sm text-muted-foreground">
                {exercise.sets} series × {exercise.target_reps}
              </span>
              {exercise.target_weight && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {exercise.target_weight}kg
                </span>
              )}
            </div>
          </div>

          {/* Progress Badge */}
          {workoutStarted && !isCompleted && (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30">
                <span className="text-sm font-bold text-primary tabular-nums">
                  {currentSet}/{exercise.sets}
                </span>
              </div>
            </div>
          )}

          {/* Expand Arrow */}
          <motion.div
            className="text-muted-foreground"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4">
                {/* Video Player Toggle */}
                {hasVideo && (
                  <div className="space-y-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowVideo(!showVideo); }}
                      className="flex items-center gap-2 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      {showVideo ? "Ocultar video" : "Ver video demostrativo"}
                    </button>
                    <AnimatePresence>
                      {showVideo && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <ExerciseVideoPlayer
                            videoUrl={exercise.exercise?.video_url || ""}
                            exerciseName={exercise.exercise?.name || "Ejercicio"}
                            compact
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Last Performance */}
                {exercise.lastPerformance && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-500">
                      Última vez: {exercise.lastPerformance.weight}kg × {exercise.lastPerformance.reps}
                    </span>
                  </div>
                )}

                {/* Personal Record */}
                {exercise.personalRecord?.maxWeight && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="text-sm text-primary">
                      PR: {exercise.personalRecord.maxWeight}kg
                    </span>
                  </div>
                )}

                {/* Sets Progress Visual */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Progreso de Series
                    </span>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs">{exercise.rest_seconds}s descanso</span>
                    </div>
                  </div>

                  {/* Set Pills with details */}
                  <div className="space-y-2">
                    {setsArray.map((setIndex) => {
                      const completedSet = completedSetsLocal[setIndex];
                      const isCurrentSet = setIndex === currentSet && isActive;

                      return (
                        <div
                          key={setIndex}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                            completedSet
                              ? "bg-emerald-500/10 border border-emerald-500/30"
                              : isCurrentSet
                                ? "bg-primary/10 border border-primary/30"
                                : "bg-secondary/50 border border-border"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            completedSet
                              ? "bg-emerald-500 text-white"
                              : isCurrentSet
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                          }`}>
                            {completedSet ? "✓" : setIndex + 1}
                          </div>

                          {completedSet ? (
                            <div className="flex-1 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-foreground">
                                  {completedSet.weight}kg × {completedSet.reps}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[completedSet.difficulty]}`}>
                                  {completedSet.difficulty === 'easy' ? '😊' : 
                                   completedSet.difficulty === 'moderate' ? '💪' :
                                   completedSet.difficulty === 'hard' ? '🔥' : '💀'}
                                </span>
                              </div>
                              {completedSet.is_pr && (
                                <Trophy className="w-4 h-4 text-primary" />
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {exercise.target_reps} reps
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Coach Notes */}
                {exercise.notes && (
                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-primary mb-1">Nota del Profe</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {exercise.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {workoutStarted && !isCompleted && isActive && (
                  <motion.button
                    onClick={handleCompleteSetClick}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-primary text-primary-foreground rounded-2xl py-4 font-bold shadow-lg glow-primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    REGISTRAR SERIE {currentSet + 1}
                  </motion.button>
                )}

                {/* Completed State */}
                {isCompleted && (
                  <motion.div
                    className="flex items-center justify-center gap-3 py-4 text-emerald-500"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="font-bold text-lg">¡Ejercicio completado!</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Set Input Modal */}
      <SetInputModal
        isOpen={showSetInput}
        onClose={() => setShowSetInput(false)}
        onSubmit={handleSetSubmit}
        exerciseName={exercise.exercise?.name || "Ejercicio"}
        setNumber={currentSet + 1}
        totalSets={exercise.sets}
        targetReps={exercise.target_reps}
        targetWeight={exercise.target_weight}
        lastPerformance={exercise.lastPerformance}
        personalRecord={exercise.personalRecord}
        previousSetInSession={
          completedSetsLocal.length > 0
            ? {
                weight: completedSetsLocal[completedSetsLocal.length - 1].weight,
                reps: completedSetsLocal[completedSetsLocal.length - 1].reps,
                difficulty: completedSetsLocal[completedSetsLocal.length - 1].difficulty,
              }
            : null
        }
      />
    </>
  );
};

export default ExerciseTrackingCard;
