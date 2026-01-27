import { motion } from "framer-motion";
import { Check, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WeeklyProgressProps {
  completedDays: number;
  totalDays: number;
}

const WeeklyProgress = ({ completedDays, totalDays }: WeeklyProgressProps) => {
  const navigate = useNavigate();
  const days = [
    { short: 'L', full: 'LUN' },
    { short: 'M', full: 'MAR' },
    { short: 'M', full: 'MIE' },
    { short: 'J', full: 'JUE' },
    { short: 'V', full: 'VIE' },
    { short: 'S', full: 'SAB' },
    { short: 'D', full: 'DOM' },
  ];
  
  const progressPercent = (completedDays / totalDays) * 100;
  
  return (
    <motion.div 
      className="mx-4 mt-4 bg-card border border-border rounded-2xl p-4 cursor-pointer"
      whileHover={{ borderColor: "hsl(var(--primary) / 0.3)" }}
      whileTap={{ scale: 0.99 }}
      onClick={() => navigate("/routines")}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-primary" />
          <h3 className="text-foreground font-bold text-xs tracking-wide uppercase">Progreso Semanal</h3>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-foreground font-black text-sm">{completedDays}</span>
          <span className="text-muted-foreground text-xs">/ {totalDays}</span>
        </div>
      </div>
      
      {/* Barra de progreso principal */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
        <motion.div 
          className="h-full bg-gradient-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        />
      </div>
      
      {/* Días de la semana - Compacto */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isCompleted = index < completedDays;
          const isToday = index === completedDays;
          
          return (
            <motion.div 
              key={index} 
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <div 
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all
                  ${isCompleted 
                    ? 'bg-gradient-primary text-primary-foreground' 
                    : isToday 
                      ? 'border-2 border-primary text-primary bg-primary/10' 
                      : 'bg-secondary/50 text-muted-foreground'
                  }`}
              >
                {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : day.short}
              </div>
              <span className={`text-[8px] font-medium uppercase tracking-wide ${
                isToday ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {day.full}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default WeeklyProgress;
