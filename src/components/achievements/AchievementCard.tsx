import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Check, Sparkles } from "lucide-react";
import type { Achievement, AchievementRarity } from "@/types/achievement";
import AchievementCelebration from "./AchievementCelebration";

interface AchievementCardProps {
  achievement: Achievement;
  index: number;
  onClaim?: (achievement: Achievement) => void;
}

const rarityConfig: Record<AchievementRarity, { border: string; bg: string; glow: string; label: string; labelColor: string }> = {
  common: {
    border: "border-zinc-500/30",
    bg: "bg-zinc-500/5",
    glow: "",
    label: "Común",
    labelColor: "text-zinc-400",
  },
  rare: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    glow: "shadow-blue-500/20",
    label: "Raro",
    labelColor: "text-blue-400",
  },
  epic: {
    border: "border-purple-500/30",
    bg: "bg-purple-500/5",
    glow: "shadow-purple-500/20",
    label: "Épico",
    labelColor: "text-purple-400",
  },
  legendary: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    glow: "shadow-amber-500/30",
    label: "Legendario",
    labelColor: "text-amber-400",
  },
};

const AchievementCard = React.forwardRef<HTMLDivElement, AchievementCardProps>(
  ({ achievement, index, onClaim }, ref) => {
    const [showCelebration, setShowCelebration] = useState(false);
    const rarity = rarityConfig[achievement.rarity];
    const isLocked = achievement.status === "locked";
    const isUnlocked = achievement.status === "unlocked";
    const isClaimed = achievement.status === "claimed";

    const handleClaim = () => {
      setShowCelebration(true);
      onClaim?.(achievement);
    };

    return (
      <motion.div
        ref={ref}
        className={`relative overflow-hidden rounded-2xl border p-4 ${
          isLocked 
            ? "bg-card/50 border-border opacity-60" 
            : `${rarity.bg} ${rarity.border} ${isUnlocked ? `shadow-lg ${rarity.glow}` : ""}`
        }`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35 + index * 0.05 }}
        whileHover={{ scale: isLocked ? 1 : 1.02 }}
      >
        {/* Unlocked glow effect */}
        {isUnlocked && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {isLocked && (
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
              <Lock className="w-3 h-3 text-muted-foreground" />
            </div>
          )}
          {isUnlocked && (
            <motion.div 
              className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </motion.div>
          )}
          {isClaimed && (
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Icon */}
        <motion.div 
          className={`text-4xl mb-3 ${isLocked ? "grayscale opacity-50" : ""}`}
          animate={isUnlocked ? { 
            rotate: [0, -5, 5, 0],
            scale: [1, 1.1, 1],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {achievement.icon}
        </motion.div>

        {/* Name */}
        <h4 className={`font-bold text-sm mb-1 ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
          {achievement.name}
        </h4>

        {/* Description */}
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {achievement.description}
        </p>

        {/* Progress Bar (for locked achievements) */}
        {isLocked && achievement.progress !== undefined && achievement.maxProgress && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-semibold text-foreground">
                {achievement.progress}/{achievement.maxProgress}
              </span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                transition={{ delay: 0.5, duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${rarity.labelColor}`}>
            {rarity.label}
          </span>
          <span className="text-xs font-bold text-primary">+{achievement.xpReward} XP</span>
        </div>

        {/* Claim Button */}
        {isUnlocked && (
          <motion.button
            className="w-full mt-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleClaim}
          >
            RECLAMAR
          </motion.button>
        )}

        {/* Unlocked Date */}
        {isClaimed && achievement.unlockedAt && (
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Desbloqueado: {achievement.unlockedAt}
          </p>
        )}

        {/* Celebration Modal */}
        <AchievementCelebration
          isOpen={showCelebration}
          onClose={() => setShowCelebration(false)}
          achievement={{
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            xpReward: achievement.xpReward,
            rarity: achievement.rarity,
          }}
        />
      </motion.div>
    );
  }
);

AchievementCard.displayName = "AchievementCard";

export default AchievementCard;
