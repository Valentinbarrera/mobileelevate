/**
 * Pasos de hoy (Apple Salud): anillo vs. meta diaria + barras de los últimos 7 días.
 * Sólo se renderiza en iOS nativo; antes de conectar muestra el botón de permiso.
 */
import { motion } from "framer-motion";
import { Footprints } from "lucide-react";
import ProgressRing from "@/components/ui/progress-ring";
import CountUp from "@/components/ui/count-up";
import { useSteps } from "@/hooks/useSteps";
import { STEPS_GOAL } from "@/lib/healthSteps";
import { parseLocalDateString } from "@/lib/date";
import { fadeUp } from "@/lib/animations";

const DAY_LABELS = ["D", "L", "M", "X", "J", "V", "S"];

const StepsCard = () => {
  const { supported, enabled, days, loading, error, connect } = useSteps();
  if (!supported) return null;

  if (!enabled) {
    return (
      <motion.div variants={fadeUp} className="rounded-3xl card-elevated p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Footprints className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Contador de pasos</p>
            <p className="text-xs text-muted-foreground">
              {error ? "No pudimos acceder a Apple Salud." : "Traé tus pasos desde Apple Salud."}
            </p>
          </div>
          <button
            onClick={connect}
            disabled={loading}
            className="shrink-0 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-bold px-3.5 py-2 active:scale-95 disabled:opacity-60"
          >
            Conectar
          </button>
        </div>
      </motion.div>
    );
  }

  const today = days[days.length - 1]?.steps ?? 0;
  const pct = Math.min(100, Math.round((today / STEPS_GOAL) * 100));
  const max = Math.max(STEPS_GOAL, ...days.map((d) => d.steps));

  return (
    <motion.div variants={fadeUp} className="rounded-3xl card-elevated p-4">
      <div className="flex items-center gap-4">
        <ProgressRing progress={pct} size={60} stroke={7} gradientId="stepsRing">
          <Footprints className="w-5 h-5 text-primary" />
        </ProgressRing>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Pasos hoy
          </p>
          <p className="text-2xl font-black text-foreground tracking-tight leading-none mt-1 tabular-nums">
            <CountUp value={today} />
            <span className="text-sm font-bold text-muted-foreground">
              {" "}/ {STEPS_GOAL.toLocaleString("es-AR")}
            </span>
          </p>
        </div>
      </div>

      {days.length > 0 && (
        <div className="grid grid-cols-7 gap-1.5 mt-3.5 items-end">
          {days.map((d, i) => {
            const isToday = i === days.length - 1;
            const label = DAY_LABELS[parseLocalDateString(d.date).getDay()];
            const h = Math.max(4, Math.round((d.steps / max) * 40));
            return (
              <div key={d.date} className="flex flex-col items-center gap-1">
                <div className="h-10 flex items-end w-full justify-center">
                  <div
                    style={{ height: h }}
                    className={`w-full max-w-[1.5rem] rounded-md ${
                      d.steps >= STEPS_GOAL
                        ? "bg-gradient-primary"
                        : isToday
                          ? "bg-primary/60"
                          : "bg-secondary"
                    }`}
                  />
                </div>
                <span
                  className={`text-[11px] font-bold ${isToday ? "text-primary" : "text-muted-foreground"}`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default StepsCard;
