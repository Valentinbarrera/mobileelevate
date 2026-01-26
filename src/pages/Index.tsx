import { motion } from "framer-motion";
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

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const Index = () => {
  const programs = [
    { id: "1", title: "6-Week Shred", imageUrl: programShred, label: "Siguiente sesión" },
    { id: "2", title: "Zen Mode", imageUrl: programZen },
  ];

  const handleStartWorkout = () => {
    console.log("Starting workout...");
  };

  return (
    <motion.div 
      className="min-h-screen bg-background pb-24"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      <motion.div variants={fadeUp} transition={{ duration: 0.3 }}>
        <Header userName="Camila" streakDays={12} />
      </motion.div>
      
      <motion.div variants={fadeUp} transition={{ duration: 0.3, delay: 0.05 }}>
        <Greeting userName="Camila" />
      </motion.div>
      
      <motion.div variants={fadeUp} transition={{ duration: 0.4, delay: 0.1 }}>
        <ProgressUploadCard />
      </motion.div>
      
      <motion.div variants={fadeUp} transition={{ duration: 0.4, delay: 0.15 }}>
        <WorkoutCard 
          label="Daily Focus"
          duration="45 MIN"
          title="Explosive Power"
          imageUrl={workoutHero}
          onStart={handleStartWorkout}
        />
      </motion.div>
      
      <motion.div variants={fadeUp} transition={{ duration: 0.4, delay: 0.2 }}>
        <MetricsSection />
      </motion.div>
      
      <motion.div variants={fadeUp} transition={{ duration: 0.4, delay: 0.25 }}>
        <ActivePrograms programs={programs} />
      </motion.div>
      
      <motion.div variants={fadeUp} transition={{ duration: 0.4, delay: 0.3 }}>
        <NutritionSection 
          targetKcal={2500}
          currentPercent={74}
          protein={{ current: 142, target: 180 }}
          carbs={{ current: 210, target: 280 }}
          nextMeal="Salmon & Quinoa Bowl"
        />
      </motion.div>
      
      <motion.div variants={fadeUp} transition={{ duration: 0.4, delay: 0.35 }}>
        <LevelProgress 
          level={14}
          currentXP={1250}
          targetXP={2000}
          badge="Elite Athlete Status"
        />
      </motion.div>
      
      <motion.div variants={fadeUp} transition={{ duration: 0.4, delay: 0.4 }}>
        <WeeklyProgress completedDays={3} totalDays={5} />
      </motion.div>
      
      <motion.div variants={fadeUp} transition={{ duration: 0.4, delay: 0.45 }}>
        <QuickActions />
      </motion.div>
      
      <motion.div variants={fadeUp} transition={{ duration: 0.4, delay: 0.5 }}>
        <MotivationCard message="No pares ahora. Vas mejor de lo que creés." />
      </motion.div>
      
      <BottomNav />
    </motion.div>
  );
};

export default Index;
