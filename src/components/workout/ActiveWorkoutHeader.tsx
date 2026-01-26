import { motion } from "framer-motion";
import { Pause, Play, Clock, Dumbbell } from "lucide-react";

interface ActiveWorkoutHeaderProps {
  elapsedTime: string;
  isPaused: boolean;
  onPauseToggle: () => void;
  completedExercises: number;
  totalExercises: number;
  completedSets: number;
  totalSets: number;
}

const ActiveWorkoutHeader = ({
  elapsedTime,
  isPaused,
  onPauseToggle,
  completedExercises,
  totalExercises,
  completedSets,
  totalSets,
}: ActiveWorkoutHeaderProps) => {
  const exerciseProgress = (completedExercises / totalExercises) * 100;

  return (
    <motion.header 
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
    >
      {/* Progress Bar */}
      <div className="h-1 bg-secondary">
        <motion.div 
          className="h-full bg-gradient-primary"
          initial={{ width: 0 }}
          animate={{ width: `${exerciseProgress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          {/* Timer */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isPaused ? "bg-primary" : "bg-secondary"
            }`}>
              <Clock className={`w-5 h-5 ${isPaused ? "text-primary-foreground" : "text-primary"}`} />
            </div>
            <div>
              <span className="text-2xl font-black text-foreground tabular-nums tracking-tight">
                {elapsedTime}
              </span>
              <p className="text-xs text-muted-foreground">Tiempo activo</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            {/* Sets Counter */}
            <div className="text-center">
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-foreground">{completedSets}</span>
                <span className="text-sm text-muted-foreground">/{totalSets}</span>
              </div>
              <p className="text-xs text-muted-foreground">Series</p>
            </div>

            {/* Exercises Counter */}
            <div className="text-center">
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-primary">{completedExercises}</span>
                <span className="text-sm text-muted-foreground">/{totalExercises}</span>
              </div>
              <p className="text-xs text-muted-foreground">Ejercicios</p>
            </div>

            {/* Pause Button */}
            <motion.button
              onClick={onPauseToggle}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                isPaused 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {isPaused ? (
                <Play className="w-5 h-5 ml-0.5" />
              ) : (
                <Pause className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default ActiveWorkoutHeader;
