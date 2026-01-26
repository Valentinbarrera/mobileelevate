import { motion } from "framer-motion";

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
      className="mx-5 mt-6 bg-secondary/60 border border-border rounded-2xl p-5"
      whileHover={{ borderColor: "hsl(var(--primary) / 0.3)" }}
    >
      <div className="flex items-center gap-4 mb-4">
        {/* Badge de nivel prominente */}
        <motion.div 
          className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg glow-primary"
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          <span className="text-primary-foreground font-black text-2xl">{level}</span>
        </motion.div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-foreground font-bold text-base">NIVEL {level}</span>
            <span className="text-muted-foreground text-sm font-medium">
              {currentXP.toLocaleString()} / {targetXP.toLocaleString()} XP
            </span>
          </div>
          <p className="text-primary text-xs font-semibold uppercase tracking-wider">{badge || "Elite Athlete Status"}</p>
        </div>
      </div>
      
      {/* Progress Bar con animación */}
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-primary rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          {/* Efecto de brillo animado */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        </motion.div>
      </div>
      
      {/* Meta especial */}
      <div className="flex items-center justify-center gap-2 mt-4 bg-primary/10 rounded-xl py-2">
        <span className="text-lg">⚡</span>
        <p className="text-primary text-xs font-bold uppercase tracking-wider">
          Meta: Double XP Weekend
        </p>
      </div>
    </motion.div>
  );
};

export default LevelProgress;
