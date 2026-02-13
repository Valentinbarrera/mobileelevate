import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/home/Header";
import Greeting from "@/components/home/Greeting";
import ProgressUploadCard from "@/components/home/ProgressUploadCard";
import WorkoutCard from "@/components/home/WorkoutCard";
import CoachWorkoutCard from "@/components/home/CoachWorkoutCard";
import RestDayCard from "@/components/home/RestDayCard";
import ActivePrograms from "@/components/home/ActivePrograms";
import NutritionSection from "@/components/home/NutritionSection";
import LevelProgress from "@/components/home/LevelProgress";
import WeeklyProgress from "@/components/home/WeeklyProgress";
import QuickActions from "@/components/home/QuickActions";
import MotivationCard from "@/components/home/MotivationCard";
import ViewAllRoutinesLink from "@/components/home/ViewAllRoutinesLink";
import BottomNav from "@/components/home/BottomNav";
import HomeSkeleton from "@/components/home/HomeSkeleton";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useHomeData } from "@/hooks/useHomeData";
import { useCoachHomeData } from "@/hooks/useCoachHomeData";
import { useCoachAuthContext } from "@/contexts/CoachAuthContext";

import workoutHero from "@/assets/workout-hero.jpg";
import programShred from "@/assets/program-shred.jpg";
import programZen from "@/assets/program-zen.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { student, isAuthenticated } = useCoachAuthContext();
  const { weeklyStats, userProgress, coachMessage, loading: homeLoading } = useHomeData();
  const { 
    activeRoutine, 
    todayRoutineDay, 
    allDays,
    loading: coachLoading 
  } = useCoachHomeData();

  const loading = homeLoading || coachLoading;

  // Build programs from coach data
  const programs = activeRoutine ? [
    { 
      id: activeRoutine.id, 
      title: activeRoutine.name, 
      imageUrl: activeRoutine.imageUrl || programShred, 
      label: "Activo", 
      progress: Math.round((allDays.filter(d => d.dayNumber <= new Date().getDay()).length / allDays.length) * 100) || 0
    },
  ] : [
    { id: "1", title: "6-Week Shred", imageUrl: programShred, label: "Activo", progress: 65 },
  ];

  const userName = student?.name || "Atleta";
  const displayName = userName.split(' ')[0];

  const todayStatus = todayRoutineDay 
    ? `Hoy: ${todayRoutineDay.name}` 
    : "¡Día de descanso activo!";

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <motion.div 
      className="min-h-screen bg-background pb-32"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <Header userName={displayName} streakDays={weeklyStats.streak} />
      
      {/* === HERO ZONE === */}
      <div className="px-5 space-y-4 mt-2">
        <motion.div variants={fadeUp}>
          <Greeting userName={displayName} todayStatus={todayStatus} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <ProgressUploadCard />
        </motion.div>
      </div>

      {/* === PRIMARY ACTION: Today's Workout === */}
      <div className="px-5 mt-8">
        {isAuthenticated && todayRoutineDay && activeRoutine ? (
          <>
            <motion.div variants={fadeUp}>
              <CoachWorkoutCard routineDay={todayRoutineDay} routineInfo={activeRoutine} />
            </motion.div>
            <motion.div variants={fadeUp} className="mt-3">
              <ViewAllRoutinesLink />
            </motion.div>
          </>
        ) : isAuthenticated && !todayRoutineDay ? (
          <motion.div variants={fadeUp}>
            <RestDayCard />
          </motion.div>
        ) : (
          <>
            <WorkoutCard 
              label="Entrenamiento del Día"
              duration="45 MIN"
              title="Explosive Power"
              intensity="Alta"
              imageUrl={workoutHero}
              onStart={() => navigate("/workout/1")}
            />
            <motion.div variants={fadeUp} className="mt-3">
              <ViewAllRoutinesLink />
            </motion.div>
          </>
        )}
      </div>
      
      {/* === STATS ZONE === */}
      <div className="px-5 mt-8 space-y-4">
        <motion.div variants={fadeUp}>
          <LevelProgress 
            level={userProgress.level}
            currentXP={userProgress.currentXP}
            targetXP={userProgress.targetXP}
            badge={userProgress.badge}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <WeeklyProgress 
            completedDays={weeklyStats.completedWorkouts} 
            totalDays={weeklyStats.totalWorkouts} 
          />
        </motion.div>
      </div>
      
      {/* === PROGRAMS === */}
      <motion.div variants={fadeUp} className="mt-8">
        <ActivePrograms programs={programs} />
      </motion.div>
      
      {/* === NUTRITION === */}
      <div className="px-5 mt-8">
        <motion.div variants={fadeUp}>
          <NutritionSection 
            targetKcal={2500}
            currentPercent={74}
            protein={{ current: 142, target: 180 }}
            carbs={{ current: 210, target: 280 }}
            nextMeal="Salmon & Quinoa Bowl"
          />
        </motion.div>
      </div>
      
      {/* === QUICK ACTIONS === */}
      <div className="px-5 mt-8">
        <motion.div variants={fadeUp}>
          <QuickActions />
        </motion.div>
      </div>
      
      {/* === MOTIVATION === */}
      <div className="px-5 mt-8 mb-4">
        <motion.div variants={fadeUp}>
          <MotivationCard message={coachMessage} />
        </motion.div>
      </div>
      
      <BottomNav />
    </motion.div>
  );
};

export default Index;
