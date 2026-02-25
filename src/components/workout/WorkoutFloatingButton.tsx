import React from "react";
import { motion } from "framer-motion";
import { Play, CheckCircle2 } from "lucide-react";

interface WorkoutFloatingButtonProps {
  workoutStarted: boolean;
  isCompleted: boolean;
  onStart: () => void;
  onFinish: () => void;
}

const WorkoutFloatingButton = React.forwardRef<HTMLDivElement, WorkoutFloatingButtonProps>(({
  workoutStarted,
  isCompleted,
  onStart,
  onFinish,
}, _ref) => {
  // Don't show when workout is in progress (not completed)
  if (workoutStarted && !isCompleted) return null;

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 p-5 z-40"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Background blur effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none" />
      
      {isCompleted ? (
        <motion.button
          onClick={onFinish}
          className="relative w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl py-5 min-h-[64px] shadow-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CheckCircle2 className="w-6 h-6 text-white" />
          <span className="text-white font-bold text-lg tracking-wide">
            ¡ENTRENAMIENTO COMPLETADO!
          </span>
        </motion.button>
      ) : (
        <motion.button
          onClick={onStart}
          className="relative w-full flex items-center justify-center gap-4 bg-gradient-primary rounded-2xl py-5 min-h-[64px] shadow-xl glow-primary overflow-hidden"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Animated shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          />
          
          <div className="relative flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Play className="w-6 h-6 text-primary-foreground fill-current ml-0.5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-primary-foreground font-bold text-lg tracking-wide">
                EMPEZAR
              </span>
              <span className="text-primary-foreground/80 text-xs font-medium">
                ENTRENAMIENTO
              </span>
            </div>
          </div>
        </motion.button>
      )}
    </motion.div>
  );
});

WorkoutFloatingButton.displayName = "WorkoutFloatingButton";

export default WorkoutFloatingButton;
