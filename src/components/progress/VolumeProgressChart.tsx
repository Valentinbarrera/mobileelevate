/**
 * Progress chart showing volume trend over sessions
 */
import { useMemo } from "react";
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

interface SessionData {
  date: string;
  volume: number;
  label: string;
}

interface VolumeProgressChartProps {
  data: SessionData[];
  title?: string;
  /** Unidad mostrada en el tooltip (ej. "kg", "entrenos"). */
  unit?: string;
  /** Texto de la leyenda al pie del gráfico. */
  legend?: string;
}

const VolumeProgressChart = ({
  data,
  title = "Volumen por Sesión",
  unit = "kg",
  legend = "Volumen total (peso × reps × series) por sesión",
}: VolumeProgressChartProps) => {
  const trend = useMemo(() => {
    if (data.length < 2) return 0;
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((acc, d) => acc + d.volume, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((acc, d) => acc + d.volume, 0) / secondHalf.length;
    
    return ((secondAvg - firstAvg) / firstAvg) * 100;
  }, [data]);

  const TrendIcon = trend > 5 ? TrendingUp : trend < -5 ? TrendingDown : Minus;
  const trendColor = trend > 5 ? "text-emerald-500" : trend < -5 ? "text-red-500" : "text-muted-foreground";

  // Solo marca el punto final (estilo cockpit Whoop/Oura): el resto queda limpio.
  const EndpointDot = (props: { cx?: number; cy?: number; index?: number }) => {
    const { cx, cy, index } = props;
    if (cx == null || cy == null) return <circle key={index} r={0} />;
    if (index !== data.length - 1) return <circle key={index} cx={cx} cy={cy} r={0} fill="transparent" />;
    return (
      <circle
        key="endpoint"
        cx={cx}
        cy={cy}
        r={5}
        fill="hsl(var(--primary))"
        stroke="hsl(var(--card))"
        strokeWidth={2.5}
        style={{ filter: "drop-shadow(0 0 5px hsl(var(--primary) / 0.6))" }}
      />
    );
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-lg font-bold text-foreground">
            {payload[0].value.toLocaleString()} {unit}
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="accent-bar" />
          <h3 className="text-sm font-black tracking-tight text-foreground">{title}</h3>
        </div>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-xs font-semibold">
            {trend > 0 ? "+" : ""}{trend.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 md:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border) / 0.5)"
              vertical={false}
            />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${Math.round(value)}`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="transparent"
              fill="url(#volumeGradient)"
            />
            <Line
              type="monotone"
              dataKey="volume"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={EndpointDot}
              activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--card))", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-white/[0.06]">
        <p className="text-xs text-muted-foreground text-center">
          {legend}
        </p>
      </div>
    </motion.div>
  );
};

export default VolumeProgressChart;
