import Header from "@/components/home/Header";
import Greeting from "@/components/home/Greeting";
import ProgressUploadCard from "@/components/home/ProgressUploadCard";
import WorkoutCard from "@/components/home/WorkoutCard";
import MetricsSection from "@/components/home/MetricsSection";
import ActivePrograms from "@/components/home/ActivePrograms";
import NutritionSection from "@/components/home/NutritionSection";
import LevelProgress from "@/components/home/LevelProgress";
import WeeklyProgress from "@/components/home/WeeklyProgress";
import QuickActions from "@/components/home/QuickActions";
import MotivationCard from "@/components/home/MotivationCard";
import BottomNav from "@/components/home/BottomNav";

import workoutHero from "@/assets/workout-hero.jpg";
import programShred from "@/assets/program-shred.jpg";
import programZen from "@/assets/program-zen.jpg";

const Index = () => {
  const programs = [
    { id: "1", title: "6-Week Shred", imageUrl: programShred, label: "Siguiente sesión" },
    { id: "2", title: "Zen Mode", imageUrl: programZen },
  ];

  const handleStartWorkout = () => {
    console.log("Starting workout...");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header userName="Camila" streakDays={12} />
      
      <Greeting userName="Camila" />
      
      <ProgressUploadCard />
      
      <WorkoutCard 
        label="Daily Focus"
        duration="45 MIN"
        title="Explosive Power"
        imageUrl={workoutHero}
        onStart={handleStartWorkout}
      />
      
      <MetricsSection />
      
      <ActivePrograms programs={programs} />
      
      <NutritionSection 
        targetKcal={2500}
        currentPercent={74}
        protein={{ current: 142, target: 180 }}
        carbs={{ current: 210, target: 280 }}
        nextMeal="Salmon & Quinoa Bowl"
      />
      
      <LevelProgress 
        level={14}
        currentXP={1250}
        targetXP={2000}
        badge="Elite Athlete Status"
      />
      
      <WeeklyProgress completedDays={3} totalDays={5} />
      
      <QuickActions />
      
      <MotivationCard message="No pares ahora. Vas mejor de lo que creés." />
      
      <BottomNav />
    </div>
  );
};

export default Index;
