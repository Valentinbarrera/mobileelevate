import { motion } from "framer-motion";
import { Check, Dumbbell, Flame } from "lucide-react";
import type { Routine } from "@/types/routine";

interface WeekDaySelectorProps {
  routines: Routine[];
  selectedDay: string | null;
  onSelectDay: (day: string) => void;
}

const DAYS = [
  { key: "Lunes", short: "L", label: "LUN" },
  { key: "Martes", short: "M", label: "MAR" },
  { key: "Miércoles", short: "X", label: "MIE" },
  { key: "Jueves", short: "J", label: "JUE" },
  { key: "Viernes", short: "V", label: "VIE" },
  { key: "Sábado", short: "S", label: "SAB" },
  { key: "Domingo", short: "D", label: "DOM" },
];

const WeekDaySelector = ({ routines, selectedDay, onSelectDay }: WeekDaySelectorProps) => {
  const today = new Date().toLocaleDateString("es-ES", { weekday: "long" });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  const getRoutineForDay = (dayKey: string) => {
    return routines.find(r => r.dayLabel === dayKey);
  };

  const getDayStatus = (dayKey: string) => {
    const routine = getRoutineForDay(dayKey);
    if (!routine) return "rest";
    return routine.status;
  };

  const completedCount = routines.filter(r => r.status === "completed").length;

  return (
    <div className="px-3 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-[11px] font-bold text-primary uppercase tracking-widest">
          Tu Semana
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gradient-primary" />
          <span className="text-[11px] text-muted-foreground font-medium">
            {completedCount}/{routines.length}
          </span>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS.map((day, index) => {
          const status = getDayStatus(day.key);
          const routine = getRoutineForDay(day.key);
          const isToday = day.key === todayCapitalized;
          const isSelected = selectedDay === day.key;

          return (
            <motion.button
              key={day.key}
              onClick={() => onSelectDay(day.key)}
              className="relative flex flex-col items-center gap-1 py-2 rounded-xl transition-all"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04 }}
              whileTap={{ scale: 0.92 }}
            >
              {/* Selected background */}
              {isSelected && (
                <motion.div
                  layoutId="selectedDayBg"
                  className="absolute inset-0 bg-primary rounded-xl"
                  style={{ boxShadow: '0 4px 12px hsl(18 100% 55% / 0.3)' }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
              )}

              {/* Day circle */}
              <div className={`relative z-10 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                isSelected
                  ? "bg-primary-foreground/20"
                  : status === "completed"
                    ? "bg-emerald-500/15"
                    : status === "in_progress"
                      ? "bg-primary/15"
                      : "bg-secondary/60"
              }`}>
                {status === "completed" ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Check className={`w-4 h-4 ${isSelected ? "text-primary-foreground" : "text-emerald-400"}`} strokeWidth={3} />
                  </motion.div>
                ) : status === "in_progress" ? (
                  <Flame className={`w-4 h-4 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                ) : routine ? (
                  <Dumbbell className={`w-3.5 h-3.5 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`} />
                ) : (
                  <span className={`text-sm font-bold ${isSelected ? "text-primary-foreground" : "text-muted-foreground/60"}`}>
                    {day.short}
                  </span>
                )}
              </div>

              {/* Day label */}
              <span className={`relative z-10 text-[9px] font-bold tracking-wide ${
                isSelected ? "text-primary-foreground" : isToday ? "text-primary" : "text-muted-foreground"
              }`}>
                {isToday && !isSelected ? "HOY" : day.label}
              </span>

              {/* Today dot */}
              {isToday && !isSelected && (
                <motion.div
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default WeekDaySelector;
