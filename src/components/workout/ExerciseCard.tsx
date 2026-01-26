import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Play, MessageSquare, Video } from "lucide-react";
import type { Exercise } from "@/pages/WorkoutDetail";

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onCompleteSet: () => void;
  workoutStarted: boolean;
}

const ExerciseCard = ({ 
  exercise, 
  index, 
  isActive, 
  onSelect, 
  onCompleteSet,
  workoutStarted 
}: ExerciseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      onSelect();
    }
  };

  const setsArray = Array.from({ length: exercise.sets }, (_, i) => i);

  return (
    <motion.div
      layout
      className={`rounded-2xl overflow-hidden transition-all duration-300 ${
        exercise.completed 
          ? "bg-primary/10 border border-primary/30" 
          : isActive 
            ? "bg-card border-2 border-primary shadow-lg" 
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
        {/* Index/Status */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
          exercise.completed 
            ? "bg-primary text-primary-foreground" 
            : isActive 
              ? "bg-primary/20 text-primary border-2 border-primary" 
              : "bg-secondary text-muted-foreground"
        }`}>
          {exercise.completed ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            index
          )}
        </div>

        {/* Exercise Info */}
        <div className="flex-1 text-left">
          <h3 className={`font-semibold text-base ${
            exercise.completed ? "text-primary" : "text-foreground"
          }`}>
            {exercise.name}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-muted-foreground">
              {exercise.sets} series × {exercise.reps}
            </span>
            {exercise.weight && (
              <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                {exercise.weight}
              </span>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        {workoutStarted && !exercise.completed && (
          <div className="flex items-center gap-1 mr-2">
            <span className="text-sm font-medium text-primary">
              {exercise.currentSet}/{exercise.sets}
            </span>
          </div>
        )}

        {/* Expand Arrow */}
        <div className="text-muted-foreground">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
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
              {/* Sets Progress */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Series
                </span>
                <div className="flex gap-2">
                  {setsArray.map((setIndex) => (
                    <div
                      key={setIndex}
                      className={`flex-1 h-2 rounded-full transition-all ${
                        setIndex < exercise.currentSet
                          ? "bg-primary"
                          : setIndex === exercise.currentSet && isActive
                            ? "bg-primary/40"
                            : "bg-secondary"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Rest Time */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Descanso entre series</span>
                <span className="font-medium text-foreground">{exercise.restSeconds}s</span>
              </div>

              {/* Coach Notes */}
              {exercise.notes && (
                <div className="bg-secondary/50 rounded-xl p-3 border border-border">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {exercise.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {workoutStarted && !exercise.completed && isActive && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompleteSet();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  COMPLETAR SERIE {exercise.currentSet + 1}
                </motion.button>
              )}

              {/* Completed State */}
              {exercise.completed && (
                <div className="flex items-center justify-center gap-2 py-3 text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">¡Ejercicio completado!</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ExerciseCard;
