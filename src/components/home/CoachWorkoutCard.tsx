/**
 * Workout Card that displays the current day's routine from Coach
 */
import { Play, Clock, Zap, Dumbbell, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fadeUp } from "@/lib/animations";
import type { TodayRoutineDay, ActiveRoutineInfo } from "@/hooks/useCoachHomeData";

interface CoachWorkoutCardProps {
  routineDay: TodayRoutineDay;
  routineInfo: ActiveRoutineInfo;
}

const CoachWorkoutCard = ({ routineDay, routineInfo }: CoachWorkoutCardProps) => {
  const navigate = useNavigate();
  
  const handleStart = () => {
    navigate(`/workout/${routineDay.id}`, {
      state: { 
        routineDayId: routineDay.id,
        routineId: routineInfo.id,
        fromCoach: true 
      }
    });
  };

  // Get unique muscle groups from exercises
  const muscleGroups = [...new Set(
    routineDay.exercises
      .map(e => e.muscleGroup)
      .filter(Boolean)
  )].slice(0, 3);

  const intensityLabel = routineInfo.difficulty || "Moderada";

  return (
    <motion.div 
      className="relative rounded-2xl overflow-hidden shadow-xl bg-card border border-border"
      variants={fadeUp}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      {/* Header with gradient */}
      <div className="relative h-52 bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Tags superiores */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg">
              Día {routineDay.dayNumber}
            </span>
            <span className="bg-card/80 backdrop-blur-md text-foreground text-[10px] font-medium px-2 py-1 rounded-lg border border-border">
              {routineInfo.name}
            </span>
          </div>
        </div>

        {/* Center icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]">
          <Dumbbell className="w-28 h-28 text-primary" />
        </div>
        
        {/* Contenido inferior */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-card via-card/90 to-transparent">
          {/* Meta info row */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{routineDay.estimatedDuration} min</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <div className="flex items-center gap-1 text-primary">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-xs font-medium capitalize">{intensityLabel}</span>
            </div>
            {muscleGroups.length > 0 && (
              <>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <span className="text-xs text-muted-foreground capitalize truncate">
                  {muscleGroups.join(", ")}
                </span>
              </>
            )}
          </div>

          <h2 className="text-xl font-black text-foreground mb-3 tracking-tight text-display leading-tight">
            {routineDay.name}
          </h2>

          <div className="flex items-center gap-2 mb-3 text-muted-foreground">
            <Dumbbell className="w-3.5 h-3.5" />
            <span className="text-xs">{routineDay.totalExercises} ejercicios</span>
          </div>
          
          {/* CTA Principal */}
          <motion.button 
            onClick={handleStart}
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-primary rounded-xl py-3.5 touch-target-lg shadow-lg glow-primary"
            whileHover={{ scale: 1.01, boxShadow: "0 0 30px hsl(18 100% 55% / 0.5)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Play className="w-4 h-4 text-primary-foreground fill-current ml-0.5" />
            </div>
            <span className="text-primary-foreground font-bold text-sm tracking-wide uppercase">
              Empezar Entrenamiento
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CoachWorkoutCard;
