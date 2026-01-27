import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

interface LevelProgressProps {
  level: number;
  currentXP: number;
  targetXP: number;
  badge?: string;
}

const LevelProgress = ({ level, currentXP, targetXP, badge }: LevelProgressProps) => {
  const progressPercent = (currentXP / targetXP) * 100;
  
  return (
    <motion.div 
      className="mx-5 mt-5 bg-card border border-border rounded-2xl p-4"
      variants={fadeUp}
      whileHover={{ borderColor: "hsl(var(--primary) / 0.3)" }}
    >
      <div className="flex items-center gap-3 mb-3">
        {/* Badge de nivel */}
        <motion.div 
          className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg glow-primary-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-primary-foreground font-black text-xl">{level}</span>
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-foreground font-bold text-sm">Nivel {level}</span>
            <span className="text-muted-foreground text-xs font-medium tabular-nums">
              {currentXP.toLocaleString()} / {targetXP.toLocaleString()} XP
            </span>
          </div>
          <p className="text-primary text-[10px] font-semibold uppercase tracking-wider truncate">
            {badge || "Elite Athlete Status"}
          </p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-primary rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
          />
        </motion.div>
      </div>
      
      {/* Meta especial */}
      <div className="flex items-center justify-center gap-1.5 mt-3 py-1.5">
        <span className="text-base">⚡</span>
        <p className="text-primary text-[10px] font-bold uppercase tracking-wider">
          Double XP Weekend
        </p>
      </div>
    </motion.div>
  );
};

export default LevelProgress;
