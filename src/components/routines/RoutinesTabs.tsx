import { motion } from "framer-motion";
import { Calendar, CheckCircle2 } from "lucide-react";
import type { TabFilter } from "@/pages/Routines";

interface RoutinesTabsProps {
  activeTab: TabFilter;
  onTabChange: (tab: TabFilter) => void;
  completedCount: number;
}

const tabs: { id: TabFilter; label: string; icon: React.ReactNode }[] = [
  { id: "week", label: "Mi Semana", icon: <Calendar className="w-4 h-4" /> },
  { id: "completed", label: "Completadas", icon: <CheckCircle2 className="w-4 h-4" /> },
];

const RoutinesTabs = ({ activeTab, onTabChange, completedCount }: RoutinesTabsProps) => {
  return (
    <motion.div 
      className="px-4 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex gap-2 p-1 rounded-2xl bg-secondary/40 border border-border/50">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex-1 py-3 px-3 rounded-xl text-sm font-semibold transition-colors touch-target ${
                isActive 
                  ? "text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeRoutineTab"
                  className="absolute inset-0 bg-gradient-primary rounded-xl shadow-lg"
                  style={{ boxShadow: '0 4px 12px hsl(18 100% 55% / 0.25)' }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {tab.icon}
                {tab.label}
                {tab.id === "completed" && completedCount > 0 && (
                  <motion.span 
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive 
                        ? "bg-primary-foreground/20 text-primary-foreground" 
                        : "bg-primary/15 text-primary"
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {completedCount}
                  </motion.span>
                )}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RoutinesTabs;
