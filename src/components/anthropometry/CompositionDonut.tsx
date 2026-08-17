/**
 * Anillo de composición corporal: cómo se reparte el peso entre masa muscular,
 * adiposa, ósea, residual y piel. En el centro, el peso total.
 *
 * Si el fraccionamiento del informe no llega a cubrir el peso, el resto aparece
 * como "Otros" en gris — preferimos mostrar el hueco antes que inflar los
 * porcentajes.
 */
import { motion } from "framer-motion";
import type { CompositionSlice } from "@/lib/anthropometryInsights";

interface CompositionDonutProps {
  weight: number | null;
  slices: CompositionSlice[];
}

const SIZE = 132;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CompositionDonut = ({ weight, slices }: CompositionDonutProps) => {
  if (!slices.length) return null;

  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="hsl(var(--muted) / 0.35)"
            strokeWidth={STROKE}
          />
          {slices.map((slice) => {
            const length = (slice.pct / 100) * CIRCUMFERENCE;
            const dash = `${length} ${CIRCUMFERENCE - length}`;
            const circle = (
              <motion.circle
                key={slice.id}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={slice.color}
                strokeWidth={STROKE}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
            );
            offset += length;
            return circle;
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black tabular-nums text-foreground leading-none">
            {weight != null ? weight.toFixed(1) : "—"}
          </span>
          <span className="text-xs text-muted-foreground mt-0.5">kg</span>
        </div>
      </div>

      {/* Etiqueta arriba y números abajo: en 390 px de ancho, todo en una
          línea obligaba a truncar los nombres ("Masa mus…"). */}
      <ul className="min-w-0 flex-1 space-y-2">
        {slices.map((slice) => (
          <li key={slice.id} className="flex items-baseline gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 translate-y-0.5"
              style={{ backgroundColor: slice.color }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 text-[13px] text-foreground/70 leading-tight">
              {slice.label}
            </span>
            <span className="text-right whitespace-nowrap leading-tight">
              <span className="text-[13px] tabular-nums font-bold text-foreground">
                {slice.kg.toFixed(1)} kg
              </span>
              <span className="block text-[11px] tabular-nums text-muted-foreground">
                {slice.pct.toFixed(1)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompositionDonut;
