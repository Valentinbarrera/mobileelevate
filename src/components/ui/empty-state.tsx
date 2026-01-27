import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { fadeUp } from "@/lib/animations";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Estado vacío consistente para cuando no hay datos.
 */
const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
      variants={fadeUp}
      initial="initial"
      animate="animate"
    >
      <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs mb-6">{description}</p>
      )}
      {action && (
        <motion.button
          onClick={action.onClick}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
