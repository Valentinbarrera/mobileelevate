/**
 * Componente de tarjeta de rutina asignada por el coach
 */
import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Clock, Dumbbell, Zap, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { AlumnoRoutineWithDetails } from "@/integrations/coach/types";

interface AlumnoRoutineCardProps {
  assignment: AlumnoRoutineWithDetails;
  index: number;
}

const AlumnoRoutineCard = ({ assignment, index }: AlumnoRoutineCardProps) => {
  const navigate = useNavigate();
  const routine = assignment.routine;
  
  if (!routine) return null;

  const totalExercises = routine.routine_days?.reduce(
    (acc, day) => acc + (day.routine_exercises?.length || 0),
    0
  ) || 0;

  const totalDays = routine.routine_days?.length || 0;

  const difficultyConfig: Record<string, { color: string; bg: string; icon: string }> = {
    'Principiante': { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: '🌱' },
    'Intermedio': { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: '⚡' },
    'Avanzado': { color: 'text-primary', bg: 'bg-primary/10 border-primary/20', icon: '🔥' },
  };

  const diff = difficultyConfig[routine.difficulty || ''] || { color: 'text-primary', bg: 'bg-primary/10 border-primary/20', icon: '💪' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 25 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/routine/${routine.id}`)}
      className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary/30 transition-all group"
    >
      {/* Accent top bar */}
      <div className={`h-0.5 w-full ${
        assignment.status === 'active' ? 'bg-gradient-primary' : 'bg-muted'
      }`} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <motion.div 
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/15"
            whileHover={{ scale: 1.05 }}
          >
            <Dumbbell className="w-6 h-6 text-primary" />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-foreground text-[15px] line-clamp-1 leading-tight">
                  {routine.name}
                </h3>
                {routine.description && (
                  <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                    {routine.description}
                  </p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-2.5 mt-2.5">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span className="text-[11px] font-medium">{totalDays} días</span>
              </div>
              <div className="w-0.5 h-3 bg-border rounded-full" />
              <div className="flex items-center gap-1 text-muted-foreground">
                <Zap className="w-3 h-3" />
                <span className="text-[11px] font-medium">{totalExercises} ejercicios</span>
              </div>
              {routine.difficulty && (
                <>
                  <div className="w-0.5 h-3 bg-border rounded-full" />
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diff.bg} ${diff.color}`}>
                    {diff.icon} {routine.difficulty}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {new Date(assignment.assigned_at).toLocaleDateString('es-AR', { 
              day: 'numeric', 
              month: 'short' 
            })}
          </span>
          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
            assignment.status === 'active' 
              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
              : 'text-muted-foreground bg-muted border border-border'
          }`}>
            {assignment.status === 'active' ? '● Activa' : assignment.status}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default AlumnoRoutineCard;
