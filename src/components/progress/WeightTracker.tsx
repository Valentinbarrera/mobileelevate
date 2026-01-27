import { motion } from "framer-motion";
import { TrendingDown } from "lucide-react";

interface WeightTrackerProps {
  currentWeight: number;
  trend: number;
}

const WeightTracker = ({ currentWeight, trend }: WeightTrackerProps) => {
  const isPositiveTrend = trend < 0; // Losing weight is usually positive

  return (
    <motion.div
      className="bg-card border border-border rounded-2xl p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          Peso Corporal
        </span>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
          isPositiveTrend ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
        }`}>
          <TrendingDown className="w-3 h-3" />
          {Math.abs(trend).toFixed(1)}%
        </div>
      </div>
      
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-black text-foreground">{currentWeight.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">kg</span>
      </div>

      {/* Mini bar chart */}
      <div className="flex items-end gap-1.5 h-12">
        {[65, 75, 85, 100, 90, 70, 80].map((height, i) => (
          <motion.div
            key={i}
            className={`flex-1 rounded-sm ${i >= 4 ? 'bg-primary' : 'bg-primary/30'}`}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default WeightTracker;
