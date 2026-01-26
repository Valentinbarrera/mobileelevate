import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Zap, Calendar, Medal } from "lucide-react";

interface ProfileStatsProps {
  totalXp: number;
  sessions: number;
  medals: number;
}

const ProfileStats = ({ totalXp, sessions, medals }: ProfileStatsProps) => {
  const navigate = useNavigate();
  
  const stats = [
    {
      icon: Zap,
      value: totalXp.toLocaleString(),
      label: "XP TOTALES",
      color: "text-primary",
      bgColor: "bg-primary/10",
      onClick: () => navigate("/achievements"),
    },
    {
      icon: Calendar,
      value: sessions.toString(),
      label: "SESIONES",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      onClick: () => navigate("/routines"),
    },
    {
      icon: Medal,
      value: medals.toString(),
      label: "MEDALLAS",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      onClick: () => navigate("/achievements"),
    },
  ];

  return (
    <motion.div 
      className="px-5 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <div className="flex justify-center gap-3">
        {stats.map((stat, index) => (
          <motion.button
            key={stat.label}
            onClick={stat.onClick}
            className="flex-1 flex flex-col items-center p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <span className="text-xl font-black text-foreground tabular-nums">
              {stat.value}
            </span>
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">
              {stat.label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default ProfileStats;
