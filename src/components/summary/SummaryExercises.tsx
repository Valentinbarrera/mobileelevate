/**
 * Cómo te fue en cada ejercicio: mejor serie, volumen y la diferencia con la
 * vez pasada. Es lo que hace que terminar un entreno se sienta como avanzar.
 */
import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import type { SessionRecap } from "@/lib/sessionRecap";
import { formatKg } from "@/lib/loadSuggestion";

const fmtVolume = (kg: number) =>
  kg >= 1000 ? `${(kg / 1000).toFixed(1).replace(".", ",")} t` : `${Math.round(kg)} kg`;

const pct = (now: number, before: number) =>
  before > 0 ? Math.round(((now - before) / before) * 100) : null;

const SummaryExercises = ({ recap }: { recap: SessionRecap }) => {
  if (recap.exercises.length === 0) return null;
  const totalDiff = pct(recap.comparableVolume, recap.prevComparableVolume);

  return (
    <motion.div
      className="px-5 mb-6 space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      {/* Volumen total + comparación */}
      <div className="rounded-2xl bg-secondary/40 border border-white/[0.06] p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Volumen movido</p>
          <p className="text-3xl font-black text-foreground tabular-nums">{fmtVolume(recap.totalVolume)}</p>
        </div>
        <div className="text-right">
          {totalDiff != null ? (
            <p
              className={`inline-flex items-center gap-1 text-base font-black tabular-nums ${
                totalDiff >= 0 ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {totalDiff >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {totalDiff >= 0 ? "+" : ""}
              {totalDiff}%
            </p>
          ) : (
            <p className="text-sm font-bold text-primary">Primera vez</p>
          )}
          <p className="text-[12px] text-muted-foreground">
            {totalDiff != null ? "vs. la vez pasada" : "La próxima comparamos"}
          </p>
          {recap.prCount > 0 && (
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-black text-amber-400">
              <Trophy className="w-4 h-4" /> {recap.prCount} {recap.prCount === 1 ? "récord" : "récords"}
            </p>
          )}
        </div>
      </div>

      {/* Por ejercicio */}
      <div className="rounded-2xl bg-secondary/40 border border-white/[0.06] divide-y divide-white/[0.06]">
        {recap.exercises.map((ex, i) => {
          const diff = ex.prevVolume != null ? pct(ex.volume, ex.prevVolume) : null;
          return (
            <div key={`${ex.name}-${i}`} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-foreground truncate flex items-center gap-1.5">
                  {ex.isPR && <Trophy className="w-4 h-4 text-amber-400 shrink-0" />}
                  {ex.name}
                </p>
                <p className="text-[13px] text-muted-foreground tabular-nums">
                  {ex.sets} {ex.sets === 1 ? "serie" : "series"} · mejor{" "}
                  {ex.best.weight > 0 ? `${formatKg(ex.best.weight)} kg × ` : ""}
                  {ex.best.reps}
                </p>
              </div>
              <div className="text-right shrink-0">
                {ex.isPR ? (
                  <span className="text-[11px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-amber-500/15 text-amber-400">
                    Récord
                  </span>
                ) : diff != null ? (
                  <span
                    className={`text-sm font-black tabular-nums ${
                      diff > 0 ? "text-emerald-400" : diff < 0 ? "text-amber-400" : "text-muted-foreground"
                    }`}
                  >
                    {diff > 0 ? "+" : ""}
                    {diff}%
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[12px] font-bold text-primary">
                    <Sparkles className="w-3.5 h-3.5" /> Nuevo
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SummaryExercises;
