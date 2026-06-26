/**
 * Estado de DÍA DE DESCANSO en el Home — branded (naranja sobre negro).
 * Deja claro que hoy toca recuperar y destaca el PRÓXIMO entrenamiento
 * con un CTA naranja, igual de enfático que el héroe de entrenamiento.
 */
import { Moon, Play, Droplets, Sparkles, ChevronRight, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { parseISO, isTomorrow, isToday, format } from "date-fns";
import { es } from "date-fns/locale";
import { fadeUp } from "@/lib/animations";
import type { TodayRoutineDay } from "@/hooks/useCoachHomeData";

interface RestDayCardProps {
  nextDay?: TodayRoutineDay | null;
  nextDate?: string | null;
  routineId?: string;
}

const friendlyWhen = (iso?: string | null): string | null => {
  if (!iso) return null;
  const d = parseISO(iso);
  if (isToday(d)) return "Hoy";
  if (isTomorrow(d)) return "Mañana";
  return format(d, "EEE d", { locale: es });
};

const RestDayCard = ({ nextDay, nextDate, routineId }: RestDayCardProps) => {
  const navigate = useNavigate();
  const when = friendlyWhen(nextDate);

  const startNext = () => {
    if (!nextDay) return;
    navigate(`/workout/${nextDay.id}`, {
      state: { routineDayId: nextDay.id, routineId },
    });
  };

  return (
    <motion.div className="relative card-hero rounded-3xl overflow-hidden" variants={fadeUp}>
      {/* Glow de marca */}
      <div className="pointer-events-none absolute -top-16 -right-12 w-52 h-52 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative p-5">
        {/* Encabezado: hoy = descanso */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Moon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-primary uppercase tracking-wider">Hoy · Descanso</p>
            <h2 className="text-xl font-black text-foreground leading-tight">Día de recuperación</h2>
          </div>
        </div>

        {/* Próximo entreno (destacado, naranja) */}
        {nextDay && (
          <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-transparent border border-primary/25 p-4 mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
                Próximo entreno{when ? ` · ${when}` : ""}
              </p>
              <CalendarDays className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-lg font-black text-foreground leading-tight">{nextDay.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
              {nextDay.totalExercises} ejercicios · ~{nextDay.estimatedDuration} min
            </p>

            <motion.button
              onClick={startNext}
              className="w-full mt-3 flex items-center justify-center gap-2 bg-gradient-primary rounded-xl py-3 glow-primary"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="w-4 h-4 text-primary-foreground fill-current" />
              <span className="text-primary-foreground font-bold text-sm uppercase tracking-wide">
                Empezar igual
              </span>
            </motion.button>
          </div>
        )}

        {/* Tips de recuperación (compactos, secundarios) */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-secondary/40 border border-white/[0.04]">
            <Droplets className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground">2L de agua</span>
          </div>
          <div className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-secondary/40 border border-white/[0.04]">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground">10 min movilidad</span>
          </div>
        </div>

        {/* Link secundario (ya no es un botón gris feo) */}
        <button
          onClick={() => navigate("/routines")}
          className="w-full flex items-center justify-center gap-1 py-2 text-sm font-bold text-primary active:opacity-70 transition-opacity"
        >
          Ver mi rutina completa
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default RestDayCard;
