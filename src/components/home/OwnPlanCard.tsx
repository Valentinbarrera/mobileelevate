/**
 * Héroe de Inicio cuando el plan activo es un programa PROPIO del alumno.
 *
 * A diferencia del plan del coach, un programa propio no tiene agenda: sus días
 * son una rotación. Por eso el copy dice "te toca" y no "hoy", que sería mentir
 * sobre un calendario que el alumno nunca eligió (ver lib/activePlan).
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Play, ChevronRight } from "lucide-react";
import type { MyProgram, ProgramDay } from "@/lib/myPrograms";

interface OwnPlanCardProps {
  program: MyProgram;
  day: ProgramDay;
  /** Posición del día dentro del programa (0-based), para el "Día N de M". */
  index: number;
}

const OwnPlanCard = ({ program, day, index }: OwnPlanCardProps) => {
  const navigate = useNavigate();
  const exerciseCount = day.exercises.length;

  return (
    <div className="card-hero rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
            Tu plan · {program.name}
          </p>
          <h2 className="text-2xl font-black text-foreground leading-tight mt-1 truncate">
            {day.name}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Día {index + 1} de {program.days.length} ·{" "}
            {exerciseCount} {exerciseCount === 1 ? "ejercicio" : "ejercicios"}
          </p>
        </div>
        <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
          <Dumbbell className="w-6 h-6 text-primary" />
        </div>
      </div>

      {exerciseCount > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {day.exercises.slice(0, 3).map((e, i) => (
            <span
              key={`${e.name}-${i}`}
              className="text-[11px] font-semibold text-muted-foreground bg-secondary/60 border border-white/[0.06] rounded-full px-2.5 py-1 truncate max-w-[45%]"
            >
              {e.name}
            </span>
          ))}
          {exerciseCount > 3 && (
            <span className="text-[11px] font-semibold text-muted-foreground/70 px-1 py-1">
              +{exerciseCount - 3}
            </span>
          )}
        </div>
      )}

      <motion.button
        onClick={() => navigate(`/programa/${program.id}/dia/${day.id}/entrenar`)}
        disabled={exerciseCount === 0}
        whileTap={{ scale: 0.99 }}
        className="w-full mt-4 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-primary text-primary-foreground font-black uppercase tracking-wide glow-primary disabled:opacity-40"
      >
        <Play className="w-4 h-4" fill="currentColor" />
        {exerciseCount === 0 ? "Este día no tiene ejercicios" : "Empezar entrenamiento"}
      </motion.button>

      <button
        onClick={() => navigate(`/programa/${program.id}`)}
        className="w-full mt-2 inline-flex items-center justify-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        Ver el programa completo <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default OwnPlanCard;
