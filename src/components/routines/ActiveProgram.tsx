import { motion } from "framer-motion";
import { ChevronRight, Trophy } from "lucide-react";
import workoutHeroImage from "@/assets/workout-hero.jpg";

interface ActiveProgramProps {
  name: string;
  subtitle: string;
  progress: number;
}

const ActiveProgram = ({ name, subtitle: _subtitle, progress }: ActiveProgramProps) => {
  return (
    <motion.div 
      className="px-4 mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <motion.div
        className="relative rounded-2xl overflow-hidden"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Background Image */}
        <img 
          src={workoutHeroImage}
          alt="Program"
          className="w-full h-32 object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-primary" />
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Programa Activo</p>
            </div>
            <h3 className="text-lg font-black text-white mb-2">{name}</h3>
            
            {/* Progress Bar */}
            <div className="flex items-center gap-3 max-w-[200px]">
              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                />
              </div>
              <span className="text-xs font-bold text-white">{progress}%</span>
            </div>
          </div>
          
          <ChevronRight className="w-6 h-6 text-white/60" />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ActiveProgram;
