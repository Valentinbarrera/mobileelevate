/**
 * Evolución de las variables clave en el tiempo: peso, % de grasa y masa
 * muscular en un mismo eje, como en el informe del evaluador.
 *
 * Las tres series comparten escala a propósito (en kg y % los rangos se
 * solapan): lo que importa acá es la FORMA de cada curva, no comparar valores
 * absolutos entre series. Con pocos puntos se etiqueta cada dato; con muchos se
 * deja sólo la línea para que no se amontone.
 */
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { formatDate } from "@/lib/anthropometryInsights";

export interface EvolutionSeries {
  id: string;
  label: string;
  unit: string;
  color: string;
  points: { date: string; value: number }[];
}

interface EvolutionChartProps {
  series: EvolutionSeries[];
}

/** A partir de acá las etiquetas sobre los puntos se pisan entre sí. */
const MAX_LABELED_POINTS = 6;

const shortDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });

const EvolutionChart = ({ series }: EvolutionChartProps) => {
  const active = series.filter((s) => s.points.length > 0);

  if (active.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        Todavía no hay datos para graficar.
      </p>
    );
  }

  // Un punto por fecha, con el valor de cada serie que tenga dato ese día.
  const dates = [...new Set(active.flatMap((s) => s.points.map((p) => p.date)))].sort();
  const data = dates.map((date) => {
    const row: Record<string, string | number> = { date, label: shortDate(date) };
    for (const s of active) {
      const point = s.points.find((p) => p.date === date);
      if (point) row[s.id] = point.value;
    }
    return row;
  });

  const labelled = dates.length <= MAX_LABELED_POINTS;

  const CustomTooltip = ({
    active: isActive,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { dataKey: string; value: number }[];
    label?: string;
  }) => {
    if (!isActive || !payload?.length) return null;
    const date = data.find((d) => d.label === label)?.date as string | undefined;
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1.5">
          {date ? formatDate(date) : label}
        </p>
        {payload.map((entry) => {
          const s = active.find((x) => x.id === entry.dataKey);
          if (!s) return null;
          return (
            <p key={entry.dataKey} className="text-sm font-semibold text-foreground">
              <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: s.color }} />
              {s.label}: {entry.value} {s.unit}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3">
        {active.map((s) => (
          <span key={s.id} className="flex items-center gap-1.5 text-xs text-foreground/70">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} aria-hidden />
            {s.label} ({s.unit})
          </span>
        ))}
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 18, right: 14, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={["dataMin - 3", "dataMax + 3"]}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip content={<CustomTooltip />} />
            {active.map((s) => (
              <Line
                key={s.id}
                type="monotone"
                dataKey={s.id}
                stroke={s.color}
                strokeWidth={2.5}
                connectNulls
                isAnimationActive={false}
                dot={{ r: 3.5, fill: s.color, strokeWidth: 0 }}
                activeDot={{ r: 5.5, fill: s.color, stroke: "hsl(var(--card))", strokeWidth: 2 }}
              >
                <LabelList
                  dataKey={s.id}
                  position="top"
                  offset={8}
                  // Con muchas fechas las etiquetas se pisan: ahí sólo la línea.
                  formatter={(value: number) => (labelled ? String(value) : "")}
                  style={{ fontSize: 10, fill: s.color, fontWeight: 700 }}
                />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EvolutionChart;
