import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, SkipForward, Plus, Minus, Clock, Dumbbell } from "lucide-react";

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
      navigator.vibrate([200, 100, 200]); // Pattern: vibrate, pause, vibrate
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
  const circumference = 2 * Math.PI * 110;
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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Title */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative text-center mb-6 z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Tiempo de descanso</span>
        </div>
        <h2 className="text-3xl font-black text-foreground mb-2">Descansá</h2>
        <p className="text-muted-foreground">Preparate para la siguiente serie</p>
      </motion.div>

      {/* Circular Timer */}
      <motion.div 
        className="relative z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
      >
        <svg width="260" height="260" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="130"
            cy="130"
            r="110"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="16"
          />
          {/* Progress circle */}
          <motion.circle
            cx="130"
            cy="130"
            r="110"
            fill="none"
            stroke="url(#timerGradient)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "linear" }}
            filter="drop-shadow(0 0 12px hsl(var(--primary) / 0.6))"
          />
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(25 95% 53%)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className="text-7xl font-black text-foreground tabular-nums tracking-tight"
            key={timeLeft}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {formatTime(timeLeft)}
          </motion.span>
          <span className="text-muted-foreground text-sm mt-2 font-medium">restante</span>
        </div>
      </motion.div>

      {/* Time Adjustment Buttons */}
      <motion.div 
        className="flex items-center gap-6 mt-10 z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={() => addTime(-15)}
          className="w-16 h-16 rounded-2xl bg-secondary/80 backdrop-blur-sm border border-border flex flex-col items-center justify-center text-foreground hover:bg-secondary transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <Minus className="w-5 h-5" />
          <span className="text-xs mt-0.5 text-muted-foreground">15s</span>
        </motion.button>
        
        <motion.button
          onClick={() => setIsPaused(!isPaused)}
          className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${
            isPaused 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40" 
              : "bg-secondary/80 backdrop-blur-sm border border-border text-foreground hover:bg-secondary"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {isPaused ? (
            <Play className="w-8 h-8 ml-1" />
          ) : (
            <div className="flex gap-1.5">
              <div className="w-2 h-7 bg-foreground rounded-full" />
              <div className="w-2 h-7 bg-foreground rounded-full" />
            </div>
          )}
        </motion.button>
        
        <motion.button
          onClick={() => addTime(15)}
          className="w-16 h-16 rounded-2xl bg-secondary/80 backdrop-blur-sm border border-border flex flex-col items-center justify-center text-foreground hover:bg-secondary transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs mt-0.5 text-muted-foreground">15s</span>
        </motion.button>
      </motion.div>

      {/* Skip Button */}
      <motion.button
        onClick={onSkip}
        className="mt-8 px-10 py-4 rounded-2xl bg-gradient-primary text-primary-foreground font-bold flex items-center gap-3 shadow-lg glow-primary z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <SkipForward className="w-5 h-5" />
        SIGUIENTE SERIE
      </motion.button>

      {/* Next Exercise Preview */}
      {nextExercise && (
        <motion.div 
          className="mb-6 z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/30">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-primary font-semibold uppercase tracking-wider">Siguiente ejercicio</p>
              <p className="text-foreground font-bold">{nextExercise.name}</p>
              <p className="text-xs text-muted-foreground">
                {nextExercise.sets} series × {nextExercise.reps}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Motivational Message */}
      <motion.div 
        className="absolute bottom-10 left-0 right-0 px-8 z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-secondary/50 backdrop-blur-sm border border-border">
          <span className="text-2xl">{motivationalMessage.emoji}</span>
          <p className="text-sm text-muted-foreground font-medium">{motivationalMessage.text}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RestTimer;
