import { Camera, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const ProgressUploadCard = () => {
  return (
    <motion.button 
      className="mx-5 flex items-center justify-between w-[calc(100%-2.5rem)] bg-secondary/60 border border-border hover:border-primary/50 rounded-2xl px-4 py-4 transition-all group min-h-[60px]"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Camera className="w-5 h-5 text-primary" />
        </div>
        <div className="text-left">
          <span className="text-foreground font-bold text-sm tracking-wide block">SUBÍ TU PROGRESO</span>
          <span className="text-muted-foreground text-xs">Registrá tu avance semanal</span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </motion.button>
  );
};

export default ProgressUploadCard;
