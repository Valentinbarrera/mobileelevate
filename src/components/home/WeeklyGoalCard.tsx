/**
 * Objetivo semanal: anillo de %, completados/meta y racha (fila compacta),
 * con la tira de 7 días mostrando el número de cada día (✓ si entrenó).
 */
import { motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProgressRing from "@/components/ui/progress-ring";
import CountUp from "@/components/ui/count-up";
import { getLocalDateString, getStartOfWeekLocal } from "@/lib/date";
import { fadeUp } from "@/lib/animations";

interface WeeklyGoalCardProps {
  completedDates: string[];
  goal: number;
  streak: number;
  bestTonnage: number | null;
}

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

const getWeekDates = (): string[] => {
  const monday = getStartOfWeekLocal();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return getLocalDateString(d);
  });
};

const WeeklyGoalCard = ({ completedDates, goal }: WeeklyGoalCardProps) => {
  const navigate = useNavigate();
  const weekDates = getWeekDates();
  const todayStr = getLocalDateString();
  const completedSet = new Set(completedDates);
  const completed = weekDates.filter((d) => completedSet.has(d)).length;
  const pct = goal > 0 ? Math.min(100, Math.round((completed / goal) * 100)) : 0;

  return (
    <motion.div
      variants={fadeUp}
      onClick={() => navigate("/progress")}
      whileTap={{ scale: 0.99 }}
      className="rounded-3xl card-elevated p-4 cursor-pointer"
    >
      {/* Fila compacta: anillo + completados + racha */}
      <div className="flex items-center gap-4">
        <ProgressRing progress={pct} size={60} stroke={7} gradientId="weekRing">
          <span className="text-base font-black text-foreground tabular-nums leading-none">
            <CountUp value={pct} />%
          </span>
        </ProgressRing>

        <div className="flex-1 min-w-0">
          {/* La racha vive en el header del Home; acá se omite para no duplicarla. */}
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Objetivo semanal
          </p>
          <p className="text-2xl font-black text-foreground tracking-tight leading-none mt-1">
            <CountUp value={completed} />
            <span className="text-sm font-bold text-muted-foreground"> / {goal} entrenos</span>
          </p>
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 self-start" />
      </div>

      {/* Tira de 7 días con el número de cada día */}
      <div className="grid grid-cols-7 gap-1.5 mt-3.5">
        {weekDates.map((d, i) => {
          const done = completedSet.has(d);
          const isToday = d === todayStr;
          const dayNum = parseInt(d.split("-")[2], 10);
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className={`text-[9px] font-bold uppercase ${
                  isToday ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {DAY_LABELS[i]}
              </span>
              <div
                className={`w-full aspect-square max-w-[2.25rem] rounded-xl flex items-center justify-center text-xs font-bold tabular-nums ${
                  done
                    ? "bg-gradient-primary text-primary-foreground"
                    : isToday
                      ? "border-2 border-primary text-primary bg-primary/10"
                      : "bg-secondary/50 text-muted-foreground"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : dayNum}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default WeeklyGoalCard;
