/**
 * Reusable line chart for body metrics (weight, waist, etc.)
 */
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
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

interface DataPoint {
  date: string;
  value: number;
}

interface BodyMetricChartProps {
  data: DataPoint[];
  title: string;
  unit: string;
  color?: string;
}

const BodyMetricChart = ({ data, title, unit, color = "hsl(var(--primary))" }: BodyMetricChartProps) => {
  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-4"
      >
        <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          Sin datos registrados aún
        </p>
      </motion.div>
    );
  }

  const latest = data[data.length - 1]?.value ?? 0;
  const first = data[0]?.value ?? 0;
  const change = first > 0 ? ((latest - first) / first) * 100 : 0;

  const TrendIcon = change > 1 ? TrendingUp : change < -1 ? TrendingDown : Minus;
  const trendColor = Math.abs(change) <= 1 ? "text-muted-foreground" : change > 0 ? "text-red-400" : "text-emerald-500";

  const chartData = data.map((d) => ({
    label: new Date(d.date + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
    value: d.value,
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-lg font-bold text-foreground">
            {payload[0].value} {unit}
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
      className="bg-card border border-border rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-xs font-semibold">
            {change > 0 ? "+" : ""}{change.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-2xl font-black text-foreground">{latest}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
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
              domain={["dataMin - 2", "dataMax + 2"]}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value" stroke="transparent" fill={`url(#gradient-${title})`} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: color, stroke: "white", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default BodyMetricChart;
