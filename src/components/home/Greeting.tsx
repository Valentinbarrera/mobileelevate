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
  todayStatus,
}: GreetingProps) => {
  return (
    <motion.div className="pt-1" variants={fadeUp}>
      <motion.p
        className="text-muted-foreground text-sm font-medium"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05 }}
      >
        {getTimeGreeting()},
      </motion.p>

      <h1 className="text-[2rem] font-black tracking-tight leading-none mt-1 text-gradient-primary">
        {userName}
      </h1>

      {todayStatus ? (
        <motion.div
          className="flex items-center gap-2 mt-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          <p className="text-muted-foreground text-[13px] font-medium">{todayStatus}</p>
        </motion.div>
      ) : (
        <p className="text-muted-foreground text-[13px] mt-2">{subtitle}</p>
      )}
    </motion.div>
  );
};

export default Greeting;
