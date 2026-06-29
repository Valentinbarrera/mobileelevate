/**
 * Progreso de KILOS por ejercicio: selector de ejercicio + gráfico del mejor
 * peso de cada día en el tiempo, con el PR destacado.
 *
 * Reusa el lenguaje visual de BodyMetricChart (card-elevated, accent-bar,
 * recharts ComposedChart con gradiente), pero acá subir kilos = bueno → la
 * tendencia se muestra en verde.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, TrendingUp, Trophy } from "lucide-react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { ExerciseProgress } from "@/hooks/useWorkoutDetails";

interface ExerciseProgressCardProps {
  exercises: ExerciseProgress[];
}

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" });

const ExerciseProgressCard = ({ exercises }: ExerciseProgressCardProps) => {
  const [selected, setSelected] = useState(0);

  const idx = exercises.length ? Math.min(selected, exercises.length - 1) : 0;
  const current = exercises[idx];

  const chartData = useMemo(
    () => (current?.points ?? []).map((p) => ({ label: fmtDate(p.date), value: p.topWeight, reps: p.reps })),
    [current]
  );

  if (!current) return null;

  const first = current.points[0]?.topWeight ?? 0;
  const latest = current.points[current.points.length - 1]?.topWeight ?? 0;
  const gain = latest - first;

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: { reps: number } }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-lg font-bold text-foreground">
            {payload[0].value} kg
            <span className="text-xs font-medium text-muted-foreground"> · {payload[0].payload.reps} reps</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated rounded-2xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="accent-bar" />
        <Dumbbell className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-black tracking-tight text-foreground">Progreso por ejercicio</h3>
      </div>

      {/* Selector de ejercicio */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {exercises.map((ex, i) => (
          <button
            key={ex.name}
            onClick={() => setSelected(i)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              i === idx
                ? "bg-gradient-primary text-primary-foreground"
                : "bg-secondary/40 border border-white/[0.06] text-muted-foreground"
            }`}
          >
            {ex.name}
          </button>
        ))}
      </div>

      {/* Stats del ejercicio seleccionado */}
      <div className="flex items-center justify-between mt-2 mb-1">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-foreground tabular-nums">{latest}</span>
          <span className="text-sm text-muted-foreground">kg</span>
          {gain > 0 && (
            <span className="ml-2 flex items-center gap-0.5 text-xs font-bold text-emerald-500">
              <TrendingUp className="w-3.5 h-3.5" />+{gain}kg
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-amber-400">PR {current.pr}kg</span>
        </div>
      </div>

      {current.points.length < 2 ? (
        <p className="text-xs text-muted-foreground text-center py-8">
          Cargá este ejercicio en otra sesión para ver tu evolución 📈
        </p>
      ) : (
        <div className="h-44 md:h-52 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="gradient-exercise" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={["dataMin - 5", "dataMax + 5"]}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="transparent" fill="url(#gradient-exercise)" />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "white", strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default ExerciseProgressCard;
