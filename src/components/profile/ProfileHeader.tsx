import { motion } from "framer-motion";
import { ArrowLeft, Settings } from "lucide-react";

interface ProfileHeaderProps {
  onBack: () => void;
}

const ProfileHeader = ({ onBack }: ProfileHeaderProps) => {
  return (
    <motion.header 
      className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <motion.button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        
        <h1 className="text-xl font-black tracking-tight text-foreground">Perfil Elite</h1>
        
        <motion.button
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.header>
  );
};

export default ProfileHeader;
