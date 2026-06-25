import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Dumbbell, ChevronRight, CalendarDays } from "lucide-react";
import PageLoading from "@/components/ui/page-loading";
import AppShell from "@/components/layout/AppShell";
import RoutinesHeaderSlim from "@/components/routines/RoutinesHeaderSlim";
import TodaySessionHero from "@/components/routines/TodaySessionHero";
import WeekStrip from "@/components/routines/WeekStrip";
import AlumnoRoutineCard from "@/components/routines/AlumnoRoutineCard";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAlumnoRoutines } from "@/hooks/useAlumnoRoutines";
import {
  localISODate,
  findSessionByDate,
  findNextSession,
  firstDaySession,
  hasAnyPlannedSession,
  getWeekDays,
  getUpcomingSessions,
  dayTitle,
  estimateSessionMinutes,
  type SessionInfo,
} from "@/lib/routineSession";

type View = "today" | "completed";

const formatShortDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
  });
};

const Routines = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("today");
  const { student } = useAuthContext();

  const { data: routines, isLoading, error } = useAlumnoRoutines({
    studentId: student?.id || null,
    status: view === "completed" ? "completed" : "active",
  });

  const today = localISODate();
  const assignments = useMemo(() => routines || [], [routines]);

  // Sesión de hoy / estado del hero
  const hero = useMemo(() => {
    if (view !== "today" || assignments.length === 0) return null;

    const todaySession = findSessionByDate(assignments, today);
    if (todaySession) {
      return { variant: "ready" as const, label: "Hoy", session: todaySession };
    }
    if (hasAnyPlannedSession(assignments)) {
      const next = findNextSession(assignments, today) || firstDaySession(assignments);
      return { variant: "rest" as const, label: "Descanso", session: next };
    }
    // Sin agenda: ofrecemos la rutina activa para empezar igual
    return { variant: "ready" as const, label: "Tu rutina", session: firstDaySession(assignments) };
  }, [assignments, today, view]);

  const weekDays = useMemo(
    () => (view === "today" ? getWeekDays(assignments, today) : []),
    [assignments, today, view]
  );
  const weeklyCount = weekDays.filter((d) => d.hasSession).length;
  const upcoming = useMemo(
    () => (view === "today" ? getUpcomingSessions(assignments, today) : []),
    [assignments, today, view]
  );

  const startSession = (session: SessionInfo) => {
    navigate(`/workout/${session.day.id}`, {
      state: { routineDayId: session.day.id, routineId: session.assignment.routine.id },
    });
  };
  const viewRoutine = (routineId: string) => navigate(`/routine/${routineId}`);

  // ─── Sin coach vinculado ───────────────────────────────────────────────────
  if (!student) {
    return (
      <AppShell>
        <div className="min-h-screen bg-background pb-28 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Dumbbell className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Sin coach asignado</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Pedile a tu entrenador que te agregue como alumno para ver tus rutinas
            personalizadas.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <RoutinesHeaderSlim fullName={student.full_name} weeklyCount={weeklyCount} />

      <motion.div
        className="min-h-screen bg-background pb-32 lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-2xl mx-auto px-5 pt-5 space-y-6">
          {/* Toggle Hoy / Completadas */}
          <div className="flex gap-2 p-1 rounded-2xl bg-secondary/40 border border-border/50">
            {(["today", "completed"] as View[]).map((v) => {
              const active = view === v;
              return (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`relative flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    active ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="routinesViewToggle"
                      className="absolute inset-0 bg-gradient-primary rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">
                    {v === "today" ? "Hoy" : "Completadas"}
                  </span>
                </button>
              );
            })}
          </div>

          {isLoading && <PageLoading message="Cargando rutinas..." />}

          {error && (
            <div className="px-5 py-12 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-destructive/10 flex items-center justify-center">
                <Dumbbell className="w-7 h-7 text-destructive" />
              </div>
              <p className="text-destructive text-sm">Error al cargar rutinas</p>
              <p className="text-muted-foreground text-xs mt-1">{(error as Error).message}</p>
            </div>
          )}

          {/* ─── Vista HOY ───────────────────────────────────────────────── */}
          {!isLoading && !error && view === "today" && (
            <>
              {hero?.session ? (
                <TodaySessionHero
                  variant={hero.variant}
                  label={hero.label}
                  session={hero.session}
                  onStart={startSession}
                  onView={viewRoutine}
                />
              ) : (
                <div className="rounded-3xl card-elevated p-8 text-center">
                  <Dumbbell className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="font-semibold text-foreground">Sin rutinas todavía</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tu coach aún no te asignó una rutina.
                  </p>
                </div>
              )}

              {/* Semana */}
              {hero?.session && (
                <motion.div variants={fadeUp} className="space-y-2.5">
                  <div className="flex items-center gap-2 px-0.5">
                    <span className="accent-bar" />
                    <h3 className="text-sm font-black text-foreground tracking-tight">Tu semana</h3>
                  </div>
                  <WeekStrip days={weekDays} />
                </motion.div>
              )}

              {/* Próximas sesiones */}
              {upcoming.length > 0 && (
                <motion.div variants={fadeUp} className="space-y-2.5">
                  <div className="flex items-center gap-2 px-0.5">
                    <span className="accent-bar" />
                    <h3 className="text-sm font-black text-foreground tracking-tight">Esta semana</h3>
                  </div>
                  <div className="space-y-2">
                    {upcoming.map((s) => (
                      <button
                        key={`${s.assignment.id}-${s.date}`}
                        onClick={() => viewRoutine(s.assignment.routine.id)}
                        className="w-full flex items-center gap-3 rounded-2xl card-elevated px-4 py-3 active:scale-[0.99] transition-transform"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <CalendarDays className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {dayTitle(s.day)}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {formatShortDate(s.date!)} · ~{estimateSessionMinutes(s.day)} min
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Mis programas (secundario) */}
              {assignments.length > 0 && (
                <motion.div variants={fadeUp} className="space-y-2.5">
                  <div className="flex items-center gap-2 px-0.5">
                    <span className="accent-bar" />
                    <h3 className="text-sm font-black text-foreground tracking-tight">Mis programas</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {assignments.map((assignment, index) => (
                      <AlumnoRoutineCard key={assignment.id} assignment={assignment} index={index} />
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* ─── Vista COMPLETADAS ───────────────────────────────────────── */}
          {!isLoading && !error && view === "completed" && (
            <>
              {assignments.length === 0 ? (
                <div className="rounded-3xl card-elevated p-8 text-center">
                  <Dumbbell className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="font-semibold text-foreground">Sin rutinas completadas</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cuando termines una rutina, va a aparecer acá.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assignments.map((assignment, index) => (
                    <AlumnoRoutineCard key={assignment.id} assignment={assignment} index={index} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AppShell>
  );
};

export default Routines;
