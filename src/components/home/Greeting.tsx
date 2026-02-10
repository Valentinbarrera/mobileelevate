import { fadeUp } from "@/lib/animations";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface GreetingProps {
  userName: string;
  subtitle?: string;
  todayStatus?: string;
}

const Greeting = ({ 
  userName, 
  subtitle = "Tu entrenador online todo en uno",
  todayStatus = "Hoy entrenás: Piernas y Glúteos"
}: GreetingProps) => {
  return (
    <motion.div className="pt-2 pb-1" variants={fadeUp}>
      {/* Saludo principal */}
      <h1 className="text-xl font-black text-foreground tracking-tight leading-tight text-display">
        ¡Hola, <span className="text-gradient-primary">{userName}</span>!
      </h1>
      
      {/* Estado del día - Más prominente */}
      <motion.div 
        className="mt-2 flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2"
        whileHover={{ borderColor: "hsl(var(--primary) / 0.4)" }}
      >
        <Zap className="w-4 h-4 text-primary flex-shrink-0" />
        <p className="text-foreground font-medium text-sm truncate">
          {todayStatus}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Greeting;
