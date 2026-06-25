/**
 * Registro corporal LOCAL del alumno (localStorage). Permite que el propio
 * alumno cargue su peso (1 por día) sin depender del coach ni de la base.
 * Se puede mergear con los datos de antropometría del coach para los gráficos.
 */
import { useState, useCallback, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { getLocalDateString } from "@/lib/date";

export interface BodyEntry {
  date: string; // YYYY-MM-DD
  value: number; // kg
}

const keyFor = (studentId: string) => `elevate_bodylog_${studentId}`;

export function useLocalBodyLog() {
  const { student, isAdminMode } = useAuthContext();
  const studentId = student?.id || (isAdminMode ? "admin" : "anon");
  const key = keyFor(studentId);

  const [entries, setEntries] = useState<BodyEntry[]>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as BodyEntry[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(entries));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [key, entries]);

  const logWeight = useCallback((value: number) => {
    const date = getLocalDateString();
    setEntries((prev) => {
      const others = prev.filter((e) => e.date !== date);
      return [...others, { date, value }].sort((a, b) => (a.date < b.date ? -1 : 1));
    });
  }, []);

  const latest = entries.length ? entries[entries.length - 1] : null;

  return { entries, latest, logWeight };
}
