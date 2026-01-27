import { motion } from "framer-motion";
import { Eye, Calendar } from "lucide-react";
import type { ProgressEntry } from "@/types/progress";

interface ProgressComparisonProps {
  lastEntry?: ProgressEntry;
}

const ProgressComparison = ({ lastEntry }: ProgressComparisonProps) => {
  if (!lastEntry) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
          Comparativa Anterior
        </h3>
        <span className="text-xs text-muted-foreground">
          Hace 14 días
        </span>
      </div>

      <motion.div
        className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border"
        whileHover={{ scale: 1.01 }}
      >
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center overflow-hidden">
          {lastEntry.frontPhoto ? (
            <span className="text-2xl">{lastEntry.frontPhoto}</span>
          ) : (
            <Calendar className="w-6 h-6 text-primary" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h4 className="font-bold text-foreground">Progreso Previo</h4>
          <p className="text-sm text-muted-foreground">{lastEntry.date}</p>
        </div>

        {/* View Button */}
        <motion.button
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <Eye className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default ProgressComparison;
