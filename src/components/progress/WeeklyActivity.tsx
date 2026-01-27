import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface WeeklyActivityProps {
  totalMinutes: number;
  goalMet: boolean;
}

const WeeklyActivity = ({ totalMinutes, goalMet }: WeeklyActivityProps) => {
  const dailyData = [
    { day: 'L', value: 45 },
    { day: 'M', value: 60 },
    { day: 'X', value: 30 },
    { day: 'J', value: 75 },
    { day: 'V', value: 55 },
    { day: 'S', value: 40 },
    { day: 'D', value: 40 },
  ];

  const maxValue = Math.max(...dailyData.map(d => d.value));

  return (
    <motion.div
      className="bg-card border border-border rounded-2xl p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          Actividad Semanal
        </span>
        {goalMet && (
          <div className="flex items-center gap-1 text-primary text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Meta
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-black text-foreground">{totalMinutes}</span>
        <span className="text-sm text-muted-foreground">min</span>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-2 h-16">
        {dailyData.map((data, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              className="w-full rounded-t-sm bg-primary"
              initial={{ height: 0 }}
              animate={{ height: `${(data.value / maxValue) * 100}%` }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
              style={{ minHeight: 4 }}
            />
            <span className="text-[10px] text-muted-foreground font-medium">{data.day}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default WeeklyActivity;
