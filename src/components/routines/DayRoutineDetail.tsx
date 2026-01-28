import { motion, AnimatePresence } from "framer-motion";
import { Clock, Flame, ChevronRight, Play, CheckCircle2, Dumbbell, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Routine } from "@/types/routine";
import { Button } from "@/components/ui/button";

interface DayRoutineDetailProps {
  routine: Routine | null;
  dayLabel: string;
}

const intensityConfig = {
  Principiante: { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: "🌱" },
  Intermedio: { color: "text-amber-400", bg: "bg-amber-500/10", icon: "⚡" },
  Avanzado: { color: "text-red-400", bg: "bg-red-500/10", icon: "🔥" },
};

const DayRoutineDetail = ({ routine, dayLabel }: DayRoutineDetailProps) => {
  const navigate = useNavigate();

  if (!routine) {
    return (
      <motion.div
        className="px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="bg-card border border-border rounded-3xl p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
            <span className="text-3xl">🧘</span>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Día de Descanso</h3>
          <p className="text-sm text-muted-foreground">
            {dayLabel} es tu día para recuperarte. ¡El descanso también es parte del progreso!
          </p>
        </div>
      </motion.div>
    );
  }

  const intensity = intensityConfig[routine.intensity];
  const isCompleted = routine.status === "completed";
  const isInProgress = routine.status === "in_progress";

  return (
    <motion.div
      className="px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      key={routine.id}
    >
      <div className={`relative overflow-hidden rounded-3xl border ${
        isCompleted 
          ? "bg-emerald-500/5 border-emerald-500/30" 
          : isInProgress 
            ? "bg-card border-primary/50 glow-primary-sm"
            : "bg-card border-border"
      }`}>
        {/* Status Badge */}
        {(isCompleted || isInProgress) && (
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
            isCompleted 
              ? "bg-emerald-500/20 text-emerald-400" 
              : "bg-primary/20 text-primary"
          }`}>
            {isCompleted ? "✓ Completada" : "En Progreso"}
          </div>
        )}

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
              isCompleted ? "bg-emerald-500/15" : isInProgress ? "bg-primary/15" : "bg-secondary"
            }`}>
              {isCompleted ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              ) : (
                routine.thumbnail
              )}
            </div>
            <div className="flex-1 pt-1">
              <h2 className="text-xl font-black text-foreground mb-1">{routine.name}</h2>
              <div className="flex items-center flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${intensity.bg} ${intensity.color}`}>
                  {intensity.icon} {routine.intensity}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {routine.duration}
                </span>
              </div>
            </div>
          </div>

          {/* Muscle Groups */}
          <div className="flex flex-wrap gap-2 mb-4">
            {routine.muscleGroups.map((group, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl bg-secondary text-xs font-medium text-foreground"
              >
                {group}
              </span>
            ))}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-secondary/50 rounded-2xl p-3 text-center">
              <Dumbbell className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-black text-foreground">{routine.exerciseCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Ejercicios</p>
            </div>
            <div className="bg-secondary/50 rounded-2xl p-3 text-center">
              <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-black text-foreground">{routine.duration.replace(" min", "")}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Minutos</p>
            </div>
            <div className="bg-secondary/50 rounded-2xl p-3 text-center">
              <Sparkles className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-black text-primary">+{routine.xpReward}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">XP</p>
            </div>
          </div>

          {/* Progress for in-progress */}
          {isInProgress && (
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Progreso de sesión</span>
                <span className="font-bold text-primary">45%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "45%" }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* CTA Button */}
          <Button
            onClick={() => navigate(`/workout/${routine.id}`)}
            className={`w-full h-14 rounded-2xl font-bold text-sm tracking-wider ${
              isCompleted
                ? "bg-secondary text-foreground hover:bg-secondary/80"
                : "bg-gradient-primary text-primary-foreground glow-primary"
            }`}
          >
            {isCompleted ? (
              <>
                VER RESUMEN
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            ) : isInProgress ? (
              <>
                CONTINUAR ENTRENAMIENTO
                <Play className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                EMPEZAR ENTRENAMIENTO
                <Play className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DayRoutineDetail;
