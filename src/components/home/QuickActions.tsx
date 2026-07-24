/**
 * Accesos rápidos — fila de atajos a las secciones más usadas.
 * Reutilizable: sin props usa los atajos del Home; con `actions` se
 * personaliza (ej: la fila de Progreso). `title` agrega un encabezado.
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Scale, Apple, Ruler, Dumbbell, type LucideIcon } from "lucide-react";
import { fadeUp } from "@/lib/animations";

export type QuickAction = {
  icon: LucideIcon;
  label: string;
  to: string;
};

const DEFAULT_ACTIONS: QuickAction[] = [
  { icon: Dumbbell, label: "Ejercicios", to: "/exercises" },
  { icon: Apple, label: "Nutrición", to: "/nutrition" },
  { icon: Scale, label: "Peso", to: "/progress" },
  { icon: Ruler, label: "Medidas", to: "/measurements" },
];

type QuickActionsProps = {
  actions?: QuickAction[];
  title?: string;
};

const QuickActions = ({ actions = DEFAULT_ACTIONS, title }: QuickActionsProps) => {
  const navigate = useNavigate();
  return (
    <motion.div variants={fadeUp} className="space-y-2.5">
      {title && (
        <div className="flex items-center gap-2 px-0.5">
          <span className="accent-bar" />
          <h3 className="text-sm font-black text-foreground tracking-tight">{title}</h3>
        </div>
      )}
      <div className="grid grid-cols-4 gap-2.5">
        {actions.map(({ icon: Icon, label, to }) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            aria-label={label}
            className="group card-elevated rounded-2xl py-3.5 flex flex-col items-center gap-2 active:scale-95 transition-transform"
          >
            <div className="w-11 h-11 rounded-2xl bg-primary/12 border border-primary/20 flex items-center justify-center group-active:bg-primary/25 transition-colors">
              <Icon className="w-[18px] h-[18px] text-primary" />
            </div>
            <span className="text-[11px] font-bold text-foreground/75 tracking-tight">{label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;
