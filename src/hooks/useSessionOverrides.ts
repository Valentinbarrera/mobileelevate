/**
 * Overrides locales del calendario: cuando el alumno reprograma o intercambia
 * el día (swap), guardamos un mapa fecha → routineDayId | "rest" que PISA el
 * plan del coach. Local-first; reactivo vía evento para que toda la app se
 * entere al instante.
 */
import { useState, useEffect, useCallback } from "react";

export type DayOverride = string; // routineDayId | "rest"

const keyFor = (studentId: string) => `elevate_overrides_${studentId}`;
const EVENT = "elevate-overrides-changed";

function read(studentId: string): Record<string, DayOverride> {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    return raw ? (JSON.parse(raw) as Record<string, DayOverride>) : {};
  } catch {
    return {};
  }
}

export function useSessionOverrides(studentId: string) {
  const [overrides, setOverrides] = useState<Record<string, DayOverride>>(() => read(studentId));

  useEffect(() => {
    const handler = () => setOverrides(read(studentId));
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, [studentId]);

  const setForDate = useCallback(
    (date: string, value: DayOverride | null) => {
      const next = read(studentId);
      if (value === null) delete next[date];
      else next[date] = value;
      try {
        localStorage.setItem(keyFor(studentId), JSON.stringify(next));
      } catch {
        /* almacenamiento no disponible */
      }
      window.dispatchEvent(new Event(EVENT));
      setOverrides({ ...next });
    },
    [studentId]
  );

  return { overrides, setForDate };
}
