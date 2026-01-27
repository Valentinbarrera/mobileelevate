import { motion } from "framer-motion";
import { Share2, Bell } from "lucide-react";
import BottomNav from "@/components/home/BottomNav";
import FitnessScore from "@/components/progress/FitnessScore";
import WeightTracker from "@/components/progress/WeightTracker";
import WeeklyActivity from "@/components/progress/WeeklyActivity";
import ActivityStreak from "@/components/progress/ActivityStreak";
import PersonalRecords from "@/components/progress/PersonalRecords";
import ProgressPhotoFAB from "@/components/progress/ProgressPhotoFAB";
import CheckinCTA from "@/components/checkin/CheckinCTA";
import CheckinHistoryCard from "@/components/checkin/CheckinHistoryCard";
import { useCheckins } from "@/hooks/useCheckins";
import { useAuth } from "@/hooks/useAuth";
import { staggerContainer, fadeUp } from "@/lib/animations";

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
  const { user } = useAuth();
  const { checkins } = useCheckins();

  return (
    <motion.div 
      className="min-h-screen bg-background pb-28"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-40 bg-background/98 backdrop-blur-xl border-b border-border/50"
        variants={fadeUp}
      >
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <span className="text-label">Estadísticas</span>
            <h1 className="text-lg font-bold text-foreground">Tu Progreso</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button 
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth touch-target"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
            <motion.button 
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth touch-target"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Bell className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Check-in CTA */}
      {user && (
        <motion.div variants={fadeUp}>
          <CheckinCTA />
        </motion.div>
      )}

      <div className="px-5 pt-5 space-y-4">
        <motion.div variants={fadeUp}>
          <FitnessScore score={88} />
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          <motion.div variants={fadeUp}>
            <WeightTracker currentWeight={74.2} trend={-1.2} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <WeeklyActivity totalMinutes={345} goalMet={true} />
          </motion.div>
        </div>

        <motion.div variants={fadeUp}>
          <ActivityStreak 
            currentStreak={12}
            month="Enero"
            year={2026}
            activeDays={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <PersonalRecords records={mockPRs} />
        </motion.div>

        {/* Check-in History */}
        {user && checkins.length > 0 && (
          <motion.div variants={fadeUp}>
            <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              Historial de Check-ins
            </h3>
            <div className="space-y-3">
              {checkins.slice(0, 3).map((checkin, index) => (
                <CheckinHistoryCard key={checkin.id} checkin={checkin} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <ProgressPhotoFAB />
      <BottomNav />
    </motion.div>
  );
};

export default Progress;
