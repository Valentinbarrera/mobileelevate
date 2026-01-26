import { motion } from "framer-motion";
import { Trophy, Sparkles } from "lucide-react";
import Confetti from "./Confetti";

interface SummaryHeaderProps {
  workoutName: string;
}

const SummaryHeader = ({ workoutName }: SummaryHeaderProps) => {
  return (
    <div className="relative pt-12 pb-8 px-6 text-center overflow-hidden">
      {/* Confetti Animation */}
      <Confetti />

      {/* Trophy Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 15,
          delay: 0.2 
        }}
        className="relative inline-block mb-6"
      >
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/40">
          <Trophy className="w-14 h-14 text-white" />
        </div>
        
        {/* Sparkle Effects */}
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-8 h-8 text-amber-400" />
        </motion.div>
        
        <motion.div
          className="absolute -bottom-1 -left-3"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          <Sparkles className="w-6 h-6 text-primary" />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h1 className="text-3xl font-black text-foreground mb-2">
          ¡Entrenamiento
          <br />
          <span className="text-gradient-primary">Completado!</span>
        </h1>
        <p className="text-muted-foreground font-medium">{workoutName}</p>
      </motion.div>
    </div>
  );
};

export default SummaryHeader;
