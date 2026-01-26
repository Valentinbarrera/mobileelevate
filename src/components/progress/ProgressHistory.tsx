import { motion } from "framer-motion";
import { TrendingDown, ChevronRight, Scale, Percent } from "lucide-react";
import type { ProgressEntry } from "@/pages/Progress";

interface ProgressHistoryProps {
  entries: ProgressEntry[];
}

const ProgressHistory = ({ entries }: ProgressHistoryProps) => {
  if (entries.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
          Historial de Evolución
        </h3>
        <button className="text-xs text-primary font-semibold flex items-center gap-1">
          Ver todo
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.id}
            className="p-4 rounded-2xl bg-card border border-border"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground">
                {entry.date}
              </span>
              {index === 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                  Más reciente
                </span>
              )}
            </div>

            <div className="flex items-center gap-6">
              {/* Weight */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Scale className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <span className="text-lg font-bold text-foreground">{entry.weight}</span>
                  <span className="text-xs text-muted-foreground ml-1">kg</span>
                </div>
              </div>

              {/* Body Fat */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Percent className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="text-lg font-bold text-foreground">{entry.bodyFat}</span>
                  <span className="text-xs text-muted-foreground ml-1">%</span>
                </div>
              </div>

              {/* Trend */}
              {index < entries.length - 1 && (
                <div className="ml-auto flex items-center gap-1 text-emerald-500">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-xs font-semibold">
                    -{(entries[index + 1].weight - entry.weight).toFixed(1)}kg
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProgressHistory;
