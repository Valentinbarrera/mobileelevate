/**
 * Pasos desde Apple Salud (HealthKit), vía @capgo/capacitor-health.
 * Sólo iOS nativo: en web/Android `isStepsSupported()` da false y la card no se muestra.
 * iOS no dice si el permiso de lectura se rechazó (privacidad): sólo devuelve 0 pasos.
 */
import { Capacitor } from "@capacitor/core";
import { Health } from "@capgo/capacitor-health";
import { getLocalDateString } from "@/lib/date";

const ENABLED_KEY = "elevate_steps_enabled";

export const STEPS_GOAL = 8000;

export interface DaySteps {
  /** YYYY-MM-DD local */
  date: string;
  steps: number;
}

export const isStepsSupported = (): boolean => Capacitor.getPlatform() === "ios";

export const isStepsEnabled = (): boolean => {
  try {
    return localStorage.getItem(ENABLED_KEY) === "1";
  } catch {
    return false;
  }
};

const setStepsEnabled = (on: boolean) => {
  try {
    if (on) localStorage.setItem(ENABLED_KEY, "1");
    else localStorage.removeItem(ENABLED_KEY);
  } catch {
    /* almacenamiento no disponible */
  }
};

/** Pide permiso de lectura de pasos. Devuelve false si Salud no está disponible. */
export async function connectSteps(): Promise<boolean> {
  if (!isStepsSupported()) return false;
  const { available } = await Health.isAvailable();
  if (!available) return false;
  await Health.requestAuthorization({ read: ["steps"], write: [] });
  setStepsEnabled(true);
  return true;
}

export const disconnectSteps = () => setStepsEnabled(false);

/** Pasos por día de los últimos `days` días (el último es hoy), rellenando con 0. */
export async function getRecentSteps(days = 7): Promise<DaySteps[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const { samples } = await Health.queryAggregated({
    dataType: "steps",
    startDate: start.toISOString(),
    endDate: new Date().toISOString(),
    bucket: "day",
    aggregation: "sum",
  });

  const byDate = new Map<string, number>();
  for (const s of samples) {
    const key = getLocalDateString(new Date(s.startDate));
    byDate.set(key, (byDate.get(key) ?? 0) + Math.round(s.value));
  }

  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const date = getLocalDateString(d);
    return { date, steps: byDate.get(date) ?? 0 };
  });
}
