/**
 * Readiness pre-sesión ("¿Cómo te sientes hoy?"). El alumno responde 5 preguntas
 * (sueño, energía, recuperación, estrés, motivación) ANTES de entrenar. Es OMITIBLE.
 * Guardado LOCAL por alumno+fecha; alimenta la "energía diaria" en Progreso.
 * Cálculo determinista (promedio → 0-100), sin IA. Sync al coach = futuro (requiere tabla).
 */
export interface ReadinessData {
  sleep: number; // 1-5 (5 = dormí excelente)
  energy: number; // 1-5 (5 = a full)
  recovery: number; // 1-5 (5 = totalmente recuperado)
  stress: number; // 1-5 (5 = cero estrés) — más alto es mejor
  motivation: number; // 1-5 (5 = súper motivado)
}

export interface ReadinessEntry extends ReadinessData {
  date: string; // YYYY-MM-DD
  vitality: number; // 0-100 (promedio normalizado)
}

const keyFor = (studentId: string) => `elevate_readiness_${studentId}`;

function read(studentId: string): ReadinessEntry[] {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    return raw ? (JSON.parse(raw) as ReadinessEntry[]) : [];
  } catch {
    return [];
  }
}

/** Vitalidad 0-100 = promedio de las 5 respuestas normalizado (1→0%, 5→100%). */
export function computeVitality(d: ReadinessData): number {
  const avg = (d.sleep + d.energy + d.recovery + d.stress + d.motivation) / 5;
  return Math.round(((avg - 1) / 4) * 100);
}

export function saveReadiness(studentId: string, date: string, data: ReadinessData): ReadinessEntry {
  const entry: ReadinessEntry = { ...data, date, vitality: computeVitality(data) };
  try {
    const all = read(studentId).filter((e) => e.date !== date); // una por día
    all.push(entry);
    localStorage.setItem(keyFor(studentId), JSON.stringify(all.slice(-200)));
  } catch {
    /* almacenamiento no disponible */
  }
  return entry;
}

export function getReadinessForDate(studentId: string, date: string): ReadinessEntry | null {
  return read(studentId).find((e) => e.date === date) ?? null;
}

export function getLatestReadiness(studentId: string): ReadinessEntry | null {
  const all = read(studentId);
  if (!all.length) return null;
  return [...all].sort((a, b) => b.date.localeCompare(a.date))[0];
}
