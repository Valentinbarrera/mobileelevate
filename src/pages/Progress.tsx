import { motion } from "framer-motion";
import { Share2, Bell, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/home/BottomNav";
import FitnessScore from "@/components/progress/FitnessScore";
import WeightTracker from "@/components/progress/WeightTracker";
import WeeklyActivity from "@/components/progress/WeeklyActivity";
import ActivityStreak from "@/components/progress/ActivityStreak";
import PersonalRecords from "@/components/progress/PersonalRecords";
import ProgressPhotoFAB from "@/components/progress/ProgressPhotoFAB";
import CheckinCTA from "@/components/checkin/CheckinCTA";
import CheckinHistoryCard from "@/components/checkin/CheckinHistoryCard";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useCheckins } from "@/hooks/useCheckins";
import { useAuth } from "@/hooks/useAuth";
import { useProgressData } from "@/hooks/useProgressData";
import { staggerContainer, fadeUp } from "@/lib/animations";

const Progress = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkins } = useCheckins();
  const { 
    personalRecords, 
    fitnessScore, 
    currentWeight, 
    weightTrend,
    totalMinutesThisWeek,
    activeDaysThisMonth,
    currentStreak,
    loading 
  } = useProgressData();

  const currentMonth = new Date().toLocaleString('es-AR', { month: 'long' });
  const currentYear = new Date().getFullYear();

  // Format PRs for display component
  const formattedPRs = personalRecords.slice(0, 5).map(pr => ({
    id: pr.id,
    name: pr.name,
    value: pr.value,
    unit: pr.unit,
    improvedDate: pr.improvedDate,
    icon: pr.icon,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
              <Filter className="w-5 h-5" />
            </motion.button>
            <motion.button 
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth touch-target"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Share2 className="w-5 h-5" />
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
          <FitnessScore score={fitnessScore || 50} />
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          <motion.div variants={fadeUp}>
            <WeightTracker 
              currentWeight={currentWeight || 70} 
              trend={weightTrend} 
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <WeeklyActivity 
              totalMinutes={totalMinutesThisWeek} 
              goalMet={totalMinutesThisWeek >= 150} 
            />
          </motion.div>
        </div>

        <motion.div variants={fadeUp}>
          <ActivityStreak 
            currentStreak={currentStreak}
            month={currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}
            year={currentYear}
            activeDays={activeDaysThisMonth}
          />
        </motion.div>

        {formattedPRs.length > 0 && (
          <motion.div variants={fadeUp}>
            <PersonalRecords records={formattedPRs} />
          </motion.div>
        )}

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
