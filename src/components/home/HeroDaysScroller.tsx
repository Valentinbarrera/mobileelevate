/**
 * Héroe deslizable: la card principal del Home ahora se navega con scroll
 * horizontal entre los días del plan (patrón Lifts/Gymshark). Arranca centrada
 * en HOY y deja ver un "peek" del día siguiente para invitar a deslizar.
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

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-5 px-5 lg:mx-0 lg:px-0"
      >
        {days.map((day) => (
          <div key={day.id} className="snap-center shrink-0 w-[90%] sm:w-[85%] lg:w-full max-w-md">
            <CoachWorkoutCard
              routineDay={day}
              routineInfo={routineInfo}
              isToday={day.id === todayId}
              inProgress={day.id === todayId && inProgress}
            />
          </div>
        ))}
      </div>

      {days.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {days.map((d, i) => (
            <span
              key={d.id}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroDaysScroller;
