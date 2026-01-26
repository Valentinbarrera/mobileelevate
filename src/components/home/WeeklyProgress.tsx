import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface WeeklyProgressProps {
  completedDays: number;
  totalDays: number;
}

const WeeklyProgress = ({ completedDays, totalDays }: WeeklyProgressProps) => {
  const days = [
    { short: 'L', full: 'Lun' },
    { short: 'M', full: 'Mar' },
    { short: 'M', full: 'Mie' },
    { short: 'J', full: 'Jue' },
    { short: 'V', full: 'Vie' },
    { short: 'S', full: 'Sab' },
    { short: 'D', full: 'Dom' },
  ];
  
  const progressPercent = (completedDays / totalDays) * 100;
  
  return (
    <motion.div 
      className="mx-5 mt-6 bg-secondary/60 border border-border rounded-2xl p-5"
      whileHover={{ borderColor: "hsl(var(--primary) / 0.3)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-foreground font-bold text-sm tracking-wide uppercase">Progreso Semanal</h3>
        <div className="flex items-center gap-2">
          <span className="text-foreground font-black text-lg">{completedDays}</span>
          <span className="text-muted-foreground text-sm">/ {totalDays} entrenos</span>
        </div>
      </div>
      
      {/* Barra de progreso principal */}
      <div className="h-3 bg-muted rounded-full overflow-hidden mb-5">
        <motion.div 
          className="h-full bg-gradient-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        />
      </div>
      
      {/* Días de la semana */}
      <div className="flex justify-between gap-1">
        {days.map((day, index) => {
          const isCompleted = index < completedDays;
          const isToday = index === completedDays;
          
          return (
            <motion.div 
              key={index} 
              className="flex flex-col items-center gap-2 flex-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <motion.div 
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all
                  ${isCompleted 
                    ? 'bg-gradient-primary text-primary-foreground shadow-lg' 
                    : isToday 
                      ? 'border-2 border-primary text-primary bg-primary/10' 
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isCompleted ? <Check className="w-5 h-5" strokeWidth={3} /> : day.short}
              </motion.div>
              <span className={`text-[10px] font-medium uppercase tracking-wider ${
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
