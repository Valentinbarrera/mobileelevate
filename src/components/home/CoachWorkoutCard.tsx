/**
 * Hero del workout de hoy — tarjeta de vidrio esmerilado (glass / profundidad).
 * Centro visual del Home: glows internos, watermark, título grande y CTA potente.
 */
import { Play, Clock, Zap, Dumbbell } from "lucide-react";
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
        fromCoach: true,
      },
    });
  };

  const muscleGroups = [...new Set(routineDay.exercises.map((e) => e.muscleGroup).filter(Boolean))].slice(0, 3);
  const intensityLabel = routineInfo.difficulty || "Moderada";

  return (
    <motion.div
      className="relative card-hero rounded-3xl overflow-hidden"
      variants={fadeUp}
      whileTap={{ scale: 0.99 }}
    >
      {/* Glows internos */}
      <div className="pointer-events-none absolute -top-16 -right-12 w-52 h-52 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-12 w-48 h-48 rounded-full bg-orange-500/10 blur-3xl" />

      {/* Watermark */}
      <div className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 opacity-[0.06]">
        <Dumbbell className="w-44 h-44 text-primary" />
      </div>

      <div className="relative p-5">
        {/* Badges superiores */}
        <div className="flex items-center gap-2 mb-5">
          <span className="bg-gradient-primary text-primary-foreground text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg">
            Día {routineDay.dayNumber}
          </span>
          <span className="bg-white/5 backdrop-blur-sm text-foreground text-[10px] font-medium px-2 py-1 rounded-lg border border-white/10">
            {routineInfo.name}
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Hoy
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2.5 mb-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-medium">{routineDay.estimatedDuration} min</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <div className="flex items-center gap-1 text-primary">
            <Zap className="w-3.5 h-3.5" />
            <span className="font-medium capitalize">{intensityLabel}</span>
          </div>
          {muscleGroups.length > 0 && (
            <>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span className="text-muted-foreground capitalize truncate">{muscleGroups.join(", ")}</span>
            </>
          )}
        </div>

        {/* Título */}
        <h2 className="text-[1.75rem] font-black text-foreground tracking-tight text-display leading-[1.05] mb-1.5">
          {routineDay.name}
        </h2>

        <div className="flex items-center gap-1.5 mb-5 text-muted-foreground text-xs">
          <Dumbbell className="w-3.5 h-3.5" />
          <span>{routineDay.totalExercises} ejercicios</span>
        </div>

        {/* CTA */}
        <motion.button
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-primary rounded-2xl py-4 touch-target-lg shadow-lg glow-primary"
          whileHover={{ scale: 1.01, boxShadow: "0 0 34px hsl(18 100% 55% / 0.5)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-4 h-4 text-primary-foreground fill-current ml-0.5" />
          </div>
          <span className="text-primary-foreground font-black text-sm tracking-wide uppercase">
            Empezar Entrenamiento
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CoachWorkoutCard;
