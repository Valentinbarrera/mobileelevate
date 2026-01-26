import { motion } from "framer-motion";
import { Medal, Target, TrendingUp, Zap } from "lucide-react";

interface SummaryAchievementsProps {
  isPersonalBest: boolean;
  completionRate: number;
}

const SummaryAchievements = ({ isPersonalBest, completionRate }: SummaryAchievementsProps) => {
  const achievements = [
    ...(completionRate === 100 ? [{
      icon: Target,
      title: "Rutina Completa",
      description: "Completaste todos los ejercicios",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    }] : []),
    ...(isPersonalBest ? [{
      icon: Medal,
      title: "Récord Personal",
      description: "Tu sesión más larga esta semana",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    }] : []),
    {
      icon: Zap,
      title: "En Racha",
      description: "3 días seguidos entrenando",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: TrendingUp,
      title: "+25 XP",
      description: "Experiencia ganada",
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
  ];

  return (
    <div className="px-5 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
          Logros desbloqueados
        </h3>
        
        <div className="space-y-2">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
            >
              <div className={`w-12 h-12 rounded-xl ${achievement.bgColor} flex items-center justify-center`}>
                <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
              </div>
              <div>
                <p className="font-bold text-foreground">{achievement.title}</p>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SummaryAchievements;
