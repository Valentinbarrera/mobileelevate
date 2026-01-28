import { motion } from "framer-motion";
import { Clock, CheckCircle2, PlayCircle, ChevronRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Routine } from "@/types/routine";

interface RoutineCardProps {
  routine: Routine;
  index: number;
}

const statusConfig = {
  pending: {
    label: "Pendiente",
    color: "text-muted-foreground",
    bgColor: "bg-secondary",
    borderColor: "border-border",
  },
  in_progress: {
    label: "En progreso",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary",
  },
  completed: {
    label: "Completada",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
};

const intensityConfig = {
  Principiante: { color: "text-emerald-500", icon: "🌱" },
  Intermedio: { color: "text-amber-500", icon: "⚡" },
  Avanzado: { color: "text-red-500", icon: "🔥" },
};

const RoutineCard = ({ routine, index }: RoutineCardProps) => {
  const navigate = useNavigate();
  const status = statusConfig[routine.status];
  const intensity = intensityConfig[routine.intensity];

  const handleClick = () => {
    navigate(`/workout/${routine.id}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      className={`relative rounded-2xl overflow-hidden cursor-pointer bg-card border ${status.borderColor} ${
        routine.status === "in_progress" ? "shadow-lg shadow-primary/5" : ""
      }`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Thumbnail optimizado */}
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
          routine.status === "completed" 
            ? "bg-emerald-500/15" 
            : routine.status === "in_progress"
              ? "bg-primary/15"
              : "bg-secondary"
        }`}>
          {routine.status === "completed" ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          ) : (
            routine.thumbnail
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Day Label */}
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
              {routine.dayLabel}
            </span>
            {routine.status === "in_progress" && (
              <PlayCircle className="w-3 h-3 text-primary" />
            )}
          </div>

          {/* Routine Name */}
          <h3 className="font-bold text-foreground text-sm mb-1.5 truncate">
            {routine.name}
          </h3>

          {/* Meta Info */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">{routine.duration}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-xs">{intensity.icon}</span>
              <span className={`text-[11px] font-medium ${intensity.color}`}>
                {routine.intensity}
              </span>
            </div>
            <span className="text-[11px] text-primary font-semibold">+{routine.xpReward} XP</span>
          </div>
        </div>

        {/* Action */}
        <div className="flex-shrink-0">
          {routine.status === "pending" ? (
            <motion.div 
              className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
              whileHover={{ scale: 1.1, backgroundColor: "hsl(18 100% 55% / 0.2)" }}
            >
              <Play className="w-4 h-4 text-primary ml-0.5" />
            </motion.div>
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Progress bar para in-progress */}
      {routine.status === "in_progress" && (
        <div className="h-0.5 bg-secondary">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: "45%" }}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default RoutineCard;
