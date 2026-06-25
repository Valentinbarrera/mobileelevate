/**
 * Carrusel horizontal del plan: muestra TODOS los días de la rutina con HOY
 * resaltado. Usa drag (framer-motion) para que se deslice con mouse en desktop
 * y con el dedo en mobile — con momentum. Aporta variedad de ritmo visual.
 */
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Clock, ChevronRight } from "lucide-react";
import type { TodayRoutineDay } from "@/hooks/useCoachHomeData";
import { fadeUp } from "@/lib/animations";

interface PlanDaysCarouselProps {
  days: TodayRoutineDay[];
  todayId: string | null;
  routineId: string;
}

const PlanDaysCarousel = ({ days, todayId, routineId }: PlanDaysCarouselProps) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [maxDrag, setMaxDrag] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current && trackRef.current) {
        const diff = trackRef.current.scrollWidth - containerRef.current.clientWidth;
        setMaxDrag(diff > 0 ? diff : 0);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [days.length]);

  // Evita navegar si el "click" vino de un arrastre
  const open = (day: TodayRoutineDay) => {
    if (draggingRef.current) return;
    navigate(`/workout/${day.id}`, { state: { routineDayId: day.id, routineId } });
  };

  if (!days.length) return null;

  return (
    <motion.div variants={fadeUp} className="space-y-3">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <span className="accent-bar" />
          <h3 className="text-sm font-black text-foreground tracking-tight">Tu plan</h3>
        </div>
        <span className="text-xs text-muted-foreground">{days.length} días</span>
      </div>

      <div ref={containerRef} className="overflow-hidden">
        <motion.div
          ref={trackRef}
          className="flex gap-3 cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: -maxDrag, right: 0 }}
          dragElastic={0.08}
          dragMomentum
          onDragStart={() => {
            draggingRef.current = true;
          }}
          onDragEnd={() => {
            // pequeño delay para que el click posterior al drag no dispare navegación
            window.setTimeout(() => {
              draggingRef.current = false;
            }, 60);
          }}
        >
          {days.map((day) => {
            const isToday = day.id === todayId;
            const muscles = [...new Set(day.exercises.map((e) => e.muscleGroup).filter(Boolean))]
              .slice(0, 2)
              .join(" · ");

            return (
              <motion.button
                key={day.id}
                onClick={() => open(day)}
                whileTap={{ scale: 0.97 }}
                className={`relative shrink-0 w-[164px] text-left rounded-2xl p-4 overflow-hidden select-none ${
                  isToday
                    ? "bg-gradient-to-br from-primary/25 via-primary/10 to-[hsl(0_0%_7%)] border border-primary/40 shadow-[0_10px_26px_hsl(18_100%_55%/0.18)]"
                    : "card-elevated"
                }`}
              >
                {/* Número de día gigante de fondo (branding + interés visual) */}
                <span
                  className={`pointer-events-none absolute -top-4 right-0 text-[5.5rem] font-black leading-none select-none ${
                    isToday ? "text-primary/20" : "text-white/[0.04]"
                  }`}
                >
                  {day.dayNumber}
                </span>

                <div className="relative flex items-center justify-between mb-7">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider ${
                      isToday ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Día {day.dayNumber}
                  </span>
                  {isToday ? (
                    <span className="text-[9px] font-black text-primary-foreground bg-gradient-primary px-1.5 py-0.5 rounded-md uppercase tracking-wide shadow-sm">
                      Hoy
                    </span>
                  ) : (
                    <span className="w-7 h-7 rounded-lg bg-secondary/70 flex items-center justify-center">
                      <Dumbbell className="w-3.5 h-3.5 text-muted-foreground" />
                    </span>
                  )}
                </div>

                <p className="relative text-[15px] font-black text-foreground leading-tight line-clamp-2 mb-1">
                  {day.name}
                </p>
                <p
                  className={`relative text-[11px] capitalize truncate ${
                    isToday ? "text-primary/90 font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {muscles || "Full body"}
                </p>

                <div className="relative flex items-center gap-3 mt-3 pt-3 border-t border-white/[0.06]">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
                    <Dumbbell className="w-3 h-3" />
                    {day.totalExercises}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
                    <Clock className="w-3 h-3" />~{day.estimatedDuration}m
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 ml-auto ${isToday ? "text-primary" : "text-muted-foreground/50"}`}
                  />
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PlanDaysCarousel;
