/**
 * Analítica de peso corporal: variación desde el inicio, último mes, rango y
 * promedio. Complementa al chart y al WeightLogCard.
 *
 * Convención de color: bajar = verde (emerald), subir = ámbar — coherente con
 * WeightLogCard. Es neutral respecto del objetivo; solo marca la dirección.
 */
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import CountUp from "@/components/ui/count-up";

export interface WeightPoint {
  date: string; // YYYY-MM-DD
  value: number; // kg
}

const round1 = (n: number) => Math.round(n * 10) / 10;

const Delta = ({ value }: { value: number | null }) => {
  if (value == null) return <span className="text-sm text-muted-foreground">—</span>;
  const v = round1(value);
  const Icon = v === 0 ? Minus : v > 0 ? TrendingUp : TrendingDown;
  const color = v === 0 ? "text-muted-foreground" : v > 0 ? "text-amber-400" : "text-emerald-400";
  return (
    <span className={`flex items-center gap-0.5 font-black tabular-nums ${color}`}>
      <Icon className="w-4 h-4" />
      {v > 0 ? "+" : ""}
      {v}
      <span className="text-xs font-bold">kg</span>
    </span>
  );
};

const WeightStats = ({ history }: { history: WeightPoint[] }) => {
  if (!history || history.length === 0) return null;

  const sorted = [...history].sort((a, b) => (a.date < b.date ? -1 : 1));
  const current = sorted[sorted.length - 1];
  const start = sorted[0];

  const sinceStart = sorted.length > 1 ? current.value - start.value : null;

  // Variación del último mes: valor más cercano con ~30 días de antigüedad
  const cutoffMs = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const monthAgo = [...sorted]
    .reverse()
    .find((p) => new Date(p.date + "T00:00:00").getTime() <= cutoffMs);
  const lastMonth = monthAgo ? current.value - monthAgo.value : null;

  const values = sorted.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <div className="card-elevated rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="accent-bar" />
        <h3 className="text-sm font-black text-foreground tracking-tight">Peso corporal</h3>
        <span className="ml-auto text-2xl font-black text-foreground tabular-nums leading-none">
          <CountUp value={current.value} />
          <span className="text-sm font-bold text-muted-foreground"> kg</span>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-secondary/40 border border-white/[0.05] p-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Desde inicio</p>
          <Delta value={sinceStart} />
        </div>
        <div className="rounded-xl bg-secondary/40 border border-white/[0.05] p-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Último mes</p>
          <Delta value={lastMonth} />
        </div>
        <div className="rounded-xl bg-secondary/40 border border-white/[0.05] p-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Rango</p>
          <p className="text-sm font-black text-foreground tabular-nums leading-tight">
            {round1(min)}
            <span className="text-muted-foreground font-bold"> – </span>
            {round1(max)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeightStats;
