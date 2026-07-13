import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, ChevronRight } from "lucide-react";
import CountUp from "@/components/ui/count-up";

interface ActivityStreakProps {
  currentStreak: number;
  month: string;
  year: number;
  activeDays: number[];
  /** Si viene, la racha es tocable y navega al historial de actividad. */
  onOpenHistory?: () => void;
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

const ActivityStreak = ({ currentStreak, month, year, activeDays, onOpenHistory }: ActivityStreakProps) => {
  const [expanded, setExpanded] = useState(false);
  const now = new Date();
  const monthIndex = now.getMonth();
  const yearNum = now.getFullYear();
  const todayDate = now.getDate();
  const active = currentStreak > 0;

  // Grilla del mes completo (para la vista "Ver todo"): huecos iniciales + días 1..N
  const daysInMonth = new Date(yearNum, monthIndex + 1, 0).getDate();
  const firstDow = new Date(yearNum, monthIndex, 1).getDay();
  const monthCells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

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

      {/* Hero: llama animada + número (tocable → historial si viene onOpenHistory) */}
      <button
        type="button"
        onClick={onOpenHistory}
        disabled={!onOpenHistory}
        className={`flex items-center gap-4 mb-4 w-full text-left ${
          onOpenHistory ? "active:scale-[0.99] transition-transform" : "cursor-default"
        }`}
      >
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

        {onOpenHistory && (
          <div className="ml-auto flex items-center gap-1 text-muted-foreground shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Historial</span>
            <ChevronRight className="w-5 h-5" />
          </div>
        )}
      </button>

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

      {/* Encabezado de la grilla + toggle Ver todo / Ver menos */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {expanded ? `${month} ${year}` : "Últimos 7 días"}
        </span>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[11px] font-bold text-primary active:scale-95 transition-transform"
        >
          {expanded ? "Ver menos" : "Ver todo"}
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {expanded ? (
          /* Vista mensual: calendario del mes con la llamita en los días activos */
          <motion.div
            key="month"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-7 gap-1 mb-1.5">
              {DOW.map((d, i) => (
                <span
                  key={i}
                  className="text-center text-[10px] font-bold uppercase text-muted-foreground"
                >
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthCells.map((day, i) => {
                if (day === null) return <div key={`e-${i}`} />;
                const isActive = activeDays.includes(day);
                const isToday = day === todayDate;
                return (
                  <div
                    key={day}
                    className={`aspect-square rounded-lg flex items-center justify-center ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isToday
                          ? "border-2 border-primary/50 text-foreground"
                          : "bg-secondary/40 text-muted-foreground/60"
                    }`}
                  >
                    {isActive ? (
                      <Flame className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <span className="text-[11px] font-semibold tabular-nums">{day}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* Últimos 7 días */
          <motion.div
            key="week"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-7 gap-1"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ActivityStreak;
