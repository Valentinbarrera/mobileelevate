import { Flame, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fadeUp } from "@/lib/animations";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

interface HeaderProps {
  userName: string;
  streakDays: number;
}

const Header = ({ userName, streakDays }: HeaderProps) => {
  const navigate = useNavigate();
  const { student } = useAuthContext();

  // Mensajes del coach sin leer → badge real en la campanita
  const { data: unread = 0 } = useQuery({
    queryKey: ["home-unread", student?.id],
    enabled: !!student?.id,
    queryFn: async () => {
      if (!student?.id) return 0;
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("student_id", student.id)
        .eq("sender", "coach")
        .is("seen_at", null);
      return count ?? 0;
    },
  });

  return (
    <motion.div
      className="flex items-center justify-between px-5 header-safe-xl pb-2"
      variants={fadeUp}
    >
      {/* Avatar + Streak pill */}
      <motion.button
        className="flex items-center gap-2.5 card-elevated rounded-full pl-1.5 pr-4 py-1.5"
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
      
      {/* Notificaciones → mensajes del coach */}
      <motion.button
        onClick={() => navigate("/messages")}
        aria-label="Mensajes del coach"
        className="w-10 h-10 rounded-full card-elevated flex items-center justify-center relative"
        whileTap={{ scale: 0.93 }}
      >
        <Bell className="w-[18px] h-[18px] text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center ring-2 ring-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </motion.button>
    </motion.div>
  );
};

export default Header;
