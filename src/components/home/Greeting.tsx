import { fadeUp } from "@/lib/animations";
import { motion } from "framer-motion";

interface GreetingProps {
  userName: string;
  subtitle?: string;
  todayStatus?: string;
}

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
};

const Greeting = ({ 
  userName, 
  subtitle = "Tu entrenador online todo en uno",
  todayStatus
}: GreetingProps) => {
  return (
    <motion.div className="pt-2 pb-2" variants={fadeUp}>
      <motion.p 
        className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-1"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        {getTimeGreeting()}
      </motion.p>
      <h1 className="text-[2.2rem] font-black text-foreground tracking-tight leading-[1.05] italic uppercase">
        <span className="text-gradient-primary">{userName}</span>
      </h1>
      
      {todayStatus && (
        <motion.p 
          className="text-muted-foreground text-[13px] mt-1.5 flex items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          {todayStatus}
        </motion.p>
      )}
      
      {!todayStatus && (
        <p className="text-muted-foreground text-[13px] mt-1">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default Greeting;
