/**
 * Exercise list item para la vista previa (antes de empezar el entreno).
 * Tocá para expandir y ver el detalle: serie por serie (reps + descanso),
 * la nota del coach completa, el equipo y el video de técnica.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Dumbbell, ChevronDown, ChevronUp } from "lucide-react";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer";
import { PrescriptionStrip, TechniqueBlock } from "./ExerciseMeta";

interface CoachExercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number | null;
  rir?: number | null;
  tempo?: string | null;
  method?: string | null;
  notes: string | null;
  videoUrl: string | null;
  thumbnail: string | null;
  muscleGroup: string | null;
  equipment: string | null;
  description?: string | null;
  instructions?: string[] | null;
}

interface CoachExerciseListItemProps {
  exercise: CoachExercise;
  index: number;
}

const CoachExerciseListItem = ({ exercise, index }: CoachExerciseListItemProps) => {
  const [showVideo, setShowVideo] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <motion.div
        className="card-elevated rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        {/* Cabecera tappable */}
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="w-full p-4 flex items-center gap-3.5 text-left"
        >
          {/* Index */}
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary">{index}</span>
          </div>

          {/* Thumbnail (abre video) */}
          <div
            className="w-14 h-14 rounded-xl bg-secondary overflow-hidden flex-shrink-0 relative"
            onClick={(e) => {
              if (exercise.videoUrl) {
                e.stopPropagation();
                setShowVideo(true);
              }
            }}
          >
            {exercise.thumbnail ? (
              <img src={exercise.thumbnail} alt={exercise.name} className="w-full h-full object-cover" />
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
            <h3 className="font-bold text-foreground text-sm truncate">{exercise.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-foreground font-semibold tabular-nums">
                {exercise.sets} × {exercise.reps}
              </span>
              {exercise.muscleGroup && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="text-xs text-primary capitalize truncate">{exercise.muscleGroup}</span>
                </>
              )}
            </div>
          </div>

          {/* Chevron */}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}
        </button>

        {/* Detalle expandible */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                {/* Prescripción del coach */}
                <PrescriptionStrip
                  data={{
                    sets: exercise.sets,
                    reps: exercise.reps,
                    restSeconds: exercise.restSeconds,
                    rir: exercise.rir,
                    tempo: exercise.tempo,
                    method: exercise.method,
                  }}
                />

                {/* Técnica / ejecución + paso a paso */}
                <TechniqueBlock description={exercise.description} instructions={exercise.instructions} />

                {/* Serie por serie */}
                <div className="rounded-xl bg-secondary/40 border border-white/[0.05] overflow-hidden">
                  <div className="grid grid-cols-[2rem_1fr_1fr] gap-2 px-3 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <span>Serie</span>
                    <span className="text-center">Reps</span>
                    <span className="text-center">Descanso</span>
                  </div>
                  {Array.from({ length: exercise.sets }).map((_, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[2rem_1fr_1fr] gap-2 px-3 py-2 border-t border-white/[0.05] items-center"
                    >
                      <span className="text-sm font-bold text-primary">{i + 1}</span>
                      <span className="text-center text-sm font-bold text-foreground tabular-nums">
                        {exercise.reps}
                      </span>
                      <span className="text-center text-sm text-muted-foreground tabular-nums">
                        {exercise.restSeconds ? `${exercise.restSeconds}s` : "—"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Nota del coach (completa) */}
                {exercise.notes && (
                  <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl">
                    <p className="text-sm text-foreground leading-relaxed">
                      <span className="font-bold">💡 Nota:</span> {exercise.notes}
                    </p>
                  </div>
                )}

                {/* Equipo */}
                {exercise.equipment && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">Equipo:</span> <span className="capitalize">{exercise.equipment}</span>
                  </p>
                )}

                {/* Video */}
                {exercise.videoUrl && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary/60 border border-white/[0.06] text-sm font-bold text-foreground active:scale-[0.99] transition-transform"
                  >
                    <Play className="w-4 h-4 text-primary fill-current" />
                    Ver técnica
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
