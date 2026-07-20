import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RefreshCw, GraduationCap, ChevronRight, Dumbbell } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/home/Header";
import Greeting from "@/components/home/Greeting";
import CoachWorkoutCard from "@/components/home/CoachWorkoutCard";
import OwnPlanCard from "@/components/home/OwnPlanCard";
import { loadActivePlan, nextProgramDay } from "@/lib/activePlan";
import { getMyProgram, loadMyPrograms } from "@/lib/myPrograms";
import RestDayCard from "@/components/home/RestDayCard";
import WeeklyGoalCard from "@/components/home/WeeklyGoalCard";
import PlanDaysCarousel from "@/components/home/PlanDaysCarousel";
import CoachCard from "@/components/home/CoachCard";
import QuickActions from "@/components/home/QuickActions";
import RescheduleSheet from "@/components/home/RescheduleSheet";
import ViewAllRoutinesLink from "@/components/home/ViewAllRoutinesLink";
import AppShell from "@/components/layout/AppShell";
import HomeSkeleton from "@/components/home/HomeSkeleton";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useCoachHomeData } from "@/hooks/useCoachHomeData";
import { useCoachWeeklyProgress } from "@/hooks/useCoachWorkoutSession";
import { useProgressData } from "@/hooks/useProgressData";
import { useSessionOverrides } from "@/hooks/useSessionOverrides";
import { localISODate } from "@/lib/routineSession";
import { hasLoggedToday } from "@/lib/workoutLog";
import { isOnboardingComplete } from "@/lib/onboarding";
import { useAuthContext } from "@/contexts/AuthContext";
import { useIsDesktop } from "@/hooks/use-media-query";

const Index = () => {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const { student, user, isAdminMode } = useAuthContext();
  const {
    activeRoutine,
    todayRoutineDay,
    nextRoutineDay,
    nextSessionDate,
    allDays,
    loading: coachLoading
  } = useCoachHomeData();
  const { getWeeklyProgress } = useCoachWeeklyProgress();
  const { currentStreak, sessionsThisWeek, personalBestTonnage } = useProgressData();
  const [completedDates, setCompletedDates] = useState<string[]>([]);

  const overrideSid = student?.id || (isAdminMode ? "admin" : "anon");
  const { setForDate } = useSessionOverrides(overrideSid);
  const [showReschedule, setShowReschedule] = useState(false);

  // Plan activo: el del coach por defecto, o uno propio si el alumno lo eligió.
  // Se relee en cada montaje de Inicio, que es cuando puede haber cambiado
  // (se activa desde el detalle del programa).
  // Programas propios disponibles (los terminados quedan archivados, no acá).
  const myProgramsOpen = useMemo(
    () => loadMyPrograms(overrideSid).filter((p) => !p.completedAt),
    [overrideSid]
  );

  const ownPlanNext = useMemo(() => {
    const plan = loadActivePlan(overrideSid);
    if (plan.type !== "own") return null;
    const program = getMyProgram(overrideSid, plan.programId);
    if (!program) return null;
    const next = nextProgramDay(overrideSid, program);
    return next ? { program, day: next.day, index: next.index } : null;
  }, [overrideSid]);

  // Onboarding obligatorio la 1ª vez: si es alumno real y no completó el
  // cuestionario, lo llevamos una vez por sesión (flag para no atraparlo si sale).
  useEffect(() => {
    const isReal = !!student?.id && !isAdminMode;
    if (!isReal) return;
    if (isOnboardingComplete(student.id)) return;
    if (sessionStorage.getItem("elevate_onboarding_prompted")) return;
    sessionStorage.setItem("elevate_onboarding_prompted", "1");
    navigate("/onboarding");
  }, [student, isAdminMode, navigate]);

  const today = localISODate();
  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return localISODate(d);
  })();

  const applySwap = (dayId: string) => {
    setForDate(today, dayId);
    setShowReschedule(false);
    toast.success("Listo, cambiamos tu día de hoy");
  };
  const applyRest = () => {
    setForDate(today, "rest");
    setShowReschedule(false);
    toast.success("Hoy queda como descanso");
  };
  const applyReset = () => {
    setForDate(today, null);
    setShowReschedule(false);
    toast.success("Volviste al plan del coach");
  };
  const moveTomorrow = () => {
    if (todayRoutineDay) {
      setForDate(today, "rest");
      setForDate(tomorrow, todayRoutineDay.id);
      toast.success("Tu entreno pasó a mañana");
    }
    setShowReschedule(false);
  };

  useEffect(() => {
    getWeeklyProgress().then(result => {
      const dates = (result.sessions || []).map((s: { date: string }) => s.date);
      setCompletedDates(dates);
    });
  }, [getWeeklyProgress]);

  const userName = student?.full_name || user?.email?.split('@')[0] || "Atleta";
  const displayName = userName.split(' ')[0];

  // Línea contextual y motivadora (complementa al héroe del entreno de hoy)
  const weeklyGoal = allDays.length || 5;
  const remaining = Math.max(0, weeklyGoal - (sessionsThisWeek || 0));
  const contextLine =
    remaining > 0
      ? `Te faltan ${remaining} ${remaining === 1 ? "entreno" : "entrenos"} para tu meta`
      : "¡Meta semanal cumplida! 🔥";

  // ¿Entreno de hoy ya empezado? → CTA "Continuar"
  const todayExerciseIds = todayRoutineDay?.exercises.map((e) => e.id) ?? [];
  const inProgress = hasLoggedToday(overrideSid, todayExerciseIds, today);

  if (coachLoading) {
    return (
      <AppShell>
        <HomeSkeleton />
      </AppShell>
    );
  }

  // ── Fragmentos reutilizables (mismo elemento, se monta en UN solo layout) ──
  const greeting = <Greeting userName={displayName} contextLine={contextLine} />;

  const weeklyGoalCard = (
    <WeeklyGoalCard
      completedDates={completedDates}
      goal={weeklyGoal}
      streak={currentStreak}
      bestTonnage={personalBestTonnage}
    />
  );

  const hasWorkoutToday = !!(todayRoutineDay && activeRoutine);

  // Héroe: el entreno de hoy (o el estado de descanso). Es el protagonista.
  // Si el alumno eligió un programa PROPIO como plan activo, manda ese: es la
  // respuesta a "¿qué entreno?" y no puede haber dos. Si el programa se borró,
  // `ownPlanProgram` queda null y se vuelve solo al plan del coach.
  const heroCard = ownPlanNext ? (
    <motion.div variants={fadeUp}>
      <OwnPlanCard
        program={ownPlanNext.program}
        day={ownPlanNext.day}
        index={ownPlanNext.index}
      />
    </motion.div>
  ) : hasWorkoutToday ? (
    <motion.div variants={fadeUp}>
      <CoachWorkoutCard
        routineDay={todayRoutineDay!}
        routineInfo={activeRoutine!}
        inProgress={inProgress}
      />
    </motion.div>
  ) : (
    <motion.div variants={fadeUp}>
      <RestDayCard
        nextDay={nextRoutineDay}
        nextDate={nextSessionDate}
        routineId={activeRoutine?.id}
      />
    </motion.div>
  );

  // Link secundario, agrupado bajo el héroe (solo si hoy hay entreno)
  const heroExtras = !ownPlanNext && hasWorkoutToday && (
    <motion.div variants={fadeUp}>
      <ViewAllRoutinesLink />
    </motion.div>
  );

  // Reprogramar es del calendario del coach: no aplica a un plan propio (rota).
  const rescheduleBtn = !ownPlanNext && activeRoutine && allDays.length > 0 && (
    <motion.button
      variants={fadeUp}
      onClick={() => setShowReschedule(true)}
      className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground active:text-foreground hover:text-foreground py-1"
    >
      <RefreshCw className="w-4 h-4" />
      Reprogramar el día de hoy
    </motion.button>
  );

  const quickActions = <QuickActions />;

  // Card destacada: entrenamiento autoguiado con la app (aparte del plan del coach)
  // Modo libre: además del acceso, lista los programas que el alumno se armó.
  // Antes era solo un link a Entrenar y sus programas quedaban escondidos a dos
  // toques; acá los ve y los empieza directo.
  const trainWithElevateCard = (
    <motion.div
      variants={fadeUp}
      className="card-elevated rounded-2xl overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-primary/25"
    >
      <button
        type="button"
        onClick={() => navigate("/routines")}
        className="w-full px-4 py-4 flex items-center gap-4 active:scale-[0.99] transition-transform text-left"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
          <Dumbbell className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black uppercase tracking-widest text-primary mb-0.5">
            Modo libre
          </p>
          <p className="text-base font-black text-foreground tracking-tight">
            Entrenar con Elevate
          </p>
          <p className="text-[12px] text-muted-foreground truncate">
            {myProgramsOpen.length
              ? "Tus programas, entreno libre y tu progreso."
              : "Creá tus programas, entrená libre y seguí tu progreso."}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-primary shrink-0" />
      </button>

      {myProgramsOpen.length > 0 ? (
        <div className="px-3 pb-3 space-y-1.5">
          {myProgramsOpen.map((p) => {
            const next = nextProgramDay(overrideSid, p);
            return (
              <div
                key={p.id}
                className="flex items-center gap-2 rounded-xl bg-background/40 border border-white/[0.06] pl-3 pr-1.5 py-2"
              >
                <button
                  type="button"
                  onClick={() => navigate(`/programa/${p.id}`)}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="text-sm font-bold text-foreground truncate">
                    {p.name || "Mi programa"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {p.days.length} {p.days.length === 1 ? "día" : "días"}
                    {next ? ` · te toca ${next.day.name}` : ""}
                  </p>
                </button>
                {next && next.day.exercises.length > 0 && (
                  <button
                    type="button"
                    aria-label={`Entrenar ${next.day.name} de ${p.name || "mi programa"}`}
                    onClick={() => navigate(`/programa/${p.id}/dia/${next.day.id}/entrenar`)}
                    className="shrink-0 h-9 px-3 rounded-lg bg-primary/15 border border-primary/25 text-primary text-xs font-bold active:scale-95 transition-transform"
                  >
                    Entrenar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => navigate("/programas/nuevo")}
            className="w-full py-2.5 rounded-xl border border-dashed border-primary/30 text-xs font-bold text-primary active:scale-[0.99] transition-transform"
          >
            + Crear mi primer programa
          </button>
        </div>
      )}
    </motion.div>
  );

  // Acceso a la sección educativa "Aprendé" (guía de la app + recursos)
  const learnCard = (
    <motion.button
      variants={fadeUp}
      onClick={() => navigate("/aprender")}
      className="w-full card-elevated rounded-2xl px-4 py-3.5 flex items-center gap-3 active:scale-[0.99] transition-transform text-left"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <GraduationCap className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-foreground tracking-tight">Aprendé a usar la app</p>
        <p className="text-[12px] text-muted-foreground truncate">
          Guía, calentamiento, RPE/RIR, calculadora de RM y material del coach
        </p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
    </motion.button>
  );

  const planDays = activeRoutine && allDays.length > 0 && (
    <PlanDaysCarousel
      days={allDays}
      todayId={todayRoutineDay?.id ?? null}
      routineId={activeRoutine.id}
    />
  );

  const coachCard = <CoachCard />;

  const rescheduleSheet = (
    <RescheduleSheet
      open={showReschedule}
      onClose={() => setShowReschedule(false)}
      days={allDays}
      todayId={todayRoutineDay?.id ?? null}
      hasToday={!!todayRoutineDay}
      onSwap={applySwap}
      onRest={applyRest}
      onReset={applyReset}
      onMoveTomorrow={moveTomorrow}
    />
  );

  // ── Desktop: dashboard cockpit (columna principal + rail derecho) ──
  if (isDesktop) {
    return (
      <AppShell>
        <div className="relative min-h-screen bg-background pb-10">
          <motion.div
            className="relative max-w-6xl mx-auto px-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <Header userName={displayName} streakDays={currentStreak} />

            <div className="mt-5">{greeting}</div>

            <div className="mt-6 grid grid-cols-12 gap-6 items-start">
              {/* Columna principal — el héroe del entreno de hoy protagoniza */}
              <div className="col-span-12 xl:col-span-7 space-y-6">
                <div className="space-y-3">
                  {heroCard}
                  {heroExtras}
                  {rescheduleBtn}
                </div>
                {planDays}
              </div>

              {/* Rail derecho — glance: meta, atajos, coach */}
              <div className="col-span-12 xl:col-span-5 space-y-6">
                {weeklyGoalCard}
                {trainWithElevateCard}
                {quickActions}
                {learnCard}
                {coachCard}
              </div>
            </div>

            {rescheduleSheet}
          </motion.div>
        </div>
      </AppShell>
    );
  }

  // ── Mobile: columna única (sin cambios) ──
  return (
    <AppShell>
      <div className="relative min-h-screen bg-background pb-nav lg:pb-10">
        <motion.div
          className="relative"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <Header userName={displayName} streakDays={currentStreak} />

          <div className="max-w-2xl mx-auto px-5 mt-2 space-y-6">
            {/* 1. Saludo contextual + motivador — actúa como título de la página */}
            {greeting}

            {/* 2. ENTRENO DE HOY — el HÉROE / acción principal, protagoniza arriba.
                   Sus links secundarios quedan agrupados debajo, bien pegados. */}
            <div className="space-y-3">
              {heroCard}
              {heroExtras}
              {rescheduleBtn}
            </div>

            {/* 3. Objetivo semanal — resumen tipo dashboard (glance) */}
            {weeklyGoalCard}

            {/* 3b. Entrenar con Elevate — entrenamiento autoguiado (modo libre) */}
            {trainWithElevateCard}

            {/* 4. Accesos rápidos — atajos compactos, no compiten con el héroe */}
            {quickActions}

            {/* 4b. Acceso a la sección educativa "Aprendé" */}
            {learnCard}

            {/* 5. Carrusel del plan */}
            {planDays}

            {/* 6. Card del coach — el diferenciador coach→alumno */}
            {coachCard}
          </div>

          {rescheduleSheet}
        </motion.div>
      </div>
    </AppShell>
  );
};

export default Index;
