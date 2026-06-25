/**
 * Card de objetivo semanal — el "glance" de progreso del Home.
 * Anillo (completadas / asignadas), racha, récord y tira de 7 días.
 * Research: rings para metas, números redondos, glanceable, sin ser el héroe.
 */
import { motion } from "framer-motion";
import { Flame, Trophy, Check, ChevronRight } from "lucide-react";
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

const DAYS = [
  { short: "L", full: "LUN" },
  { short: "M", full: "MAR" },
  { short: "X", full: "MIE" },
  { short: "J", full: "JUE" },
  { short: "V", full: "VIE" },
  { short: "S", full: "SAB" },
  { short: "D", full: "DOM" },
];

const getWeekDates = (): string[] => {
  const monday = getStartOfWeekLocal();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return getLocalDateString(d);
  });
};

const WeeklyGoalCard = ({ completedDates, goal, streak, bestTonnage }: WeeklyGoalCardProps) => {
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
      className="rounded-3xl card-elevated p-5 cursor-pointer"
    >
      <div className="flex items-center gap-5">
        <ProgressRing progress={pct} size={92} stroke={9}>
          <span className="text-xl font-black text-foreground tabular-nums leading-none">
            <CountUp value={pct} />%
          </span>
        </ProgressRing>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Objetivo semanal
            </p>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>

          <p className="text-2xl font-black text-foreground tracking-tight mt-0.5 leading-none">
            <CountUp value={completed} />
            <span className="text-muted-foreground font-bold text-lg"> / {goal}</span>
            <span className="text-sm font-semibold text-muted-foreground"> entrenos</span>
          </p>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-2.5 py-1.5">
              <Flame className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-black text-foreground tabular-nums">
                <CountUp value={streak} />
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">racha</span>
            </div>
            {bestTonnage != null && (
              <div className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-2.5 py-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-black text-foreground tabular-nums">
                  <CountUp value={bestTonnage} />
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">kg récord</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tira de 7 días */}
      <div className="grid grid-cols-7 gap-1.5 mt-4">
        {DAYS.map((day, i) => {
          const dateStr = weekDates[i];
          const isCompleted = completedSet.has(dateStr);
          const isToday = dateStr === todayStr;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`w-full aspect-square max-w-[2.25rem] rounded-xl flex items-center justify-center font-bold text-xs ${
                  isCompleted
                    ? "bg-gradient-primary text-primary-foreground"
                    : isToday
                      ? "border-2 border-primary text-primary bg-primary/10"
                      : "bg-secondary/50 text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : day.short}
              </div>
              <span
                className={`text-[8px] font-medium uppercase tracking-wide ${
                  isToday ? "text-primary font-bold" : "text-muted-foreground"
                }`}
              >
                {isToday ? "HOY" : day.full}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default WeeklyGoalCard;
