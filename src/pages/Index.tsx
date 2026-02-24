import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/home/Header";
import Greeting from "@/components/home/Greeting";
import CoachWorkoutCard from "@/components/home/CoachWorkoutCard";
import RestDayCard from "@/components/home/RestDayCard";
import WeeklyProgress from "@/components/home/WeeklyProgress";
import ViewAllRoutinesLink from "@/components/home/ViewAllRoutinesLink";
import BottomNav from "@/components/home/BottomNav";
import HomeSkeleton from "@/components/home/HomeSkeleton";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useCoachHomeData } from "@/hooks/useCoachHomeData";
import { useAuthContext } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { student, isAuthenticated } = useAuthContext();
  const {
    activeRoutine,
    todayRoutineDay,
    allDays,
    loading: coachLoading
  } = useCoachHomeData();

  const userName = student?.full_name || "Atleta";
  const displayName = userName.split(' ')[0];

  const todayStatus = todayRoutineDay
    ? `Hoy: ${todayRoutineDay.name}`
    : "¡Día de descanso activo!";

  if (coachLoading) {
    return <HomeSkeleton />;
  }

  return (
    <motion.div
      className="min-h-screen bg-background pb-32"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <Header userName={displayName} streakDays={0} />

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
            completedDays={0}
            totalDays={allDays.length || 5}
          />
        </motion.div>
      </div>

      <BottomNav />
    </motion.div>
  );
};

export default Index;
