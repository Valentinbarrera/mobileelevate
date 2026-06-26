import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/home/Header";
import Greeting from "@/components/home/Greeting";
import CoachWorkoutCard from "@/components/home/CoachWorkoutCard";
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
import { useAuthContext } from "@/contexts/AuthContext";
import { useIsDesktop } from "@/hooks/use-media-query";

const Index = () => {
  const isDesktop = useIsDesktop();
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

  const hero =
    todayRoutineDay && activeRoutine ? (
      <>
        <motion.div variants={fadeUp}>
          <CoachWorkoutCard
            routineDay={todayRoutineDay}
            routineInfo={activeRoutine}
            inProgress={inProgress}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <ViewAllRoutinesLink />
        </motion.div>
      </>
    ) : (
      <motion.div variants={fadeUp}>
        <RestDayCard
          nextDay={nextRoutineDay}
          nextDate={nextSessionDate}
          routineId={activeRoutine?.id}
        />
      </motion.div>
    );

  const rescheduleBtn = activeRoutine && allDays.length > 0 && (
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

            <div className="mt-4">{greeting}</div>

            <div className="mt-6 grid grid-cols-12 gap-6 items-start">
              {/* Columna principal — el héroe del entreno de hoy */}
              <div className="col-span-12 xl:col-span-7 space-y-5">
                {hero}
                {rescheduleBtn}
                {planDays}
              </div>

              {/* Rail derecho — glance: meta, atajos, coach */}
              <div className="col-span-12 xl:col-span-5 space-y-5">
                {weeklyGoalCard}
                {quickActions}
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
      <div className="relative min-h-screen bg-background pb-32 lg:pb-10">
        <motion.div
          className="relative"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <Header userName={displayName} streakDays={currentStreak} />

        <div className="max-w-2xl mx-auto px-5 mt-3 space-y-5">
          {/* 1. Saludo contextual + motivador */}
          {greeting}

          {/* 2. Objetivo semanal — glance arriba */}
          {weeklyGoalCard}

          {/* 3. ENTRENO DE HOY — el HÉROE / acción principal de la pantalla */}
          {hero}

          {/* Reprogramar / cambiar el día de hoy */}
          {rescheduleBtn}

          {/* 4. Accesos rápidos — atajos compactos, no compiten con el héroe */}
          {quickActions}

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
