/**
 * Número que se anima contando hacia arriba desde 0 hasta el valor final.
 * Reutilizable en Home, Progreso y Resumen post-workout.
 */
import { useEffect, useState } from "react";
import { animate } from "framer-motion";

interface CountUpProps {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
}

const CountUp = ({ value, duration = 1.2, decimals = 0, className }: CountUpProps) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo: arranca rápido, frena suave
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, duration]);

  return (
    <span className={className}>
      {display.toLocaleString("es-AR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
};

export default CountUp;
