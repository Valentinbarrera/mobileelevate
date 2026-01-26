import { motion } from "framer-motion";
import type { Exercise } from "@/pages/WorkoutDetail";
import ExerciseListItem from "./ExerciseListItem";
import ExerciseCard from "./ExerciseCard";

interface WorkoutExerciseListProps {
  exercises: Exercise[];
  activeExerciseId: string | null;
  workoutStarted: boolean;
  onSelectExercise: (id: string) => void;
  onCompleteSet: (id: string) => void;
}

const WorkoutExerciseList = ({
  exercises,
  activeExerciseId,
  workoutStarted,
  onSelectExercise,
  onCompleteSet,
}: WorkoutExerciseListProps) => {
  return (
    <div className="px-5 pb-32">
      {/* Section Header */}
      <motion.div 
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h2 className="text-xs font-semibold text-primary uppercase tracking-wider">
          Lista de Ejercicios
        </h2>
        <span className="text-xs text-muted-foreground">
          {exercises.length} ejercicios
        </span>
      </motion.div>

      {/* Exercise List */}
      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          workoutStarted ? (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index + 1}
              isActive={activeExerciseId === exercise.id}
              onSelect={() => onSelectExercise(exercise.id)}
              onCompleteSet={() => onCompleteSet(exercise.id)}
              workoutStarted={workoutStarted}
            />
          ) : (
            <ExerciseListItem
              key={exercise.id}
              exercise={exercise}
              index={index + 1}
            />
          )
        ))}
      </div>
    </div>
  );
};

export default WorkoutExerciseList;
