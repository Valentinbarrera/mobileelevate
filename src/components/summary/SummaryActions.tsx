import { motion } from "framer-motion";
import { Share2, Home, Instagram, MessageCircle } from "lucide-react";

interface SummaryActionsProps {
  onShare: () => void;
  onGoHome: () => void;
}

const SummaryActions = ({ onShare, onGoHome }: SummaryActionsProps) => {
  return (
    <motion.div 
      className="px-5 pb-10 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4 }}
    >
      {/* Share Buttons */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
          Compartir logro
        </p>
        <div className="flex justify-center gap-3">
          <motion.button
            onClick={onShare}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Instagram className="w-6 h-6" />
          </motion.button>
          
          <motion.button
            onClick={onShare}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
          
          <motion.button
            onClick={onShare}
            className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center text-foreground"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* Home Button */}
      <motion.button
        onClick={onGoHome}
        className="w-full flex items-center justify-center gap-3 bg-gradient-primary rounded-2xl py-5 min-h-[64px] shadow-lg glow-primary"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Home className="w-5 h-5 text-primary-foreground" />
        <span className="text-primary-foreground font-bold text-lg tracking-wide">
          VOLVER AL INICIO
        </span>
      </motion.button>
    </motion.div>
  );
};

export default SummaryActions;
