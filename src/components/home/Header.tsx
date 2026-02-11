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
      className="flex items-center justify-between px-4 py-3 sticky top-0 bg-background/95 backdrop-blur-xl z-40"
      variants={fadeUp}
    >
      {/* Avatar + Streak */}
      <div className="flex items-center gap-3">
        <motion.button
          className="relative"
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/profile")}
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center overflow-hidden ring-2 ring-border">
            <span className="text-foreground font-bold text-sm">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <span className="absolute -bottom-1 -right-1 text-[7px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-black uppercase tracking-wide shadow-lg">
            Pro
          </span>
        </motion.button>

        <motion.button 
          className="flex items-center gap-1.5 bg-card/80 border border-border/60 rounded-full px-3 py-1.5"
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/achievements")}
        >
          <Flame className="w-4 h-4 text-primary" />
          <span className="text-foreground text-sm font-bold tabular-nums">{streakDays}</span>
          <span className="text-muted-foreground text-[10px] font-semibold uppercase">días</span>
        </motion.button>
      </div>
      
      {/* Notification */}
      <motion.button 
        className="w-10 h-10 rounded-full bg-card/80 border border-border/60 flex items-center justify-center relative"
        whileTap={{ scale: 0.93 }}
      >
        <Bell className="w-[18px] h-[18px] text-muted-foreground" />
        <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
      </motion.button>
    </motion.header>
  );
};

export default Header;
