/**
 * Exercise list item for preview mode (before workout starts)
 * Shows exercise info from Coach database
 */
import { motion } from "framer-motion";
import { Play, Dumbbell } from "lucide-react";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer";
import { useState } from "react";

interface CoachExercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number | null;
  notes: string | null;
  videoUrl: string | null;
  thumbnail: string | null;
  muscleGroup: string | null;
  equipment: string | null;
}

interface CoachExerciseListItemProps {
  exercise: CoachExercise;
  index: number;
}

const CoachExerciseListItem = ({ exercise, index }: CoachExerciseListItemProps) => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <motion.div
        className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Index */}
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-primary">{index}</span>
        </div>

        {/* Thumbnail or icon */}
        <div 
          className="w-14 h-14 rounded-xl bg-secondary overflow-hidden flex-shrink-0 cursor-pointer relative"
          onClick={() => exercise.videoUrl && setShowVideo(true)}
        >
          {exercise.thumbnail ? (
            <img 
              src={exercise.thumbnail} 
              alt={exercise.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          
          {exercise.videoUrl && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-3 h-3 text-primary fill-current ml-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm truncate">
            {exercise.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {exercise.sets} series × {exercise.reps}
            </span>
            {exercise.muscleGroup && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span className="text-xs text-primary capitalize">
                  {exercise.muscleGroup}
                </span>
              </>
            )}
          </div>
          {exercise.notes && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              💡 {exercise.notes}
            </p>
          )}
        </div>

        {/* Rest time indicator */}
        {exercise.restSeconds && (
          <div className="text-xs text-muted-foreground">
            ⏱ {exercise.restSeconds}s
          </div>
        )}
      </motion.div>

      {/* Video Player Modal */}
      {showVideo && exercise.videoUrl && (
        <ExerciseVideoPlayer
          videoUrl={exercise.videoUrl}
          exerciseName={exercise.name}
          onClose={() => setShowVideo(false)}
        />
      )}
    </>
  );
};

export default CoachExerciseListItem;
