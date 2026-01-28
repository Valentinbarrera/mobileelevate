import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";
import type { Routine } from "@/types/routine";
import RoutineCard from "./RoutineCard";

interface RoutinesListProps {
  routines: Routine[];
  emptyMessage: string;
}

const RoutinesList = ({ routines, emptyMessage }: RoutinesListProps) => {
  if (routines.length === 0) {
    return (
      <motion.div 
        className="px-5 py-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
          <Dumbbell className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </motion.div>
    );
  }

  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Tu Semana
        </h2>
        <span className="text-xs text-muted-foreground">
          {routines.length} sesiones
        </span>
      </div>
      
      <div className="space-y-3">
        {routines.map((routine, index) => (
          <RoutineCard 
            key={routine.id} 
            routine={routine} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default RoutinesList;
