/**
 * Objetivo semanal — versión compacta y densa (poca altura, sin perder lo
 * motivacional): anillo de %, completados/meta, racha y tira fina de 7 días.
 */
import { motion } from "framer-motion";
import { Flame, ChevronRight } from "lucide-react";
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

const getWeekDates = (): string[] => {
  const monday = getStartOfWeekLocal();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return getLocalDateString(d);
  });
};

const WeeklyGoalCard = ({ completedDates, goal, streak }: WeeklyGoalCardProps) => {
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
      <div className="flex items-center gap-4">
        <ProgressRing progress={pct} size={62} stroke={7} gradientId="weekRing">
          <span className="text-base font-black text-foreground tabular-nums leading-none">
            <CountUp value={pct} />%
          </span>
        </ProgressRing>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Objetivo semanal
            </p>
            <div className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-2 py-1 shrink-0">
              <Flame className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-black text-foreground tabular-nums">
                <CountUp value={streak} />
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">racha</span>
            </div>
          </div>

          <p className="text-xl font-black text-foreground tracking-tight leading-none mt-1">
            <CountUp value={completed} />
            <span className="text-sm font-bold text-muted-foreground"> / {goal} entrenos</span>
          </p>

          {/* Tira fina de la semana */}
          <div className="flex items-center gap-1 mt-2.5">
            {weekDates.map((d, i) => {
              const done = completedSet.has(d);
              const isToday = d === todayStr;
              return (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${
                    done ? "bg-gradient-primary" : isToday ? "bg-primary/40" : "bg-secondary"
                  }`}
                />
              );
            })}
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-1 shrink-0" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeeklyGoalCard;
