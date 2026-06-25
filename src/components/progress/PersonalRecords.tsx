/**
 * Component to display personal records per exercise
 */
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { PersonalRecord } from "@/hooks/usePRData";

interface PersonalRecordsProps {
  records: PersonalRecord[];
}

const PersonalRecords = ({ records }: PersonalRecordsProps) => {
  if (records.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="accent-bar" />
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-black tracking-tight text-foreground">Records Personales</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-6">
          Completá entrenamientos para ver tus PRs
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated rounded-2xl p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="accent-bar" />
        <Trophy className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-black tracking-tight text-foreground">Records Personales</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {records.slice(0, 8).map((pr, index) => (
          <motion.div
            key={pr.exerciseName}
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{pr.exerciseName}</p>
              <p className="text-xs text-muted-foreground">
                {pr.reps} reps &middot; {new Date(pr.date + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
              </p>
            </div>
            <div className="flex items-baseline gap-1 ml-3">
              <span className="text-lg font-bold text-foreground">{pr.weight}</span>
              <span className="text-xs text-muted-foreground">kg</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PersonalRecords;
