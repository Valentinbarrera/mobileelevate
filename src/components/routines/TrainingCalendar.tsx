/**
 * Calendario tipo Google Calendar: vista de mes (o semana) con los días de
 * entrenamiento marcados (círculo naranja = agendado, ✓ verde = completado).
 * Tocás un día para seleccionarlo.
 */
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { localISODate } from "@/lib/routineSession";

interface TrainingCalendarProps {
  plannedDates: Set<string>;
  doneDates: Set<string>;
  selectedDate: string;
  today: string;
  onSelect: (date: string) => void;
}

const WEEK_LABELS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

type Mode = "mes" | "semana";

const startOfWeekMonday = (d: Date) => {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
  return r;
};

const TrainingCalendar = ({ plannedDates, doneDates, selectedDate, today, onSelect }: TrainingCalendarProps) => {
  const [mode, setMode] = useState<Mode>("mes");
  // Mes/semana en vista, anclado al día seleccionado
  const [cursor, setCursor] = useState(() => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    return new Date(y, m - 1, d);
  });

  const grid = useMemo(() => {
    if (mode === "semana") {
      const start = startOfWeekMonday(cursor);
      return [Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))];
    }
    // Mes: 6 semanas desde el lunes de la 1ra semana
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = startOfWeekMonday(first);
    const weeks: Date[][] = [];
    for (let w = 0; w < 6; w++) {
      weeks.push(
        Array.from({ length: 7 }, (_, i) =>
          new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + i)
        )
      );
    }
    return weeks;
  }, [cursor, mode]);

  const move = (dir: number) => {
    setCursor((c) =>
      mode === "semana"
        ? new Date(c.getFullYear(), c.getMonth(), c.getDate() + dir * 7)
        : new Date(c.getFullYear(), c.getMonth() + dir, 1)
    );
  };

  const goToday = () => {
    const [y, m, d] = today.split("-").map(Number);
    setCursor(new Date(y, m - 1, d));
    onSelect(today);
  };

  const title = mode === "semana"
    ? `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`
    : `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;

  return (
    <div className="card-elevated rounded-2xl p-3">
      {/* Cabecera: navegación + toggle */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1">
          <button onClick={() => move(-1)} aria-label="Anterior" className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-black text-foreground capitalize min-w-[7.5rem] text-center">{title}</span>
          <button onClick={() => move(1)} aria-label="Siguiente" className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goToday}
            className="text-[11px] font-bold text-primary px-2 py-1 rounded-lg hover:bg-primary/10"
          >
            Hoy
          </button>
          <div className="flex p-0.5 rounded-lg bg-secondary/60">
            {(["semana", "mes"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`text-[11px] font-bold px-2 py-1 rounded-md capitalize transition-colors ${
                  mode === m ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_LABELS.map((l, i) => (
          <span key={i} className="text-center text-[10px] font-bold text-muted-foreground uppercase">
            {l}
          </span>
        ))}
      </div>

      {/* Grilla */}
      <div className="space-y-1">
        {grid.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((d) => {
              const iso = localISODate(d);
              const inMonth = mode === "semana" || d.getMonth() === cursor.getMonth();
              const has = plannedDates.has(iso);
              const done = doneDates.has(iso);
              const isToday = iso === today;
              const selected = iso === selectedDate;

              return (
                <button
                  key={iso}
                  onClick={() => onSelect(iso)}
                  className="flex items-center justify-center py-0.5"
                >
                  <span
                    className={`relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold tabular-nums transition-colors ${
                      selected
                        ? "bg-gradient-primary text-primary-foreground"
                        : done
                          ? "bg-emerald-500/90 text-white"
                          : has
                            ? "border-2 border-primary/60 text-foreground"
                            : "text-foreground"
                    } ${!inMonth ? "opacity-30" : ""} ${
                      isToday && !selected ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
                    }`}
                  >
                    {done && !selected ? <Check className="w-4 h-4" strokeWidth={3} /> : d.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-2 border-t border-white/[0.05]">
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-primary/60" /> Entreno
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/90 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
          </span>
          Completado
        </span>
      </div>
    </div>
  );
};

export default TrainingCalendar;
