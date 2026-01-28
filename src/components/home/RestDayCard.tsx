/**
 * Card shown when there's no workout scheduled for today
 */
import { Coffee, Sparkles, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fadeUp } from "@/lib/animations";

interface RestDayCardProps {
  nextWorkoutDay?: string;
}

const RestDayCard = ({ nextWorkoutDay }: RestDayCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="mx-5 mt-5 relative rounded-2xl overflow-hidden shadow-lg bg-card border border-border"
      variants={fadeUp}
    >
      <div className="p-6">
        {/* Icon and title */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Coffee className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Día de Descanso</h2>
            <p className="text-sm text-muted-foreground">Tu cuerpo también necesita recuperarse</p>
          </div>
        </div>

        {/* Tips */}
        <div className="space-y-3 mb-5">
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl">
            <Sparkles className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Hidratación</p>
              <p className="text-xs text-muted-foreground">Tomá al menos 2L de agua hoy</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl">
            <Sparkles className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Movilidad</p>
              <p className="text-xs text-muted-foreground">Hacé 10 min de estiramientos suaves</p>
            </div>
          </div>
        </div>

        {/* Next workout info */}
        {nextWorkoutDay && (
          <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/10 rounded-xl">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">Próximo entrenamiento</span>
            </div>
            <span className="text-sm font-semibold text-primary">{nextWorkoutDay}</span>
          </div>
        )}

        {/* Optional action */}
        <motion.button 
          onClick={() => navigate("/routines")}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-secondary rounded-xl py-3 text-foreground"
          whileTap={{ scale: 0.98 }}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">Ver mi Rutina Completa</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default RestDayCard;
