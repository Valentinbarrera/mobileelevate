import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import type { Exercise } from "@/pages/WorkoutDetail";

interface ExerciseListItemProps {
  exercise: Exercise;
  index: number;
}

const ExerciseListItem = ({ exercise, index }: ExerciseListItemProps) => {
  return (
    <motion.div
      className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + index * 0.05 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-full bg-secondary/80 border-2 border-border flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
        {exercise.thumbnail || "💪"}
      </div>

      {/* Exercise Info */}
      <div className="flex-1 min-w-0">
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

      {/* Drag Handle */}
      <div className="text-muted-foreground/50">
        <GripVertical className="w-5 h-5" />
      </div>
    </motion.div>
  );
};

export default ExerciseListItem;
