import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/home/Header";
import Greeting from "@/components/home/Greeting";
import CoachWorkoutCard from "@/components/home/CoachWorkoutCard";
import RestDayCard from "@/components/home/RestDayCard";
import WeeklyProgress from "@/components/home/WeeklyProgress";
import ViewAllRoutinesLink from "@/components/home/ViewAllRoutinesLink";
import AppShell from "@/components/layout/AppShell";
import HomeSkeleton from "@/components/home/HomeSkeleton";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useCoachHomeData } from "@/hooks/useCoachHomeData";
import { useCoachWeeklyProgress } from "@/hooks/useCoachWorkoutSession";
import { useProgressData } from "@/hooks/useProgressData";
import { useAuthContext } from "@/contexts/AuthContext";

const Index = () => {
  const { student } = useAuthContext();
  const {
    activeRoutine,
    todayRoutineDay,
    allDays,
    loading: coachLoading
  } = useCoachHomeData();
  const { getWeeklyProgress } = useCoachWeeklyProgress();
  const { currentStreak } = useProgressData();
  const [completedDates, setCompletedDates] = useState<string[]>([]);

  useEffect(() => {
    getWeeklyProgress().then(result => {
      const dates = (result.sessions || []).map((s: { date: string }) => s.date);
      setCompletedDates(dates);
    });
  }, [getWeeklyProgress]);

  const userName = student?.full_name || "Atleta";
  const displayName = userName.split(' ')[0];

  const todayStatus = todayRoutineDay
    ? `Hoy: ${todayRoutineDay.name}`
    : "¡Día de descanso activo!";

  if (coachLoading) {
    return <HomeSkeleton />;
  }

  return (
    <AppShell>
      <motion.div
        className="min-h-screen bg-background pb-32 lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <Header userName={displayName} streakDays={currentStreak} />

        <div className="max-w-2xl mx-auto">
          {/* === HERO ZONE === */}
          <div className="px-5 space-y-4 mt-2">
            <motion.div variants={fadeUp}>
              <Greeting userName={displayName} todayStatus={todayStatus} />
            </motion.div>
          </div>

          {/* === PRIMARY ACTION: Today's Workout === */}
          <div className="px-5 mt-8">
            {todayRoutineDay && activeRoutine ? (
              <>
                <motion.div variants={fadeUp}>
                  <CoachWorkoutCard routineDay={todayRoutineDay} routineInfo={activeRoutine} />
                </motion.div>
                <motion.div variants={fadeUp} className="mt-3">
                  <ViewAllRoutinesLink />
                </motion.div>
              </>
            ) : (
              <motion.div variants={fadeUp}>
                <RestDayCard />
              </motion.div>
            )}
          </div>

          {/* === STATS ZONE === */}
          <div className="px-5 mt-8 space-y-4">
            <motion.div variants={fadeUp}>
              <WeeklyProgress
                completedDates={completedDates}
                totalDays={allDays.length || 5}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AppShell>
  );
};

export default Index;
