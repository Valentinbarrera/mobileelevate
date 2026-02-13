import { motion, AnimatePresence } from "framer-motion";
import { Clock, Flame, ChevronRight, Play, CheckCircle2, Dumbbell, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Routine } from "@/types/routine";

interface DayRoutineDetailProps {
  routine: Routine | null;
  dayLabel: string;
}

const intensityConfig: Record<string, { color: string; bg: string; icon: string }> = {
  Principiante: { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: "🌱" },
  Intermedio: { color: "text-amber-400", bg: "bg-amber-500/10", icon: "⚡" },
  Avanzado: { color: "text-red-400", bg: "bg-red-500/10", icon: "🔥" },
};

const DayRoutineDetail = ({ routine, dayLabel }: DayRoutineDetailProps) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence mode="wait">
      {!routine ? (
        <motion.div
          key="rest"
          className="px-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <motion.div 
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <span className="text-3xl">🧘</span>
            </motion.div>
            <h3 className="text-lg font-bold text-foreground mb-1">Día de Descanso</h3>
            <p className="text-sm text-muted-foreground max-w-[240px] mx-auto">
              {dayLabel} es tu día para recuperarte. ¡El descanso también es parte del progreso!
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key={routine.id}
          className="px-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          <RoutineCard routine={routine} navigate={navigate} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const RoutineCard = ({ routine, navigate }: { routine: Routine; navigate: ReturnType<typeof useNavigate> }) => {
  const intensity = intensityConfig[routine.intensity] || intensityConfig.Intermedio;
  const isCompleted = routine.status === "completed";
  const isInProgress = routine.status === "in_progress";

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all ${
      isCompleted 
        ? "bg-card border-emerald-500/20" 
        : isInProgress 
          ? "bg-card border-primary/40"
          : "bg-card border-border"
    }`}>
      {/* Top accent line */}
      <div className={`h-1 w-full ${
        isCompleted ? "bg-emerald-500" : isInProgress ? "bg-gradient-primary" : "bg-muted"
      }`} />

      {/* Status Badge */}
      {(isCompleted || isInProgress) && (
        <motion.div 
          className={`absolute top-5 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
            isCompleted 
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
              : "bg-primary/15 text-primary border border-primary/20"
          }`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
        >
          {isCompleted ? "✓ Hecho" : "En curso"}
        </motion.div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <motion.div 
            className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
              isCompleted ? "bg-emerald-500/10" : isInProgress ? "bg-primary/10" : "bg-secondary/80"
            }`}
            whileHover={{ scale: 1.05 }}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            ) : (
              routine.thumbnail
            )}
          </motion.div>
          <div className="flex-1 pt-0.5">
            <h2 className="text-lg font-black text-foreground mb-1.5 leading-tight">{routine.name}</h2>
            <div className="flex items-center flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold ${intensity.bg} ${intensity.color}`}>
                {intensity.icon} {routine.intensity}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                {routine.duration}
              </span>
            </div>
          </div>
        </div>

        {/* Muscle Groups */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {routine.muscleGroups.map((group, i) => (
            <motion.span
              key={i}
              className="px-2.5 py-1 rounded-lg bg-secondary/80 text-[11px] font-medium text-foreground border border-border/50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              {group}
            </motion.span>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: <Dumbbell className="w-4 h-4 text-primary" />, value: routine.exerciseCount, label: "Ejercicios" },
            { icon: <Clock className="w-4 h-4 text-primary" />, value: routine.duration.replace(" min", ""), label: "Minutos" },
            { icon: <Sparkles className="w-4 h-4 text-primary" />, value: `+${routine.xpReward}`, label: "XP", highlight: true },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              className="bg-secondary/50 rounded-xl p-2.5 text-center border border-border/30"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <div className="flex justify-center mb-1">{stat.icon}</div>
              <p className={`text-base font-black ${stat.highlight ? "text-primary" : "text-foreground"}`}>{stat.value}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Progress for in-progress */}
        {isInProgress && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-bold text-primary">45%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-primary rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: "45%" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
              </motion.div>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <motion.button
          onClick={() => navigate(`/workout/${routine.id}`)}
          className={`w-full flex items-center justify-center gap-2.5 h-13 rounded-xl font-bold text-sm tracking-wide transition-all ${
            isCompleted
              ? "bg-secondary text-foreground hover:bg-secondary/80 py-3"
              : "bg-gradient-primary text-primary-foreground py-3.5"
          }`}
          style={!isCompleted ? { boxShadow: '0 4px 16px hsl(18 100% 55% / 0.3)' } : undefined}
          whileHover={!isCompleted ? { boxShadow: "0 6px 24px hsl(18 100% 55% / 0.4)" } : {}}
          whileTap={{ scale: 0.98 }}
        >
          {isCompleted ? (
            <>
              VER RESUMEN
              <ChevronRight className="w-5 h-5" />
            </>
          ) : isInProgress ? (
            <>
              <Play className="w-4 h-4 fill-current" />
              CONTINUAR
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              EMPEZAR ENTRENAMIENTO
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default DayRoutineDetail;
