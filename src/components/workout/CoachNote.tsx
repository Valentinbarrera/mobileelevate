import { motion } from "framer-motion";
import { MessageCircle, User } from "lucide-react";

interface CoachNoteProps {
  coachName: string;
  message: string;
}

const CoachNote = ({ coachName, message }: CoachNoteProps) => {
  return (
    <motion.div 
      className="px-5 pb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/20">
        <div className="flex items-start gap-3">
          {/* Coach Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          
          {/* Message */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-foreground text-sm">{coachName}</span>
              <span className="text-xs text-primary bg-primary/20 px-2 py-0.5 rounded-full">
                Tu profe
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        
        {/* Reply hint */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-primary/10">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Tocá para enviar un mensaje</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CoachNote;
