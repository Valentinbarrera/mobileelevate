/**
 * Pantalla dedicada "Entrenar con el coach": muestra SOLO lo asignado por el
 * coach (sesión de hoy, programa activo, semana y lista de rutinas del coach).
 * Sin programas propios, entreno libre ni templates — foco total en el coach.
 */
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Dumbbell, CalendarDays, Flame, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { loadActivePlan, clearActivePlan, type ActivePlan } from "@/lib/activePlan";
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

const CoachRoutines = () => {
  const navigate = useNavigate();
  const { student } = useAuthContext();

  const { data: routines, isLoading, error } = useAlumnoRoutines({
    studentId: student?.id || null,
    status: "all",
  });

  const today = localISODate();
  const assignments = useMemo(() => routines || [], [routines]);
  const activeAssignments = useMemo(() => assignments.filter((a) => a.status === "active"), [assignments]);
  const completedAssignments = useMemo(() => assignments.filter((a) => a.status === "completed"), [assignments]);

  const completedReal = useCompletedDates();
  const { manualDates, isDone: isManualDone, toggle } = useManualCompletions();
  const doneDates = useMemo(() => {
    const s = new Set<string>(completedReal);
    for (const d of manualDates) s.add(d);
    return s;
  }, [completedReal, manualDates]);

  const primary = activeAssignments[0] ?? null;

  const hasAgenda = hasAnyPlannedSession(activeAssignments);
  const todaySession = useMemo(() => findSessionByDate(activeAssignments, today), [activeAssignments, today]);
  const nextSession = useMemo(
    () => (hasAgenda ? findNextSession(activeAssignments, today) : null),
    [hasAgenda, activeAssignments, today]
  );
  const fallbackSession = useMemo(() => firstDaySession(activeAssignments), [activeAssignments]);

  const heroVariant: "ready" | "rest" = todaySession ? "ready" : hasAgenda ? "rest" : "ready";
  const heroSession = todaySession ?? (hasAgenda ? nextSession : fallbackSession);
  const heroLabel = todaySession ? "Hoy" : hasAgenda ? "Próximo entreno" : "Tu rutina";

  const doneKey = heroSession?.date ?? today;
  const sessionDone = isManualDone(doneKey) || completedReal.has(doneKey);

  const weekDays = useMemo(() => getWeekDays(activeAssignments, today), [activeAssignments, today]);
  const weeklyCount = weekDays.filter((d) => d.hasSession).length;
  const [showCalendar, setShowCalendar] = useState(false);
  const plannedDates = useMemo(() => {
    const s = new Set<string>();
    for (const a of activeAssignments) for (const p of a.planned_sessions || []) s.add(p.date);
    return s;
  }, [activeAssignments]);

  const startSession = (session: SessionInfo) => {
    navigate(`/workout/${session.day.id}`, {
      state: { routineDayId: session.day.id, routineId: session.assignment.routine.id },
    });
  };
  const viewRoutine = (routineId: string) => navigate(`/routine/${routineId}`);
  const goToDay = (iso: string) => {
    const sess = findSessionByDate(activeAssignments, iso);
    if (sess) startSession(sess);
  };

  const [programsFilter, setProgramsFilter] = useState<ProgramsFilter>("active");
  const programsList = programsFilter === "completed" ? completedAssignments : activeAssignments;

  // Plan activo: el del coach manda salvo que el alumno haya elegido uno propio.
  const sid = student?.id ?? "";
  const [plan, setPlan] = useState<ActivePlan>(() =>
    sid ? loadActivePlan(sid) : { type: "coach" }
  );
  useEffect(() => {
    if (sid) setPlan(loadActivePlan(sid));
  }, [sid]);
  const coachPlanActive = plan.type === "coach";

  const useCoachPlan = () => {
    clearActivePlan(sid);
    setPlan({ type: "coach" });
    toast.success("El plan de tu coach es tu plan activo");
  };

  if (!student) {
    return (
      <AppShell>
        <div className="min-h-screen bg-background pb-nav flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Dumbbell className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Sin coach asignado</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Pedile a tu entrenador que te agregue como alumno para ver tus rutinas personalizadas.
          </p>
        </div>
      </AppShell>
    );
  }

  const firstName = student.full_name?.trim().split(" ")[0] || "Atleta";

  return (
    <AppShell>
      <PageHeader
        eyebrow={
          <>
            <Dumbbell className="w-3.5 h-3.5" />
            {`Hola, ${firstName}`}
          </>
        }
        title="Rutinas del coach"
        maxWidth="max-w-2xl lg:max-w-6xl"
        left={
          <button onClick={() => navigate(-1)} className="text-muted-foreground -ml-1 p-1" aria-label="Volver">
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
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
          {/* Activar el plan del coach desde acá, con el mismo gesto que tienen
              los programas propios ("Usar como mi plan"). Sin esto, el alumno que
              se pasó a un plan propio no tiene un lugar obvio para volver. */}
          {assignments.length > 0 &&
            (coachPlanActive ? (
              <motion.div
                variants={fadeUp}
                className="flex items-center gap-2 rounded-2xl bg-primary/10 border border-primary/25 px-4 py-3"
              >
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs font-bold text-primary">
                  El plan de tu coach es tu plan activo
                </p>
              </motion.div>
            ) : (
              <motion.div variants={fadeUp} className="rounded-2xl card-elevated p-4">
                <p className="text-sm font-bold text-foreground">
                  Ahora estás siguiendo un programa propio
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Volvé al plan de tu coach para que Inicio y tu calendario se guíen otra
                  vez por lo que te armó.
                </p>
                <button
                  type="button"
                  onClick={useCoachPlan}
                  className="w-full mt-3 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold active:scale-[0.99] transition-transform"
                >
                  <CheckCircle2 className="w-4 h-4" /> Usar como mi plan
                </button>
              </motion.div>
            ))}

          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-3xl border border-primary/15 card-elevated p-6 lg:p-8"
            style={{
              backgroundImage:
                "radial-gradient(120% 140% at 0% 0%, hsl(18 100% 55% / 0.18) 0%, hsl(18 100% 55% / 0.06) 38%, transparent 68%)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-12 w-44 h-44 rounded-full blur-3xl"
              style={{ background: "radial-gradient(circle, hsl(18 100% 55% / 0.22) 0%, transparent 70%)" }}
            />
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-black tracking-[0.14em] uppercase text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                Tu plan
              </div>
              <h1 className="mt-2.5 text-[26px] lg:text-4xl font-black tracking-tight text-foreground leading-[1.08]">
                Rutinas del coach
              </h1>
              <p className="mt-1.5 text-sm lg:text-base text-muted-foreground">
                ¡A entrenar, <span className="font-bold text-foreground">{firstName}</span>! Todo lo que tu coach
                preparó para vos.
              </p>
              {weeklyCount > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 pl-2.5 pr-3.5 py-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/15">
                    <Flame className="w-3.5 h-3.5 text-primary" />
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    <span className="font-black text-primary tabular-nums">{weeklyCount}</span>{" "}
                    {weeklyCount === 1 ? "sesión" : "sesiones"} esta semana
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {isLoading && <PageLoading message="Cargando rutinas del coach..." />}

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
            <div className="rounded-3xl card-elevated p-10 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center">
                <Dumbbell className="w-7 h-7 text-primary" />
              </div>
              <p className="font-bold text-foreground">Sin rutinas todavía</p>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
                Tu coach aún no te asignó una rutina.
              </p>
            </div>
          )}

          {!isLoading && !error && assignments.length > 0 && (
            <>
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

              <motion.div variants={fadeUp} className="space-y-3">
                <div className="flex items-center justify-between gap-3 px-0.5">
                  <div className="flex items-center gap-2">
                    <span className="accent-bar" />
                    <h3 className="text-sm font-black text-foreground tracking-tight">Tus rutinas</h3>
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
                                layoutId="coachProgramsFilter"
                                className="absolute inset-0 bg-gradient-primary rounded-lg"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              />
                            )}
                            <span className="relative z-10">{f === "active" ? "Activas" : "Completadas"}</span>
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
            </>
          )}
        </div>
      </motion.div>
    </AppShell>
  );
};

export default CoachRoutines;
