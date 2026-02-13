import React from "react";
import { Dumbbell, TrendingUp, MessageCircle, ClipboardCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  gradient: string;
  route?: string;
}

const QuickActions = React.forwardRef<HTMLDivElement, object>((_, ref) => {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    { 
      icon: <Dumbbell className="w-5 h-5" />, 
      label: "Rutinas", 
      sublabel: "Ver todas", 
      gradient: "from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20",
      route: "/routines" 
    },
    { 
      icon: <TrendingUp className="w-5 h-5" />, 
      label: "Progreso", 
      sublabel: "Estadísticas", 
      gradient: "from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20",
      route: "/progress" 
    },
    { 
      icon: <ClipboardCheck className="w-5 h-5" />, 
      label: "Check-in", 
      sublabel: "Semanal", 
      gradient: "from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20",
      route: "/checkin" 
    },
    { 
      icon: <MessageCircle className="w-5 h-5" />, 
      label: "Perfil", 
      sublabel: "Ajustes", 
      gradient: "from-primary/20 to-primary/5 text-primary border-primary/20",
      route: "/profile" 
    },
  ];

  return (
    <div ref={ref}>
      <h3 className="text-foreground font-bold text-xs tracking-wide uppercase mb-3">Accesos Rápidos</h3>
      <div className="grid grid-cols-4 gap-2.5">
        {actions.map((action, index) => (
          <motion.button
            key={index}
            onClick={() => action.route && navigate(action.route)}
            className={`flex flex-col items-center gap-2 bg-gradient-to-b ${action.gradient} border rounded-2xl p-3.5 min-h-[84px] transition-all group`}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <motion.div 
              className="group-hover:scale-110 transition-transform"
              whileHover={{ rotate: [0, -5, 5, 0] }}
            >
              {action.icon}
            </motion.div>
            <div className="text-center">
              <span className="text-foreground text-[11px] font-bold block leading-tight">{action.label}</span>
              {action.sublabel && (
                <span className="text-muted-foreground text-[9px] leading-tight">{action.sublabel}</span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
});

QuickActions.displayName = "QuickActions";

export default QuickActions;
