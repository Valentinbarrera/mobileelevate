/**
 * Registro corporal del alumno. Permite que el propio alumno cargue su peso
 * (1 por día) sin depender del coach ni de la base. Se puede mergear con los
 * datos de antropometría del coach para los gráficos.
 *
 * localStorage es la fuente de verdad para la UI (escritura inmediata) y se
 * respalda best-effort en Supabase: al montar se hidrata con lo que falte de la
 * nube, y cada peso cargado se sube. Sin tabla/red, sigue andando 100% local.
 */
import { useState, useCallback, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { getLocalDateString } from "@/lib/date";
import { pushBodyWeight, fetchBodyLog } from "@/lib/athleteSyncApi";

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

  // Hidratación: trae de la nube los días que no estén en este dispositivo.
  // Gana el valor local (es el que el alumno cargó acá).
  useEffect(() => {
    let cancelled = false;
    fetchBodyLog(studentId).then((remote) => {
      if (cancelled || !remote.length) return;
      setEntries((prev) => {
        const localDates = new Set(prev.map((e) => e.date));
        const missing = remote.filter((e) => !localDates.has(e.date));
        if (!missing.length) return prev;
        return [...prev, ...missing].sort((a, b) => (a.date < b.date ? -1 : 1));
      });
    });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const logWeight = useCallback(
    (value: number) => {
      const date = getLocalDateString();
      setEntries((prev) => {
        const others = prev.filter((e) => e.date !== date);
        return [...others, { date, value }].sort((a, b) => (a.date < b.date ? -1 : 1));
      });
      void pushBodyWeight(studentId, date, value); // best-effort
    },
    [studentId]
  );

  const latest = entries.length ? entries[entries.length - 1] : null;

  return { entries, latest, logWeight };
}
