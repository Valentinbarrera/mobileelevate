import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import SummaryHeader from "@/components/summary/SummaryHeader";
import SummaryStats from "@/components/summary/SummaryStats";
import SummaryAchievements from "@/components/summary/SummaryAchievements";
import SummaryActions from "@/components/summary/SummaryActions";
import SummaryMotivation from "@/components/summary/SummaryMotivation";
import { useProgressData } from "@/hooks/useProgressData";
import { toast } from "sonner";
import Confetti from "@/components/summary/Confetti";

export interface WorkoutSummaryData {
  workoutName: string;
  duration: number; // in seconds
  exercisesCompleted: number;
  totalExercises: number;
  setsCompleted: number;
  totalSets: number;
  caloriesBurned: number;
  totalVolume?: number;
}

const WorkoutSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfetti] = useState(true);
  const { currentStreak, personalBestTonnage } = useProgressData();

  // Redirect to home if accessed directly without completing a workout
  const summaryData: WorkoutSummaryData | null = location.state?.summaryData || null;

  useEffect(() => {
    if (!summaryData) {
      navigate("/", { replace: true });
    }
  }, [summaryData, navigate]);

  if (!summaryData) return null;

  const handleShare = async () => {
    const shareData = {
      title: "¡Entrenamiento completado! 💪",
      text: `Acabo de completar ${summaryData.workoutName} - ${Math.floor(summaryData.duration / 60)} minutos, ${summaryData.caloriesBurned} kcal quemadas!`,
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (import.meta.env.DEV) console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(shareData.text);
      toast.success("Texto copiado al portapapeles");
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {showConfetti && <Confetti />}

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <SummaryHeader workoutName={summaryData.workoutName} />

        {/* Stats Grid */}
        <SummaryStats
          duration={summaryData.duration}
          exercisesCompleted={summaryData.exercisesCompleted}
          setsCompleted={summaryData.setsCompleted}
          caloriesBurned={summaryData.caloriesBurned}
        />

        {/* Achievements */}
        <SummaryAchievements
          isPersonalBest={
            !!summaryData.totalVolume &&
            !!personalBestTonnage &&
            summaryData.totalVolume > personalBestTonnage
          }
          completionRate={(summaryData.exercisesCompleted / summaryData.totalExercises) * 100}
          currentStreak={currentStreak}
        />

        {/* Motivational Message */}
        <SummaryMotivation />

        {/* Action Buttons */}
        <SummaryActions
          onShare={handleShare}
          onGoHome={() => navigate("/")}
        />
      </div>
    </motion.div>
  );
};

export default WorkoutSummary;
