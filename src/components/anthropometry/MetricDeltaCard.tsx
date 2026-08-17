/**
 * Tarjeta de una métrica clave: valor actual y cuánto cambió contra la
 * evaluación anterior.
 *
 * El color del delta sale de `GOOD_DIRECTION`: sólo se pinta verde/rojo cuando
 * la variable tiene una dirección deseable objetiva (más músculo, menos grasa).
 * Peso e IMC dependen del objetivo del alumno, así que van en neutro.
 */
import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { GOOD_DIRECTION, formatDate, type FieldDelta } from "@/lib/anthropometryInsights";

interface MetricDeltaCardProps {
  fieldId: string;
  label: string;
  unit: string;
  icon: LucideIcon;
  iconColor: string;
  delta: FieldDelta;
}

const MetricDeltaCard = ({
  fieldId,
  label,
  unit,
  icon: Icon,
  iconColor,
  delta,
}: MetricDeltaCardProps) => {
  const { value, diff, comparedTo } = delta;
  const direction = GOOD_DIRECTION[fieldId];

  let deltaClass = "text-foreground/70";
  if (diff !== null && diff !== 0 && direction) {
    const improved = direction === "up" ? diff > 0 : diff < 0;
    deltaClass = improved ? "text-emerald-500" : "text-red-400";
  }

  const DeltaIcon = diff !== null && diff > 0 ? ArrowUp : ArrowDown;

  return (
    <div className="card-elevated rounded-2xl p-3.5">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-4 h-4 shrink-0" style={{ color: iconColor }} />
        <span className="text-xs text-muted-foreground truncate">{label}</span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-xl font-black tabular-nums text-foreground">
          {value.toFixed(1)}
        </span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>

      {diff !== null && diff !== 0 ? (
        <>
          <div className={`flex items-center gap-0.5 mt-1.5 ${deltaClass}`}>
            <DeltaIcon className="w-3.5 h-3.5" />
            <span className="text-sm font-semibold tabular-nums">
              {Math.abs(diff).toFixed(1)} {unit}
            </span>
          </div>
          {comparedTo && (
            <p className="text-[11px] text-muted-foreground mt-0.5">vs {formatDate(comparedTo)}</p>
          )}
        </>
      ) : (
        <p className="text-[11px] text-muted-foreground mt-1.5">
          {diff === 0 ? "Sin cambios" : "Primera evaluación"}
        </p>
      )}
    </div>
  );
};

export default MetricDeltaCard;
