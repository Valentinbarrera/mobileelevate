/**
 * Check-ins post-entreno (LOCAL). El alumno registra cómo le fue (esfuerzo/RPE,
 * energía, sueño + nota). Son datos de recuperación que el coach usa para
 * ajustar el plan. Guardado local; se sincroniza a la base más adelante.
 */
export interface CheckInData {
  rpe: number; // 1-10 esfuerzo percibido
  energy: number; // 1-5
  sleep: number; // 1-5
  note: string;
}

export interface CheckIn extends CheckInData {
  date: string; // YYYY-MM-DD
  workoutName: string;
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
}

export function getCheckIns(studentId: string): CheckIn[] {
  return read(studentId);
}

export function getLatestCheckIn(studentId: string): CheckIn | null {
  const all = read(studentId);
  return all.length ? all[all.length - 1] : null;
}
