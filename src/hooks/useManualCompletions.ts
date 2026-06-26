/**
 * Completados MANUALES del alumno (localStorage). Permite tildar un día como
 * "entrené" desde el calendario, sin pasar por todo el flujo de entreno.
 * Se combina con los completados reales (completed_sessions) para el calendario.
 */
import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

const keyFor = (studentId: string) => `elevate_done_${studentId}`;

export function useManualCompletions() {
  const { student, isAdminMode } = useAuthContext();
  const studentId = student?.id || (isAdminMode ? "admin" : "anon");
  const storageKey = keyFor(studentId);

  const [dates, setDates] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(dates));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [storageKey, dates]);

  const isDone = useCallback((date: string) => dates.includes(date), [dates]);

  const toggle = useCallback((date: string) => {
    setDates((prev) => (prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]));
  }, []);

  return { manualDates: dates, isDone, toggle };
}
