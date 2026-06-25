/**
 * Tira de stats rápidos para el Home: una mirada de un vistazo al estado
 * del alumno (racha, entrenos de la semana, mejor sesión) con números
 * que cuentan hacia arriba. Estilo glance de Hevy/Gymshark.
 */
import { motion } from "framer-motion";
import { Flame, CalendarCheck, Trophy } from "lucide-react";
import CountUp from "@/components/ui/count-up";
import { fadeUp } from "@/lib/animations";

interface QuickStatsProps {
  streak: number;
  sessionsThisWeek: number;
  bestTonnage: number | null;
}

const QuickStats = ({ streak, sessionsThisWeek, bestTonnage }: QuickStatsProps) => {
  const stats = [
    {
      icon: Flame,
      label: "Racha",
      value: streak,
      unit: streak === 1 ? "día" : "días",
      accent: "text-primary",
      glow: "bg-primary/10",
    },
    {
      icon: CalendarCheck,
      label: "Esta semana",
      value: sessionsThisWeek,
      unit: sessionsThisWeek === 1 ? "entreno" : "entrenos",
      accent: "text-emerald-400",
      glow: "bg-emerald-400/10",
    },
    {
      icon: Trophy,
      label: "Mejor sesión",
      value: bestTonnage,
      unit: "kg",
      accent: "text-amber-400",
      glow: "bg-amber-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.label}
            variants={fadeUp}
            className="relative rounded-2xl bg-card border border-border p-3 overflow-hidden"
          >
            {/* Glow sutil de fondo */}
            <div className={`absolute -top-6 -right-6 w-16 h-16 rounded-full blur-2xl ${s.glow}`} />

            <div className={`relative w-7 h-7 rounded-lg bg-secondary/60 flex items-center justify-center mb-2`}>
              <Icon className={`w-3.5 h-3.5 ${s.accent}`} />
            </div>

            <div className="relative flex items-baseline gap-1">
              {s.value == null ? (
                <span className="text-xl font-black text-muted-foreground">—</span>
              ) : (
                <CountUp
                  value={s.value}
                  className="text-xl font-black text-foreground tracking-tight tabular-nums"
                />
              )}
              {s.value != null && (
                <span className="text-[10px] font-bold text-muted-foreground">{s.unit}</span>
              )}
            </div>

            <p className="relative text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5 truncate">
              {s.label}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default QuickStats;
