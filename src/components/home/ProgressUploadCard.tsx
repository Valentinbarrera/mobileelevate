import { Camera, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fadeUp } from "@/lib/animations";

const ProgressUploadCard = () => {
  const navigate = useNavigate();
  
  return (
    <motion.button 
      onClick={() => navigate("/progress/upload")}
      className="flex items-center justify-between w-full bg-secondary/50 border border-border hover:border-primary/40 rounded-xl px-4 py-3 transition-smooth group touch-target"
      variants={fadeUp}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
          <Camera className="w-5 h-5 text-primary" />
        </div>
        <div className="text-left">
          <span className="text-foreground font-semibold text-sm block">Subí tu progreso</span>
          <span className="text-muted-foreground text-xs">Registrá tu avance semanal</span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-smooth" />
    </motion.button>
  );
};

export default ProgressUploadCard;
