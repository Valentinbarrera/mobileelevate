import { motion } from "framer-motion";
import { Dumbbell, Timer, TrendingUp } from "lucide-react";

interface PRRecord {
  id: string;
  name: string;
  value: string;
  unit: string;
  improvedDate: string;
  icon: 'strength' | 'cardio';
}

interface PersonalRecordsProps {
  records: PRRecord[];
}

const PersonalRecords = ({ records }: PersonalRecordsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <h3 className="text-foreground font-bold mb-4">Mejores Marcas (PR)</h3>

      <div className="space-y-3">
        {records.map((record, index) => (
          <motion.div
            key={record.id}
            className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            {/* Icon */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              record.icon === 'strength' 
                ? 'bg-purple-500/10' 
                : 'bg-blue-500/10'
            }`}>
              {record.icon === 'strength' ? (
                <Dumbbell className="w-6 h-6 text-purple-500" />
              ) : (
                <Timer className="w-6 h-6 text-blue-500" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {record.name}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-foreground">{record.value}</span>
                <span className="text-sm text-muted-foreground">{record.unit}</span>
              </div>
            </div>

            {/* Improvement badge */}
            <div className="text-right">
              <div className="flex items-center gap-1 text-primary text-xs font-semibold mb-0.5">
                <TrendingUp className="w-3 h-3" />
                MEJORADO
              </div>
              <span className="text-xs text-muted-foreground">{record.improvedDate}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PersonalRecords;
