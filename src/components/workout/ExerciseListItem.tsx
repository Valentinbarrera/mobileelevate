import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, Play, ChevronDown, MessageSquare } from "lucide-react";
import type { Exercise } from "@/pages/WorkoutDetail";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer";

interface ExerciseListItemProps {
  exercise: Exercise;
  index: number;
}

const ExerciseListItem = ({ exercise, index }: ExerciseListItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasVideo = !!exercise.videoUrl;

  return (
    <motion.div
      className="rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + index * 0.05 }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-4 p-4"
      >
        {/* Thumbnail with Video Indicator */}
        <div className="relative w-14 h-14 rounded-full bg-secondary/80 border-2 border-border flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
          {exercise.thumbnail || "💪"}
          {hasVideo && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Play className="w-5 h-5 text-white" fill="white" />
            </div>
          )}
        </div>

        {/* Exercise Info */}
        <div className="flex-1 min-w-0 text-left">
          <h3 className="font-semibold text-foreground text-base truncate">
            {exercise.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {exercise.sets} series × {exercise.reps}
          </p>
        </div>

        {/* Weight Badge */}
        {exercise.weight && (
          <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-xs font-semibold text-primary">{exercise.weight}</span>
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
              {/* Video Player */}
              {hasVideo && (
                <ExerciseVideoPlayer
                  videoUrl={exercise.videoUrl!}
                  exerciseName={exercise.name}
                  compact
                />
              )}

              {/* Coach Notes */}
              {exercise.notes && (
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-primary mb-1">Nota del Coach</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {exercise.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rest Time Info */}
              <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
                <span>Descanso recomendado</span>
                <span className="font-medium text-foreground">{exercise.restSeconds}s</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ExerciseListItem;
