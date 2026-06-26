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
      <p className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground/80">
        {getTimeGreeting()}
      </p>
      <h1 className="text-[30px] font-black tracking-tight leading-[1.05] mt-1 text-foreground">
        {userName}
      </h1>

      {contextLine && (
        <p className="text-sm font-medium text-muted-foreground mt-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block shrink-0" />
          {contextLine}
        </p>
      )}
    </motion.div>
  );
};

export default Greeting;
