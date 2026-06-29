/**
 * Calendario de entrenos. En mobile arranca COMPACTO: un strip horizontal de
 * ~7 días centrado en hoy (círculo naranja = agendado, ✓ verde = completado), y
 * un botón "Calendario" que despliega el almanaque completo del mes. En desktop
 * arranca expandido (hay lugar en el sidebar). Tocás un día para seleccionarlo.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, CalendarDays, ChevronUp } from "lucide-react";
import { localISODate } from "@/lib/routineSession";
import { useIsDesktop } from "@/hooks/use-media-query";

interface TrainingCalendarProps {
  plannedDates: Set<string>;
  doneDates: Set<string>;
  selectedDate: string;
  today: string;
  onSelect: (date: string) => void;
}

const WEEK_LABELS = ["L", "M", "M", "J", "V", "S", "D"];
// Etiqueta por getDay() (0 = domingo)
const DOW_LABELS = ["D", "L", "M", "M", "J", "V", "S"];
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const startOfWeekMonday = (d: Date) => {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
  return r;
};

const parseISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const TrainingCalendar = ({ plannedDates, doneDates, selectedDate, today, onSelect }: TrainingCalendarProps) => {
  const isDesktop = useIsDesktop();
  const [expanded, setExpanded] = useState(isDesktop);
  // Mes en vista (almanaque), anclado al día seleccionado
  const [cursor, setCursor] = useState(() => parseISO(selectedDate));

  // Estilo del círculo de un día (compartido por strip y almanaque)
  const dayClass = (iso: string, inMonth: boolean) => {
    const has = plannedDates.has(iso);
    const done = doneDates.has(iso);
    const isToday = iso === today;
    const selected = iso === selectedDate;
    return `relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold tabular-nums transition-colors ${
      selected
        ? "bg-gradient-primary text-primary-foreground"
        : done
          ? "bg-emerald-500/90 text-white"
          : has
            ? "border-2 border-primary/60 text-foreground"
            : "text-foreground"
    } ${!inMonth ? "opacity-30" : ""} ${
      isToday && !selected ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
    }`;
  };

  // Strip compacto: hoy en el centro, -3 .. +3
  const stripDays = useMemo(() => {
    const base = parseISO(today);
    return Array.from({ length: 7 }, (_, i) =>
      new Date(base.getFullYear(), base.getMonth(), base.getDate() + (i - 3))
    );
  }, [today]);

  // Almanaque: 6 semanas desde el lunes de la 1ra semana del mes
  const monthGrid = useMemo(() => {
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
  }, [cursor]);

  const moveMonth = (dir: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + dir, 1));

  const goToday = () => {
    const t = parseISO(today);
    setCursor(new Date(t.getFullYear(), t.getMonth(), 1));
    onSelect(today);
  };

  const cursorTitle = `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;

  return (
    <div className="card-elevated rounded-2xl p-3">
      {!expanded ? (
        /* ───────── Vista COMPACTA (strip de la semana) ───────── */
        <>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-sm font-black text-foreground capitalize">
              {MONTHS[parseISO(today).getMonth()]}
            </span>
            <button
              onClick={() => {
                setCursor(parseISO(selectedDate));
                setExpanded(true);
              }}
              className="flex items-center gap-1.5 text-[11px] font-bold text-primary px-2 py-1 rounded-lg hover:bg-primary/10"
            >
              <CalendarDays className="w-3.5 h-3.5" /> Calendario
            </button>
          </div>

          <div className="flex">
            {stripDays.map((d) => {
              const iso = localISODate(d);
              const done = doneDates.has(iso);
              const selected = iso === selectedDate;
              const isToday = iso === today;
              return (
                <button
                  key={iso}
                  onClick={() => onSelect(iso)}
                  className="flex-1 flex flex-col items-center gap-1 py-0.5"
                >
                  <span
                    className={`text-[10px] font-bold uppercase ${
                      isToday ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {DOW_LABELS[d.getDay()]}
                  </span>
                  <span className={dayClass(iso, true)}>
                    {done && !selected ? <Check className="w-4 h-4" strokeWidth={3} /> : d.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        /* ───────── Vista EXPANDIDA (almanaque del mes) ───────── */
        <>
          {/* Cabecera: navegación + cerrar */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1">
              <button onClick={() => moveMonth(-1)} aria-label="Mes anterior" className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-black text-foreground capitalize min-w-[7.5rem] text-center">{cursorTitle}</span>
              <button onClick={() => moveMonth(1)} aria-label="Mes siguiente" className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
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
              {!isDesktop && (
                <button
                  onClick={() => setExpanded(false)}
                  aria-label="Contraer calendario"
                  className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground px-2 py-1 rounded-lg hover:bg-secondary"
                >
                  <ChevronUp className="w-3.5 h-3.5" /> Cerrar
                </button>
              )}
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

          {/* Grilla del mes */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="space-y-1 overflow-hidden"
          >
            {monthGrid.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1">
                  {week.map((d) => {
                    const iso = localISODate(d);
                    const inMonth = d.getMonth() === cursor.getMonth();
                    const done = doneDates.has(iso);
                    const selected = iso === selectedDate;

                    return (
                      <button
                        key={iso}
                        onClick={() => onSelect(iso)}
                        className="flex items-center justify-center py-0.5"
                      >
                        <span className={dayClass(iso, inMonth)}>
                          {done && !selected ? <Check className="w-4 h-4" strokeWidth={3} /> : d.getDate()}
                        </span>
                      </button>
                    );
                  })}
                </div>
            ))}
          </motion.div>

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
        </>
      )}
    </div>
  );
};

export default TrainingCalendar;
