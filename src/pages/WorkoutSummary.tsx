import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import SummaryHeader from "@/components/summary/SummaryHeader";
import SummaryStats from "@/components/summary/SummaryStats";
import SummaryAchievements from "@/components/summary/SummaryAchievements";
import SummaryActions from "@/components/summary/SummaryActions";
import SummaryMotivation from "@/components/summary/SummaryMotivation";
import { useWorkoutProgress } from "@/hooks/useWorkoutProgress";
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
  const { updateProgress } = useWorkoutProgress();
  
  const [xpGained, setXpGained] = useState(0);
  const [leveledUp, setLeveledUp] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [progressUpdated, setProgressUpdated] = useState(false);
  
  // Get data from navigation state or use defaults
  const summaryData: WorkoutSummaryData = location.state?.summaryData || {
    workoutName: "Piernas y Glúteos",
    duration: 2580, // 43 minutes
    exercisesCompleted: 5,
    totalExercises: 5,
    setsCompleted: 18,
    totalSets: 18,
    caloriesBurned: 320,
  };

  // Update progress when summary loads
  useEffect(() => {
    const updateUserProgress = async () => {
      if (progressUpdated) return;
      
      const result = await updateProgress({
        exercisesCompleted: summaryData.exercisesCompleted,
        totalExercises: summaryData.totalExercises,
        setsCompleted: summaryData.setsCompleted,
        totalSets: summaryData.totalSets,
        durationSeconds: summaryData.duration,
        totalVolume: summaryData.totalVolume,
      });

      if (result.success) {
        setXpGained(result.xpGained);
        setProgressUpdated(true);
        
        if (result.leveledUp && result.newLevel) {
          setLeveledUp(result.newLevel);
          setShowConfetti(true);
          toast.success(`🎉 ¡Subiste a nivel ${result.newLevel}!`, {
            duration: 5000,
          });
        } else {
          toast.success(`+${result.xpGained} XP ganados`, {
            duration: 3000,
          });
        }

        if (result.streakUpdated && result.newStreak && result.newStreak > 1) {
          setTimeout(() => {
            toast.success(`🔥 ¡Racha de ${result.newStreak} días!`, {
              duration: 3000,
            });
          }, 1500);
        }
      }
    };

    updateUserProgress();
  }, [summaryData, updateProgress, progressUpdated]);

  const handleShare = async () => {
    const shareData = {
      title: "¡Entrenamiento completado! 💪",
      text: `Acabo de completar ${summaryData.workoutName} - ${Math.floor(summaryData.duration / 60)} minutos, ${summaryData.caloriesBurned} kcal quemadas! +${xpGained} XP`,
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
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
      {/* Confetti for level up */}
      {showConfetti && <Confetti />}

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header with Animation */}
        <SummaryHeader workoutName={summaryData.workoutName} />

        {/* XP Gained Display */}
        {xpGained > 0 && (
          <motion.div 
            className="mx-5 mb-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <div className="bg-gradient-to-r from-primary/20 to-amber-500/20 border border-primary/30 rounded-2xl p-4 flex items-center justify-center gap-3">
              <span className="text-3xl">⭐</span>
              <div className="text-center">
                <p className="text-2xl font-black text-primary">+{xpGained} XP</p>
                {leveledUp && (
                  <p className="text-sm text-amber-500 font-semibold">¡Nivel {leveledUp} alcanzado!</p>
                )}
              </div>
              <span className="text-3xl">⭐</span>
            </div>
          </motion.div>
        )}

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
