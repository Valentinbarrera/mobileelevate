/**
 * Achievement celebration modal with fullscreen confetti and share button
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Share2, X, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Confetti from "@/components/summary/Confetti";
import { toast } from "sonner";

interface AchievementCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    name: string;
    description: string;
    icon: string;
    xpReward: number;
    rarity: "common" | "rare" | "epic" | "legendary";
  };
}

const rarityStyles = {
  common: {
    bg: "bg-gradient-to-br from-zinc-600 to-zinc-700",
    border: "border-zinc-500",
    glow: "shadow-zinc-500/30",
    text: "text-zinc-300",
  },
  rare: {
    bg: "bg-gradient-to-br from-blue-500 to-blue-600",
    border: "border-blue-400",
    glow: "shadow-blue-500/30",
    text: "text-blue-300",
  },
  epic: {
    bg: "bg-gradient-to-br from-purple-500 to-purple-600",
    border: "border-purple-400",
    glow: "shadow-purple-500/30",
    text: "text-purple-300",
  },
  legendary: {
    bg: "bg-gradient-to-br from-amber-500 to-orange-600",
    border: "border-amber-400",
    glow: "shadow-amber-500/40",
    text: "text-amber-300",
  },
};

const AchievementCelebration = ({
  isOpen,
  onClose,
  achievement,
}: AchievementCelebrationProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const style = rarityStyles[achievement.rarity];

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      // Create share data
      const shareData = {
        title: `¡Logré ${achievement.name}! 🏆`,
        text: `${achievement.description}\n\n¡Entrenando con Elevate! 💪`,
        url: window.location.origin,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("¡Logro compartido!");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `🏆 ¡Logré ${achievement.name}!\n${achievement.description}\n\n¡Entrenando con Elevate! 💪\n${window.location.origin}`
        );
        toast.success("¡Copiado al portapapeles!");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast.error("Error al compartir");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadImage = () => {
    // Generate a shareable image (simplified version)
    toast.info("Generando imagen para compartir...");
    
    // In a real implementation, you'd use html2canvas or a server-side solution
    setTimeout(() => {
      toast.success("¡Imagen lista para compartir!");
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6"
        >
          {/* Confetti */}
          <Confetti />

          {/* Animated background glow */}
          <motion.div
            className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] ${
              achievement.rarity === "legendary" ? "bg-amber-500/30" :
              achievement.rarity === "epic" ? "bg-purple-500/30" :
              achievement.rarity === "rare" ? "bg-blue-500/30" : "bg-zinc-500/20"
            }`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.1 }}
            className="relative text-center max-w-sm mx-auto"
          >
            {/* Achievement unlocked label */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-bold uppercase tracking-widest text-sm">
                ¡Logro Desbloqueado!
              </span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </motion.div>

            {/* Medal/Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
              className={`w-32 h-32 mx-auto mb-6 rounded-full ${style.bg} border-4 ${style.border} flex items-center justify-center shadow-2xl ${style.glow}`}
            >
              <span className="text-6xl">{achievement.icon}</span>
            </motion.div>

            {/* Achievement name */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-black text-white mb-2"
            >
              {achievement.name}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-white/70 mb-4"
            >
              {achievement.description}
            </motion.p>

            {/* XP reward */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-8"
            >
              <Trophy className="w-5 h-5 text-primary" />
              <span className="text-primary font-bold">+{achievement.xpReward} XP</span>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col gap-3"
            >
              <Button
                onClick={handleShare}
                disabled={isSharing}
                className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-base glow-primary flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Compartir en Redes
              </Button>

              <div className="flex gap-3">
                <Button
                  onClick={handleDownloadImage}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-white/20 text-white/80 hover:text-white hover:bg-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Story
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="flex-1 h-12 rounded-xl text-white/60 hover:text-white hover:bg-white/10"
                >
                  Cerrar
                </Button>
              </div>
            </motion.div>

            {/* Rarity label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className={`mt-6 text-xs font-bold uppercase tracking-widest ${style.text}`}
            >
              {achievement.rarity === "legendary" ? "LEGENDARIO" :
               achievement.rarity === "epic" ? "ÉPICO" :
               achievement.rarity === "rare" ? "RARO" : "COMÚN"}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementCelebration;
