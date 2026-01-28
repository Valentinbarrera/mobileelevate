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
import BottomNav from "@/components/home/BottomNav";
import LoadingSpinner from "@/components/ui/loading-spinner";
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
  const displayName = userName.split(' ')[0]; // First name only

  // Get today's status
  const todayStatus = todayRoutineDay 
    ? `Hoy: ${todayRoutineDay.name}` 
    : "¡Día de descanso activo!";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-background pb-24"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <Header userName={displayName} streakDays={weeklyStats.streak} />
      
      <motion.div variants={fadeUp}>
        <Greeting 
          userName={displayName} 
          todayStatus={todayStatus}
        />
      </motion.div>

      {/* Progress Upload Card */}
      <motion.div variants={fadeUp}>
        <ProgressUploadCard />
      </motion.div>

      {/* Main Workout Card - Show Coach routine if available */}
      {isAuthenticated && todayRoutineDay && activeRoutine ? (
        <motion.div variants={fadeUp}>
          <CoachWorkoutCard 
            routineDay={todayRoutineDay} 
            routineInfo={activeRoutine} 
          />
        </motion.div>
      ) : isAuthenticated && !todayRoutineDay ? (
        <motion.div variants={fadeUp}>
          <RestDayCard />
        </motion.div>
      ) : (
        <WorkoutCard 
          label="Entrenamiento del Día"
          duration="45 MIN"
          title="Explosive Power"
          intensity="Alta"
          imageUrl={workoutHero}
          onStart={() => navigate("/workout/1")}
        />
      )}
      
      {/* Level & XP */}
      <motion.div variants={fadeUp}>
        <LevelProgress 
          level={userProgress.level}
          currentXP={userProgress.currentXP}
          targetXP={userProgress.targetXP}
          badge={userProgress.badge}
        />
      </motion.div>

      {/* Weekly Progress */}
      <motion.div variants={fadeUp}>
        <WeeklyProgress 
          completedDays={weeklyStats.completedWorkouts} 
          totalDays={weeklyStats.totalWorkouts} 
        />
      </motion.div>
      
      {/* Active Programs */}
      <motion.div variants={fadeUp}>
        <ActivePrograms programs={programs} />
      </motion.div>
      
      {/* Nutrition */}
      <motion.div variants={fadeUp}>
        <NutritionSection 
          targetKcal={2500}
          currentPercent={74}
          protein={{ current: 142, target: 180 }}
          carbs={{ current: 210, target: 280 }}
          nextMeal="Salmon & Quinoa Bowl"
        />
      </motion.div>
      
      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <QuickActions />
      </motion.div>
      
      {/* Motivation */}
      <motion.div variants={fadeUp}>
        <MotivationCard message={coachMessage} />
      </motion.div>
      
      <BottomNav />
    </motion.div>
  );
};

export default Index;
