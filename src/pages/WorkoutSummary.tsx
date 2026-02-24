import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import SummaryHeader from "@/components/summary/SummaryHeader";
import SummaryStats from "@/components/summary/SummaryStats";
import SummaryAchievements from "@/components/summary/SummaryAchievements";
import SummaryActions from "@/components/summary/SummaryActions";
import SummaryMotivation from "@/components/summary/SummaryMotivation";
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

  // Get data from navigation state or use defaults
  const summaryData: WorkoutSummaryData = location.state?.summaryData || {
    workoutName: "Entrenamiento",
    duration: 2580,
    exercisesCompleted: 5,
    totalExercises: 5,
    setsCompleted: 18,
    totalSets: 18,
    caloriesBurned: 320,
  };

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
        console.log("Error sharing:", err);
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

      <div className="relative z-10">
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
          isPersonalBest={summaryData.duration > 2400}
          completionRate={(summaryData.exercisesCompleted / summaryData.totalExercises) * 100}
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
