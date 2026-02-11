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
  todayStatus
}: GreetingProps) => {
  return (
    <motion.div className="pt-4 pb-1" variants={fadeUp}>
      {/* Saludo grande estilo bold italic */}
      <h1 className="text-4xl font-black text-foreground tracking-tight leading-[1.1] italic">
        ¡HOLA,
        <br />
        {userName.toUpperCase()}!
      </h1>
      
      {/* Subtítulo */}
      <p className="text-muted-foreground text-sm mt-1.5">
        {subtitle}
      </p>
    </motion.div>
  );
};

export default Greeting;
