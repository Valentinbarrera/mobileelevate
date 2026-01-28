/**
 * Componente de tarjeta de rutina asignada por el coach
 * Muestra datos reales de la base de datos del Coach
 */
import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Clock, Dumbbell, Zap } from "lucide-react";
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

  const difficultyColors: Record<string, string> = {
    'Principiante': 'text-emerald-500 bg-emerald-500/10',
    'Intermedio': 'text-blue-500 bg-blue-500/10',
    'Avanzado': 'text-orange-500 bg-orange-500/10',
    'default': 'text-primary bg-primary/10'
  };

  const difficultyClass = difficultyColors[routine.difficulty || 'default'] || difficultyColors.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/routine/${routine.id}`)}
      className="bg-card border border-border rounded-2xl p-4 cursor-pointer hover:border-primary/50 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail o icono */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/20">
          <Dumbbell className="w-7 h-7 text-primary" />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-foreground text-sm line-clamp-1">
                {routine.name}
              </h3>
              {routine.description && (
                <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                  {routine.description}
                </p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {totalDays} días
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {totalExercises} ejercicios
              </span>
            </div>
            {routine.difficulty && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${difficultyClass}`}>
                {routine.difficulty}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status badge */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Asignada: {new Date(assignment.assigned_at).toLocaleDateString('es-AR', { 
            day: 'numeric', 
            month: 'short' 
          })}
        </span>
        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
          assignment.status === 'active' 
            ? 'text-emerald-500 bg-emerald-500/10' 
            : 'text-muted-foreground bg-muted'
        }`}>
          {assignment.status === 'active' ? 'Activa' : assignment.status}
        </span>
      </div>
    </motion.div>
  );
};

export default AlumnoRoutineCard;
