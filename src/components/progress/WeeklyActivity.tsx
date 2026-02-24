import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface WeeklyActivityProps {
  sessionsThisWeek: number;
  goalMet: boolean;
}

const WeeklyActivity = ({ sessionsThisWeek, goalMet }: WeeklyActivityProps) => {
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

      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-foreground">{sessionsThisWeek}</span>
        <span className="text-sm text-muted-foreground">
          {sessionsThisWeek === 1 ? "sesión" : "sesiones"}
        </span>
      </div>
    </motion.div>
  );
};

export default WeeklyActivity;
