/**
 * RoutineDetail — "Program Overview" premium. El programa es protagonista:
 * un héroe compacto (objetivo + nivel + semana + progreso) y tres pestañas
 * [ Semanas · Días · Hoy ] para navegar el plan a distintos niveles.
 *
 * Reutiliza DayExerciseList / ExerciseDetailModal (vía DayExerciseList) tal cual.
 */
import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Dumbbell, Clock, Calendar, ChevronDown, Play, Signal } from "lucide-react";
import BottomNav from "@/components/home/BottomNav";
import PageHeader from "@/components/layout/PageHeader";
import DayExerciseList from "@/components/routines/DayExerciseList";
import ProgramWeeks from "@/components/routines/ProgramWeeks";
import TodaySessionHero from "@/components/routines/TodaySessionHero";
import PageLoading from "@/components/ui/page-loading";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAlumnoRoutineDetail, useAlumnoRoutines } from "@/hooks/useAlumnoRoutines";
import { useCompletedDates } from "@/hooks/useCompletedDates";
import { useManualCompletions } from "@/hooks/useManualCompletions";
import {
  localISODate,
  findSessionByDate,
  firstDaySession,
  hasAnyPlannedSession,
  getCurrentWeekIndex,
  getProgramWeekCount,
  programProgress,
  type SessionInfo,
} from "@/lib/routineSession";
import type { RoutineDay, RoutineExercise } from "@/types/coach";

type Tab = "semanas" | "dias" | "hoy";

/* ── Card de un día (colapsable) — vista "Días" ── */
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

  return (
    <motion.div variants={fadeUp} className="card-elevated rounded-2xl overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-black text-primary">D{day.order_index != null ? day.order_index + 1 : (day.day_number ?? index + 1)}</span>
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

            <div className="border-t border-white/[0.05]">
              <DayExerciseList exercises={exercises as RoutineExercise[]} />
            </div>

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

const TABS: { id: Tab; label: string }[] = [
  { id: "semanas", label: "Semanas" },
  { id: "dias", label: "Días" },
  { id: "hoy", label: "Hoy" },
];

const RoutineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { student } = useAuthContext();

  const { data: routine, isLoading, error } = useAlumnoRoutineDetail(id || null);
  // Traemos las asignaciones para obtener planned_sessions / start_date (no vienen
  // en el detalle de la rutina, que es routine-centric).
  const { data: allAssignments } = useAlumnoRoutines({ studentId: student?.id || null, status: "all" });

  const today = localISODate();
  const [tab, setTab] = useState<Tab>("dias");

  const assignment = useMemo(
    () => (allAssignments || []).find((a) => a.routine?.id === id) ?? null,
    [allAssignments, id]
  );

  // Completados = reales + manuales
  const completedReal = useCompletedDates();
  const { manualDates, isDone: isManualDone, toggle } = useManualCompletions();
  const doneDates = useMemo(() => {
    const s = new Set<string>(completedReal);
    for (const d of manualDates) s.add(d);
    return s;
  }, [completedReal, manualDates]);

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

  // Métricas del programa (necesitan la asignación con agenda/start_date)
  const weekCount = assignment ? getProgramWeekCount(assignment) : routine.duration_weeks || 1;
  const weekIndex = assignment ? getCurrentWeekIndex(assignment, today) : 1;
  const progress = assignment ? programProgress(assignment, doneDates, today).pct : 0;

  const startDay = (day: RoutineDay) =>
    navigate(`/workout/${day.id}`, { state: { routineDayId: day.id, routineId: routine.id } });
  const startSession = (s: SessionInfo) => startDay(s.day);

  // Sesión de "Hoy" acotada a esta asignación
  const hasAgenda = assignment ? hasAnyPlannedSession([assignment]) : false;
  const todaySession = assignment ? findSessionByDate([assignment], today) : null;
  const fallbackSession = assignment ? firstDaySession([assignment]) : null;
  const hoySession = todaySession ?? (hasAgenda ? null : fallbackSession);
  const hoyVariant: "ready" | "rest" = todaySession ? "ready" : "rest";
  const hoyLabel = todaySession ? "Hoy" : "Sin entreno hoy";
  const doneKey = hoySession?.date ?? today;
  const hoyDone = isManualDone(doneKey) || completedReal.has(doneKey);

  // Lista plana de días (Días tab + fallback de Semanas)
  const daysList = (
    <div className="space-y-3">
      {days.map((day, i) => (
        <DayCard key={day.id} day={day} index={i} defaultOpen={i === 0} onStart={() => startDay(day)} />
      ))}
    </div>
  );

  return (
    <motion.div
      className="min-h-screen bg-background pb-nav lg:pb-10"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <PageHeader
        eyebrow="Programa"
        title={routine.name}
        subtitle={routine.description || undefined}
        left={
          <button onClick={() => navigate(-1)} className="text-muted-foreground -ml-1 p-1" aria-label="Volver">
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />

      <div className="max-w-2xl lg:max-w-3xl mx-auto px-5 lg:px-8 pt-5">
        {/* ── Héroe compacto: objetivo + progreso ── */}
        <motion.div variants={fadeUp} className="card-hero rounded-3xl p-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" /> {weekCount} semanas
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" /> {days.length} días
            </span>
            <span className="flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-primary" /> {totalExercises} ejercicios
            </span>
            {routine.difficulty && (
              <span className="flex items-center gap-1.5 capitalize">
                <Signal className="w-3.5 h-3.5 text-primary" /> {routine.difficulty}
              </span>
            )}
          </div>

          <div className="flex items-end justify-between mb-2">
            <span className="text-sm font-bold text-foreground tabular-nums">
              Semana {weekIndex}
              <span className="text-muted-foreground font-semibold"> de {weekCount}</span>
            </span>
            <span className="text-sm font-black text-primary tabular-nums">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary/60 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <div className="sticky top-[calc(env(safe-area-inset-top)+3.5rem)] z-20 -mx-5 lg:-mx-8 px-5 lg:px-8 py-3 bg-background/80 backdrop-blur-xl mt-5">
          <div className="flex gap-1 p-1 rounded-2xl bg-secondary/40 border border-border/50">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    active ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="routineDetailTab"
                      className="absolute inset-0 bg-gradient-primary rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Contenido de la pestaña ── */}
        <div className="mt-4">
          {tab === "dias" && daysList}

          {tab === "semanas" &&
            (assignment ? (
              <ProgramWeeks
                assignment={assignment}
                doneDates={doneDates}
                currentWeek={weekIndex}
                todayISO={today}
                onStart={startSession}
                fallback={daysList}
              />
            ) : (
              <div className="space-y-4">
                <div className="card-elevated rounded-2xl p-6 text-center">
                  <p className="font-bold text-foreground">Tu coach todavía no agendó fechas</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mientras tanto, mirá los días del plan.
                  </p>
                </div>
                {daysList}
              </div>
            ))}

          {tab === "hoy" &&
            (hoySession ? (
              <TodaySessionHero
                variant={hoyVariant}
                label={hoyLabel}
                session={hoySession}
                onStart={startSession}
                onView={() => setTab("dias")}
                done={hoyDone}
                onToggleDone={() => toggle(doneKey)}
              />
            ) : (
              <div className="card-elevated rounded-2xl p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="font-bold text-foreground">Sin entreno hoy</p>
                <p className="text-sm text-muted-foreground mt-1">
                  No tenés una sesión de este programa agendada para hoy.
                </p>
              </div>
            ))}
        </div>
      </div>

      <BottomNav />
    </motion.div>
  );
};

export default RoutineDetail;
