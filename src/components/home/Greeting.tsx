import { fadeUp } from "@/lib/animations";
import { motion } from "framer-motion";

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
    <motion.div className="px-5 pt-3 pb-4" variants={fadeUp}>
      {/* Saludo principal */}
      <h1 className="text-2xl font-black text-foreground tracking-tight leading-tight text-display">
        ¡Hola, <span className="text-gradient-primary">{userName}</span>!
      </h1>
      
      {/* Subtítulo */}
      <p className="text-muted-foreground text-[11px] mt-0.5 uppercase tracking-widest">
        {subtitle}
      </p>
      
      {/* Estado del día */}
      <motion.div 
        className="mt-3 flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-xl px-3.5 py-2.5"
        whileHover={{ borderColor: "hsl(var(--primary) / 0.4)" }}
      >
        <span className="text-xl">🔥</span>
        <p className="text-foreground font-medium text-sm">
          {todayStatus}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Greeting;
