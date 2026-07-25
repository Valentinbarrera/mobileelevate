import { motion } from "framer-motion";
import { Home, ClipboardList } from "lucide-react";

interface SummaryActionsProps {
  onGoHome: () => void;
  onViewRoutine: () => void;
}

const SummaryActions = ({ onGoHome, onViewRoutine }: SummaryActionsProps) => {
  return (
    <motion.div
      className="px-5 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] pt-2 space-y-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
    >
      {/* Acción principal */}
      <motion.button
        onClick={onGoHome}
        className="w-full flex items-center justify-center gap-3 bg-gradient-primary rounded-2xl py-4 min-h-[56px] shadow-lg glow-primary"
        whileTap={{ scale: 0.98 }}
      >
        <Home className="w-5 h-5 text-primary-foreground" />
        <span className="text-primary-foreground font-black text-base tracking-wide uppercase">
          Volver al inicio
        </span>
      </motion.button>

      {/* Acción secundaria: ver la rutina/programa */}
      <motion.button
        onClick={onViewRoutine}
        className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-3.5 min-h-[52px] bg-secondary/60 border border-border text-foreground active:scale-[0.99] transition-transform"
        whileTap={{ scale: 0.98 }}
      >
        <ClipboardList className="w-5 h-5 text-primary" />
        <span className="font-bold text-sm">Ver mi rutina</span>
      </motion.button>
    </motion.div>
  );
};

export default SummaryActions;
