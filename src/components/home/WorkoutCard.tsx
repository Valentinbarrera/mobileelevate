import React from "react";
import { Play, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fadeUp } from "@/lib/animations";

interface WorkoutCardProps {
  label: string;
  duration: string;
  title: string;
  imageUrl: string;
  intensity?: string;
  workoutId?: string;
  onStart?: () => void;
}

const WorkoutCard = React.forwardRef<HTMLDivElement, WorkoutCardProps>(({ 
  label, 
  duration, 
  title, 
  imageUrl, 
  intensity = "Alta", 
  workoutId = "1", 
  onStart 
}, ref) => {
  const navigate = useNavigate();
  
  const handleStart = () => {
    if (onStart) onStart();
    navigate(`/workout/${workoutId}`);
  };

  return (
    <motion.div 
      ref={ref}
      className="relative rounded-2xl overflow-hidden shadow-xl"
      variants={fadeUp}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      <div 
        className="relative h-52 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        
        {/* Tags superiores */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg">
            {label}
          </span>
          
          <div className="flex items-center gap-2 bg-background/70 backdrop-blur-md rounded-lg px-2.5 py-1.5">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-foreground text-xs font-medium">{duration}</span>
            </div>
            <div className="w-px h-3 bg-border" />
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-foreground text-xs font-medium">{intensity}</span>
            </div>
          </div>
        </div>
        
        {/* Contenido inferior */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-xl font-black text-foreground mb-3 tracking-tight text-display leading-tight">
            {title}
          </h2>
          
          {/* CTA Principal */}
          <motion.button 
            onClick={handleStart}
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-primary rounded-xl py-3.5 touch-target-lg shadow-lg glow-primary"
            whileHover={{ scale: 1.01, boxShadow: "0 0 30px hsl(18 100% 55% / 0.5)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Play className="w-4 h-4 text-primary-foreground fill-current ml-0.5" />
            </div>
            <span className="text-primary-foreground font-bold text-sm tracking-wide uppercase">
              Empezar Entrenamiento
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

WorkoutCard.displayName = "WorkoutCard";

export default WorkoutCard;
