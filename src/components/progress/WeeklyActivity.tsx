import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import CountUp from "@/components/ui/count-up";

interface WeeklyActivityProps {
  sessionsThisWeek: number;
  goalMet: boolean;
}

const WeeklyActivity = ({ sessionsThisWeek, goalMet }: WeeklyActivityProps) => {
  return (
    <motion.div
      className="card-elevated rounded-2xl p-4 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          Actividad Semanal
        </span>
        {goalMet && (
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Meta
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <CountUp value={sessionsThisWeek} className="text-3xl font-black text-foreground tabular-nums" />
        <span className="text-sm text-muted-foreground">
          {sessionsThisWeek === 1 ? "sesión" : "sesiones"}
        </span>
      </div>
    </motion.div>
  );
};

export default WeeklyActivity;
