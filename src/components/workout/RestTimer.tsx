import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, SkipForward, Plus, Minus, Clock, Dumbbell, Zap } from "lucide-react";

interface RestTimerProps {
  duration: number;
  onComplete: () => void;
  onSkip: () => void;
  nextExercise?: {
    name: string;
    sets: number;
    reps: string;
  } | null;
  enableVibration?: boolean;
  enableSound?: boolean;
}

const motivationalMessages = [
  { emoji: "💪", text: "¡Vas muy bien! Mantené el ritmo." },
  { emoji: "🔥", text: "¡Estás on fire! La siguiente serie va a ser épica." },
  { emoji: "💧", text: "Aprovechá para hidratarte." },
  { emoji: "🧘", text: "Respirá profundo y preparate." },
  { emoji: "⚡", text: "La energía está alta, seguí así." },
];

const RestTimer = ({ 
  duration, 
  onComplete, 
  onSkip,
  nextExercise,
  enableVibration = true,
  enableSound = true,
}: RestTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const [motivationalMessage] = useState(() => 
    motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
  );

  // Vibration function
  const triggerVibration = useCallback(() => {
    if (enableVibration && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, [enableVibration]);

  // Sound function
  const playSound = useCallback(() => {
    if (enableSound) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (e) {
        console.log('Audio not available');
      }
    }
  }, [enableSound]);

  useEffect(() => {
    if (timeLeft <= 0) {
      triggerVibration();
      playSound();
      onComplete();
      return;
    }

    // Countdown warning at 3 seconds
    if (timeLeft <= 3 && timeLeft > 0) {
      if (enableVibration && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }

    if (!isPaused) {
      const interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timeLeft, isPaused, onComplete, triggerVibration, playSound, enableVibration]);

  const progress = ((duration - timeLeft) / duration) * 100;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const addTime = (seconds: number) => {
    setTimeLeft(prev => Math.max(0, prev + seconds));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 5;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-background py-8 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative text-center z-10 pt-4"
      >
        <motion.div 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/15 border border-primary/30 mb-3"
          animate={isLowTime ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
        >
          <Clock className={`w-4 h-4 ${isLowTime ? "text-red-400" : "text-primary"}`} />
          <span className={`text-sm font-bold tracking-wide ${isLowTime ? "text-red-400" : "text-primary"}`}>
            {isLowTime ? "¡PREPARATE!" : "DESCANSO"}
          </span>
        </motion.div>
      </motion.div>

      {/* Main Timer Section */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 -mt-8">
        {/* Circular Timer */}
        <motion.div 
          className="relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          {/* Outer Glow Ring */}
          <div className={`absolute inset-0 rounded-full ${isLowTime ? "bg-red-500/20" : "bg-primary/20"} blur-xl scale-110`} />
          
          <svg width="220" height="220" className="transform -rotate-90 relative z-10">
            {/* Background circle */}
            <circle
              cx="110"
              cy="110"
              r="90"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <motion.circle
              cx="110"
              cy="110"
              r="90"
              fill="none"
              stroke={isLowTime ? "hsl(0 80% 55%)" : "url(#timerGradient)"}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "linear" }}
              filter={`drop-shadow(0 0 15px ${isLowTime ? "hsl(0 80% 55% / 0.7)" : "hsl(var(--primary) / 0.7)"})`}
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(25 95% 60%)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              className={`text-6xl font-black tabular-nums tracking-tight ${isLowTime ? "text-red-400" : "text-foreground"}`}
              key={timeLeft}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              {formatTime(timeLeft)}
            </motion.span>
          </div>
        </motion.div>

        {/* Time Adjustment Buttons */}
        <motion.div 
          className="flex items-center gap-5 mt-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={() => addTime(-15)}
            className="w-14 h-14 rounded-2xl bg-secondary/70 backdrop-blur-sm border border-border flex flex-col items-center justify-center text-foreground active:bg-secondary transition-colors"
            whileTap={{ scale: 0.92 }}
          >
            <Minus className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 text-muted-foreground font-medium">15s</span>
          </motion.button>
          
          <motion.button
            onClick={() => setIsPaused(!isPaused)}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
              isPaused 
                ? "bg-gradient-primary text-primary-foreground shadow-lg glow-primary" 
                : "bg-secondary/70 backdrop-blur-sm border border-border text-foreground"
            }`}
            whileTap={{ scale: 0.92 }}
          >
            {isPaused ? (
              <Play className="w-7 h-7 ml-0.5" />
            ) : (
              <div className="flex gap-1.5">
                <div className="w-1.5 h-6 bg-foreground rounded-full" />
                <div className="w-1.5 h-6 bg-foreground rounded-full" />
              </div>
            )}
          </motion.button>
          
          <motion.button
            onClick={() => addTime(15)}
            className="w-14 h-14 rounded-2xl bg-secondary/70 backdrop-blur-sm border border-border flex flex-col items-center justify-center text-foreground active:bg-secondary transition-colors"
            whileTap={{ scale: 0.92 }}
          >
            <Plus className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 text-muted-foreground font-medium">15s</span>
          </motion.button>
        </motion.div>

        {/* Skip Button */}
        <motion.button
          onClick={onSkip}
          className="mt-6 px-8 py-3.5 rounded-2xl bg-gradient-primary text-primary-foreground font-bold flex items-center gap-2.5 shadow-lg glow-primary"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SkipForward className="w-5 h-5" />
          SIGUIENTE SERIE
        </motion.button>
      </div>

      {/* Bottom Section */}
      <div className="w-full px-5 space-y-3 z-10 pb-safe">
        {/* Next Exercise Preview */}
        {nextExercise && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-4 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <Zap className="w-3 h-3 text-primary" />
                  <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Siguiente</p>
                </div>
                <p className="text-foreground font-bold text-sm">{nextExercise.name}</p>
                <p className="text-xs text-muted-foreground">
                  {nextExercise.sets} series × {nextExercise.reps}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Motivational Message */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-secondary/40 backdrop-blur-sm border border-border"
        >
          <span className="text-xl">{motivationalMessage.emoji}</span>
          <p className="text-xs text-muted-foreground font-medium">{motivationalMessage.text}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RestTimer;