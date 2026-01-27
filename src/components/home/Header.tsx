import { Flame, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

interface HeaderProps {
  userName: string;
  streakDays: number;
}

const Header = ({ userName, streakDays }: HeaderProps) => {
  return (
    <motion.header 
      className="flex items-center justify-between px-5 py-3 sticky top-0 bg-background/98 backdrop-blur-xl z-40 border-b border-border/50"
      variants={fadeUp}
    >
      {/* Logo y marca */}
      <div className="flex items-center gap-3">
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg">
            CO
          </div>
          <span className="absolute -bottom-1 -right-1 text-[6px] bg-primary text-primary-foreground px-1 py-0.5 rounded font-bold uppercase tracking-wide">
            Coach
          </span>
        </motion.div>
        <div className="flex flex-col">
          <span className="text-foreground font-extrabold text-base tracking-tight">ELEVATE</span>
          <span className="text-muted-foreground text-[9px] uppercase tracking-widest">Training</span>
        </div>
      </div>
      
      {/* Acciones */}
      <div className="flex items-center gap-2">
        {/* Racha */}
        <motion.button 
          className="flex items-center gap-1.5 bg-secondary/80 border border-border rounded-xl px-3 py-2 hover:bg-muted transition-smooth touch-target"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Flame className="w-4 h-4 text-primary" />
          <span className="text-foreground text-sm font-bold tabular-nums">{streakDays}</span>
          <span className="text-muted-foreground text-[9px] uppercase">días</span>
        </motion.button>
        
        {/* Notificaciones */}
        <motion.button 
          className="w-10 h-10 rounded-xl bg-secondary/80 border border-border flex items-center justify-center hover:bg-muted transition-smooth relative touch-target"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
        </motion.button>
      </div>
    </motion.header>
  );
};

export default Header;
