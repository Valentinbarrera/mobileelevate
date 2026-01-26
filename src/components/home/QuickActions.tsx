import { Dumbbell, TrendingUp, MessageCircle, Apple } from "lucide-react";
import { motion } from "framer-motion";

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  color: string;
  onClick?: () => void;
}

const QuickActions = () => {
  const actions: QuickAction[] = [
    { icon: <Dumbbell className="w-6 h-6" />, label: "Rutinas", sublabel: "Ver todas", color: "text-blue-400" },
    { icon: <TrendingUp className="w-6 h-6" />, label: "Progreso", sublabel: "Estadísticas", color: "text-green-400" },
    { icon: <MessageCircle className="w-6 h-6" />, label: "Chat", sublabel: "Con tu coach", color: "text-purple-400" },
    { icon: <Apple className="w-6 h-6" />, label: "Nutrición", sublabel: "Plan de hoy", color: "text-primary" },
  ];

  return (
    <div className="px-5 mt-6">
      <h3 className="text-foreground font-bold text-sm tracking-wide uppercase mb-4">Accesos Rápidos</h3>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={index}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 bg-secondary/60 border border-border rounded-2xl p-4 min-h-[88px] hover:border-primary/50 transition-all group"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className={`${action.color} group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <div className="text-center">
              <span className="text-foreground text-xs font-bold block">{action.label}</span>
              {action.sublabel && (
                <span className="text-muted-foreground text-[9px]">{action.sublabel}</span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
