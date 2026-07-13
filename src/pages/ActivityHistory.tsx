/**
 * Historial de actividad — todos los meses con su consistencia y racha.
 *
 * Reusa la MISMA fuente que la racha del progreso (completed_sessions vía
 * useWorkoutDetails), agrupa por mes y calcula: días entrenados, mejor racha
 * de días consecutivos y % de consistencia (días entrenados / días del mes;
 * en el mes en curso, sobre los días transcurridos).
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, CalendarDays } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageLoading from "@/components/ui/page-loading";
import { useWorkoutDetails } from "@/hooks/useWorkoutDetails";
import { staggerContainer, fadeUp } from "@/lib/animations";

const DOW = ["D", "L", "M", "M", "J", "V", "S"];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

interface MonthActivity {
  key: string; // YYYY-MM
  label: string;
  year: number;
  monthIndex: number;
  activeDays: number[]; // 1..31
  trainedDays: number;
  daysInMonth: number;
  denominator: number; // días del mes (o transcurridos si es el mes actual)
  consistency: number; // 0..100
  bestStreak: number; // mejor racha de días consecutivos en el mes
}

/** Mejor racha de días consecutivos dentro de un set de días del mes. */
const bestConsecutive = (days: number[]): number => {
  if (days.length === 0) return 0;
  const sorted = [...days].sort((a, b) => a - b);
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    run = sorted[i] === sorted[i - 1] + 1 ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
};

export default function ActivityHistory() {
  const navigate = useNavigate();
  const { sessions, loading } = useWorkoutDetails();

  const months = useMemo<MonthActivity[]>(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const today = now.getDate();

    // Días entrenados (distintos) por mes
    const byMonth = new Map<string, Set<number>>();
    for (const s of sessions) {
      const [y, m, d] = s.date.split("-").map(Number);
      if (!y || !m || !d) continue;
      const key = `${y}-${String(m).padStart(2, "0")}`;
      let set = byMonth.get(key);
      if (!set) {
        set = new Set();
        byMonth.set(key, set);
      }
      set.add(d);
    }

    return [...byMonth.entries()]
      .map(([key, set]) => {
        const [year, month] = key.split("-").map(Number);
        const monthIndex = month - 1;
        const daysInMonth = new Date(year, month, 0).getDate();
        const isCurrent = year === curYear && monthIndex === curMonth;
        const denominator = isCurrent ? today : daysInMonth;
        const activeDays = [...set].sort((a, b) => a - b);
        const trainedDays = activeDays.length;
        const label = cap(
          new Date(year, monthIndex, 1).toLocaleDateString("es-AR", {
            month: "long",
            year: "numeric",
          })
        );
        return {
          key,
          label,
          year,
          monthIndex,
          activeDays,
          trainedDays,
          daysInMonth,
          denominator,
          consistency: Math.min(100, Math.round((trainedDays / Math.max(1, denominator)) * 100)),
          bestStreak: bestConsecutive(activeDays),
        };
      })
      .sort((a, b) => (a.key < b.key ? 1 : -1)); // más reciente primero
  }, [sessions]);

  if (loading) return <PageLoading message="Cargando tu actividad..." />;

  return (
    <AppShell>
      <motion.div
        className="min-h-screen bg-background pb-32 lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
          <div className="max-w-3xl mx-auto flex items-center gap-3 px-5 py-3">
            <button onClick={() => navigate(-1)} className="text-muted-foreground" aria-label="Volver">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Actividad</span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-foreground">Historial</h1>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-5 pt-5 space-y-4">
          {months.length === 0 ? (
            <motion.div variants={fadeUp} className="card-elevated rounded-2xl p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-7 h-7 text-primary" />
              </div>
              <p className="text-base font-black text-foreground mb-1">Todavía no hay actividad</p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Cuando completes entrenos, cada mes va a aparecer acá con su racha y consistencia.
              </p>
            </motion.div>
          ) : (
            months.map((m) => (
              <motion.div key={m.key} variants={fadeUp} className="card-elevated rounded-2xl p-4">
                {/* Encabezado del mes */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="accent-bar" />
                  <h3 className="text-sm font-black text-foreground tracking-tight capitalize">{m.label}</h3>
                  <span className="ml-auto text-sm font-black text-primary tabular-nums">{m.consistency}%</span>
                </div>

                {/* Stats: días entrenados · mejor racha */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="rounded-xl bg-secondary/40 border border-white/[0.05] p-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Días entrenados
                    </p>
                    <p className="text-lg font-black text-foreground tabular-nums leading-none">
                      {m.trainedDays}
                      <span className="text-xs font-bold text-muted-foreground">/{m.denominator}</span>
                    </p>
                  </div>
                  <div className="rounded-xl bg-secondary/40 border border-white/[0.05] p-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Mejor racha
                    </p>
                    <p className="flex items-center gap-1 text-lg font-black text-foreground tabular-nums leading-none">
                      <Flame className="w-4 h-4 text-primary fill-primary/30" />
                      {m.bestStreak}
                      <span className="text-xs font-bold text-muted-foreground">
                        {m.bestStreak === 1 ? "día" : "días"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Barra de consistencia */}
                <div className="h-2 rounded-full bg-secondary overflow-hidden mb-3">
                  <motion.div
                    className="h-full rounded-full bg-gradient-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${m.consistency}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </div>

                {/* Mini calendario del mes */}
                <MonthGrid year={m.year} monthIndex={m.monthIndex} activeDays={m.activeDays} />
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </AppShell>
  );
}

/** Grilla compacta del mes con la llamita en los días entrenados. */
function MonthGrid({
  year,
  monthIndex,
  activeDays,
}: {
  year: number;
  monthIndex: number;
  activeDays: number[];
}) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDow = new Date(year, monthIndex, 1).getDay();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const activeSet = new Set(activeDays);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DOW.map((d, i) => (
          <span key={i} className="text-center text-[9px] font-bold uppercase text-muted-foreground">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) =>
          day === null ? (
            <div key={`e-${i}`} />
          ) : (
            <div
              key={day}
              className={`aspect-square rounded-md flex items-center justify-center ${
                activeSet.has(day)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/30 text-muted-foreground/50"
              }`}
            >
              {activeSet.has(day) ? (
                <Flame className="w-3 h-3 fill-current" />
              ) : (
                <span className="text-[10px] font-semibold tabular-nums">{day}</span>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
