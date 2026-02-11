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
  todayStatus
}: GreetingProps) => {
  return (
    <motion.div className="pt-3 pb-1" variants={fadeUp}>
      <h1 className="text-[2.2rem] font-black text-foreground tracking-tight leading-[1.05] italic uppercase">
        ¡Hola,
        <br />
        <span className="text-gradient-primary">{userName}!</span>
      </h1>
      
      <p className="text-muted-foreground text-[13px] mt-1">
        {subtitle}
      </p>
    </motion.div>
  );
};

export default Greeting;
