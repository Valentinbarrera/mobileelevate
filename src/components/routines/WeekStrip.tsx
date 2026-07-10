/**
 * WeekStrip — tira de la semana (lun→dom) con el estado de cada día.
 * Estados con ÍCONO + forma, no solo color (accesibilidad).
 */
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { WeekDay } from "@/lib/routineSession";

interface WeekStripProps {
  days: WeekDay[];
  /** Al tocar un día con entreno → navega a la rutina de ese día. */
  onSelectDay?: (date: string) => void;
}

const WeekStrip = ({ days, onSelectDay }: WeekStripProps) => {
  return (
    <div className="card-elevated rounded-2xl px-2 py-3">
      <div className="grid grid-cols-7">
        {days.map((d, i) => {
          const isToday = d.status === "today";
          const tappable = !!onSelectDay && d.hasSession;
          return (
            <motion.button
              type="button"
              key={d.date}
              onClick={tappable ? () => onSelectDay!(d.date) : undefined}
              disabled={!tappable}
              className={`flex flex-col items-center gap-1.5 ${tappable ? "active:scale-95 transition-transform" : ""}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <span
                className={`text-[11px] font-semibold ${
                  isToday ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {d.label}
              </span>

              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                  isToday
                    ? "bg-gradient-primary text-primary-foreground shadow-lg"
                    : d.status === "past" && d.hasSession
                    ? "bg-primary/15 text-primary"
                    : d.status === "upcoming"
                    ? "border border-primary/40 text-foreground"
                    : "bg-secondary/40 text-muted-foreground"
                }`}
                style={
                  isToday ? { boxShadow: "0 4px 12px hsl(18 100% 55% / 0.3)" } : undefined
                }
                aria-label={`${d.label} ${d.dayNum}${
                  isToday ? " (hoy)" : d.hasSession ? " (entreno)" : " (descanso)"
                }`}
              >
                {d.status === "past" && d.hasSession ? (
                  <Check className="w-4 h-4" />
                ) : (
                  d.dayNum
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default WeekStrip;
