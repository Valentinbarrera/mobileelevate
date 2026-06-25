/**
 * routineSession — utilidades para transformar las rutinas asignadas en
 * "la sesión de hoy", la semana y métricas que le importan al alumno.
 *
 * Toda la lógica de fechas/derivados vive acá para que los componentes
 * de UI queden tontos y fáciles de testear.
 */
import type { AlumnoRoutineWithDetails } from "@/types/coach";

export type AlumnoDay =
  AlumnoRoutineWithDetails["routine"]["routine_days"][number];

export interface SessionInfo {
  assignment: AlumnoRoutineWithDetails;
  day: AlumnoDay;
  /** fecha planificada (YYYY-MM-DD) o null si es un fallback sin agenda */
  date: string | null;
}

// ─── Fechas (local, sin desfasajes de timezone) ─────────────────────────────

export function localISODate(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// ─── Selección de la sesión ─────────────────────────────────────────────────

/** Sesión planificada para una fecha puntual (ej. hoy). */
export function findSessionByDate(
  assignments: AlumnoRoutineWithDetails[],
  dateISO: string
): SessionInfo | null {
  for (const a of assignments) {
    const ps = (a.planned_sessions || []).find((p) => p.date === dateISO);
    if (ps) {
      const days = (a.routine?.routine_days || []) as AlumnoDay[];
      const day = days.find((d) => d.id === ps.routine_day_id);
      if (day) return { assignment: a, day, date: dateISO };
    }
  }
  return null;
}

/** Próxima sesión planificada a futuro (la más cercana). */
export function findNextSession(
  assignments: AlumnoRoutineWithDetails[],
  fromISO: string
): SessionInfo | null {
  const candidates: SessionInfo[] = [];
  for (const a of assignments) {
    const days = (a.routine?.routine_days || []) as AlumnoDay[];
    for (const ps of a.planned_sessions || []) {
      if (ps.date > fromISO) {
        const day = days.find((d) => d.id === ps.routine_day_id);
        if (day) candidates.push({ assignment: a, day, date: ps.date });
      }
    }
  }
  candidates.sort((x, y) => (x.date! < y.date! ? -1 : 1));
  return candidates[0] ?? null;
}

/** Fallback cuando el coach no agendó fechas: primer día de la 1ra rutina activa. */
export function firstDaySession(
  assignments: AlumnoRoutineWithDetails[]
): SessionInfo | null {
  for (const a of assignments) {
    const day = (a.routine?.routine_days || [])[0] as AlumnoDay | undefined;
    if (day) return { assignment: a, day, date: null };
  }
  return null;
}

export function hasAnyPlannedSession(
  assignments: AlumnoRoutineWithDetails[]
): boolean {
  return assignments.some((a) => (a.planned_sessions || []).length > 0);
}

// ─── Métricas de una sesión ─────────────────────────────────────────────────

/** Duración estimada en minutos: Σ series × (descanso + ~40s de trabajo). */
export function estimateSessionMinutes(day: AlumnoDay): number {
  const exercises = day.routine_exercises || [];
  let seconds = 0;
  for (const ex of exercises) {
    const sets = ex.series || 1;
    const rest = ex.rest ?? 90;
    seconds += sets * (rest + 40);
  }
  const minutes = seconds / 60;
  return Math.max(5, Math.round(minutes / 5) * 5);
}

/** Top grupos musculares del día (únicos, en orden de aparición). */
export function getMuscleTags(day: AlumnoDay, max = 3): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const ex of day.routine_exercises || []) {
    const m = ex.exercise?.muscle || ex.exercise?.muscle_group;
    if (m && !seen.has(m.toLowerCase())) {
      seen.add(m.toLowerCase());
      tags.push(m);
      if (tags.length >= max) break;
    }
  }
  return tags;
}

export function exerciseCount(day: AlumnoDay): number {
  return (day.routine_exercises || []).length;
}

export function totalSets(day: AlumnoDay): number {
  return (day.routine_exercises || []).reduce((acc, ex) => acc + (ex.series || 0), 0);
}

export function dayTitle(day: AlumnoDay): string {
  return day.day_name || day.name || `Día ${day.order_index ?? day.day_number ?? 1}`;
}

// ─── Semana ─────────────────────────────────────────────────────────────────

export type WeekDayStatus = "today" | "past" | "upcoming" | "rest";

export interface WeekDay {
  date: string;
  label: string; // L M M J V S D
  dayNum: number;
  status: WeekDayStatus;
  hasSession: boolean;
}

/** Semana actual (lunes a domingo) con el estado de cada día. */
export function getWeekDays(
  assignments: AlumnoRoutineWithDetails[],
  todayISO: string
): WeekDay[] {
  const today = parseISO(todayISO);
  const mondayOffset = (today.getDay() + 6) % 7; // 0 = lunes
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);

  const labels = ["L", "M", "M", "J", "V", "S", "D"];
  const week: WeekDay[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = localISODate(d);
    const hasSession = assignments.some((a) =>
      (a.planned_sessions || []).some((p) => p.date === iso)
    );

    let status: WeekDayStatus;
    if (iso === todayISO) status = "today";
    else if (!hasSession) status = "rest";
    else if (iso < todayISO) status = "past";
    else status = "upcoming";

    week.push({ date: iso, label: labels[i], dayNum: d.getDate(), status, hasSession });
  }
  return week;
}

/** Próximas sesiones agendadas (para la lista "Esta semana"). */
export function getUpcomingSessions(
  assignments: AlumnoRoutineWithDetails[],
  fromISO: string,
  max = 4
): SessionInfo[] {
  const out: SessionInfo[] = [];
  for (const a of assignments) {
    const days = (a.routine?.routine_days || []) as AlumnoDay[];
    for (const ps of a.planned_sessions || []) {
      if (ps.date > fromISO) {
        const day = days.find((d) => d.id === ps.routine_day_id);
        if (day) out.push({ assignment: a, day, date: ps.date });
      }
    }
  }
  out.sort((x, y) => (x.date! < y.date! ? -1 : 1));
  return out.slice(0, max);
}
