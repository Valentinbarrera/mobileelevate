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
  { key: "Miércoles", short: "M", label: "MIE" },
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

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
          Tu Semana
        </h3>
        <span className="text-xs text-muted-foreground">
          {routines.filter(r => r.status === "completed").length}/{routines.length} completados
        </span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day, index) => {
          const status = getDayStatus(day.key);
          const routine = getRoutineForDay(day.key);
          const isToday = day.key === todayCapitalized;
          const isSelected = selectedDay === day.key;

          return (
            <motion.button
              key={day.key}
              onClick={() => onSelectDay(day.key)}
              className={`relative flex flex-col items-center p-2 rounded-2xl transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : status === "completed"
                    ? "bg-emerald-500/15 text-emerald-500"
                    : status === "in_progress"
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : isToday
                        ? "bg-card border border-primary/50"
                        : "bg-card/50 border border-transparent"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Day indicator */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 ${
                isSelected
                  ? "bg-primary-foreground/20"
                  : status === "completed"
                    ? "bg-emerald-500/20"
                    : status === "in_progress"
                      ? "bg-primary/20"
                      : "bg-secondary/50"
              }`}>
                {status === "completed" ? (
                  <Check className="w-5 h-5" />
                ) : status === "in_progress" ? (
                  <Flame className="w-5 h-5" />
                ) : routine ? (
                  <Dumbbell className={`w-4 h-4 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`} />
                ) : (
                  <span className={`text-lg font-bold ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}>
                    {day.short}
                  </span>
                )}
              </div>

              {/* Day label */}
              <span className={`text-[10px] font-bold tracking-wide ${
                isSelected ? "text-primary-foreground" : isToday ? "text-primary" : "text-muted-foreground"
              }`}>
                {day.label}
              </span>

              {/* Today indicator dot */}
              {isToday && !isSelected && (
                <motion.div
                  className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary"
                  layoutId="today-dot"
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
