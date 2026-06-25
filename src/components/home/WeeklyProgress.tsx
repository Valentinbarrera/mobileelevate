import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Check, Flame, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLocalDateString, getStartOfWeekLocal } from "@/lib/date";

interface WeeklyProgressProps {
  completedDates: string[];
  totalDays: number;
}

const getWeekDates = (): string[] => {
  const monday = getStartOfWeekLocal();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return getLocalDateString(d);
  });
};

const WeeklyProgress = forwardRef<HTMLDivElement, WeeklyProgressProps>(
  ({ completedDates, totalDays }, ref) => {
  const navigate = useNavigate();
  const days = [
    { short: 'L', full: 'LUN' },
    { short: 'M', full: 'MAR' },
    { short: 'X', full: 'MIE' },
    { short: 'J', full: 'JUE' },
    { short: 'V', full: 'VIE' },
    { short: 'S', full: 'SAB' },
    { short: 'D', full: 'DOM' },
  ];

  const weekDates = getWeekDates();
  const todayStr = getLocalDateString();
  const completedSet = new Set(completedDates);
  const completedCount = weekDates.filter(d => completedSet.has(d)).length;
  const progressPercent = totalDays > 0 ? (completedCount / totalDays) * 100 : 0;
  
  return (
    <motion.div
      ref={ref}
      className="bg-card border border-border rounded-2xl p-4 cursor-pointer"
      whileHover={{ borderColor: "hsl(var(--primary) / 0.3)" }}
      whileTap={{ scale: 0.99 }}
      onClick={() => navigate("/routines")}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-primary" />
          <h3 className="text-foreground font-bold text-xs tracking-wider uppercase">Progreso Semanal</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-primary font-black text-sm tabular-nums">{completedCount}</span>
          <span className="text-muted-foreground text-xs">/ {totalDays}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground ml-1" />
        </div>
      </div>
      
      {/* Barra de progreso principal */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
        <motion.div 
          className="h-full bg-gradient-primary rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          {progressPercent > 10 && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            />
          )}
        </motion.div>
      </div>
      
      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dateStr = weekDates[index];
          const isCompleted = completedSet.has(dateStr);
          const isToday = dateStr === todayStr;

          return (
            <motion.div
              key={index}
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.04 }}
            >
              <motion.div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all
                  ${isCompleted
                    ? 'bg-gradient-primary text-primary-foreground shadow-sm'
                    : isToday
                      ? 'border-2 border-primary text-primary bg-primary/10'
                      : 'bg-secondary/50 text-muted-foreground'
                  }`}
                animate={isToday && !isCompleted ? { borderColor: ["hsl(18 100% 55% / 1)", "hsl(18 100% 55% / 0.4)", "hsl(18 100% 55% / 1)"] } : {}}
                transition={isToday && !isCompleted ? { duration: 2, repeat: Infinity } : {}}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, delay: 0.2 + index * 0.05 }}
                  >
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </motion.div>
                ) : day.short}
              </motion.div>
              <span className={`text-[8px] font-medium uppercase tracking-wide ${
                isToday ? 'text-primary font-bold' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {isToday ? 'HOY' : day.full}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
});

WeeklyProgress.displayName = "WeeklyProgress";

export default WeeklyProgress;
