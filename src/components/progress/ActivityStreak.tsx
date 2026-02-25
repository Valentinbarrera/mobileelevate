import { motion } from "framer-motion";
import { Flame, ChevronRight } from "lucide-react";

interface ActivityStreakProps {
  currentStreak: number;
  month: string;
  year: number;
  activeDays: number[];
}

const ActivityStreak = ({ currentStreak, month, year, activeDays }: ActivityStreakProps) => {
  return (
    <motion.div
      className="bg-card border border-border rounded-2xl p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground font-bold">Racha de Actividad</h3>
        <span className="text-primary text-sm font-semibold">{month} {year}</span>
      </div>

      {/* Calendar grid */}
      <div className="mb-4">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'].map((day) => (
            <span key={day} className="text-[10px] text-muted-foreground text-center font-medium">
              {day}
            </span>
          ))}
        </div>

        {/* Week 1 */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {[27, 28, 29, 30, 1, 2, 3].map((day, i) => {
            const isCurrentMonth = day <= 3;
            const isActive = isCurrentMonth && activeDays.includes(day);
            return (
              <motion.div
                key={i}
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-semibold ${
                  !isCurrentMonth 
                    ? 'text-muted-foreground/30' 
                    : isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.02 }}
              >
                {day}
              </motion.div>
            );
          })}
        </div>

        {/* Week 2 */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {[4, 5, 6, 7, 8, 9, 10].map((day, i) => {
            const isActive = activeDays.includes(day);
            return (
              <motion.div
                key={i}
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-semibold ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + i * 0.02 }}
              >
                {day}
              </motion.div>
            );
          })}
        </div>

        {/* Week 3 */}
        <div className="grid grid-cols-7 gap-1">
          {[11, 12, 13, 14, 15, 16, 17].map((day, i) => {
            const isActive = activeDays.includes(day);
            const isToday = day === 12;
            const isFuture = day > 12;
            return (
              <motion.div
                key={i}
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-semibold ${
                  isFuture
                    ? 'text-muted-foreground/50'
                    : isToday 
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/50 ring-offset-1 ring-offset-card'
                      : isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.02 }}
              >
                {day}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Streak info */}
      <motion.button
        className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <span className="text-foreground font-bold block">{currentStreak} Días de racha</span>
            <span className="text-xs text-muted-foreground">¡Sigue así!</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </motion.button>
    </motion.div>
  );
};

export default ActivityStreak;
