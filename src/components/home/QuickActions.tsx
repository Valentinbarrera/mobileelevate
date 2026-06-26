/**
 * Accesos rápidos del Home — fila compacta de atajos a las acciones más útiles.
 * Visualmente liviano para no competir con la rutina del día.
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Scale, Apple, Ruler, Dumbbell } from "lucide-react";
import { fadeUp } from "@/lib/animations";

const ACTIONS = [
  { icon: Dumbbell, label: "Ejercicios", to: "/exercises" },
  { icon: Apple, label: "Nutrición", to: "/nutrition" },
  { icon: Scale, label: "Peso", to: "/progress" },
  { icon: Ruler, label: "Medidas", to: "/measurements" },
];

const QuickActions = () => {
  const navigate = useNavigate();
  return (
    <motion.div variants={fadeUp} className="grid grid-cols-4 gap-2.5">
      {ACTIONS.map(({ icon: Icon, label, to }) => (
        <button
          key={label}
          onClick={() => navigate(to)}
          aria-label={label}
          className="card-elevated rounded-2xl py-3 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
        </button>
      ))}
    </motion.div>
  );
};

export default QuickActions;
