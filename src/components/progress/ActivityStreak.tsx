import { motion } from "framer-motion";
import { Flame, ChevronRight } from "lucide-react";
import CountUp from "@/components/ui/count-up";

interface ActivityStreakProps {
  currentStreak: number;
  month: string;
  year: number;
  activeDays: number[];
}

const ActivityStreak = ({ currentStreak, month, year, activeDays }: ActivityStreakProps) => {
  // Calendario real del mes actual (no hardcodeado)
  const now = new Date();
  const monthIndex = now.getMonth();
  const yearNum = now.getFullYear();
  const todayDate = now.getDate();
  const daysInMonth = new Date(yearNum, monthIndex + 1, 0).getDate();
  const leadingBlanks = (new Date(yearNum, monthIndex, 1).getDay() + 6) % 7; // Lunes = 0
  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <motion.div
      className="card-elevated rounded-2xl p-4 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="accent-bar" />
          <h3 className="text-foreground font-black tracking-tight">Racha de Actividad</h3>
        </div>
        <span className="text-primary text-sm font-semibold">{month} {year}</span>
      </div>

      {/* Calendar grid — mes actual real */}
      <div className="mb-4 max-w-xs mx-auto">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'].map((day, i) => (
            <span key={i} className="text-[10px] text-muted-foreground text-center font-medium">
              {day}
            </span>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} className="w-8 h-8" />;
            const isActive = activeDays.includes(day);
            const isToday = day === todayDate;
            const isFuture = day > todayDate;
            return (
              <motion.div
                key={i}
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-semibold ${
                  isToday
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary/50 ring-offset-1 ring-offset-card'
                    : isActive
                      ? 'bg-primary text-primary-foreground'
                      : isFuture
                        ? 'text-muted-foreground/40'
                        : 'text-muted-foreground'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.25 + i * 0.01 }}
              >
                {day}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Streak info */}
      <motion.button
        className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-white/[0.06] hover:border-primary/30 transition-colors"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Flame className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <span className="text-foreground font-bold block">
              <CountUp value={currentStreak} className="tabular-nums" /> Días de racha
            </span>
            <span className="text-xs text-muted-foreground">¡Seguí así!</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </motion.button>
    </motion.div>
  );
};

export default ActivityStreak;
