/**
 * Card para que el alumno registre su peso de hoy (guardado local).
 * Muestra el peso actual + variación, y un input inline para cargar.
 */
import { useState } from "react";
import { Scale, Plus, Check, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface WeightLogCardProps {
  current: number | null;
  previous: number | null;
  onLog: (value: number) => void;
}

const WeightLogCard = ({ current, previous, onLog }: WeightLogCardProps) => {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(current != null ? String(current) : "");

  const save = () => {
    const n = parseFloat(val);
    if (n > 0) {
      onLog(n);
      setOpen(false);
    }
  };

  const delta = current != null && previous != null ? Math.round((current - previous) * 10) / 10 : null;
  const TrendIcon = delta == null || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const trendColor =
    delta == null || delta === 0 ? "text-muted-foreground" : delta > 0 ? "text-amber-400" : "text-emerald-400";

  return (
    <div className="card-elevated rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Mi peso</p>
            <div className="flex items-baseline gap-2">
              {current != null ? (
                <p className="text-2xl font-black text-foreground tabular-nums leading-none">
                  {current}
                  <span className="text-sm font-semibold text-muted-foreground"> kg</span>
                </p>
              ) : (
                <p className="text-base text-muted-foreground">Sin registro</p>
              )}
              {delta != null && delta !== 0 && (
                <span className={`flex items-center gap-0.5 text-xs font-bold ${trendColor}`}>
                  <TrendIcon className="w-3.5 h-3.5" />
                  {delta > 0 ? "+" : ""}
                  {delta}
                </span>
              )}
            </div>
          </div>
        </div>

        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-bold active:scale-95 transition-transform shrink-0"
          >
            <Plus className="w-4 h-4" />
            Registrar
          </button>
        )}
      </div>

      {open && (
        <div className="flex items-center gap-2 mt-3">
          <input
            type="number"
            inputMode="decimal"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="kg"
            autoFocus
            className="flex-1 h-11 rounded-xl bg-secondary border border-border text-center text-lg font-bold text-foreground focus:border-primary focus:outline-none"
          />
          <button
            onClick={save}
            className="h-11 px-4 rounded-xl bg-gradient-primary text-primary-foreground font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <Check className="w-4 h-4" />
            Guardar
          </button>
        </div>
      )}
    </div>
  );
};

export default WeightLogCard;
