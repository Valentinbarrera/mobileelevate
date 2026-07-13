import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Plus, Flame, CalendarDays, PencilRuler, Library, ChevronRight } from "lucide-react";
import { loadMyPrograms, type MyProgram } from "@/lib/myPrograms";
import PageLoading from "@/components/ui/page-loading";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import ActiveProgram from "@/components/routines/ActiveProgram";
import TodaySessionHero from "@/components/routines/TodaySessionHero";
import WeekStrip from "@/components/routines/WeekStrip";
import TrainingCalendar from "@/components/routines/TrainingCalendar";
import AlumnoRoutineCard from "@/components/routines/AlumnoRoutineCard";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAlumnoRoutines } from "@/hooks/useAlumnoRoutines";
import { useCompletedDates } from "@/hooks/useCompletedDates";
import { useManualCompletions } from "@/hooks/useManualCompletions";
import {
  localISODate,
  getWeekDays,
  findSessionByDate,
  findNextSession,
  firstDaySession,
  hasAnyPlannedSession,
  getCurrentWeekIndex,
  getProgramWeekCount,
  programProgress,
  type SessionInfo,
} from "@/lib/routineSession";

type ProgramsFilter = "active" | "completed";

const Routines = () => {
  const navigate = useNavigate();
  const { student } = useAuthContext();

  // Programas PROPIOS del alumno (locales), separados de los del coach.
  const [myPrograms, setMyPrograms] = useState<MyProgram[]>([]);
  useEffect(() => {
    if (student) setMyPrograms(loadMyPrograms(student.id));
  }, [student]);

  // Una sola consulta con status='all': derivamos activas/completadas en cliente.
  const { data: routines, isLoading, error } = useAlumnoRoutines({
    studentId: student?.id || null,
    status: "all",
  });

  const today = localISODate();
  const assignments = useMemo(() => routines || [], [routines]);
  const activeAssignments = useMemo(
    () => assignments.filter((a) => a.status === "active"),
    [assignments]
  );
  const completedAssignments = useMemo(
    () => assignments.filter((a) => a.status === "completed"),
    [assignments]
  );

  // Completados = reales (completed_sessions) + manuales (tilde del alumno).
  const completedReal = useCompletedDates();
  const { manualDates, isDone: isManualDone, toggle } = useManualCompletions();
  const doneDates = useMemo(() => {
    const s = new Set<string>(completedReal);
    for (const d of manualDates) s.add(d);
    return s;
  }, [completedReal, manualDates]);

  // ── Programa activo (héroe) ──
  const primary = activeAssignments[0] ?? null;

  // ── Sesión de hoy ──
  const hasAgenda = hasAnyPlannedSession(activeAssignments);
  const todaySession = useMemo(
    () => findSessionByDate(activeAssignments, today),
    [activeAssignments, today]
  );
  const nextSession = useMemo(
    () => (hasAgenda ? findNextSession(activeAssignments, today) : null),
    [hasAgenda, activeAssignments, today]
  );
  const fallbackSession = useMemo(
    () => firstDaySession(activeAssignments),
    [activeAssignments]
  );

  const heroVariant: "ready" | "rest" = todaySession ? "ready" : hasAgenda ? "rest" : "ready";
  const heroSession = todaySession ?? (hasAgenda ? nextSession : fallbackSession);
  const heroLabel = todaySession ? "Hoy" : hasAgenda ? "Próximo entreno" : "Tu rutina";

  // clave de completado manual para la sesión mostrada
  const doneKey = heroSession?.date ?? today;
  const sessionDone = isManualDone(doneKey) || completedReal.has(doneKey);

  // ── Semana / calendario ──
  const weekDays = useMemo(() => getWeekDays(activeAssignments, today), [activeAssignments, today]);
  const weeklyCount = weekDays.filter((d) => d.hasSession).length;
  const [showCalendar, setShowCalendar] = useState(false);
  const plannedDates = useMemo(() => {
    const s = new Set<string>();
    for (const a of activeAssignments) for (const p of a.planned_sessions || []) s.add(p.date);
    return s;
  }, [activeAssignments]);

  // Tocar un día (semana o calendario) → abrir la rutina de ese día.
  const goToDay = (iso: string) => {
    const sess = findSessionByDate(activeAssignments, iso);
    if (sess) startSession(sess);
  };

  // ── Mis programas (filtro discreto) ──
  const [programsFilter, setProgramsFilter] = useState<ProgramsFilter>("active");
  const programsList =
    programsFilter === "completed" ? completedAssignments : activeAssignments;

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
        <div className="min-h-screen bg-background pb-nav flex flex-col items-center justify-center px-6 text-center">
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

  const firstName = student.full_name?.trim().split(" ")[0] || "Atleta";

  return (
    <AppShell>
      <PageHeader
        eyebrow={`Hola, ${firstName}`}
        title="Entrenar"
        maxWidth="max-w-2xl lg:max-w-6xl"
        right={
          weeklyCount > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary tabular-nums">{weeklyCount}</span>
            </div>
          ) : undefined
        }
      />

      <motion.div
        className="min-h-screen bg-background pb-nav lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-2xl lg:max-w-6xl mx-auto px-5 lg:px-8 pt-5 space-y-6">
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

          {!isLoading && !error && assignments.length === 0 && (
            <div className="rounded-3xl card-elevated p-8 text-center">
              <Dumbbell className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-foreground">Sin rutinas todavía</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tu coach aún no te asignó una rutina.
              </p>
            </div>
          )}

          {!isLoading && !error && assignments.length > 0 && (
            <>
              {/* ── HÉROE: programa activo ── */}
              {primary && (
                <motion.div variants={fadeUp}>
                  <ActiveProgram
                    assignment={primary}
                    weekIndex={getCurrentWeekIndex(primary, today)}
                    weekCount={getProgramWeekCount(primary)}
                    progress={programProgress(primary, doneDates, today).pct}
                    onView={viewRoutine}
                  />
                </motion.div>
              )}

              {/* ── Sesión de HOY ── */}
              {heroSession && (
                <motion.div variants={fadeUp}>
                  <TodaySessionHero
                    variant={heroVariant}
                    label={heroLabel}
                    session={heroSession}
                    onStart={startSession}
                    onView={viewRoutine}
                    done={sessionDone}
                    onToggleDone={() => toggle(doneKey)}
                  />
                </motion.div>
              )}

              {/* ── Esta semana / Calendario ── */}
              {activeAssignments.length > 0 && (
                <motion.div variants={fadeUp} className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3 px-0.5">
                    <div className="flex items-center gap-2">
                      <span className="accent-bar" />
                      <h3 className="text-sm font-black text-foreground tracking-tight">
                        {showCalendar ? "Calendario" : "Esta semana"}
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowCalendar((v) => !v)}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-primary px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      {showCalendar ? "Ver semana" : "Ver mes"}
                    </button>
                  </div>

                  {showCalendar ? (
                    <TrainingCalendar
                      monthOnly
                      plannedDates={plannedDates}
                      doneDates={doneDates}
                      selectedDate={today}
                      today={today}
                      onSelect={goToDay}
                      onCollapse={() => setShowCalendar(false)}
                    />
                  ) : (
                    <WeekStrip days={weekDays} onSelectDay={goToDay} />
                  )}
                </motion.div>
              )}

              {/* ── De tu coach ── */}
              {(activeAssignments.length > 0 || completedAssignments.length > 0) && (
                <motion.div variants={fadeUp} className="space-y-3">
                  <div className="flex items-center justify-between gap-3 px-0.5">
                    <div className="flex items-center gap-2">
                      <span className="accent-bar" />
                      <h3 className="text-sm font-black text-foreground tracking-tight">De tu coach</h3>
                    </div>

                    {completedAssignments.length > 0 && (
                      <div className="flex gap-1 p-1 rounded-xl bg-secondary/40 border border-border/50">
                        {(["active", "completed"] as ProgramsFilter[]).map((f) => {
                          const active = programsFilter === f;
                          return (
                            <button
                              key={f}
                              onClick={() => setProgramsFilter(f)}
                              className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                active ? "text-primary-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {active && (
                                <motion.div
                                  layoutId="programsFilter"
                                  className="absolute inset-0 bg-gradient-primary rounded-lg"
                                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                              )}
                              <span className="relative z-10">
                                {f === "active" ? "Activas" : "Completadas"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {programsList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {programsList.map((assignment, index) => (
                        <AlumnoRoutineCard key={assignment.id} assignment={assignment} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl card-elevated p-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        {programsFilter === "completed"
                          ? "Todavía no completaste ningún programa."
                          : "No tenés programas activos."}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}

          {/* ── Entreno propio: SIEMPRE disponible (con o sin coach) ── */}
          {!isLoading && !error && (
            <>
              {/* Entreno libre */}
              <motion.button
                variants={fadeUp}
                onClick={() => navigate("/free-workout")}
                whileTap={{ scale: 0.99 }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 py-3.5 text-primary font-bold text-sm hover:bg-primary/15 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Entreno libre
              </motion.button>

              {/* Mis programas (propios) */}
              <motion.div variants={fadeUp} className="space-y-3">
                <div className="flex items-center justify-between gap-3 px-0.5">
                  <div className="flex items-center gap-2">
                    <span className="accent-bar" />
                    <h3 className="text-sm font-black text-foreground tracking-tight">Mis programas</h3>
                  </div>
                  <button
                    onClick={() => navigate("/programas/nuevo")}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-primary px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Crear
                  </button>
                </div>

                {myPrograms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {myPrograms.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => navigate(`/programa/${p.id}`)}
                        className="text-left rounded-2xl card-elevated p-4 active:scale-[0.99] hover:bg-secondary/30 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                            <PencilRuler className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-foreground truncate">
                              {p.name || "Programa sin nombre"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {p.days.length} {p.days.length === 1 ? "día" : "días"}
                              {p.origin === "template" ? " · de template" : " · propio"}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl card-elevated p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Todavía no armaste ningún programa propio.
                    </p>
                    <button
                      onClick={() => navigate("/programas/nuevo")}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-bold active:scale-95 transition-transform"
                    >
                      <Plus className="w-4 h-4" />
                      Crear mi programa
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Templates / biblioteca de programas */}
              <motion.button
                variants={fadeUp}
                onClick={() => navigate("/programas/templates")}
                whileTap={{ scale: 0.99 }}
                className="w-full text-left rounded-2xl card-elevated p-4 flex items-center gap-3.5 active:scale-[0.99] hover:bg-secondary/30 transition-all"
              >
                <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                  <Library className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Templates</p>
                  <p className="text-sm font-semibold text-foreground">Biblioteca de programas listos</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </AppShell>
  );
};

export default Routines;
