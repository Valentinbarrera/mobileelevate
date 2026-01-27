import { motion } from "framer-motion";
import { Share2, Bell } from "lucide-react";
import BottomNav from "@/components/home/BottomNav";
import FitnessScore from "@/components/progress/FitnessScore";
import WeightTracker from "@/components/progress/WeightTracker";
import WeeklyActivity from "@/components/progress/WeeklyActivity";
import ActivityStreak from "@/components/progress/ActivityStreak";
import PersonalRecords from "@/components/progress/PersonalRecords";
import ProgressPhotoFAB from "@/components/progress/ProgressPhotoFAB";

const mockPRs = [
  {
    id: "1",
    name: "Press de Banca",
    value: "95.0",
    unit: "kg",
    improvedDate: "Hace 2 días",
    icon: "strength" as const,
  },
  {
    id: "2",
    name: "5KM Carrera",
    value: "22:15",
    unit: "min",
    improvedDate: "Hace 1 semana",
    icon: "cardio" as const,
  },
];

const Progress = () => {
  return (
    <motion.div 
      className="min-h-screen bg-background pb-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Estadísticas
            </span>
            <h1 className="text-xl font-bold text-foreground">Tu Progreso</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      <div className="px-5 pt-6 space-y-5">
        {/* Fitness Score */}
        <FitnessScore score={88} />

        {/* Weight & Activity Row */}
        <div className="grid grid-cols-2 gap-4">
          <WeightTracker currentWeight={74.2} trend={-1.2} />
          <WeeklyActivity totalMinutes={345} goalMet={true} />
        </div>

        {/* Activity Streak Calendar */}
        <ActivityStreak 
          currentStreak={12}
          month="Enero"
          year={2026}
          activeDays={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
        />

        {/* Personal Records */}
        <PersonalRecords records={mockPRs} />
      </div>

      {/* Floating Photo Upload Button */}
      <ProgressPhotoFAB />

      {/* Bottom Navigation */}
      <BottomNav />
    </motion.div>
  );
};

export default Progress;
