import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { fadeUp } from "@/lib/animations";

interface MotivationCardProps {
  message: string;
  author?: string;
}

const MotivationCard = React.forwardRef<HTMLDivElement, MotivationCardProps>(
  ({ message, author = "Tu Coach" }, ref) => {
    return (
      <motion.div 
        ref={ref}
        className="bg-gradient-to-br from-primary/15 via-primary/8 to-transparent border border-primary/25 rounded-2xl p-4 relative overflow-hidden"
        variants={fadeUp}
      >
        {/* Efecto de brillo sutil */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground font-medium text-sm leading-relaxed italic">
              "{message}"
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground text-[8px] font-bold">CO</span>
              </div>
              <p className="text-primary text-xs font-semibold">{author}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

MotivationCard.displayName = "MotivationCard";

export default MotivationCard;
