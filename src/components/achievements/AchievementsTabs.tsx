import { motion } from "framer-motion";
import type { AchievementCategory } from "@/types/achievement";

interface AchievementsTabsProps {
  activeCategory: AchievementCategory;
  onCategoryChange: (category: AchievementCategory) => void;
}

const categories: { id: AchievementCategory; label: string; icon: string }[] = [
  { id: "all", label: "Todos", icon: "🏅" },
  { id: "workouts", label: "Entrenos", icon: "💪" },
  { id: "consistency", label: "Constancia", icon: "🔥" },
  { id: "progress", label: "Progreso", icon: "📈" },
  { id: "social", label: "Social", icon: "🌟" },
];

const AchievementsTabs = ({ activeCategory, onCategoryChange }: AchievementsTabsProps) => {
  return (
    <motion.div 
      className="px-5 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-colors ${
              activeCategory === category.id
                ? "text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground border border-border"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {activeCategory === category.id && (
              <motion.div
                layoutId="activeAchievementTab"
                className="absolute inset-0 bg-primary rounded-xl"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{category.icon}</span>
            <span className="relative z-10 text-sm font-semibold">{category.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default AchievementsTabs;
