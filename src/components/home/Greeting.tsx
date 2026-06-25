import { fadeUp } from "@/lib/animations";
import { motion } from "framer-motion";

interface GreetingProps {
  userName: string;
  /** Línea contextual y motivadora (ej: "Te faltan 3 para tu meta") */
  contextLine?: string;
}

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
};

const Greeting = ({ userName, contextLine }: GreetingProps) => {
  return (
    <motion.div className="pt-1" variants={fadeUp}>
      <motion.p
        className="text-muted-foreground text-sm font-medium"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05 }}
      >
        {getTimeGreeting()}, {userName}
      </motion.p>

      {contextLine && (
        <motion.h1
          className="text-[1.7rem] font-black tracking-tight leading-[1.1] mt-1 text-foreground"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          {contextLine}
        </motion.h1>
      )}
    </motion.div>
  );
};

export default Greeting;
