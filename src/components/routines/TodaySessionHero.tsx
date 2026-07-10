/**
 * TodaySessionHero — la pieza central de la pantalla Rutinas.
 * Responde "¿qué entreno hoy?" en < 3s y ofrece UN solo CTA: empezar.
 *
 * Variantes:
 *  - "ready": hay sesión para hoy (o fallback a la rutina activa) → EMPEZAR
 *  - "rest":  no hay sesión hoy → mensaje de descanso + próxima sesión
 */
import { motion } from "framer-motion";
import { Play, ChevronRight, Clock, Dumbbell, BarChart3, Moon, Check } from "lucide-react";
import type { SessionInfo } from "@/lib/routineSession";
import {
  dayTitle,
  estimateSessionMinutes,
  exerciseCount,
  getMuscleTags,
  totalSets,
} from "@/lib/routineSession";

interface TodaySessionHeroProps {
  variant: "ready" | "rest";
  /** etiqueta superior: "HOY", "TU RUTINA", "PRÓXIMO ENTRENO"… */
  label: string;
  session: SessionInfo | null;
  onStart: (session: SessionInfo) => void;
  onView: (routineId: string) => void;
  /** si la sesión ya está marcada como hecha (completado manual) */
  done?: boolean;
  /** marcar/desmarcar la sesión como hecha (opcional) */
  onToggleDone?: () => void;
}

const MetaItem = ({ icon, value }: { icon: React.ReactNode; value: string }) => (
  <div className="flex items-center gap-1.5 text-foreground/90">
    {icon}
    <span className="text-sm font-semibold">{value}</span>
  </div>
);

const TodaySessionHero = ({
  variant,
  label,
  session,
  onStart,
  onView,
  done,
  onToggleDone,
}: TodaySessionHeroProps) => {
  if (!session) return null;

  const { day, assignment } = session;
  const muscles = getMuscleTags(day);
  const minutes = estimateSessionMinutes(day);
  const exercises = exerciseCount(day);
  const sets = totalSets(day);
  const isRest = variant === "rest";

  return (
    <motion.section
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card"
    >
      {/* glow de fondo */}
      <div className="absolute -top-16 -right-10 w-48 h-48 bg-primary/20 rounded-full blur-[80px]" />

      <div className="relative p-5">
        {/* etiqueta */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
            {label}
          </span>
          {isRest && <Moon className="w-4 h-4 text-primary" />}
        </div>

        {isRest ? (
          <>
            <h2 className="text-2xl font-black text-foreground leading-tight">
              Día de descanso 😴
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Hoy no tenés entreno agendado. Recuperá bien. Tu próxima sesión:
            </p>
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-secondary/40 px-4 py-3">
              <span className="text-sm font-semibold text-foreground">
                {dayTitle(day)}
              </span>
              <span className="text-xs text-muted-foreground">{minutes} min</span>
            </div>
            <button
              onClick={() => onStart(session)}
              className="mt-4 w-full h-12 rounded-2xl border border-border bg-secondary/50 text-foreground font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Play className="w-4 h-4" /> Entrenar igual
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-black text-foreground leading-tight">
              {dayTitle(day)}
            </h2>

            {muscles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {muscles.map((m) => (
                  <span
                    key={m}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}

            {/* métricas que importan: tiempo, ejercicios, series */}
            <div className="flex items-center gap-4 mt-4">
              <MetaItem icon={<Clock className="w-4 h-4 text-primary" />} value={`~${minutes} min`} />
              <MetaItem icon={<Dumbbell className="w-4 h-4 text-primary" />} value={`${exercises} ej`} />
              <MetaItem icon={<BarChart3 className="w-4 h-4 text-primary" />} value={`${sets} series`} />
            </div>

            {/* CTA primario único */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onStart(session)}
              className="mt-5 w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-black text-base tracking-wide flex items-center justify-center gap-2 glow-primary"
            >
              <Play className="w-5 h-5 fill-current" />
              EMPEZAR ENTRENAMIENTO
            </motion.button>

            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                onClick={() => onView(assignment.routine.id)}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                Ver rutina completa
                <ChevronRight className="w-4 h-4" />
              </button>

              {onToggleDone && (
                <button
                  onClick={onToggleDone}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                    done
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                      : "bg-secondary/60 border-white/[0.06] text-muted-foreground"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      done ? "bg-emerald-500 text-white" : "border-2 border-current"
                    }`}
                  >
                    {done && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                  </span>
                  {done ? "Hecho" : "Marcar hecho"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </motion.section>
  );
};

export default TodaySessionHero;
