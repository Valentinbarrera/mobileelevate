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
        className="flex items-center gap-2.5 bg-card/60 border border-border/40 rounded-full pl-1.5 pr-4 py-1.5"
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/profile")}
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center overflow-hidden">
            <span className="text-foreground font-bold text-sm">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <span className="absolute -bottom-1 -right-0.5 text-[6px] bg-primary text-primary-foreground px-1 py-px rounded-full font-black uppercase shadow-lg">
            Pro
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Flame className="w-4 h-4 text-primary" />
          <span className="text-foreground text-sm font-bold tabular-nums">{streakDays}</span>
          <span className="text-muted-foreground text-[10px] font-semibold uppercase">días</span>
        </div>
      </motion.button>
      
      {/* Notification */}
      <motion.button 
        className="w-10 h-10 rounded-full bg-card/60 border border-border/40 flex items-center justify-center relative"
        whileTap={{ scale: 0.93 }}
      >
        <Bell className="w-[18px] h-[18px] text-muted-foreground" />
        <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
      </motion.button>
    </motion.div>
  );
};

export default Header;
