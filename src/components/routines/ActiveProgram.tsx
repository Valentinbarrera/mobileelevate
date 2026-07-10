/**
 * ActiveProgram — HÉROE de la pantalla Entrenar: pone al PROGRAMA activo como
 * protagonista (portada + objetivo + "Semana X de Y" + progreso) con un CTA
 * grande para entrar al detalle del programa. Estilo premium (Apple/Ladder):
 * imagen de portada, mucho aire y jerarquía tipográfica clara.
 */
import { motion } from "framer-motion";
import { ChevronRight, Trophy } from "lucide-react";
import workoutHeroImage from "@/assets/workout-hero.jpg";
import type { AlumnoRoutineWithDetails } from "@/types/coach";

interface ActiveProgramProps {
  assignment: AlumnoRoutineWithDetails;
  /** semana actual (1-based) */
  weekIndex: number;
  /** total de semanas del programa */
  weekCount: number;
  /** progreso 0-100 (% de sesiones hechas) */
  progress: number;
  onView: (routineId: string) => void;
}

const ActiveProgram = ({
  assignment,
  weekIndex,
  weekCount,
  progress,
  onView,
}: ActiveProgramProps) => {
  const routine = assignment.routine;
  if (!routine) return null;

  const cover = routine.image_url || workoutHeroImage;
  const objetivo = routine.description?.trim();

  return (
    <motion.button
      type="button"
      onClick={() => onView(routine.id)}
      whileTap={{ scale: 0.99 }}
      className="group block w-full text-left rounded-3xl overflow-hidden card-hero"
    >
      {/* ── Portada ── */}
      <div className="relative h-40 sm:h-44">
        <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/25" />

        <div className="absolute inset-0 flex flex-col justify-between p-5">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              Programa activo
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight text-white leading-tight line-clamp-2">
              {routine.name}
            </h2>
            {objetivo && (
              <p className="text-sm text-white/70 mt-1 line-clamp-1">{objetivo}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Progreso ── */}
      <div className="p-5">
        <div className="flex items-end justify-between mb-2">
          <span className="text-sm font-bold text-foreground tabular-nums">
            Semana {weekIndex}
            <span className="text-muted-foreground font-semibold"> de {weekCount}</span>
          </span>
          <span className="text-sm font-black text-primary tabular-nums">{progress}%</span>
        </div>

        <div className="h-2 rounded-full bg-secondary/60 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 h-12 rounded-2xl bg-gradient-primary text-primary-foreground font-black tracking-wide glow-primary group-active:scale-[0.99] transition-transform">
          Ver programa
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </motion.button>
  );
};

export default ActiveProgram;
