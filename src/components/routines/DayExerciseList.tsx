/**
 * Lista de ejercicios de un día (nombre + series × reps + descanso/RIR/tempo),
 * con marcas de biserie/superserie. Reutilizable en el detalle de rutina y en
 * el componente Programa.
 */
import { useState } from "react";
import { Timer, Target, Dumbbell, Play } from "lucide-react";
import { computeExerciseGroups } from "@/lib/exerciseGroups";
import ExerciseVideoPlayer from "@/components/workout/ExerciseVideoPlayer";
import type { RoutineExercise } from "@/types/coach";

const fmtRest = (s: number | null) =>
  !s ? null : s >= 60 ? `${Math.floor(s / 60)}′${s % 60 ? String(s % 60).padStart(2, "0") + "″" : ""}` : `${s}″`;

/**
 * Portada del ejercicio: la misma miniatura del video. Antes había un punto
 * naranja de 6px, que no identificaba nada — con la portada el alumno reconoce
 * el movimiento sin leer. Si el ejercicio no tiene imagen cargada cae en la
 * mancuerna, así la lista nunca queda con huecos.
 */
const ExerciseThumb = ({ ex, onPlay }: { ex: RoutineExercise; onPlay: () => void }) => {
  const src = ex.exercise?.thumbnail_url ?? ex.exercise?.thumbnail ?? null;
  const video = ex.exercise?.video_url ?? null;
  const name = ex.exercise?.name || ex.name;

  const inner = (
    <>
      {src ? (
        <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
      ) : (
        <Dumbbell className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
      )}
      {video && (
        <span className="absolute inset-0 bg-black/35 flex items-center justify-center">
          <span className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-2.5 h-2.5 text-primary fill-current ml-px" aria-hidden="true" />
          </span>
        </span>
      )}
    </>
  );

  const base =
    "relative shrink-0 w-11 h-11 rounded-xl overflow-hidden bg-secondary/60 border border-white/[0.06] flex items-center justify-center";

  // Sin video no hay nada que abrir: queda como imagen y no como control muerto.
  if (!video) return <span className={base}>{inner}</span>;

  return (
    <button
      type="button"
      aria-label={`Ver video de ${name}`}
      onClick={(e) => {
        e.stopPropagation();
        onPlay();
      }}
      className={`${base} active:scale-95 transition-transform`}
    >
      {inner}
    </button>
  );
};

const ExerciseRow = ({ ex, letter }: { ex: RoutineExercise; letter: string | null }) => {
  const rest = fmtRest(ex.rest);
  const [showVideo, setShowVideo] = useState(false);
  const video = ex.exercise?.video_url ?? null;
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      {letter ? (
        <span className="shrink-0 w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-black flex items-center justify-center">
          {letter}
        </span>
      ) : (
        <ExerciseThumb ex={ex} onPlay={() => setShowVideo(true)} />
      )}

      {showVideo && video && (
        <ExerciseVideoPlayer
          videoUrl={video}
          exerciseName={ex.exercise?.name || ex.name}
          onClose={() => setShowVideo(false)}
        />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{ex.exercise?.name || ex.name}</p>
        {(rest || ex.rir != null || ex.tempo) && (
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-0.5 text-sm text-foreground/70">
            {rest && (
              <span className="flex items-center gap-0.5">
                <Timer className="w-3.5 h-3.5" /> {rest}
              </span>
            )}
            {ex.rir != null && (
              <span className="flex items-center gap-0.5">
                <Target className="w-3.5 h-3.5" /> RIR {ex.rir}
              </span>
            )}
            {ex.tempo && <span className="tabular-nums">Tempo {ex.tempo}</span>}
          </div>
        )}
      </div>

      <div className="shrink-0 text-right">
        <p className="text-base font-black text-foreground tabular-nums leading-none">
          {ex.series}
          <span className="text-muted-foreground font-bold"> × </span>
          {ex.reps}
        </p>
        <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">series × reps</p>
      </div>
    </div>
  );
};

const DayExerciseList = ({ exercises }: { exercises: RoutineExercise[] }) => {
  if (!exercises || exercises.length === 0) {
    return <p className="px-4 py-3 text-sm text-muted-foreground">Sin ejercicios cargados.</p>;
  }
  const groups = computeExerciseGroups(
    exercises.map((e) => ({ id: e.id, method: e.training_method ?? e.type ?? null }))
  );
  return (
    <div className="divide-y divide-white/[0.05]">
      {exercises.map((ex) => (
        <ExerciseRow key={ex.id} ex={ex} letter={groups.get(ex.id)?.letter ?? null} />
      ))}
    </div>
  );
};

export default DayExerciseList;
