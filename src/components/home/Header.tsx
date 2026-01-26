import { Flame, Bell } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderProps {
  userName: string;
  streakDays: number;
}

const Header = ({ userName, streakDays }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between px-5 py-4 sticky top-0 bg-background/95 backdrop-blur-md z-40 border-b border-border/50">
      <div className="flex items-center gap-3">
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-11 h-11 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg">
            CO
          </div>
          <span className="absolute -bottom-1 -right-1 text-[7px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
            Coach
          </span>
        </motion.div>
        <div className="flex flex-col">
          <span className="text-foreground font-extrabold text-lg tracking-tight">ELEVATE</span>
          <span className="text-muted-foreground text-[10px] uppercase tracking-widest">Training</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <motion.button 
          className="relative flex items-center gap-1.5 bg-secondary/80 border border-border rounded-full px-3.5 py-2.5 hover:bg-muted transition-colors min-h-[44px]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Flame className="w-4 h-4 text-primary" />
          <span className="text-foreground text-sm font-bold">{streakDays}</span>
          <span className="text-muted-foreground text-[10px] uppercase">días</span>
        </motion.button>
        <motion.button 
          className="w-11 h-11 rounded-full bg-secondary/80 border border-border flex items-center justify-center hover:bg-muted transition-colors relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        </motion.button>
      </div>
    </header>
  );
};

export default Header;
