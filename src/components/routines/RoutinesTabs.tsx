import { motion } from "framer-motion";
import type { TabFilter } from "@/pages/Routines";

interface RoutinesTabsProps {
  activeTab: TabFilter;
  onTabChange: (tab: TabFilter) => void;
  completedCount: number;
}

const tabs: { id: TabFilter; label: string }[] = [
  { id: "week", label: "Mi Semana" },
  { id: "completed", label: "Completadas" },
];

const RoutinesTabs = ({ activeTab, onTabChange, completedCount }: RoutinesTabsProps) => {
  return (
    <motion.div 
      className="px-4 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex gap-2 p-1 rounded-2xl bg-secondary/50 border border-border">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex-1 py-3 px-3 rounded-xl text-sm font-semibold transition-colors touch-target ${
              activeTab === tab.id 
                ? "text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            whileTap={{ scale: 0.98 }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeRoutineTab"
                className="absolute inset-0 bg-primary rounded-xl"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              {tab.label}
              {tab.id === "completed" && completedCount > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : "bg-primary/20 text-primary"
                }`}>
                  {completedCount}
                </span>
              )}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default RoutinesTabs;
