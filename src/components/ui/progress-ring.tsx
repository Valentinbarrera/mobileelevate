/**
 * Anillo de progreso circular animado (estilo Whoop/Oura/Apple).
 * Reutilizable en Home (objetivo semanal), Progreso y Resumen.
 */
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ProgressRingProps {
  /** 0–100 */
  progress: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  className?: string;
  gradientId?: string;
}

const ProgressRing = ({
  progress,
  size = 120,
  stroke = 10,
  children,
  className,
  gradientId = "ringGrad",
}: ProgressRingProps) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, progress));
  const offset = c - (clamped / 100) * c;

  return (
    <div className={`relative shrink-0 ${className ?? ""}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.45))" }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(28 100% 60%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
};

export default ProgressRing;
