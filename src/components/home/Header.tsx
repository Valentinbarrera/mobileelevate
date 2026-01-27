import { Flame, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fadeUp } from "@/lib/animations";

interface HeaderProps {
  userName: string;
  streakDays: number;
}

const Header = ({ userName, streakDays }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <motion.header 
      className="flex items-center justify-between px-4 py-3 sticky top-0 bg-background/98 backdrop-blur-xl z-40 border-b border-border/50"
      variants={fadeUp}
    >
      {/* Logo y marca */}
      <div className="flex items-center gap-2.5">
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs shadow-lg">
            CO
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 text-[5px] bg-primary text-primary-foreground px-0.5 py-px rounded font-bold uppercase">
            Pro
          </span>
        </motion.div>
        <div className="flex flex-col">
          <span className="text-foreground font-extrabold text-sm tracking-tight">ELEVATE</span>
          <span className="text-muted-foreground text-[8px] uppercase tracking-widest">Training</span>
        </div>
      </div>
      
      {/* Acciones */}
      <div className="flex items-center gap-2">
        {/* Racha */}
        <motion.button 
          className="flex items-center gap-1 bg-card border border-border rounded-xl px-2.5 py-2 hover:bg-secondary transition-smooth touch-target"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/achievements")}
        >
          <Flame className="w-4 h-4 text-primary" />
          <span className="text-foreground text-sm font-bold tabular-nums">{streakDays}</span>
          <span className="text-muted-foreground text-[8px] uppercase">días</span>
        </motion.button>
        
        {/* Notificaciones */}
        <motion.button 
          className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-secondary transition-smooth relative touch-target"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Bell className="w-4 h-4 text-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
        </motion.button>
      </div>
    </motion.header>
  );
};

export default Header;
