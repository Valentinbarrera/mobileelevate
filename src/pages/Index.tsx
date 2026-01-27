import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/home/Header";
import Greeting from "@/components/home/Greeting";
import WorkoutCard from "@/components/home/WorkoutCard";
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
import { useAuth } from "@/hooks/useAuth";

import workoutHero from "@/assets/workout-hero.jpg";
import programShred from "@/assets/program-shred.jpg";
import programZen from "@/assets/program-zen.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { todayWorkout, weeklyStats, userProgress, coachMessage, loading } = useHomeData();

  const programs = [
    { id: "1", title: "6-Week Shred", imageUrl: programShred, label: "Activo", progress: 65 },
    { id: "2", title: "Zen Mode", imageUrl: programZen, progress: 30 },
  ];

  const handleStartWorkout = () => {
    if (todayWorkout) {
      navigate(`/workout/${todayWorkout.id}`);
    }
  };

  const userName = user?.email?.split('@')[0] || "Camila";
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  // Get workout title for today's status
  const todayStatus = todayWorkout 
    ? `Hoy: ${todayWorkout.title}` 
    : "¡Día de descanso activo!";

  if (authLoading || loading) {
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

      {/* Main Workout Card */}
      {todayWorkout ? (
        <WorkoutCard 
          label="Entrenamiento del Día"
          duration={`${todayWorkout.duration_minutes} MIN`}
          title={todayWorkout.title}
          intensity={todayWorkout.intensity}
          imageUrl={todayWorkout.image_url || workoutHero}
          workoutId={todayWorkout.id}
          onStart={handleStartWorkout}
        />
      ) : (
        <WorkoutCard 
          label="Daily Focus"
          duration="45 MIN"
          title="Explosive Power"
          intensity="Alta"
          imageUrl={workoutHero}
          onStart={handleStartWorkout}
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
