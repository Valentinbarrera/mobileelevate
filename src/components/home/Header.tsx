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
    <motion.div 
      className="flex items-center justify-between px-4 pt-4 pb-2"
      variants={fadeUp}
    >
      {/* Avatar + Streak pill */}
      <motion.button
        className="flex items-center gap-2.5 bg-card/80 backdrop-blur-sm border border-border/50 rounded-full pl-1.5 pr-4 py-1.5"
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/profile")}
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 via-primary/20 to-secondary flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
            <span className="text-foreground font-bold text-sm">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <motion.span 
            className="absolute -bottom-1 -right-0.5 text-[6px] bg-gradient-primary text-primary-foreground px-1.5 py-px rounded-full font-black uppercase shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, delay: 0.3 }}
          >
            Pro
          </motion.span>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 0] }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Flame className="w-4 h-4 text-primary" />
          </motion.div>
          <span className="text-foreground text-sm font-bold tabular-nums">{streakDays}</span>
          <span className="text-muted-foreground text-[10px] font-semibold uppercase">días</span>
        </div>
      </motion.button>
      
      {/* Notification */}
      <motion.button 
        className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center relative"
        whileTap={{ scale: 0.93 }}
        whileHover={{ borderColor: "hsl(var(--primary) / 0.3)" }}
      >
        <Bell className="w-[18px] h-[18px] text-muted-foreground" />
        <motion.span 
          className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
      </motion.button>
    </motion.div>
  );
};

export default Header;
