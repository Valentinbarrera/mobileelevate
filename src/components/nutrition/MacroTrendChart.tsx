/**
 * Tendencia de macros en el tiempo. Selector de métrica (Calorías / Proteína /
 * Carbos / Grasas) y gráfico del valor por día. Reusa el lenguaje visual de
 * BodyMetricChart (card-elevated, recharts ComposedChart con gradiente).
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LineChart as LineChartIcon } from "lucide-react";
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
import { NutritionDay } from "@/hooks/useNutritionHistory";

interface MacroTrendChartProps {
  days: NutritionDay[];
}

type MetricKey = "calories" | "protein" | "carbs" | "fats";

const METRICS: { key: MetricKey; label: string; unit: string; color: string }[] = [
  { key: "calories", label: "Calorías", unit: "kcal", color: "hsl(var(--primary))" },
  { key: "protein", label: "Proteína", unit: "g", color: "#60a5fa" },
  { key: "carbs", label: "Carbos", unit: "g", color: "#fbbf24" },
  { key: "fats", label: "Grasas", unit: "g", color: "#fb7185" },
];

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" });

const MacroTrendChart = ({ days }: MacroTrendChartProps) => {
  const [metricKey, setMetricKey] = useState<MetricKey>("calories");
  const metric = METRICS.find((m) => m.key === metricKey)!;

  // Cronológico ascendente, solo días con calorías cargadas
  const chartData = useMemo(
    () =>
      [...days]
        .filter((d) => d.totals.calories > 0)
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .map((d) => ({ label: fmtDate(d.date), value: Math.round(d.totals[metricKey]) })),
    [days, metricKey]
  );

  const avg = chartData.length
    ? Math.round(chartData.reduce((s, p) => s + p.value, 0) / chartData.length)
    : 0;

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-lg font-bold text-foreground">
            {payload[0].value} {metric.unit}
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
        <LineChartIcon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-black tracking-tight text-foreground">Macros en el tiempo</h3>
      </div>

      {/* Selector de métrica */}
      <div className="flex gap-1.5 p-1 rounded-xl bg-secondary/40 border border-white/[0.06] mb-3">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetricKey(m.key)}
            className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
              m.key === metricKey ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {chartData.length < 2 ? (
        <p className="text-xs text-muted-foreground text-center py-10">
          Registrá comidas al menos 2 días para ver tu tendencia 📈
        </p>
      ) : (
        <>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-2xl font-black text-foreground tabular-nums">{avg}</span>
            <span className="text-sm text-muted-foreground">{metric.unit} promedio/día</span>
          </div>
          <div className="h-44 md:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradient-macro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
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
                  width={38}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="transparent" fill="url(#gradient-macro)" />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={metric.color}
                  strokeWidth={3}
                  dot={{ fill: metric.color, strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: metric.color, stroke: "white", strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default MacroTrendChart;
