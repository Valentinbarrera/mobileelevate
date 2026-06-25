import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/home/Header";
import Greeting from "@/components/home/Greeting";
import CoachWorkoutCard from "@/components/home/CoachWorkoutCard";
import RestDayCard from "@/components/home/RestDayCard";
import WeeklyGoalCard from "@/components/home/WeeklyGoalCard";
import PlanDaysCarousel from "@/components/home/PlanDaysCarousel";
import CoachCard from "@/components/home/CoachCard";
import ViewAllRoutinesLink from "@/components/home/ViewAllRoutinesLink";
import AppShell from "@/components/layout/AppShell";
import HomeSkeleton from "@/components/home/HomeSkeleton";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useCoachHomeData } from "@/hooks/useCoachHomeData";
import { useCoachWeeklyProgress } from "@/hooks/useCoachWorkoutSession";
import { useProgressData } from "@/hooks/useProgressData";
import { useAuthContext } from "@/contexts/AuthContext";

const Index = () => {
  const { student, user } = useAuthContext();
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

  useEffect(() => {
    getWeeklyProgress().then(result => {
      const dates = (result.sessions || []).map((s: { date: string }) => s.date);
      setCompletedDates(dates);
    });
  }, [getWeeklyProgress]);

  const userName = student?.full_name || user?.email?.split('@')[0] || "Atleta";
  const displayName = userName.split(' ')[0];

  const todayStatus = todayRoutineDay
    ? `Hoy: ${todayRoutineDay.name}`
    : "¡Día de descanso activo!";

  if (coachLoading) {
    return (
      <AppShell>
        <HomeSkeleton />
      </AppShell>
    );
  }

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
          {/* 1. Saludo personalizado (hora del día + nombre) */}
          <motion.div variants={fadeUp}>
            <Greeting userName={displayName} todayStatus={todayStatus} />
          </motion.div>

          {/* 2. Progreso semanal — glance con anillo (no es el héroe) */}
          <WeeklyGoalCard
            completedDates={completedDates}
            goal={allDays.length || 5}
            streak={currentStreak}
            bestTonnage={personalBestTonnage}
          />

          {/* 3. ENTRENO DE HOY — el héroe / acción principal */}
          {todayRoutineDay && activeRoutine ? (
            <>
              <motion.div variants={fadeUp}>
                <CoachWorkoutCard routineDay={todayRoutineDay} routineInfo={activeRoutine} />
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
          )}

          {/* 4. Carrusel del plan — surfacea la rutina + variedad visual */}
          {activeRoutine && allDays.length > 0 && (
            <PlanDaysCarousel
              days={allDays}
              todayId={todayRoutineDay?.id ?? null}
              routineId={activeRoutine.id}
            />
          )}

          {/* 5. Card del coach — el diferenciador coach→alumno */}
          <CoachCard />
        </div>
        </motion.div>
      </div>
    </AppShell>
  );
};

export default Index;
