import { motion } from "framer-motion";
import { pageVariants, staggerContainer } from "@/lib/animations";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  withStagger?: boolean;
}

/**
 * Contenedor de página con animaciones de entrada/salida estandarizadas.
 * Usar en todas las páginas para transiciones consistentes.
 */
const PageContainer = ({ 
  children, 
  className = "",
  withStagger = true 
}: PageContainerProps) => {
  return (
    <motion.div
      className={`min-h-screen bg-background ${className}`}
      variants={withStagger ? staggerContainer : pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

export default PageContainer;
