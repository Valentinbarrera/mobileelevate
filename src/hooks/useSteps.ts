import { useCallback, useEffect, useState } from "react";
import {
  connectSteps,
  disconnectSteps,
  getRecentSteps,
  isStepsEnabled,
  isStepsSupported,
  type DaySteps,
} from "@/lib/healthSteps";

/** Pasos de la última semana desde Apple Salud; se refresca al volver a la app. */
export function useSteps() {
  const supported = isStepsSupported();
  const [enabled, setEnabled] = useState(isStepsEnabled);
  const [days, setDays] = useState<DaySteps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    if (!supported || !enabled) return;
    setLoading(true);
    try {
      setDays(await getRecentSteps(7));
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [supported, enabled]);

  useEffect(() => {
    refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  const connect = useCallback(async () => {
    setLoading(true);
    try {
      const ok = await connectSteps();
      setError(!ok);
      setEnabled(ok);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectSteps();
    setEnabled(false);
    setDays([]);
  }, []);

  return { supported, enabled, days, loading, error, connect, disconnect };
}
