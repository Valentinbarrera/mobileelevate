import { ChevronRight, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ViewAllRoutinesLink = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate("/routines")}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/40 border border-border/50 hover:border-primary/30 transition-all group"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-2.5">
        <CalendarDays className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">
          Ver todas mis rutinas
        </span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </motion.button>
  );
};

export default ViewAllRoutinesLink;
