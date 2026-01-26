import { Play, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface WorkoutCardProps {
  label: string;
  duration: string;
  title: string;
  imageUrl: string;
  intensity?: string;
  onStart?: () => void;
}

const WorkoutCard = ({ label, duration, title, imageUrl, intensity = "Alta", onStart }: WorkoutCardProps) => {
  return (
    <motion.div 
      className="mx-5 mt-5 relative rounded-2xl overflow-hidden shadow-xl"
      whileHover={{ scale: 1.01 }}
    >
      <div 
        className="relative h-56 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        {/* Gradient overlay mejorado */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Tags superiores - Jerarquía 3 */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              {label}
            </span>
          </div>
          <div className="flex items-center gap-3 bg-background/60 backdrop-blur-sm rounded-full px-3 py-1.5">
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
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {/* Título - Jerarquía 1 */}
          <h2 className="text-2xl font-black text-foreground mb-4 tracking-tight">{title}</h2>
          
          {/* CTA Principal - Máxima prominencia */}
          <motion.button 
            onClick={onStart}
            className="w-full flex items-center justify-center gap-3 bg-gradient-primary rounded-2xl py-4 min-h-[56px] shadow-lg glow-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Play className="w-5 h-5 text-primary-foreground fill-current ml-0.5" />
            </div>
            <span className="text-primary-foreground font-bold text-base tracking-wide">EMPEZAR ENTRENAMIENTO</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default WorkoutCard;
