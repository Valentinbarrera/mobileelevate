import { motion } from "framer-motion";
import { Clock, Dumbbell, Repeat, Flame } from "lucide-react";

interface SummaryStatsProps {
  duration: number;
  exercisesCompleted: number;
  setsCompleted: number;
  caloriesBurned: number;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const SummaryStats = ({ 
  duration, 
  exercisesCompleted, 
  setsCompleted, 
  caloriesBurned 
}: SummaryStatsProps) => {
  const stats = [
    {
      icon: Clock,
      label: "Tiempo total",
      value: formatDuration(duration),
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      icon: Flame,
      label: "Calorías",
      value: `${caloriesBurned}`,
      suffix: "kcal",
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
    },
    {
      icon: Dumbbell,
      label: "Ejercicios",
      value: `${exercisesCompleted}`,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
    },
    {
      icon: Repeat,
      label: "Series",
      value: `${setsCompleted}`,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/30",
    },
  ];

  return (
    <div className="px-5 mb-6">
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className={`p-4 rounded-2xl ${stat.bgColor} border ${stat.borderColor}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <motion.span 
                className="text-3xl font-black text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                {stat.value}
              </motion.span>
              {stat.suffix && (
                <span className="text-sm text-muted-foreground font-medium">
                  {stat.suffix}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default SummaryStats;
