import { motion } from "framer-motion";
import { Pause, Play, Clock, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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
  const navigate = useNavigate();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const exerciseProgress = (completedExercises / totalExercises) * 100;

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    navigate("/");
  };

  return (
    <>
      <motion.header 
        className="sticky top-0 z-50 bg-background/98 backdrop-blur-xl border-b border-border"
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

        <div className="px-5 py-3">
          <div className="flex items-center justify-between">
            {/* Exit Button + Timer */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={handleExit}
                className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-destructive/20 transition-colors touch-target"
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
              
              <div>
                <span className="text-2xl font-black text-foreground tabular-nums tracking-tight">
                  {elapsedTime}
                </span>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tiempo activo</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3">
              {/* Sets Counter */}
              <div className="text-center">
                <div className="flex items-center gap-0.5">
                  <span className="text-base font-bold text-foreground tabular-nums">{completedSets}</span>
                  <span className="text-xs text-muted-foreground">/{totalSets}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Series</p>
              </div>

              {/* Exercises Counter */}
              <div className="text-center">
                <div className="flex items-center gap-0.5">
                  <span className="text-base font-bold text-primary tabular-nums">{completedExercises}</span>
                  <span className="text-xs text-muted-foreground">/{totalExercises}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Ejercicios</p>
              </div>

              {/* Pause Button */}
              <motion.button
                onClick={onPauseToggle}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors touch-target ${
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

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 text-center"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <X className="w-7 h-7 text-destructive" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">¿Salir del entrenamiento?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Tu progreso no se guardará si salís ahora.
            </p>
            
            <div className="flex gap-3">
              <motion.button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-semibold"
                whileTap={{ scale: 0.98 }}
              >
                Continuar
              </motion.button>
              <motion.button
                onClick={confirmExit}
                className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-semibold"
                whileTap={{ scale: 0.98 }}
              >
                Salir
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default ActiveWorkoutHeader;
