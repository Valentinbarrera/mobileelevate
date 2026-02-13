import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Sparkles, Star } from "lucide-react";
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

  const levelEmojis: Record<number, string> = {
    1: "🌱", 2: "⚡", 3: "🔥", 4: "💎", 5: "👑",
  };
  
  return (
    <motion.div 
      ref={ref}
      className="bg-card border border-border rounded-2xl p-4 cursor-pointer overflow-hidden relative"
      variants={fadeUp}
      whileHover={{ borderColor: "hsl(var(--primary) / 0.3)" }}
      whileTap={{ scale: 0.99 }}
      onClick={() => navigate("/achievements")}
    >
      {/* Subtle ambient glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
      
      <div className="flex items-center gap-3 relative z-10">
        {/* Badge de nivel */}
        <motion.div 
          className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg relative"
          style={{ boxShadow: '0 4px 16px hsl(18 100% 55% / 0.25)' }}
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-2xl">{levelEmojis[level] || "🏆"}</span>
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
          </motion.div>
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-2">
              <span className="text-foreground font-bold text-sm">Nivel {level}</span>
              <span className="text-primary text-[11px] font-semibold px-2 py-0.5 bg-primary/10 rounded-full">{levelNames[level] || "Atleta"}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
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
          </div>

          {/* XP info */}
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] text-muted-foreground">
              <span className="text-primary font-semibold">{(targetXP - currentXP).toLocaleString()} XP</span> para nivel {level + 1}
            </p>
            <span className="text-muted-foreground text-[10px] font-medium tabular-nums">
              {currentXP.toLocaleString()} / {targetXP.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

LevelProgress.displayName = "LevelProgress";

export default LevelProgress;
