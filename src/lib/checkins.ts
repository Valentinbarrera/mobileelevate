/**
 * Check-ins post-entreno. El alumno registra cómo le fue (esfuerzo/RPE, cómo
 * terminó y cómo se sintieron las cargas + nota). Son datos que el coach usa
 * para ajustar el plan. Guardado LOCAL + dual-write best-effort a Supabase
 * (tabla daily_tracking) — requiere correr scripts/setup-daily-tracking.sql.
 */
import { upsertCheckInRemote } from "./dailyTrackingApi";

export interface CheckInData {
  rpe: number; // 1-10 esfuerzo percibido
  energy: number; // 1-5 cómo terminó
  /**
   * 1-5, cómo se sintieron los pesos (1 muy livianos … 5 no pude).
   * Reemplazó a "¿cómo dormiste?": el sueño ya se pregunta ANTES de entrenar en
   * el readiness, que es cuando sirve, y acá no decía nada del entreno.
   */
  load: number;
  note: string;
}

export interface CheckIn extends CheckInData {
  date: string; // YYYY-MM-DD
  workoutName: string;
  /** Check-ins viejos, de cuando se preguntaba el sueño acá. Sólo de lectura. */
  sleep?: number;
}

const keyFor = (studentId: string) => `elevate_checkins_${studentId}`;

function read(studentId: string): CheckIn[] {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    return raw ? (JSON.parse(raw) as CheckIn[]) : [];
  } catch {
    return [];
  }
}

export function saveCheckIn(studentId: string, entry: CheckIn) {
  try {
    const all = read(studentId);
    all.push(entry);
    localStorage.setItem(keyFor(studentId), JSON.stringify(all.slice(-200)));
  } catch {
    /* almacenamiento no disponible */
  }
  // Remoto best-effort (solo alumno real; la API ignora "admin"/"anon" y falla suave)
  upsertCheckInRemote(studentId, {
    date: entry.date,
    rpe: entry.rpe,
    energy: entry.energy,
    load: entry.load,
    note: entry.note,
    workoutName: entry.workoutName,
  });
}

export function getCheckIns(studentId: string): CheckIn[] {
  return read(studentId);
}

export function getLatestCheckIn(studentId: string): CheckIn | null {
  const all = read(studentId);
  return all.length ? all[all.length - 1] : null;
}
