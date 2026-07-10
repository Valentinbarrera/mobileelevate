/**
 * Detalle de un ejercicio de la biblioteca: video + músculos/equipo/nivel +
 * técnica y paso a paso. Pantalla completa.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Dumbbell } from "lucide-react";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer";
import { TechniqueBlock } from "./ExerciseMeta";
import type { LibraryExercise } from "@/hooks/useExerciseLibrary";

const Chip = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-secondary/50 border border-white/[0.06] px-3 py-2">
    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className="text-sm font-bold text-foreground capitalize truncate">{value}</p>
  </div>
);

const ExerciseDetailModal = ({
  exercise,
  onClose,
}: {
  exercise: LibraryExercise | null;
  onClose: () => void;
}) => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <AnimatePresence>
        {exercise && (
          <motion.div
            className="fixed inset-0 z-[110] bg-background overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Top bar — safe-area iOS resuelta (pantalla completa bajo el notch) */}
            <div className="sticky top-0 z-10 flex items-center gap-3 px-5 header-safe pb-3 bg-background/95 backdrop-blur-xl border-b border-border/50">
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="shrink-0 w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-black text-foreground truncate">{exercise.name}</h1>
            </div>

            <div className="max-w-2xl mx-auto px-5 py-5 space-y-4">
              {/* Hero video / thumbnail */}
              <button
                onClick={() => exercise.videoUrl && setShowVideo(true)}
                disabled={!exercise.videoUrl}
                className="relative w-full aspect-video rounded-2xl overflow-hidden bg-secondary card-elevated disabled:cursor-default"
              >
                {exercise.thumbnailUrl ? (
                  <img src={exercise.thumbnailUrl} alt={exercise.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Dumbbell className="w-14 h-14 text-muted-foreground/30" />
                  </div>
                )}
                {exercise.videoUrl ? (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-7 h-7 text-primary fill-current ml-1" />
                    </div>
                  </div>
                ) : (
                  <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-background/80 text-xs font-bold text-muted-foreground">
                    Sin video
                  </span>
                )}
              </button>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-2">
                {exercise.muscle && <Chip label="Músculo" value={exercise.muscle} />}
                {exercise.equipment && <Chip label="Equipo" value={exercise.equipment} />}
                {exercise.level && <Chip label="Nivel" value={exercise.level} />}
                {exercise.category && <Chip label="Categoría" value={exercise.category} />}
              </div>

              {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider self-center">
                    También trabaja:
                  </span>
                  {exercise.secondaryMuscles.map((m) => (
                    <span
                      key={m}
                      className="px-2 py-1 rounded-lg bg-secondary/60 border border-white/[0.06] text-xs font-semibold text-foreground capitalize"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}

              {/* Técnica + paso a paso */}
              <TechniqueBlock description={exercise.description} instructions={exercise.instructions} />

              {!exercise.description && (!exercise.instructions || exercise.instructions.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Este ejercicio todavía no tiene descripción cargada.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showVideo && exercise?.videoUrl && (
        <ExerciseVideoPlayer
          videoUrl={exercise.videoUrl}
          exerciseName={exercise.name}
          onClose={() => setShowVideo(false)}
        />
      )}
    </>
  );
};

export default ExerciseDetailModal;
