import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Dumbbell,
  Plus,
  Flame,
  CalendarDays,
  PencilRuler,
  Library,
  ChevronRight,
  Pencil,
  Trash2,
  Check,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import {
  loadMyPrograms,
  deleteMyProgram,
  hydrateMyPrograms,
  type MyProgram,
} from "@/lib/myPrograms";
import PageLoading from "@/components/ui/page-loading";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import ActiveProgram from "@/components/routines/ActiveProgram";
import TodaySessionHero from "@/components/routines/TodaySessionHero";
import WeekStrip from "@/components/routines/WeekStrip";
import TrainingCalendar from "@/components/routines/TrainingCalendar";
import AlumnoRoutineCard from "@/components/routines/AlumnoRoutineCard";
import OwnPlanCard from "@/components/home/OwnPlanCard";
import {
  loadActivePlan,
  setActivePlan,
  clearActivePlan,
  isOwnPlanActive,
  nextProgramDay,
  type ActivePlan,
} from "@/lib/activePlan";
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

const MAX_OWN_PROGRAMS = 2;

const Routines = () => {
  const navigate = useNavigate();
  const { student } = useAuthContext();

  // Programas PROPIOS del alumno (locales), separados de los del coach.
  const [myPrograms, setMyPrograms] = useState<MyProgram[]>([]);
  useEffect(() => {
    if (!student) return;
    setMyPrograms(loadMyPrograms(student.id));
    // Y traemos de la nube los que no estén en este dispositivo (best-effort).
    let cancelled = false;
    hydrateMyPrograms(student.id).then((merged) => {
      if (!cancelled && merged) setMyPrograms(merged);
    });
    return () => {
      cancelled = true;
    };
  }, [student]);
  const atProgramLimit = myPrograms.length >= MAX_OWN_PROGRAMS;

  // ── Plan ACTIVO ────────────────────────────────────────────────────────────
  // Un solo plan manda a la vez: el del coach (default) o uno propio. Toda la
  // pantalla se ordena alrededor de esa decisión, para que el alumno nunca tenga
  // dudas sobre qué le toca entrenar.
  const sid = student?.id ?? "";
  const [plan, setPlan] = useState<ActivePlan>(() =>
    sid ? loadActivePlan(sid) : { type: "coach" }
  );
  useEffect(() => {
    if (sid) setPlan(loadActivePlan(sid));
  }, [sid]);

  // Si el plan guardado apunta a un programa que ya no existe, se cae al coach.
  const activeOwn =
    plan.type === "own" ? myPrograms.find((p) => p.id === plan.programId) ?? null : null;
  const ownNext = activeOwn ? nextProgramDay(sid, activeOwn) : null;

  // Elegir un programa propio como plan activo (desde "Mis programas").
  const pickOwnPlan = (p: MyProgram, e: React.MouseEvent) => {
    e.stopPropagation(); // no debe navegar al detalle de la card
    setActivePlan(sid, { type: "own", programId: p.id });
    setPlan({ type: "own", programId: p.id });
    toast.success(`"${p.name || "Programa"}" es ahora tu plan`);
  };

  const backToCoachPlan = () => {
    clearActivePlan(sid);
    setPlan({ type: "coach" });
    toast.success("Volviste al plan de tu coach");
  };

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

  // Eliminar un programa propio (confirmación no bloqueante vía toast).
  const handleDeleteProgram = (p: MyProgram) => {
    toast(`¿Eliminar "${p.name || "programa"}"?`, {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: () => {
          if (!student) return;
          deleteMyProgram(student.id, p.id);
          setMyPrograms((list) => list.filter((x) => x.id !== p.id));
          toast.success("Programa eliminado");
        },
      },
    });
  };

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

          {/* Nada que mostrar: ni rutinas del coach ni un plan propio activo. */}
          {!isLoading && !error && assignments.length === 0 && !ownNext && (
            <div className="rounded-3xl card-elevated p-8 text-center">
              <Dumbbell className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-foreground">Sin rutinas todavía</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tu coach aún no te asignó una rutina. Podés armar tu propio programa acá abajo.
              </p>
            </div>
          )}

          {/* ══ BLOQUE 1 · HOY ══════════════════════════════════════════════
              El protagonista de la pantalla: lo único que hay que hacer hoy,
              venga del plan del coach o del plan propio activo. */}
          {!isLoading && !error && (ownNext || heroSession) && (
            <motion.div variants={fadeUp} className="space-y-3">
              <div className="flex items-center gap-2 px-0.5">
                <span className="accent-bar" />
                <h3 className="text-sm font-black text-foreground tracking-tight">Hoy</h3>
              </div>

              {ownNext && activeOwn ? (
                <OwnPlanCard program={activeOwn} day={ownNext.day} index={ownNext.index} />
              ) : (
                heroSession && (
                  <TodaySessionHero
                    variant={heroVariant}
                    label={heroLabel}
                    session={heroSession}
                    onStart={startSession}
                    onView={viewRoutine}
                    done={sessionDone}
                    onToggleDone={() => toggle(doneKey)}
                  />
                )
              )}
            </motion.div>
          )}

          {/* ══ BLOQUE 2 · MI PLAN ══════════════════════════════════════════
              El plan que manda hoy, con su detalle. Solo uno a la vez: o el del
              coach (con su calendario y sus rutinas) o el propio del alumno. */}
          {!isLoading && !error && (activeOwn || assignments.length > 0) && (
            <motion.div variants={fadeUp} className="space-y-3">
              <div className="flex items-center gap-2 px-0.5">
                <span className="accent-bar" />
                <h3 className="text-sm font-black text-foreground tracking-tight">Mi plan</h3>
              </div>

              {/* Línea sutil: qué plan está mandando ahora mismo. */}
              <div className="flex items-center justify-between gap-3 px-0.5">
                <p className="text-[11px] text-muted-foreground truncate">
                  {activeOwn
                    ? `Tu plan: ${activeOwn.name || "Programa sin nombre"}`
                    : "Plan de tu coach"}
                </p>
                {activeOwn && assignments.length > 0 && (
                  <button
                    type="button"
                    onClick={backToCoachPlan}
                    className="text-[11px] font-bold text-primary px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors shrink-0"
                  >
                    Volver al plan de mi coach
                  </button>
                )}
              </div>

              {activeOwn ? (
                <>
                  {/* Card compacta del programa propio activo */}
                  <div className="rounded-2xl card-elevated p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                        <PencilRuler className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-foreground truncate">
                          {activeOwn.name || "Programa sin nombre"}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {activeOwn.days.length}{" "}
                          {activeOwn.days.length === 1 ? "día" : "días"}
                          {activeOwn.weeks ? ` · ${activeOwn.weeks} sem` : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/programa/${activeOwn.id}`)}
                      className="w-full inline-flex items-center justify-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      Ver el programa completo <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Los días del programa: rotación, no calendario. */}
                  {activeOwn.days.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {activeOwn.days.map((d, i) => (
                        <div
                          key={d.id}
                          className="rounded-2xl card-elevated p-4 flex items-center gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <p className="text-sm font-black text-foreground truncate">
                                {d.name || `Día ${i + 1}`}
                              </p>
                              {ownNext?.day.id === d.id && (
                                <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-primary-foreground bg-gradient-primary rounded-full px-2 py-0.5">
                                  Te toca
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">
                              Día {i + 1} de {activeOwn.days.length} · {d.exercises.length}{" "}
                              {d.exercises.length === 1 ? "ejercicio" : "ejercicios"}
                            </p>
                          </div>
                          <button
                            type="button"
                            aria-label={`Entrenar ${d.name || `día ${i + 1}`}`}
                            onClick={() =>
                              navigate(`/programa/${activeOwn.id}/dia/${d.id}/entrenar`)
                            }
                            className="shrink-0 px-3 py-2 rounded-xl bg-primary/10 border border-primary/25 text-primary text-xs font-bold hover:bg-primary/15 transition-colors"
                          >
                            Entrenar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* ── Programa activo del coach ── */}
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
                          <h3 className="text-sm font-black text-foreground tracking-tight">
                            De tu coach
                          </h3>
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
                            <AlumnoRoutineCard
                              key={assignment.id}
                              assignment={assignment}
                              index={index}
                            />
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
            </motion.div>
          )}

          {/* ══ BLOQUE 3 · EXPLORAR ═════════════════════════════════════════
              Todo lo que NO es el plan de hoy: programas propios, entreno libre
              y templates. Siempre disponible, con o sin coach. */}
          {!isLoading && !error && (
            <>
              <motion.div variants={fadeUp} className="flex items-center gap-2 px-0.5">
                <span className="accent-bar" />
                <h3 className="text-sm font-black text-foreground tracking-tight">Explorar</h3>
              </motion.div>

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
                  {!atProgramLimit && (
                    <button
                      onClick={() => navigate("/programas/nuevo")}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-primary px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Crear
                    </button>
                  )}
                </div>

                {/* Contador de programas propios (límite del plan) */}
                <div className="rounded-2xl card-elevated px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-primary tabular-nums leading-none">
                      {myPrograms.length}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground tabular-nums leading-none">
                      /{MAX_OWN_PROGRAMS}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                      Programas activos
                    </p>
                    {atProgramLimit && (
                      <p className="text-[11px] text-muted-foreground mt-1 leading-none">
                        Eliminá uno para crear otro.
                      </p>
                    )}
                  </div>
                </div>

                {myPrograms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {myPrograms.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-2xl card-elevated p-4 flex items-start gap-2"
                      >
                        <button
                          onClick={() => navigate(`/programa/${p.id}`)}
                          className="flex items-center gap-2 flex-1 min-w-0 text-left active:opacity-70"
                        >
                          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                            <PencilRuler className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-foreground truncate">
                              {p.name || "Programa sin nombre"}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {p.days.length} {p.days.length === 1 ? "día" : "días"}/sem
                              {p.weeks ? ` · ${p.weeks} sem` : ""}
                              {p.origin === "template" ? " · template" : ""}
                            </p>
                          </div>
                        </button>
                        <div className="flex items-center gap-0.5 shrink-0 -mr-1">
                          {/* Elegirlo como plan activo (o marcar que ya lo es). */}
                          {isOwnPlanActive(plan, p.id) ? (
                            <span
                              aria-label="Es tu plan activo"
                              title="Es tu plan activo"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-primary bg-primary/10"
                            >
                              <Check className="w-4 h-4" />
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => pickOwnPlan(p, e)}
                              aria-label="Usar como mi plan"
                              title="Usar como mi plan"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            >
                              <Target className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => navigate(`/programa/${p.id}/editar`)}
                            aria-label="Editar programa"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProgram(p)}
                            aria-label="Eliminar programa"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
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
