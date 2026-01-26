import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, SkipForward, Plus, Minus } from "lucide-react";

interface RestTimerProps {
  duration: number;
  onComplete: () => void;
  onSkip: () => void;
}

const RestTimer = ({ duration, onComplete, onSkip }: RestTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    if (!isPaused) {
      const interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timeLeft, isPaused, onComplete]);

  const progress = ((duration - timeLeft) / duration) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const addTime = (seconds: number) => {
    setTimeLeft(prev => Math.max(0, prev + seconds));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Title */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-2">Descansá</h2>
        <p className="text-muted-foreground">Preparate para la siguiente serie</p>
      </motion.div>

      {/* Circular Timer */}
      <motion.div 
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <svg width="280" height="280" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <motion.circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "linear" }}
            className="drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]"
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className="text-6xl font-black text-foreground tabular-nums"
            key={timeLeft}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          >
            {formatTime(timeLeft)}
          </motion.span>
          <span className="text-muted-foreground text-sm mt-2">segundos restantes</span>
        </div>
      </motion.div>

      {/* Time Adjustment Buttons */}
      <motion.div 
        className="flex items-center gap-4 mt-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={() => addTime(-15)}
          className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
        >
          <Minus className="w-6 h-6" />
        </button>
        <span className="text-muted-foreground text-sm w-16 text-center">±15s</span>
        <button
          onClick={() => addTime(15)}
          className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        className="flex items-center gap-4 mt-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
        >
          {isPaused ? (
            <Play className="w-7 h-7 ml-1" />
          ) : (
            <div className="flex gap-1">
              <div className="w-1.5 h-6 bg-foreground rounded-full" />
              <div className="w-1.5 h-6 bg-foreground rounded-full" />
            </div>
          )}
        </button>
        
        <button
          onClick={onSkip}
          className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <SkipForward className="w-5 h-5" />
          SIGUIENTE SERIE
        </button>
      </motion.div>

      {/* Motivational Message */}
      <motion.p 
        className="absolute bottom-12 text-muted-foreground text-center px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        💪 ¡Vas muy bien! Aprovechá para hidratarte.
      </motion.p>
    </motion.div>
  );
};

export default RestTimer;
