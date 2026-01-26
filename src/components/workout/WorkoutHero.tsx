import { motion } from "framer-motion";
import { ArrowLeft, Clock, Zap, Target } from "lucide-react";
import workoutHeroImage from "@/assets/workout-hero.jpg";

interface WorkoutHeroProps {
  title: string;
  subtitle: string;
  duration: string;
  intensity: string;
  focus: string;
  onBack: () => void;
}

const WorkoutHero = ({ 
  title, 
  subtitle, 
  duration, 
  intensity, 
  focus, 
  onBack 
}: WorkoutHeroProps) => {
  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Hero Image */}
      <div className="relative h-[320px] overflow-hidden">
        <img 
          src={workoutHeroImage}
          alt="Workout"
          className="w-full h-full object-cover"
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-transparent h-24" />
        
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className="absolute top-4 left-4 z-10 flex items-center gap-2 text-white/90 hover:text-white transition-colors"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider">
            Vista previa
          </span>
        </motion.button>

        {/* Title Section */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-6">
          <motion.p 
            className="text-xs text-primary font-semibold uppercase tracking-wider mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
          <motion.h1 
            className="text-4xl font-black text-white leading-tight tracking-tight"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {title}
          </motion.h1>
        </div>
      </div>

      {/* Info Badges */}
      <motion.div 
        className="px-5 py-4 flex flex-wrap gap-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary/80 border border-border">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{duration}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary/80 border border-border">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-foreground">{intensity}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary/80 border border-border">
          <Target className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-foreground">{focus}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WorkoutHero;
