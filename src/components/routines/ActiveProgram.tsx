import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import workoutHeroImage from "@/assets/workout-hero.jpg";

interface ActiveProgramProps {
  name: string;
  subtitle: string;
  progress: number;
}

const ActiveProgram = ({ name, subtitle, progress }: ActiveProgramProps) => {
  return (
    <motion.div 
      className="px-5 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
        Programa Activo
      </p>
      
      <motion.div
        className="relative rounded-3xl overflow-hidden"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Background Image */}
        <img 
          src={workoutHeroImage}
          alt="Program"
          className="w-full h-44 object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <p className="text-xs text-white/70 uppercase tracking-wider mb-1">{subtitle}</p>
          <h3 className="text-2xl font-black text-white mb-4">{name}</h3>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: 0.3, duration: 0.8 }}
              />
            </div>
            <span className="text-sm font-bold text-white">{progress}%</span>
            <ChevronRight className="w-5 h-5 text-white/60" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ActiveProgram;
