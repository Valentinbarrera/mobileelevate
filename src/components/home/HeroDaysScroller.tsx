/**
 * Héroe deslizable: la card principal del Home se navega con scroll horizontal
 * entre los días del plan (patrón Lifts/Gymshark/NTC). Arranca centrada en HOY.
 *
 * Detalle premium: la tarjeta activa se muestra al 100% y las laterales se
 * achican y atenúan (profundidad), el scroll se "pega" a cada tarjeta (snap) y
 * el avance se ve con una barra de progreso en vez de puntitos.
 */
import { useRef, useState, useEffect } from "react";
import CoachWorkoutCard from "./CoachWorkoutCard";
import type { TodayRoutineDay, ActiveRoutineInfo } from "@/hooks/useCoachHomeData";

interface HeroDaysScrollerProps {
  days: TodayRoutineDay[];
  todayId: string | null;
  routineInfo: ActiveRoutineInfo;
  inProgress?: boolean;
}

const HeroDaysScroller = ({ days, todayId, routineInfo, inProgress }: HeroDaysScrollerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayIndex = Math.max(0, days.findIndex((d) => d.id === todayId));
  const [active, setActive] = useState(todayIndex);

  // Centrar en el día de hoy al montar (sin animación, para que ya aparezca ahí)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const slide = el.children[todayIndex] as HTMLElement | undefined;
    if (slide) el.scrollLeft = slide.offsetLeft - el.offsetLeft;
    setActive(todayIndex);
  }, [todayIndex]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let idx = 0;
    let best = Infinity;
    Array.from(el.children).forEach((c, i) => {
      const k = c as HTMLElement;
      const kc = k.offsetLeft + k.clientWidth / 2;
      const d = Math.abs(kc - center);
      if (d < best) {
        best = d;
        idx = i;
      }
    });
    setActive(idx);
  };

  const multi = days.length > 1;

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-5 px-5 lg:mx-0 lg:px-0 py-1"
      >
        {days.map((day, i) => {
          const isActive = i === active;
          return (
            <div
              key={day.id}
              className={`snap-center shrink-0 w-[93%] sm:w-[86%] lg:w-full max-w-md origin-center transform-gpu transition-[transform,opacity] duration-300 ease-out ${
                multi && !isActive ? "scale-[0.92] opacity-45" : "scale-100 opacity-100"
              }`}
            >
              <CoachWorkoutCard
                routineDay={day}
                routineInfo={routineInfo}
                isToday={day.id === todayId}
                inProgress={day.id === todayId && inProgress}
                dimmed={multi && !isActive}
              />
            </div>
          );
        })}
      </div>

      {/* Barra de progreso: avance a través de los días del plan */}
      {multi && (
        <div className="flex items-center gap-2 mt-3 px-0.5">
          <div className="relative h-1 flex-1 rounded-full bg-muted-foreground/15 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-primary transition-[width] duration-300 ease-out"
              style={{ width: `${((active + 1) / days.length) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-muted-foreground tabular-nums shrink-0">
            {active + 1}/{days.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default HeroDaysScroller;
