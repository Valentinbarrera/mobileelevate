import { motion } from "framer-motion";
import { Trophy, Zap, Medal } from "lucide-react";

interface AchievementsStatsProps {
  unlockedCount: number;
  totalCount: number;
  totalXp: number;
}

const AchievementsStats = ({ unlockedCount, totalCount, totalXp }: AchievementsStatsProps) => {
  const progressPercent = (unlockedCount / totalCount) * 100;

  return (
    <motion.div 
      className="px-5 py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Main Trophy Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 via-primary/10 to-transparent border border-amber-500/30 p-6 mb-4">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
        
        <div className="relative flex items-center gap-5">
          {/* Trophy */}
          <motion.div 
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>

          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-black text-foreground">{unlockedCount}</span>
              <span className="text-lg text-muted-foreground">/ {totalCount}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Logros desbloqueados</p>
            
            {/* Progress Bar */}
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-500 to-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ delay: 0.3, duration: 0.8 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* XP Stats */}
      <div className="flex gap-3">
        <motion.div 
          className="flex-1 p-4 rounded-2xl bg-card border border-border"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">XP Ganado</span>
          </div>
          <span className="text-2xl font-black text-foreground">{totalXp.toLocaleString()}</span>
        </motion.div>

        <motion.div 
          className="flex-1 p-4 rounded-2xl bg-card border border-border"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Medal className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Por reclamar</span>
          </div>
          <span className="text-2xl font-black text-primary">2</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AchievementsStats;
