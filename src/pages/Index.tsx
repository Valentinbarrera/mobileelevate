import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RefreshCw, GraduationCap, ChevronRight, Dumbbell, Play, LayoutGrid, PenLine } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/home/Header";
import Greeting from "@/components/home/Greeting";
import CoachWorkoutCard from "@/components/home/CoachWorkoutCard";
import OwnPlanCard from "@/components/home/OwnPlanCard";
import { loadActivePlan, nextProgramDay } from "@/lib/activePlan";
import { getMyProgram, loadMyPrograms } from "@/lib/myPrograms";
import RestDayCard from "@/components/home/RestDayCard";
import HeroDaysScroller from "@/components/home/HeroDaysScroller";
import CoachCard from "@/components/home/CoachCard";
import QuickActions from "@/components/home/QuickActions";
import RescheduleSheet from "@/components/home/RescheduleSheet";
import ViewAllRoutinesLink from "@/components/home/ViewAllRoutinesLink";
import AppShell from "@/components/layout/AppShell";
import HomeSkeleton from "@/components/home/HomeSkeleton";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useCoachHomeData } from "@/hooks/useCoachHomeData";
import { useProgressData } from "@/hooks/useProgressData";
import { useSessionOverrides } from "@/hooks/useSessionOverrides";
import { localISODate } from "@/lib/routineSession";
import { hasLoggedToday } from "@/lib/workoutLog";
import { isOnboardingComplete } from "@/lib/onboarding";
import { useAuthContext } from "@/contexts/AuthContext";
import { useIsDesktop } from "@/hooks/use-media-query";

// Límite de programas propios activos (igual que la página Entrenar).
const MAX_OWN_PROGRAMS = 2;

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
  const { currentStreak } = useProgressData();

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

  const userName = student?.full_name || user?.email?.split('@')[0] || "Atleta";
  const displayName = userName.split(' ')[0];

  // Línea motivadora neutra. El objetivo semanal ya NO vive en el Home
  // (se muestra en Progreso); acá va un mensaje según el momento del día.
  const hour = new Date().getHours();
  const contextLine =
    hour < 12
      ? "Un día más para tu mejor versión 💪"
      : hour < 19
        ? "Dale que hoy suma"
        : "Cerrá el día fuerte 🔥";

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
      {allDays.length > 1 ? (
        <HeroDaysScroller
          days={allDays}
          todayId={todayRoutineDay?.id ?? null}
          routineInfo={activeRoutine!}
          inProgress={inProgress}
        />
      ) : (
        <CoachWorkoutCard
          routineDay={todayRoutineDay!}
          routineInfo={activeRoutine!}
          inProgress={inProgress}
        />
      )}
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

  const quickActions = <QuickActions title="Accesos rápidos" />;

  // Card destacada: entrenamiento autoguiado con la app (aparte del plan del coach)
  // Modo libre: además del acceso, lista los programas que el alumno se armó.
  // Antes era solo un link a Entrenar y sus programas quedaban escondidos a dos
  // toques; acá los ve y los empieza directo.
  // Módulo "Tus programas" (modo libre): el programa activo con su CTA grande
  // "Entrenar hoy", el contador X/2 y los caminos para crear otro. Layout
  // inspirado en Lifts, en la identidad naranja de Elevate.
  const atProgramLimit = myProgramsOpen.length >= MAX_OWN_PROGRAMS;

  const trainWithElevateCard = (
    <motion.div variants={fadeUp} className="space-y-3">
      {/* Encabezado de sección */}
      <div className="flex items-center justify-between gap-3 px-0.5">
        <div className="flex items-center gap-2">
          <span className="accent-bar" />
          <h3 className="text-sm font-black text-foreground tracking-tight">Tus programas</h3>
        </div>
        <button
          type="button"
          onClick={() => navigate("/routines")}
          className="flex items-center gap-1 text-xs font-bold text-primary min-h-11 px-2 -mr-2"
        >
          Ver todos
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Programa(s) activo(s): card con CTA "Entrenar hoy" protagonista */}
      {myProgramsOpen.map((p) => {
        const next = nextProgramDay(overrideSid, p);
        return (
          <div
            key={p.id}
            className="card-elevated rounded-2xl p-4 border-primary/20 bg-gradient-to-br from-primary/12 via-primary/[0.03] to-transparent"
          >
            <button
              type="button"
              onClick={() => navigate(`/programa/${p.id}`)}
              className="w-full flex items-center gap-3 text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-black text-foreground tracking-tight truncate">
                  {p.name || "Mi programa"}
                </p>
                <p className="text-[12px] text-muted-foreground truncate">
                  {p.days.length} {p.days.length === 1 ? "día" : "días"}
                  {next ? ` · te toca ${next.day.name}` : ""}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </button>

            {next && next.day.exercises.length > 0 ? (
              <button
                type="button"
                aria-label={`Entrenar hoy: ${next.day.name} de ${p.name || "mi programa"}`}
                onClick={() => navigate(`/programa/${p.id}/dia/${next.day.id}/entrenar`)}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-primary rounded-xl py-3 min-h-12 shadow-lg glow-primary active:scale-[0.99] transition-transform"
              >
                <Play className="w-4 h-4 text-primary-foreground fill-current" />
                <span className="text-primary-foreground font-black text-sm uppercase tracking-wide truncate">
                  Entrenar hoy · {next.day.name}
                </span>
              </button>
            ) : (
              <div className="mt-3 w-full text-center rounded-xl py-3 bg-secondary/50 border border-border text-sm font-semibold text-muted-foreground">
                Este programa todavía no tiene días para entrenar
              </div>
            )}
          </div>
        );
      })}

      {/* Contador X/2 + caminos para crear (estilo Lifts, en naranja) */}
      <div className="card-elevated rounded-2xl p-4">
        <div className="text-center mb-3.5">
          <p className="text-4xl font-black text-primary tabular-nums leading-none">
            {myProgramsOpen.length}
            <span className="text-foreground/30">/{MAX_OWN_PROGRAMS}</span>
          </p>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.18em] mt-1.5">
            Programas activos
          </p>
        </div>

        {atProgramLimit ? (
          <p className="text-center text-xs text-muted-foreground">
            Llegaste al máximo. Terminá o eliminá uno para crear otro.
          </p>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => navigate("/programas/templates")}
              className="w-full flex items-center justify-center gap-2 bg-gradient-primary rounded-xl py-3 min-h-12 shadow-lg active:scale-[0.99] transition-transform"
            >
              <LayoutGrid className="w-4 h-4 text-primary-foreground" />
              <span className="text-primary-foreground font-bold text-sm">Elegí un template</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/programas/nuevo")}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 min-h-12 bg-secondary/60 border border-border text-foreground active:scale-[0.99] transition-transform"
            >
              <PenLine className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm">Diseñá tu propio programa</span>
            </button>
          </div>
        )}
      </div>
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
                {/* Accesos rápidos — pegados al entreno de hoy */}
                {quickActions}
              </div>

              {/* Rail derecho — glance: entrenar libre, aprender, coach */}
              <div className="col-span-12 xl:col-span-5 space-y-6">
                {trainWithElevateCard}
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

            {/* 3. Accesos rápidos — atajos directos, pegados al entreno de hoy */}
            {quickActions}

            {/* 4. Entrenar con Elevate — entrenamiento autoguiado (modo libre) */}
            {trainWithElevateCard}

            {/* 4c. Acceso a la sección educativa "Aprendé" */}
            {learnCard}

            {/* 5. Card del coach — el diferenciador coach→alumno */}
            {coachCard}
          </div>

          {rescheduleSheet}
        </motion.div>
      </div>
    </AppShell>
  );
};

export default Index;
