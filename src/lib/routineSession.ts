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

// ─── Programa: semanas y progreso ───────────────────────────────────────────
// Las "semanas" NO existen en el schema: se derivan de planned_sessions.date
// relativo a assignment.start_date. Todas estas funciones son PURAS.

/** Días enteros entre dos fechas ISO (toISO − fromISO). */
function daysBetween(fromISO: string, toISO: string): number {
  const a = parseISO(fromISO);
  const b = parseISO(toISO);
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

/** Cantidad total de semanas del programa (duration_weeks o derivada de la agenda). */
export function getProgramWeekCount(assignment: AlumnoRoutineWithDetails): number {
  const declared = assignment.routine?.duration_weeks;
  if (declared && declared > 0) return declared;
  const start = assignment.start_date;
  if (start) {
    let maxWeek = 1;
    for (const ps of assignment.planned_sessions || []) {
      const w = Math.floor(daysBetween(start, ps.date) / 7) + 1;
      if (w > maxWeek) maxWeek = w;
    }
    return maxWeek;
  }
  return 1;
}

/** Índice (1-based) de la semana actual del programa según hoy. */
export function getCurrentWeekIndex(
  assignment: AlumnoRoutineWithDetails,
  todayISO: string
): number {
  const start = assignment.start_date;
  if (!start) return 1;
  const diff = daysBetween(start, todayISO);
  const total = getProgramWeekCount(assignment);
  if (diff < 0) return 1;
  const idx = Math.floor(diff / 7) + 1;
  return Math.min(Math.max(idx, 1), total);
}

export interface ProgramWeek {
  /** número de semana (1-based) */
  week: number;
  /** sesiones agendadas de esa semana, ordenadas por fecha */
  sessions: SessionInfo[];
}

/** Agrupa las sesiones agendadas por semana (relativa a start_date). */
export function groupSessionsByWeek(
  assignment: AlumnoRoutineWithDetails
): ProgramWeek[] {
  const start = assignment.start_date;
  const days = (assignment.routine?.routine_days || []) as AlumnoDay[];
  const byWeek = new Map<number, SessionInfo[]>();

  for (const ps of assignment.planned_sessions || []) {
    const day = days.find((d) => d.id === ps.routine_day_id);
    if (!day) continue;
    const week = start ? Math.floor(daysBetween(start, ps.date) / 7) + 1 : 1;
    const arr = byWeek.get(week) || [];
    arr.push({ assignment, day, date: ps.date });
    byWeek.set(week, arr);
  }

  return [...byWeek.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([week, sessions]) => ({
      week,
      sessions: sessions.sort((x, y) => (x.date! < y.date! ? -1 : 1)),
    }));
}

/** Progreso del programa: % de sesiones agendadas completadas. */
export function programProgress(
  assignment: AlumnoRoutineWithDetails,
  doneDates?: Set<string>,
  todayISO?: string
): { done: number; total: number; pct: number } {
  const sessions = assignment.planned_sessions || [];
  const total = sessions.length;
  if (total === 0) return { done: 0, total: 0, pct: 0 };

  let done = 0;
  for (const ps of sessions) {
    if (doneDates?.has(ps.date)) done++;
    // Sin set de completados: aproximamos por fechas pasadas con sesión.
    else if (!doneDates && todayISO && ps.date < todayISO) done++;
  }
  return { done, total, pct: Math.round((done / total) * 100) };
}
