/**
 * Detalle de rutina — vista clara y de un vistazo: cada DÍA muestra sus
 * ejercicios con series × reps, descanso, RIR y biseries, sin tener que entrar
 * al entreno. Cada día se puede empezar o colapsar.
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Dumbbell, Clock, Calendar, ChevronDown, Play, Timer, Target } from "lucide-react";
import BottomNav from "@/components/home/BottomNav";
import { useAlumnoRoutineDetail } from "@/hooks/useAlumnoRoutines";
import { computeExerciseGroups } from "@/lib/exerciseGroups";
import PageLoading from "@/components/ui/page-loading";
import { staggerContainer, fadeUp } from "@/lib/animations";
import type { RoutineDay, RoutineExercise } from "@/types/coach";

const fmtRest = (s: number | null) =>
  !s ? null : s >= 60 ? `${Math.floor(s / 60)}′${s % 60 ? String(s % 60).padStart(2, "0") + "″" : ""}` : `${s}″`;

/* ── Fila de un ejercicio: nombre + series×reps + descanso/RIR ── */
const ExerciseRow = ({
  ex,
  letter,
}: {
  ex: RoutineExercise;
  letter: string | null;
}) => {
  const rest = fmtRest(ex.rest);
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      {letter ? (
        <span className="shrink-0 w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-black flex items-center justify-center">
          {letter}
        </span>
      ) : (
        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary/60 mx-[11px]" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{ex.exercise?.name || ex.name}</p>
        {(rest || ex.rir != null || ex.tempo) && (
          <div className="flex items-center gap-2.5 mt-0.5 text-[11px] text-muted-foreground">
            {rest && (
              <span className="flex items-center gap-0.5">
                <Timer className="w-3 h-3" /> {rest}
              </span>
            )}
            {ex.rir != null && (
              <span className="flex items-center gap-0.5">
                <Target className="w-3 h-3" /> RIR {ex.rir}
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
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">series × reps</p>
      </div>
    </div>
  );
};

/* ── Card de un día (colapsable) ── */
const DayCard = ({
  day,
  index,
  defaultOpen,
  onStart,
}: {
  day: RoutineDay;
  index: number;
  defaultOpen: boolean;
  onStart: () => void;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const exercises = day.routine_exercises || [];
  const groups = computeExerciseGroups(
    exercises.map((e) => ({ id: e.id, method: e.training_method ?? e.type ?? null }))
  );

  return (
    <motion.div variants={fadeUp} className="card-elevated rounded-2xl overflow-hidden">
      {/* Cabecera */}
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-black text-primary">D{day.order_index ?? day.day_number ?? index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-foreground truncate">{day.day_name || day.name}</p>
          <p className="text-xs text-muted-foreground">{exercises.length} ejercicios</p>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {day.notes && (
              <div className="mx-4 mb-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-xs text-foreground/80">{day.notes}</p>
              </div>
            )}

            {exercises.length > 0 ? (
              <div className="divide-y divide-white/[0.05] border-t border-white/[0.05]">
                {exercises.map((ex) => (
                  <ExerciseRow key={ex.id} ex={ex} letter={groups.get(ex.id)?.letter ?? null} />
                ))}
              </div>
            ) : (
              <p className="px-4 pb-4 text-sm text-muted-foreground">Sin ejercicios cargados.</p>
            )}

            {exercises.length > 0 && (
              <div className="p-3">
                <button
                  onClick={onStart}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold active:scale-[0.99] transition-transform"
                >
                  <Play className="w-4 h-4 fill-current" /> Empezar este día
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const RoutineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: routine, isLoading, error } = useAlumnoRoutineDetail(id || null);

  if (isLoading) {
    return <PageLoading message="Cargando rutina..." />;
  }

  if (error || !routine) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Dumbbell className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-foreground font-semibold mb-2">Rutina no encontrada</p>
        <button onClick={() => navigate("/routines")} className="text-primary text-sm font-semibold">
          Volver a Rutinas
        </button>
        <BottomNav />
      </div>
    );
  }

  const days = [...(routine.routine_days || [])].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );
  const totalExercises = days.reduce((a, d) => a + (d.routine_exercises?.length || 0), 0);

  const startDay = (day: RoutineDay) =>
    navigate(`/workout/${day.id}`, { state: { routineDayId: day.id, routineId: routine.id } });

  return (
    <motion.div
      className="min-h-screen bg-background pb-28 lg:pb-10"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 px-5 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground" aria-label="Volver">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-black text-foreground truncate">{routine.name}</h1>
            {routine.description && <p className="text-xs text-muted-foreground truncate">{routine.description}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5">
        {/* Meta */}
        <div className="flex flex-wrap gap-4 py-4">
          {routine.duration_weeks && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{routine.duration_weeks} semanas</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>{days.length} días</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Dumbbell className="w-3.5 h-3.5 text-primary" />
            <span>{totalExercises} ejercicios</span>
          </div>
        </div>

        {/* Días con sus ejercicios */}
        <div className="space-y-3">
          {days.map((day, i) => (
            <DayCard key={day.id} day={day} index={i} defaultOpen={i === 0} onStart={() => startDay(day)} />
          ))}
        </div>
      </div>

      <BottomNav />
    </motion.div>
  );
};

export default RoutineDetail;
