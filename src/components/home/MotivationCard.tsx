import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
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
        className="relative rounded-2xl p-5 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(18 100% 55% / 0.12), hsl(28 100% 52% / 0.06), transparent)',
          border: '1px solid hsl(18 100% 55% / 0.15)',
        }}
        variants={fadeUp}
      >
        {/* Ambient glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <Quote className="w-6 h-6 text-primary/40 mb-2" />
          
          <p className="text-foreground font-medium text-[15px] leading-relaxed">
            {message}
          </p>
          
          <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-border/30">
            <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground text-[8px] font-bold">CO</span>
            </div>
            <div>
              <p className="text-foreground text-xs font-semibold">{author}</p>
              <p className="text-muted-foreground text-[10px]">Mensaje del día</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

MotivationCard.displayName = "MotivationCard";

export default MotivationCard;
