/**
 * Número que se anima contando hacia arriba desde 0 hasta el valor final.
 * Reutilizable en Home, Progreso y Resumen post-workout.
 */
import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

interface CountUpProps {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
  /**
   * Anima desde el número que ya se está mostrando en vez de desde 0.
   * Para valores que el usuario cambia en vivo (las calorías al elegir otra
   * cantidad): volver a 0 en cada cambio se lee como si se hubiera reseteado.
   */
  continuous?: boolean;
}

const CountUp = ({
  value,
  duration = 1.2,
  decimals = 0,
  className,
  continuous = false,
}: CountUpProps) => {
  const [display, setDisplay] = useState(0);
  // Espejo del valor mostrado. Va en una ref y no en las dependencias: si el
  // efecto dependiera de `display` se relanzaría en cada frame de la animación.
  const displayRef = useRef(0);
  displayRef.current = display;

  useEffect(() => {
    const controls = animate(continuous ? displayRef.current : 0, value, {
      // Corregir una cantidad tiene que sentirse inmediato: 1,2s de conteo
      // desde el valor anterior se siente lento, no premium.
      duration: continuous ? Math.min(duration, 0.45) : duration,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo: arranca rápido, frena suave
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, duration, continuous]);

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
