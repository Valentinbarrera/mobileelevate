import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, MessageSquare, Clock } from "lucide-react";
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

  // Auto-expand when active
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

  const setsArray = Array.from({ length: exercise.sets }, (_, i) => i);

  return (
    <motion.div
      layout
      className={`rounded-2xl overflow-hidden transition-all duration-300 ${
        exercise.completed 
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
        {/* Thumbnail/Status */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
          exercise.completed 
            ? "bg-emerald-500/20 border-2 border-emerald-500" 
            : isActive 
              ? "bg-primary/20 border-2 border-primary" 
              : "bg-secondary border-2 border-border"
        }`}>
          {exercise.completed ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          ) : (
            exercise.thumbnail || "💪"
          )}
        </div>

        {/* Exercise Info */}
        <div className="flex-1 text-left min-w-0">
          <h3 className={`font-bold text-base truncate ${
            exercise.completed ? "text-emerald-500" : "text-foreground"
          }`}>
            {exercise.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm text-muted-foreground">
              {exercise.sets} series × {exercise.reps}
            </span>
            {exercise.weight && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {exercise.weight}
              </span>
            )}
          </div>
        </div>

        {/* Progress Badge */}
        {workoutStarted && !exercise.completed && (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30">
              <span className="text-sm font-bold text-primary tabular-nums">
                {exercise.currentSet}/{exercise.sets}
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
              {/* Sets Progress Visual */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Progreso de Series
                  </span>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">{exercise.restSeconds}s descanso</span>
                  </div>
                </div>
                
                {/* Set Pills */}
                <div className="flex gap-2">
                  {setsArray.map((setIndex) => (
                    <motion.div
                      key={setIndex}
                      className={`flex-1 h-3 rounded-full transition-all relative overflow-hidden ${
                        setIndex < exercise.currentSet
                          ? "bg-emerald-500"
                          : setIndex === exercise.currentSet && isActive
                            ? "bg-primary/30"
                            : "bg-secondary"
                      }`}
                    >
                      {setIndex === exercise.currentSet && isActive && (
                        <motion.div
                          className="absolute inset-0 bg-primary"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </motion.div>
                  ))}
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
              {workoutStarted && !exercise.completed && isActive && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompleteSet();
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-primary text-primary-foreground rounded-2xl py-4 font-bold shadow-lg glow-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  COMPLETAR SERIE {exercise.currentSet + 1}
                </motion.button>
              )}

              {/* Completed State */}
              {exercise.completed && (
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
  );
};

export default ExerciseCard;
