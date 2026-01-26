import { motion } from "framer-motion";
import { ArrowLeft, Pause, Play, Clock } from "lucide-react";

interface WorkoutHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  elapsedTime: string;
  isActive: boolean;
  isPaused: boolean;
  onPauseToggle: () => void;
}

const WorkoutHeader = ({ 
  title, 
  subtitle, 
  onBack, 
  elapsedTime, 
  isActive, 
  isPaused, 
  onPauseToggle 
}: WorkoutHeaderProps) => {
  return (
    <motion.header 
      className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex items-center justify-between px-5 py-4">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center flex-1 mx-4">
          <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>

        {/* Timer / Pause */}
        {isActive ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-secondary rounded-xl px-3 py-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono font-semibold text-foreground tabular-nums">
                {elapsedTime}
              </span>
            </div>
            <button
              onClick={onPauseToggle}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isPaused 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {isPaused ? (
                <Play className="w-5 h-5 ml-0.5" />
              ) : (
                <Pause className="w-5 h-5" />
              )}
            </button>
          </div>
        ) : (
          <div className="w-10" /> 
        )}
      </div>
    </motion.header>
  );
};

export default WorkoutHeader;
