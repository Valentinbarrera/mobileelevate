import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface MotivationCardProps {
  message: string;
  author?: string;
}

const MotivationCard = ({ message, author = "Tu Coach" }: MotivationCardProps) => {
  return (
    <motion.div 
      className="mx-5 mt-6 mb-8 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 rounded-2xl p-5 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Efecto de brillo sutil */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="flex items-start gap-4 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-foreground font-semibold text-base leading-relaxed italic">
            "{message}"
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground text-[10px] font-bold">CO</span>
            </div>
            <p className="text-primary text-sm font-bold">{author}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MotivationCard;
