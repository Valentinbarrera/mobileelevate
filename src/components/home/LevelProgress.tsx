import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";
import { fadeUp } from "@/lib/animations";

interface LevelProgressProps {
  level: number;
  currentXP: number;
  targetXP: number;
  badge?: string;
}

const LevelProgress = React.forwardRef<HTMLDivElement, LevelProgressProps>(({ 
  level, 
  currentXP, 
  targetXP, 
  badge 
}, ref) => {
  const navigate = useNavigate();
  const progressPercent = (currentXP / targetXP) * 100;
  
  const levelNames: Record<number, string> = {
    1: "Principiante",
    2: "Aprendiz",
    3: "Intermedio",
    4: "Avanzado",
    5: "Elite",
  };
  
  return (
    <motion.div 
      ref={ref}
      className="mx-4 mt-4 bg-card border border-border rounded-2xl p-4 cursor-pointer"
      variants={fadeUp}
      whileHover={{ borderColor: "hsl(var(--primary) / 0.3)" }}
      whileTap={{ scale: 0.99 }}
      onClick={() => navigate("/achievements")}
    >
      <div className="flex items-center gap-3">
        {/* Badge de nivel */}
        <motion.div 
          className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg glow-primary-sm relative"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-primary-foreground font-black text-2xl">{level}</span>
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-400" />
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div>
              <span className="text-foreground font-bold text-sm">Nivel {level}</span>
              <span className="text-primary text-xs font-semibold ml-2">{levelNames[level] || "Atleta"}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
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
            <span className="text-muted-foreground text-[10px] font-medium tabular-nums w-20 text-right">
              {currentXP.toLocaleString()} / {targetXP.toLocaleString()}
            </span>
          </div>

          {/* XP to next level */}
          <p className="text-[10px] text-muted-foreground mt-1">
            {(targetXP - currentXP).toLocaleString()} XP para nivel {level + 1}
          </p>
        </div>
      </div>
    </motion.div>
  );
});

LevelProgress.displayName = "LevelProgress";

export default LevelProgress;
