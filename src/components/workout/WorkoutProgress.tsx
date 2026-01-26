import { motion } from "framer-motion";
import { Target, Dumbbell } from "lucide-react";

interface WorkoutProgressProps {
  completedExercises: number;
  totalExercises: number;
  completedSets: number;
  totalSets: number;
}

const WorkoutProgress = ({ 
  completedExercises, 
  totalExercises, 
  completedSets, 
  totalSets 
}: WorkoutProgressProps) => {
  const exerciseProgress = (completedExercises / totalExercises) * 100;
  const setsProgress = (completedSets / totalSets) * 100;

  return (
    <motion.div 
      className="px-5 py-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="bg-card rounded-2xl p-4 border border-border">
        <div className="grid grid-cols-2 gap-4">
          {/* Exercises Progress */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Ejercicios
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">{completedExercises}</span>
              <span className="text-muted-foreground">/ {totalExercises}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${exerciseProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Sets Progress */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Series
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">{completedSets}</span>
              <span className="text-muted-foreground">/ {totalSets}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${setsProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WorkoutProgress;
