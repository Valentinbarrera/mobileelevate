import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import CountUp from "@/components/ui/count-up";

interface ActivityStreakProps {
  currentStreak: number;
  month: string;
  year: number;
  activeDays: number[];
}

const MILESTONES = [3, 7, 14, 30, 60, 100, 180, 365];

const motivationalCopy = (s: number) => {
  if (s <= 0) return "¡Arrancá tu racha hoy!";
  if (s < 3) return "¡Buen comienzo, no aflojes!";
  if (s < 7) return "¡Vas encendido!";
  if (s < 14) return "¡Una semana imparable!";
  if (s < 30) return "¡Sos una máquina!";
  return "¡Leyenda! 🏆";
};

const DOW = ["D", "L", "M", "M", "J", "V", "S"];

const ActivityStreak = ({ currentStreak, month, year, activeDays }: ActivityStreakProps) => {
  const now = new Date();
  const monthIndex = now.getMonth();
  const yearNum = now.getFullYear();
  const todayDate = now.getDate();
  const active = currentStreak > 0;

  // Próxima meta + progreso hacia ella
  const nextMilestone = MILESTONES.find((m) => m > currentStreak) ?? currentStreak;
  const prevMilestone = [...MILESTONES].reverse().find((m) => m <= currentStreak) ?? 0;
  const milestonePct = nextMilestone > prevMilestone
    ? Math.min(100, ((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100)
    : 100;

  // Últimos 7 días (hoy a la derecha)
  const last7 = Array.from({ length: 7 }, (_, i) =>
    new Date(yearNum, monthIndex, todayDate - (6 - i))
  );

  return (
    <motion.div
      className="card-elevated rounded-2xl p-4 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="accent-bar" />
          <h3 className="text-foreground font-black tracking-tight">Racha de Actividad</h3>
        </div>
        <span className="text-primary text-sm font-semibold">{month} {year}</span>
      </div>

      {/* Hero: llama animada + número */}
      <div className="flex items-center gap-4 mb-4">
        <motion.div
          className="relative w-16 h-16 shrink-0 flex items-center justify-center"
          animate={active ? { scale: [1, 1.07, 1] } : {}}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Glow que respira */}
          {active && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/30 blur-lg"
              animate={{ opacity: [0.4, 0.85, 0.4], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <div
            className={`relative w-14 h-14 rounded-2xl flex items-center justify-center border ${
              active
                ? "bg-primary/15 border-primary/30"
                : "bg-secondary/60 border-white/[0.06]"
            }`}
          >
            <Flame
              className={`w-7 h-7 ${active ? "text-primary fill-primary/30" : "text-muted-foreground"}`}
            />
          </div>
        </motion.div>

        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <CountUp
              value={currentStreak}
              className="text-4xl font-black tabular-nums text-foreground leading-none"
            />
            <span className="text-sm font-bold text-muted-foreground">
              {currentStreak === 1 ? "día" : "días"}
            </span>
          </div>
          <motion.p
            key={motivationalCopy(currentStreak)}
            className="text-xs font-semibold text-primary mt-1"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {motivationalCopy(currentStreak)}
          </motion.p>
        </div>
      </div>

      {/* Progreso hacia la próxima meta */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
          <span className="text-muted-foreground uppercase tracking-wider">Próxima meta</span>
          <span className="text-foreground tabular-nums">
            {currentStreak}<span className="text-muted-foreground">/{nextMilestone} días</span>
          </span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${milestonePct}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          />
        </div>
      </div>

      {/* Últimos 7 días */}
      <div className="grid grid-cols-7 gap-1">
        {last7.map((d, i) => {
          const inMonth = d.getMonth() === monthIndex && d.getFullYear() === yearNum;
          const isActive = inMonth && activeDays.includes(d.getDate());
          const isToday = inMonth && d.getDate() === todayDate;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className={`text-[10px] font-bold uppercase ${
                  isToday ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {DOW[d.getDay()]}
              </span>
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isToday
                      ? "border-2 border-primary/50 text-foreground"
                      : "bg-secondary/50 text-muted-foreground/60"
                }`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.04, type: "spring", stiffness: 400, damping: 18 }}
              >
                {isActive ? (
                  <Flame className="w-4 h-4 fill-current" />
                ) : (
                  <span className="text-xs font-semibold">{d.getDate()}</span>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ActivityStreak;
