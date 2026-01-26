import { motion } from "framer-motion";
import { Clock, Zap, CheckCircle2, PlayCircle, ChevronRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Routine } from "@/pages/Routines";

interface RoutineCardProps {
  routine: Routine;
  index: number;
}

const statusConfig = {
  pending: {
    label: "Pendiente",
    color: "text-muted-foreground",
    bgColor: "bg-secondary",
    icon: null,
  },
  in_progress: {
    label: "En progreso",
    color: "text-primary",
    bgColor: "bg-primary/10",
    icon: PlayCircle,
  },
  completed: {
    label: "Completada",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    icon: CheckCircle2,
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
  const StatusIcon = status.icon;

  const handleClick = () => {
    navigate(`/workout/${routine.id}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      className={`relative rounded-2xl overflow-hidden cursor-pointer ${
        routine.status === "in_progress" 
          ? "bg-card border-2 border-primary shadow-lg shadow-primary/10" 
          : "bg-card border border-border"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Thumbnail */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
          routine.status === "completed" 
            ? "bg-emerald-500/20" 
            : routine.status === "in_progress"
              ? "bg-primary/20"
              : "bg-secondary"
        }`}>
          {routine.status === "completed" ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          ) : (
            routine.thumbnail
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Day Label & Status */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              {routine.dayLabel}
            </span>
            {StatusIcon && (
              <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
            )}
          </div>

          {/* Routine Name */}
          <h3 className="font-bold text-foreground text-base mb-2 truncate">
            {routine.name}
          </h3>

          {/* Meta Info */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{routine.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm">{intensity.icon}</span>
              <span className={`text-xs font-medium ${intensity.color}`}>
                {routine.intensity}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-primary font-semibold">+{routine.xpReward} XP</span>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex-shrink-0">
          {routine.status === "pending" ? (
            <motion.div 
              className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <Plus className="w-5 h-5 text-primary" />
            </motion.div>
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Progress indicator for in-progress */}
      {routine.status === "in_progress" && (
        <div className="h-1 bg-secondary">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: "45%" }}
            transition={{ delay: 0.5 }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default RoutineCard;
