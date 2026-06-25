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
      <p className="text-sm text-muted-foreground font-medium">{getTimeGreeting()},</p>
      <h1 className="text-2xl font-black tracking-tight leading-none mt-0.5 text-foreground">
        {userName}
      </h1>

      {contextLine && (
        <p className="text-[13px] text-muted-foreground mt-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block shrink-0" />
          {contextLine}
        </p>
      )}
    </motion.div>
  );
};

export default Greeting;
