import { motion, HTMLMotionProps } from "framer-motion";
import { fadeUp } from "@/lib/animations";

interface AnimatedSectionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Sección animada con fade-up. Usar para secciones de contenido.
 */
const AnimatedSection = ({ 
  children, 
  className = "",
  delay = 0,
  ...props
}: AnimatedSectionProps) => {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="initial"
      animate="animate"
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
