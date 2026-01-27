import { Variants } from "framer-motion";

// ================================
// SISTEMA DE ANIMACIONES CENTRALIZADO
// ================================

// Transiciones estandarizadas
export const transitions = {
  spring: { type: "spring", stiffness: 400, damping: 30 },
  springBouncy: { type: "spring", stiffness: 500, damping: 25 },
  smooth: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  fast: { duration: 0.15, ease: "easeOut" },
  slow: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
} as const;

// ================================
// VARIANTES DE PÁGINA
// ================================

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: { 
    opacity: 0, 
    y: -8,
    transition: { duration: 0.2, ease: "easeIn" }
  },
};

// ================================
// VARIANTES DE CONTENEDOR (STAGGER)
// ================================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

// ================================
// VARIANTES DE ITEMS
// ================================

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: transitions.smooth
  },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.spring
  },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: transitions.smooth
  },
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: transitions.smooth
  },
};

// ================================
// VARIANTES INTERACTIVAS
// ================================

export const tapScale = {
  whileTap: { scale: 0.97 },
  transition: transitions.fast,
};

export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: transitions.spring,
};

export const hoverScaleSubtle = {
  whileHover: { scale: 1.01 },
  whileTap: { scale: 0.99 },
  transition: transitions.spring,
};

export const hoverGlow = {
  whileHover: { 
    boxShadow: "0 0 24px hsl(18 100% 55% / 0.4)",
  },
  transition: transitions.smooth,
};

// ================================
// VARIANTES DE OVERLAYS
// ================================

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: transitions.spring
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10,
    transition: { duration: 0.15 }
  },
};

export const drawerVariants: Variants = {
  initial: { y: "100%" },
  animate: { y: 0, transition: transitions.spring },
  exit: { y: "100%", transition: { duration: 0.2 } },
};

// ================================
// VARIANTES DE LISTA
// ================================

export const listItem: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: transitions.smooth
  },
};

// ================================
// VARIANTES DE NÚMEROS/CONTADORES
// ================================

export const numberPop: Variants = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.15, 1],
    transition: { duration: 0.3, ease: "easeOut" }
  },
};

// ================================
// UTILIDADES
// ================================

export const getStaggerDelay = (index: number, baseDelay = 0.05) => ({
  initial: { opacity: 0, y: 16 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { delay: index * baseDelay, ...transitions.smooth }
  },
});
